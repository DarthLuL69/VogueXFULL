import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  // Productos
  getProducts(filters?: any): Observable<any> {
    let params = new URLSearchParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
    }

    const url = params.toString() ? `${this.apiUrl}/products?${params.toString()}` : `${this.apiUrl}/products`;
    return this.http.get(url);
  }

  getProduct(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/${id}`);
  }  createProduct(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/products`, formData, { headers: this.getAuthHeaders() });
  }

  updateProduct(id: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/products/${id}`, formData);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }

  getBrands(): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/brands`);
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/profile`);
  }

  updateUserProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/profile`, profileData, { headers: this.getAuthHeaders() });
  }

  uploadProfileImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post(`${this.apiUrl}/user/profile/avatar`, formData, { headers: this.getAuthHeaders() });
  }

  createChat(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/chats`, data, { headers: this.getAuthHeaders() });
  }

  getChats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/chats`, { headers: this.getAuthHeaders() });
  }

  getChat(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/chats/${id}`, { headers: this.getAuthHeaders() });
  }

  createOffer(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/offers`, data, { headers: this.getAuthHeaders() });
  }

  getOffers(chatId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/chats/${chatId}/offers`, { headers: this.getAuthHeaders() });
  }

  sendMessage(chatId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/chats/${chatId}/messages`, data, { headers: this.getAuthHeaders() });
  }

  getMessages(chatId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/chats/${chatId}/messages`, { headers: this.getAuthHeaders() });
  }
}
