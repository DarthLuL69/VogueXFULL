import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-gray-100 mt-auto py-4">
      <div class="container mx-auto px-4 flex items-center justify-between text-sm text-gray-600">
        <div class="flex space-x-6">
          <a routerLink="/about" class="hover:underline">ABOUT</a>
          <a routerLink="/your-privacy-choices" class="hover:underline">YOUR PRIVACY CHOICES</a>
          <a routerLink="/terms" class="hover:underline">TERMS</a>
          <a routerLink="/privacy" class="hover:underline">PRIVACY</a>
          <a routerLink="/trust" class="hover:underline">TRUST</a>
          <a routerLink="/contact" class="hover:underline">CONTACT</a>
        </div>
        <div class="flex items-center space-x-6">
          <div class="flex space-x-4">
            <!-- Iconos de redes sociales (placeholders) -->
            <a href="#" class="hover:text-gray-900"><i class="fab fa-instagram"></i></a>
            <a href="#" class="hover:text-gray-900"><i class="fab fa-facebook-f"></i></a>
            <a href="#" class="hover:text-gray-900"><i class="fab fa-twitter"></i></a>
          </div>
          <p>&copy; VogueX © 2025</p>
        </div>
      </div>
    </footer>
  `,
  styles: []
})
export class FooterComponent {} 