import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DesignersService, Designer } from '../../shared/services/designers.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { FavoriteService } from '../../shared/services/favorite.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-designers',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './designers.component.html',
  styles: []
})
export class DesignersComponent implements OnInit, OnDestroy {
  popularDesigners: Designer[] = [];
  allDesigners: Designer[] = [];
  filteredDesigners: Designer[] = [];
  groupedFilteredDesigners: { [key: string]: Designer[] } = {};
  categories: string[] = ['All', 'Luxury', 'Streetwear', 'Sneakers'];
  selectedCategory: string = 'All';
  selectedFilterTab: string = 'POPULAR'; // 'FEATURED', 'POPULAR', 'ALL'
  selectedLetter: string | null = null;
  searchQuery: string = '';
  loading: boolean = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Hacer Object disponible en la plantilla
  Object = Object;

  // Alfabeto para el filtro
  alphabet = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  constructor(
    private designersService: DesignersService,
    private router: Router,
    private favoriteService: FavoriteService
  ) {
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query) {
          return this.designersService.searchDesigners(query);
        } else if (this.selectedLetter) {
          return this.designersService.getDesignersByLetter(this.selectedLetter);
        } else {
          return this.designersService.getAllDesigners();
        }
      })
    ).subscribe({
      next: (designers) => {
        this.allDesigners = designers; // Actualizar allDesigners para el filtro principal
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los diseñadores';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  ngOnInit(): void {
    this.loadPopularDesigners();
    this.loadAllDesigners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPopularDesigners(): void {
    this.designersService.getPopularDesigners()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (designers) => {
          this.popularDesigners = designers;
          if (this.selectedFilterTab === 'POPULAR') {
            this.filteredDesigners = this.popularDesigners;
            this.groupDesigners();
          }
        },
        error: (error) => {
          console.error('Error loading popular designers:', error);
        }
      });
  }

  loadAllDesigners(): void {
    this.loading = true;
    this.designersService.getAllDesigners()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (designers) => {
          this.allDesigners = designers;
          if (this.selectedFilterTab === 'ALL' && !this.searchQuery && !this.selectedLetter) {
            this.applyFilter();
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar los diseñadores';
          this.loading = false;
          console.error('Error:', error);
        }
      });
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.selectedLetter = null;
    this.selectedFilterTab = 'ALL';
    this.searchSubject.next(query);
  }

  onLetterSelect(letter: string): void {
    this.selectedLetter = letter;
    this.searchQuery = '';
    this.selectedFilterTab = 'ALL';

    if (letter === '#') {
      this.filteredDesigners = this.allDesigners.filter(d => !/^[a-zA-Z]/.test(d.name));
      this.groupDesigners();
    } else {
      this.designersService.getDesignersByLetter(letter)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (designers) => {
            this.filteredDesigners = designers;
            this.groupDesigners();
          },
          error: (error) => {
            console.error('Error loading designers by letter:', error);
          }
        });
    }
  }

  onFilterTabSelect(tab: string): void {
    this.selectedFilterTab = tab;
    this.searchQuery = '';
    this.selectedLetter = null;
    this.applyFilter();
  }

  onDesignerClick(designer: Designer): void {
    this.router.navigate(['/shop'], {
      queryParams: { designer: designer.name }
    });
  }

  onCategorySelect(category: string): void {
    this.selectedCategory = category;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.selectedFilterTab === 'POPULAR') {
      this.filteredDesigners = this.popularDesigners;
    } else if (this.selectedFilterTab === 'FEATURED') {
      // Asumiendo que 'featured' es un subset de 'popular' o una lógica diferente
      // Por ahora, lo dejaremos igual que populares o vacío
      this.filteredDesigners = this.popularDesigners; // O this.popularDesigners.slice(0, X) para un subconjunto
    } else { // ALL
      this.filteredDesigners = this.allDesigners.filter(designer => {
        const matchesSearch = designer.name.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesLetter = !this.selectedLetter || 
                              (this.selectedLetter === '#' && !/^[a-zA-Z]/.test(designer.name)) || 
                              (designer.name.charAt(0).toUpperCase() === this.selectedLetter);
        return matchesSearch && matchesLetter;
      });
    }
    this.groupDesigners();
  }

  private groupDesigners(): void {
    this.groupedFilteredDesigners = this.filteredDesigners.reduce((groups, designer) => {
      const firstLetter = designer.name.charAt(0).toUpperCase();
      const groupKey = /^[A-Z]/.test(firstLetter) ? firstLetter : '#';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(designer);
      return groups;
    }, {} as { [key: string]: Designer[] });

    // Ordenar por clave (letra) y luego por nombre dentro de cada grupo
    Object.keys(this.groupedFilteredDesigners).forEach(key => {
      this.groupedFilteredDesigners[key].sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  toggleFavoriteDesigner(designerName: string): void {
    if (this.favoriteService.isFavoriteDesigner(designerName)) {
      this.favoriteService.removeFavoriteDesigner(designerName);
    } else {
      this.favoriteService.addFavoriteDesigner(designerName);
    }
  }

  isFavoriteDesigner(designerName: string): boolean {
    return this.favoriteService.isFavoriteDesigner(designerName);
  }
}
