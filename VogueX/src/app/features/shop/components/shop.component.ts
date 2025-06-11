import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FavoriteService } from '../../../shared/services';
import { GrailedApiService } from '../../../shared/services';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './shop.component.html',
  styles: []
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

   onCategoryChange(category: string, event: any): void {
      if (event.target.checked) {
        this.selectedCategory = category;
        // Aquí podrías recargar productos según la categoría si lo deseas
      } else {
        this.selectedCategory = null;
      }
    }
} 
