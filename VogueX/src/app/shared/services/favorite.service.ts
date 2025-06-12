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

// Agregar interfaz para diseñadores favoritos
export interface FavoriteDesigner {
  id: string; // Asegurar que sea string
  name: string;
  imageUrl: string;
  itemsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private favoritesSubject = new BehaviorSubject<FavoriteProduct[]>([]);
  favorites$: Observable<FavoriteProduct[]> = this.favoritesSubject.asObservable();

  private favoriteDesignersSubject = new BehaviorSubject<FavoriteDesigner[]>([]);
  favoriteDesigners$: Observable<FavoriteDesigner[]> = this.favoriteDesignersSubject.asObservable();

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

  // Designers methods
  addFavoriteDesigner(designer: FavoriteDesigner): void {
    const favorites = this.getFavoriteDesigners();
    if (!favorites.find(d => d.id === designer.id)) {
      favorites.push(designer);
      this.saveFavoriteDesigners(favorites);
      this.favoriteDesignersSubject.next(favorites);
    }
  }

  removeFavoriteDesigner(designerId: string): void {
    const favorites = this.getFavoriteDesigners();
    const updated = favorites.filter(d => d.id !== designerId);
    this.saveFavoriteDesigners(updated);
    this.favoriteDesignersSubject.next(updated);
  }

  isFavoriteDesigner(designerId: string): boolean {
    const favorites = this.getFavoriteDesigners();
    return favorites.some(d => d.id === designerId);
  }

  toggleFavoriteDesigner(designer: FavoriteDesigner): void {
    if (this.isFavoriteDesigner(designer.id)) {
      this.removeFavoriteDesigner(designer.id);
    } else {
      this.addFavoriteDesigner(designer);
    }
  }

  // Métodos de almacenamiento (pueden ser implementados según las necesidades)
  private getFavoriteDesigners(): FavoriteDesigner[] {
    return this.favoriteDesignersSubject.value;
  }

  private saveFavoriteDesigners(designers: FavoriteDesigner[]): void {
    // Implementar lógica de almacenamiento, si es necesario
  }
}
