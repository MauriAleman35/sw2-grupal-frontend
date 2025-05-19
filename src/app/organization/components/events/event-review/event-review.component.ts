// organization/components/event-review/event-review.component.ts
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Faculty } from '../../../interfaces/events';
import { OrganizationService } from '../../../services/organization.service';
import { Subscription } from 'rxjs';
import { GeocodingService } from '../../../services/geocoding.service';

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
export class EventReviewComponent implements OnInit, OnDestroy {
  @Input() basicInfoForm!: FormGroup;
  @Input() schedulingForm!: FormGroup;
  @Input() locationForm!: FormGroup;
  @Input() mediaForm!: FormGroup;
  @Input() imageFile: File | null = null;
  @Input() isEditMode = false;
  @Input()  eventId:string | null = null;
  faculties: Faculty[] = [];
  selectedFaculty: Faculty | null = null;
  imagePreview: string | null = null;
  
  // Fechas y horas combinadas
  startDateTime: Date | null = null;
  endDateTime: Date | null = null;
  
  // Duración calculada
  duration: string = '';
  
  private subscriptions: Subscription[] = [];

  constructor(private facultyService: OrganizationService,private geocodingService:GeocodingService) {}

  ngOnInit(): void {
    // Cargar facultades
  this.loadFaculties();
  
  // Si estamos en modo edición, cargar la ubicación
  if (this.isEditMode && this.eventId) {
    this.loadEventLocation();
  }
  
  // Calcular fechas y duración
  this.updateDateTimeInfo();
  this.calculateDuration();
  
  // Obtener vista previa de imagen
  this.getImagePreview();
  
  // Suscribirse a cambios en los formularios
  this.subscribeToFormChanges();
  }
  // Método para cargar los datos del evento directamente
  loadEventLocation(): void {
  if (!this.eventId || !this.isEditMode) return;
  
  this.facultyService.getByIdEvent(this.eventId).subscribe({
    next: (event) => {
      const address = event.data.address;
      
      // Actualizar el campo de dirección inmediatamente
      this.locationForm.patchValue({
        address: address
      });
      
      // Obtener coordenadas a partir de la dirección
      if (address) {
        this.geocodingService.geocodeAddress(address).subscribe(coords => {
          if (coords) {
            // Actualizar el formulario con las coordenadas obtenidas
            this.locationForm.patchValue({
              latitude: coords.lat,
              longitude: coords.lng
            });
            
            console.log('Coordenadas obtenidas de la dirección:', coords);
            this.updateLocationDisplay();
          } else {
            console.warn('No se pudieron obtener coordenadas para la dirección:', address);
          }
        });
      }
    },
    error: (error) => {
      console.error('Error al cargar la ubicación del evento', error);
    }
  });
}
// Método para actualizar la visualización del mapa
updateLocationDisplay(): void {
  if (!this.locationForm) return;
  
  const latitude = this.locationForm.get('latitude')?.value;
  const longitude = this.locationForm.get('longitude')?.value;
  const address = this.locationForm.get('address')?.value;
  
  if (latitude && longitude) {
    console.log('Ubicación del evento actualizada:', { latitude, longitude, address });
    // El mapa estático se actualizará automáticamente gracias al método getStaticMapUrl()
  } else {
    console.log('No hay coordenadas disponibles para mostrar el mapa');
  }
}
  ngOnDestroy(): void {
    // Limpiar suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  subscribeToFormChanges(): void {
    // Suscribirse a cambios en el formulario de información básica
    if (this.basicInfoForm) {
      const basicInfoSub = this.basicInfoForm.valueChanges.subscribe(() => {
        this.findSelectedFaculty();
      });
      this.subscriptions.push(basicInfoSub);
    }
    
    // Suscribirse a cambios en el formulario de programación
    if (this.schedulingForm) {
      const schedulingSub = this.schedulingForm.valueChanges.subscribe(() => {
        
      });
      this.subscriptions.push(schedulingSub);
    }
    
    // Suscribirse a cambios en el formulario de medios
    if (this.mediaForm) {
      const mediaSub = this.mediaForm.valueChanges.subscribe(() => {
        this.getImagePreview();
      });
      this.subscriptions.push(mediaSub);
    }
    if(this.locationForm){
      const locationSub = this.locationForm.valueChanges.subscribe(() => {
        //Metodo para obtener la ubicacion cuando se edita
         this.loadEventLocation();
      });
      
      this.subscriptions.push(locationSub);
    }
  }
getStaticMapUrl(): string {
  if (!this.locationForm) return '';
  
  const lat = this.locationForm.get('latitude')?.value;
  const lng = this.locationForm.get('longitude')?.value;
  
  if (!lat || !lng) return '';
  
  // URL para un mapa estático de OpenStreetMap
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=600x300&markers=${lat},${lng},red`;
}
  loadFaculties(): void {
    this.facultyService.getAllFaculty().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.faculties = response.data;
          console.log('Facultades cargadas:', this.faculties);
          this.findSelectedFaculty();
        }
      },
      error: (error) => {
        console.error('Error al cargar facultades', error);
      }
    });
  }

  findSelectedFaculty(): void {
    if (!this.basicInfoForm) return;
    
    const facultyId = this.basicInfoForm.get('facultyId')?.value;
    console.log('ID de facultad seleccionada:', facultyId);
    
    if (facultyId && this.faculties && this.faculties.length > 0) {
      this.selectedFaculty = this.faculties.find(f => f.id === facultyId) || null;
      console.log('Facultad seleccionada:', this.selectedFaculty);
    } else {
      this.selectedFaculty = null;
    }
  }

 updateDateTimeInfo(): void {
  if (!this.schedulingForm) return;

  const startDate = this.schedulingForm.get('startDate')?.value;
  const endDate = this.schedulingForm.get('endDate')?.value;
  console.log('Fechas seleccionadas:', startDate, endDate);
  // Verificar que las fechas sean instancias de Date
  if (startDate instanceof Date && endDate instanceof Date) {
    this.startDateTime = startDate;
    this.endDateTime = endDate;
  } else {
    console.warn('Fechas no válidas');
    this.startDateTime = null;
    this.endDateTime = null;
  }
}

  calculateDuration(): void {
    if (!this.startDateTime || !this.endDateTime) {
      this.duration = 'No calculada';
      return;
    }
    
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
    console.log('Duración calculada:', this.duration);
  }

  getImagePreview(): void {
    // Si hay un archivo de imagen, crear una URL para la vista previa
    if (this.imageFile) {
      console.log('Usando archivo de imagen para vista previa:', this.imageFile.name);
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.imageFile);
    } else {
      // Si no hay archivo pero hay una URL en el formulario, usar esa
      const imageUrl = this.mediaForm?.get('imageUrl')?.value;
      if (imageUrl) {
        console.log('Usando URL de imagen para vista previa:', imageUrl);
        this.imagePreview = imageUrl;
      } else {
        console.log('No hay imagen para mostrar');
        this.imagePreview = null;
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
    return this.faculties.findIndex(f => f.id === this.selectedFaculty?.id);
  }
  
  // Métodos de ayuda para acceder a los valores del formulario de manera segura
  getTitle(): string {
    return this.basicInfoForm?.get('title')?.value || 'Título del Evento';
  }
  
  getDescription(): string {
    return this.basicInfoForm?.get('description')?.value || 'Descripción del evento';
  }
  
  getAddress(): string {
    return this.locationForm?.get('address')?.value || 'Ubicación del evento';
  }
  
  getFacultyName(): string {
    return this.selectedFaculty?.name || 'No especificado';
  }
}