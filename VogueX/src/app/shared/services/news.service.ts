import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NewsItem {
  id?: number;
  title: string;
  image: string;
  url: string;
  category: string;
  date: string;
  source?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = `${environment.apiUrl}/news`;

  constructor(private http: HttpClient) { }

  getLatestNews(): Observable<{ success: boolean; data: NewsItem[]; count: number }> {
    return this.http.get<{ success: boolean; data: NewsItem[]; count: number }>(`${this.apiUrl}/latest`);
  }
}
