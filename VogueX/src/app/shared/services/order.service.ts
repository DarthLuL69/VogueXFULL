import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderStatusUpdate } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = environment.apiUrl;
  
  constructor(private readonly http: HttpClient) { }

  /**
   * Get user's orders (both as buyer and seller)
   */
  getOrders(): Observable<{ 
    success: boolean, 
    data: Order[]
  }> {
    return this.http.get<{ 
      success: boolean, 
      data: Order[]
    }>(`${this.apiUrl}/orders`);
  }

  /**
   * Get specific order details
   */
  getOrder(id: number): Observable<{ success: boolean, data: Order }> {
    return this.http.get<{ success: boolean, data: Order }>(`${this.apiUrl}/orders/${id}`);
  }

  /**
   * Update order status (for sellers)
   */
  updateOrderStatus(update: OrderStatusUpdate): Observable<{ 
    success: boolean, 
    message: string, 
    data: Order 
  }> {
    return this.http.patch<{ 
      success: boolean, 
      message: string, 
      data: Order 
    }>(`${this.apiUrl}/orders/${update.order_id}/status`, {
      status: update.status,
      tracking_number: update.tracking_number,
      notes: update.notes
    });
  }

  /**
   * Cancel order (for buyers)
   */
  cancelOrder(orderId: number, reason?: string): Observable<{ 
    success: boolean, 
    message: string, 
    data: Order 
  }> {
    return this.http.post<{ 
      success: boolean, 
      message: string, 
      data: Order 
    }>(`${this.apiUrl}/orders/${orderId}/cancel`, { reason });
  }

  /**
   * Create order from accepted offer (called by payment service)
   */
  createOrder(orderData: {
    offer_id: number,
    shipping_address: any,
    payment_method: string
  }): Observable<{ 
    success: boolean, 
    message: string, 
    data: Order 
  }> {
    return this.http.post<{ 
      success: boolean, 
      message: string, 
      data: Order 
    }>(`${this.apiUrl}/orders`, orderData);
  }
}
