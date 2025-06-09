import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
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
        // Redirigir al login si no está autenticado (ej. 401 Unauthorized)
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
