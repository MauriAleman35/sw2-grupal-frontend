// organization/components/event-review/event-review.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Faculty } from '../../../interfaces/events';
import { OrganizationService } from '../../../services/organization.service';


@Component({
  selector: 'app-event-review',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './event-review.component.html',
  styleUrls: ['./event-review.component.css']
})
export class EventReviewComponent implements OnInit {
  @Input() basicInfoForm!: FormGroup;
  @Input() schedulingForm!: FormGroup;
  @Input() locationForm!: FormGroup;
  @Input() mediaForm!: FormGroup;
  @Input() imageFile: File | null = null;
  @Input() isEditMode = false;
  
  faculties: Faculty[] = [];
  selectedFaculty: Faculty | null = null;
  imagePreview: string | null = null;
  
  // Fechas y horas combinadas
  startDateTime: Date | null = null;
  endDateTime: Date | null = null;
  
  // Duración calculada
  duration: string = '';

  constructor(private facultyService: OrganizationService) {}

  ngOnInit(): void {
    // Cargar facultades
    this.loadFaculties();
    
    // Calcular fechas y duración
    this.calculateDateTime();
    
    // Obtener vista previa de imagen
    this.getImagePreview();
  }

  loadFaculties(): void {
    this.facultyService.getAllFaculty().subscribe({
      next: (response) => {
        this.faculties = response.data;
        this.findSelectedFaculty();
      },
      error: (error) => {
        console.error('Error al cargar facultades', error);
      }
    });
  }

  findSelectedFaculty(): void {
    const facultyId = this.basicInfoForm.get('facultyId')?.value;
    if (facultyId && this.faculties.length > 0) {
      this.selectedFaculty = this.faculties.find(f => f.id === facultyId) || null;
    }
  }

  calculateDateTime(): void {
    const startDate = this.schedulingForm.get('start_date')?.value;
    const startTime = this.schedulingForm.get('start_time')?.value;
    const endDate = this.schedulingForm.get('end_date')?.value;
    const endTime = this.schedulingForm.get('end_time')?.value;
    
    if (startDate && startTime && endDate && endTime) {
      this.startDateTime = this.combineDateTime(startDate, startTime);
      this.endDateTime = this.combineDateTime(endDate, endTime);
      
      if (this.startDateTime && this.endDateTime) {
        this.calculateDuration();
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

  calculateDuration(): void {
    if (!this.startDateTime || !this.endDateTime) return;
    
    const durationMs = this.endDateTime.getTime() - this.startDateTime.getTime();
    
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

  getImagePreview(): void {
    // Si hay un archivo de imagen, crear una URL para la vista previa
    if (this.imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.imageFile);
    } else {
      // Si no hay archivo pero hay una URL en el formulario, usar esa
      const imageUrl = this.mediaForm.get('imageUrl')?.value;
      if (imageUrl) {
        this.imagePreview = imageUrl;
      }
    }
  }

  // Método para obtener el color de la facultad
  getFacultyColor(index: number): string {
    const colors = [
      '#4caf50', // Verde
      '#2196f3', // Azul
      '#f44336', // Rojo
      '#ff9800', // Naranja
      '#9c27b0', // Púrpura
      '#00bcd4', // Cian
      '#795548', // Marrón
      '#607d8b'  // Gris azulado
    ];
    
    return colors[index % colors.length];
  }

  getFacultyIndex(): number {
    if (!this.selectedFaculty || !this.faculties.length) return 0;
    return this.faculties.findIndex(f => f.id === this.selectedFaculty?.id) 
  }
}