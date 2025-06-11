import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Designer {
  id: string;
  name: string;
  imageUrl: string;
  itemsCount: number;
  isPopular?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DesignersService {
  private apiUrl = 'http://localhost:8000/api/designers';

  constructor(private http: HttpClient) { }

  getPopularDesigners(): Observable<Designer[]> {
    return this.http.get<{data: Designer[]}>(`${this.apiUrl}/popular`).pipe(
      map(response => response.data)
    );
  }

  getFeaturedDesigners(): Observable<Designer[]> {
    return this.http.get<{data: Designer[]}>(`${this.apiUrl}/featured`).pipe(
      map(response => response.data)
    );
  }

  getDesignersByLetter(letter: string): Observable<Designer[]> {
    return this.http.get<{data: Designer[]}>(`${this.apiUrl}`, {
      params: { letter }
    }).pipe(
      map(response => response.data)
    );
  }

  searchDesigners(query: string): Observable<Designer[]> {
    return this.http.get<{data: Designer[]}>(`${this.apiUrl}`, {
      params: { search: query }
    }).pipe(
      map(response => response.data)
    );
  }

  getAllDesigners(limit: number = 20): Observable<Designer[]> {
    return this.http.get<{data: Designer[]}>(`${this.apiUrl}`, {
      params: { limit: limit.toString() }
    }).pipe(
      map(response => response.data)
    );
  }

  getDesigner(id: string): Observable<Designer> {
    return this.http.get<Designer>(`${this.apiUrl}/${id}`);
  }
}