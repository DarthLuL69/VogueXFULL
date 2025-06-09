import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FavoriteService } from '../../shared/services/favorite.service';
import { GrailedApiService } from '../../shared/services/grailed-api.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  template: `
    <div class="shop-container">
      <h1 class="page-title">Tienda</h1>
      <div class="content-container">
        <!-- Filtros -->
        <aside class="filter-sidebar">

          <!-- Department Filter -->
          <div class="filter-section">
            <h3 class="filter-title" (click)="toggleFilter('department')">
              Departament
              <svg class="arrow-icon" [class.expanded]="isFilterExpanded('department')" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </h3>
            <div class="filter-options" *ngIf="isFilterExpanded('department')">
              <div class="checkbox-option">
                <label><input type="checkbox"> Menswear</label>
              </div>
              <div class="checkbox-option">
                <label><input type="checkbox"> Womenswear</label>
              </div>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="filter-section">
            <h3 class="filter-title" (click)="toggleFilter('category')">
              Category
              <svg class="arrow-icon" [class.expanded]="isFilterExpanded('category')" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </h3>
            <div class="filter-options" *ngIf="isFilterExpanded('category')">
              <!-- Aquí podrías iterar sobre tus categorías dinámicamente -->
              <div class="category-group">
                <p class="category-group-title">Menswear</p>
                <div class="checkbox-option"><label><input type="checkbox"> All Tops</label></div>
                <div class="checkbox-option"><label><input type="checkbox"> Long Sleeve T-Shirts</label></div>
                <div class="checkbox-option"><label><input type="checkbox"> Hoodies</label></div>
                <div class="checkbox-option"><label><input type="checkbox"> Shirts (Button Ups)</label></div>
                <div class="checkbox-option"><label><input type="checkbox"> Short Sleeve T-Shirts</label></div>
                <div class="checkbox-option"><label><input type="checkbox"> Sweaters & Knitwear</label></div>
                <div class="checkbox-option"><label><input type="checkbox"> Sweatshirts & Hoodies</label></div>
              </div>
               <div class="category-group">
                <p class="category-group-title">Womenswear</p>
                 <div class="checkbox-option"><label><input type="checkbox"> Dresses</label></div>
              </div>
              <!-- Los items actuales del template -->
               <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> All Tops</label></div>
              <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> Long Sleeve T-Shirts</label></div>
              <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> Hoodies</label></div>
              <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> Shirts (Button Ups)</label></div>
              <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> Short Sleeve T-Shirts</label></div>
              <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> Sweaters & Knitwear</label></div>
              <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> Sweatshirts & Hoodies</label></div>
              <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> Sweatshirts & Hoodies</label></div>
              <div class="category-group-title">Bottoms</div>
              <div class="category-group-title">Outerwear</div>
              <div class="category-group-title">Footwear</div>
              <div class="category-group-title">Tailoring</div>
              <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> All Tops</label></div>
              <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> Long Sleeve T-Shirts</label></div>
              <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> Hoodies</label></div>
              <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> Shirts (Button Ups)</label></div>
              <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> Short Sleeve T-Shirts</label></div>
              <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> Sweaters & Knitwear</label></div>
              <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> Sweatshirts & Hoodies</label></div>
              <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> Sweatshirts & Hoodies</label></div>
              <div class="category-group-title">Bottoms</div>
              <div class="category-group-title">Outerwear</div>
              <div class="category-group-title">Dresses</div>
              <div class="category-group-title">Footwear</div>
              <div class="category-group-title">Accessories</div>
              <div class="category-group-title">Bags & luggage</div>
              <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> Jewelry</label></div>
            </div>
          </div>

          <!-- Size Filter -->
           <div class="filter-section">
            <h3 class="filter-title" (click)="toggleFilter('size')">
              Size
              <svg class="arrow-icon" [class.expanded]="isFilterExpanded('size')" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </h3>
            <div class="filter-options" *ngIf="isFilterExpanded('size')">
               <!-- Aquí podrías iterar sobre tus tallas dinámicamente -->
               <div class="category-group">
                 <p class="category-group-title">Menswear</p>
                 <p class="category-group-title">Tops</p>
                <div class="checkbox-option"><label><input type="checkbox"> XXS/40</label></div>
                <div class="checkbox-option"><label><input type="checkbox"> XS/42</label></div>
                <div class="checkbox-option"><label><input type="checkbox"> S/44-46</label></div>
                <div class="checkbox-option"><label><input type="checkbox"> M/48-50</label></div>
                <div class="checkbox-option"><label><input type="checkbox"> L/52-54</label></div>
                <div class="checkbox-option"><label><input type="checkbox"> XL/56</label></div>
                <div class="checkbox-option"><label><input type="checkbox"> XXL/58</label></div>
               </div>
                <!-- Los items actuales del template -->
                <div class="category-group-title">Menswear</div>
                 <div class="category-group-title">Tops</div>
                <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> XXS/40</label></div>
                <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> XS/42</label></div>
                <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> S/44-46</label></div>
                <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> M/48-50</label></div>
                <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> L/52-54</label></div>
                <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> XL/56</label></div>
                <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> XXL/58</label></div>
                 <div class="category-group-title">Bottoms</div>
                 <div class="category-group-title">Outerwear</div>
                 <div class="category-group-title">Footwear</div>
                 <div class="category-group-title">Tailoring</div>
                 <div class="category-group-title">Accessories</div>
                 <div class="category-group-title">Womenswear</div>
                 <div class="category-group-title">Tops</div>
                 <div class="category-group-title">Bottoms</div>
                 <div class="category-group-title">Outerwear</div>
                 <div class="category-group-title">Dresses</div>
                 <div class="category-group-title">Footwear</div>
                 <div class="category-group-title">Accessories</div>
                 <div class="category-group-title">Bags & luggage</div>
                 <div class="checkbox-option"><label><input type="checkbox" class="mr-2"> Jewelry</label></div>
            </div>
          </div>

          <!-- Designers Filter -->
          <div class="filter-section">
            <h3 class="filter-title" (click)="toggleFilter('designers')">
              Designers
              <svg class="arrow-icon" [class.expanded]="isFilterExpanded('designers')" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </h3>
            <div class="filter-options" *ngIf="isFilterExpanded('designers')">
             <div class="filter-search">
               <input type="text" placeholder="Search for designers..." class="search-input">
               <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-3.5-3.5M10 17a7 7 0 100-14 7 7 0 000 14z"></path></svg>
             </div>
            <ul class="designer-list">
              <li *ngFor="let designer of designers"><label><input type="checkbox"> {{ designer }}</label></li>
            </ul>
            </div>
          </div>

          <!-- Price Filter -->
          <div class="filter-section">
            <h3 class="filter-title" (click)="toggleFilter('price')">
              Price
              <svg class="arrow-icon" [class.expanded]="isFilterExpanded('price')" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </h3>
             <div class="filter-options" *ngIf="isFilterExpanded('price')">
                <div class="price-inputs">
                  <input type="text" placeholder="€ Min" class="price-input">
                  <input type="text" placeholder="€ Max" class="price-input">
                </div>
            </div>
          </div>

        </aside>

        <!-- Lista de productos -->
        <div class="product-list">
          <div *ngIf="products.length > 0" class="product-grid">
            <!-- Productos de ejemplo -->
            <div *ngFor="let product of products" class="product-item">
              <img [src]="product.imageUrl" [alt]="product.name" class="product-image">
              <div class="product-info">
                <p class="product-time">{{ product.timeAgo || '' }}</p>
                <h3 class="product-name">{{ product.name }}</h3>
                <div class="product-details">
                  <p class="product-price">€{{ product.price }} <span *ngIf="product.originalPrice" class="original-price">€{{ product.originalPrice }}</span></p>
                   <svg (click)="toggleFavorite(product)" [class.text-red-500]="isFavorite(product.id)" class="favorite-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
           <div *ngIf="products.length === 0" class="no-products">
              No se encontraron productos.
            </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {
  selectedCategory: string | null = null;
   designers: string[] = []; // Array para almacenar los diseñadores
   filterStates: { [key: string]: boolean } = { // Propiedad para controlar el estado de los filtros
    department: true, // Expandido por defecto
    category: true, // Expandido por defecto
    size: true, // Expandido por defecto
    designers: true, // Expandido por defecto
    price: true // Expandido por defecto
  };

  // Inicialmente, la lista de productos estará vacía y se llenará con los resultados de la API
  products: any[] = []; // Cambiado a any[] para flexibilidad con la API

  constructor(private route: ActivatedRoute, private favoriteService: FavoriteService, private apiService: GrailedApiService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || null;
      const searchTerm = params['search'] || null; // Obtener el término de búsqueda

      console.log('Categoría seleccionada:', this.selectedCategory);
      console.log('Término de búsqueda:', searchTerm);

      if (searchTerm) {
        // Si hay un término de búsqueda, buscar productos con la API
        this.apiService.search(searchTerm).subscribe(results => {
          // Suponiendo que los productos están en results.hits
           if (results && results.hits) {
             // Mapear los resultados de la API a la estructura que usamos en la plantilla
             this.products = results.hits.map((hit: any) => ({
               id: hit.id, // Asumir que hay un ID
               name: hit.name || hit.title, // Usar name o title para el nombre
               imageUrl: hit.image_url || hit.photo_url, // Asumir propiedad de imagen
               price: hit.price, // Asumir propiedad de precio
               timeAgo: hit.listed_at ? this.getTimeAgo(new Date(hit.listed_at * 1000)) : '', // Asumir timestamp y convertir
               originalPrice: hit.original_price || undefined, // Asumir precio original opcional
               size: hit.size || undefined, // Asumir propiedad de tamaño opcional
               // Añadir otras propiedades si son necesarias y vienen en la API
             }));
           } else {
             this.products = [];
           }
          console.log('API Search Results for Products:', this.products);
        });
      } else if (this.selectedCategory) {
        // Si hay una categoría seleccionada pero no término de búsqueda, podrías buscar por categoría
        // Esto requeriría soporte de la API para buscar por categoría o filtrar resultados.
        console.log('Implementar búsqueda por categoría si es necesario.');
         // Por ahora, si solo hay categoría, no cargamos productos automáticamente a menos que implementes la búsqueda por categoría
         this.products = [];

      } else {
        // Si no hay ni búsqueda ni categoría, podrías cargar productos por defecto o mostrar un mensaje
        console.log('Implementar carga de productos por defecto o mensaje.');
         this.products = [];
      }

      // Cargar diseñadores de la API (esto puede ser independiente de la búsqueda de productos si la API lo permite)
      // Mantenemos la lógica existente para cargar diseñadores para el filtro.
      this.apiService.search('', 1, 50, 'mostrecent').subscribe(results => { // Aumentamos hitsPerPage para más diseñadores
        console.log('API Search Results for Designers (initial load):', results);
         if (results && results.hits && results.hits.length > 0) {
            const extractedDesigners = results.hits
              .map((hit: any) => hit.designer || hit.brand) // Asumir propiedad 'designer' o 'brand'
              .filter((designer: any) => designer) // Filtrar resultados nulos o vacíos
              .reduce((unique: string[], item: string) => unique.includes(item) ? unique : [...unique, item], []); // Obtener nombres únicos
            this.designers = extractedDesigners;
         }
      });

    });
  }

  // Método para añadir/eliminar de favoritos
  toggleFavorite(product: any): void {
    if (this.favoriteService.isFavorite(product.id)) {
      this.favoriteService.removeFavorite(product.id);
    } else {
      // Asegúrate de que el objeto product tenga las propiedades necesarias para el servicio de favoritos
      this.favoriteService.addFavorite({
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        price: product.price,
        timeAgo: product.timeAgo,
        originalPrice: product.originalPrice,
        size: product.size
      });
    }
  }

  // Método para verificar si es favorito
  isFavorite(productId: number): boolean {
    return this.favoriteService.isFavorite(productId);
  }

  // Método para añadir un diseñador a favoritos (necesita lógica en FavoriteService)
  addFavoriteDesigner(designerName: string): void {
     // TODO: Implementar lógica para añadir diseñador a favoritos en FavoriteService
     console.log('Añadir diseñador a favoritos:', designerName);
     // Podrías tener un método addFavoriteDesigner en FavoriteService
     // this.favoriteService.addFavoriteDesigner(designerName);
  }

  // Método para alternar la expansión de un filtro
  toggleFilter(filterName: string): void {
    this.filterStates[filterName] = !this.filterStates[filterName];
  }

  // Método para verificar si un filtro está expandido
  isFilterExpanded(filterName: string): boolean {
    return !!this.filterStates[filterName];
  }

   // Función helper para calcular "hace cuánto tiempo"
   getTimeAgo(date: Date): string {
     const now = new Date();
     const seconds = Math.round(Math.abs((now.getTime() - date.getTime()) / 1000));
     const minutes = Math.round(seconds / 60);
     const hours = Math.round(minutes / 60);
     const days = Math.round(hours / 24);
     const weeks = Math.round(days / 7);
     const months = Math.round(days / 30.4);
     const years = Math.round(days / 365);

     if (seconds < 60) return seconds + ' seconds ago';
     else if (minutes < 60) return minutes + ' minutes ago';
     else if (hours < 24) return hours + ' hours ago';
     else if (days < 7) return days + ' days ago';
     else if (weeks < 4) return weeks + ' weeks ago';
     else if (months < 12) return months + ' months ago';
     else return years + ' years ago';
   }
} 