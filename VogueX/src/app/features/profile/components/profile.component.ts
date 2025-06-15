import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services';
import { AuthService, User } from '../../../shared/services/auth.service';
import { ChatService } from '../../../shared/services/chat.service';
import { Chat } from '../../../shared/models/chat.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="max-w-6xl mx-auto p-6">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p class="text-gray-600 mt-2">Gestiona tu información personal y configuración de cuenta</p>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Información del usuario y edición -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Foto de perfil -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4">Foto de Perfil</h2>
            <div class="flex items-center space-x-6">
              <div class="relative">
                <img 
                  [src]="profileImageUrl || '/assets/images/default-avatar.svg'" 
                  alt="Foto de perfil" 
                  class="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  (error)="onImageError($event)"
                >
                <button 
                  (click)="triggerFileInput()"
                  class="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
                  title="Cambiar foto"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </button>
              </div>
              <div>
                <button 
                  (click)="triggerFileInput()"
                  class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors"
                >
                  Cambiar foto
                </button>
                <p class="text-sm text-gray-500 mt-1">JPG, PNG o GIF hasta 5MB</p>
              </div>
              <input 
                #fileInput 
                type="file" 
                (change)="onFileSelected($event)" 
                accept="image/*" 
                class="hidden"
              >
            </div>
          </div>

          <!-- Información personal -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold">Información Personal</h2>
              <button 
                (click)="toggleEditMode()"
                class="text-blue-600 hover:text-blue-800 transition-colors"
              >
                {{ isEditMode ? 'Cancelar' : 'Editar' }}
              </button>
            </div>
            
            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" *ngIf="isEditMode">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <input 
                    type="text" 
                    formControlName="name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    [class.border-red-500]="profileForm.get('name')?.invalid && profileForm.get('name')?.touched"
                  >
                  <p *ngIf="profileForm.get('name')?.invalid && profileForm.get('name')?.touched" 
                     class="text-red-500 text-sm mt-1">
                    El nombre es requerido
                  </p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    formControlName="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    [class.border-red-500]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched"
                  >
                  <p *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched" 
                     class="text-red-500 text-sm mt-1">
                    Ingresa un email válido
                  </p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input 
                    type="tel" 
                    formControlName="phone"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Opcional"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                  <input 
                    type="text" 
                    formControlName="location"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ciudad, País"
                  >
                </div>
              </div>
              
              <div class="mt-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Biografía</label>
                <textarea 
                  formControlName="bio"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Cuéntanos un poco sobre ti..."
                ></textarea>
              </div>
              
              <div class="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  (click)="cancelEdit()"
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  [disabled]="profileForm.invalid || isSaving"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
              </div>
            </form>
            
            <!-- Vista de solo lectura -->
            <div *ngIf="!isEditMode && currentUser" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">                <div>
                  <label class="block text-sm font-medium text-gray-700">Nombre</label>                  <p class="mt-1 text-sm text-gray-900">{{ currentUser.name }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <p class="mt-1 text-sm text-gray-900">{{ currentUser.email }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Teléfono</label>
                  <p class="mt-1 text-sm text-gray-900">{{ userProfile?.phone ?? 'No disponible' }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Ubicación</label>
                  <p class="mt-1 text-sm text-gray-900">{{ userProfile?.location ?? 'No disponible' }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Miembro desde</label>
                  <p class="mt-1 text-sm text-gray-900">{{ currentUser.created_at | date:'medium' }}</p>
                </div>
              </div>
              
              <div *ngIf="userProfile?.bio">
                <label class="block text-sm font-medium text-gray-700">Biografía</label>
                <p class="mt-1 text-sm text-gray-900">{{ userProfile.bio }}</p>
              </div>
            </div>
            
            <div *ngIf="!isEditMode && !currentUser" class="text-center py-4">
              <p class="text-gray-500">Cargando información del perfil...</p>
            </div>
          </div>
        </div>
        
        <!-- Panel lateral -->
        <div class="space-y-6">
          <!-- Acciones rápidas -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">Acciones Rápidas</h3>
            <nav class="space-y-3">
              <a routerLink="/sell" 
                 class="flex items-center w-full text-left px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Vender Producto
              </a>
              <a routerLink="/favourites" 
                 class="flex items-center w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                Mis Favoritos
              </a>
              <a routerLink="/shop" 
                 class="flex items-center w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                Ir a la Tienda
              </a>
            </nav>
          </div>
          
          <!-- Chats recientes -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Chats Recientes</h3>
              <a routerLink="/chat" class="text-blue-600 hover:text-blue-800 text-sm">
                Ver todos
              </a>
            </div>
            
            <div *ngIf="recentChats && recentChats.length > 0" class="space-y-3">
              <div *ngFor="let chat of recentChats.slice(0, 3)" 
                   (click)="navigateToChat(chat.id)"
                   class="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                <img 
                  [src]="getChatPartnerAvatar(chat)" 
                  [alt]="getChatPartnerName(chat)"
                  class="w-10 h-10 rounded-full object-cover mr-3"
                  (error)="onChatAvatarError($event)"
                >
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ getChatPartnerName(chat) }}
                  </p>
                  <p class="text-xs text-gray-500 truncate">
                    {{ getLastMessageText(chat) }}
                  </p>
                </div>
                <div class="text-xs text-gray-400">
                  {{ getTimeAgo(chat.updated_at) }}
                </div>
              </div>
            </div>
            
            <div *ngIf="recentChats && recentChats.length === 0" class="text-center py-4">
              <p class="text-gray-500 text-sm">No tienes chats recientes</p>
              <a routerLink="/shop" class="text-blue-600 hover:text-blue-800 text-sm">
                Explora productos
              </a>
            </div>
            
            <div *ngIf="!recentChats" class="text-center py-4">
              <p class="text-gray-500 text-sm">Cargando chats...</p>
            </div>
          </div>
          
          <!-- Estadísticas -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">Actividad</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Productos en venta</span>
                <span class="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {{ stats.productsForSale }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Productos vendidos</span>
                <span class="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                  {{ stats.productsSold }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Chats activos</span>
                <span class="text-sm font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  {{ stats.activeChats }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Toast para mensajes -->
      <div *ngIf="showToast" 
           class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity"
           [class.opacity-0]="!showToast">
        {{ toastMessage }}
      </div>
    </div>
  `,
  styles: [`
    .transition-opacity {
      transition: opacity 0.3s ease-in-out;
    }
  `]
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  
  currentUser: User | null = null;
  userProfile: any = null;
  recentChats: Chat[] | null = null;
  
  isEditMode = false;
  isSaving = false;
  profileForm: FormGroup;
  profileImageUrl: string | null = null;
  
  stats = {
    productsForSale: 0,
    productsSold: 0,
    activeChats: 0
  };
  
  showToast = false;
  toastMessage = '';
  constructor(
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
    private readonly router: Router,
    private readonly fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      location: [''],
      bio: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadRecentChats();
  }

  private loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadUserProfile();
        this.updateFormWithUserData(user);
      }
    });
  }

  private loadUserProfile(): void {
    this.apiService.getUserProfile().subscribe({
      next: (data: any) => {
        this.userProfile = data.data ?? data;
        this.profileImageUrl = this.userProfile?.avatar;
        this.updateStats();
      },
      error: (error: any) => {
        console.error('Error loading user profile:', error);
      }
    });
  }

  private loadRecentChats(): void {
    this.chatService.getChats().subscribe({
      next: (response) => {
        if (response.success) {
          this.recentChats = response.data.slice(0, 5); // Solo los 5 más recientes
          this.stats.activeChats = response.data.length;
        }
      },
      error: (error) => {
        console.error('Error loading chats:', error);
        this.recentChats = [];
      }
    });
  }

  private updateFormWithUserData(user: User): void {
    this.profileForm.patchValue({
      name: user.name,
      email: user.email,      phone: this.userProfile?.phone ?? '',
      location: this.userProfile?.location ?? '',
      bio: this.userProfile?.bio ?? ''
    });
  }

  private updateStats(): void {
    // Aquí podrías cargar estadísticas reales desde el backend
    this.stats = {      productsForSale: this.userProfile?.products_count ?? 0,
      productsSold: this.userProfile?.sold_products_count ?? 0,
      activeChats: this.stats.activeChats
    };
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode && this.currentUser) {
      this.updateFormWithUserData(this.currentUser);
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    if (this.currentUser) {
      this.updateFormWithUserData(this.currentUser);
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid && !this.isSaving) {
      this.isSaving = true;
      
      const profileData = this.profileForm.value;
      
      this.apiService.updateUserProfile(profileData).subscribe({
        next: (response) => {
          this.isSaving = false;
          this.isEditMode = false;
          this.showToastMessage('Perfil actualizado correctamente');
          
          // Actualizar los datos locales
          if (this.currentUser) {
            this.currentUser.name = profileData.name;
            this.currentUser.email = profileData.email;
          }
          this.userProfile = { ...this.userProfile, ...profileData };
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error updating profile:', error);
          this.showToastMessage('Error al actualizar el perfil');
        }
      });
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar el archivo
      if (file.size > 5 * 1024 * 1024) { // 5MB
        this.showToastMessage('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        this.showToastMessage('Por favor selecciona una imagen válida.');
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);

      // Aquí podrías subir la imagen al servidor
      this.uploadProfileImage(file);
    }
  }
  private uploadProfileImage(file: File): void {
    this.apiService.uploadProfileImage(file).subscribe({
      next: (response) => {
        this.showToastMessage('Imagen de perfil actualizada correctamente');
        if (response.data?.avatar) {
          this.profileImageUrl = response.data.avatar;
        }
      },
      error: (error) => {
        console.error('Error uploading profile image:', error);
        this.showToastMessage('Error al subir la imagen de perfil');
      }
    });
  }
  onImageError(event: any): void {
    event.target.src = '/assets/images/default-avatar.svg';
  }

  onChatAvatarError(event: any): void {
    event.target.src = '/assets/images/default-avatar.svg';
  }

  navigateToChat(chatId: number): void {
    this.router.navigate(['/chat', chatId]);
  }

  getChatPartnerName(chat: Chat): string {
    if (!this.currentUser) return 'Desconocido';
    
    // Determinar si el usuario actual es el comprador o vendedor
    const isCurrentUserBuyer = chat.buyer_id === this.currentUser.id;
    
    if (isCurrentUserBuyer) {      return chat.seller?.name ?? 'Vendedor';
    } else {
      return chat.buyer?.name ?? 'Comprador';
    }
  }

  getChatPartnerAvatar(chat: Chat): string {
    if (!this.currentUser) return '/assets/images/default-avatar.png';
    
    const isCurrentUserBuyer = chat.buyer_id === this.currentUser.id;
    
    if (isCurrentUserBuyer) {      return chat.seller?.avatar ?? '/assets/images/default-avatar.svg';
    } else {
      return chat.buyer?.avatar ?? '/assets/images/default-avatar.svg';
    }
  }
  getLastMessageText(chat: Chat): string {
    if (chat.lastMessage) {
      return chat.lastMessage.content || 'Mensaje';
    }
    return 'Sin mensajes';
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  }

  private showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}

