import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="terms-container">
      <h1>Terms and Conditions of VogueX</h1>
      
      <div class="terms-content">
        <section>
          <h2>1. Introduction</h2>
          <p>
            At VogueX, we value your privacy and are committed to protecting your personal information. This policy explains how
            we collect, use, and safeguard your data when you use our platform.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li>Personal Information: Name, email, phone number, shipping address, and payment details.</li>
            <li>Account Data: Username, profile details, and any information you provide when registering.</li>
            <li>Activity Data: Listings, purchases, messages, and interactions on the platform.</li>
            <li>Technical Data: Device type, browser, IP address, and cookies for performance and analytics.</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use your data to:</p>
          <ul>
            <li>Facilitate transactions between buyers and sellers.</li>
            <li>Provide customer support and resolve disputes.</li>
            <li>Improve and personalize your experience on the platform.</li>
            <li>Communicate updates, promotions, or service changes.</li>
            <li>Ensure compliance with legal obligations and platform security.</li>
          </ul>
        </section>

        <section>
          <h2>4. Sharing Your Information</h2>
          <p>We only share your data in the following cases:</p>
          <ul>
            <li>With Third-Party Services: For payment processing, shipping, and analytics.</li>
            <li>With Other Users: Limited information (e.g., shipping address) is shared with buyers or sellers during transactions.</li>
            <li>For Legal Compliance: When required by law or to protect the rights and safety of VogueX and its users.</li>
          </ul>
        </section>

        <section>
          <h2>5. Cookies and Tracking Technologies</h2>
          <ul>
            <li>VogueX uses cookies to enhance functionality, track usage, and personalize content.</li>
            <li>You can control cookie preferences through your browser settings.</li>
          </ul>
        </section>

        <section>
          <h2>6. Data Security</h2>
          <p>
            We take appropriate measures to safeguard your personal information, including encryption, secure servers, and limited
            access to your data. However, no method of transmission or storage is 100% secure.
          </p>
        </section>

        <section>
          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and review your personal data.</li>
            <li>Correct inaccuracies in your information.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Opt out of promotional communications at any time.</li>
          </ul>
        </section>

         <section>
          <h2>8. Data Retention</h2>
          <p>
            We retain your data for as long as necessary to provide services, comply with legal obligations, or resolve disputes.
          </p>
        </section>

         <section>
          <h2>9. Third-Party Links</h2>
          <p>
            VogueX may include links to third-party websites. We are not responsible for their privacy practices, so review their
            policies separately.
          </p>
        </section>

         <section>
          <h2>10. Children's Privacy</h2>
          <p>
            VogueX is not intended for individuals under 18 years of age. We do not knowingly collect data from minors.
          </p>
        </section>

         <section>
          <h2>11. Policy Updates</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be communicated via email or platform notifications.
          </p>
        </section>

        <section>
          <h2>12. Contact Us</h2>
          <p>If you have questions or concerns about this Privacy Policy, contact us at:</p>
          <ul>
            <li>Email: support&#64;voguex.com</li>
            <li>Address: VogueX, [Your Office Address Here].</li>
          </ul>
        </section>

      </div>
    </div>
  `,
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent {} 