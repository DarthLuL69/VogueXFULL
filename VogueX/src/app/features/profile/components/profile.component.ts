import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <!-- Sección de perfil -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
          <div class="flex items-center space-x-6">
            <div class="relative">
              <div class="w-24 h-24 bg-black rounded-full"></div>
              <button class="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md">
                <i class="fas fa-camera"></i>
              </button>
            </div>
            <div class="flex-1">
              <h1 class="text-2xl font-bold">&#64;alexr_skrr</h1>
              <p class="text-gray-600">Joined in 2025</p>
              <p class="text-gray-600">Europe</p>
            </div>
            <div class="flex space-x-8">
              <div class="text-center">
                <div class="text-xl font-bold">0</div>
                <div class="text-gray-600">Transactions</div>
              </div>
              <div class="text-center">
                <div class="text-xl font-bold">0</div>
                <div class="text-gray-600">Followers</div>
              </div>
            </div>
            <a routerLink="/new-listing" class="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
              + NEW LISTING
            </a>
          </div>
        </div>

        <!-- Sección de productos en venta -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold mb-6">For Sale</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Producto 1 -->
            <div class="border rounded-lg overflow-hidden">
              <div class="aspect-square bg-gray-100"></div>
              <div class="p-4">
                <div class="text-sm text-gray-500">3 months ago</div>
                <div class="font-bold">Off-White</div>
                <div class="text-gray-700">Digit Bacchus Double String</div>
                <div class="font-bold mt-2">726€</div>
                <div class="flex justify-between items-center mt-4">
                  <div class="text-gray-500">8 ♡</div>
                  <div class="space-x-2">
                    <button class="text-sm border px-3 py-1 rounded hover:bg-gray-100">PRICE DROP</button>
                    <button class="text-sm border px-3 py-1 rounded hover:bg-gray-100">SEND OFFER</button>
                  </div>
                </div>
              </div>
            </div>
            <!-- Producto 2 -->
            <div class="border rounded-lg overflow-hidden">
              <div class="aspect-square bg-gray-100"></div>
              <div class="p-4">
                <div class="text-sm text-gray-500">3 months ago</div>
                <div class="font-bold">Off-White</div>
                <div class="text-gray-700">Digit Bacchus Double String</div>
                <div class="font-bold mt-2">726€</div>
                <div class="flex justify-between items-center mt-4">
                  <div class="text-gray-500">8 ♡</div>
                  <div class="space-x-2">
                    <button class="text-sm border px-3 py-1 rounded hover:bg-gray-100">PRICE DROP</button>
                    <button class="text-sm border px-3 py-1 rounded hover:bg-gray-100">SEND OFFER</button>
                  </div>
                </div>
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
  user: any;
  loading = true;
  error = '';
  
  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.apiService.getUserProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar el perfil';
        this.loading = false;
        console.error('Error:', error);
        if (error.status === 401) {
          this.router.navigate(['/login']); 
        }
      }
    });
  }

  // Puedes agregar métodos para cargar listados, favoritos, etc. aquí
  // loadSellingListings() { ... }
  // loadFavorites() { ... }
  // ...
}

