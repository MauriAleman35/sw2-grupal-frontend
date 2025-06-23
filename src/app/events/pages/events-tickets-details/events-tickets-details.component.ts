import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventsService } from '../../services/events.service';
import { TicketPurchase, Datum } from '../../interfaces/mi-tickets';

interface TicketDetails {
  id: string;                 // ID del ticket purchase
  purchaseId: string;         // ID de la compra
  eventId: string;            // ID del evento
  eventName: string;          // Título del evento
  eventDescription: string;   // Descripción del evento
  location: string;           // Dirección del evento
  date: Date;                 // Fecha del evento
  imageUrl: string;           // URL de la imagen del evento
  quantity: number;           // Cantidad de tickets
  status: string;             // Estado del pago
  price: string;              // Precio formateado
  subtotal: string;           // Subtotal
  systemFee: string;          // Tarifa del sistema
  qrCode?: string;            // URL del código QR
  sectionName: string;        // Nombre de la sección
  sectionDescription: string; // Descripción de la sección
  active: boolean;            // Si está activo (no usado)
  isUsed: boolean;            // Si fue usado
  validatedAt: string | null; // Fecha de validación
  paymentMethod: string;      // Método de pago
  paymentStatus: string;      // Estado del pago
  purchaseDate: Date;         // Fecha de compra
  ticketId: string;           // ID del ticket (no el purchase)
  organizerName: string;      // Nombre del organizador
}

@Component({
  selector: 'app-events-tickets-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './events-tickets-details.component.html',
  styleUrls: ['./events-tickets-details.component.css']
})
export class EventsTicketsDetailsComponent implements OnInit {
  ticket: TicketDetails | null = null;
  loading = true;
  error = false;
  purchaseData: Datum[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventsService: EventsService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTicketDetails(id);
    } else {
      this.error = true;
      this.loading = false;
    }
  }
  
  loadTicketDetails(ticketId: string): void {
    this.loading = true;
    
    this.eventsService.getPurchaseByUser().subscribe({
      next: (response) => {
        this.purchaseData = response.data.filter(purchase => purchase.status === 'paid');
        
        // Buscar el ticket por su ID
        let foundTicket: TicketPurchase | undefined;
        let parentPurchase: Datum | undefined;
        
        for (const purchase of this.purchaseData) {
          const ticket = purchase.ticketPurchases.find(t => t.id === ticketId);
          if (ticket) {
            foundTicket = ticket;
            parentPurchase = purchase;
            break;
          }
        }
        
        if (foundTicket && parentPurchase) {
          // Construir el objeto TicketDetails con los datos encontrados
          const event = foundTicket.ticket.section.event;
          
          this.ticket = {
            id: foundTicket.id,
            purchaseId: parentPurchase.id,
            eventId: event.id,
            eventName: event.title,
            eventDescription: event.description,
            location: event.address,
            date: new Date(event.start_date),
            imageUrl: event.image_event || 'assets/images/event-placeholder.jpg',
            quantity: foundTicket.quantity,
            status: parentPurchase.status,
            price: `Bs. ${foundTicket.price}`,
            subtotal: `Bs. ${foundTicket.subtotal}`,
            systemFee: `Bs. ${foundTicket.system_fee}`,
            qrCode: foundTicket.qrCodeUrl,
            sectionName: foundTicket.ticket.section.name,
            sectionDescription: foundTicket.ticket.section.description,
            active: !foundTicket.is_used && foundTicket.status,
            isUsed: foundTicket.is_used,
            validatedAt: foundTicket.validated_at,
            paymentMethod: parentPurchase.payment?.method || 'N/A',
            paymentStatus: parentPurchase.payment?.status || 'N/A',
            purchaseDate: new Date(parentPurchase.date),
            ticketId: foundTicket.ticket.id,
            organizerName: parentPurchase.tenant?.display_name || 'Organizador'
          };
          
          this.loading = false;
        } else {
          console.error(`No se encontró el ticket con ID: ${ticketId}`);
          this.error = true;
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error al cargar compras:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  downloadTicket(): void {
    if (!this.ticket?.qrCode) {
      this.snackBar.open('Este ticket no tiene un código QR disponible para descargar', 'Cerrar', { 
        duration: 3000,
        panelClass: 'error-snackbar'
      });
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.href = this.ticket.qrCode;
      link.download = `ticket-${this.ticket.eventName.replace(/\s+/g, '-')}-${this.ticket.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.snackBar.open('Ticket descargado correctamente', 'Cerrar', { 
        duration: 3000,
        panelClass: 'success-snackbar'
      });
    } catch (error) {
      console.error('Error al descargar el ticket:', error);
      this.snackBar.open('Error al descargar el ticket', 'Cerrar', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/MyTickets']);
  }

  getStatusClass(): string {
    if (!this.ticket) return '';
    
    switch (this.ticket.paymentStatus) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
  
  getUsageStatusClass(): string {
    if (!this.ticket) return '';
    
    return this.ticket.isUsed 
      ? 'bg-red-100 text-red-700'
      : 'bg-green-100 text-green-700';
  }
  
  getFormattedDate(date: Date | null | string): string {
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
  
  shareTicket(): void {
    if (!this.ticket) return;
    
    if (navigator.share) {
      navigator.share({
        title: `Ticket para ${this.ticket.eventName}`,
        text: `Te comparto mi ticket para ${this.ticket.eventName} el ${this.getFormattedDate(this.ticket.date)}`,
        url: window.location.href
      })
      .then(() => {
        this.snackBar.open('Ticket compartido correctamente', 'Cerrar', { duration: 3000 });
      })
      .catch((error) => {
        console.error('Error al compartir:', error);
      });
    } else {
      // Copiar link al portapapeles
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.snackBar.open('Link copiado al portapapeles', 'Cerrar', { duration: 3000 });
      });
    }
  }
}