import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FacultyFormComponent } from '../../components/faculty/faculty-form/faculty-form.component';
import { FacultyDeleteDialogComponent } from '../../components/faculty/faculty-delete-dialog/faculty-delete-dialog.component';
import { OrganizationService } from '../../services/organization.service';
import { DatumFaculty, FacultyParams } from '../../interfaces/faculty';

@Component({
  selector: 'app-faculty-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './org-faculty.component.html',
  styleUrls: ['./org-faculty.component.css']
})


//Agregar Mapa en location
export class OrgFacultyComponent implements OnInit {
  // Colores predefinidos para asignar a las facultades
  private colors: string[] = [
    '#d4a017', // Dorado (color principal)
    '#3b82f6', // Azul
    '#10b981', // Verde
    '#8b5cf6', // Púrpura
    '#ef4444', // Rojo
    '#f59e0b', // Naranja
    '#6b7280', // Gris
    '#1e40af'  // Azul oscuro
  ];

  faculties: DatumFaculty[] = [];
  displayedColumns: string[] = ['name', 'location', 'tenant', 'created_at', 'status', 'actions'];
  filteredFaculties: DatumFaculty[] = [];
  searchTerm: string = '';
  statusFilter: string = 'all';
  viewMode: 'table' | 'grid' = 'grid';
  isLoading: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<DatumFaculty>;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private organizationService: OrganizationService 
  ) { }

  ngOnInit(): void {
    this.loadFaculties();
  }

  loadFaculties(): void {
    this.isLoading = true;
    this.organizationService.getAllFaculty().subscribe({
      next: (res) => {
        this.faculties = res.data;
        this.faculties=this.faculties.filter((faculty)=>faculty.is_active==true)
        this.filteredFaculties = [...this.faculties];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar facultades', error);
        this.snackBar.open('Error al cargar las facultades', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  // Método para obtener un color basado en el índice
  getFacultyColor(index: number): string {
    return this.colors[index % this.colors.length];
  }

  applyFilters(): void {
    let filtered = [...this.faculties];
    
    // Aplicar filtro de búsqueda
    if (this.searchTerm) {
      const searchTermLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(faculty => 
        faculty.name.toLowerCase().includes(searchTermLower) ||
        faculty.location.toLowerCase().includes(searchTermLower) ||
        faculty.tenant.display_name.toLowerCase().includes(searchTermLower)
      );
    }
    
    // Aplicar filtro de estado
    if (this.statusFilter !== 'all') {
      const isActive = this.statusFilter === 'active';
      filtered = filtered.filter(faculty => faculty.is_active === isActive);
    }
    
    this.filteredFaculties = filtered;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(FacultyFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Simular la creación de una nueva facultad
        console.log(result)
        const newFaculty:any = {
            name:result.name,
            location:result.location,
            
        };
        this.organizationService.createFaculty(newFaculty).subscribe((res)=>{
          console.log(res.data)
          this.loadFaculties();
          // this.faculties.push(newFaculty);
          this.applyFilters();
          
        })
       
        this.snackBar.open('Facultad creada con éxito', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  openEditDialog(faculty: DatumFaculty): void {
    const dialogRef = this.dialog.open(FacultyFormComponent, {
      width: '600px',
      data: { mode: 'edit', faculty: { ...faculty } }
    });

    console.log(faculty.id)
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const facultyToUpdate: Partial<FacultyParams> = {
          name: result.name,

        }
        this.organizationService.updateFaculty(faculty.id,facultyToUpdate).subscribe((res)=>{
          
          this.loadFaculties();
          this.applyFilters();
          console.log(res.data)   
        })
        this.snackBar.open('Facultad actualizada con éxito', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  openDeleteDialog(faculty: DatumFaculty): void {
    const dialogRef = this.dialog.open(FacultyDeleteDialogComponent, {
      width: '400px',
      data: { faculty }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Simular la eliminación de la facultad
        this.organizationService.deleteFaculty(faculty.id).subscribe((res)=>{
          this.loadFaculties();
          this.applyFilters();
          console.log(res.data)
          
        this.snackBar.open('Facultad eliminada con éxito', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        })

        

      }
    });
  }

  toggleStatus(faculty: DatumFaculty): void {
    const index = this.faculties.findIndex(f => f.id === faculty.id);
    if (index !== -1) {
      this.faculties[index].is_active = !this.faculties[index].is_active;
      this.applyFilters();
      
      const message = this.faculties[index].is_active ? 'Facultad activada' : 'Facultad desactivada';
      this.snackBar.open(message, 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'table' ? 'grid' : 'table';
  }
}