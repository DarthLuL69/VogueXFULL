import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Payment } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiUrl = `${environment.apiUrl}/payments`;
  private readonly supportedPaymentMethods = environment.supportedPaymentMethods;
  
  constructor(private readonly http: HttpClient) { }

  /**
   * Get payment details
   * @param id Payment ID
   */
  getPayment(id: number): Observable<{ success: boolean, data: Payment }> {
    return this.http.get<{ success: boolean, data: Payment }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get all payments for the authenticated user
   */
  getPayments(): Observable<{ success: boolean, data: { as_buyer: Payment[], as_seller: Payment[] } }> {
    return this.http.get<{ success: boolean, data: { as_buyer: Payment[], as_seller: Payment[] } }>(this.apiUrl);
  }

  /**
   * Initialize a payment after an offer is accepted
   * @param offerId Offer ID
   * @param paymentMethod Payment method ('visa', 'debit', 'apple_pay', 'paypal')
   */
  initializePayment(
    offerId: number,
    paymentMethod: 'visa' | 'debit' | 'apple_pay' | 'paypal'
  ): Observable<{ 
    success: boolean,
    message: string,
    data: {
      payment: Payment,
      payment_link: string
    } 
  }> {
    return this.http.post<{
      success: boolean,
      message: string,
      data: {
        payment: Payment,
        payment_link: string
      }
    }>(
      `${this.apiUrl}/initialize`,
      { offer_id: offerId, payment_method: paymentMethod }
    );
  }

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods(): string[] {
    return this.supportedPaymentMethods;
  }

  /**
   * Process payment (for demo purposes)
   * In a real app, this would be handled by a payment gateway
   * @param paymentId Payment ID
   */
  processPayment(paymentId: number): Observable<{ success: boolean, message: string, data: Payment }> {
    return this.http.get<{ success: boolean, message: string, data: Payment }>(
      `${environment.apiUrl}/payments/process/${paymentId}`
    );
  }
}
