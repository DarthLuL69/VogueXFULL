import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-16">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">Terms & Conditions</h1>
        <p class="text-lg text-gray-600">
          Please read these terms carefully before using VogueX.
        </p>
        <div class="mt-8">
          <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
               alt="Legal documents" 
               class="w-full h-48 object-cover rounded-lg">
        </div>
      </div>
      
      <div class="space-y-12">
        <section class="bg-gray-50 p-8 rounded-lg">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6">Welcome to VogueX</h2>
          <p class="text-gray-600 leading-relaxed mb-4">
            By accessing and using VogueX, you agree to comply with and be bound by these terms and conditions. 
            If you do not agree with any part of these terms, please do not use our platform.
          </p>
          <div class="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p class="text-blue-800 font-medium">
              These terms apply to all users: buyers, sellers, and visitors.
            </p>
          </div>
        </section>

        <section class="space-y-6">
          <h2 class="text-2xl font-semibold text-gray-800">Platform Usage</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <h3 class="font-semibold mb-3 text-green-700">What You Can Do</h3>
              <ul class="space-y-2 text-gray-600 text-sm">
                <li class="flex items-start">
                  <span class="text-green-500 mr-2 mt-1">✓</span>
                  Buy and sell authentic fashion items
                </li>
                <li class="flex items-start">
                  <span class="text-green-500 mr-2 mt-1">✓</span>
                  Create listings with accurate descriptions
                </li>
                <li class="flex items-start">
                  <span class="text-green-500 mr-2 mt-1">✓</span>
                  Communicate respectfully with other users
                </li>
                <li class="flex items-start">
                  <span class="text-green-500 mr-2 mt-1">✓</span>
                  Report suspicious activity
                </li>
              </ul>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <h3 class="font-semibold mb-3 text-red-700">What's Prohibited</h3>
              <ul class="space-y-2 text-gray-600 text-sm">
                <li class="flex items-start">
                  <span class="text-red-500 mr-2 mt-1">✗</span>
                  Selling counterfeit or replica items
                </li>
                <li class="flex items-start">
                  <span class="text-red-500 mr-2 mt-1">✗</span>
                  Creating fake accounts or profiles
                </li>
                <li class="flex items-start">
                  <span class="text-red-500 mr-2 mt-1">✗</span>
                  Harassment or abusive behavior
                </li>
                <li class="flex items-start">
                  <span class="text-red-500 mr-2 mt-1">✗</span>
                  Circumventing platform fees
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section class="space-y-6">
          <h2 class="text-2xl font-semibold text-gray-800">Buying & Selling</h2>
          <div class="space-y-4">
            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="font-semibold mb-3">For Sellers</h3>
              <p class="text-gray-600 text-sm mb-3">
                You are responsible for accurate item descriptions, timely shipping, and providing authentic items only.
              </p>
              <div class="bg-white p-4 rounded border">
                <p class="text-sm"><strong>Commission Fee:</strong> 9% on successful sales</p>
              </div>
            </div>
            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="font-semibold mb-3">For Buyers</h3>
              <p class="text-gray-600 text-sm">
                Review item descriptions carefully and communicate with sellers before purchasing. 
                All transactions are protected by our buyer protection policy.
              </p>
            </div>
          </div>
        </section>

        <section class="bg-black text-white p-8 rounded-lg">
          <h2 class="text-2xl font-semibold mb-6">Important Legal Information</h2>
          <div class="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 class="font-semibold mb-3">Limitation of Liability</h3>
              <p class="text-gray-300">
                VogueX acts as a marketplace facilitator. We are not responsible for the quality, safety, 
                or legality of items listed.
              </p>
            </div>
            <div>
              <h3 class="font-semibold mb-3">Dispute Resolution</h3>
              <p class="text-gray-300">
                We encourage users to resolve disputes amicably. Our support team is available to assist 
                when needed.
              </p>
            </div>
          </div>
        </section>

        <section class="space-y-6">
          <h2 class="text-2xl font-semibold text-gray-800">Account Termination</h2>
          <p class="text-gray-600">
            We reserve the right to suspend or terminate accounts that violate these terms. 
            Users may also delete their accounts at any time through their profile settings.
          </p>
        </section>

        <section class="text-center py-8 border-t border-gray-200">
          <p class="text-gray-500 text-sm mb-4">
            Last updated: June 2025
          </p>
          <p class="text-gray-500 text-sm">
            Questions about these terms? Contact us at legal&#64;voguex.com
          </p>
        </section>
      </div>
    </div>
  `
})
export class TermsComponent {

}
