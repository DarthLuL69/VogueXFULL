import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Offer } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private readonly apiUrl = `${environment.apiUrl}/offers`;
  
  constructor(private readonly http: HttpClient) { }

  /**
   * Get offers for a specific chat
   * @param chatId Chat ID
   */
  getOffers(chatId: number): Observable<{ success: boolean, data: Offer[] }> {
    return this.http.get<{ success: boolean, data: Offer[] }>(
      `${environment.apiUrl}/chats/${chatId}/offers`
    );
  }

  /**
   * Get a specific offer
   * @param id Offer ID
   */
  getOffer(id: number): Observable<{ success: boolean, data: Offer }> {
    return this.http.get<{ success: boolean, data: Offer }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new offer
   * @param chatId Chat ID
   * @param amount Offer amount
   */
  createOffer(chatId: number, amount: number): Observable<{ success: boolean, message: string, data: Offer }> {
    return this.http.post<{ success: boolean, message: string, data: Offer }>(
      this.apiUrl,
      { chat_id: chatId, amount }
    );
  }

  /**
   * Update an offer status (accept or reject)
   * @param id Offer ID
   * @param status New status ('accepted' or 'rejected')
   */
  updateOfferStatus(id: number, status: 'accepted' | 'rejected'): Observable<{
    success: boolean,
    message: string,
    data: Offer,
    payment_required: boolean
  }> {
    return this.http.patch<{
      success: boolean,
      message: string,
      data: Offer,
      payment_required: boolean
    }>(
      `${this.apiUrl}/${id}`,
      { status }
    );
  }
}
