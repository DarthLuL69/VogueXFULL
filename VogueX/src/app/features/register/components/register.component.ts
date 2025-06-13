import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,  // Indica que este componente es independiente y puede ser cargado de forma aislada
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  registerForm!: FormGroup;  // ¡Se declara, pero se inicializa después!

  constructor(private fb: FormBuilder) {
    // Ahora sí, después de tener disponible fb, se crea el formulario
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
      console.log('Registro exitoso', this.registerForm.value);
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}