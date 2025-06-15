import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  constructor() {
    this.loadToken();
  }

  private loadToken(): void {
    const token = localStorage.getItem('auth_token');
    this.tokenSubject.next(token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
    this.tokenSubject.next(token);
  }

  removeToken(): void {
    localStorage.removeItem('auth_token');
    this.tokenSubject.next(null);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }
}
