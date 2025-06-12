import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <h1 class="text-3xl font-bold mb-8">Mi Perfil</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Información del usuario -->
        <div class="md:col-span-2">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4">Información Personal</h2>
            
            <div *ngIf="userProfile" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Nombre</label>
                <p class="mt-1 text-sm text-gray-900">{{ userProfile.data?.name || 'No disponible' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <p class="mt-1 text-sm text-gray-900">{{ userProfile.data?.email || 'No disponible' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Miembro desde</label>
                <p class="mt-1 text-sm text-gray-900">{{ userProfile.data?.created_at | date:'medium' }}</p>
              </div>
            </div>
            
            <div *ngIf="!userProfile" class="text-center py-4">
              <p class="text-gray-500">Cargando información del perfil...</p>
            </div>
          </div>
        </div>
        
        <!-- Menú lateral -->
        <div class="space-y-4">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">Acciones</h3>
            <nav class="space-y-2">
              <a routerLink="/sell" class="block w-full text-left px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
                Vender Producto
              </a>
              <a routerLink="/favourites" class="block w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Mis Favoritos
              </a>
              <a routerLink="/shop" class="block w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Ir a la Tienda
              </a>
            </nav>
          </div>
          
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">Estadísticas</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Productos en venta</span>
                <span class="text-sm font-medium">0</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Productos vendidos</span>
                <span class="text-sm font-medium">0</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Favoritos</span>
                <span class="text-sm font-medium">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfileComponent implements OnInit {
  userProfile: any = null;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.apiService.getUserProfile().subscribe({
      next: (data: any) => {
        this.userProfile = data;
      },
      error: (error: any) => {
        console.error('Error loading user profile:', error);
      }
    });
  }
}

