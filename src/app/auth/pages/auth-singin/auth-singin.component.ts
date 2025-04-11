import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-auth-singin',
  standalone: true,
  imports: [ CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule],
  templateUrl: './auth-singin.component.html',
  styleUrl: './auth-singin.component.css'
})
export class AuthSinginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;

    // Simulación de inicio de sesión
    setTimeout(() => {
      this.isLoading = false;
      
      // Aquí iría la lógica real de autenticación
      // Por ahora, simulamos un inicio de sesión exitoso
      this.snackBar.open('¡Inicio de sesión exitoso!', 'Cerrar', {
        duration: 3000,
        panelClass: 'success-snackbar'
      });
      
      this.router.navigate(['/home']);
    }, 1500);
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }
    
    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    
    if (controlName === 'email' && control.errors['email']) {
      return 'Ingresa un correo electrónico válido';
    }
    
    if (controlName === 'password' && control.errors['minlength']) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    
    return 'Error en el campo';
  }
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
