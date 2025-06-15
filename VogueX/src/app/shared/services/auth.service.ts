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
      this.isAuthenticatedSubject.next(true);
      
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const tokenData = JSON.parse(atob(tokenParts[1]));
          
          if (tokenData.sub && tokenData.name) {
            const user: User = {
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
        console.error('Token decode error:', e);
      }
    } else {
      this.isAuthenticatedSubject.next(false);
      this.currentUserSubject.next(null);
    }
  }
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
          this.currentUserSubject.next(response.data);
          this.isAuthenticatedSubject.next(true);
        } else {
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
    
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, dataToSend).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.tokenStorage.saveToken(response.data.token);
          this.currentUserSubject.next(response.data.user);
          this.isAuthenticatedSubject.next(true);
          this.router.navigate(['/home']);
        }
      }),
      catchError((error: any) => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.tokenStorage.saveToken(response.data.token);
          this.currentUserSubject.next(response.data.user);
          this.isAuthenticatedSubject.next(true);
          this.router.navigate(['/home']);
        }
      }),
      catchError((error: any) => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }  logout(): void {
    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.post(`${this.baseUrl}/logout`, {}, { headers }).subscribe({
        error: err => console.error('Logout error:', err)
      });
    }
    
    this.tokenStorage.removeToken();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/']);
  }

  getCurrentUser(): Observable<{ success: boolean; data?: User }> {
    const token = this.getToken();
    if (!token) {
      return new Observable(observer => {
        observer.next({ success: false });
        observer.complete();
      });
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ success: boolean; data?: User }>(`${this.baseUrl}/user`, { headers }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.currentUserSubject.next(response.data);
          this.isAuthenticatedSubject.next(true);
          this.tokenStorage.saveToken(token);
        }
      }),
      catchError((error: any) => {
        console.error('Get user error:', error);
        if (error.status === 401) {
          this.currentUserSubject.next(null);
          this.isAuthenticatedSubject.next(false);
          this.tokenStorage.removeToken();
        }
        return throwError(() => error);
      })
    );
  }

  isAuthenticated(): boolean {
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
