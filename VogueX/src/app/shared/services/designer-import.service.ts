import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DesignerImportService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  /**
   * Importar diseñadores desde Grailed API
   * @param quantity Cantidad de diseñadores a importar (por defecto 1000)
   * @returns Observable con el resultado de la importación
   */
  importDesignersFromGrailed(quantity: number = 1000): Observable<any> {
    console.log(`Iniciando importación de ${quantity} diseñadores desde Grailed`);
    
    return this.http.post(`${this.apiUrl}/designers/import`, { quantity })
      .pipe(
        tap(
          response => console.log('Importación completada:', response),
          error => console.error('Error en la importación:', error)
        )
      );
  }

  /**
   * Obtener estadísticas de los diseñadores importados
   * @returns Observable con las estadísticas
   */
  getDesignerStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/designers/statistics`);
  }
}
