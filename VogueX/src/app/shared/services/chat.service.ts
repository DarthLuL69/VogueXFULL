import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Chat } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chats`;

  constructor(private http: HttpClient) { }

  /**
   * Get all chats for the authenticated user
   */
  getChats(): Observable<{ success: boolean, data: Chat[] }> {
    return this.http.get<{ success: boolean, data: Chat[] }>(this.apiUrl);
  }

  /**
   * Get a specific chat with its messages
   * @param id Chat ID
   */
  getChat(id: number): Observable<{ success: boolean, data: Chat }> {
    return this.http.get<{ success: boolean, data: Chat }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new chat between buyer and seller for a product
   * @param productId Product ID
   * @param sellerId Seller ID
   */
  createChat(productId: number, sellerId: number): Observable<{ success: boolean, message: string, data: Chat }> {
    return this.http.post<{ success: boolean, message: string, data: Chat }>(
      this.apiUrl,
      { product_id: productId, seller_id: sellerId }
    );
  }

  /**
   * Mark a chat as read
   * @param id Chat ID
   */
  markAsRead(id: number): Observable<{ success: boolean, message: string, data: Chat }> {
    return this.http.patch<{ success: boolean, message: string, data: Chat }>(
      `${this.apiUrl}/${id}/read`, {}
    );
  }

  /**
   * Get unread chat count for the authenticated user
   */
  getUnreadCount(): Observable<{ success: boolean, data: { total_unread: number, buyer_unread: number, seller_unread: number } }> {
    return this.http.get<{ success: boolean, data: { total_unread: number, buyer_unread: number, seller_unread: number } }>(
      `${this.apiUrl}/unread/count`
    );
  }
}
