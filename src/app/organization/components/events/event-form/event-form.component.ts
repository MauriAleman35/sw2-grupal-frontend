// organization/components/event-form/event-form.component.ts
import { Component, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EventBasicInfoComponent } from '../event-basic-info/event-basic-info.component';
import { EventSchedulingComponent } from '../event-scheduling/event-scheduling.component';
import { EventLocationComponent } from '../event-location/event-location.component';
import { EventMediaComponent } from '../event-media/event-media.component';
import { EventReviewComponent } from '../event-review/event-review.component';

import { OrganizationService } from '../../../services/organization.service';
import { DatumEvent, Event, Faculty } from '../../../interfaces/events';
import { EventFormService } from '../../../services/event-form.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    EventBasicInfoComponent,
    EventSchedulingComponent,
    EventLocationComponent,
    EventMediaComponent,
    EventReviewComponent
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true, displayDefaultIndicatorType: false }
    }
  ],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {
  isEditMode = false;
  eventId: string | null = null;
  isLoading = false;
  event: Partial<DatumEvent> = {};
  imageFile: File | null = null;
  tenantName: string = '';
  
  // Formularios para cada paso
  basicInfoForm!: FormGroup;
  schedulingForm!: FormGroup;
  locationForm!: FormGroup;
  mediaForm!: FormGroup;
  
  // Para seguimiento de completado
  stepsCompleted = {
    basicInfo: false,
    scheduling: false,
    location: false,
    media: false
  };

  constructor(
    private fb: FormBuilder,
    private eventFormService: EventFormService,
    private organizationService: OrganizationService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    @Optional() private dialogRef: MatDialogRef<EventFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Inicializar formularios
    this.initForms();
    
    // Verificar si estamos en modo edición (ya sea por ruta o por diálogo)
    if (this.data && this.data.mode === 'edit' && this.data.event) {
      this.isEditMode = true;
      this.event = { ...this.data.event };
      this.populateFormsWithEventData();
    }
  }

  ngOnInit(): void {
    // Obtener el nombre del tenant de la ruta
    this.route.paramMap.subscribe(params => {
      // Primero intentamos obtener el tenant de la ruta actual
      const tenantParam = params.get('tenantName');
      if (tenantParam) {
        this.tenantName = tenantParam;
      } else {
        // Si no está en los parámetros directos, buscamos en la ruta padre
        this.route.parent?.paramMap.subscribe(parentParams => {
          const parentTenantParam = parentParams.get('tenantName');
          if (parentTenantParam) {
            this.tenantName = parentTenantParam;
          }
        });
      }
       this.eventFormService.basicInfoValid$.subscribe(isValid => {
    this.stepsCompleted.basicInfo = isValid;
    console.log('Formulario de información básica válido:', isValid); // Para depuración
  });
    });
    
    // Si no estamos en un diálogo, verificar la ruta para modo edición
    if (!this.dialogRef) {
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.eventId = params['id'];
          this.isEditMode = true;
          this.loadEventData();
        }
      });
    }
    
    // Suscribirse a cambios en los formularios para actualizar el estado
    this.eventFormService.basicInfoForm$.subscribe(form => {
      this.basicInfoForm = form;
      this.stepsCompleted.basicInfo = form.valid;
    });
    
    this.eventFormService.schedulingForm$.subscribe(form => {
      this.schedulingForm = form;
      this.stepsCompleted.scheduling = form.valid;
    });
    
    this.eventFormService.locationForm$.subscribe(form => {
      this.locationForm = form;
      this.stepsCompleted.location = form.valid;
    });
    
    this.eventFormService.mediaForm$.subscribe(form => {
      this.mediaForm = form;
      this.stepsCompleted.media = form.valid;
    });
    
    this.eventFormService.imageFile$.subscribe(file => {
      this.imageFile = file;
    });
  }

  private initForms(): void {
    this.basicInfoForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      facultyId: ['', Validators.required]
    });
    
    this.schedulingForm = this.fb.group({
      start_date: ['', Validators.required],
      start_time: ['', Validators.required],
      end_date: ['', Validators.required],
      end_time: ['', Validators.required]
    });
    
    this.locationForm = this.fb.group({
      address: ['', Validators.required]
    });
    
    this.mediaForm = this.fb.group({
      imageUrl: [''],
      hasImage: [false]
    });
    
    // Inicializar los formularios en el servicio
    this.eventFormService.setBasicInfoForm(this.basicInfoForm);
    this.eventFormService.setSchedulingForm(this.schedulingForm);
    this.eventFormService.setLocationForm(this.locationForm);
    this.eventFormService.setMediaForm(this.mediaForm);
  }

  private loadEventData(): void {
    if (!this.eventId) return;
    
    this.isLoading = true;
    this.organizationService.getByIdEvent(this.eventId).subscribe({
      next: (response) => {
        this.event = response.data;
        this.populateFormsWithEventData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el evento', error);
        this.snackBar.open('Error al cargar los datos del evento', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        this.isLoading = false;
      }
    });
  }

  private populateFormsWithEventData(): void {
    if (!this.event) return;
    
    // Información básica
    this.basicInfoForm.patchValue({
      title: this.event.title || '',
      description: this.event.description || '',
      facultyId: this.event.faculty?.id || ''
    });
    
    // Programación
    if (this.event.start_date && this.event.end_date) {
      const startDate = new Date(this.event.start_date);
      const endDate = new Date(this.event.end_date);
      
      this.schedulingForm.patchValue({
        start_date: startDate,
        start_time: this.formatTimeForInput(startDate),
        end_date: endDate,
        end_time: this.formatTimeForInput(endDate)
      });
    }
    
    // Ubicación
    this.locationForm.patchValue({
      address: this.event.address || ''
    });
    
    // Multimedia
    if (this.event.image_url) {
      this.mediaForm.patchValue({
        imageUrl: this.event.image_url,
        hasImage: true
      });
    }
    
    // Actualizar los formularios en el servicio
    this.eventFormService.setBasicInfoForm(this.basicInfoForm);
    this.eventFormService.setSchedulingForm(this.schedulingForm);
    this.eventFormService.setLocationForm(this.locationForm);
    this.eventFormService.setMediaForm(this.mediaForm);
  }

  private formatTimeForInput(date: Date): string {
    return date.toTimeString().substring(0, 5); // Formato HH:MM
  }

  onSubmit(): void {
    if (!this.isFormsValid()) {
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      return;
    }
    
    const eventData = this.prepareEventData();
    this.isLoading = true;
    
    if (this.isEditMode && this.eventId) {
      this.updateEvent(eventData);
    } else {
      this.createEvent(eventData);
    }
  }

  private isFormsValid(): boolean {
    return this.basicInfoForm.valid && 
           this.schedulingForm.valid && 
           this.locationForm.valid && 
           this.mediaForm.valid;
  }

  private prepareEventData(): Event {
    // Combinar fecha y hora
    const startDate = this.schedulingForm.value.start_date;
    const startTime = this.schedulingForm.value.start_time;
    const endDate = this.schedulingForm.value.end_date;
    const endTime = this.schedulingForm.value.end_time;
    
    const startDateTime = this.combineDateTime(startDate, startTime);
    const endDateTime = this.combineDateTime(endDate, endTime);
    
    // Crear objeto Event
    const eventData: Event = {
      title: this.basicInfoForm.value.title,
      description: this.basicInfoForm.value.description,
      start_date: startDateTime.toISOString(),
      end_date: endDateTime.toISOString(),
      address: this.locationForm.value.address,
      facultyId: this.basicInfoForm.value.facultyId,
      image: this.imageFile || null // Si no hay imagen, será null
    };
    
    return eventData;
  }

  private combineDateTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const combinedDate = new Date(date);
    combinedDate.setHours(hours, minutes, 0, 0);
    return combinedDate;
  }

  private createEvent(eventData: Event): void {
    this.organizationService.createEvent(eventData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('Evento creado con éxito', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        this.closeOrNavigate();
      },
      error: (error) => {
        console.error('Error al crear el evento', error);
        this.isLoading = false;
        this.snackBar.open('Error al crear el evento', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  private updateEvent(eventData: Event): void {
    if (!this.eventId) return;
    
    this.organizationService.updateEvent(this.eventId, eventData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('Evento actualizado con éxito', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        this.closeOrNavigate();
      },
      error: (error) => {
        console.error('Error al actualizar el evento', error);
        this.isLoading = false;
        this.snackBar.open('Error al actualizar el evento', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  private closeOrNavigate(): void {
    if (this.dialogRef) {
      this.dialogRef.close(true);
    } else {
      // Navegar a la lista de eventos incluyendo el tenant en la ruta
      this.router.navigate([`tenant/${this.tenantName}/events`]);
    }
  }

  cancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close(false);
    } else {
      // Navegar a la lista de eventos incluyendo el tenant en la ruta
      this.router.navigate(['/tenant', this.tenantName, 'events']);
    }
  }
}