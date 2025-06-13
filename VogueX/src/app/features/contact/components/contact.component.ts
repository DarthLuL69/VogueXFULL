import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styles: []
})
export class ContactComponent {
  name: string = '';
  email: string = '';
  phone: string = '';
  foundUs: string = '';
  services = { web: false, mobile: false, design: false };
  urgency: string = '';
  newsletter: boolean = false;
  message: string = '';
  submitted = false;
  errorMessage = '';
  loading = false;

  submitForm() {
    if (!this.name || !this.email || !this.message || !this.foundUs) {
      this.errorMessage = 'Please fill in the required fields.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Simular envío de formulario
    setTimeout(() => {
      this.submitted = true;
      this.loading = false;
      console.log({
        name: this.name,
        email: this.email,
        phone: this.phone,
        foundUs: this.foundUs,
        services: this.services,
        urgency: this.urgency,
        newsletter: this.newsletter,
        message: this.message
      });
      this.clearForm();
    }, 2000);
  }

  clearForm() {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.foundUs = '';
    this.services = { web: false, mobile: false, design: false };
    this.urgency = '';
    this.newsletter = false;
    this.message = '';
  }
}