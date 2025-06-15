import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';

// Lista de URLs que no requieren autenticación
const publicUrls: string[] = [
  'api/login', 
  'api/register',
  'api/designers', // Permitir acceso público a la lista de diseñadores
  'api/products', // Permitir acceso público a la lista de productos (solo GET)
  'api/categories' // Permitir acceso público a categorías
];

// Función para determinar si una URL es pública
const isPublicUrl = (url: string): boolean => {
  // Si es una URL de login o registro, siempre es pública
  if (publicUrls.some(publicUrl => url.includes(publicUrl))) {
    return true;
  }
  
  // Para productos y otros endpoints que pueden ser públicos solo para GET
  if (url.includes('api/products') && !url.includes('/create') && !url.includes('/update') && !url.includes('/delete')) {
    return true;
  }
  
  return false;
};

// Función para añadir el token a una petición
const addToken = (req: HttpRequest<any>, token: string): HttpRequest<any> => {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);
  
  // Si es una URL pública, no añadir token
  if (isPublicUrl(req.url)) {
    return next(req);
  }
  
  const token = tokenStorage.getToken();
  // Si hay token, añadirlo a la petición
  if (token) {
    const authReq = addToken(req, token);
    
    // Procesar la respuesta y manejar errores de autenticación
    return next(authReq).pipe(
      catchError(error => {
        // Si recibimos un 401 Unauthorized, el token expiró o no es válido
        if (error.status === 401) {
          console.warn('Token no válido o expirado, cerrando sesión');
          
          // Limpiar el token del almacenamiento
          tokenStorage.removeToken();
          
          // Redirigir al login
          router.navigate(['/login']);
          
          return throwError(() => new Error('Session expired'));
        }
        
        // Para otros errores, simplemente propagarlos
        return throwError(() => error);
      })
    );
  }
  
  // Si no hay token, continuar sin autenticación
  return next(req);
};
