import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrailedApiService } from '../../shared/services/grailed-api.service';
import { FavoriteService } from '../../shared/services/favorite.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-designers',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './designers.component.html',
  styleUrls: ['./designers.component.scss']
})
export class DesignersComponent implements OnInit {
  designers: string[] = [];
  groupedDesigners: { [key: string]: string[] } = {};

  Object = Object;

  constructor(private apiService: GrailedApiService, private favoriteService: FavoriteService) { }

  ngOnInit(): void {
    this.loadDesigners();
  }

  loadDesigners(): void {
    this.apiService.search('', 1, 1000, 'mostrecent').subscribe(results => {
      console.log('API Search Results for Designers:', results);
      if (results && results.hits && results.hits.length > 0) {
        const extractedDesigners = results.hits
          .map((hit: any) => hit.designer || hit.brand)
          .filter((designer: any) => designer)
          .reduce((unique: string[], item: string) => unique.includes(item) ? unique : [...unique, item], []);

        this.designers = extractedDesigners.sort();
        this.groupDesigners(this.designers);

      }
    });
  }

  groupDesigners(designers: string[]): void {
    this.groupedDesigners = designers.reduce((groups, designer) => {
      const initial = designer.charAt(0).toUpperCase();
      if (!groups[initial]) {
        groups[initial] = [];
      }
      groups[initial].push(designer);
      return groups;
    }, {} as { [key: string]: string[] });
  }

  toggleFavoriteDesigner(designerName: string): void {
    if (this.favoriteService.isFavoriteDesigner(designerName)) {
      this.favoriteService.removeFavoriteDesigner(designerName);
    } else {
      this.favoriteService.addFavoriteDesigner(designerName);
    }
  }

  isFavoriteDesigner(designerName: string): boolean {
    return this.favoriteService.isFavoriteDesigner(designerName);
  }
}
