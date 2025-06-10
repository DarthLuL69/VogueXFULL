import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StockXService {
  private apiUrl = `${environment.apiUrl}/stockx`;

  constructor(private http: HttpClient) { }

  searchProducts(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search`, { params: { query } });
  }

  getPriceRecommendation(productSlug: string, size?: string): Observable<any> {
    const params: any = { product_slug: productSlug };
    if (size) {
      params.size = size;
    }
    return this.http.get(`${this.apiUrl}/price-recommendation`, { params });
  }

  getMarketData(productSlug: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/market-data`, { params: { product_slug: productSlug } });
  }
} 