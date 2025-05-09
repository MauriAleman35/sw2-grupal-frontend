// organization/components/event-scheduling/event-scheduling.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
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
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './event-scheduling.component.html',
  styleUrls: ['./event-scheduling.component.css']
})

//COMPARAR COMO ESCUCHA LOS EVENTOS DE BASIC CON ESTE
export class EventSchedulingComponent implements OnInit {
  @Input() isEditMode = false;
  
  schedulingForm!: FormGroup;
  
  // Para cálculo de duración
  duration: string = '';
  
  // Fechas mínimas y máximas
  minDate = new Date();
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 2)); // 2 años en el futuro

  constructor(private eventFormService: EventFormService) {}

  ngOnInit(): void {
    // Obtener el formulario del servicio
    this.eventFormService.schedulingForm$.subscribe(form => {
      this.schedulingForm = form;
      
      // Calcular duración cuando cambian los valores
      this.schedulingForm.valueChanges.subscribe(() => {
        this.calculateDuration();
      });
      
      // Calcular duración inicial
      this.calculateDuration();
    });
  }

  calculateDuration(): void {
    const startDate = this.schedulingForm.get('start_date')?.value;
    const startTime = this.schedulingForm.get('start_time')?.value;
    const endDate = this.schedulingForm.get('end_date')?.value;
    const endTime = this.schedulingForm.get('end_time')?.value;
    
    if (startDate && startTime && endDate && endTime) {
      const start = this.combineDateTime(startDate, startTime);
      const end = this.combineDateTime(endDate, endTime);
      
      if (start && end) {
        const durationMs = end.getTime() - start.getTime();
        
        if (durationMs < 0) {
          this.duration = 'Fecha de fin debe ser posterior a fecha de inicio';
          return;
        }
        
        const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
        const durationHours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        
        let durationText = '';
        
        if (durationDays > 0) {
          durationText += `${durationDays} día${durationDays !== 1 ? 's' : ''} `;
        }
        
        if (durationHours > 0 || durationDays > 0) {
          durationText += `${durationHours} hora${durationHours !== 1 ? 's' : ''} `;
        }
        
        durationText += `${durationMinutes} minuto${durationMinutes !== 1 ? 's' : ''}`;
        
        this.duration = durationText;
      }
    }
  }

  private combineDateTime(date: Date, timeStr: string): Date | null {
    if (!date || !timeStr) return null;
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    
    return result;
  }

  // Métodos para establecer fechas rápidas
  setToday(): void {
    const today = new Date();
    this.schedulingForm.patchValue({
      start_date: today,
      end_date: today
    });
  }

  setTomorrow(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.schedulingForm.patchValue({
      start_date: tomorrow,
      end_date: tomorrow
    });
  }

  setWeekend(): void {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo, 6 = Sábado
    
    // Calcular días hasta el próximo sábado
    const daysUntilSaturday = dayOfWeek === 6 ? 7 : 6 - dayOfWeek;
    
    const nextSaturday = new Date();
    nextSaturday.setDate(today.getDate() + daysUntilSaturday);
    
    const nextSunday = new Date(nextSaturday);
    nextSunday.setDate(nextSaturday.getDate() + 1);
    
    this.schedulingForm.patchValue({
      start_date: nextSaturday,
      end_date: nextSunday
    });
  }

  // Validar que la fecha de fin sea posterior a la de inicio
  validateEndDate(): void {
    const startDate = this.schedulingForm.get('start_date')?.value;
    const endDate = this.schedulingForm.get('end_date')?.value;
    
    if (startDate && endDate && startDate > endDate) {
      this.schedulingForm.patchValue({
        end_date: startDate
      });
    }
  }
}