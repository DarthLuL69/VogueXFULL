import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FavoriteService } from '../../../shared/services';

// Define interfaces para las estructuras de favoritos
interface FavoriteProduct {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  timeAgo?: string;
  originalPrice?: number;
  size?: string;
}

interface FavoriteDesigner {
  id: string;
  name: string;
  imageUrl: string;
  itemsCount: number;
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
          <button 
            (click)="activeTab = 'listings'"
            [class]="activeTab === 'listings' ? 'py-2 border-b-2 border-black font-semibold text-sm' : 'py-2 border-b-2 border-transparent hover:border-gray-300 text-sm'">
            Listings
          </button>
          <button 
            (click)="activeTab = 'designers'"
            [class]="activeTab === 'designers' ? 'py-2 border-b-2 border-black font-semibold text-sm' : 'py-2 border-b-2 border-transparent hover:border-gray-300 text-sm'">
            Designers
          </button>
          <button 
            (click)="activeTab = 'sellers'"
            [class]="activeTab === 'sellers' ? 'py-2 border-b-2 border-black font-semibold text-sm' : 'py-2 border-b-2 border-transparent hover:border-gray-300 text-sm'">
            Sellers
          </button>
        </nav>
      </div>

      <!-- Contenido de la sección activa -->
      <div class="">
        <!-- Sección de Listings -->
        <div *ngIf="activeTab === 'listings'" class="mb-6">
          <div class="flex items-center justify-end mb-4">
            <span class="text-sm text-gray-600 mr-2">SORT</span>
            <select class="border rounded-md text-sm px-2 py-1">
              <option>Date Added</option>
            </select>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div *ngFor="let product of favoriteProducts" class="bg-white rounded-lg shadow overflow-hidden cursor-pointer">
              <div class="relative">
                <img [src]="product.imageUrl" [alt]="product.name" class="w-full h-48 object-cover">
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

            <div *ngIf="favoriteProducts.length === 0" class="col-span-full text-center text-gray-500">
              No tienes productos favoritos añadidos todavía.
            </div>
          </div>
        </div>

        <!-- Sección de Designers -->
        <div *ngIf="activeTab === 'designers'" class="mb-6">
          <div class="flex items-center justify-end mb-4">
            <span class="text-sm text-gray-600 mr-2">SORT</span>
            <select class="border rounded-md text-sm px-2 py-1">
              <option>Date Added</option>
              <option>A-Z</option>
              <option>Items Count</option>
            </select>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            <div *ngFor="let designer of favoriteDesigners" 
                 (click)="goToDesignerShop(designer)"
                 class="group cursor-pointer">
              <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
                <img 
                  [src]="designer.imageUrl" 
                  [alt]="designer.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy">
                <button 
                  (click)="removeFavoriteDesigner(designer.id, $event)"
                  class="absolute top-2 right-2 w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <div class="text-center">
                <h3 class="font-medium text-sm mb-1 group-hover:underline">{{ designer.name }}</h3>
                <p class="text-xs text-gray-500">{{ designer.itemsCount }} items</p>
              </div>
            </div>

            <div *ngIf="favoriteDesigners.length === 0" class="col-span-full text-center text-gray-500">
              No tienes diseñadores favoritos añadidos todavía.
              <br>
              <a routerLink="/designers" class="text-blue-500 hover:underline mt-2 inline-block">
                Explorar diseñadores
              </a>
            </div>
          </div>
        </div>

        <!-- Sección de Sellers (placeholder) -->
        <div *ngIf="activeTab === 'sellers'" class="mb-6">
          <div class="text-center text-gray-500">
            <h2 class="text-xl font-bold mb-4">Favorite Sellers</h2>
            <p>Esta funcionalidad estará disponible próximamente.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class FavouritesComponent implements OnInit, OnDestroy {
  favoriteProducts: FavoriteProduct[] = [];
  favoriteDesigners: FavoriteDesigner[] = [];
  activeTab: 'listings' | 'designers' | 'sellers' = 'listings';
  
  private favoritesSubscription: Subscription | undefined;
  private designersSubscription: Subscription | undefined;

  constructor(
    private favoriteService: FavoriteService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.favoritesSubscription = this.favoriteService.favorites$.subscribe(products => {
      this.favoriteProducts = products;
    });

    this.designersSubscription = this.favoriteService.favoriteDesigners$.subscribe(designers => {
      this.favoriteDesigners = designers;
    });
  }

  ngOnDestroy(): void {
    if (this.favoritesSubscription) {
      this.favoritesSubscription.unsubscribe();
    }
    if (this.designersSubscription) {
      this.designersSubscription.unsubscribe();
    }
  }

  removeFavorite(productId: number): void {
    this.favoriteService.removeFavorite(productId);
  }

  removeFavoriteDesigner(designerId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.favoriteService.removeFavoriteDesigner(designerId);
  }

  goToDesignerShop(designer: FavoriteDesigner): void {
    this.router.navigate(['/shop'], {
      queryParams: { designer: designer.name }
    });
  }
}
