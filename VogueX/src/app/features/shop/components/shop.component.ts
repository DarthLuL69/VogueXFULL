import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FavoriteService } from '../../../shared/services';
import { GrailedApiService } from '../../../shared/services';
import { DesignersService, Designer } from '../../../shared/services';
import { HttpClientModule } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, ReactiveFormsModule],
  templateUrl: './shop.component.html',
  styles: []
})
export class ShopComponent implements OnInit, OnDestroy {
  selectedCategory: string | null = null;
  selectedSubcategory: string | null = null;
  designers: string[] = [];
  filterStates: { [key: string]: boolean } = {
    department: true,
    category: true,
    size: true,
    designers: true,
    price: true
  };

  products: any[] = [];

  // Hacer Object disponible en el template
  Object = Object;

  // Categorías organizadas según los dropdowns del header
  categoryStructure: { [key: string]: { [key: string]: string[] } } = {
    menswear: {
      tops: ['T-Shirts', 'Shirts', 'Hoodies', 'Sweaters', 'Polos'],
      bottoms: ['Jeans', 'Pants', 'Shorts', 'Joggers'],
      outerwear: ['Jackets', 'Coats', 'Blazers', 'Vests'],
      accessories: ['Belts', 'Watches', 'Bags', 'Hats']
    },
    womenswear: {
      tops: ['Blouses', 'T-Shirts', 'Sweaters', 'Tank Tops'],
      bottoms: ['Jeans', 'Skirts', 'Pants', 'Shorts'],
      dresses: ['Casual Dresses', 'Evening Dresses', 'Maxi Dresses'],
      outerwear: ['Jackets', 'Coats', 'Cardigans'],
      accessories: ['Bags', 'Jewelry', 'Scarves', 'Belts']
    },
    sneakers: {
      style: ['Low Top', 'High Top', 'Mid Top', 'Slip-On'],
      type: ['Running', 'Basketball', 'Lifestyle', 'Skateboarding'],
      brand: ['Nike', 'Adidas', 'Jordan', 'Converse', 'Vans']
    }
  };

  // Sistema de tallas (copiado del componente sell)
  sizeMappings: { [key: string]: string[] } = {
    // Ropa superior
    'tshirts': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'shirts': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'polos': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'sweaters': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'hoodies': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'blouses': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'tank tops': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    
    // Ropa inferior - incluye tanto tallas numéricas como letras
    'jeans': ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'pants': ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'shorts': ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'joggers': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'skirts': ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    
    // Calzado
    'low top': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'high top': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'mid top': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'slip-on': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'running': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'basketball': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'lifestyle': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'skateboarding': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    
    // Abrigos y chaquetas
    'jackets': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'coats': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'blazers': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'vests': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'cardigans': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],

    // Vestidos
    'casual dresses': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'evening dresses': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'maxi dresses': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],

    // Accesorios (talla única o rangos específicos)
    'belts': ['S', 'M', 'L', 'XL'],
    'watches': ['One Size'],
    'bags': ['One Size'],
    'hats': ['S', 'M', 'L', 'XL'],
    'jewelry': ['One Size'],
    'scarves': ['One Size']
  };

  // Designer search functionality
  designerSearchControl = new FormControl();
  designerSuggestions: Designer[] = [];
  selectedDesigners: string[] = [];
  showDesignerSuggestions = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute, 
    private favoriteService: FavoriteService, 
    private apiService: GrailedApiService,
    private designersService: DesignersService
  ) { 
    // Setup designer search autocomplete
    this.designerSearchControl.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query && query.length >= 2) {
          return this.designersService.searchDesigners(query);
        } else {
          this.designerSuggestions = [];
          this.showDesignerSuggestions = false;
          return [];
        }
      })
    ).subscribe({
      next: (designers) => {
        this.designerSuggestions = designers.slice(0, 10); // Limitar a 10 sugerencias
        this.showDesignerSuggestions = this.designerSuggestions.length > 0;
      },
      error: (error) => {
        console.error('Error searching designers:', error);
        this.designerSuggestions = [];
        this.showDesignerSuggestions = false;
      }
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || null;
      this.selectedSubcategory = params['subcategory'] || null;
      const searchTerm = params['search'] || null;

      console.log('Categoría seleccionada:', this.selectedCategory);
      console.log('Subcategoría seleccionada:', this.selectedSubcategory);
      console.log('Término de búsqueda:', searchTerm);

      if (searchTerm) {
        this.apiService.search(searchTerm).subscribe(results => {
           if (results && results.hits) {
             this.products = results.hits.map((hit: any) => ({
               id: hit.id,
               name: hit.name || hit.title,
               imageUrl: hit.image_url || hit.photo_url,
               price: hit.price,
               timeAgo: hit.listed_at ? this.getTimeAgo(new Date(hit.listed_at * 1000)) : '',
               originalPrice: hit.original_price || undefined,
               size: hit.size || undefined,
             }));
           } else {
             this.products = [];
           }
          console.log('API Search Results for Products:', this.products);
        });
      } else if (this.selectedCategory) {
        console.log('Implementar búsqueda por categoría si es necesario.');
         this.products = [];
      } else {
        console.log('Implementar carga de productos por defecto o mensaje.');
         this.products = [];
      }

      this.apiService.search('', 1, 50, 'mostrecent').subscribe(results => {
        console.log('API Search Results for Designers (initial load):', results);
         if (results && results.hits && results.hits.length > 0) {
            const extractedDesigners = results.hits
              .map((hit: any) => hit.designer || hit.brand)
              .filter((designer: any) => designer)
              .reduce((unique: string[], item: string) => unique.includes(item) ? unique : [...unique, item], []);
            this.designers = extractedDesigners;
         }
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
        this.selectedSubcategory = null; // Reset subcategory when main category changes
        // Aquí podrías recargar productos según la categoría si lo deseas
      } else {
        this.selectedCategory = null;
        this.selectedSubcategory = null;
      }
    }

    onSubcategoryChange(subcategory: string, event: any): void {
      if (event.target.checked) {
        this.selectedSubcategory = this.formatSubcategoryForUrl(subcategory);
      } else {
        this.selectedSubcategory = null;
      }
    }

    // Helper method to format subcategory for URL
    formatSubcategoryForUrl(subcategory: string): string {
      return subcategory.toLowerCase().replace(/\s+/g, '-');
    }

    // Helper method to check if subcategory is selected
    isSubcategorySelected(subcategory: string): boolean {
      return this.selectedSubcategory === this.formatSubcategoryForUrl(subcategory);
    }

    // Métodos helper para obtener las subcategorías disponibles
    getAvailableSubcategories(): string[] {
      if (!this.selectedCategory || !this.categoryStructure[this.selectedCategory]) {
        return [];
      }

      const categoryData = this.categoryStructure[this.selectedCategory];
      const allSubcategories: string[] = [];

      Object.values(categoryData).forEach(subcategoryList => {
        allSubcategories.push(...subcategoryList);
      });

      return allSubcategories;
    }

    getCategoryGroups(): { [key: string]: string[] } {
      if (!this.selectedCategory || !this.categoryStructure[this.selectedCategory]) {
        return {};
      }

      return this.categoryStructure[this.selectedCategory];
    }

  // Método para obtener las tallas disponibles según la subcategoría seleccionada
  getAvailableSizes(): string[] {
    if (!this.selectedSubcategory) {
      // Si no hay subcategoría, mostrar tallas generales según la categoría principal
      return this.getDefaultSizesByCategory();
    }

    // Convertir subcategoría a formato de key para sizeMappings
    const subcategoryKey = this.selectedSubcategory.replace(/-/g, ' ').toLowerCase();
    return this.sizeMappings[subcategoryKey] || this.getDefaultSizesByCategory();
  }

  // Método para obtener tallas por defecto según la categoría principal
  private getDefaultSizesByCategory(): string[] {
    switch (this.selectedCategory) {
      case 'menswear':
      case 'womenswear':
        return ['XS', 'S', 'M', 'L', 'XL', 'XXL']; // Tallas de ropa general
      case 'sneakers':
        return ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']; // Tallas de calzado
      default:
        return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    }
  }

  // Método para verificar si hay tallas disponibles
  hasSizesAvailable(): boolean {
    return this.getAvailableSizes().length > 0;
  }

  // Método para obtener el tipo de talla (ropa, calzado, etc.)
  getSizeType(): string {
    if (!this.selectedSubcategory) {
      if (this.selectedCategory === 'sneakers') return 'EU Shoe Sizes';
      return 'Clothing Sizes';
    }

    const subcategoryKey = this.selectedSubcategory.replace(/-/g, ' ').toLowerCase();
    const sizes = this.sizeMappings[subcategoryKey] || [];
    
    if (sizes.includes('36') || sizes.includes('37')) return 'EU Shoe Sizes';
    if (sizes.includes('28') && sizes.includes('XS')) return 'Waist Sizes & Letter Sizes';
    if (sizes.includes('28') || sizes.includes('30')) return 'Waist Sizes (inches)';
    if (sizes.includes('One Size')) return 'One Size';
    return 'Clothing Sizes';
  }

  // Designer search methods
  onDesignerSearchFocus(): void {
    if (this.designerSuggestions.length > 0) {
      this.showDesignerSuggestions = true;
    }
  }

  onDesignerSearchBlur(): void {
    // Delay hiding to allow clicks on suggestions
    setTimeout(() => {
      this.showDesignerSuggestions = false;
    }, 200);
  }

  selectDesigner(designer: Designer): void {
    if (!this.selectedDesigners.includes(designer.name)) {
      this.selectedDesigners.push(designer.name);
      this.applyDesignerFilter();
    }
    
    this.designerSearchControl.setValue('');
    this.showDesignerSuggestions = false;
  }

  removeSelectedDesigner(designerName: string): void {
    this.selectedDesigners = this.selectedDesigners.filter(name => name !== designerName);
    this.applyDesignerFilter();
  }

  private applyDesignerFilter(): void {
    // Aquí puedes implementar la lógica para filtrar productos por diseñadores seleccionados
    console.log('Filtering by designers:', this.selectedDesigners);
    
    // Si quieres hacer una nueva búsqueda con los diseñadores seleccionados
    if (this.selectedDesigners.length > 0) {
      const designerQuery = this.selectedDesigners.join(' OR ');
      this.searchProductsByDesigners(designerQuery);
    }
  }

  private searchProductsByDesigners(designerQuery: string): void {
    this.apiService.search(designerQuery).subscribe(results => {
      if (results && results.hits) {
        // Filtrar productos que coincidan con los diseñadores seleccionados
        const filteredProducts = results.hits.filter((hit: any) => {
          const productDesigner = hit.designer?.name || hit.brand;
          return productDesigner && this.selectedDesigners.some(selectedDesigner => 
            productDesigner.toLowerCase().includes(selectedDesigner.toLowerCase())
          );
        });

        this.products = filteredProducts.map((hit: any) => ({
          id: hit.id,
          name: hit.name || hit.title,
          imageUrl: hit.image_url || hit.photo_url,
          price: hit.price,
          timeAgo: hit.listed_at ? this.getTimeAgo(new Date(hit.listed_at * 1000)) : '',
          originalPrice: hit.original_price || undefined,
          size: hit.size || undefined,
        }));
      }
    });
  }

  // Check if designer is selected
  isDesignerSelected(designerName: string): boolean {
    return this.selectedDesigners.includes(designerName);
  }

  // Handle designer checkbox change
  onDesignerCheckboxChange(designerName: string, event: any): void {
    if (event.target.checked) {
      if (!this.selectedDesigners.includes(designerName)) {
        this.selectedDesigners.push(designerName);
        this.applyDesignerFilter();
      }
    } else {
      this.removeSelectedDesigner(designerName);
    }
  }
}
