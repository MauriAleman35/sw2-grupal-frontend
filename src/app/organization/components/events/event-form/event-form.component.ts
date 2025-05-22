// organization/components/event-form/event-form.component.ts
import { Component, OnInit, Inject, Optional, NgZone } from '@angular/core';
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
import { GeocodingService } from '../../../services/geocoding.service';
import { HttpClient } from '@angular/common/http';

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
  imageSection: File | null = null;
  tenantName: string = '';
  isSubmitting = false;
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
    private httpClient: HttpClient,
    private geocodgingService: GeocodingService,
    private snackBar: MatSnackBar,
    private router: Router,
      private ngZone: NgZone,
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
     this.eventFormService.imageSectionFile$.subscribe(file => {
      this.imageSection = file;
    });
  }

  private initForms(): void {
  this.basicInfoForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    facultyId: ['', Validators.required]
  });
  
  this.schedulingForm = this.fb.group({
    // Usa nombres consistentes: startDate en lugar de start_date
    startDate: ['', Validators.required],
    startTime: ['', Validators.required],
    endDate: ['', Validators.required],
    endTime: ['', Validators.required],
    status: ['upcoming'] // Añade este campo si lo necesitas
  });
  
  this.locationForm = this.fb.group({
    address: ['', Validators.required],
    latitude: [0, Validators.required], // Añade campos para coordenadas
    longitude: [0, Validators.required]
  });
  
  this.mediaForm = this.fb.group({
    imageUrl: [''],
    imageSection: [''],
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
// Añade este método para obtener coordenadas a partir de una dirección
private getCoordinatesForAddress(address: string): void {
  // Implementación simplificada - Reemplaza esto con una llamada a un servicio real
  const geocodingService = new GeocodingService(this.httpClient);
  
  geocodingService.geocodeAddress(address).subscribe({
    next: (coords) => {
      if (coords) {
        console.log('Coordenadas obtenidas para la dirección:', coords);
        
        // Actualiza el formulario con las coordenadas
        this.locationForm.patchValue({
          latitude: coords.lat,
          longitude: coords.lng
        });
        
        // Actualiza el servicio
        this.eventFormService.setLocationForm(this.locationForm);
      } else {
        console.warn('No se pudieron obtener coordenadas para:', address);
        
        // Establece coordenadas por defecto (p.ej. centro de tu ciudad)
        this.locationForm.patchValue({
          latitude: -17.78629, // Coordenadas por defecto (Santa Cruz)
          longitude: -63.18117
        });
        
        this.eventFormService.setLocationForm(this.locationForm);
      }
    },
    error: (error) => {
      console.error('Error al geocodificar la dirección:', error);
      
      // Establece coordenadas por defecto en caso de error
      this.locationForm.patchValue({
        latitude: -17.78629,
        longitude: -63.18117
      });
      
      this.eventFormService.setLocationForm(this.locationForm);
    }
  });
}
  private populateFormsWithEventData(): void {
  if (!this.event) return;
  
  console.log('Poblando formularios con datos del evento:', this.event);
  
  // Información básica
  this.basicInfoForm.patchValue({
    title: this.event.title || '',
    description: this.event.description || '',
    facultyId: this.event.faculty?.id || ''
  });
  
  // Programación - Maneja las fechas correctamente
  if (this.event.start_date && this.event.end_date) {
    const startDate = new Date(this.event.start_date);
    const endDate = new Date(this.event.end_date);
    
    this.schedulingForm.patchValue({
      startDate: startDate, // Usa el mismo nombre que en initForms
      startTime: this.formatTimeForInput(startDate),
      endDate: endDate,
      endTime: this.formatTimeForInput(endDate),
      status: this.event.is_active || 'upcoming'
    });
    
    console.log('Fechas cargadas:', {
      startDate,
      endDate,
      startTime: this.formatTimeForInput(startDate),
      endTime: this.formatTimeForInput(endDate)
    });
  }
  
  // Ubicación - Añade geocodificación para obtener coordenadas
  if (this.event.address) {
    // Primero actualiza el campo de dirección
    this.locationForm.patchValue({
      address: this.event.address
    });
    
    // Usa un servicio de geocodificación para obtener coordenadas
    // (Esta parte requiere implementar el servicio de geocodificación que sugerí anteriormente)
    this.getCoordinatesForAddress(this.event.address);
  }
  
  // Multimedia
  if (this.event.image_event) {
    this.mediaForm.patchValue({
      imageUrl: this.event.image_event,
      imageSection: this.event.image_section,
      hasImage: true
    });
    
    console.log('Imagen cargada:', this.event.image_event,this.event.image_section);
  }
  
  // Actualizar los formularios en el servicio DESPUÉS de poblados
  setTimeout(() => {
    this.eventFormService.setBasicInfoForm(this.basicInfoForm);
    this.eventFormService.setSchedulingForm(this.schedulingForm);
    this.eventFormService.setLocationForm(this.locationForm);
    this.eventFormService.setMediaForm(this.mediaForm);
    
    // Notificar la validez de los formularios
    this.eventFormService.notifyFormValidityChange('basicInfo', this.basicInfoForm.valid);
    this.eventFormService.notifyFormValidityChange('scheduling', this.schedulingForm.valid);
    this.eventFormService.notifyFormValidityChange('location', this.locationForm.valid);
    this.eventFormService.notifyFormValidityChange('media', this.mediaForm.valid);
  }, 0);
}
  private formatTimeForInput(date: Date): string {
    return date.toTimeString().substring(0, 5); // Formato HH:MM
  }

  onSubmit(): void {

  
  // Registrar datos para depuración
  console.log('Enviando formulario en modo:', this.isEditMode ? 'edición' : 'creación');
  

  
  // Crear el objeto de datos del evento
  const eventData: any = {
    title: this.basicInfoForm!.get('title')?.value,
    description: this.basicInfoForm!.get('description')?.value,
    start_date: this.schedulingForm!.get('startDate')?.value.toISOString(),
    end_date: this.schedulingForm!.get('endDate')?.value.toISOString(),
    address: this.locationForm!.get('address')?.value,
    facultyId: this.basicInfoForm!.get('facultyId')?.value,

  };
  // this.isSubmitting = true;
  // Manejar la imagen
  if (this.imageFile) {
    console.log('Enviando nueva imagen:', this.imageFile.name);
    eventData.image = this.imageFile;
  }
      console.log('Enviando nueva imagen section:', this.imageSection?.name);
  if (this.imageSection) {

    eventData.imageSection = this.imageSection;
  }
  
  // Si estamos en modo edición, actualizar el evento
  if (this.isEditMode && this.eventId) {
    // Eliminar el ":" si está presente en el ID
    const cleanEventId = this.eventId.replace(':', '');
      const formData = new FormData();
  formData.append('title', eventData.title);
  formData.append('description', eventData.description);
  formData.append('start_date', eventData.start_date);
  formData.append('end_date', eventData.end_date);
  formData.append('address', eventData.address);
  formData.append('facultyId', eventData.facultyId);
    this.isSubmitting = true;
  // Manejar la imagen
  if (this.imageFile) {
    console.log('Enviando nueva imagen:', this.imageFile.name);
    formData.append('image_event', this.imageFile);
  }
  if (this.imageSection) {
    console.log('Enviando nueva imagen:', this.imageSection.name);
    formData.append('image_section', this.imageSection);
  }
    this.organizationService.updateEvent(cleanEventId, formData).subscribe({
      next: (response) => {
        this.snackBar.open('Evento actualizado con éxito', 'Cerrar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        
        // Limpiar el formulario antes de navegar
        this.eventFormService.resetAllForms();
        this.isSubmitting = false;
        
        this.router.navigate([`/tenant/${this.tenantName}/events`]);
      },
      error: (error) => {
        console.error('Error al actualizar el evento', error);
        this.snackBar.open('Error al actualizar el evento', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
      }
    });
  } else {
    // Crear nuevo evento
    this.organizationService.createEvent(eventData).subscribe({
      next: (response) => {
        this.snackBar.open('Evento creado con éxito', 'Cerrar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.eventFormService.resetAllForms();
        this.isSubmitting = false;
        this.router.navigate([`/tenant/${this.tenantName}/events`]);
      },
      error: (error) => {
        console.error('Error al crear el evento', error);
        this.snackBar.open('Error al crear el evento', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
      }
    });
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
      image: this.imageFile || null, 
      imageSection:this.imageSection || null// Si no hay imagen, será null
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