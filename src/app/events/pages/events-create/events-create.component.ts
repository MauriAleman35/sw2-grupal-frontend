import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { EventsService } from '../../services/events.service';

interface Subscription {
  id: string;
  plan_type: string;
  price: string;
  duration: string | null;
  is_active: boolean;
  created_at: any;
  updated_at: any;
}

interface SubscriptionResponse {
  statusCode: number;
  message: string;
  data: {
    total: number;
    subscriptions: Subscription[];
  };
}

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

@Component({
  selector: 'app-events-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterModule,

  ],
  templateUrl: './events-create.component.html',
  styleUrls: ['./events-create.component.css']
})
export class EventsCreateComponent implements OnInit {
  currentStep: number = 1; // 1: Plan selection, 2: Tenant form
  selectedPlan: PricingPlan | null = null;
  tenantForm!: FormGroup;
  loading: boolean = true;
  error: boolean = false;
  
  subscriptions: Subscription[] = [];
  pricingPlans: PricingPlan[] = [];
  
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private http: HttpClient,
    private EventsService: EventsService,
  ) {}
  
  ngOnInit(): void {
    this.initTenantForm();
    this.loadSubscriptions();
  }
  
  initTenantForm(): void {
    this.tenantForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.pattern('^[a-z0-9.-]+$'),
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      displayName: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]]
    });
  }
  
  loadSubscriptions(): void {
    this.loading=true;
    this.error=false;
    this.EventsService.getSubscriptions().subscribe({
      next: (res: SubscriptionResponse) => {
        this.subscriptions=res.data.subscriptions;
        console.log('Subscriptions:', this.subscriptions);
        this.mapSubscriptionsToPricingPlans();
        this.loading = false;
      },  error: (err) => {
        console.error('Error loading subscriptions:', err);
        this.error = true;
        this.loading = false;
      }

    })
        
  
    

  }
  
  mapSubscriptionsToPricingPlans(): void {
    // Mapear las suscripciones a planes de precios con características
    this.pricingPlans = this.subscriptions.map(sub => {
      const plan: PricingPlan = {
        id: sub.id,
        name: this.getPlanName(sub.plan_type),
        price: sub.price,
        description: this.getPlanDescription(sub.plan_type),
        features: this.getPlanFeatures(sub.plan_type),
        recommended: sub.plan_type === 'STANDARD'
      };
      return plan;
    });
  }
  
  getPlanName(planType: string): string {
    switch (planType) {
      case 'BASIC': return 'Básico';
      case 'STANDARD': return 'Estándar';
      case 'PREMIUM': return 'Premium';
      default: return planType;
    }
  }
  
  getPlanDescription(planType: string): string {
    switch (planType) {
      case 'BASIC': return 'Ideal para facultades pequeñas o departamentos';
      case 'STANDARD': return 'Perfecto para facultades medianas con múltiples eventos';
      case 'PREMIUM': return 'Para grandes facultades y unidades administrativas centrales';
      default: return 'Plan personalizado';
    }
  }
  
  getPlanFeatures(planType: string): string[] {
    switch (planType) {
      case 'BASIC':
        return [
          'Hasta 10 eventos simultáneos',
          'Hasta 5 usuarios administradores',
          '5GB de almacenamiento',
          'Soporte por email'
        ];
      case 'STANDARD':
        return [
          'Hasta 50 eventos simultáneos',
          'Hasta 15 usuarios administradores',
          '20GB de almacenamiento',
          'Soporte prioritario',
          'Reportes básicos'
        ];
      case 'PREMIUM':
        return [
          'Eventos ilimitados',
          'Usuarios ilimitados',
          '100GB de almacenamiento',
          'Soporte 24/7',
          'Reportes avanzados',
          'API personalizada'
        ];
      default:
        return ['Características personalizadas'];
    }
  }
  
  selectPlan(plan: PricingPlan): void {
    this.selectedPlan = plan;
    this.currentStep = 2;
    window.scrollTo(0, 0);
  }
  
  goBack(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }
  
  submitForm(): void {
    if (this.tenantForm.valid && this.selectedPlan) {
      // Preparar los datos para enviar
      const tenantData = {
        subscriptionId: this.selectedPlan.id,
        name: this.tenantForm.get('name')?.value + '.uagrm.edu',
        displayName: this.tenantForm.get('displayName')?.value
      };
      this.EventsService.createSubscription(tenantData).subscribe({
        next: (res) => {
          window.location.href = res.data.paymentStripe.url;
        }
      });
    } else {
      this.markFormGroupTouched(this.tenantForm);
      this.snackBar.open('Por favor completa todos los campos correctamente', 'Cerrar', {
        duration: 3000
      });
    }
  }
  
  // Utilidad para generar una cadena aleatoria (simulación de ID de sesión de Stripe)
  generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  
  // Utilidad para marcar todos los campos como tocados
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}