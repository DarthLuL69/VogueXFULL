import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sell',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss']
})
export class SellComponent {
  constructor() {
    console.log('SellComponent initialized');
  }
} 