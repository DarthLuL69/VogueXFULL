import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NewsService, NewsItem } from '../../../shared/services/news.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styles: []
})
export class HomeComponent implements OnInit, OnDestroy {
  newsItems: NewsItem[] = [];
  currentSlide = 0;
  private slideInterval: any;  menswear = [
    { name: 'Tops', img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=500&fit=crop&crop=center&q=80', category: 'tops' },
    { name: 'Bottoms', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop&crop=center&q=80', category: 'bottoms' },
    { name: 'Outerwear', img: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=500&fit=crop&crop=center&q=80', category: 'outerwear' },
    { name: 'Footwear', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop&crop=center&q=80', category: 'footwear' },
    { name: 'Accessories', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop&crop=center&q=80', category: 'accessories' },
    { name: 'Tailoring', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop&crop=center&q=80', category: 'tailoring' },
  ];  womenswear = [
    { name: 'Tops', img: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&h=500&fit=crop&crop=center&q=80', category: 'tops' },
    { name: 'Bottoms', img: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop&crop=center&q=80', category: 'bottoms' },
    { name: 'Outerwear', img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&crop=center&q=80', category: 'outerwear' },
    { name: 'Footwear', img: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=500&fit=crop&crop=center&q=80', category: 'footwear' },
    { name: 'Accessories', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=500&fit=crop&crop=center&q=80', category: 'accessories' },
    { name: 'Bags', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop&crop=center&q=80', category: 'bags' },
  ];
  constructor(
    private readonly newsService: NewsService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.loadLatestNews();
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  startAutoSlide(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.newsItems.length;
  }

  prevSlide(): void {
    this.currentSlide = this.currentSlide === 0 ? this.newsItems.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }
  openNewsLink(url: string): void {
    window.open(url, '_blank');
  }

  loadLatestNews(): void {
    this.newsService.getLatestNews().subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          this.newsItems = response.data.map((item, index) => ({
            ...item,
            id: index + 1
          }));
        } else {
          this.loadFallbackNews();
        }
      },
      error: (error) => {
        console.error('Error loading news:', error);
        this.loadFallbackNews();
      }
    });
  }

  // Función para navegar al shop con filtros
  navigateToShop(department: string, subcategory: string): void {
    console.log(`Navigating to shop with department: ${department}, subcategory: ${subcategory}`);
    
    // Construir los parámetros de consulta para la navegación
    const queryParams: any = { 
      category: department
    };
    
    // Añadir subcategoría si está presente
    if (subcategory) {
      queryParams.subcategory = subcategory;
    }
    
    // Navegar al shop con los parámetros
    this.router.navigate(['/shop'], { queryParams });
  }

  private loadFallbackNews(): void {
    this.newsItems = [
      {
        id: 1,
        title: "Jordan 4 «White Thunder» Returns: El icónico colorway vuelve para enero 2025",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=400&fit=crop",
        url: "https://www.revistagq.com/moda/articulo/jordan-4-white-thunder-2025",
        category: "SNEAKERS",
        date: "June 10, 2025"
      },
      {
        id: 2,
        title: "Supreme Summer 2025: La colección que define el streetwear de la temporada",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&h=400&fit=crop",
        url: "https://www.highsnobiety.com/p/supreme-summer-2025-collection/",
        category: "STREETWEAR",
        date: "June 8, 2025"
      },
      {
        id: 3,
        title: "Off-White™ x Nike Air Force 1 «University Gold»: Virgil's legacy continues",
        image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&h=400&fit=crop",
        url: "https://www.revistagq.com/moda/articulo/off-white-nike-air-force-1-university-gold",
        category: "COLLABORATION",
        date: "June 6, 2025"
      },
      {
        id: 4,
        title: "Bottega Veneta presenta «The Pouch» en nuevos colores para verano 2025",
        image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&h=400&fit=crop",
        url: "https://www.highsnobiety.com/p/bottega-veneta-pouch-summer-2025/",
        category: "LUXURY",
        date: "June 4, 2025"
      },
      {
        id: 5,
        title: "Travis Scott x Jordan Low OG «Mocha Reverse»: El hype que rompe internet",
        image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1200&h=400&fit=crop",
        url: "https://www.revistagq.com/moda/articulo/travis-scott-jordan-mocha-reverse-2025",
        category: "SNEAKERS",
        date: "June 2, 2025"
      },
      {
        id: 6,
        title: "Stüssy x Our Legacy: La colaboración que fusiona el heritage con la modernidad",
        image: "https://images.unsplash.com/photo-1581533281788-b5beb5f1c236?w=1200&h=400&fit=crop",
        url: "https://www.highsnobiety.com/p/stussy-our-legacy-collaboration-2025/",
        category: "STREETWEAR",
        date: "May 30, 2025"
      },
      {
        id: 7,
        title: "Balenciaga Triple S «Neon Pack»: Los chunky sneakers que dominan 2025",
        image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=1200&h=400&fit=crop",
        url: "https://www.revistagq.com/moda/articulo/balenciaga-triple-s-neon-pack-2025",
        category: "LUXURY",
        date: "May 28, 2025"
      },
      {
        id: 8,
        title: "KITH x New Balance 990v6 «Daytona»: Racing heritage meets street style",
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1200&h=400&fit=crop",
        url: "https://www.highsnobiety.com/p/kith-new-balance-990v6-daytona/",
        category: "COLLABORATION",
        date: "May 25, 2025"
      }
    ];
  }
}
