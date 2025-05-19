// section-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrganizationService } from '../../../services/organization.service';
import { Section } from '../../../interfaces/section';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-section-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatCardModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressBarModule,
    RouterModule,     MatProgressSpinnerModule
  ],
  templateUrl: './section-form.component.html',
  styleUrls: ['./section-form.component.css']
})
export class SectionFormComponent implements OnInit {
  sectionForm!: FormGroup;
  isEditMode: boolean = false;
  sectionId: string = '';
  tenantId: string = '';
  eventId: string = '';
  event: any | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  
  // Colores predefinidos para las secciones
  sectionColors: string[] = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];

  constructor(
    private fb: FormBuilder,
    private sectionService: OrganizationService,
    private eventService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    this.route.params.subscribe(params => {
      this.tenantId = params['tenantId'];
      this.eventId = params['eventId'];
      this.sectionId = params['sectionId'];
      
      this.isEditMode = !!this.sectionId;
      
      this.loadEvent();
      
      if (this.isEditMode) {
        this.loadSection();
      }
    });
  }

  initForm(): void {
    this.sectionForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(0)]],
      capacity: [0, [Validators.required, Validators.min(1)]],
      is_active: [true],
      color: [this.sectionColors[0]]
    });
  }

  loadEvent(): void {
    this.isLoading = true;
    this.eventService.getByIdEvent(this.eventId).subscribe({
      next: (response) => {
        this.event = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el evento', error);
        this.snackBar.open('No se pudo cargar la información del evento', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  loadSection(): void {
    this.isLoading = true;
    this.sectionService.getSectionById(this.sectionId).subscribe({
      next: (response) => {
        const section = response.data;
        this.sectionForm.patchValue({
          name: section.name,
          description: section.description,
          price: section.price,
          capacity: section.capacity,
          is_active: section.is_active,
          color: section.color || this.sectionColors[0]
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar la sección', error);
        this.snackBar.open('No se pudo cargar la información de la sección', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.sectionForm.invalid) {
      this.sectionForm.markAllAsTouched();
      return;
    }
    
    this.isSubmitting = true;
    
    const sectionData: Section = {
      ...this.sectionForm.value,
      tenantId: this.tenantId,
      eventId: this.eventId
    };
    
    if (this.isEditMode) {
      this.sectionService.updateSection(this.sectionId, sectionData).subscribe({
        next: () => {
          this.snackBar.open('Sección actualizada con éxito', 'Cerrar', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate([`/tenant/${this.tenantId}/events/${this.eventId}/sections`]);
        },
        error: (error) => {
          console.error('Error al actualizar la sección', error);
          this.snackBar.open('Error al actualizar la sección', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isSubmitting = false;
        }
      });
    } else {
      this.sectionService.createSection(sectionData).subscribe({
        next: () => {
          this.snackBar.open('Sección creada con éxito', 'Cerrar', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate([`/tenant/${this.tenantId}/events/${this.eventId}/sections`]);
        },
        error: (error) => {
          console.error('Error al crear la sección', error);
          this.snackBar.open('Error al crear la sección', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isSubmitting = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate([`/tenant/${this.tenantId}/events/${this.eventId}/sections`]);
  }

  // Getters para acceder fácilmente a los controles del formulario
  get nameControl() { return this.sectionForm.get('name'); }
  get descriptionControl() { return this.sectionForm.get('description'); }
  get priceControl() { return this.sectionForm.get('price'); }
  get capacityControl() { return this.sectionForm.get('capacity'); }
  get isActiveControl() { return this.sectionForm.get('is_active'); }
  get colorControl() { return this.sectionForm.get('color'); }
}