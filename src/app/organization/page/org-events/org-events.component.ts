// organization/pages/org-events/org-events.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EventFormComponent } from '../../components/events/event-form/event-form.component';
import { EventDeleteDialogComponent } from '../../components/events/event-delete-dialog/event-delete-dialog.component';
import { DatumEvent } from '../../interfaces/events';
import { OrganizationService } from '../../services/organization.service';

type EventStatus = 'upcoming' | 'active' | 'completed' | 'cancelled' | 'draft';

@Component({
  selector: 'app-org-events',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatMenuModule,
    MatDividerModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './org-events.component.html',
  styleUrls: ['./org-events.component.css']
})
export class OrgEventsComponent implements OnInit {
  events: (DatumEvent & { status: EventStatus })[] = [];
  filteredEvents: DatumEvent[] = [];
  isLoading: boolean = false;
  tenantName: string = '';

  constructor(
    private eventService: OrganizationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar, 
    private router:Router,
      private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
      // Obtener el nombre del tenant
  this.route.parent?.paramMap.subscribe(params => {
    const tenantParam = params.get('tenantName');
    if (tenantParam) {
      this.tenantName = tenantParam;
    }
  });
    this.loadEvents();
  }

  getEventStatus(event: DatumEvent): EventStatus {
    if (!event.is_active) return 'cancelled';

    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'active';
    if (now > endDate) return 'completed';

    return 'draft';
  }

  loadEvents(): void {
    this.isLoading = true;
    this.eventService.getAllEvents().subscribe({
      next: (response) => {
        this.events = response.data.map(event => ({
          ...event,
          status: this.getEventStatus(event)
        }));
        this.filteredEvents = [...this.events];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar eventos', error);
        this.isLoading = false;
        this.snackBar.open('Error al cargar eventos', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  openCreateEvent(): void {
     this.router.navigate(['/tenant', this.tenantName, 'events', 'create']);
  }

  openEditEvent(event: DatumEvent): void {
   
      this.router.navigate(['/tenant', this.tenantName, 'events', `edit/:${event.id}`]);
  }

  openDeleteDialog(event: DatumEvent): void {
    const dialogRef = this.dialog.open(EventDeleteDialogComponent, {
      width: '400px',
      data: { event }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eventService.deleteEvent(event.id).subscribe({
          next: () => {
            this.loadEvents();
            this.snackBar.open('Evento eliminado con éxito', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            console.error('Error al eliminar evento', error);
            this.snackBar.open('Error al eliminar el evento', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  toggleEventStatus(event: DatumEvent): void {
    console.log('Toggling event status:', event);
    // Aquí podrías implementar la lógica para activar/desactivar el evento
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: EventStatus): string {
    switch (status) {
      case 'upcoming':
        return 'Próximo';
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      case 'draft':
        return 'Borrador';
      default:
        return status;
    }
  }

  filterEventsByStatus(status: EventStatus): DatumEvent[] {
    return this.events.filter(event => event.status === status);
  }

  navigateToEventDetails(eventId: string): void {
    console.log('Navigate to event:', eventId);
  }
}