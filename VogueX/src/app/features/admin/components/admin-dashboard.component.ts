import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      <div *ngIf="loading" class="text-center py-8">
        <p class="text-gray-600">Cargando datos...</p>
      </div>
      
      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        {{ error }}
      </div>

      <div *ngIf="!loading && !error" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 class="text-xl font-semibold mb-2">Usuarios</h2>
          <p class="text-3xl font-bold">{{ stats.total_users || 0 }}</p>
          <a routerLink="/admin/users" class="text-blue-600 hover:underline mt-4 inline-block">Gestionar usuarios →</a>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 class="text-xl font-semibold mb-2">Productos</h2>
          <p class="text-3xl font-bold">{{ stats.total_products || 0 }}</p>
          <a routerLink="/admin/products" class="text-blue-600 hover:underline mt-4 inline-block">Gestionar productos →</a>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 class="text-xl font-semibold mb-2">Diseñadores</h2>
          <p class="text-3xl font-bold">{{ stats.total_designers || 0 }}</p>
          <a routerLink="/admin/designers" class="text-blue-600 hover:underline mt-4 inline-block">Gestionar diseñadores →</a>
        </div>
      </div>
      
      <div class="mt-12">
        <h2 class="text-2xl font-semibold mb-4">Acciones rápidas</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button class="bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 transition">
            Añadir producto
          </button>
          <button class="bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 transition">
            Añadir diseñador
          </button>
          <button class="bg-purple-600 text-white py-3 px-4 rounded hover:bg-purple-700 transition">
            Ver pedidos pendientes
          </button>
          <button class="bg-gray-800 text-white py-3 px-4 rounded hover:bg-black transition">
            Configuración
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  stats: any = {
    total_users: 0,
    total_products: 0,
    total_designers: 0
  };
  loading = true;
  error = '';

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.http.get<any>('http://localhost:8000/api/admin/dashboard').subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data.stats;
        } else {
          this.error = 'No se pudieron cargar los datos del dashboard';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar datos: ' + (err.error?.message || 'Error desconocido');
        this.loading = false;
      }
    });
  }
}
