// organization/components/events/event-media/event-media.component.ts
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';

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
    MatButtonModule
  ],
  templateUrl: './event-media.component.html',
  styleUrls: ['./event-media.component.css']
})
export class EventMediaComponent implements OnInit, OnDestroy {
  @Input() isEditMode = false;
  
  mediaForm!: FormGroup;
  
  imagePreviewUrl: string = '';
  selectedFile: File | null = null;
  
  private subscriptions: Subscription[] = [];

  constructor(private eventFormService: EventFormService) {}

  ngOnInit(): void {
    // Suscribirse al formulario
    const formSub = this.eventFormService.mediaForm$.subscribe(form => {
      if (form) {
        this.mediaForm = form;
        
        // Obtener la URL de la imagen para previsualización
        const imageUrl = form.get('imageUrl')?.value;
        if (imageUrl && imageUrl !== '') {
          this.imagePreviewUrl = imageUrl;
          console.log('Imagen cargada en MediaComponent:', this.imagePreviewUrl);
        }
      }
    });
    
    this.subscriptions.push(formSub);
    
    // Suscribirse al archivo de imagen
    const fileSub = this.eventFormService.imageFile$.subscribe(file => {
      if (file) {
        this.selectedFile = file;
        // Crear una URL para previsualizar la imagen
        this.imagePreviewUrl = URL.createObjectURL(file);
      }
    });
    
    this.subscriptions.push(fileSub);
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;
      
      // Actualizar el servicio con el archivo seleccionado
      this.eventFormService.setImageFile(file);
      
      // Crear una URL para previsualizar la imagen
      this.imagePreviewUrl = URL.createObjectURL(file);
      
      // Actualizar el formulario con la URL de la imagen
      if (this.mediaForm) {
        this.mediaForm.patchValue({
          imageUrl: this.imagePreviewUrl
        });
      }
    }
  }
  
  removeImage(): void {
    this.selectedFile = null;
    this.imagePreviewUrl = '';
    
    // Actualizar el servicio
    this.eventFormService.setImageFile(null);
    
    // Actualizar el formulario
    if (this.mediaForm) {
      this.mediaForm.patchValue({
        imageUrl: ''
      });
    }
  }
}