import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CarouselComponent } from '../../components/carrousel/carousel.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { DatumEventsAll, Faculty } from '../../interfaces/events';
import { EventsService } from '../../services/events.service';

interface SearchFilters {
  searchTerm: string;
  facultyId: string;
  date: Date | null;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    CarouselComponent,
    SearchBarComponent,
    EventCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  events: DatumEventsAll[] = [];
  featuredEvents: DatumEventsAll[] = [];
  filteredEvents: DatumEventsAll[] = [];
  faculties: Faculty[] = [];
  
  // Params
  page: number = 1;
  limit: number = 10;

  constructor(private router: Router, private eventsService: EventsService) { }

  ngOnInit(): void {
    this.loadEventsAll();
    this.loadFaculties();
  }

  loadFaculties(): void {
    this.eventsService.getAllEvents(this.page, this.limit).subscribe({
      next: (res) => {
        // Extraer facultades únicas por ID para evitar duplicados
        const uniqueFaculties = new Map<string, Faculty>();
        res.data.forEach(event => {
          uniqueFaculties.set(event.faculty.id, event.faculty);
        });
        
        // Convertir el Map a un array
        this.faculties = Array.from(uniqueFaculties.values());
        console.log('Facultades cargadas:', this.faculties);
      }
    });
  }

  loadEventsAll(): void {
    this.eventsService.getAllEvents(this.page, this.limit).subscribe({
      next: (res) => {
        // Obtenemos la fecha actual
        const currentDate = new Date();
        
        // Filtramos para mostrar solo eventos futuros
        this.events = res.data.filter(event => {
          const eventDate = new Date(event.start_date);
          return eventDate >= currentDate && event.is_active;
        });
        
        this.featuredEvents = this.events.filter(event => event.is_active==true);
        this.filteredEvents = [...this.events];
        
        console.log('Eventos cargados (solo futuros):', this.events.length);
      },
      error: (err) => {
        console.error('Error al cargar los eventos:', err);
      }
    });
  }

  handleSearch(filters: SearchFilters): void {
    console.log('Filtros recibidos:', filters);
    
    this.filteredEvents = this.events.filter(event => {
      // Filtro por término de búsqueda
      const matchesSearch = !filters.searchTerm || 
        event.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
   
      // Filtro por facultad
      const matchesFaculty = !filters.facultyId || event.faculty.id === filters.facultyId;
       
      // Filtro por fecha específica (si se seleccionó)
      let matchesDate = true;
      if (filters.date) {
        const eventDate = new Date(event.start_date);
        const filterDate = new Date(filters.date);
        matchesDate = (
          eventDate.getDate() === filterDate.getDate() &&
          eventDate.getMonth() === filterDate.getMonth() &&
          eventDate.getFullYear() === filterDate.getFullYear()
        );
      }
      
      return matchesSearch && matchesFaculty && matchesDate;
    });

    console.log('Eventos filtrados:', this.filteredEvents);
  }

  resetFilters(): void {
    this.filteredEvents = [...this.events];
  }

  viewEventDetails(eventParam: string): void {
    console.log('Navigating to event:', eventParam);
    const event = this.events.find(e => e.id === eventParam);
    if (event) {
      const eventSlug = this.generateSlug(event.title);
      this.router.navigate(['/events', eventSlug]);
    }
  }
  
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }
  
  /**
   * Verifica si un evento ya pasó
   */
  isEventInPast(eventDate: string): boolean {
    const today = new Date();
    const event = new Date(eventDate);
    return event < today;
  }
}