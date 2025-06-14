import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="bg-white border-b">
      <div class="container mx-auto flex items-center justify-between py-4 px-4">        <!-- Logo -->
        <a routerLink="/home" class="cursor-pointer">
          <img src="assets/images/Logo.png" alt="Logo de VogueX" class="w-32 h-10 object-contain">
        </a>
        <!-- Buscador -->
        <div class="flex-1 mx-8 relative">
          <input type="text" placeholder="Search..." class="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none" [formControl]="searchControl">
          <div class="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke-width="2"/><path stroke-width="2" d="M21 21l-3.5-3.5"/></svg>
          </div>

          <!-- Resultados de búsqueda -->
          <div *ngIf="searchResults && searchResults.length > 0" class="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded shadow-lg max-h-60 overflow-y-auto">
            <div *ngFor="let result of searchResults" class="p-2 hover:bg-gray-100 cursor-pointer" (click)="selectSearchResult(result)">
              {{ result.name || result.title || 'Unknown Result' }}
            </div>
          </div>
           <div *ngIf="searchControl.value && searchResults && searchResults.length === 0" class="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded shadow-lg p-2 text-gray-500">
              No se encontraron resultados para "{{ searchControl.value }}".
            </div>
        </div>        <!-- Botones -->
        <div class="flex items-center gap-4">
          <a routerLink="/shop" class="hover:underline">SHOP</a>
          <a routerLink="/contact" class="hover:underline">CONTACT</a>
          
          <!-- Botones cuando no está autenticado -->
          <ng-container *ngIf="!(isAuthenticated$ | async)">
            <a routerLink="/login" class="border px-4 py-2 rounded hover:bg-gray-100">LOGIN</a>
            <a routerLink="/register" class="border px-4 py-2 rounded hover:bg-gray-100">REGISTER</a>
          </ng-container>
            <!-- Botones cuando está autenticado -->
          <ng-container *ngIf="isAuthenticated$ | async">
            <a routerLink="/sell" class="border px-4 py-2 rounded hover:bg-gray-100">SELL</a>
            <a routerLink="/favourites" class="text-2xl">♡</a>
            
            <!-- Enlace al panel de administración solo para administradores -->
            <a *ngIf="isAdmin$ | async" routerLink="/admin" class="border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-50">ADMIN</a>
            
            <a routerLink="/profile" class="w-8 h-8 bg-black rounded-full cursor-pointer flex items-center justify-center text-white">
              {{ (currentUser$ | async)?.name?.charAt(0) ?? 'U' }}
            </a>
            <button (click)="logout()" class="text-gray-600 hover:text-black">Logout</button>
          </ng-container>
        </div>
      </div>
      <!-- Menú horizontal con dropdowns -->
      <div class="border-t relative">
        <div class="container mx-auto flex gap-8 px-4 py-2 font-semibold uppercase text-sm">
          <!-- Menswear with dropdown -->
          <div class="relative"
               (mouseenter)="showDropdown('menswear')"
               (mouseleave)="hideDropdown('menswear')">
            <a [routerLink]="['/shop']" [queryParams]="{ category: 'menswear' }" class="hover:underline cursor-pointer">
              Menswear
            </a>
            <!-- Menswear Dropdown -->
            <div *ngIf="showMenswearDropdown" 
                 class="absolute top-full left-0 bg-white border border-gray-200 shadow-lg rounded-md mt-1 w-80 z-50">
              <div class="p-4">
                <div class="grid grid-cols-2 gap-4">
                  <div *ngFor="let category of menswearCategories" class="space-y-2">
                    <div class="font-semibold text-gray-800 text-xs uppercase tracking-wide">{{ category.name }}</div>
                    <div class="space-y-1">
                      <a *ngFor="let subcategory of category.subcategories"
                         class="block text-sm text-gray-600 hover:text-black cursor-pointer py-1"
                         (click)="navigateToCategory('menswear', subcategory)">
                        {{ subcategory }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Womenswear with dropdown -->
          <div class="relative"
               (mouseenter)="showDropdown('womenswear')"
               (mouseleave)="hideDropdown('womenswear')">
            <a [routerLink]="['/shop']" [queryParams]="{ category: 'womenswear' }" class="hover:underline cursor-pointer">
              Womenswear
            </a>
            <!-- Womenswear Dropdown -->
            <div *ngIf="showWomenswearDropdown" 
                 class="absolute top-full left-0 bg-white border border-gray-200 shadow-lg rounded-md mt-1 w-80 z-50">
              <div class="p-4">
                <div class="grid grid-cols-2 gap-4">
                  <div *ngFor="let category of womenswearCategories" class="space-y-2">
                    <div class="font-semibold text-gray-800 text-xs uppercase tracking-wide">{{ category.name }}</div>
                    <div class="space-y-1">
                      <a *ngFor="let subcategory of category.subcategories"
                         class="block text-sm text-gray-600 hover:text-black cursor-pointer py-1"
                         (click)="navigateToCategory('womenswear', subcategory)">
                        {{ subcategory }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footwear with dropdown -->
          <div class="relative"
               (mouseenter)="showDropdown('sneakers')"
               (mouseleave)="hideDropdown('sneakers')">
            <a [routerLink]="['/shop']" [queryParams]="{ category: 'sneakers' }" class="hover:underline cursor-pointer">
              Footwear
            </a>
            <!-- Footwear Dropdown -->
            <div *ngIf="showSneakersDropdown" 
                 class="absolute top-full left-0 bg-white border border-gray-200 shadow-lg rounded-md mt-1 w-80 z-50">
              <div class="p-4">
                <div class="grid grid-cols-1 gap-4">
                  <div *ngFor="let category of sneakersCategories" class="space-y-2">
                    <div class="font-semibold text-gray-800 text-xs uppercase tracking-wide">{{ category.name }}</div>
                    <div class="space-y-1">
                      <a *ngFor="let subcategory of category.subcategories"
                         class="block text-sm text-gray-600 hover:text-black cursor-pointer py-1"
                         (click)="navigateToCategory('sneakers', subcategory)">
                        {{ subcategory }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Designers (sin dropdown) -->
          <a [routerLink]="['/designers']" class="hover:underline">Designers</a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class HeaderComponent implements OnDestroy {
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<User | null>;
  isAdmin$: Observable<boolean>;
  searchControl = new FormControl();
  searchResults: any[] | undefined;
  private readonly searchSubscription: Subscription | undefined;

  // Dropdown states
  showMenswearDropdown = false;
  showWomenswearDropdown = false;
  showSneakersDropdown = false;

  // Categories for dropdowns
  menswearCategories = [
    { name: 'Tops', subcategories: ['T-Shirts', 'Shirts', 'Hoodies', 'Sweaters', 'Polos'] },
    { name: 'Bottoms', subcategories: ['Jeans', 'Pants', 'Shorts', 'Joggers'] },
    { name: 'Outerwear', subcategories: ['Jackets', 'Coats', 'Blazers', 'Vests'] },
    { name: 'Accessories', subcategories: ['Belts', 'Watches', 'Bags', 'Hats'] }
  ];

  womenswearCategories = [
    { name: 'Tops', subcategories: ['Blouses', 'T-Shirts', 'Sweaters', 'Tank Tops'] },
    { name: 'Bottoms', subcategories: ['Jeans', 'Skirts', 'Pants', 'Shorts'] },
    { name: 'Dresses', subcategories: ['Casual Dresses', 'Evening Dresses', 'Maxi Dresses'] },
    { name: 'Outerwear', subcategories: ['Jackets', 'Coats', 'Cardigans'] },
    { name: 'Accessories', subcategories: ['Bags', 'Jewelry', 'Scarves', 'Belts'] }
  ];

  sneakersCategories = [
    { name: 'Sneakers', subcategories: ['Low Top Sneakers', 'High Top Sneakers', 'Mid Top Sneakers', 'Slip-On Sneakers', 'Running Shoes', 'Basketball Shoes'] },
    { name: 'Boots', subcategories: ['Ankle Boots', 'Combat Boots', 'Chelsea Boots', 'Work Boots', 'Hiking Boots', 'Desert Boots'] },
    { name: 'Casual', subcategories: ['Loafers', 'Moccasins', 'Boat Shoes', 'Espadrilles', 'Canvas Shoes'] },
    { name: 'Sandals', subcategories: ['Flip Flops', 'Slides', 'Sport Sandals', 'Dress Sandals'] },
    { name: 'Formal', subcategories: ['Oxford Shoes', 'Derby Shoes', 'Brogues', 'Monk Straps', 'Dress Boots'] }  ];

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
    this.isAdmin$ = this.authService.isAdmin$;
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }  }

  selectSearchResult(result: any): void {
    const searchTerm = result.name ?? result.title ?? this.searchControl.value;
    this.router.navigate(['/shop'], { queryParams: { search: searchTerm } });
    this.searchResults = undefined;
    this.searchControl.setValue('', { emitEvent: false });
  }

  logout(): void {
    this.authService.logout();
  }
  
  // Dropdown control methods
  showDropdown(category: string): void {
    this.hideAllDropdowns();
    switch(category) {
      case 'menswear':
        this.showMenswearDropdown = true;
        break;
      case 'womenswear':
        this.showWomenswearDropdown = true;
        break;
      case 'sneakers':
        this.showSneakersDropdown = true;
        break;
    }
  }

  hideDropdown(category: string): void {
    switch(category) {
      case 'menswear':
        this.showMenswearDropdown = false;
        break;
      case 'womenswear':
        this.showWomenswearDropdown = false;
        break;
      case 'sneakers':
        this.showSneakersDropdown = false;
        break;
    }
  }

  hideAllDropdowns(): void {
    this.showMenswearDropdown = false;
    this.showWomenswearDropdown = false;
    this.showSneakersDropdown = false;
  }

  navigateToCategory(category: string, subcategory?: string): void {
    const queryParams: any = { category: category.toLowerCase() };
    if (subcategory) {
      queryParams.subcategory = subcategory.toLowerCase().replace(/\s+/g, '-');
    }
    this.router.navigate(['/shop'], { queryParams });
    this.hideAllDropdowns();
  }

}