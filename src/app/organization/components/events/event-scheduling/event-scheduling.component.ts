import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { EventFormService } from '../../../services/event-form.service';

@Component({
  selector: 'app-event-scheduling',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    NgxMatTimepickerModule
  ],
  templateUrl: './event-scheduling.component.html',
  styleUrls: ['./event-scheduling.component.css']
})
export class EventSchedulingComponent implements OnInit, OnDestroy {
  @Input() isEditMode = false;
  
  schedulingForm!: FormGroup;
  
  // Para validación de fechas
  minDate = new Date();
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 2)); // 2 años en el futuro
  
  // Flag para evitar actualizaciones recursivas
  private updatingForm = false;
  
  // Suscripciones para limpiar al destruir el componente
  private subscriptions: Subscription[] = [];
  private formSubscription: Subscription | null = null;
  constructor(
    private eventFormService: EventFormService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

    ngOnInit(): void {
    // Crear el formulario localmente si está en modo creación
    this.initForm();

    // Suscribirse a los cambios del formulario del servicio
    this.formSubscription = this.eventFormService.schedulingForm$.subscribe(form => {
      if (form) {
        this.schedulingForm = form;
        console.log('Formulario de programación recibido, anasheee:', this.schedulingForm.value);
      }
    });
  }
  
  ngOnDestroy(): void {
    // Limpiar todas las suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
    initForm(): void {
    // Crear un formulario con valores predeterminados
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    this.schedulingForm = this.fb.group({
      startDate: [now, Validators.required],
      endDate: [twoHoursLater, Validators.required],
      startTime: [this.formatTime(now), Validators.required],
      endTime: [this.formatTime(twoHoursLater), Validators.required],
      status: ['upcoming', Validators.required]
    });

    // Notificar al servicio sobre el nuevo formulario
    this.eventFormService.setSchedulingForm(this.schedulingForm);
  }

  initFormWithEventData(event: any): void {
    console.log('Evento recibido para inicializar formularios:', event);

    // Crear formulario de programación
    const startDate = event.start_date ? new Date(event.start_date) : new Date();
    const endDate = event.end_date ? new Date(event.end_date) : new Date();
    
    const startTime = this.formatTime(startDate);
    const endTime = this.formatTime(endDate);

    // Asignamos las fechas y horas al formulario
    const schedulingForm = this.fb.group({
      startDate: [startDate, Validators.required],
      endDate: [endDate, Validators.required],
      startTime: [startTime, Validators.required],
      endTime: [endTime, Validators.required],
      status: [event.status || 'upcoming', Validators.required]
    });

    // Establecer el formulario en el servicio
    this.eventFormService.setSchedulingForm(schedulingForm);

    // Ahora que el formulario se ha establecido, no es necesario actualizarlo de nuevo
    this.extractTimesFromDates();
  }

  // Método para formatear la hora de un objeto Date a string HH:MM
  formatTime(date: Date): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.warn('Fecha inválida en formatTime:', date);
      return '00:00';
    }
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  extractTimesFromDates(): void {
    try {
      const startDate = this.schedulingForm.get('startDate')?.value;
      const endDate = this.schedulingForm.get('endDate')?.value;
      
      if (startDate instanceof Date && !isNaN(startDate.getTime())) {
        const startTime = this.formatTime(startDate);
        this.schedulingForm.get('startTime')?.setValue(startTime, { emitEvent: false });
      }
      
      if (endDate instanceof Date && !isNaN(endDate.getTime())) {
        const endTime = this.formatTime(endDate);
        this.schedulingForm.get('endTime')?.setValue(endTime, { emitEvent: false });
      }
    } catch (error) {
      console.error('Error al extraer horas de las fechas:', error);
    }
  }

  // Método para actualizar la fecha con la hora seleccionada
  updateDateWithTime(dateType: 'start' | 'end', timeValue?: string): void {
    try {
      if (this.updatingForm) return;

      this.updatingForm = true;

      const timeField = dateType === 'start' ? 'startTime' : 'endTime';
      const dateField = dateType === 'start' ? 'startDate' : 'endDate';

      // Si se proporciona un valor de tiempo, actualizar el campo de tiempo
      if (timeValue) {
        this.schedulingForm.get(timeField)?.setValue(timeValue, { emitEvent: false });
      }

      // Obtener los valores actuales
      const currentTimeValue = this.schedulingForm.get(timeField)?.value;
      const dateValue = this.schedulingForm.get(dateField)?.value;

      if (currentTimeValue && dateValue instanceof Date && !isNaN(dateValue.getTime())) {
        // Parsear la hora y los minutos
        let hours = 0;
        let minutes = 0;

        if (typeof currentTimeValue === 'string' && currentTimeValue.includes(':')) {
          const timeParts = currentTimeValue.split(':');
          hours = parseInt(timeParts[0], 10);
          minutes = parseInt(timeParts[1], 10);

          // Verificar que los valores sean números válidos
          if (isNaN(hours) || isNaN(minutes)) {
            console.error('Valores de hora inválidos:', currentTimeValue);
            hours = 0;
            minutes = 0;
          }
        } else {
          console.warn('Formato de hora inválido:', currentTimeValue);
        }

        // Crear una nueva fecha con la hora seleccionada
        const newDate = new Date(dateValue);
        newDate.setHours(hours, minutes, 0, 0);

        // Verificar que la nueva fecha sea válida
        if (!isNaN(newDate.getTime())) {
          this.schedulingForm.get(dateField)?.setValue(newDate, { emitEvent: false });
          console.log(`Fecha ${dateType} actualizada:`, newDate.toISOString());
        } else {
          console.error('Fecha inválida después de actualizar la hora:', newDate);
        }
      } else {
        console.warn('Valores inválidos para actualizar la fecha con hora:', {
          timeValue: currentTimeValue,
          dateValue: dateValue
        });
      }

      // Forzar la detección de cambios
      this.cdr.detectChanges();

      // Notificar al servicio sobre los cambios
      this.eventFormService.setSchedulingForm(this.schedulingForm);

      // Validar las fechas
      const isValid = this.validateDates();
      this.eventFormService.notifyFormValidityChange('scheduling', this.schedulingForm.valid && isValid);
    } catch (error) {
      console.error(`Error al actualizar fecha con hora (${dateType}):`, error);
    } finally {
      this.updatingForm = false;
    }
  }

  // Manejadores para los cambios de fecha
  onStartDateChange(): void {
    if (!this.updatingForm) {
      this.updateDateWithTime('start');
    }
  }

  onEndDateChange(): void {
    if (!this.updatingForm) {
      this.updateDateWithTime('end');
    }
  }

  // Manejadores para los cambios de hora
  onStartTimeChange(event: any): void {
    console.log('Hora de inicio cambiada:', event);
    if (!this.updatingForm) {
      // Si el evento es un objeto con una propiedad 'value', usar esa propiedad
      const timeValue = typeof event === 'object' && event !== null && 'value' in event 
        ? event.value 
        : event;
    
      this.updateDateWithTime('start', timeValue);
    }
  }

  onEndTimeChange(event: any): void {
    console.log('Hora de fin cambiada:', event);
    if (!this.updatingForm) {
      // Si el evento es un objeto con una propiedad 'value', usar esa propiedad
      const timeValue = typeof event === 'object' && event !== null && 'value' in event 
        ? event.value 
        : event;
    
      this.updateDateWithTime('end', timeValue);
    }
  }

  // Validación para asegurar que la fecha de fin sea posterior a la de inicio
  validateDates(): boolean {
    try {
      const startDate = this.schedulingForm.get('startDate')?.value;
      const endDate = this.schedulingForm.get('endDate')?.value;
      
      if (startDate instanceof Date && endDate instanceof Date && 
          !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        return endDate > startDate;
      }
      
      return true;
    } catch (error) {
      console.error('Error al validar fechas:', error);
      return false;
    }
  }

  // Método para obtener la duración en horas entre las fechas de inicio y fin
  getDuration(): number {
    try {
      const startDate = this.schedulingForm.get('startDate')?.value;
      const endDate = this.schedulingForm.get('endDate')?.value;
      
      if (startDate instanceof Date && endDate instanceof Date && 
          !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        // Calcular la duración en horas
        const durationMs = endDate.getTime() - startDate.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        return parseFloat(durationHours.toFixed(1));
      }
      
      return 0;
    } catch (error) {
      console.error('Error al calcular la duración:', error);
      return 0;
    }
  }

  // Método para formatear la duración para mostrarla al usuario
  formatDuration(): string {
    try {
      const duration = this.getDuration();
      
      if (duration <= 0) {
        return 'Duración inválida';
      }
      
      const hours = Math.floor(duration);
      const minutes = Math.round((duration - hours) * 60);
      
      if (hours === 0) {
        return `${minutes} minutos`;
      } else if (minutes === 0) {
        return hours === 1 ? '1 hora' : `${hours} horas`;
      } else {
        return `${hours} h ${minutes} min`;
      }
    } catch (error) {
      console.error('Error al formatear la duración:', error);
      return 'Error al calcular duración';
    }
  }
}
