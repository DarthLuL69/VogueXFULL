import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Payment } from '../models/chat.model';
import { PaymentRequest, PaymentProcessRequest, PaymentResponse, ShippingAddress } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiUrl = environment.apiUrl;
  private readonly supportedPaymentMethods = environment.supportedPaymentMethods;
  
  constructor(private readonly http: HttpClient) { }
  /**
   * Process payment for an accepted offer
   */
  processPayment(paymentRequest: PaymentRequest | PaymentProcessRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/payments/process`, paymentRequest);
  }

  /**
   * Get user's saved shipping addresses
   */
  getShippingAddresses(): Observable<{ success: boolean, data: ShippingAddress[] }> {
    return this.http.get<{ success: boolean, data: ShippingAddress[] }>(`${this.apiUrl}/payments/shipping-addresses`);
  }

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods(): string[] {
    return this.supportedPaymentMethods;
  }

  /**
   * Check if Apple Pay is available
   */
  isApplePayAvailable(): boolean {
    // Check if running on macOS/iOS and Apple Pay is supported
    if (typeof window !== 'undefined' && 'ApplePaySession' in window) {
      return true;
    }
    return false;
  }

  /**
   * Validate payment method availability
   */
  isPaymentMethodSupported(method: string): boolean {
    return this.supportedPaymentMethods.includes(method);
  }  /**
   * Initialize a payment after an offer is accepted
   */
  initializePayment(
    offerId: number,
    paymentMethod: 'visa' | 'debit' | 'apple_pay' | 'paypal'
  ): Observable<{ 
    success: boolean,
    message: string,
    data: { payment: Payment }
  }> {
    return this.http.post<{ 
      success: boolean,
      message: string,
      data: { payment: Payment }
    }>(`${this.apiUrl}/payments/initialize`, { 
      offer_id: offerId, 
      payment_method: paymentMethod 
    });
  }
}
