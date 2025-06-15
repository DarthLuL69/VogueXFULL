import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DesignersService, Designer } from '../../../shared/services/designers.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { FavoriteService, FavoriteDesigner } from '../../../shared/services/favorite.service';
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
  selectedFilterTab: string = 'POPULAR';
  selectedLetter: string | null = null;
  searchQuery: string = '';
  loading: boolean = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Make Object available in template
  Object = Object;
  
  // Make encodeURIComponent available in template
  encodeURIComponent = encodeURIComponent;

  // Alphabet for filtering
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
    // Verificar si es necesario actualizar los diseñadores
    this.designersService.checkAndUpdateDesigners().subscribe({
      next: () => {
        // Independientemente del resultado, cargamos los diseñadores
        this.loadPopularDesigners();
      },
      error: () => {
        // Si hay error, igual cargamos los diseñadores que existan
        this.loadPopularDesigners();
      }
    });
    // No cargar todos los diseñadores al inicio para mejorar performance
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPopularDesigners(): void {
    this.loading = true;
    this.designersService.getPopularDesigners()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (designers) => {
          console.log('Popular designers received:', designers);
          this.popularDesigners = designers;
          if (this.selectedFilterTab === 'POPULAR') {
            this.filteredDesigners = this.popularDesigners;
            this.groupDesigners();
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading popular designers:', error);
          this.error = 'Unable to load popular designers.';
          this.loading = false;
        }
      });
  }

  loadAllDesigners(): void {
    this.loading = true;
    // Remover el parámetro (20) de esta llamada
    this.designersService.getAllDesigners()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (designers) => {
          this.allDesigners = designers;
          if (this.selectedFilterTab === 'ALL' && !this.searchQuery && !this.selectedLetter) {
            this.applyFilter();
          }
          this.loading = false;
          this.error = null;
          console.log('Limited designers loaded:', designers.length);
        },
        error: (error) => {
          this.error = 'Unable to load designers. Please try again later.';
          this.loading = false;
          console.error('Error loading all designers:', error);
        }
      });
  }

  loadDesigners(): void {
    this.loading = true;
    
    this.designersService.getAllDesigners() // Remover el parámetro (20)
      .subscribe({
        next: (designers) => {
          this.allDesigners = designers;
          this.applyFilter(); // Cambiar de applyFilters a applyFilter si es necesario
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading designers:', error);
          this.loading = false;
        }
      });
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.selectedLetter = null;
    this.selectedFilterTab = 'ALL';
    this.searchSubject.next(query);
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.onSearch(target.value);
    }
  }

  onImageError(event: Event, designerName: string): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      // Generar avatar con iniciales como fallback
      const initials = this.getInitials(designerName);
      const backgroundColor = this.getColorFromName(designerName);
      target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${initials}&backgroundColor=${backgroundColor}&radius=10&fontSize=40`;
    }
  }

  private getInitials(name: string): string {
    const words = name.split(' ');
    let initials = '';
    
    for (const word of words) {
      if (word.length > 0) {
        initials += word[0].toUpperCase();
        if (initials.length >= 2) break;
      }
    }
    
    return initials || name.substring(0, 2).toUpperCase();
  }

  private getColorFromName(name: string): string {
    const colors = ['c084fc', 'fb7185', '34d399', 'fbbf24', '60a5fa', 'a78bfa', 'f87171', '4ade80'];
    let hash = 0;
    
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return colors[Math.abs(hash) % colors.length];
  }

  onLetterSelect(letter: string): void {
    this.selectedLetter = letter;
    this.searchQuery = '';
    this.selectedFilterTab = 'ALL';
    this.loading = true;

    // Cargar diseñadores específicos por letra
    this.designersService.getDesignersByLetter(letter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (designers) => {
          this.filteredDesigners = designers;
          this.groupDesigners();
          this.loading = false;
          console.log(`Designers for letter ${letter}:`, designers.length);
        },
        error: (error) => {
          console.error('Error loading designers by letter:', error);
          this.loading = false;
          this.error = 'Unable to load designers for this letter.';
        }
      });
  }

  onFilterTabSelect(tab: string): void {
    this.selectedFilterTab = tab;
    this.searchQuery = '';
    this.selectedLetter = null;
    
    if (tab === 'ALL' && this.allDesigners.length === 0) {
      // Solo cargar cuando se necesite
      this.loadAllDesigners();
    } else {
      this.applyFilter();
    }
  }

  onDesignerClick(designer: Designer): void {
    this.router.navigate(['/shop'], {
      queryParams: { designer: designer.name }
    });
  }

  private applyFilter(): void {
    if (this.selectedFilterTab === 'POPULAR') {
      console.log('Applying POPULAR filter with:', this.popularDesigners.length, 'designers');
      this.filteredDesigners = this.popularDesigners;
    } else if (this.selectedFilterTab === 'FEATURED') {
      this.filteredDesigners = this.popularDesigners.slice(0, 6); // Show 6 featured
    } else { // ALL
      if (this.selectedLetter) {
        return;
      } else {
        this.filteredDesigners = this.allDesigners.slice(0, 20);
      }
    }
    this.groupDesigners();
  }

  // Add public method for template access
  public resetLetterFilter(): void {
    this.selectedLetter = null;
    this.applyFilter();
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

  // Método corregido para manejar favoritos
  toggleFavoriteDesigner(designer: Designer, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const favoriteDesigner: FavoriteDesigner = {
      id: designer.id.toString(),
      name: designer.name,
      imageUrl: designer.imageUrl,
      itemsCount: designer.itemsCount
    };
    
    this.favoriteService.toggleFavoriteDesigner(favoriteDesigner);
  }

  // Método simplificado para añadir a favoritos (mantener por compatibilidad)
  addToFavorites(designer: Designer): void {
    this.toggleFavoriteDesigner(designer);
  }

  isFavoriteDesigner(designerId: string): boolean {
    return this.favoriteService.isFavoriteDesigner(designerId);
  }
}

