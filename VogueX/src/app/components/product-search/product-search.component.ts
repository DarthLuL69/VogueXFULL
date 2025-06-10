import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { StockXService } from '../../services/stockx.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.css']
})
export class ProductSearchComponent implements OnInit {
  @Output() productSelected = new EventEmitter<any>();
  
  searchQuery = '';
  suggestions: any[] = [];
  selectedProduct: any = null;
  priceRecommendation: any = null;
  loading = false;
  error: string | null = null;

  private searchSubject = new Subject<string>();

  constructor(private stockXService: StockXService) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          this.suggestions = [];
          return [];
        }
        this.loading = true;
        return this.stockXService.searchProducts(query);
      })
    ).subscribe({
      next: (response) => {
        this.suggestions = response.products || [];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al buscar productos';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  ngOnInit(): void {}

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  onProductSelect(product: any): void {
    this.selectedProduct = product;
    this.searchQuery = product.name;
    this.suggestions = [];
    this.getPriceRecommendation(product.slug);
    this.productSelected.emit(product);
  }

  private getPriceRecommendation(productSlug: string): void {
    this.loading = true;
    this.stockXService.getPriceRecommendation(productSlug).subscribe({
      next: (data) => {
        this.priceRecommendation = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al obtener recomendación de precio';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }
} 