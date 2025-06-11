import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  name = '';
  email = '';
  message = '';
  submitted = false;
  errorMessage = '';

  submitForm() {
    if (this.name && this.email && this.message) {
      this.submitted = true;
      this.errorMessage = '';

      // Simula envío con un pequeño delay
      setTimeout(() => {
        this.name = '';
        this.email = '';
        this.message = '';
        this.submitted = false;
      }, 3000);
    } else {
      this.errorMessage = 'Por favor, completa todos los campos.';
    }
  }
}