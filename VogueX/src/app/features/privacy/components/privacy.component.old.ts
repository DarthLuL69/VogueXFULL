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
            <li>You can control cookie preferences through your browser settings.</li>
          </ul>
        </section>

        <section class="space-y-4">
          <h2 class="text-2xl font-semibold text-gray-800">5. Data Security</h2>
          <p class="text-gray-600 leading-relaxed">
            We take appropriate measures to safeguard your personal information, including encryption, secure servers, and limited
            access to your data. However, no method of transmission or storage is 100% secure.
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-2xl font-semibold text-gray-800">6. Your Rights</h2>
          <p class="text-gray-600">You have the right to:</p>
          <ul class="list-disc pl-6 space-y-2 text-gray-600">
            <li>Access and review your personal data.</li>
            <li>Correct inaccuracies in your information.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Opt out of promotional communications at any time.</li>
          </ul>
        </section>

        <section class="space-y-4">
          <h2 class="text-2xl font-semibold text-gray-800">7. Data Retention</h2>
          <p class="text-gray-600 leading-relaxed">
            We retain your data for as long as necessary to provide services, comply with legal obligations, or resolve disputes.
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-2xl font-semibold text-gray-800">8. Third-Party Links</h2>
          <p class="text-gray-600 leading-relaxed">
            VogueX may include links to third-party websites. We are not responsible for their privacy practices, so review their
            policies separately.
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-2xl font-semibold text-gray-800">9. Children's Privacy</h2>
          <p class="text-gray-600 leading-relaxed">
            VogueX is not intended for individuals under 18 years of age. We do not knowingly collect data from minors.
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-2xl font-semibold text-gray-800">10. Policy Updates</h2>
          <p class="text-gray-600 leading-relaxed">
            We may update this Privacy Policy from time to time. Changes will be communicated via email or platform notifications.
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-2xl font-semibold text-gray-800">11. Contact Us</h2>
          <p class="text-gray-600">If you have questions or concerns about this Privacy Policy, contact us at:</p>
          <ul class="list-disc pl-6 space-y-2 text-gray-600">
            <li>Email: support&#64;voguex.com</li>
            <li>Address: VogueX, [Your Office Address Here].</li>
          </ul>
        </section>

        <section id="your-privacy-choices" class="space-y-8">
          <h2 class="text-2xl font-semibold text-gray-800">Your Privacy Choices</h2>
          <p class="text-gray-600 leading-relaxed">At VogueX, we are committed to protecting your privacy and empowering you with control over your personal data. This section explains how you can manage your privacy preferences and exercise your rights under applicable data protection laws.</p>
          
          <div class="space-y-6">
            <div class="space-y-4">
              <h3 class="text-xl font-semibold text-gray-800">1. Marketing Communications</h3>
              <p class="text-gray-600 leading-relaxed">You can opt-out of receiving promotional emails and newsletters from VogueX at any time by clicking the "unsubscribe" link at the bottom of our emails or by updating your communication preferences in your account settings. Please note that even if you opt-out of marketing communications, we may still send you non-promotional messages related to your account, transactions, or our ongoing business relations.</p>
            </div>

            <div class="space-y-4">
              <h3 class="text-xl font-semibold text-gray-800">2. Cookie Preferences</h3>
              <p class="text-gray-600 leading-relaxed">We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content. You have the ability to manage your cookie preferences through your browser settings. Most browsers allow you to:</p>
              <ul class="list-disc pl-6 space-y-2 text-gray-600">
                <li>See what cookies you have and delete them on an individual basis.</li>
                <li>Block third-party cookies.</li>
                <li>Block cookies from particular sites.</li>
                <li>Block all cookies from being set.</li>
                <li>Delete all cookies when you close your browser.</li>
              </ul>
              <p class="text-gray-600 leading-relaxed">Please be aware that restricting cookies may impact the functionality and features of the VogueX platform.</p>
            </div>

            <div class="space-y-4">
              <h3 class="text-xl font-semibold text-gray-800">3. Accessing and Correcting Your Data</h3>
              <p class="text-gray-600 leading-relaxed">You have the right to access the personal information we hold about you and to request corrections if any data is inaccurate or incomplete. You can usually review and update your account information directly in your profile settings. For more complex requests or to obtain a copy of your data, please contact our support team at support&#64;voguex.com.</p>
            </div>

            <div class="space-y-4">
              <h3 class="text-xl font-semibold text-gray-800">4. Data Deletion and Account Closure</h3>
              <p class="text-gray-600 leading-relaxed">If you wish to close your account and request the deletion of your personal data, please contact our support team. We will process your request in accordance with applicable legal requirements. Please note that some data may be retained for a limited period to comply with legal obligations, resolve disputes, or enforce our agreements.</p>
            </div>

            <div class="space-y-4">
              <h3 class="text-xl font-semibold text-gray-800">5. Do Not Sell My Personal Information (for California Residents)</h3>
              <p class="text-gray-600 leading-relaxed">If you are a California resident, you have the right under the California Consumer Privacy Act (CCPA) to opt-out of the "sale" of your personal information. VogueX does not sell your personal information in the traditional sense. However, certain sharing of data for cross-context behavioral advertising or other similar purposes may be considered a "sale" under the CCPA. To exercise your right to opt-out, please contact us at support&#64;voguex.com.</p>
            </div>

            <div class="space-y-4">
              <h3 class="text-xl font-semibold text-gray-800">6. International Data Transfers</h3>
              <p class="text-gray-600 leading-relaxed">Your data may be transferred to and processed in countries outside of your own, where data protection laws may differ. We implement appropriate safeguards to ensure your personal information remains protected in accordance with this Privacy Policy.</p>
            </div>

            <div class="space-y-4">
              <h3 class="text-xl font-semibold text-gray-800">7. Contacting Us About Your Choices</h3>
              <p class="text-gray-600 leading-relaxed">For any questions or requests regarding your privacy choices, please contact us at support&#64;voguex.com. We will respond to your request within a reasonable timeframe and in accordance with applicable laws.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: []
})
export class PrivacyComponent {} 