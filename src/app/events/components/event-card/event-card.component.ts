import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { DatumEventsAll } from '../../interfaces/events';


@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.css'
})
export class EventCardComponent {
  @Input() event!: DatumEventsAll;
  constructor(private router: Router) {}

  navigateToEventDetail(): void {
    // Si el evento tiene slug, usamos eso; de lo contrario, usamos el ID
    const routeParam = this.event.title || this.event.id;
    const slug = this.generateSlug(routeParam);
    this.router.navigate(['/events', slug]);
  }
    private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Elimina caracteres especiales
      .replace(/\s+/g, '-') // Reemplaza espacios con guiones
      .replace(/--+/g, '-') // Elimina guiones múltiples
      .trim(); // Elimina espacios al inicio y final
  }
}