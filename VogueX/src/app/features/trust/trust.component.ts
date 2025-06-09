import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-trust',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="trust-container">
      <h1>Trust.</h1>
      <p class="trust-subtitle">
        The shared experiences between buyers and sellers
        on Grailed is our #1 priority. We take actions that
        protect our community and prevent risk.
      </p>
      
      <div class="trust-columns">
        <div class="trust-column">
          <div class="image-placeholder"></div>
          <h2>Authentication</h2>
          <p>
            Brand and marketplace experts take a
            hands-on approach to digital
            moderation.
          </p>
        </div>

        <div class="trust-column">
          <div class="image-placeholder"></div>
          <h2>Legit Sellers</h2>
          <p>
            A strong feedback system utilizes the
            opinions and experiences of the
            Grailed community to create a
            barometer of trust.
          </p>
        </div>

        <div class="trust-column">
          <div class="image-placeholder"></div>
          <h2>VogueX Purchase<br>Protection</h2>
          <p>
            We want you to feel confident buying
            and selling on Grailed. That's why we
            offer Purchase Protection on qualifying
            orders. In the rare case that something
            goes wrong with your sale or order, our
            support team will work with you on a
            resolution.
          </p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./trust.component.scss']
})
export class TrustComponent {} 