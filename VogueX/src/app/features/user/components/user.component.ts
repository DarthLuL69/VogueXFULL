import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">Mi Cuenta</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Menú lateral -->
          <div class="md:col-span-1">
            <div class="bg-white rounded-lg shadow p-4">
              <nav class="space-y-2">
                <a href="#" class="block px-4 py-2 rounded-md bg-gray-100">Perfil</a>
                <a href="#" class="block px-4 py-2 rounded-md hover:bg-gray-100">Mis Compras</a>
                <a href="#" class="block px-4 py-2 rounded-md hover:bg-gray-100">Mis Ventas</a>
                <a href="#" class="block px-4 py-2 rounded-md hover:bg-gray-100">Favoritos</a>
                <a href="#" class="block px-4 py-2 rounded-md hover:bg-gray-100">Configuración</a>
              </nav>
            </div>
          </div>

          <!-- Contenido principal -->
          <div class="md:col-span-2">
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-bold mb-6">Información Personal</h2>
              <form class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                    <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input type="tel" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  <textarea class="w-full px-3 py-2 border border-gray-300 rounded-md" rows="3"></textarea>
                </div>
                <button type="submit" class="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors">
                  Guardar cambios
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UserComponent {} 