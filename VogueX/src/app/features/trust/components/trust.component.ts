import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-trust',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h1 class="text-4xl font-bold mb-4">Trust.</h1>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto">
          The shared experiences between buyers and sellers on VogueX is our #1 priority. 
          We take actions that protect our community and prevent risk.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
        <div class="flex flex-col items-center text-center">
          <div class="mb-6">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80" 
                 alt="Authentication process" 
                 class="w-24 h-24 rounded-full object-cover">
          </div>
          <h2 class="text-2xl font-semibold mb-4">Authentication</h2>
          <p class="text-gray-600">
            Brand and marketplace experts take a hands-on approach to digital moderation.
          </p>
        </div>

        <div class="flex flex-col items-center text-center">
          <div class="mb-6">
            <img src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80" 
                 alt="Verified sellers" 
                 class="w-24 h-24 rounded-full object-cover">
          </div>
          <h2 class="text-2xl font-semibold mb-4">Legit Sellers</h2>
          <p class="text-gray-600">
            A strong feedback system utilizes the opinions and experiences of the VogueX community to create a barometer of trust.
          </p>
        </div>

        <div class="flex flex-col items-center text-center">
          <div class="mb-6">
            <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80" 
                 alt="Purchase protection" 
                 class="w-24 h-24 rounded-full object-cover">
          </div>
          <h2 class="text-2xl font-semibold mb-4">VogueX Purchase<br>Protection</h2>
          <p class="text-gray-600">
            We want you to feel confident buying and selling on VogueX. That's why we offer Purchase Protection on qualifying orders. 
            In the rare case that something goes wrong with your sale or order, our support team will work with you on a resolution.
          </p>
        </div>
      </div>

      <!-- Additional Trust Features -->
      <div class="bg-gray-50 p-12 rounded-lg">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl font-bold mb-6">Buyer Protection & Authenticity Checks</h2>
            <ul class="space-y-4 text-gray-600">
              <li class="flex items-start">
                <span class="text-green-500 mr-3 mt-1">✓</span>
                Every item is inspected by our authentication team
              </li>
              <li class="flex items-start">
                <span class="text-green-500 mr-3 mt-1">✓</span>
                Full refund protection for qualifying purchases
              </li>
              <li class="flex items-start">
                <span class="text-green-500 mr-3 mt-1">✓</span>
                Secure payment processing with PayPal integration
              </li>
              <li class="flex items-start">
                <span class="text-green-500 mr-3 mt-1">✓</span>
                24/7 customer support for dispute resolution
              </li>
            </ul>
            <button class="mt-8 bg-black text-white px-8 py-3 font-semibold hover:bg-gray-800 transition-colors">
              Learn More About Protection
            </button>
          </div>
          <div>
            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                 alt="Secure shopping" 
                 class="w-full h-80 object-cover rounded-lg">
          </div>
        </div>
      </div>
    </div>
  `
})
export class TrustComponent {

}