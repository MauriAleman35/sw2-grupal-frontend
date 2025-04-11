import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Ticket {
  id: number;
  eventId: number;
  eventName: string;
  location: string;
  date: Date;
  imageUrl: string;
  quantity: number;
  status: 'Pagado' | 'Pendiente' | 'Cancelado';
  price: string;
  qrCode?: string;
  seatInfo?: string;
  active: boolean;
}

@Component({
  selector: 'app-ticket-card',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './ticket-card.component.html',
  styleUrls: ['./ticket-card.component.css']
})
export class TicketCardComponent {
  @Input() ticket!: Ticket;
  @Output() viewDetails = new EventEmitter<number>();
  @Output() download = new EventEmitter<number>();

  onViewDetails(): void {
    this.viewDetails.emit(this.ticket.id);
  }

  onDownload(): void {
    this.download.emit(this.ticket.id);
  }

  getStatusClass(): string {
    switch (this.ticket.status) {
      case 'Pagado':
        return 'bg-green-100 text-green-700';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-700';
      case 'Cancelado':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }
}