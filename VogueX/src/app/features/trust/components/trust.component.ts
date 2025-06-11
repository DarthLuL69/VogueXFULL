import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-trust',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 class="text-4xl font-bold text-center mb-8">Trust.</h1>
      <p class="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-16">
        The shared experiences between buyers and sellers
        on VogueX is our #1 priority. We take actions that
        protect our community and prevent risk.
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div class="flex flex-col items-center text-center">
          <div class="w-24 h-24 bg-gray-200 rounded-full mb-6"></div>
          <h2 class="text-2xl font-semibold mb-4">Authentication</h2>
          <p class="text-gray-600">
            Brand and marketplace experts take a
            hands-on approach to digital
            moderation.
          </p>
        </div>

        <div class="flex flex-col items-center text-center">
          <div class="w-24 h-24 bg-gray-200 rounded-full mb-6"></div>
          <h2 class="text-2xl font-semibold mb-4">Legit Sellers</h2>
          <p class="text-gray-600">
            A strong feedback system utilizes the
            opinions and experiences of the
            VogueX community to create a
            barometer of trust.
          </p>
        </div>

        <div class="flex flex-col items-center text-center">
          <div class="w-24 h-24 bg-gray-200 rounded-full mb-6"></div>
          <h2 class="text-2xl font-semibold mb-4">VogueX Purchase<br>Protection</h2>
          <p class="text-gray-600">
            We want you to feel confident buying
            and selling on VogueX. That's why we
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
  styles: []
})
export class TrustComponent {} 