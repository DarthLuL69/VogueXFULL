import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-16">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p class="text-lg text-gray-600">
          At VogueX, we value your privacy and are committed to protecting your personal information.
        </p>
        <div class="mt-8">
          <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
               alt="Privacy and security" 
               class="w-full h-48 object-cover rounded-lg">
        </div>
      </div>
      
      <div class="prose prose-lg max-w-none space-y-12">
        <section class="bg-gray-50 p-8 rounded-lg">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6">Information We Collect</h2>
          <p class="text-gray-600 mb-4">We may collect the following types of information:</p>
          <div class="grid md:grid-cols-2 gap-6">
            <ul class="space-y-3 text-gray-600">
              <li class="flex items-start">
                <span class="text-blue-500 mr-3 mt-1">•</span>
                Personal Information: Name, email, phone number, shipping address
              </li>
              <li class="flex items-start">
                <span class="text-blue-500 mr-3 mt-1">•</span>
                Account Data: Username, profile details, registration info
              </li>
            </ul>
            <ul class="space-y-3 text-gray-600">
              <li class="flex items-start">
                <span class="text-blue-500 mr-3 mt-1">•</span>
                Activity Data: Listings, purchases, messages
              </li>
              <li class="flex items-start">
                <span class="text-blue-500 mr-3 mt-1">•</span>
                Technical Data: Device type, browser, IP address
              </li>
            </ul>
          </div>
        </section>

        <section class="space-y-6">
          <h2 class="text-2xl font-semibold text-gray-800">How We Use Your Information</h2>
          <p class="text-gray-600">We use your data to:</p>
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <ul class="space-y-4 text-gray-600">
              <li class="flex items-start">
                <span class="text-green-500 mr-3 mt-1">✓</span>
                Facilitate transactions between buyers and sellers
              </li>
              <li class="flex items-start">
                <span class="text-green-500 mr-3 mt-1">✓</span>
                Provide customer support and resolve disputes
              </li>
              <li class="flex items-start">
                <span class="text-green-500 mr-3 mt-1">✓</span>
                Improve and personalize your experience on the platform
              </li>
              <li class="flex items-start">
                <span class="text-green-500 mr-3 mt-1">✓</span>
                Ensure compliance with legal obligations and platform security
              </li>
            </ul>
          </div>
        </section>

        <section class="space-y-6">
          <h2 class="text-2xl font-semibold text-gray-800">Sharing Your Information</h2>
          <p class="text-gray-600">We only share your data in the following cases:</p>
          <div class="grid md:grid-cols-3 gap-6">
            <div class="bg-gray-50 p-6 rounded-lg text-center">
              <h3 class="font-semibold mb-3">Third-Party Services</h3>
              <p class="text-sm text-gray-600">For payment processing, shipping, and analytics</p>
            </div>
            <div class="bg-gray-50 p-6 rounded-lg text-center">
              <h3 class="font-semibold mb-3">Other Users</h3>
              <p class="text-sm text-gray-600">Limited information during transactions</p>
            </div>
            <div class="bg-gray-50 p-6 rounded-lg text-center">
              <h3 class="font-semibold mb-3">Legal Compliance</h3>
              <p class="text-sm text-gray-600">When required by law or for safety</p>
            </div>
          </div>
        </section>

        <section class="bg-black text-white p-8 rounded-lg">
          <h2 class="text-2xl font-semibold mb-6">Your Rights</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-semibold mb-3">Access & Control</h3>
              <p class="text-gray-300 text-sm">You have the right to access, update, or delete your personal information.</p>
            </div>
            <div>
              <h3 class="font-semibold mb-3">Data Portability</h3>
              <p class="text-gray-300 text-sm">Request a copy of your data in a portable format.</p>
            </div>
          </div>
          <button class="mt-6 bg-white text-black px-6 py-3 font-medium rounded-lg hover:bg-gray-100 transition-colors">
            Contact Us About Privacy
          </button>
        </section>

        <section class="text-center py-8">
          <p class="text-gray-500 text-sm">
            Last updated: June 2025 | Questions? Contact us at privacy&#64;voguex.com
          </p>
        </section>
      </div>
    </div>
  `
})
export class PrivacyComponent {

}
