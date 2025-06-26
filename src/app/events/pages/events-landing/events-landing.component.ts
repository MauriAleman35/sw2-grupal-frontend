
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { EventsService } from '../../services/events.service';
import { Observable } from 'rxjs';

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
  loading?: boolean;
}

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
    FormsModule,
    MatDividerModule,
    MatExpansionModule,
    MatTooltipModule,
    MatProgressSpinner
  ],
  templateUrl: './events-landing.component.html',
  styleUrls: ['./events-landing.component.css']
})
export class EventsLandingComponent implements OnInit, AfterViewInit {
  contactForm: FormGroup;
  isSubmitting = false;
  fabExpanded = false;
  chatOpen = false;
  chatMessages: ChatMessage[] = [
    { from: 'bot', text: '¡Hola! 👋 Soy el asistente virtual de EventLy. ¿En qué puedo ayudarte?' }
  ];
  chatInput = '';
  chatLoading = false;
  identity = "../../../assets/images/identity.png";
  faqs = [
    {
      question: "¿Cómo puede mi facultad acceder al sistema?",
      answer:
        "El proceso es simple: el decano o director debe enviar una carta formal a la DTIC solicitando acceso. Después de la evaluación y aprobación, configuramos el tenant específico para su facultad.",
    },
    {
      question: "¿Qué garantías de seguridad ofrece el blockchain?",
      answer:
        "Cada entrada tiene un registro único e inmutable en blockchain que garantiza su autenticidad. Es imposible falsificar o duplicar entradas, y todas las transacciones quedan registradas permanentemente.",
    },
    {
      question: "¿Cómo funciona la verificación de identidad?",
      answer:
        "Para compras de 6 o más entradas, se activa automáticamente un sistema de IA que compara la selfie del usuario con su documento de identidad, previniendo la reventa masiva.",
    },
    {
      question: "¿Hay costos asociados al uso del sistema?",
      answer:
        "El sistema es gratuito para todas las facultades de la UAGRM. Solo se requiere cumplir con los requisitos administrativos y el compromiso de uso responsable.",
    },
    {
      question: "¿Qué soporte técnico se proporciona?",
      answer:
        "Ofrecemos capacitación inicial, soporte técnico continuo durante horarios de oficina, y documentación completa para administradores del sistema.",
    },
  ];

  @ViewChild('chatbotWindow') chatbotWindow?: ElementRef<HTMLDivElement>;

  constructor(
    private fb: FormBuilder,
    private eventsService: EventsService,
    private snackBar: MatSnackBar
  ) {
    this.contactForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      faculty: ["", Validators.required],
      phone: ["", [Validators.pattern(/^[0-9+\-\s()]+$/)]],
      message: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    this.setupScrollAnimations();
  }

  ngAfterViewInit(): void {
    // Por si se necesita scroll automático, se podría mejorar aquí
  }

  setupScrollAnimations(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    setTimeout(() => {
      const animatedElements = document.querySelectorAll(".animate-on-scroll");
      animatedElements.forEach((el) => observer.observe(el));
    }, 100);
  }

  onEvent(): void {
  
    window.location.href = '/eventos';
  }

  onTenant(): void {

    window.location.href = '/solicitar-tenant';
  }

  submitContactForm(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;

      // Simular envío del formulario
      setTimeout(() => {
        this.isSubmitting = false;
        this.snackBar.open('Mensaje enviado con éxito. Nos pondremos en contacto contigo pronto.', 'Cerrar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.contactForm.reset();
      }, 2000);
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    this.closeFab();
  }

  // Métodos para el FAB expandible
  toggleFab(): void {
    this.fabExpanded = !this.fabExpanded;
  }

  closeFab(): void {
    this.fabExpanded = false;
  }

  openChatBot(): void {
    this.chatOpen = true;
    this.closeFab();
    setTimeout(() => this.scrollChatToBottom(), 200);
  }

  closeChatBot(): void {
    this.chatOpen = false;
    this.chatInput = '';
    setTimeout(() => this.scrollChatToBottom(), 200);
  }

  sendMessage(): void {
    const message = this.chatInput.trim();
    if (!message || this.chatLoading) return;

    this.chatMessages.push({ from: 'user', text: message });
    this.chatInput = '';
    this.chatLoading = true;
    setTimeout(() => this.scrollChatToBottom(), 100);

    this.eventsService.sendChatBotMessage(message).subscribe({
      next: (res) => {
        this.chatMessages.push({ from: 'bot', text: res.respuesta || 'Lo siento, no puedo responder en este momento.' });
        this.chatLoading = false;
        setTimeout(() => this.scrollChatToBottom(), 100);
      },
      error: () => {
        this.chatMessages.push({ from: 'bot', text: 'Lo siento, ocurrió un error. Intenta nuevamente más tarde.' });
        this.chatLoading = false;
        setTimeout(() => this.scrollChatToBottom(), 100);
      }
    });
  }

  onChatInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollChatToBottom(): void {
    if (this.chatbotWindow) {
      try {
        this.chatbotWindow.nativeElement.scrollTop = this.chatbotWindow.nativeElement.scrollHeight;
      } catch {}
    }
  }
}