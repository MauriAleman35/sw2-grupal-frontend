import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { FormControl } from '@angular/forms';
import { Observable, Subject, of, startWith, map, takeUntil } from 'rxjs';
import { parseISO } from 'date-fns';
import { DatumSectionAll, DatumSectionByEvent } from '../../interfaces/section';
import { OrganizationSectionService } from '../../services/organization-sections.service';
import { OrganizationService } from '../../services/organization.service';
// Necesitamos este servicio

@Component({
  selector: 'app-org-section',
  templateUrl: './org-section.component.html',
  styleUrls: ['./org-section.component.scss']
})
export class OrgSectionComponent implements OnInit, OnDestroy {
  sections$: Observable<DatumSectionAll[]>;
  sectionsByEvent$: Observable<DatumSectionByEvent[]>;
  loading$: Observable<boolean>;
  events$: Observable<any[]>; // Para el selector de eventos
  
  viewMode: 'card' | 'table' = 'card';
  activeTab: number = 0; // 0: todas las secciones, 1: secciones por evento
  eventId: string | null = null;
  tenantPath: string = '';

  // Filtros
  searchControl = new FormControl('');
  statusFilter = new FormControl('all');
  eventFilter = new FormControl('');
  
  private destroy$ = new Subject<void>();

  constructor(
    private sectionService: OrganizationSectionService,
    private eventsService: OrganizationService, // Añadir este servicio
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar, 

  ) {

    this.sections$ = this.sectionService.sections$;
    this.sectionsByEvent$ = this.sectionService.sectionsByEvent$;
    this.loading$ = this.sectionService.loading$;
      this.events$ = this.eventsService.getAllEvents().pipe(
    map(response => {
      if (!response || !response.data) return [];
      
         const now = new Date();
      
      return response.data

        .filter(event => {

          if (!event.is_active) return false;
          const endDate = new Date(event.end_date);
          return endDate >= now;
        })
        // Ordenar por fecha de inicio (los más próximos primero)
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    })
  );
  }

  ngOnInit(): void {
    this.extractTenantFromUrl();
    
    // Verificar si hay un ID de evento en la URL
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['eventId']) {
        this.eventId = params['eventId'];
        this.eventFilter.setValue(this.eventId);
        this.activeTab = 1; // Activar la pestaña de secciones por evento
        this.loadSectionsByEvent();
      } else {
        this.loadAllSections();
      }
    });

    // Configurar filtro de búsqueda
    this.searchControl.valueChanges.pipe(
      startWith(''),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      // Aquí implementaríamos la lógica de filtrado
    });
  }

  // Extraer el tenant de la URL
  private extractTenantFromUrl(): void {
    const url = this.router.url;
    const urlParts = url.split('/');
    
    if (urlParts.length >= 3) {
      this.tenantPath = `/${urlParts[1]}/${urlParts[2]}`;
    }
  }

  // Métodos para cargar datos
  loadAllSections(): void {
    this.sectionService.getAllSectionsEvents().subscribe();
  }

  loadSectionsByEvent(): void {
    if (this.eventId) {
      console.log(this.eventId);
      this.sectionService.getSectionByEvent(this.eventId).subscribe((res)=>{
        console.log(res)
      });
    }
  }

  // Cambio de pestañas
  onTabChange(event: MatTabChangeEvent): void {
    this.activeTab = event.index;
    if (this.activeTab === 0) {
      this.eventId = null;
      this.loadAllSections();
      // Actualizar URL sin parámetro de evento
      this.router.navigate([`${this.tenantPath}/section`]);
    } else {
      if (this.eventFilter.value) {
        this.eventId = this.eventFilter.value;
        this.loadSectionsByEvent();
        // Actualizar URL con parámetro de evento
        this.router.navigate([`${this.tenantPath}/section/event/${this.eventId}`]);
      }
    }
  }

  // Cuando se selecciona un evento del dropdown
  onEventSelected(): void {
    this.eventId = this.eventFilter.value;
    if (this.eventId) {
      this.loadSectionsByEvent();
      // Actualizar URL con parámetro de evento si estamos en la pestaña correcta
      if (this.activeTab === 1) {
        this.router.navigate([`${this.tenantPath}/section/event/${this.eventId}`]);
      }
    }
  }

  refreshData(): void {
    if (this.activeTab === 0) {
      this.loadAllSections();
    } else if (this.eventId) {
      this.loadSectionsByEvent();
    }
  }

  // Navegación y acciones
  navigateToCreateSection(): void {
    const url = this.eventId ? 
      `${this.tenantPath}/section/create?eventId=${this.eventId}` : 
      `${this.tenantPath}/section/create`;
    this.router.navigateByUrl(url);
  }

  editSection(sectionId: string): void {
    this.router.navigate([`${this.tenantPath}/section/edit`, sectionId]);
  }

  deleteSection(sectionId: string): void {
    const dialogRef = this.dialog.open(MatDialog, {
      width: '400px',
      data: {
        title: '¿Eliminar sección?',
        message: '¿Estás seguro de que deseas eliminar esta sección? Esta acción no se puede deshacer.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sectionService.deleteSection(sectionId).subscribe({
          next: () => {
            this.snackBar.open('Sección eliminada con éxito', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'end',
              panelClass: ['bg-green-700', 'text-white']
            });
            this.refreshData();
          },
          error: (error) => {
            this.snackBar.open('Error al eliminar la sección', 'Cerrar', {
              duration: 5000,
              horizontalPosition: 'end',
              panelClass: ['bg-red-700', 'text-white']
            });
          }
        });
      }
    });
  }

  // Método para crear tickets
  createTickets(sectionId: string): void {
    const dialogRef = this.dialog.open(MatDialog, {
      width: '400px',
      data: {
        title: 'Crear tickets',
        message: '¿Deseas crear tickets para esta sección? Esta acción no se puede deshacer.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sectionService.createTicketsSection(sectionId).subscribe({
          next: (response) => {
            this.snackBar.open(`Tickets creados con éxito: ${response.data.created}`, 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'end',
              panelClass: ['bg-green-700', 'text-white']
            });
            this.refreshData();
          },
          error: (error) => {
            this.snackBar.open('Error al crear tickets', 'Cerrar', {
              duration: 5000,
              horizontalPosition: 'end',
              panelClass: ['bg-red-700', 'text-white']
            });
          }
        });
      }
    });
  }

  toggleView(): void {
    this.viewMode = this.viewMode === 'card' ? 'table' : 'card';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}