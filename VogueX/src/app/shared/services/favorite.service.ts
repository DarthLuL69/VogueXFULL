import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Define una interfaz para la estructura mínima de un producto en favoritos
interface FavoriteProduct {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  timeAgo?: string; // Propiedades opcionales
  originalPrice?: number;
  size?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private favoritesSubject = new BehaviorSubject<FavoriteProduct[]>([]);
  favorites$: Observable<FavoriteProduct[]> = this.favoritesSubject.asObservable();

  private favoriteDesignersSubject = new BehaviorSubject<string[]>([]); // Lista para diseñadores favoritos
  favoriteDesigners$: Observable<string[]> = this.favoriteDesignersSubject.asObservable();

  constructor() { }

  addFavorite(product: FavoriteProduct): void {
    const currentFavorites = this.favoritesSubject.value;
    // Evitar duplicados
    if (!currentFavorites.some(fav => fav.id === product.id)) {
      this.favoritesSubject.next([...currentFavorites, product]);
      console.log('Producto añadido a favoritos:', product);
    }
  }

  removeFavorite(productId: number): void {
    const currentFavorites = this.favoritesSubject.value;
    const updatedFavorites = currentFavorites.filter(fav => fav.id !== productId);
    this.favoritesSubject.next(updatedFavorites);
    console.log('Producto eliminado de favoritos con ID:', productId);
  }

  isFavorite(productId: number): boolean {
    return this.favoritesSubject.value.some(fav => fav.id === productId);
  }

  // Métodos para diseñadores favoritos
  addFavoriteDesigner(designerName: string): void {
     const currentFavorites = this.favoriteDesignersSubject.value;
     if (!currentFavorites.includes(designerName)) {
       this.favoriteDesignersSubject.next([...currentFavorites, designerName]);
       console.log('Diseñador añadido a favoritos:', designerName);
     }
  }

  removeFavoriteDesigner(designerName: string): void {
     const currentFavorites = this.favoriteDesignersSubject.value;
     const updatedFavorites = currentFavorites.filter(name => name !== designerName);
     this.favoriteDesignersSubject.next(updatedFavorites);
     console.log('Diseñador eliminado de favoritos:', designerName);
  }

  isFavoriteDesigner(designerName: string): boolean {
    return this.favoriteDesignersSubject.value.includes(designerName);
  }
}
