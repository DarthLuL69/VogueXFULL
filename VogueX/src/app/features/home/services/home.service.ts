import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HeroBanner, Category, Product } from '../interfaces/home.interface';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private apiUrl = `${environment.apiUrl}/home`;

  constructor(private http: HttpClient) {}

  getHeroBanner(): Observable<HeroBanner> {
    return this.http.get<HeroBanner>(`${this.apiUrl}/banner`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/featured`);
  }
} 