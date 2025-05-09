// organization/components/event-media/event-media.component.ts
import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EventFormService } from '../../../services/event-form.service';



@Component({
  selector: 'app-event-media',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  templateUrl: './event-media.component.html',
  styleUrls: ['./event-media.component.css']
})
export class EventMediaComponent implements OnInit {
  @Input() isEditMode = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  mediaForm!: FormGroup;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  isDragging = false;
  uploadProgress = 0;
  isUploading = false;
  
  // Mensajes de error
  errorMessage: string | null = null;
  
  // Límites de archivo
  maxFileSize = 5 * 1024 * 1024; // 5MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  constructor(private eventFormService: EventFormService) {}

  ngOnInit(): void {
    // Obtener el formulario del servicio
    this.eventFormService.mediaForm$.subscribe(form => {
      this.mediaForm = form;
      
      // Si hay una URL de imagen en el formulario, mostrarla
      const imageUrl = this.mediaForm.get('imageUrl')?.value;
      if (imageUrl) {
        this.imagePreview = imageUrl;
      }
    });
    
    // Suscribirse a cambios en el archivo de imagen
    this.eventFormService.imageFile$.subscribe(file => {
      this.imageFile = file;
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  processFile(file: File ): void |null  {
    // Validar tipo de archivo
    if (!this.allowedTypes.includes(file.type)) {
      this.errorMessage = 'Tipo de archivo no permitido. Por favor, sube una imagen (JPEG, PNG, GIF, WEBP).';
      return;
    }
    
    // Validar tamaño de archivo
    if (file.size > this.maxFileSize) {
      this.errorMessage = 'El archivo es demasiado grande. El tamaño máximo permitido es 5MB.';
      return;
    }
    
    // Limpiar errores previos
    this.errorMessage = null;
    
    // Simular carga
    this.isUploading = true;
    this.uploadProgress = 0;
    
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.isUploading = false;
        
        // Crear vista previa
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result as string;
          
          // Actualizar el formulario
          this.mediaForm.patchValue({
            hasImage: true
          });
          
          // Guardar el archivo en el servicio
          this.eventFormService.setImageFile(file);
        };
        reader.readAsDataURL(file);
      }
    }, 100);
  }

  removeImage(): void {
    this.imagePreview = null;
    this.imageFile = null;
    this.errorMessage = null;
    
    // Actualizar el formulario
    this.mediaForm.patchValue({
      imageUrl: '',
      hasImage: false
    });
    
    // Actualizar el servicio
    this.eventFormService.setImageFile(null);
    
    // Limpiar el input de archivo
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  triggerFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }
}