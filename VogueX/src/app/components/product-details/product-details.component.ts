import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="product-details-container">
      <div class="image-gallery">
        <div class="main-image-placeholder">
          <!-- Placeholder para la imagen principal -->
        </div>
        <div class="thumbnail-images">
          <!-- Placeholders para las miniaturas -->
          <div class="thumbnail-placeholder"></div>
          <div class="thumbnail-placeholder"></div>
          <div class="thumbnail-placeholder"></div>
          <div class="thumbnail-placeholder"></div>
          <div class="thumbnail-placeholder"></div>
          <div class="thumbnail-placeholder"></div>
          <div class="thumbnail-placeholder"></div>
          <div class="thumbnail-placeholder"></div>
          <div class="thumbnail-placeholder"></div>
        </div>
      </div>

      <div class="product-info-section">
        <div class="product-title">
          <h2>Comme des Garcons</h2>
          <p>Comme des Garcons Wallet</p>
        </div>

        <div class="favorite">
           <svg class="favorite-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
          </svg>
          <span>69</span>
        </div>

        <div class="product-meta">
          <p>Size: OS</p>
          <p>Color: Black/White</p>
        </div>

        <div class="product-price">
          <span>360€</span>
          <p>+ 30€ Shipping -- US to Europe</p>
        </div>

        <div class="action-buttons">
          <button class="buy-button">PURCHASE</button>
          <button class="sell-button">SELL</button>
          <button class="message-button">MESSAGE</button>
        </div>

        <div class="seller-info">
          <div class="seller-avatar-placeholder"></div>
          <span>alexr_skrr</span>
          <p>0 Transactions 5 Items for sale</p>
        </div>

        <div class="seller-description">
          <h3>Seller Description</h3>
          <p>
            👀Discount when buying multiple items<br>
            (message me beforehand)🤞✨
          </p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent {

}
