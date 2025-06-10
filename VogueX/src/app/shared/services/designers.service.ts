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
  private apiUrl = 'https://www.grailed.com/api/designers';

  constructor(private http: HttpClient) { }

  getPopularDesigners(): Observable<Designer[]> {
    return this.http.get<any>(`${this.apiUrl}/popular`).pipe(
      map(response => response.data.map((designer: any) => ({
        id: designer.id,
        name: designer.name,
        imageUrl: designer.image_url,
        itemsCount: designer.items_count,
        isPopular: true
      })))
    );
  }

  getDesignersByLetter(letter: string): Observable<Designer[]> {
    return this.http.get<any>(`${this.apiUrl}/letter/${letter}`).pipe(
      map(response => response.data.map((designer: any) => ({
        id: designer.id,
        name: designer.name,
        imageUrl: designer.image_url,
        itemsCount: designer.items_count
      })))
    );
  }

  searchDesigners(query: string): Observable<Designer[]> {
    return this.http.get<any>(`${this.apiUrl}/search`, {
      params: { q: query }
    }).pipe(
      map(response => response.data.map((designer: any) => ({
        id: designer.id,
        name: designer.name,
        imageUrl: designer.image_url,
        itemsCount: designer.items_count
      })))
    );
  }

  getAllDesigners(): Observable<Designer[]> {
    return this.http.get<any>(`${this.apiUrl}`).pipe(
      map(response => response.data.map((designer: any) => ({
        id: designer.id,
        name: designer.name,
        imageUrl: designer.image_url,
        itemsCount: designer.items_count
      })))
    );
  }
} 