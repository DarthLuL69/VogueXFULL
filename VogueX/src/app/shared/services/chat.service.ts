import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Chat } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly apiUrl = `${environment.apiUrl}/chats`;

  constructor(private readonly http: HttpClient) { }

  getChats(): Observable<{ success: boolean, data: Chat[] }> {
    return this.http.get<{ success: boolean, data: Chat[] }>(this.apiUrl);
  }

  getChat(id: number): Observable<{ success: boolean, data: Chat }> {
    return this.http.get<{ success: boolean, data: Chat }>(`${this.apiUrl}/${id}`);
  }

  createChat(productId: number, sellerId: number): Observable<{ success: boolean, message: string, data: Chat }> {
    return this.http.post<{ success: boolean, message: string, data: Chat }>(
      this.apiUrl,
      { product_id: productId, seller_id: sellerId }
    );
  }

  markAsRead(id: number): Observable<{ success: boolean, message: string, data: Chat }> {
    return this.http.patch<{ success: boolean, message: string, data: Chat }>(
      `${this.apiUrl}/${id}/read`, {}
    );
  }

  getUnreadCount(): Observable<{ success: boolean, data: { total_unread: number, buyer_unread: number, seller_unread: number } }> {
    return this.http.get<{ success: boolean, data: { total_unread: number, buyer_unread: number, seller_unread: number } }>(
      `${this.apiUrl}/unread/count`
    );
  }
}
