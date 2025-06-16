import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../../shared/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: []
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isEditing = false;
  loading = false;
  message = '';
  errorMessage = '';
  recentChats: any[] = [];
  
  // Form data
  formData = {
    name: '',
    email: '',
    phone: '',
    bio: ''
  };

  constructor(
    private readonly userService: UserService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadRecentChats();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.userService.getProfile().subscribe({
      next: (response) => {
        console.log('Profile API response:', response);
        if (response.success && response.data) {
          this.user = response.data;
          console.log('User data loaded:', this.user);
          this.formData = {
            name: this.user.name,
            email: this.user.email,
            phone: this.user.phone ?? '',
            bio: this.user.bio ?? ''
          };
        } else {
          console.log('Response success or data missing:', { success: response.success, hasData: !!response.data });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.errorMessage = 'Error al cargar el perfil';
        this.loading = false;
      }
    });
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.user) {      // Reset form data if canceling
      this.formData = {
        name: this.user.name,
        email: this.user.email,
        phone: this.user.phone ?? '',
        bio: this.user.bio ?? ''
      };
    }
    this.message = '';
    this.errorMessage = '';
  }

  saveProfile(): void {
    this.loading = true;
    this.userService.updateProfile(this.formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.user = response.data!;
          this.isEditing = false;
          this.message = 'Perfil actualizado correctamente';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.errorMessage = error.error?.message ?? 'Error al actualizar el perfil';
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadAvatar(file);
    }
  }

  uploadAvatar(file: File): void {
    this.loading = true;
    this.userService.uploadAvatar(file).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadUserProfile(); // Reload to get updated avatar
          this.message = 'Avatar actualizado correctamente';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error uploading avatar:', error);
        this.errorMessage = 'Error al subir el avatar';
        this.loading = false;
      }
    });
  }

  getAvatarUrl(): string {
    return this.user?.avatar ? this.userService.getAvatarUrl(this.user.avatar) : '';
  }  getInitials(name?: string): string {
    const nameToUse = name ?? this.user?.name ?? '';
    if (!nameToUse) return '';
    return nameToUse.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarBackgroundColor(): string {
    const colors = [
      'bg-slate-500', 'bg-gray-500', 'bg-zinc-500', 'bg-neutral-500',
      'bg-stone-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-500',
      'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-emerald-500',
      'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500',
      'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
      'bg-pink-500', 'bg-rose-500'
    ];
    
    const name = this.user?.name ?? '';
    if (!name) return 'bg-gray-500';
    
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }
  goToChats(): void {
    this.router.navigate(['/chats']);
  }

  goToFavorites(): void {
    this.router.navigate(['/favourites']);
  }  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  loadRecentChats(): void {
    // For now, just initialize as empty array
    // In a real app, this would call an API service
    this.recentChats = [];
  }

  navigateToChat(chatId: number): void {
    this.router.navigate(['/chat', chatId]);
  }

  getTimeAgo(dateString: string): string {
    if (!dateString) return '';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString();
  }
}
