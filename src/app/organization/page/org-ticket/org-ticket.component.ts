import { Component, type OnInit, type OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import { 
  Subject, 
  Observable, 
  startWith, 
  debounceTime, 
  distinctUntilChanged,
  of
} from "rxjs";
import { takeUntil, switchMap, tap, catchError } from "rxjs/operators";

import { TicketGroup, PaginationParams, TicketStatistics, Pagination } from "../../interfaces/tickets";
import { TicketCardComponent } from "../../components/tickets/ticket-card/ticket-card.component";
import { OrganizationTicketService } from "../../services/organization-ticket.service";
import { PriceUpdateDialogComponent } from "../../components/tickets/price-update-dialog/price-update-dialog.component";

interface EventOption {
  id: string;
  title: string;
  ticketCount: number;
}

@Component({
  selector: "app-org-ticket",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatPaginatorModule,
    TicketCardComponent, 
  ],
  templateUrl: "./org-ticket.component.html",
  styleUrls: ["./org-ticket.component.css"],
})
export class OrgTicketComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  filterForm: FormGroup;
  
  uniqueTicketTypes: number = 0;

  currentStep = 'selectEvent'; // 'selectEvent' | 'viewSections'
  selectedEventId: string | null = null;
  selectedEventDetails: any = null;

  // Datos
  availableEvents: EventOption[] = [];
  eventSections: TicketGroup[] = [];
  selectedSections: string[] = [];


  pagination: Pagination = { total: 0, page: 1, limit: 10, pages: 0 };
  pageSizeOptions = [10, 25, 50, 100];

  loading = false;
  statistics: TicketStatistics = {
    totalTickets: 0,
    soldTickets: 0,
    availableTickets: 0,
    totalRevenue: 0,
    averagePrice: 0,
    eventsCount: 0,
    sectionsCount: 0,
  };

  constructor(
    private fb: FormBuilder,
    private ticketService: OrganizationTicketService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    this.filterForm = this.fb.group({
      selectedEvent: [""],
      searchTerm: [""],
    });
  }

  ngOnInit(): void {
    this.loadAvailableEvents();
    this.setupEventSelection();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAvailableEvents(): void {
    this.loading = true;
    this.ticketService
      .getAllEvents()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error("Error loading events:", error);
          this.snackBar.open("Error al cargar los eventos", "Cerrar", { duration: 3000 });
          return of([]);
        }),
        tap(() => this.loading = false)
      )
      .subscribe(events => {
        this.availableEvents = events;
      });
  }

  private setupEventSelection(): void {
    // Escuchar cambios en la selección de eventos
    this.filterForm.get("selectedEvent")!.valueChanges
      .pipe(
        startWith(""),
        takeUntil(this.destroy$),
        tap(eventId => {
          if (eventId) {
            this.selectedEventId = eventId;
            this.currentStep = 'viewSections';
            this.loadEventSections(eventId);
          } else {
            this.selectedEventId = null;
            this.currentStep = 'selectEvent';
            this.eventSections = [];
            this.statistics = {
              totalTickets: 0,
              soldTickets: 0,
              availableTickets: 0,
              totalRevenue: 0,
              averagePrice: 0,
              eventsCount: 0,
              sectionsCount: 0,
            };
          }
        })
      )
      .subscribe();
    
    // Escuchar cambios en el término de búsqueda
    this.filterForm.get("searchTerm")!.valueChanges
      .pipe(
        startWith(""),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        tap(searchTerm => {
          if (this.selectedEventId) {
            this.loadEventSections(this.selectedEventId, searchTerm);
          }
        })
      )
      .subscribe();
  }

  // Reemplaza el método loadEventSections en tu componente
// Actualiza tu método loadEventSections
loadEventSections(eventId: string, searchTerm: string = ""): void {
  this.loading = true;
  
  // Actualizar el evento seleccionado
  this.selectedEventDetails = this.availableEvents.find(e => e.id === eventId);
  
  // Usar el método mejorado que filtra por evento en el cliente
  this.ticketService.getEventSectionsAndTickets(
    eventId, 
    this.pagination.page, 
    this.pagination.limit,
    searchTerm
  )
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: (response) => {
        this.eventSections = response.tickets;
        this.pagination = response.pagination;
        this.statistics = response.totalStats;
        
        // Actualizar contador de tipos únicos de tickets
        this.uniqueTicketTypes = this.eventSections.length;
        
        // Calcular el total real contando tickets agrupados
        const totalRealTickets = this.eventSections.reduce((total, section) => 
          total + (section._count || 1), 0);
          
        console.log(`Mostrando ${this.uniqueTicketTypes} tipos de tickets únicos de un total de ${totalRealTickets} tickets reales`);
        
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading event sections:", error);
        this.snackBar.open("Error al cargar las secciones del evento", "Cerrar", { duration: 3000 });
        this.loading = false;
      }
    });
}

  // Volver a la selección de eventos
  backToEventSelection(): void {
    this.selectedEventId = null;
    this.selectedEventDetails = null;
    this.currentStep = 'selectEvent';
    this.filterForm.get('selectedEvent')?.setValue('');
    this.clearSelection();
  }

  // Manejo de paginación
  onPageChange(event: PageEvent): void {
    this.pagination.page = event.pageIndex + 1; // Angular Paginator usa 0-based index
    this.pagination.limit = event.pageSize;
    
    if (this.selectedEventId) {
      this.loadEventSections(this.selectedEventId, this.filterForm.get('searchTerm')?.value || '');
    }
  }

  // Manejo de selección de tickets
  onTicketSelectionChange(sectionId: string, selected: boolean): void {
    if (selected) {
      if (!this.selectedSections.includes(sectionId)) {
        this.selectedSections.push(sectionId);
      }
    } else {
      this.selectedSections = this.selectedSections.filter((id) => id !== sectionId);
    }
  }

  isTicketSelected(sectionId: string): boolean {
    return this.selectedSections.includes(sectionId);
  }

  // Acciones masivas
  selectAllVisible(): void {
    this.selectedSections = [...this.eventSections.map((group) => group.sectionId)];
  }

  clearSelection(): void {
    this.selectedSections = [];
  }

  // Aplicar promoción
  // Aplicar promoción
  openPriceUpdateDialog(): void {
    console.log("Opening dialog. Selected sections:", this.selectedSections);
  
    if (this.selectedSections.length === 0) {
     this.snackBar.open("Selecciona al menos una sección", "Cerrar", { duration: 3000 });
      return;
    }

     const selectedGroups = this.eventSections.filter((group) => this.selectedSections.includes(group.sectionId));
      console.log("Selected groups for dialog:", selectedGroups);

    const dialogRef = this.dialog.open(PriceUpdateDialogComponent, {
     width: "800px",
      maxWidth: "90vw",
      data: {
        selectedSections: this.selectedSections,
        ticketGroups: selectedGroups,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("Dialog closed with result:", result);
     if (result) {
       this.applyPriceUpdate(result);
     }
    });
  }

  private applyPriceUpdate(priceUpdates: any[]): void {
  this.loading = true;
  this.ticketService
    .updateTicketPrices(
      priceUpdates, 
      this.pagination.page, 
      this.pagination.limit 
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.snackBar.open("Precios actualizados correctamente", "Cerrar", { duration: 3000 });
        if (this.selectedEventId) {
          this.loadEventSections(this.selectedEventId); // Recargar datos del evento
        }
        this.clearSelection();
      },
      error: (error) => {
        console.error("Error updating prices:", error);
        this.snackBar.open("Error al actualizar precios", "Cerrar", { duration: 3000 });
        this.loading = false;
      },
    });
}

  // Restaurar precios
  restoreOriginalPrices(): void {
    if (this.selectedSections.length === 0) {
      this.snackBar.open("Selecciona al menos una sección", "Cerrar", { duration: 3000 });
      return;
    }

    this.loading = true;
    this.ticketService
      .restoreOriginalPrices(this.selectedSections,this.pagination.page, // Pasar la página actual
      this.pagination.limit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open("Precios restaurados correctamente", "Cerrar", { duration: 3000 });
          if (this.selectedEventId) {
            this.loadEventSections(this.selectedEventId);
          }
          this.clearSelection();
        },
        error: (error) => {
          console.error("Error restoring prices:", error);
          this.snackBar.open("Error al restaurar precios", "Cerrar", { duration: 3000 });
          this.loading = false;
        },
      });
  }

  // Métodos de utilidad
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(amount);
  }

  getSelectedEventTitle(): string {
    if (!this.selectedEventDetails) return "Selecciona un evento";
    return this.selectedEventDetails.title;
  }

  // Método para refrescar datos
  refreshData(): void {
    if (this.selectedEventId) {
      this.loadEventSections(this.selectedEventId);
    } else {
      this.loadAvailableEvents();
    }
  }

  // TrackBy function para mejorar rendimiento
  trackByTicketGroup(index: number, item: TicketGroup): string {
    return item.sectionId;
  }

  // Método para obtener información de paginación
  getPaginationInfo(): string {
    const start = (this.pagination.page - 1) * this.pagination.limit + 1;
    const end = Math.min(this.pagination.page * this.pagination.limit, this.pagination.total);
    return `${start}-${end} de ${this.pagination.total}`;
  }
}