import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-auth-singup',
  standalone: true,
  imports: [ CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatStepperModule],
  templateUrl: './auth-singup.component.html',
  styleUrl: './auth-singup.component.css'
})
export class AuthSingupComponent implements OnInit {
  currentStep = 1;
  personalInfoForm!: FormGroup;
  accountForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.initForms();
  }
  
  initForms(): void {
    // Formulario de información personal
    this.personalInfoForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.pattern(/^[0-9]{7,10}$/)]]
    });
    
    // Formulario de cuenta
    this.accountForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        this.createPasswordStrengthValidator()
      ]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }
  
  createPasswordStrengthValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (!value) {
        return null;
      }
      
      const hasUpperCase = /[A-Z]+/.test(value);
      const hasLowerCase = /[a-z]+/.test(value);
      const hasNumeric = /[0-9]+/.test(value);
      
      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric;
      
      return !passwordValid ? { passwordStrength: true } : null;
    };
  }
  
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }
  
  nextStep(): void {
    if (this.personalInfoForm.valid) {
      this.currentStep = 2;
    } else {
      this.markFormGroupTouched(this.personalInfoForm);
    }
  }
  
  prevStep(): void {
    this.currentStep = 1;
  }
  
  onSubmit(): void {
    if (this.personalInfoForm.invalid || this.accountForm.invalid) {
      this.markFormGroupTouched(this.personalInfoForm);
      this.markFormGroupTouched(this.accountForm);
      return;
    }
    
    this.isLoading = true;
    
    // Simulación de registro
    setTimeout(() => {
      this.isLoading = false;
      
      // Aquí iría la lógica real de registro
      this.snackBar.open('¡Registro exitoso! Bienvenido a EventLy', 'Cerrar', {
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
  
  getErrorMessage(formGroup: FormGroup, controlName: string): string {
    const control = formGroup.get(controlName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }
    
    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    
    if (control.errors['minlength']) {
      return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
    }
    
    if (controlName === 'email' && control.errors['email']) {
      return 'Ingresa un correo electrónico válido';
    }
    
    if (controlName === 'phone' && control.errors['pattern']) {
      return 'Ingresa un número de teléfono válido';
    }
    
    if (controlName === 'password' && control.errors['passwordStrength']) {
      return 'La contraseña debe incluir mayúsculas, minúsculas y números';
    }
    
    if (controlName === 'confirmPassword' && formGroup.errors?.['passwordMismatch']) {
      return 'Las contraseñas no coinciden';
    }
    
    return 'Error en el campo';
  }
  
  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.hidePassword = !this.hidePassword;
    } else {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }
}
