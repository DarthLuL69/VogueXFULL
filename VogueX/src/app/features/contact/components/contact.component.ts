import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../shared/services/contact.service';

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

  constructor(private contactService: ContactService) {}

  submitForm() {
    if (!this.name || !this.email || !this.message || !this.foundUs) {
      this.errorMessage = 'Por favor completa todos los campos requeridos.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const contactData = {
      name: this.name,
      email: this.email,
      subject: this.foundUs,
      message: this.message
    };

    this.contactService.sendMessage(contactData).subscribe({
      next: (response) => {
        if (response.success) {
          this.submitted = true;
          this.loading = false;
          this.clearForm();
        } else {
          this.errorMessage = 'Ocurrió un error al enviar el mensaje.';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error sending contact message:', error);
        this.errorMessage = error.error?.message || 'Error al enviar el mensaje. Por favor intenta de nuevo.';
        this.loading = false;
      }
    });
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