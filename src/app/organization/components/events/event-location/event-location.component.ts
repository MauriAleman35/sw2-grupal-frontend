// organization/components/event-location/event-location.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { EventFormService } from '../../../services/event-form.service';



@Component({
  selector: 'app-event-location',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatAutocompleteModule
  ],
  templateUrl: './event-location.component.html',
  styleUrls: ['./event-location.component.css']
})
export class EventLocationComponent implements OnInit {
  @Input() isEditMode = false;
  
  locationForm!: FormGroup;
  
  // Ubicaciones sugeridas (ejemplo)
  suggestedLocations: string[] = [
    'Auditorio Principal',
    'Sala de Conferencias A',
    'Sala de Conferencias B',
    'Laboratorio de Informática',
    'Aula Magna',
    'Biblioteca Central',
    'Patio Central',
    'Gimnasio Universitario'
  ];
  
  filteredLocations: string[] = [];

  constructor(private eventFormService: EventFormService) {}

  ngOnInit(): void {
    // Obtener el formulario del servicio
    this.eventFormService.locationForm$.subscribe(form => {
      this.locationForm = form;
      
      // Configurar filtrado de ubicaciones
      this.locationForm.get('address')?.valueChanges.subscribe(value => {
        this.filterLocations(value);
      });
      
      // Inicializar ubicaciones filtradas
      this.filteredLocations = [...this.suggestedLocations];
    });
  }

  filterLocations(value: string): void {
    const filterValue = value.toLowerCase();
    this.filteredLocations = this.suggestedLocations.filter(location => 
      location.toLowerCase().includes(filterValue)
    );
  }

  selectLocation(event: MatAutocompleteSelectedEvent): void {
    this.locationForm.patchValue({
      address: event.option.value
    });
  }

  // Método para usar la ubicación actual (simulado)
  useCurrentLocation(): void {
    // En una implementación real, usaríamos la API de geolocalización
    this.locationForm.patchValue({
      address: 'Campus Universitario, Edificio Principal'
    });
  }
}