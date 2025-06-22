import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { TicketCardComponent } from '../../components/ticket-card/ticket-card.component';
import { EventsService } from '../../services/events.service';
import { Datum } from '../../interfaces/purchase';

// Modelo simplificado para la UI
interface TicketModel {
  id: string;
  eventId: string;
  eventName: string;
  location: string;
  date: Date;
  imageUrl?: string;
  quantity: number;
  status: 'paid' | 'pending' | 'cancelled';
  price: string;
  qrCode?: string;
  sectionName: string;
  active: boolean;
}

@Component({
  selector: 'app-events-tickets',
  standalone: true,
  imports: [  
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatBadgeModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    TicketCardComponent
  ],
  templateUrl: './events-tickets.component.html',
  styleUrl: './events-tickets.component.css'
})
export class EventsTicketsComponent implements OnInit {
  purchases: Datum[] = [];
  activeTickets: TicketModel[] = [];
  historyTickets: TicketModel[] = [];
  selectedTabIndex = 0;
  loading = true;
  error = false;

  constructor(private router: Router, private eventsService: EventsService) { }

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases(): void {
    this.loading = true;
    this.eventsService.getPurchaseByUser().subscribe({
      next: (response) => {
        this.purchases = response.data;
        this.purchases= this.purchases.filter(purchase => purchase.status == 'paid');
        this.processTicketsFromPurchases();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar compras:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  processTicketsFromPurchases(): void {
    const allTickets: TicketModel[] = [];
    
    this.purchases.forEach(purchase => {
      // Solo procesar compras pagadas
      if (purchase.status === 'paid') {
        purchase.ticketPurchases.forEach(ticketPurchase => {
          const ticket: TicketModel = {
            id: ticketPurchase.id,
            eventId: purchase.id,
            eventName: purchase.tenant.display_name || 'Evento',
            location: ticketPurchase.ticket.section.description || 'Ubicación no especificada',
            date: new Date(ticketPurchase.ticket.date),
            quantity: ticketPurchase.quantity,
            status: purchase.status as 'paid',
            price: `Bs/. ${ticketPurchase.price}`,
            qrCode: ticketPurchase.qrCodeUrl,
            sectionName: ticketPurchase.ticket.section.name,
            active: !ticketPurchase.is_used && ticketPurchase.status
          };
          
          allTickets.push(ticket);
        });
      }
    });
    
    // Filtrar tickets activos e históricos
    this.activeTickets = allTickets.filter(ticket => ticket.active);
    this.historyTickets = allTickets.filter(ticket => !ticket.active);
  }

  viewTicketDetails(ticketId: string): void {
    console.log(`Navegando a detalles del ticket ${ticketId}`);
    this.router.navigate(['/MyTickets', ticketId]);
  }

  downloadTicket(ticket: TicketModel): void {
    if (!ticket.qrCode) {
      console.error('No hay código QR para descargar');
      return;
    }
  
    const link = document.createElement('a');
    link.href = ticket.qrCode;
    link.download = `ticket-${ticket.eventName}-${ticket.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  changeTab(index: number): void {
    this.selectedTabIndex = index;
  }
}