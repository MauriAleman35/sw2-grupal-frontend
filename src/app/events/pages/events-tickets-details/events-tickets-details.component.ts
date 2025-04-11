import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

interface TicketDetails {
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
  description?: string;
  organizer?: string;
}
@Component({
  selector: 'app-events-tickets-details',
  standalone: true,
  imports: [ CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule],
  templateUrl: './events-tickets-details.component.html',
  styleUrl: './events-tickets-details.component.css'
})
export class EventsTicketsDetailsComponent implements OnInit {
  ticket: TicketDetails | null = null;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Aquí normalmente harías una llamada a un servicio para obtener los detalles del ticket
      // Por ahora, simulamos con datos de ejemplo
      setTimeout(() => {
        this.ticket = {
          id: 3,
          eventId: 103,
          eventName: 'C.R.O - SONILUM - Santa Cruz',
          location: 'Santa Cruz - Estadio Tahuichi',
          date: new Date('2025-04-10T20:00:00'),
          imageUrl: 'https://picsum.photos/800/400?random=3',
          quantity: 1,
          status: 'Pagado',
          price: 'Bs. 250',
          active: true,
          qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TICKET-ID-12345',
          seatInfo: 'Sector VIP, Fila 3, Asiento 12',
          description: 'C.R.O presenta su gira mundial "Malos Hábitos" con un show imperdible en Santa Cruz.',
          organizer: 'SONILUM Producciones'
        };
        this.loading = false;
      }, 1000);
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  downloadTicket(): void {
    console.log(`Descargando ticket ${this.ticket?.id}`);
    // Lógica para descargar el ticket
  }

  goBack(): void {
    this.router.navigate(['/MyTickets']);
  }

  getStatusClass(): string {
    if (!this.ticket) return '';
    
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
}
