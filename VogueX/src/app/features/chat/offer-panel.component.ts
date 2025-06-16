import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OfferService } from '../../shared/services/offer.service';
import { PaymentService } from '../../shared/services/payment.service';
import { Chat, Offer } from '../../shared/models/chat.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-offer-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="offer-panel">
      <div class="tabs">
        <button 
          [class.active]="activeTab === 'make'" 
          (click)="activeTab = 'make'"
          *ngIf="isBuyer">Make Offer</button>
        <button 
          [class.active]="activeTab === 'list'" 
          (click)="activeTab = 'list'">View Offers</button>
      </div>
      
      <!-- Make Offer Tab -->
      <div *ngIf="activeTab === 'make' && isBuyer" class="tab-content">
        <h3>Make an Offer</h3>
        <div class="product-info">
          <p><strong>{{ chat?.product?.name }}</strong></p>
          <p>Listed Price: {{ chat?.product?.price | currency }}</p>
        </div>
        
        <div class="offer-form">
          <div class="input-group">
            <label for="offerAmount">Your Offer Amount:</label>
            <input 
              type="number" 
              id="offerAmount" 
              [(ngModel)]="offerAmount" 
              [min]="1" 
              [max]="chat?.product?.price || 0"
              placeholder="Enter amount">
          </div>
          
          <div class="actions">
            <button 
              class="primary" 
              [disabled]="!isValidOffer()"
              (click)="makeOffer()">
              Send Offer
            </button>
          </div>
        </div>
      </div>
      
      <!-- View Offers Tab -->
      <div *ngIf="activeTab === 'list'" class="tab-content">
        <h3>Offers</h3>
        
        <div *ngIf="offers.length === 0" class="no-offers">
          No offers have been made yet.
        </div>
        
        <div *ngIf="offers.length > 0" class="offers-list">
          <div *ngFor="let offer of offers" class="offer-item" [class]="offer.status">
            <div class="offer-header">
              <span class="offer-label">Offer</span>
              <span class="offer-status">{{ offer.status | titlecase }}</span>
            </div>
            
            <div class="offer-amount">
              {{ offer.amount | currency }}
            </div>
              <div class="offer-info">
              <span>from {{ offer.buyer?.name || 'User' }}</span>
              <span>{{ offer.created_at | date:'short' }}</span>
            </div>            <!-- Actions for pending offers - ONLY for sellers -->
            <div class="offer-actions" *ngIf="offer.status === 'pending' && isOfferReceiver(offer)">
              <div class="debug-info" style="font-size: 12px; color: #666; margin-bottom: 8px;">
                Debug: User ID: {{userId}}, Seller ID: {{offer.seller_id}}, Buyer ID: {{offer.buyer_id}}
              </div>
              <button class="accept" (click)="respondToOffer(offer.id, 'accepted')">Aceptar oferta</button>
              <button class="reject" (click)="respondToOffer(offer.id, 'rejected')">Rechazar oferta</button>
            </div>
            
            <!-- Status for pending offers - for buyers -->
            <div class="offer-actions" *ngIf="offer.status === 'pending' && offer.buyer_id === userId">
              <div class="status-info">
                <p class="status-text">⏳ Oferta enviada - Esperando respuesta del vendedor</p>
              </div>
            </div>
            
            <!-- Payment button for accepted offers - for buyers -->
            <div class="offer-actions payment-section" *ngIf="offer.status === 'accepted' && offer.buyer_id === userId">
              <div class="payment-info">
                <p class="payment-text">¡Oferta aceptada! Procede al pago</p>
                <p class="amount">{{ offer.amount | currency:'EUR':'symbol':'1.2-2' }}</p>
              </div>
              <button class="payment-btn" (click)="proceedToPayment(offer)">
                <i class="fas fa-credit-card"></i>
                Proceder al pago
              </button>
            </div>
            
            <!-- Status for accepted offers - for sellers -->
            <div class="offer-actions" *ngIf="offer.status === 'accepted' && offer.seller_id === userId">
              <div class="status-info">
                <p class="status-text">✅ Oferta aceptada - Esperando pago del comprador</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Payment Modal -->
    <div class="modal" *ngIf="showPaymentModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Complete Payment</h2>
          <button class="close" (click)="showPaymentModal = false">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="payment-details">
            <p><strong>Item:</strong> {{ selectedOffer?.product?.name }}</p>
            <p><strong>Amount:</strong> {{ selectedOffer?.amount | currency }}</p>
          </div>
          
          <div class="payment-method">
            <h3>Select Payment Method</h3>
            <div class="payment-methods">
              <div 
                *ngFor="let method of paymentMethods" 
                class="payment-method-option" 
                [class.selected]="selectedPaymentMethod === method"
                (click)="selectedPaymentMethod = method">
                <div class="payment-icon">
                  <i class="fa" [ngClass]="getPaymentIcon(method)"></i>
                </div>
                <div class="payment-method-name">
                  {{ method | titlecase }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            class="primary" 
            [disabled]="!selectedPaymentMethod" 
            (click)="processPayment()">
            Pay Now
          </button>
          <button class="cancel" (click)="showPaymentModal = false">Cancel</button>
        </div>
      </div>
    </div>
    
    <!-- Payment Success Modal -->
    <div class="modal" *ngIf="showPaymentSuccessModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Payment Successful</h2>
        </div>
        
        <div class="modal-body">
          <div class="success-message">
            <i class="fa fa-check-circle"></i>
            <p>Your payment has been processed successfully!</p>
            <p>Transaction ID: {{ paymentResult?.transaction_id || 'N/A' }}</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="primary" (click)="closePaymentSuccess()">Done</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .offer-panel {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }
    
    .tabs {
      display: flex;
      border-bottom: 1px solid #eee;
    }
    
    .tabs button {
      flex: 1;
      padding: 15px;
      background: none;
      border: none;
      cursor: pointer;
      font-weight: 600;
      color: #888;
      transition: all 0.2s;
    }
    
    .tabs button.active {
      color: #0084ff;
      border-bottom: 2px solid #0084ff;
    }
    
    .tab-content {
      padding: 20px;
    }
    
    h3 {
      margin-top: 0;
      margin-bottom: 20px;
    }
    
    .product-info {
      margin-bottom: 20px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 5px;
    }
    
    .offer-form {
      margin-bottom: 15px;
    }
    
    .input-group {
      margin-bottom: 15px;
    }
    
    .input-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }
    
    .input-group input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 16px;
    }
    
    .actions {
      display: flex;
      justify-content: flex-end;
    }
    
    button {
      padding: 10px 15px;
      border-radius: 5px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }
    
    button.primary {
      background: #0084ff;
      color: white;
    }
    
    button.primary:disabled {
      background: #cccccc;
      cursor: not-allowed;
    }
    
    button.cancel {
      background: #f5f5f5;
      color: #333;
      margin-right: 10px;
    }
    
    .offers-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .offer-item {
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .offer-item.pending {
      border-left: 4px solid #ffd700;
    }
    
    .offer-item.accepted {
      border-left: 4px solid #4caf50;
    }
    
    .offer-item.rejected {
      border-left: 4px solid #ff4747;
      opacity: 0.7;
    }
    
    .offer-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    
    .offer-label {
      font-weight: 500;
      color: #888;
    }
    
    .offer-status {
      font-weight: 600;
    }
    
    .offer-status.pending {
      color: #ffc107;
    }
    
    .offer-status.accepted {
      color: #4caf50;
    }
    
    .offer-status.rejected {
      color: #f44336;
    }
    
    .offer-amount {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    
    .offer-info {
      display: flex;
      justify-content: space-between;
      color: #888;
      font-size: 14px;
      margin-bottom: 15px;
    }
    
    .offer-actions {
      display: flex;
      gap: 10px;
    }
    
    button.accept {
      background: #4caf50;
      color: white;
    }
    
    button.reject {
      background: #f44336;
      color: white;
    }
    
    button.payment {
      background: #ff9800;
      color: white;
    }
    
    /* New payment section styles */
    .payment-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 16px;
      margin-top: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    
    .payment-info {
      margin-bottom: 12px;
    }
    
    .payment-text {
      color: white;
      font-weight: 600;
      margin: 0 0 4px 0;
      font-size: 14px;
    }
    
    .amount {
      color: #ffd700;
      font-weight: bold;
      font-size: 18px;
      margin: 0;
    }
    
    .payment-btn {
      background: #ffd700;
      color: #333;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      width: 100%;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
    }
    
    .payment-btn:hover {
      background: #ffed4e;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
    }
    
    .payment-btn i {
      font-size: 16px;
    }
    
    .status-info {
      background: #e8f5e8;
      border: 1px solid #4caf50;
      border-radius: 8px;
      padding: 12px;
      margin-top: 12px;
    }
    
    .status-text {
      color: #2e7d32;
      font-weight: 500;
      margin: 0;
      font-size: 14px;
    }
    
    .no-offers {
      text-align: center;
      padding: 20px;
      color: #888;
    }
    
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .modal-content {
      background: white;
      width: 90%;
      max-width: 500px;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
    }
    
    .modal-header h2 {
      margin: 0;
    }
    
    .modal-header .close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
    }
    
    .modal-body {
      padding: 20px;
    }
    
    .modal-footer {
      padding: 15px 20px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
    }
    
    .payment-details {
      margin-bottom: 20px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 5px;
    }
    
    .payment-methods {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 15px;
    }
    
    .payment-method-option {
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
      cursor: pointer;
      text-align: center;
      width: calc(50% - 5px);
      transition: all 0.2s;
    }
    
    .payment-method-option:hover {
      border-color: #0084ff;
    }
    
    .payment-method-option.selected {
      border-color: #0084ff;
      background: #f0f8ff;
    }
    
    .payment-icon {
      margin-bottom: 10px;
      font-size: 20px;
    }
    
    .success-message {
      text-align: center;
      padding: 20px;
    }
    
    .success-message i {
      font-size: 48px;
      color: #4caf50;
      margin-bottom: 15px;
    }
  `]
})
export class OfferPanelComponent implements OnInit, OnDestroy {
  @Input() chat: Chat | null = null;
  @Input() userId: number = 0;
  
  activeTab = 'list';
  offerAmount: number = 0;
  offers: Offer[] = [];
  
  showPaymentModal = false;
  showPaymentSuccessModal = false;
  selectedOffer: Offer | null = null;
  selectedPaymentMethod: string | null = null;
  paymentMethods: string[] = [];
  paymentResult: any = null;
  
  private readonly destroy$ = new Subject<void>();
    constructor(
    private readonly offerService: OfferService,
    private readonly paymentService: PaymentService,
    private readonly router: Router
  ) {
    this.paymentMethods = this.paymentService.getSupportedPaymentMethods();
  }
  
  ngOnInit(): void {
    this.loadOffers();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  get isBuyer(): boolean {
    return !!this.chat && this.userId === this.chat.buyer_id;
  }
    loadOffers(): void {
    if (!this.chat) return;
    
    console.log('🔍 Loading offers for chat:', this.chat.id);
    console.log('🔍 Current user ID:', this.userId);
    
    this.offerService.getOffers(this.chat.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.offers = response.data;
            console.log('🔍 Loaded offers:', this.offers);
            
            // Debug each offer
            this.offers.forEach((offer, index) => {
              console.log(`🔍 Offer ${index + 1}:`, {
                id: offer.id,
                buyer_id: offer.buyer_id,
                seller_id: offer.seller_id,
                status: offer.status,
                amount: offer.amount,
                currentUserId: this.userId,
                isBuyer: offer.buyer_id === this.userId,
                isSeller: offer.seller_id === this.userId
              });
            });
          }
        },
        error: (error) => {
          console.error('Error loading offers:', error);
        }
      });
  }
  
  isValidOffer(): boolean {
    if (!this.chat?.product) return false;
    
    return this.offerAmount > 0 && this.offerAmount <= (this.chat.product.price * 1.1);
  }
  
  makeOffer(): void {
    if (!this.chat || !this.isValidOffer()) return;
    
    this.offerService.createOffer(this.chat.id, this.offerAmount)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.offerAmount = 0;
            this.loadOffers();
            this.activeTab = 'list';
          }
        },
        error: (error) => {
          console.error('Error creating offer:', error);
          // Show error message
        }
      });
  }
    isOfferReceiver(offer: Offer): boolean {
    // Fix the syntax error - make sure brackets and parentheses match correctly
    return offer.seller_id === this.userId;
  }
  
  respondToOffer(offerId: number, status: 'accepted' | 'rejected'): void {
    this.offerService.updateOfferStatus(offerId, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadOffers();
            
            if (status === 'accepted') {
              // Show success message or notification
              console.log('Offer accepted successfully');
            }
          }
        },
        error: (error) => {
          console.error('Error updating offer:', error);
          // Show error message
        }
      });
  }
  openPaymentModal(offer: Offer): void {
    // Navigate to payment component
    this.router.navigate(['/payment', offer.id]);
  }
  
  proceedToPayment(offer: Offer): void {
    console.log('Proceeding to payment for offer:', offer);
    console.log('User ID:', this.userId);
    console.log('Buyer ID:', offer.buyer_id);
    console.log('Offer status:', offer.status);
    
    // Navigate directly to payment page
    this.router.navigate(['/payment', offer.id]);
  }
  
  processPayment(): void {
    if (!this.selectedOffer || !this.selectedPaymentMethod) return;
    
    this.paymentService.initializePayment(
      this.selectedOffer.id, 
      this.selectedPaymentMethod as any
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // For demo purposes, we'll simulate payment processing
            this.paymentResult = response.data.payment;
            this.showPaymentModal = false;
            this.showPaymentSuccessModal = true;
            this.loadOffers();
          }
        },
        error: (error) => {
          console.error('Error initializing payment:', error);
          // Show error message
        }
      });
  }
  
  closePaymentSuccess(): void {
    this.showPaymentSuccessModal = false;
    this.selectedOffer = null;
    this.selectedPaymentMethod = null;
    this.paymentResult = null;
  }
  
  getPaymentIcon(method: string): string {
    switch (method) {
      case 'visa':
        return 'fa-cc-visa';
      case 'debit':
        return 'fa-credit-card';
      case 'apple_pay':
        return 'fa-apple';
      case 'paypal':
        return 'fa-paypal';
      default:
        return 'fa-money-bill';
    }
  }
}
