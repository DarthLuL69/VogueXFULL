import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GrailedApiService {
  private apiUrl = 'https://grailed.p.rapidapi.com/search';
  private apiKey = '06dabf243bmsh6717422b8d94e56p1d6004jsn3110106e45e2';
  private apiHost = 'grailed.p.rapidapi.com';

  constructor(private http: HttpClient) { }

  search(query: string, page: number = 1, hitsPerPage: number = 32, sortBy: string = 'mostrecent'): Observable<any> {
    const headers = new HttpHeaders({
      'x-rapidapi-host': this.apiHost,
      'x-rapidapi-key': this.apiKey
    });

    let params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('hitsPerPage', hitsPerPage.toString())
      .set('sortBy', sortBy);

    return this.http.get(this.apiUrl, { headers, params });
  }
}
