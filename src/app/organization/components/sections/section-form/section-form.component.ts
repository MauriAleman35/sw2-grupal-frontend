import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, of } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';


import { DatumSectionByEvent, Section } from '../../../interfaces/section';
import { OrganizationSectionService } from '../../../services/organization-sections.service';
import { OrganizationService } from '../../../services/organization.service';
import { DataSectionById, DatumEvent, EventsResponse, GetSectionByIDResponse } from '../../../interfaces/events';
import { map } from 'leaflet';


@Component({
  selector: 'app-section-form',
  templateUrl: './section-form.component.html',
  styleUrls: ['./section-form.component.scss']
})
export class SectionFormComponent implements OnInit, OnDestroy {
  // Opción 1: Declarar la variable sin inicializar
  sectionForm: FormGroup;
  isEditMode: boolean = false;
  sectionId: string | null = null;
  eventId: string | null = null;
  events:any[]=[];
  loading: boolean = false;
  submitted: boolean = false;
    tenantPath: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private sectionService: OrganizationSectionService,
    private eventsService: OrganizationService,
    private snackBar: MatSnackBar
  ) {
    // Opción 1: Inicializar en el constructor
    this.sectionForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      price: ['', [Validators.required, Validators.min(0)]],
      capacity: ['', [Validators.required, Validators.min(1)]],
      is_active: [true],
      eventId: ['', Validators.required],
    });
    

         
  }

  ngOnInit(): void {
    this.extractTenantFromUrl();
    // Obtener params de la ruta (id de sección si estamos editando)
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.sectionId = params['id'];
        this.isEditMode = true;
        this.loadSectionData();
      }
    });

    // Obtener query params (eventId si viene de un evento específico)
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['eventId']) {
        this.eventId = params['eventId'];
        const eventIdControl = this.sectionForm.get('eventId');
        if (eventIdControl) {
          eventIdControl.setValue(this.eventId);
          eventIdControl.disable();
        }
      }
    });

    // Cargar lista de eventos disponibles
    this.loadEvents();
  }
  // Extraer el tenant de la URL
  private extractTenantFromUrl(): void {
    const url = this.router.url;
    const urlParts = url.split('/');
    
    if (urlParts.length >= 3) {
      this.tenantPath = `/${urlParts[1]}/${urlParts[2]}`;
    }
  }
  public loadEvents():any {
    this.eventsService.getAllEvents().subscribe(
      {
        next:(res)=>{
          if (!res|| !res.data) return [];
      
         const now = new Date();
      
        this.events = res.data
       return  this.events=this.events.filter(res => {

          if (!res.is_active) return false;
          const endDate = new Date(res.end_date);
          return endDate >= now;
        })
        // Ordenar por fecha de inicio (los más próximos primero)
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
        }
      }
      )
  }

  private loadSectionData(): void {
    if (!this.sectionId) return;
    this.sectionService.getByIdSection(this.sectionId).subscribe({
      next:(res)=>{
        if (res.statusCode === 200) {
          const section = res.data;
          this.updateFormWithSectionData(section);
               this.loading = false;
        } else {
          this.snackBar.open('Error al cargar la sección', 'Cerrar', {
            duration: 3000,
            panelClass: ['bg-red-700', 'text-white']
          });
        }
      }
    })
  
 

  }

  private updateFormWithSectionData(section: DataSectionById): void {
    console.log(section)
    this.sectionForm.patchValue({
      name: section.name,
      description: section.description,
      price: section.price,
      capacity: section.capacity,
      is_active: section.is_active,
      eventId: section.event.id
    });
    
    if (section.event.id) {
      this.eventId = section.event.id;
      const eventIdControl = this.sectionForm.get('eventId');
      if (eventIdControl) {
        eventIdControl.disable();
      }
    }
  }

  onSubmit(): void {
    if (this.sectionForm.invalid) {
      this.markFormGroupTouched(this.sectionForm);
      return;
    }
    
    this.submitted = true;
    
    // Construir el objeto de sección
    const formValue = this.sectionForm.getRawValue();
    
    const section: any = {
      name: formValue.name,
      description: formValue.description,
      capacity: parseInt(formValue.capacity),
      price: parseFloat(formValue.price),
      eventId: formValue.eventId
    };
    
    if (this.isEditMode && this.sectionId) {
      section.id = this.sectionId; // Aquí estaba el problema de tipo
      const sectionUpdate={
        name:section.name,
        description:section.description,
        capacity:section.capacity,
        price:section.price,
      }
    
      console.log('Actualizando sección:', section.id);
      this.sectionService.updateSection(section.id, sectionUpdate).subscribe({
        next:(res)=>{
           this.submitted = false;
      
      this.snackBar.open('Sección actualizada con éxito', 'Cerrar', {
        duration: 3000,
        panelClass: ['bg-green-700', 'text-white']
      });
      this.goBack();
        }
      })
      // Simulación de actualización
     
    } else {
      // Crear nueva sección
      this.sectionService.createSection(section).pipe(
        tap(response => {
          this.snackBar.open('Sección creada con éxito', 'Cerrar', {
            duration: 3000,
            panelClass: ['bg-green-700', 'text-white']
          });
          this.goBack();
        }),
        catchError(error => {
          console.error('Error al crear la sección:', error);
          this.snackBar.open('Error al crear la sección', 'Cerrar', {
            duration: 5000,
            panelClass: ['bg-red-700', 'text-white']
          });
          return of(null);
        }),
        finalize(() => {
          this.submitted = false;
        }),
        takeUntil(this.destroy$)
      ).subscribe();
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any) instanceof FormGroup) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  goBack(): void {
    if (this.eventId) {
      this.router.navigate([`${this.tenantPath}/section`]);
    } else {
      this.router.navigate([`${this.tenantPath}/section`]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}