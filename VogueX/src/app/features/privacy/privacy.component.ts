import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-12">
      <h1 class="text-4xl font-bold mb-12 text-center">Privacy Policy of VogueX</h1>
      
      <div class="space-y-12">
        <section class="space-y-4">
          <h2 class="text-2xl font-semibold text-gray-800">1. Information We Collect</h2>
          <p class="text-gray-600">We may collect the following types of information:</p>
          <ul class="list-disc pl-6 space-y-2 text-gray-600">
            <li>Personal Information: Name, email, phone number, shipping address, and payment details.</li>
            <li>Account Data: Username, profile details, and any information you provide when registering.</li>
            <li>Activity Data: Listings, purchases, messages, and interactions on the platform.</li>
            <li>Technical Data: Device type, browser, IP address, and cookies for performance and analytics.</li>
          </ul>
        </section>

        <section class="space-y-4">
          <h2 class="text-2xl font-semibold text-gray-800">2. How We Use Your Information</h2>
          <p class="text-gray-600">We use your data to:</p>
          <ul class="list-disc pl-6 space-y-2 text-gray-600">
            <li>Facilitate transactions between buyers and sellers.</li>
            <li>Provide customer support and resolve disputes.</li>
            <li>Improve and personalize your experience on the platform.</li>
            <li>Communicate updates, promotions, or service changes.</li>
            <li>Ensure compliance with legal obligations and platform security.</li>
          </ul>
        </section>

        <section class="space-y-4">
          <h2 class="text-2xl font-semibold text-gray-800">3. Sharing Your Information</h2>
          <p class="text-gray-600">We only share your data in the following cases:</p>
          <ul class="list-disc pl-6 space-y-2 text-gray-600">
            <li>With Third-Party Services: For payment processing, shipping, and analytics.</li>
            <li>With Other Users: Limited information (e.g., shipping address) is shared with buyers or sellers during transactions.</li>
            <li>For Legal Compliance: When required by law or to protect the rights and safety of VogueX and its users.</li>
          </ul>
        </section>

        <section class="space-y-4">
          <h2 class="text-2xl font-semibold text-gray-800">4. Cookies and Tracking Technologies</h2>
          <ul class="list-disc pl-6 space-y-2 text-gray-600">
            <li>VogueX uses cookies to enhance functionality, track usage, and personalize content.</li>
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