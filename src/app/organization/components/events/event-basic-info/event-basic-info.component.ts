// organization/components/event-basic-info/event-basic-info.component.ts
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { Faculty } from '../../../interfaces/events';
import { EventFormService } from '../../../services/event-form.service';
import { OrganizationService } from '../../../services/organization.service';




@Component({
  selector: 'app-event-basic-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './event-basic-info.component.html',
  styleUrls: ['./event-basic-info.component.css']
})
export class EventBasicInfoComponent implements OnInit, OnDestroy {
  @Input() isEditMode = false;
  

  faculties: Faculty[] = [];
  isLoading = false;
  basicInfoForm: FormGroup;
  // Para contador de caracteres
  titleMaxLength = 100;
  descriptionMaxLength = 500;
  
  // Suscripción para limpiar al destruir el componente
  private formSubscription: Subscription | null = null;

    constructor(
    private eventFormService: EventFormService,
    private facultyService: OrganizationService,
    private fb: FormBuilder // Asegúrate de inyectar FormBuilder aquí
  ) {
    // Inicializamos basicInfoForm con un FormGroup vacío en el constructor
    this.basicInfoForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      facultyId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Obtener el formulario del servicio
    this.eventFormService.basicInfoForm$.subscribe(form => {
      if (form) {
        // Solo actualiza si form no es null
        this.basicInfoForm = form;
      // Verifica el estado del formulario al recibirlo
      console.log('Formulario básico recibido:', this.basicInfoForm.value);
        // Limpiar suscripción anterior si existe
        if (this.formSubscription) {
          this.formSubscription.unsubscribe();
        }

        // Suscribirse a cambios en el formulario para actualizar el servicio
        this.formSubscription = this.basicInfoForm.valueChanges.subscribe(() => {
          // Actualizar el formulario en el servicio cada vez que cambie
          this.eventFormService.setBasicInfoForm(this.basicInfoForm);
          
          // Forzar la detección de cambios
          this.eventFormService.notifyFormValidityChange('basicInfo', this.basicInfoForm.valid);
        });
      }
    });
    
    // Cargar las facultades
    this.loadFaculties();
  }
  
  ngOnDestroy(): void {
    // Limpiar suscripciones al destruir el componente
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  loadFaculties(): void {
    this.isLoading = true;
    this.facultyService.getAllFaculty().subscribe({
      next: (response) => {
        this.faculties = response.data;
        this.faculties = this.faculties.filter(faculty => faculty.is_active=== true);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar facultades', error);
        this.isLoading = false;
      }
    });
  }

  // Métodos para contador de caracteres
  getTitleRemainingChars(): number {
    const currentLength = this.basicInfoForm.get('title')?.value?.length || 0;
    return this.titleMaxLength - currentLength;
  }

  getDescriptionRemainingChars(): number {
    const currentLength = this.basicInfoForm.get('description')?.value?.length || 0;
    return this.descriptionMaxLength - currentLength;
  }

  // Método para obtener el color de la facultad (para mostrar un indicador visual)
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
}