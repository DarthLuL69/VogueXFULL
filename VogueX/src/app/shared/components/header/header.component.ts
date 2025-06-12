import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { GrailedApiService } from '../../services/grailed-api.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, HttpClientModule],
  template: `
    <div class="bg-white border-b">
      <div class="container mx-auto flex items-center justify-between py-4 px-4">
        <!-- Logo -->
        <a routerLink="/" class="cursor-pointer">
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
        </div>
        <!-- Botones -->
        <div class="flex items-center gap-4">
          <a routerLink="/sell" class="border px-4 py-2 rounded hover:bg-gray-100">SELL</a>
          <a routerLink="/shop" class="hover:underline">SHOP</a>
          <a routerLink="/contact" class="hover:underline">CONTACT</a>
          <a routerLink="/favourites" class="text-2xl">♡</a>
          <a routerLink="/profile" class="w-8 h-8 bg-black rounded-full cursor-pointer"></a>
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

          <!-- Sneakers with dropdown -->
          <div class="relative"
               (mouseenter)="showDropdown('sneakers')"
               (mouseleave)="hideDropdown('sneakers')">
            <a [routerLink]="['/shop']" [queryParams]="{ category: 'sneakers' }" class="hover:underline cursor-pointer">
              Sneakers
            </a>
            <!-- Sneakers Dropdown -->
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
  searchControl = new FormControl();
  searchResults: any[] | undefined;
  private searchSubscription: Subscription | undefined;

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
    { name: 'Style', subcategories: ['Low Top', 'High Top', 'Mid Top', 'Slip-On'] },
    { name: 'Type', subcategories: ['Running', 'Basketball', 'Lifestyle', 'Skateboarding'] },
    { name: 'Brand', subcategories: ['Nike', 'Adidas', 'Jordan', 'Converse', 'Vans'] }
  ];

  constructor(private apiService: GrailedApiService, private router: Router) { // Inyectar GrailedApiService y Router
    this.searchSubscription = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query) {
          return this.apiService.search(query);
        } else {
          // Limpiar resultados si el query está vacío
          this.searchResults = undefined; // Limpiar resultados
          return [];
        }
      })
    ).subscribe(results => {
      // Asignar los resultados (ajustar según la estructura real de la API)
      // Suponemos que los resultados relevantes están en results.hits
       if (results && results.hits) {
         this.searchResults = results.hits; // Esto es una suposición; verificar la estructura real
       } else {
         this.searchResults = [];
       }
      console.log('Search Results:', this.searchResults);
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  selectSearchResult(result: any): void {
    // Lógica al seleccionar un resultado
    console.log('Selected search result:', result);
    // Navegar a la página de la tienda con la consulta o detalles del producto si es posible
    // Dependiendo de la estructura de la API, podrías navegar a una página de detalles
    // si el resultado es un producto específico, o a la página de la tienda con un filtro
    // si es un diseñador o marca.

    // Por ahora, navegamos a la página de la tienda con el término de búsqueda.
    // Podrías refinar esto si la API indica el tipo de resultado (producto, diseñador, etc.)
    const searchTerm = result.name || result.title || this.searchControl.value;
    this.router.navigate(['/shop'], { queryParams: { search: searchTerm } });
    this.searchResults = undefined; // Ocultar los resultados después de seleccionar
     this.searchControl.setValue('', { emitEvent: false }); // Limpiar el input sin activar otra búsqueda
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