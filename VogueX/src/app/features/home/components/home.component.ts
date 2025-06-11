import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GrailedApiService } from '../../shared/services/grailed-api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- BANNER NEGRO CON ESPIRAL (placeholder SVG) -->
    <div class="w-full h-64 bg-black flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 800 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M400 128 Q600 0 800 128 Q600 256 400 128 Q200 0 0 128 Q200 256 400 128" stroke="#222" stroke-width="2" fill="none"/>
        <path d="M400 128 Q500 64 600 128 Q500 192 400 128 Q300 64 200 128 Q300 192 400 128" stroke="#222" stroke-width="2" fill="none"/>
      </svg>
    </div>

    <!-- SECCIONES DE PRODUCTOS -->
    <div class="container mx-auto px-4 py-12">

      <!-- Sección para Diseñadores -->
      <div class="mb-12">
        <button (click)="toggleDesigners()" class="text-xl font-bold mb-4 underline">BROWSE DESIGNERS</button>
        <div *ngIf="showDesigners" class="bg-gray-100 p-6 rounded-lg">
          <h3 class="text-lg font-semibold mb-4">All Designers (A-Z)</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div *ngFor="let designer of designers" class="text-sm">{{ designer }}</div>
          </div>
           <div *ngIf="designers.length === 0 && showDesigners" class="text-gray-500">Cargando diseñadores...</div>
        </div>
      </div>

      <!-- Menswear -->
      <h2 class="text-xl font-bold mb-4">MENSWEAR</h2>
      <div class="grid grid-cols-2 md:grid-cols-6 gap-6 mb-12">
        <div *ngFor="let item of menswear" class="bg-gray-100 flex items-center justify-center aspect-square">
          <img [src]="item.img" [alt]="item.name" class="max-h-40 object-contain" />
        </div>
      </div>
      <!-- Womenswear -->
      <h2 class="text-xl font-bold mb-4">WOMENSWEAR</h2>
      <div class="grid grid-cols-2 md:grid-cols-6 gap-6">
        <div *ngFor="let item of womenswear" class="bg-gray-100 flex items-center justify-center aspect-square">
          <img [src]="item.img" [alt]="item.name" class="max-h-40 object-contain" />
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  designers: string[] = [];
  showDesigners = false;

  menswear = [
    { name: 'Blazer', img: 'https://i.imgur.com/1.png' },
    { name: 'Sneakers', img: 'https://i.imgur.com/2.png' },
    { name: 'Camiseta Gucci', img: 'https://i.imgur.com/3.png' },
    { name: 'Bomber', img: 'https://i.imgur.com/4.png' },
    { name: 'Gafas', img: 'https://i.imgur.com/5.png' },
    { name: 'Jeans', img: 'https://i.imgur.com/6.png' },
  ];
  womenswear = [
    { name: 'Top', img: 'https://i.imgur.com/7.png' },
    { name: 'Bolso', img: 'https://i.imgur.com/8.png' },
    { name: 'Falda', img: 'https://i.imgur.com/9.png' },
    { name: 'Gafas', img: 'https://i.imgur.com/10.png' },
    { name: 'Bomber', img: 'https://i.imgur.com/11.png' },
    { name: 'Bufanda', img: 'https://i.imgur.com/12.png' },
  ];

  constructor(private apiService: GrailedApiService) { }

  ngOnInit(): void {
    // Puedes cargar diseñadores al inicializar o solo cuando se haga clic
    // Si quieres cargarlos al inicio para tenerlos listos:
    // this.loadDesigners();
  }

  loadDesigners(): void {
     // Reutilizamos la lógica de extracción de diseñadores de ShopComponent
     this.apiService.search('', 1, 100, 'mostrecent').subscribe(results => { // Aumentamos hitsPerPage
       console.log('API Search Results for Designers (Home):', results);
        if (results && results.hits && results.hits.length > 0) {
           const extractedDesigners = results.hits
             .map((hit: any) => hit.designer || hit.brand) // Asumir propiedad 'designer' o 'brand'
             .filter((designer: any) => designer) // Filtrar resultados nulos o vacíos
             .reduce((unique: string[], item: string) => unique.includes(item) ? unique : [...unique, item], []); // Obtener nombres únicos

           // Ordenar alfabéticamente
           this.designers = extractedDesigners.sort();
        }
     });
  }

  toggleDesigners(): void {
     this.showDesigners = !this.showDesigners;
     if (this.showDesigners && this.designers.length === 0) {
       this.loadDesigners(); // Cargar diseñadores solo si se muestra la sección y aún no se han cargado
     }
  }
} 