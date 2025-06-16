import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  message: string;
  data?: ContactMessage;
}

export interface ContactMessagesResponse {
  success: boolean;
  data: {
    data: ContactMessage[];
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
  unread_count: number;
}

export interface ContactStats {
  success: boolean;
  data: {
    total: number;
    unread: number;
    read: number;
    today: number;
    this_week: number;
    this_month: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Enviar mensaje de contacto (público)
  sendMessage(contactData: Omit<ContactMessage, 'id' | 'is_read' | 'read_at' | 'created_at' | 'updated_at'>): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(`${this.apiUrl}/contact`, contactData);
  }

  // Obtener todos los mensajes (admin)
  getMessages(page = 1, status?: 'read' | 'unread'): Observable<ContactMessagesResponse> {
    let params = `?page=${page}`;
    if (status) {
      params += `&status=${status}`;
    }
    return this.http.get<ContactMessagesResponse>(`${this.apiUrl}/admin/contact-messages${params}`);
  }

  // Obtener un mensaje específico (admin)
  getMessage(id: number): Observable<ContactResponse> {
    return this.http.get<ContactResponse>(`${this.apiUrl}/admin/contact-messages/${id}`);
  }

  // Marcar como leído (admin)
  markAsRead(id: number): Observable<ContactResponse> {
    return this.http.patch<ContactResponse>(`${this.apiUrl}/admin/contact-messages/${id}/read`, {});
  }

  // Marcar como no leído (admin)
  markAsUnread(id: number): Observable<ContactResponse> {
    return this.http.patch<ContactResponse>(`${this.apiUrl}/admin/contact-messages/${id}/unread`, {});
  }

  // Eliminar mensaje (admin)
  deleteMessage(id: number): Observable<ContactResponse> {
    return this.http.delete<ContactResponse>(`${this.apiUrl}/admin/contact-messages/${id}`);
  }

  // Obtener estadísticas (admin)
  getStats(): Observable<ContactStats> {
    return this.http.get<ContactStats>(`${this.apiUrl}/admin/contact-messages/stats/overview`);
  }
}
