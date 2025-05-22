import { Component, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DatumSectionAll, DatumSectionByEvent } from '../../../interfaces/section';
import { MatDialog } from '@angular/material/dialog';
import {  TicketConfirmationDialogComponent } from '../section-tickets/section-tickets.component';
import { OrganizationSectionService } from '../../../services/organization-sections.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SectionProgressDialogComponent } from '../section-progress-dialog/section-progress-dialog.component';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-section-table',
  templateUrl: './section-table.component.html',
  styleUrls: ['./section-table.component.scss']
})
export class SectionTableComponent implements OnChanges {
  @Input() sections: (DatumSectionAll | DatumSectionByEvent)[] = [];
  @Input() showEventInfo: boolean = true;
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() createTickets = new EventEmitter<string>();
  constructor(private sectionService:OrganizationSectionService){}
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  readonly dialog = inject(MatDialog);
    readonly snackBar = inject(MatSnackBar);
  dataSource = new MatTableDataSource<DatumSectionAll | DatumSectionByEvent>([]);
  displayedColumns: string[] = ['name', 'description', 'capacity', 'price', 'is_active', 'actions'];
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sections'] && this.sections) {
      this.dataSource.data = this.sections;
      
      if (this.showEventInfo) {
        this.displayedColumns = ['name', 'description', 'capacity', 'price', 'event', 'is_active', 'actions'];
      } else {
        this.displayedColumns = ['name', 'description', 'capacity', 'price', 'tickets', 'is_active', 'actions'];
      }
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  isEventData(section: any): section is DatumSectionAll {
    return 'event' in section;
  }

  isSectionByEvent(section: any): section is DatumSectionByEvent {
    return 'tickets' in section;
  }

  getTicketsCount(section: DatumSectionAll | DatumSectionByEvent): number {
    return this.isSectionByEvent(section) ? section.tickets?.length || 0 : 0;
  }

  hasTickets(section: DatumSectionAll | DatumSectionByEvent): boolean {
    return this.isSectionByEvent(section) && section.tickets?.length > 0;
  }

  onEdit(id: string): void {
    this.edit.emit(id);
  }

  onDelete(id: string): void {
    this.delete.emit(id);
  }

  onCreateTickets(id: string): void {
  // Encontrar la sección en el dataSource
  const section = this.dataSource.data.find(s => s.id === id);
  
  if (!section) return;
  
  // Verificar si hay tickets existentes
  const existingTickets = this.getTicketsCount(section);
  const availableCapacity = section.capacity - existingTickets;
  
  if (availableCapacity <= 0) {
    this.snackBar.open('No hay capacidad disponible para crear más tickets', 'Cerrar', {
      duration: 3000
    });
    return;
  }
  
  // Abrir diálogo de confirmación que ya existe
  const dialogRef = this.dialog.open(TicketConfirmationDialogComponent, {
    width: '400px',
    data: {
      sectionId: id,
      sectionName: section.name,
      maxCapacity: availableCapacity
    }
  });

  // Procesar respuesta del diálogo
  dialogRef.afterClosed().subscribe(quantity => {
    if (quantity) {
      // Abrir diálogo de progreso con animación
      const progressDialogRef = this.dialog.open(SectionProgressDialogComponent, {
        width: '350px',
        disableClose: true, // Evitar que el usuario cierre el diálogo
        data: {
          title: 'Generando tickets',
          message: `Creando ${quantity} tickets para la sección "${section.name}"`
        }
      });
      
      // Llamamos al servicio con el query parameter 'quantity'
      const params = new HttpParams().set('quantity', quantity.toString());
      
      this.sectionService.createTicketsSection(id, quantity).subscribe({
        next: (response) => {
          // Cerrar diálogo de progreso
          progressDialogRef.close();
          
          this.snackBar.open(
            `Se crearon ${response.data.created} tickets exitosamente`, 
            'Cerrar', 
            { duration: 3000 }
          );
          
          // Emitir evento para actualizar la vista
          this.createTickets.emit(id);
        },
        error: (error) => {
          // Cerrar diálogo de progreso
          progressDialogRef.close();
          
          console.error('Error al crear tickets:', error);
          this.snackBar.open(
            `Error: ${error.error?.message || 'No se pudieron crear los tickets'}`, 
            'Cerrar', 
            { duration: 5000 }
          );
        }
      });
    }
  });
}
}