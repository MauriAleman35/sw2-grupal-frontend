import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';

interface Event {
  id: number;
  title: string;
  slug?: string; // Añadimos slug como opcional para compatibilidad
  date: Date;
  location: string;
  faculty: string;
  imageUrl: string;
  price: string;
  description: string;
}

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.css'
})
export class EventCardComponent {
  @Input() event!: Event;
  constructor(private router: Router) {}

  navigateToEventDetail(): void {
    // Si el evento tiene slug, usamos eso; de lo contrario, usamos el ID
    const routeParam = this.event.slug || this.event.id;
    this.router.navigate(['/events', routeParam]);
  }
}