import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CategoryItem {
  id: number;
  name: string;
  image: string;
  link: string;
}

@Component({
  selector: 'app-category-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-carousel.component.html'
})
export class CategoryCarouselComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() items: CategoryItem[] = [];
  
  currentItem = 0;
  private autoplayInterval: ReturnType<typeof setInterval> | undefined;
  
  constructor(private cdr: ChangeDetectorRef) {}
  
  ngOnInit(): void {
    this.startAutoplay();
  }
  
  ngOnDestroy(): void {
    this.stopAutoplay();
  }
  
  startAutoplay(): void {
    this.autoplayInterval = setInterval(() => {
      this.nextItem();
      this.cdr.detectChanges();
    }, 4000); // Change item every 4 seconds
  }
  
  stopAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }
  
  previousItem(): void {
    this.currentItem = (this.currentItem === 0) ? this.items.length - 1 : this.currentItem - 1;
    this.resetAutoplay();
  }
  
  nextItem(): void {
    this.currentItem = (this.currentItem === this.items.length - 1) ? 0 : this.currentItem + 1;
    this.resetAutoplay();
  }
  
  goToItem(index: number): void {
    this.currentItem = index;
    this.resetAutoplay();
  }
  
  resetAutoplay(): void {
    this.stopAutoplay();
    this.startAutoplay();
  }
}
