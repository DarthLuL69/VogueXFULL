import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { FavoriteService } from '../../shared/services/favorite.service';

// Define una interfaz para la estructura mínima de un producto en favoritos (debe coincidir con la del servicio)
interface FavoriteProduct {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  timeAgo?: string;
  originalPrice?: number;
  size?: string;
}

@Component({
  selector: 'app-favourites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-center mb-2">Favourites</h1>
      <p class="text-gray-600 text-center text-sm mb-8">You will be notified when your favorite listings drop in price or are relisted.</p>

      <div class="border-b mb-8">
        <nav class="flex justify-center space-x-8">
          <button class="py-2 border-b-2 border-black font-semibold text-sm">Listings</button>
          <button class="py-2 border-b-2 border-transparent hover:border-gray-300 text-sm">Designers</button>
          <button class="py-2 border-b-2 border-transparent hover:border-gray-300 text-sm">Sellers</button>
        </nav>
      </div>

      <!-- Contenido de la sección activa (Listings por defecto) -->
      <div class="">
        <!-- Sección de Listings -->
        <div class="mb-6">
          <div class="flex items-center justify-end mb-4">
            <span class="text-sm text-gray-600 mr-2">SORT</span>
            <select class="border rounded-md text-sm px-2 py-1">
              <option>Date Added</option>
              <!-- Add more sorting options -->
            </select>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <!-- Artículos de Listings -->
            <div *ngFor="let product of favoriteProducts" class="bg-white rounded-lg shadow overflow-hidden cursor-pointer">
              <div class="relative">
                <img [src]="product.imageUrl" [alt]="product.name" class="w-full h-48 object-cover">
                <!-- Puedes mostrar un indicador de estado si lo necesitas -->
                <!-- <div class="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 rounded">SOLD</div> -->
                <button (click)="removeFavorite(product.id)" class="absolute top-2 right-2 text-red-500 hover:text-red-700">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <div class="p-3">
                <p class="text-xs text-gray-500">{{ product.timeAgo || '' }}</p>
                <h3 class="font-semibold text-sm mb-1">{{ product.name }}</h3>
                 <div class="flex items-center justify-between">
                  <p class="text-sm font-bold">€{{ product.price }} <span *ngIf="product.originalPrice" class="text-xs text-gray-500 line-through">€{{ product.originalPrice }}</span></p>
                 </div>
              </div>
            </div>

            <!-- Mensaje si no hay favoritos -->
            <div *ngIf="favoriteProducts.length === 0" class="col-span-full text-center text-gray-500">
              No tienes productos favoritos añadidos todavía.
            </div>
          </div>
        </div>

        <!-- Sección de Designers (placeholder) -->
        <div class="hidden">
          <h2 class="text-xl font-bold mb-4">Favorite Designers</h2>
          <p>Contenido de diseñadores favoritos aquí.</p>
        </div>

        <!-- Sección de Sellers (placeholder) -->
        <div class="hidden">
          <h2 class="text-xl font-bold mb-4">Favorite Sellers</h2>
          <p>Contenido de vendedores favoritos aquí.</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class FavouritesComponent implements OnInit, OnDestroy {
  favoriteProducts: FavoriteProduct[] = [];
  private favoritesSubscription: Subscription | undefined;

  constructor(private favoriteService: FavoriteService) { }

  ngOnInit(): void {
    this.favoritesSubscription = this.favoriteService.favorites$.subscribe(products => {
      this.favoriteProducts = products;
    });
  }

  ngOnDestroy(): void {
    if (this.favoritesSubscription) {
      this.favoritesSubscription.unsubscribe();
    }
  }

  removeFavorite(productId: number): void {
    this.favoriteService.removeFavorite(productId);
  }
} 