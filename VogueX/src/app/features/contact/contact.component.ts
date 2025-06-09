import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-4">Submit a request</h1>
      <p class="text-gray-600 mb-6">Fields marked with an asterisk (*) are required.</p>
      
      <div>
        <form class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Your email address*</label>
            <input type="email" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Subject*</label>
            <input type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">How can we help?*</label>
            <select class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
              <option value="">Select an option</option>
              <option value="buyer_order">I'm a buyer with an order question</option>
              <option value="seller_listing">I'm a seller with a listing or sale question</option>
              <option value="update_account">I'd like to update my account</option>
              <option value="no_order_number">I don't have an order number</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Description*</label>
            <textarea rows="4" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
          </div>
          
          <div>
            <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black">
              SUBMIT
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class ContactComponent {} 