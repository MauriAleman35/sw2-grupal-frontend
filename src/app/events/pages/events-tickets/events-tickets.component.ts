
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { TicketCardComponent } from '../../components/ticket-card/ticket-card.component';

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
  selector: 'app-events-tickets',
  standalone: true,
  imports: [  CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatBadgeModule,
    MatChipsModule,
    MatDividerModule,
    TicketCardComponent],
  templateUrl: './events-tickets.component.html',
  styleUrl: './events-tickets.component.css'
})
export class EventsTicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  activeTickets: Ticket[] = [];
  historyTickets: Ticket[] = [];
  selectedTabIndex = 0;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Datos de ejemplo
    this.tickets = [
      {
        id: 1,
        eventId: 101,
        eventName: 'Conferencia de Innovación Tecnológica',
        location: 'Auditorio Central',
        date: new Date('2025-05-15T18:00:00'),
        imageUrl: 'https://picsum.photos/800/400?random=1',
        quantity: 2,
        status: 'Pagado',
        price: 'Bs. 100',
        active: true
      },
      {
        id: 2,
        eventId: 102,
        eventName: 'Feria de Emprendimientos',
        location: 'Plaza Principal',
        date: new Date('2025-05-20T10:00:00'),
        imageUrl: 'https://picsum.photos/800/400?random=2',
        quantity: 1,
        status: 'Pagado',
        price: 'Entrada Libre',
        active: true
      },
      {
        id: 3,
        eventId: 103,
        eventName: 'C.R.O - SONILUM - Santa Cruz',
        location: 'Santa Cruz',
        date: new Date('2025-04-10T20:00:00'),
        imageUrl: 'https://picsum.photos/800/400?random=3',
        quantity: 1,
        status: 'Pagado',
        price: 'Bs. 250',
        active: true
      },
      {
        id: 4,
        eventId: 104,
        eventName: 'Festival Cultural Universitario',
        location: 'Teatro Municipal',
        date: new Date('2024-12-10T16:00:00'),
        imageUrl: 'https://picsum.photos/800/400?random=4',
        quantity: 3,
        status: 'Pagado',
        price: 'Bs. 60',
        active: false
      },
      {
        id: 5,
        eventId: 105,
        eventName: 'Hackathon Universitario',
        location: 'Laboratorio de Computación',
        date: new Date('2024-11-15T08:00:00'),
        imageUrl: 'https://picsum.photos/800/400?random=5',
        quantity: 1,
        status: 'Pagado',
        price: 'Bs. 25',
        active: false
      },
    ];

    // Filtrar tickets activos e historial
    this.activeTickets = this.tickets.filter(ticket => ticket.active);
    this.historyTickets = this.tickets.filter(ticket => !ticket.active);
  }

  viewTicketDetails(ticketId: number): void {
    console.log(`Navegando a detalles del ticket ${ticketId}`);
     this.router.navigate(['/MyTickets', ticketId]);
  }

  downloadTicket(ticketId: number): void {
    console.log(`Descargando ticket ${ticketId}`);
    // Lógica para descargar el ticket
  }

  changeTab(index: number): void {
    this.selectedTabIndex = index;
  }
}
