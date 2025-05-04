import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-subscription-error',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './subscription-error.component.html',
  styleUrls: ['./subscription-error.component.css'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [
        animate('0.6s ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      state('void', style({ transform: 'translateY(20px)', opacity: 0 })),
      transition(':enter', [
        animate('0.6s 0.3s ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('pulse', [
      state('normal', style({ transform: 'scale(1)' })),
      state('pulse', style({ transform: 'scale(1.05)' })),
      transition('normal <=> pulse', animate('0.3s ease-in-out'))
    ])
  ]
})
export class SubscriptionErrorComponent {
  pulseState: 'normal' | 'pulse' = 'normal';
  
  constructor(private router: Router) {
    // Iniciar la animación de pulso
    setInterval(() => {
      this.pulseState = this.pulseState === 'normal' ? 'pulse' : 'normal';
    }, 2000);
  }
  
  tryAgain(): void {
    // Volver a la página de selección de planes
    this.router.navigate(['/subscription/create']);
  }
  
  contactSupport(): void {
    // En un entorno real, esto podría abrir un chat de soporte o un formulario
    window.open('mailto:soporte@uagrm.edu', '_blank');
  }
  
  goHome(): void {
    this.router.navigate(['/']);
  }
}