import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AboutSectionComponent } from '../../../shared/components/ui';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, AboutSectionComponent],
  template: `
    <div class="about-page">
      <app-about-section></app-about-section>
    </div>
  `
})
export class AboutComponent {

}
