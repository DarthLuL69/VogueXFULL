import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AboutSectionComponent } from '../../components/about-section/about-section.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, AboutSectionComponent],
  template: `
    <app-about-section></app-about-section>
  `,
  styles: []
})
export class AboutComponent {} 