import { Component, OnInit, OnDestroy, AfterViewInit, Input, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

import { EventFormService } from '../../../services/event-form.service';
import { LocationPickerComponent } from '../location-picker/location-picker.component';

@Component({
  selector: 'app-event-location',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    LocationPickerComponent
  ],
  templateUrl: './event-location.component.html',
  styleUrls: ['./event-location.component.css']
})
export class EventLocationComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() isEditMode: boolean = false;
  @Input() eventId: string | null = null; // Añadido para identificar el evento en edición
  @ViewChild('locationPicker') locationPicker!: LocationPickerComponent;
  
  locationForm!: FormGroup;
  private subscriptions: Subscription[] = [];
  private updatingForm = false;
  private locationInitialized = false; // Cambiado el nombre para mayor claridad

  constructor(
    private eventFormService: EventFormService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    this.subscriptions.push(
      this.eventFormService.locationForm$.subscribe(form => {
        if (form && !this.updatingForm) {
          this.updatingForm = true;
          this.locationForm = form;
          
          // Si estamos en modo edición, verificar si necesitamos actualizar el mapa
          if (this.isEditMode && !this.locationInitialized) {
            this.checkAndUpdateMapLocation();
          }
          
          this.updatingForm = false;
        }
      }),
      
      this.locationForm.valueChanges.subscribe(() => {
        if (!this.updatingForm) {
          this.updatingForm = true;
          this.eventFormService.setLocationForm(this.locationForm);
          this.eventFormService.notifyFormValidityChange('location', this.locationForm.valid);
          this.updatingForm = false;
        }
      })
    );
  }

  ngAfterViewInit(): void {
    // Dar tiempo para que el mapa se inicialice correctamente
    setTimeout(() => {
      if (this.isEditMode && !this.locationInitialized) {
        this.checkAndUpdateMapLocation();
      }
    }, 1000); // Un poco más de tiempo para asegurar que el mapa esté completamente listo
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isEditMode']) {
      // Reiniciar el estado cuando cambia el modo
      this.locationInitialized = false;
      
      // Si cambiamos a modo edición, intentar actualizar el mapa
      if (this.isEditMode && this.locationForm) {
        setTimeout(() => this.checkAndUpdateMapLocation(), 500);
      }
    }
  }

  // Nuevo método para verificar y actualizar la ubicación en el mapa
  private checkAndUpdateMapLocation(): void {
    if (this.locationInitialized) return;
    
    const latitude = this.locationForm?.get('latitude')?.value;
    const longitude = this.locationForm?.get('longitude')?.value;
    const address = this.locationForm?.get('address')?.value;
    
    console.log('Checking location data:', { latitude, longitude, address });
    
    // Si tenemos las coordenadas y el picker está listo, actualizar el mapa
    if (latitude && longitude && latitude !== 0 && longitude !== 0 && this.locationPicker) {
      console.log('Actualizando mapa con coordenadas:', { latitude, longitude, address });
      this.locationPicker.setLocation(latitude, longitude);
      this.locationInitialized = true;
    } 
    // Si tenemos dirección pero no coordenadas válidas, intentar geocodificar
    else if (address && this.locationPicker && (!latitude || !longitude || latitude === 0 || longitude === 0)) {
      console.log('Intentando geocodificar dirección:', address);
      this.locationPicker.geocodeAndSetLocation(address);
      this.locationInitialized = true;
    }
  }

  initForm(): void {
    this.locationForm = this.fb.group({
      address: ['', Validators.required],
      latitude: [0, [Validators.required]], 
      longitude: [0, [Validators.required]]
    });
    
    this.eventFormService.setLocationForm(this.locationForm);
  }

  onLocationSelected(location: { lat: number, lng: number, address: string }): void {
    if (!this.updatingForm) {
      this.updatingForm = true;
      
      this.locationForm.patchValue({
        address: location.address,
        latitude: location.lat,
        longitude: location.lng
      });
      
      this.eventFormService.setLocationForm(this.locationForm);
      this.eventFormService.notifyFormValidityChange('location', this.locationForm.valid);
      
      this.updatingForm = false;
    }
  }

  useCurrentLocation(): void {
    if (this.locationPicker) {
      this.locationPicker.setCurrentLocation();
    }
  }
}