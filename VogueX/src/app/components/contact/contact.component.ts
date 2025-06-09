import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  name = '';
  email = '';
  message = '';
  submitted = false;

  submitForm() {
    if (this.name && this.email && this.message) {
      this.submitted = true;
      // Aquí podrías conectarlo a un servicio real
      setTimeout(() => {
        this.name = '';
        this.email = '';
        this.message = '';
        this.submitted = false;
      }, 3000);
    }
  }
}