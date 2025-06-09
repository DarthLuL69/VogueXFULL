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
        <img src="" alt="Logo de VogueX" class="w-32 h-10 object-contain">
        <!-- Buscador -->
        <div class="flex-1 mx-8 relative">
          <input type="text" placeholder="Search..." class="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none" [formControl]="searchControl">
          <button class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke-width="2"/><path stroke-width="2" d="M21 21l-3.5-3.5"/></svg>
          </button>

          <!-- Resultados de búsqueda -->
          <div *ngIf="searchResults && searchResults.length > 0" class="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded shadow-lg max-h-60 overflow-y-auto">
            <div *ngFor="let result of searchResults" class="p-2 hover:bg-gray-100 cursor-pointer" (click)="selectSearchResult(result)">
              {{ result.name || result.title || 'Unknown Result' }} <!-- Mostrar nombre o título -->
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
          <div class="w-8 h-8 bg-black rounded-full"></div>
        </div>
      </div>
      <!-- Menú horizontal -->
      <div class="border-t">
        <div class="container mx-auto flex gap-8 px-4 py-2 font-semibold uppercase text-sm">
          <a [routerLink]="['/shop']" [queryParams]="{ category: 'menswear' }" class="hover:underline">Menswear</a>
          <a [routerLink]="['/shop']" [queryParams]="{ category: 'womenswear' }" class="hover:underline">Womenswear</a>
          <a [routerLink]="['/shop']" [queryParams]="{ category: 'sneakers' }" class="hover:underline">Sneakers</a>
          <a [routerLink]="['/designers']" class="hover:underline">Designers</a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class HeaderComponent implements OnDestroy {
  searchControl = new FormControl();
  searchResults: any[] | undefined; // Ajustar el tipo según la estructura de la API
  private searchSubscription: Subscription | undefined;

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

} 