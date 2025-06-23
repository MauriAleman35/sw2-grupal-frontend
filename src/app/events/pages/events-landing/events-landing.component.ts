import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDividerModule,
    MatExpansionModule,
    MatTooltipModule,MatProgressSpinner
  ],
  templateUrl: './events-landing.component.html',
  styleUrls: ['./events-landing.component.css']
})
export class EventsLandingComponent implements OnInit, AfterViewInit {
  contactForm: FormGroup;
  isSubmitting = false;
  
  // Para animaciones al hacer scroll
  observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  // Preguntas frecuentes
  faqs = [
    {
      question: '¿Cómo puede mi facultad solicitar acceso al sistema?',
      answer: 'Para solicitar acceso, el decano o director de su facultad debe enviar una carta formal dirigida a la DTIC, detallando el tipo de eventos que realizan y la persona designada como administrador del sistema.'
    },
    {
      question: '¿Qué beneficios tiene el uso de blockchain en las entradas?',
      answer: 'El blockchain garantiza la inmutabilidad y trazabilidad de cada ticket, evitando la falsificación y permitiendo verificar en tiempo real la autenticidad de cada entrada, además de mantener un registro permanente de todas las transacciones.'
    },
    {
      question: '¿Cómo funciona la verificación de identidad para evitar reventas?',
      answer: 'Para compras de 6 o más entradas, nuestro sistema solicita una verificación de identidad mediante reconocimiento facial del comprador junto con su documento de identidad, creando así una asociación entre el comprador y sus tickets.'
    },
    {
      question: '¿Qué información técnica necesito para implementar el sistema?',
      answer: 'La DTIC proporcionará todos los requisitos técnicos, incluido acceso a la API, documentación y soporte técnico para la integración. El sistema está diseñado para funcionar en la infraestructura existente de la universidad.'
    },
    {
      question: '¿Puedo personalizar el sistema para los eventos de mi facultad?',
      answer: 'Sí, el sistema multi-tenant permite que cada facultad personalice la apariencia de sus eventos, gestione sus propias categorías, precios y configuraciones, manteniendo la autonomía de gestión.'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      faculty: ['', [Validators.required]],
      message: ['', [Validators.required]],
      phone: ['', [Validators.pattern('^[0-9]{7,15}$')]]
    });
  }

  ngOnInit(): void {
    // Inicializar cualquier dato necesario
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, this.observerOptions);

    // Observar todos los elementos con la clase animate-on-scroll
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }

  submitContactForm(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    // Simulación de envío del formulario
    setTimeout(() => {
      this.isSubmitting = false;
      this.snackBar.open('Mensaje enviado con éxito. Nos pondremos en contacto contigo pronto.', 'Cerrar', {
        duration: 5000,
        panelClass: ['success-snackbar']
      });
      this.contactForm.reset();
    }, 1500);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}