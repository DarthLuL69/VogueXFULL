import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  role: string;
  created_at: string;
}

export interface UserResponse {
  success: boolean;
  message?: string;
  data?: User;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) { }

  // Obtener perfil del usuario
  getProfile(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/user/profile`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.currentUserSubject.next(response.data);
        }
      })
    );
  }

  // Actualizar perfil del usuario
  updateProfile(profileData: Partial<User>): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/user/profile`, profileData).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.currentUserSubject.next(response.data);
        }
      })
    );
  }

  // Subir avatar
  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
      return this.http.post<any>(`${this.apiUrl}/user/avatar`, formData).pipe(
      tap(response => {
        if (response.success) {
          const currentUser = this.currentUserSubject.value;
          if (currentUser) {
            currentUser.avatar = response.avatar_url;
            this.currentUserSubject.next(currentUser);
          }
        }
      })
    );
  }

  getAvatarUrl(user?: User | null, avatar?: string): string {
    if (user?.avatar_url) {
      return user.avatar_url;
    }
    
    const avatarPath = avatar ?? user?.avatar;
    if (!avatarPath) {
      return '';
    }
    return `${environment.apiUrl}/storage/${avatarPath}`;
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Establecer usuario actual
  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }
}
