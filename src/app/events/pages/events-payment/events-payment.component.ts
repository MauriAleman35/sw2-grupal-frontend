import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EventsService } from '../../services/events.service';
import { DatumEventsAll, Section } from '../../interfaces/events';
import { TicketSelectorComponent } from '../../components/ticket-selector/ticket-selector.component';
import { PaymentSummaryComponent } from '../../components/payment-summary/payment-summary.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { PostPurchaseParam } from '../../interfaces/purchase';

interface TicketSelection {
  sectionId: string;
  quantity: number;
  price: number;
  name: string;
}

interface PaymentInfo {
  purchaseId: string;
  paymentId: string;
}

@Component({
  selector: 'app-events-payment',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatStepperModule,
    MatCardModule,
    MatDividerModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    TicketSelectorComponent,
    PaymentSummaryComponent
  ],
  templateUrl: './events-payment.component.html',
  styleUrls: ['./events-payment.component.css']
})
export class EventsPaymentComponent implements OnInit, OnDestroy {
  event: DatumEventsAll | null = null;
  loading = true;
  error = false;
  eventSlug: string = '';
  currentStep = 1; // 1: selección, 2: datos, 3: pago
  
  // Variables para el procesamiento del pago
  processingPayment = false;
  purchaseId: string = '';
  paymentId: string = '';
  paymentSuccess: boolean = false;
  
  userForm: FormGroup;
  selectedTickets: TicketSelection[] = [];
  totalAmount = 0;
  Math = Math;
  
  // Variables para la verificación periódica del pago
  private verificationInterval: any;
  private verificationAttempts = 0;
  private maxVerificationAttempts = 30; // 5 segundos x 30 = 2.5 minutos de tiempo máximo de espera
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private eventsService: EventsService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      dni: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.eventSlug = params['slug'];
      this.loadEventDetailsBySlug(this.eventSlug);
    });
    
    // Verificar si hay parámetros de pago en los queryParams
    this.route.queryParams.subscribe(queryParams => {
      const { status, purchase_id, payment_id, session_id } = queryParams;
      
      if (status === 'success' && payment_id) {
        // Si regresa con el ID del pago en los parámetros
        this.paymentId = payment_id;
        this.currentStep = 3;
        this.verifyPaymentById();
      } else if (status === 'success' && purchase_id) {
        // Si solo tenemos el ID de compra
        this.purchaseId = purchase_id;
        this.currentStep = 3;
        this.verifyPurchaseStatus();
      } else if (session_id) {
        this.snackBar.open('Verificando el estado del pago...', 'Cerrar', { duration: 3000 });
      }
      
      // Comprobar si hay información de pago guardada en localStorage
      this.loadPaymentInfoFromStorage();
    });
    
    window.scrollTo(0, 0);
  }
  
  ngOnDestroy(): void {
    this.stopPaymentVerification();
  }
  
  // Cargar información de pago desde localStorage
  loadPaymentInfoFromStorage(): void {
    const paymentInfoStr = localStorage.getItem('currentPaymentInfo');
    if (paymentInfoStr) {
      try {
        const paymentInfo: PaymentInfo = JSON.parse(paymentInfoStr);
        this.purchaseId = paymentInfo.purchaseId || '';
        this.paymentId = paymentInfo.paymentId || '';
        
        if (this.purchaseId && this.paymentId) {
          this.currentStep = 3; // Avanzar al paso de pago
          this.verifyPaymentById(); // Usar el ID de pago para verificar
        } else if (this.purchaseId) {
          this.currentStep = 3;
          this.verifyPurchaseStatus(); // Usar el ID de compra como respaldo
        }
      } catch (e) {
        console.error('Error al cargar información de pago:', e);
        localStorage.removeItem('currentPaymentInfo');
      }
    }
  }
  
  // Guardar información de pago en localStorage
  savePaymentInfoToStorage(): void {
    if (this.purchaseId || this.paymentId) {
      const paymentInfo: PaymentInfo = {
        purchaseId: this.purchaseId,
        paymentId: this.paymentId
      };
      localStorage.setItem('currentPaymentInfo', JSON.stringify(paymentInfo));
    }
  }
  
  // Limpiar información de pago del storage
  clearPaymentInfoFromStorage(): void {
    localStorage.removeItem('currentPaymentInfo');
  }

  getCurrentFormattedDate(): string {
    const now = new Date();
    return this.formatDate(now);
  }
  
  loadEventDetailsBySlug(slug: string): void {
    this.loading = true;
    this.error = false;
    
    // Convertimos el slug a un formato legible
    const formattedTitle = this.transformSlugToTitle(slug);
    
    this.eventsService.getAllEvents(1, 100).subscribe({
      next: (res) => {
        // Buscamos el evento que coincida con el título formateado
        const foundEvent = res.data.find(e => 
          e.title.toLowerCase() === formattedTitle.toLowerCase() || 
          this.slugify(e.title) === slug
        );
        
        if (foundEvent) {
          this.event = foundEvent;
          this.loading = false;
        } else {
          this.error = true;
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error al cargar el evento:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
  
  transformSlugToTitle(slug: string): string {
    if (!slug) return '';
    
    const words = slug.split('-');
    
    const formattedWords = words.map((word, index) => {
      if (word.length === 0) return word;
      const lowercaseWords = ['de', 'la', 'el', 'los', 'las', 'del', 'y', 'e', 'o', 'u', 'a'];
      
      if (lowercaseWords.includes(word) && index !== 0) {
        return word;
      }
      
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    
    return formattedWords.join(' ');
  }
  
  slugify(text: string): string {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }
  
  formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  getOrderNumber(): string {
    return `E-${Math.floor(Math.random() * 9000000) + 1000000}`;
  }
  
  onTicketSelectionChange(selection: TicketSelection[]): void {
    this.selectedTickets = selection;
    this.calculateTotal();
  }
  
  getCurrentDate(): string {
    return this.formatDate(new Date());
  }
  
  calculateTotal(): void {
    this.totalAmount = this.selectedTickets.reduce(
      (acc, ticket) => acc + (ticket.price * ticket.quantity), 0
    );
  }
  
  nextStep(): void {
    if (this.currentStep === 1 && this.selectedTickets.length === 0) {
      this.snackBar.open('Por favor selecciona al menos una entrada', 'Cerrar', {
        duration: 3000
      });
      return;
    }
    
    if (this.currentStep === 1) {
      // Avanzamos al paso 2 - datos personales
      this.currentStep++;
      window.scrollTo(0, 0);
    } 
    else if (this.currentStep === 2) {
      // Validar formulario antes de proceder
      if (this.userForm.invalid) {
        this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
        
        // Marcar todos los campos como tocados para mostrar errores
        Object.keys(this.userForm.controls).forEach(key => {
          const control = this.userForm.get(key);
          control?.markAsTouched();
        });
        
        return;
      }
      
      // Proceder a crear la compra y el pago
      this.createPurchase();
    }
  }
  
  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }
  
  // Crear la compra usando el endpoint postPurchase
  createPurchase(): void {
    this.processingPayment = true;
    
    // Preparar los datos para la API
    const purchaseData: PostPurchaseParam = {
      items: this.selectedTickets.map(ticket => ({
        sectionId: ticket.sectionId,
        quantity: ticket.quantity
      }))
    };
    
    this.eventsService.postPurchase(purchaseData).subscribe({
      next: (response) => {
        console.log('Compra creada con éxito:', response);
        this.purchaseId = response.data.id;
        
        // Procedemos a generar el pago con Stripe
        this.generateStripePayment();
      },
      error: (error) => {
        console.error('Error al crear la compra:', error);
        this.processingPayment = false;
        this.snackBar.open('Error al procesar la compra. Por favor inténtalo nuevamente.', 'Cerrar', {
          duration: 5000
        });
      }
    });
  }
  
  // Generar el pago con Stripe usando postPurchaseById
  generateStripePayment(): void {
    if (!this.purchaseId) {
      this.snackBar.open('Error: No se pudo crear la compra', 'Cerrar', { duration: 3000 });
      this.processingPayment = false;
      return;
    }
    
    this.eventsService.postPurchaseById(this.purchaseId).subscribe({
      next: (response) => {
        console.log('URL de pago generada:', response);
        
        // Guardar IDs en variables y localStorage
        if (response.data && response.data.id) {
          this.paymentId = response.data.id;
          // Guardar información del pago
          this.savePaymentInfoToStorage();
        }
        
        // Avanzamos al paso 3 y mostramos el procesador de pago
        this.currentStep = 3;
        
        // Abrir Stripe en una nueva pestaña
        if (response.data && response.data.checkoutUrl) {
          const stripeWindow = window.open(response.data.checkoutUrl, '_blank');
          
          // Iniciamos verificación periódica del pago
          this.startPaymentVerification();
        } else {
          this.snackBar.open('Error: No se pudo obtener la URL de pago', 'Cerrar', { duration: 3000 });
          this.processingPayment = false;
        }
      },
      error: (error) => {
        console.error('Error al generar el pago:', error);
        this.processingPayment = false;
        this.snackBar.open('Error al generar el pago. Por favor inténtalo nuevamente.', 'Cerrar', {
          duration: 5000
        });
      }
    });
  }
  
  // Método para iniciar la verificación periódica
  startPaymentVerification(): void {
    // Limpiar cualquier intervalo existente
    this.stopPaymentVerification();
    this.verificationAttempts = 0;
    
    // Verificar el pago cada 5 segundos
    this.verificationInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        if (this.paymentId) {
          this.verifyPaymentById();
        } else if (this.purchaseId) {
          this.verifyPurchaseStatus();
        }
      }
    }, 5000);
    
    // También verificar cuando la ventana obtiene el foco
    window.addEventListener('focus', this.onWindowFocus);
  }
  
  // Método para detener la verificación
  stopPaymentVerification(): void {
    if (this.verificationInterval) {
      clearInterval(this.verificationInterval);
      this.verificationInterval = null;
    }
    window.removeEventListener('focus', this.onWindowFocus);
  }
  
  // Método para manejar el evento de foco en la ventana
  onWindowFocus = (): void => {
    if (this.currentStep === 3) {
      if (this.paymentId) {
        this.verifyPaymentById();
      } else if (this.purchaseId) {
        this.verifyPurchaseStatus();
      }
    }
  };
  
  // Verificar pago usando el ID de pago (preferido)
  verifyPaymentById(): void {
    if (!this.paymentId) {
      console.log('No hay ID de pago, intentando con ID de compra');
      this.verifyPurchaseStatus();
      return;
    }
    
    // Incrementar el contador de intentos
    this.verificationAttempts++;
    
    // Verificar si hemos superado el máximo de intentos
    if (this.verificationAttempts > this.maxVerificationAttempts) {
      this.handleVerificationTimeout();
      return;
    }
    
    this.eventsService.VeryfyPayment(this.paymentId).subscribe({
      next: (response) => {
        console.log('Respuesta de verificación de pago:', response);
        this.handlePaymentVerificationResponse(response);
      },
      error: (error) => {
        console.error('Error al verificar el pago:', error);
        // Si falla la verificación por ID de pago, intentar con ID de compra
        if (this.purchaseId) {
          this.verifyPurchaseStatus();
        }
      }
    });
  }
  
  // Verificar estado de compra (alternativa)
  verifyPurchaseStatus(): void {
    if (!this.purchaseId) {
      console.error('No hay IDs disponibles para verificar el pago');
      return;
    }
    
    // Incrementar el contador de intentos
    this.verificationAttempts++;
    
    // Verificar si hemos superado el máximo de intentos
    if (this.verificationAttempts > this.maxVerificationAttempts) {
      this.handleVerificationTimeout();
      return;
    }
    
    this.eventsService.VeryfyPayment(this.purchaseId).subscribe({
      next: (response) => {
        console.log('Respuesta de verificación por ID de compra:', response);
        this.handlePaymentVerificationResponse(response);
      },
      error: (error) => {
        console.error('Error al verificar el pago por ID de compra:', error);
      }
    });
  }
  
  // Manejar respuesta de verificación de pago
  handlePaymentVerificationResponse(response: any): void {
    if (response.data && 
        response.data.status === 'completed' && 
        response.data.purchase && 
        response.data.purchase.status === 'paid') {
      
      this.stopPaymentVerification();
      this.processingPayment = false;
      this.paymentSuccess = true;
      
      // Limpiar información de pago almacenada
      this.clearPaymentInfoFromStorage();
      
      // Mostrar mensaje de éxito
      this.snackBar.open('¡Pago completado con éxito!', 'Cerrar', { duration: 3000 });
    }
  }
  
  // Manejar tiempo de espera agotado
  handleVerificationTimeout(): void {
    this.stopPaymentVerification();
    this.processingPayment = false;
    this.snackBar.open(
      'El tiempo de verificación del pago ha expirado. Puedes verificar el estado en "Mis Tickets".',
      'Cerrar',
      { duration: 5000 }
    );
  }
  
  // Verificar el estado del pago cuando el usuario regresa de Stripe con parámetros en URL
  verifyPaymentStatus(): void {
    this.processingPayment = true;
    
    if (this.paymentId) {
      this.verifyPaymentById();
    } else if (this.purchaseId) {
      this.verifyPurchaseStatus();
    } else {
      this.processingPayment = false;
      this.snackBar.open('No se pudo verificar el pago: información insuficiente', 'Cerrar', { duration: 3000 });
    }
  }
  
  goToEventDetail(): void {
    this.router.navigate(['/events', this.eventSlug]);
  }
}