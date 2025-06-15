import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/components/footer/footer.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { AuthService } from './shared/services/auth.service';
import { TokenStorageService } from './core/services/token-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FooterComponent, HeaderComponent]
})
export class AppComponent implements OnInit {
  title = 'VogueX';

  constructor(
    private readonly authService: AuthService,
    private readonly tokenStorage: TokenStorageService
  ) {}  ngOnInit(): void {
    // Verificar el token al inicio de la aplicación
    console.log('Iniciando aplicación, verificando autenticación...');
    
    // Comprobar si hay un token almacenado y validar la sesión
    const token = this.tokenStorage.getToken();
    if (token) {
      console.log('Token encontrado, validando sesión...');
      this.authService.validateSession().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            console.log('Sesión validada correctamente');
          } else {
            console.warn('Token inválido, sesión no válida');
          }
        },
        error: (err) => {
          console.error('Error al validar sesión:', err);
        }
      });
    } else {
      console.log('No hay token almacenado');
    }
  }
}
