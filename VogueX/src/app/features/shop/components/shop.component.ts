import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FavoriteService } from '../../../shared/services';
import { GrailedApiService } from '../../../shared/services';
import { ApiService } from '../../../core/services';
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
      sneakers: ['Low Top Sneakers', 'High Top Sneakers', 'Mid Top Sneakers', 'Slip-On Sneakers', 'Running Shoes', 'Basketball Shoes'],
      boots: ['Ankle Boots', 'Combat Boots', 'Chelsea Boots', 'Work Boots', 'Hiking Boots', 'Desert Boots'],
      casual: ['Loafers', 'Moccasins', 'Boat Shoes', 'Espadrilles', 'Canvas Shoes'],
      sandals: ['Flip Flops', 'Slides', 'Sport Sandals', 'Dress Sandals'],
      formal: ['Oxford Shoes', 'Derby Shoes', 'Brogues', 'Monk Straps', 'Dress Boots']
    }
  };

  // Sistema de tallas actualizado para coincidir con sell
  sizeMappings: { [key: string]: string[] } = {
    // Ropa superior
    't-shirts': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'shirts': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'polos': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'sweaters': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'hoodies': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'blouses': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'tank-tops': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    
    // Ropa inferior
    'jeans': ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'pants': ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'shorts': ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'joggers': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'skirts': ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    
    // Calzado - todas las subcategorías específicas
    'low-top-sneakers': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'high-top-sneakers': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'mid-top-sneakers': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'slip-on-sneakers': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'running-shoes': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'basketball-shoes': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'ankle-boots': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'combat-boots': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'chelsea-boots': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'work-boots': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'hiking-boots': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'desert-boots': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'loafers': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'moccasins': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'boat-shoes': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'espadrilles': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'canvas-shoes': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'flip-flops': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'slides': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'sport-sandals': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'dress-sandals': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'oxford-shoes': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'derby-shoes': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'brogues': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'monk-straps': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'dress-boots': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    
    // Abrigos y chaquetas
    'jackets': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'coats': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'blazers': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'vests': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'cardigans': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],

    // Vestidos
    'casual-dresses': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'evening-dresses': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'maxi-dresses': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],

    // Accesorios
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
    private grailedApiService: GrailedApiService,
    private apiService: ApiService,
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
      const designerFilter = params['designer'] || null;

      console.log('Categoría seleccionada:', this.selectedCategory);
      console.log('Subcategoría seleccionada:', this.selectedSubcategory);
      console.log('Término de búsqueda:', searchTerm);
      console.log('Filtro de diseñador:', designerFilter);

      // Cargar productos de nuestra API local primero
      this.loadLocalProducts({ 
        category: this.selectedCategory, 
        subcategory: this.selectedSubcategory, 
        search: searchTerm,
        designer: designerFilter 
      });

      // También buscar en Grailed API si hay término de búsqueda
      if (searchTerm) {
        this.grailedApiService.search(searchTerm).subscribe(results => {
          if (results && results.hits) {
            const grailedProducts = results.hits.map((hit: any) => ({
              id: `grailed_${hit.id}`,
              name: hit.name || hit.title,
              imageUrl: hit.image_url || hit.photo_url,
              price: hit.price,
              timeAgo: hit.listed_at ? this.getTimeAgo(new Date(hit.listed_at * 1000)) : '',
              originalPrice: hit.original_price || undefined,
              size: hit.size || undefined,
              source: 'grailed'
            }));
            
            // Combinar productos locales con Grailed
            this.products = [...this.products, ...grailedProducts];
          }
          console.log('Combined products:', this.products);
        });
      }

      this.grailedApiService.search('', 1, 50, 'mostrecent').subscribe(results => {
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

  private loadLocalProducts(filters: any): void {
    this.apiService.getProducts(filters).subscribe({
      next: (response: any) => {
        console.log('Local products response:', response);
        if (response && response.success && response.data) {
          this.products = response.data.map((product: any) => ({
            id: product.id,
            name: product.name,
            brand: product.brand || 'Sin marca',
            imageUrl: this.getProductImageUrl(product),
            price: product.price,
            timeAgo: product.created_at ? this.getTimeAgo(new Date(product.created_at)) : 'Recién subido',
            originalPrice: product.original_price || undefined,
            size: product.size || undefined,
            condition: product.condition,
            source: 'local'
          }));
          console.log('Productos locales procesados:', this.products);
        } else {
          this.products = [];
        }
      },
      error: (error: any) => {
        console.error('Error loading local products:', error);
        this.products = [];
      }
    });
  }

  private getProductImageUrl(product: any): string {
    // Si tiene imágenes en array, usar la primera
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return `http://localhost:8000/storage/${product.images[0]}`;
    }
    
    // Si tiene image_url, usarla
    if (product.image_url) {
      return `http://localhost:8000/storage/${product.image_url}`;
    }
    
    // Imagen por defecto
    return 'https://via.placeholder.com/300x300?text=No+Image';
  }

  getProductImage(product: any): string {
    if (product.source === 'local') {
      return product.imageUrl;
    } else if (product.source === 'grailed' && product.imageUrl) {
      return product.imageUrl;
    }
    return 'https://via.placeholder.com/300x300?text=No+Image';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'https://via.placeholder.com/300x300?text=No+Image';
    }
  }

  sendOffer(product: any): void {
    // Placeholder para funcionalidad de ofertas
    alert(`Función de ofertas no disponible aún para: ${product.name}\nMarca: ${product.brand}\nPrecio: €${product.price}`);
    console.log('Enviar oferta para producto:', product);
  }

  viewOnGrailed(product: any): void {
    // Abrir producto en Grailed
    if (product.grailedUrl) {
      window.open(product.grailedUrl, '_blank');
    } else {
      alert('URL de Grailed no disponible');
    }
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
    this.grailedApiService.search(designerQuery).subscribe(results => {
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
