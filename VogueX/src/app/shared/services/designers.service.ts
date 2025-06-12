import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Designer {
  id: string; // Cambiar de number a string para consistencia
  name: string;
  imageUrl: string;
  itemsCount: number;
  isPopular?: boolean;
  isFeatured?: boolean;
  website?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DesignersService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getAllDesigners(): Observable<Designer[]> { // Remover parámetro opcional
    console.log('Fetching all designers from:', `${this.apiUrl}/designers?all=true`);
    return this.http.get<any>(`${this.apiUrl}/designers?all=true`).pipe(
      map(response => {
        console.log('API Response:', response);
        const designers = response.data || response || [];
        console.log('Total designers received:', designers.length);
        return designers.map((designer: any) => this.transformDesigner(designer));
      }),
      catchError(error => {
        console.error('Error fetching all designers:', error);
        return of([]);
      })
    );
  }

  searchDesigners(query: string, limit: number = 20): Observable<Designer[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    console.log('Searching designers with query:', query, 'limit:', limit);
    
    const params = new URLSearchParams({
      search: query,
      limit: limit.toString()
    });

    return this.http.get<any>(`${this.apiUrl}/designers?${params.toString()}`).pipe(
      map(response => {
        console.log('Search Response:', response);
        const designers = response.data || response || [];
        console.log('Search results count:', designers.length);
        return designers.map((designer: any) => this.transformDesigner(designer));
      }),
      catchError(error => {
        console.error('Error searching designers:', error);
        return of([]);
      })
    );
  }

  // Método específico para búsqueda rápida (autocompletado)
  searchDesignersQuick(query: string): Observable<Designer[]> {
    return this.searchDesigners(query, 50);
  }

  // Obtener diseñadores por letra
  getDesignersByLetter(letter: string): Observable<Designer[]> {
    return this.http.get<any>(`${this.apiUrl}/designers?letter=${letter}&limit=100`).pipe(
      map(response => {
        const designers = response.data || response || [];
        return designers.map((designer: any) => this.transformDesigner(designer));
      }),
      catchError(error => {
        console.error('Error fetching designers by letter:', error);
        return of([]);
      })
    );
  }

  getPopularDesigners(): Observable<Designer[]> {
    return this.http.get<any>(`${this.apiUrl}/designers/popular`).pipe(
      map(response => {
        const designers = response.data || response || [];
        return designers.map((designer: any) => this.transformDesigner(designer));
      }),
      catchError(error => {
        console.error('Error fetching popular designers:', error);
        return of([]);
      })
    );
  }

  getFeaturedDesigners(): Observable<Designer[]> {
    return this.http.get<any>(`${this.apiUrl}/designers/featured`).pipe(
      map(response => {
        const designers = response.data || response || [];
        return designers.map((designer: any) => this.transformDesigner(designer));
      }),
      catchError(error => {
        console.error('Error fetching featured designers:', error);
        return of([]);
      })
    );
  }

  private transformDesigner(designer: any): Designer {
    return {
      id: designer.id?.toString() || Math.random().toString(), // Convertir a string
      name: designer.name || 'Unknown Designer',
      imageUrl: designer.image_url || designer.imageUrl || `https://via.placeholder.com/150x150?text=${encodeURIComponent(designer.name || 'D')}`,
      itemsCount: designer.items_count || designer.itemsCount || 0,
      isPopular: designer.is_popular || designer.isPopular || false,
      isFeatured: designer.is_featured || designer.isFeatured || false,
      website: designer.website || null,
      description: designer.description || null
    };
  }
}