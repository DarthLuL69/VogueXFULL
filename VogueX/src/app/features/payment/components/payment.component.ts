import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../../shared/services/payment.service';
import { OfferService } from '../../../shared/services/offer.service';
import { PaymentProcessRequest, ShippingAddress } from '../../../shared/models/order.model';
import { Offer } from '../../../shared/models/chat.model';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: ``,
  templateUrl: './payment.component.html'
})
export class PaymentComponent implements OnInit {
  offer: Offer | null = null;
  currentStep = 1;
  totalSteps = 3;
  loading = false;
  error = '';
  success = '';

  // Forms
  shippingForm: FormGroup;
  paymentForm: FormGroup;

  // Data
  savedAddresses: ShippingAddress[] = [];
  supportedPaymentMethods: string[] = [];
  selectedPaymentMethod = '';
  isApplePayAvailable = false;

  // Additional properties needed by template
  isLoading = false;
  selectedAddressIndex = -1;
  showNewAddressForm = false;
  shippingCost = 5.99;
  isProcessing = false;
  showSuccessModal = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly paymentService: PaymentService,
    private readonly offerService: OfferService,
    private readonly fb: FormBuilder
  ) {
    this.shippingForm = this.createShippingForm();
    this.paymentForm = this.createPaymentForm();
  }

  ngOnInit(): void {
    const offerId = this.route.snapshot.params['offerId'];
    if (offerId) {
      this.loadOffer(offerId);
      this.loadSavedAddresses();
      this.loadPaymentMethods();
    } else {
      this.error = 'ID de oferta no válido';
    }
  }

  private createShippingForm(): FormGroup {
    return this.fb.group({
      full_name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-()]+$/)]],
      street_address: ['', [Validators.required, Validators.minLength(5)]],
      apartment: [''],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      postal_code: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      country: ['España', [Validators.required]],
      instructions: ['']
    });
  }

  private createPaymentForm(): FormGroup {
    return this.fb.group({
      paymentMethod: ['', Validators.required],
      cardNumber: [''],
      expiryDate: [''],
      cvv: [''],
      cardholderName: [''],
      fullName: ['', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['ES', Validators.required],
      phone: ['', Validators.required]
    });
  }

  loadOffer(offerId: number): void {
    this.loading = true;
    this.offerService.getOffer(offerId).subscribe({
      next: (response) => {
        if (response.success) {
          this.offer = response.data;
          if (this.offer.status !== 'accepted') {
            this.error = 'Esta oferta no ha sido aceptada o ya ha sido procesada';
            this.router.navigate(['/chats']);
          }
        } else {
          this.error = 'No se pudo cargar la oferta';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading offer:', error);
        this.error = 'Error al cargar la oferta';
        this.loading = false;
      }
    });
  }

  loadSavedAddresses(): void {
    this.paymentService.getShippingAddresses().subscribe({
      next: (response) => {
        if (response.success) {
          this.savedAddresses = response.data;
          // Pre-fill with default address if available
          const defaultAddress = this.savedAddresses.find(addr => addr.is_default);
          if (defaultAddress) {
            this.shippingForm.patchValue(defaultAddress);
          }
        }
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
      }
    });
  }

  loadPaymentMethods(): void {
    this.supportedPaymentMethods = this.paymentService.getSupportedPaymentMethods();
    this.isApplePayAvailable = this.paymentService.isApplePayAvailable();
  }

  useExistingAddress(address: ShippingAddress): void {
    this.shippingForm.patchValue(address);
  }

  nextStep(): void {
    if (this.currentStep === 1 && this.shippingForm.valid) {
      this.currentStep = 2;
    } else if (this.currentStep === 2 && this.paymentForm.valid) {
      this.currentStep = 3;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onPaymentMethodChange(method: string): void {
    this.selectedPaymentMethod = method;
    this.paymentForm.patchValue({ paymentMethod: method });

    // Reset form validations based on payment method
    this.updatePaymentFormValidators(method);
  }

  private updatePaymentFormValidators(method: string): void {
    const cardholderName = this.paymentForm.get('cardholderName');
    const cardNumber = this.paymentForm.get('cardNumber');
    const expiryDate = this.paymentForm.get('expiryDate');
    const cvv = this.paymentForm.get('cvv');
    const paypalEmail = this.paymentForm.get('paypal_email');

    // Clear all validators first
    [cardholderName, cardNumber, expiryDate, cvv, paypalEmail].forEach(control => {
      control?.clearValidators();
      control?.updateValueAndValidity();
    });

    if (method === 'visa' || method === 'debit') {
      cardholderName?.setValidators([Validators.required, Validators.minLength(2)]);
      cardNumber?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
      expiryDate?.setValidators([Validators.required, Validators.min(1), Validators.max(12)]);
      cvv?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
    } else if (method === 'paypal') {
      paypalEmail?.setValidators([Validators.required, Validators.email]);
    }

    // Update validity
    [cardholderName, cardNumber, expiryDate, cvv, paypalEmail].forEach(control => {
      control?.updateValueAndValidity();
    });
  }
  processPayment(): void {
    if (!this.offer || !this.paymentForm.valid) {
      this.error = 'Por favor, completa todos los campos requeridos';
      return;
    }

    this.isProcessing = true;
    this.error = '';

    const paymentMethod = this.paymentForm.get('paymentMethod')?.value;

    // First, initialize the payment
    this.paymentService.initializePayment(this.offer.id, paymentMethod).subscribe({
      next: (initResponse) => {        if (initResponse.success) {
          // Now process the payment with shipping address
          const paymentProcessRequest: PaymentProcessRequest = {
            payment_id: initResponse.data.payment.id,
            shipping_address: {
              full_name: this.paymentForm.get('fullName')?.value,
              street_address: this.paymentForm.get('addressLine1')?.value,
              apartment: this.paymentForm.get('addressLine2')?.value,
              city: this.paymentForm.get('city')?.value,
              state: this.paymentForm.get('city')?.value, // Using city as state for now
              postal_code: this.paymentForm.get('postalCode')?.value,
              country: this.paymentForm.get('country')?.value,
              phone: this.paymentForm.get('phone')?.value
            }
          };

          this.paymentService.processPayment(paymentProcessRequest).subscribe({
            next: (response) => {
              this.isProcessing = false;
              if (response.success) {
                this.showSuccessModal = true;
              } else {
                this.error = response.message || 'Error al procesar el pago';
              }
            },
            error: (error) => {
              console.error('Payment processing error:', error);
              this.error = error.error?.message ?? 'Error al procesar el pago';
              this.isProcessing = false;
            }
          });
        } else {
          this.error = initResponse.message || 'Error al inicializar el pago';
          this.isProcessing = false;
        }
      },
      error: (error) => {
        console.error('Payment initialization error:', error);
        this.error = error.error?.message ?? 'Error al inicializar el pago';
        this.isProcessing = false;
      }
    });
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  getPaymentMethodIcon(method: string): string {
    const icons: { [key: string]: string } = {
      visa: '💳',
      debit: '💳',
      apple_pay: '🍎',
      paypal: '💙'
    };
    return icons[method] || '💳';
  }

  getStepTitle(step: number): string {
    const titles = {
      1: 'Dirección de Envío',
      2: 'Método de Pago',
      3: 'Confirmación'
    };
    return titles[step as keyof typeof titles] || '';
  }

  // Template methods
  goBack(): void {
    this.router.navigate(['/chats']);
  }

  selectPaymentMethod(method: string): void {
    this.paymentForm.patchValue({ paymentMethod: method });
    this.selectedPaymentMethod = method;
  }

  getPaymentIcon(method: string): string {
    switch (method) {
      case 'visa':
      case 'debit':
        return '💳';
      case 'paypal':
        return '🅿️';
      case 'apple_pay':
        return '🍎';
      default:
        return '💳';
    }
  }

  getPaymentMethodName(method: string): string {
    switch (method) {
      case 'visa':
        return 'Tarjeta de crédito';
      case 'debit':
        return 'Tarjeta de débito';
      case 'paypal':
        return 'PayPal';
      case 'apple_pay':
        return 'Apple Pay';
      default:
        return method;
    }
  }

  isCardPayment(): boolean {
    const method = this.paymentForm.get('paymentMethod')?.value;
    return method === 'visa' || method === 'debit';
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s/g, '').replace(/\D/g, '');
    const matches = value.match(/\d{4,16}/g);
    const match = matches?.[0] ?? '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      event.target.value = parts.join(' ');
      this.paymentForm.patchValue({ cardNumber: parts.join(' ') });
    } else {
      event.target.value = '';
      this.paymentForm.patchValue({ cardNumber: '' });
    }
  }

  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    event.target.value = value;
    this.paymentForm.patchValue({ expiryDate: value });
  }
  selectSavedAddress(index: number): void {
    this.selectedAddressIndex = index;
    this.showNewAddressForm = false;
    
    // Populate form with selected address
    const address = this.savedAddresses[index];
    if (address) {
      this.paymentForm.patchValue({
        fullName: address.full_name,
        addressLine1: address.street_address,
        addressLine2: address.apartment ?? '',
        city: address.city,
        postalCode: address.postal_code,
        country: address.country,
        phone: address.phone ?? ''
      });
    }
  }

  toggleNewAddressForm(): void {
    this.showNewAddressForm = !this.showNewAddressForm;
    if (this.showNewAddressForm) {
      this.selectedAddressIndex = -1;
    }
  }  getTotal(): number {
    return (this.offer?.amount ?? 0) + this.shippingCost;
  }

  private parseExpiryMonth(expiryDate: string): number | undefined {
    if (!expiryDate) return undefined;
    const parts = expiryDate.split('/');
    return parts.length > 0 ? parseInt(parts[0], 10) : undefined;
  }

  private parseExpiryYear(expiryDate: string): number | undefined {
    if (!expiryDate) return undefined;
    const parts = expiryDate.split('/');
    if (parts.length > 1) {
      const year = parseInt(parts[1], 10);
      return year < 100 ? 2000 + year : year;
    }
    return undefined;
  }

  goToOrders(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/orders']);
  }

  goToHome(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/home']);
  }
}
