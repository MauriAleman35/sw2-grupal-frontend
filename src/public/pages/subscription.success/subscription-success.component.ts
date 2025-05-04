import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-subscription-success',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './subscription-success.component.html',
  styleUrls: ['./subscription-success.component.css'],
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
    trigger('scaleIn', [
      state('void', style({ transform: 'scale(0)', opacity: 0 })),
      transition(':enter', [
        animate('0.5s 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class SubscriptionSuccessComponent implements OnInit {
  confettiColors = ['#d4a017', '#ffffff', '#ffd700', '#a58d65', '#f8f9fb'];
  confettiElements: HTMLElement[] = [];
  
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    // Crear confeti para la animación
    this.createConfetti();
    
    // Lanzar confeti
    setTimeout(() => {
      this.launchConfetti();
    }, 300);
  }
  
  createConfetti(): void {
    const container = document.querySelector('.confetti-container');
    if (!container) return;
    
    for (let i = 0; i < 150; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 5 + 's';
      confetti.style.backgroundColor = this.confettiColors[Math.floor(Math.random() * this.confettiColors.length)];
      
      // Tamaño aleatorio
      const size = Math.random() * 10 + 5;
      confetti.style.width = size + 'px';
      confetti.style.height = size + 'px';
      
      // Forma aleatoria
      const shapes = ['circle', 'triangle', 'square'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      confetti.classList.add(shape);
      
      container.appendChild(confetti);
      this.confettiElements.push(confetti);
    }
  }
  
  launchConfetti(): void {
    this.confettiElements.forEach(confetti => {
      confetti.classList.add('launch');
    });
  }
  
  navigateHome(): void {
    this.router.navigate(['/MyUnit']);
  }
}