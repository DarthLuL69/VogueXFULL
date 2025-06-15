import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services';
import { FavoriteService } from '../../../shared/services';
import { AuthService } from '../../../shared/services/auth.service';
import { ChatService } from '../../../shared/services/chat.service';
import { Subject, takeUntil } from 'rxjs';

export interface ProductDetail {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: number;
  main_category: string;
  sub_category: string;
  final_category: string;
  size: string;
  condition: string;
  images: string[];
  user: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  is_favorite?: boolean;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: ProductDetail | null = null;
  selectedImageIndex = 0;
  loading = true;
  error: string | null = null;
  relatedProducts: any[] = [];
  isAuthenticated = false;
  
  // Chat and Offer properties
  contacting = false;
  showOfferModal = false;
  offerAmount: number | null = null;
  offerMessage = '';
  sendingOffer = false;
  
  private readonly destroy$ = new Subject<void>();
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly apiService: ApiService,
    private readonly favoriteService: FavoriteService,
    private readonly authService: AuthService,
    private readonly chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    
    this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }  loadProduct(id: string): void {
    console.log('Loading product with ID:', id);
    this.loading = true;
    this.error = null;

    this.apiService.getProduct(Number(id)).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        console.log('Product API response:', response);
        if (response.success && response.data) {
          this.product = {
            ...response.data,
            images: response.data.images ? response.data.images.map((img: string) => {
              if (img.startsWith('http')) {
                return img;
              }
              return `http://localhost:8000/storage/${img}`;
            }) : []
          };
          console.log('Product processed:', this.product);
          this.loadRelatedProducts();
        } else {
          this.error = 'Producto no encontrado';
        }        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading product:', error);
        this.error = 'Error al cargar el producto';
        this.loading = false;
      }
    });
  }  loadRelatedProducts(): void {
    // Deshabilitado temporalmente para mejorar el rendimiento
    console.log('Related products loading disabled for performance testing');
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }
  toggleFavorite(): void {
    if (!this.product || !this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }    const productForFavorites = {
      id: this.product.id,
      name: this.product.name,
      price: this.product.price,
      imageUrl: this.product.images[0] || ''
    };

    if (this.product.is_favorite) {
      this.favoriteService.removeFavorite(this.product.id);
      this.product.is_favorite = false;
    } else {
      this.favoriteService.addFavorite(productForFavorites);
      this.product.is_favorite = true;
    }
  }

  goToUserProfile(): void {
    if (this.product?.user?.id) {
      this.router.navigate(['/user', this.product.user.id]);
    }
  }
  goToShop(category?: string, subcategory?: string): void {
    const queryParams: any = {};
    if (category) queryParams.category = category;
    if (subcategory) queryParams.subcategory = subcategory;
    
    this.router.navigate(['/shop'], { queryParams });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getConditionColor(condition: string): string {
    switch (condition.toLowerCase()) {
      case 'nuevo':
      case 'new':
        return 'text-green-600';
      case 'como nuevo':
      case 'like new':
        return 'text-blue-600';
      case 'excelente':
      case 'excellent':
        return 'text-indigo-600';
      case 'muy bueno':
      case 'very good':
        return 'text-purple-600';
      case 'bueno':
      case 'good':
        return 'text-orange-600';
      case 'aceptable':
      case 'fair':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }
  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/400x400?text=Imagen+no+disponible';
  }
  // Chat and Offer methods
  contactSeller(): void {
    if (!this.product || !this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    this.contacting = true;

    // Use ChatService to create chat
    this.chatService.createChat(this.product.id, this.product.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            // Navigate to chat
            this.router.navigate(['/chats', response.data.id]);
          }
          this.contacting = false;
        },
        error: (error: any) => {
          console.error('Error creating chat:', error);
          this.contacting = false;
          alert('Error al crear el chat. Inténtalo de nuevo.');
        }
      });
  }
  sendOffer(): void {
    if (!this.product || !this.isAuthenticated || !this.offerAmount) {
      return;
    }

    this.sendingOffer = true;

    // Create chat first, then send offer
    this.chatService.createChat(this.product.id, this.product.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (chatResponse: any) => {
          if (chatResponse.success) {
            // Now send the offer using ApiService
            this.apiService.createOffer({
              chat_id: chatResponse.data.id,
              product_id: this.product!.id,
              amount: this.offerAmount,
              message: this.offerMessage
            }).pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (offerResponse: any) => {
                if (offerResponse.success) {
                  this.showOfferModal = false;
                  this.offerAmount = null;
                  this.offerMessage = '';
                  // Navigate to chat to see the offer
                  this.router.navigate(['/chats', chatResponse.data.id]);
                }
                this.sendingOffer = false;
              },
              error: (error: any) => {
                console.error('Error creating offer:', error);
                this.sendingOffer = false;
                alert('Error al enviar la oferta. Inténtalo de nuevo.');
              }
            });
          }
        },
        error: (error: any) => {
          console.error('Error creating chat for offer:', error);
          this.sendingOffer = false;
          alert('Error al crear el chat. Inténtalo de nuevo.');
        }
      });
  }
}
