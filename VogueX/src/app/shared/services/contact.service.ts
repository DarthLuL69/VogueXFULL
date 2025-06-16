import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactMessage {
  id?: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read?: boolean;
  read_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContactResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface ContactStats {
  success: boolean;
  data: {
    total: number;
    unread: number;
    today: number;
    this_week: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly apiUrl = 'http://localhost:8000/api';

  constructor(private readonly http: HttpClient) {}

  sendMessage(contactData: Omit<ContactMessage, 'id' | 'is_read' | 'read_at' | 'created_at' | 'updated_at'>): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(`${this.apiUrl}/contact`, contactData);
  }

  getMessages(page: number = 1, status?: string): Observable<any> {
    let url = `${this.apiUrl}/admin/contact-messages?page=${page}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.http.get<any>(url);
  }

  getMessage(id: number): Observable<ContactResponse> {
    return this.http.get<ContactResponse>(`${this.apiUrl}/admin/contact-messages/${id}`);
  }

  markAsRead(id: number): Observable<ContactResponse> {
    return this.http.patch<ContactResponse>(`${this.apiUrl}/admin/contact-messages/${id}/read`, {});
  }

  markAsUnread(id: number): Observable<ContactResponse> {
    return this.http.patch<ContactResponse>(`${this.apiUrl}/admin/contact-messages/${id}/unread`, {});
  }

  deleteMessage(id: number): Observable<ContactResponse> {
    return this.http.delete<ContactResponse>(`${this.apiUrl}/admin/contact-messages/${id}`);
  }
  getStats(): Observable<ContactStats> {
    return this.http.get<ContactStats>(`${this.apiUrl}/admin/contact-messages/stats/overview`);
  }
}
