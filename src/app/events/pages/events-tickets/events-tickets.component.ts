import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TicketCardComponent } from '../../components/ticket-card/ticket-card.component';
import { EventsService } from '../../services/events.service';
import { Datum, TicketPurchase } from '../../interfaces/mi-tickets';
import { DatePipe } from '@angular/common';

// Modelo mejorado para la UI
interface TicketModel {
  id: string;              // ID del ticket purchase
  purchaseId: string;      // ID de la compra
  eventId: string;         // ID del evento
  eventName: string;       // Título del evento
  eventDescription: string;// Descripción del evento
  location: string;        // Dirección del evento
  date: Date;              // Fecha del evento
  imageUrl: string;        // URL de la imagen del evento
  quantity: number;        // Cantidad de tickets
  status: 'paid' | 'pending' | 'cancelled'; // Estado del pago
  price: string;           // Precio formateado
  qrCode?: string;         // URL del código QR
  sectionName: string;     // Nombre de la sección
  sectionDescription: string; // Descripción de la sección
  active: boolean;         // Si está activo (no usado)
  paymentMethod: string;   // Método de pago
  paymentStatus: string;   // Estado del pago
  purchaseDate: Date;      // Fecha de compra
  ticketId: string;        // ID del ticket (no el purchase)
}

@Component({
  selector: 'app-events-tickets',
  standalone: true,
  imports: [  
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatBadgeModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,

    DatePipe
  ],
  templateUrl: './events-tickets.component.html',
  styleUrls: ['./events-tickets.component.css']
})
export class EventsTicketsComponent implements OnInit {
  purchases: Datum[] = [];
  activeTickets: TicketModel[] = [];
  historyTickets: TicketModel[] = [];
  selectedTabIndex = 0;
  loading = true;
  error = false;
  
  // Estadísticas de tickets
  totalTickets = 0;
  totalPaidAmount = 0;

  constructor(
    private router: Router, 
    private eventsService: EventsService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases(): void {
    this.loading = true;
    this.error = false;
    
    this.eventsService.getPurchaseByUser().subscribe({
      next: (response) => {
        console.log('Compras cargadas:', response);
        this.purchases = response.data;
        
        // Solo procesar compras pagadas
        this.purchases = this.purchases.filter(purchase => purchase.status === 'paid');
        
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
    let totalPaid = 0;
    
    this.purchases.forEach(purchase => {
      // Solo procesar compras pagadas
      if (purchase.status === 'paid') {
        purchase.ticketPurchases.forEach(ticketPurchase => {
          const event = ticketPurchase.ticket.section.event;
          
          // Sumar al monto total pagado
          const ticketTotal = parseFloat(ticketPurchase.subtotal);
          if (!isNaN(ticketTotal)) {
            totalPaid += ticketTotal;
          }
          
          const ticket: TicketModel = {
            id: ticketPurchase.id,
            purchaseId: purchase.id,
            eventId: event.id,
            ticketId: ticketPurchase.ticket.id,
            eventName: event.title,
            eventDescription: event.description,
            location: event.address,
            date: new Date(event.start_date),
            imageUrl: event.image_event || 'assets/images/event-placeholder.jpg',
            quantity: ticketPurchase.quantity,
            status: purchase.status as 'paid',
            price: `Bs. ${ticketPurchase.price}`,
            qrCode: ticketPurchase.qrCodeUrl,
            sectionName: ticketPurchase.ticket.section.name,
            sectionDescription: ticketPurchase.ticket.section.description,
            active: !ticketPurchase.is_used && ticketPurchase.status,
            paymentMethod: purchase.payment?.method || 'N/A',
            paymentStatus: purchase.payment?.status || 'N/A',
            purchaseDate: new Date(purchase.date)
          };
          
          allTickets.push(ticket);
        });
      }
    });
    
    // Guardar estadísticas
    this.totalTickets = allTickets.length;
    this.totalPaidAmount = totalPaid;
    
    // Filtrar tickets activos e históricos
    this.activeTickets = allTickets.filter(ticket => ticket.active);
    this.historyTickets = allTickets.filter(ticket => !ticket.active);
    
    console.log(`Tickets procesados: ${allTickets.length} (${this.activeTickets.length} activos, ${this.historyTickets.length} históricos)`);
  }

  viewTicketDetails(ticket: TicketModel): void {
    console.log('Navegando a detalles del ticket:', ticket);
    this.router.navigate(['/MyTickets', ticket.id]);
  }

  downloadTicket(ticket: TicketModel): void {
    if (!ticket.qrCode) {
      this.snackBar.open('Este ticket no tiene un código QR para descargar', 'Cerrar', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
      return;
    }
  
    try {
      const link = document.createElement('a');
      link.href = ticket.qrCode;
      link.download = `ticket-${ticket.eventName.replace(/\s+/g, '-')}-${ticket.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.snackBar.open('Ticket descargado correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: 'success-snackbar'
      });
    } catch (error) {
      console.error('Error al descargar el ticket:', error);
      this.snackBar.open('Error al descargar el ticket. Inténtalo de nuevo.', 'Cerrar', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
    }
  }

  changeTab(index: number): void {
    this.selectedTabIndex = index;
  }
  
  // Formatear fecha
  formatDate(date: Date | string): string {
    if (!date) return 'Fecha no disponible';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Obtener clase de estado para visual
  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}