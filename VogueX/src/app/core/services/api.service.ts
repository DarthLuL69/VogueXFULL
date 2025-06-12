import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

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
  }

  createProduct(formData: FormData): Observable<any> {
    console.log('ApiService: Enviando producto al backend');
    
    // Log para debug (sin mostrar las imágenes base64 completas)
    const debugData: any = {};
    formData.forEach((value, key) => {
      if (key.startsWith('images[')) {
        debugData[key] = 'base64_image_data';
      } else {
        debugData[key] = value;
      }
    });
    console.log('Datos a enviar:', debugData);

    return this.http.post(`${this.apiUrl}/products`, formData);
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

  // Usuario/Perfil
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/profile`);
  }

  updateUserProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/profile`, profileData);
  }
}
