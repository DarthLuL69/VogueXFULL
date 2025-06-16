import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FavoriteService } from '../../../shared/services';
import { ApiService } from '../../../core/services';
import { DesignersService, Designer } from '../../../shared/services';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './shop.component.html',
  styles: [`
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
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
  filteredProducts: any[] = [];
  allProducts: any[] = [];

  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedSizes: string[] = [];
  showOfferModal: boolean = false;
  selectedProduct: any = null;
  offerAmount: number | null = null;
  offerMessage: string = '';
  isSubmittingOffer: boolean = false;

  Object = Object;
  
  // Estructura de categorías basada en el header
  categoryStructure: { [key: string]: { [key: string]: string[] } } = {
    menswear: {
      tops: ['T-Shirts', 'Shirts', 'Hoodies', 'Sweaters', 'Polos', 'Tank Tops'],
      bottoms: ['Jeans', 'Pants', 'Shorts', 'Joggers', 'Chinos'],
      outerwear: ['Jackets', 'Coats', 'Blazers', 'Vests', 'Bombers', 'Parkas'],
      footwear: ['Sneakers', 'Boots', 'Dress Shoes', 'Casual Shoes', 'Sandals'],
      accessories: ['Belts', 'Watches', 'Jewelry', 'Hats', 'Bags'],
      tailoring: ['Suits', 'Blazers', 'Dress Shirts', 'Trousers', 'Vests']
    },
    womenswear: {
      tops: ['Blouses', 'T-Shirts', 'Sweaters', 'Tank Tops', 'Crop Tops'],
      bottoms: ['Jeans', 'Skirts', 'Pants', 'Shorts', 'Leggings'],
      outerwear: ['Jackets', 'Coats', 'Cardigans', 'Blazers', 'Vests'],
      footwear: ['Sneakers', 'Boots', 'Heels', 'Flats', 'Sandals'],
      accessories: ['Bags', 'Jewelry', 'Scarves', 'Belts', 'Sunglasses'],
      bags: ['Handbags', 'Backpacks', 'Clutches', 'Tote Bags', 'Crossbody']
    },
    sneakers: {
      sneakers: ['Low Top Sneakers', 'High Top Sneakers', 'Mid Top Sneakers', 'Slip-On Sneakers', 'Running Shoes', 'Basketball Shoes'],
      boots: ['Ankle Boots', 'Combat Boots', 'Chelsea Boots', 'Work Boots', 'Hiking Boots', 'Desert Boots'],
      casual: ['Loafers', 'Moccasins', 'Boat Shoes', 'Espadrilles', 'Canvas Shoes'],
      sandals: ['Flip Flops', 'Slides', 'Sport Sandals', 'Dress Sandals'],
      formal: ['Oxford Shoes', 'Derby Shoes', 'Brogues', 'Monk Straps', 'Dress Boots']
    }
  };

  // Sistema de tallas por categoría
  sizeMappings: { [key: string]: string[] } = {
    't-shirts': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'shirts': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'polos': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'sweaters': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'hoodies': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'blouses': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'tank-tops': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'crop-tops': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    
    'jeans': ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'pants': ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'shorts': ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'joggers': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'chinos': ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48'],
    'skirts': ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'leggings': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    
    'sneakers': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'boots': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'dress-shoes': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'casual-shoes': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'sandals': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'heels': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'flats': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    
    'low-top-sneakers': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'high-top-sneakers': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'mid-top-sneakers': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'slip-on-sneakers': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'running-shoes': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'basketball-shoes': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    
    'jackets': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'coats': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'blazers': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'vests': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'bombers': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'parkas': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'cardigans': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],

    'suits': ['36', '38', '40', '42', '44', '46', '48', '50', '52', '54'],
    'dress-shirts': ['14', '14.5', '15', '15.5', '16', '16.5', '17', '17.5', '18'],
    'trousers': ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48'],

    'belts': ['S', 'M', 'L', 'XL', '85', '90', '95', '100', '105', '110'],
    'watches': ['One Size'],
    'jewelry': ['One Size'],
    'hats': ['S', 'M', 'L', 'XL'],
    'sunglasses': ['One Size'],
    'scarves': ['One Size'],
    
    'handbags': ['One Size'],
    'backpacks': ['One Size'],
    'clutches': ['One Size'],
    'tote-bags': ['One Size'],
    'crossbody': ['One Size'],
    'bags': ['One Size']
  };

  designerSearchControl = new FormControl();
  designerSuggestions: Designer[] = [];
  selectedDesigners: string[] = [];
  showDesignerSuggestions = false;
  private destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute, 
    private readonly router: Router,
    private readonly favoriteService: FavoriteService, 
    private readonly apiService: ApiService,
    private readonly designersService: DesignersService
  ) {
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
        this.designerSuggestions = designers.slice(0, 10);
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

      this.loadLocalProducts({ 
        category: this.selectedCategory, 
        subcategory: this.selectedSubcategory, 
        search: searchTerm,
        designer: designerFilter 
      });

      console.log('Search completed for:', searchTerm);

      this.designers = [
        'Supreme', 'Off-White', 'Stone Island', 'Nike', 'Adidas', 'Balenciaga',
        'Gucci', 'Louis Vuitton', 'Prada', 'Versace', 'Armani', 'Dolce & Gabbana'
      ];
      console.log('Using static designers list:', this.designers);
    });
  }

  private loadLocalProducts(filters: any): void {
    this.apiService.getProducts(filters).subscribe({
      next: (response: any) => {
        console.log('Local products response:', response);
        if (response && response.success && response.data) {
          this.allProducts = response.data.map((product: any) => ({            
            id: product.id,
            name: product.name,
            brand: product.brand || 'Sin marca',
            imageUrl: this.getProductImageUrl(product),
            images: product.images || [],
            price: product.price,
            timeAgo: product.created_at ? this.getTimeAgo(new Date(product.created_at)) : 'Recién subido',
            originalPrice: product.original_price || undefined,
            size: product.size || undefined,
            condition: product.condition,
            source: 'local',
            user: product.user || null,
            userName: product.user ? product.user.name : 'Anonymous user'
          }));
          
          this.applyAllFilters();
          console.log('Local products processed:', this.allProducts);
        } else {
          this.allProducts = [];
          this.products = [];
        }
      },
      error: (error: any) => {
        console.error('Error loading local products:', error);
        this.allProducts = [];
        this.products = [];
      }
    });
  }

  private getProductImageUrl(product: any): string {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      let imagePath = product.images[0];
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      return `http://localhost:8000/storage/${imagePath}`;
    }    
    
    if (product.image_url) {
      let imagePath = product.image_url;
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      return `http://localhost:8000/storage/${imagePath}`;
    }
    
    return '/assets/images/no-image-available.png';
  }
  
  getProductImage(product: any): string {
    if (product.source === 'local') {
      return product.imageUrl;
    } else if (product.source === 'grailed' && product.imageUrl) {
      return product.imageUrl;
    }
    return '/assets/images/no-image-available.png';
  }

  getProductSecondaryImage(product: any): string {
    if (product.source === 'local' && product.images && Array.isArray(product.images) && product.images.length > 1) {
      let imagePath = product.images[1];
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      return `http://localhost:8000/storage/${imagePath}`;
    }
    
    return this.getProductImage(product);
  }
  
  hasMultipleImages(product: any): boolean {
    return product.source === 'local' && product.images && Array.isArray(product.images) && product.images.length > 1;
  }

  onImageError(event: Event): void {
    console.log('Error loading image');
    const target = event.target as HTMLImageElement;
    if (target) {
      if (target.src.includes('no-image-available.png')) {
        console.warn('Already showing error image');
        return;
      }      
      
      target.src = '/assets/images/no-image-available.png';
      
      target.onerror = () => {
        console.error('Error also loading fallback image');
        target.style.display = 'none';
      };
    }
  }

  viewOnGrailed(product: any): void {
    if (product.grailedUrl) {
      window.open(product.grailedUrl, '_blank');
    } else {
      alert('Grailed URL not available');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleFavorite(product: any): void {
    if (this.favoriteService.isFavorite(product.id)) {
      this.favoriteService.removeFavorite(product.id);
    } else {
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

  isFavorite(productId: number): boolean {
    return this.favoriteService.isFavorite(productId);
  }

  addFavoriteDesigner(designerName: string): void {
     console.log('Add designer to favorites:', designerName);
  }

  toggleFilter(filterName: string): void {
    this.filterStates[filterName] = !this.filterStates[filterName];
  }

  isFilterExpanded(filterName: string): boolean {
    return !!this.filterStates[filterName];
  }

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
        this.selectedSubcategory = null;
      } else {
        this.selectedCategory = null;
        this.selectedSubcategory = null;
      }
      
      this.applyAllFilters();
    }

    onSubcategoryChange(subcategory: string, event: any): void {
      if (event.target.checked) {
        this.selectedSubcategory = this.formatSubcategoryForUrl(subcategory);
      } else {
        this.selectedSubcategory = null;
      }
      
      this.applyAllFilters();
    }

    formatSubcategoryForUrl(subcategory: string): string {
      return subcategory.toLowerCase().replace(/\s+/g, '-');
    }

    isSubcategorySelected(subcategory: string): boolean {
      return this.selectedSubcategory === this.formatSubcategoryForUrl(subcategory);
    }

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

  getAvailableSizes(): string[] {
    if (!this.selectedSubcategory) {
      return this.getDefaultSizesByCategory();
    }

    const subcategoryKey = this.selectedSubcategory.replace(/-/g, ' ').toLowerCase();
    return this.sizeMappings[subcategoryKey] || this.getDefaultSizesByCategory();
  }

  private getDefaultSizesByCategory(): string[] {
    switch (this.selectedCategory) {
      case 'menswear':
      case 'womenswear':
        return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      case 'sneakers':
        return ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
      default:
        return [];
    }
  }

  hasSizesAvailable(): boolean {
    return this.getAvailableSizes().length > 0;
  }

  getSizeType(): string {
    if (!this.selectedSubcategory) {
      return 'general';
    }

    const subcategoryKey = this.selectedSubcategory.replace(/-/g, ' ').toLowerCase();
    const sizes = this.sizeMappings[subcategoryKey] || [];
    
    if (sizes.includes('36') || sizes.includes('37')) {
      return 'shoe';
    } else if (sizes.includes('28') || sizes.includes('30')) {
      return 'waist';
    } else {
      return 'clothing';
    }
  }

  private applyAllFilters(): void {
    this.filteredProducts = this.allProducts.filter(product => {
      // Filtro por categoría
      if (this.selectedCategory && product.category !== this.selectedCategory) {
        return false;
      }

      // Filtro por subcategoría
      if (this.selectedSubcategory && product.subcategory !== this.selectedSubcategory) {
        return false;
      }

      // Filtro por tallas seleccionadas
      if (this.selectedSizes.length > 0 && !this.selectedSizes.includes(product.size)) {
        return false;
      }

      // Filtro por rango de precios
      if (this.minPrice !== null && product.price < this.minPrice) {
        return false;
      }
      if (this.maxPrice !== null && product.price > this.maxPrice) {
        return false;
      }

      // Filtro por diseñadores seleccionados
      if (this.selectedDesigners.length > 0 && !this.selectedDesigners.includes(product.brand)) {
        return false;
      }

      return true;
    });

    this.products = this.filteredProducts;
  }

  onDesignerSearchFocus(): void {
    if (this.designerSuggestions.length > 0) {
      this.showDesignerSuggestions = true;
    }
  }

  onDesignerSearchBlur(): void {
    setTimeout(() => {
      this.showDesignerSuggestions = false;
    }, 200);
  }

  // Missing methods for size filtering
  isSizeSelected(size: string): boolean {
    return this.selectedSizes.includes(size);
  }

  onSizeFilterChange(size: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      if (!this.selectedSizes.includes(size)) {
        this.selectedSizes.push(size);
      }
    } else {
      this.selectedSizes = this.selectedSizes.filter(s => s !== size);
    }
    this.applyAllFilters();
  }

  // Missing methods for designer filtering
  removeSelectedDesigner(designer: string): void {
    this.selectedDesigners = this.selectedDesigners.filter(d => d !== designer);
    this.applyAllFilters();
  }
  isDesignerSelected(designer: string): boolean {
    return this.selectedDesigners.includes(designer);
  }

  onDesignerCheckboxChange(designer: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      if (!this.selectedDesigners.includes(designer)) {
        this.selectedDesigners.push(designer);
      }
    } else {
      this.selectedDesigners = this.selectedDesigners.filter(d => d !== designer);
    }
    this.applyAllFilters();
  }

  // Missing methods for price filtering
  onPriceFilterChange(type: 'min' | 'max', event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value ? parseFloat(target.value) : null;
    
    if (type === 'min') {
      this.minPrice = value;
    } else {
      this.maxPrice = value;
    }
    
    this.applyAllFilters();
  }

  // Missing methods for offer modal
  sendOffer(product: any): void {
    this.selectedProduct = product;
    this.showOfferModal = true;
    this.offerAmount = null;
    this.offerMessage = '';
  }

  closeOfferModal(): void {
    this.showOfferModal = false;
    this.selectedProduct = null;
    this.offerAmount = null;
    this.offerMessage = '';
    this.isSubmittingOffer = false;
  }

  submitOffer(): void {
    if (!this.selectedProduct || !this.offerAmount) {
      return;
    }

    this.isSubmittingOffer = true;
    
    // Simulate API call for offer submission
    setTimeout(() => {
      console.log('Offer submitted:', {
        product: this.selectedProduct,
        amount: this.offerAmount,
        message: this.offerMessage
      });
      
      // You would typically call an API service here
      // this.apiService.submitOffer(this.selectedProduct.id, this.offerAmount, this.offerMessage)
      
      this.closeOfferModal();
      // Show success message
      alert('Oferta enviada correctamente');
    }, 1000);
  }

  selectDesigner(designer: Designer): void {
    this.designerSearchControl.setValue(designer.name);
    if (!this.selectedDesigners.includes(designer.name)) {
      this.selectedDesigners.push(designer.name);
    }
    this.showDesignerSuggestions = false;
    this.applyAllFilters();
  }
}
