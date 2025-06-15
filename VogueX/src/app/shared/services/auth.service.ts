import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TokenStorageService } from '../../core/services/token-storage.service';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    token: string;
  };
  errors?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {  private readonly baseUrl = 'http://localhost:8000/api';
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly tokenStorage: TokenStorageService
  ) {
    // Initialize authentication state based on stored token
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = this.getToken();
    if (token) {
      console.log('Token encontrado en localStorage');
      // Set initial authenticated state based on token presence
      // User data will be loaded on-demand when needed
      this.isAuthenticatedSubject.next(true);
      
      // Try to extract user data from JWT token if possible
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const tokenData = JSON.parse(atob(tokenParts[1]));
          console.log('Información extraída del token:', tokenData);
          
          // Set user data from token if available
          if (tokenData.sub && tokenData.name) {            const user: User = {
              id: tokenData.sub,
              name: tokenData.name,
              email: tokenData.email ?? '',
              role: tokenData.role ?? 'user',
              created_at: tokenData.iat ? new Date(tokenData.iat * 1000).toISOString() : ''
            };
            this.currentUserSubject.next(user);
          }
        }
      } catch (e) {
        console.log('El token no es un JWT válido o no se pudo decodificar', e);
      }
    } else {
      console.log('No se encontró token en localStorage');
      this.isAuthenticatedSubject.next(false);
      this.currentUserSubject.next(null);
    }
  }

  // Public method to validate current session
  validateSession(): Observable<{ success: boolean; data?: User }> {
    const token = this.getToken();
    if (!token) {
      this.isAuthenticatedSubject.next(false);
      this.currentUserSubject.next(null);
      return new Observable(observer => {
        observer.next({ success: false });
        observer.complete();
      });
    }

    return this.getCurrentUser().pipe(
      tap(response => {
        if (response.success && response.data) {
          console.log('Sesión validada exitosamente');
          this.currentUserSubject.next(response.data);
          this.isAuthenticatedSubject.next(true);
        } else {
          console.warn('El token ya no es válido');
          this.logout();
        }
      }),
      catchError((err) => {
        console.error('Error al validar la sesión:', err);
        this.logout();
        return throwError(() => err);
      })
    );
  }register(userData: { name: string; email: string; password: string; confirmPassword: string }): Observable<AuthResponse> {
    const { confirmPassword, ...dataToSend } = userData;
    
    console.log('Intentando registrar usuario:', dataToSend.email);
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, dataToSend).pipe(
      tap(response => {
        if (response.success && response.data) {          console.log('Usuario registrado correctamente con token:', response.data.token);
          
          // Guardar token y datos de usuario
          this.tokenStorage.saveToken(response.data.token);
          this.currentUserSubject.next(response.data.user);
          this.isAuthenticatedSubject.next(true);
          
          // Navegar a la página principal después del registro exitoso
          this.router.navigate(['/home']);
        } else {
          console.warn('Registro falló con respuesta:', response);
        }
      }),
      catchError((error: any) => {
        console.error('Error en el registro:', error);
        return throwError(() => error);
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    console.log('Intentando iniciar sesión con:', credentials.email);
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {          console.log('Inicio de sesión correcto con token:', response.data.token);
          
          // Guardar token y datos de usuario
          this.tokenStorage.saveToken(response.data.token);
          this.currentUserSubject.next(response.data.user);
          this.isAuthenticatedSubject.next(true);
          
          // Navegar a la página principal después del inicio de sesión exitoso
          this.router.navigate(['/home']);
        } else {
          console.warn('Inicio de sesión falló con respuesta:', response);
        }
      }),
      catchError((error: any) => {
        console.error('Error en el inicio de sesión:', error);
        return throwError(() => error);
      })
    );
  }
  logout(): void {
    const token = this.getToken();
    if (token) {
      // Notificar al servidor sobre el cierre de sesión
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.post(`${this.baseUrl}/logout`, {}, { headers }).subscribe({
        next: () => console.log('Sesión cerrada en el servidor'),
        error: err => console.error('Error al cerrar sesión en el servidor:', err)
      });
    }
      // Limpiar datos locales
    this.tokenStorage.removeToken();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    console.log('Sesión cerrada localmente');
    
    // Redirigir a la página principal
    this.router.navigate(['/']);
  }  getCurrentUser(): Observable<{ success: boolean; data?: User }> {
    const token = this.getToken();
    if (!token) {
      console.log('No hay token para obtener el usuario actual');
      return new Observable(observer => {
        observer.next({ success: false });
        observer.complete();
      });
    }

    console.log('Obteniendo datos del usuario actual con token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ success: boolean; data?: User }>(`${this.baseUrl}/user`, { headers }).pipe(
      tap(response => {
        // Si la respuesta es exitosa, actualizar el usuario actual
        if (response.success && response.data) {
          console.log('Usuario obtenido correctamente:', response.data);
          this.currentUserSubject.next(response.data);
          this.isAuthenticatedSubject.next(true);
            // Asegurarse de que el token se guarde (por si acaso)
          this.tokenStorage.saveToken(token);
        } else {
          console.warn('Respuesta de usuario sin éxito o datos:', response);
        }
      }),
      catchError((error: any) => {
        // Si hay un error de autenticación, limpiar datos locales
        console.error('Error al obtener el usuario:', error);
        if (error.status === 401) {          console.warn('Error 401: Token no válido o expirado');
          this.currentUserSubject.next(null);
          this.isAuthenticatedSubject.next(false);
          this.tokenStorage.removeToken();
        }
        return throwError(() => error);
      })
    );
  }  isAuthenticated(): boolean {
    return this.tokenStorage.hasToken() && !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const currentUser = this.currentUserSubject.value;
    return !!currentUser && currentUser.role === 'admin';
  }

  get isAdmin$(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => !!user && user.role === 'admin')
    );
  }
  getToken(): string | null {
    return this.tokenStorage.getToken();
  }
}
