import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  registerForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  errors: Record<string, string[]> = {};

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
        this.errorMessage = 'Las contraseñas no coinciden';
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';
      this.errors = {};
      
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            // Registro exitoso, redirigir al home
            this.router.navigate(['/home']);
          } else {
            this.errorMessage = response.message ?? 'Error en el registro';
            if (response.errors) {
              this.errors = response.errors;
            }
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message ?? 'Error al conectar con el servidor';
          if (err.error?.errors) {
            this.errors = err.error.errors;
          }
          console.error('Error de registro:', err);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}