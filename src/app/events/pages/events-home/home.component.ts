import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CarouselComponent } from '../../components/carrousel/carousel.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { EventCardComponent } from '../../components/event-card/event-card.component';


interface Event {
  id: number;
  title: string;
  date: Date;
  location: string;
  faculty: string;
  imageUrl: string;
  price: string;
  description: string;
  featured?: boolean;
}

interface Faculty {
  id: number;
  name: string;
}

interface SearchFilters {
  searchTerm: string;
  facultyId: number | null;
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
  events: Event[] = [];
  featuredEvents: Event[] = [];
  filteredEvents: Event[] = [];
  faculties: Faculty[] = [];

  constructor() { }

  ngOnInit(): void {
    // Datos de ejemplo
    this.faculties = [
      { id: 1, name: 'Ingeniería' },
      { id: 2, name: 'Ciencias Económicas' },
      { id: 3, name: 'Medicina' },
      { id: 4, name: 'Derecho' },
      { id: 5, name: 'Humanidades' }
    ];

    this.events = [
      {
        id: 1,
        title: 'Conferencia de Innovación Tecnológica',
        date: new Date('2025-05-15T18:00:00'),
        location: 'Auditorio Central',
        faculty: 'Ingeniería',
        imageUrl: 'https://picsum.photos/800/500?random=1',
        price: 'Bs. 50',
        description: 'Conferencia sobre las últimas tendencias en innovación tecnológica con expertos internacionales.',
        featured: true
      },
      {
        id: 2,
        title: 'Feria de Emprendimientos',
        date: new Date('2025-05-20T10:00:00'),
        location: 'Plaza Principal',
        faculty: 'Ciencias Económicas',
        imageUrl: 'https://picsum.photos/800/500?random=2',
        price: 'Entrada Libre',
        description: 'Exposición de proyectos de emprendimiento de estudiantes universitarios.',
        featured: true
      },
      {
        id: 3,
        title: 'Seminario de Derecho Constitucional',
        date: new Date('2025-05-25T14:00:00'),
        location: 'Sala de Conferencias',
        faculty: 'Derecho',
        imageUrl: 'https://picsum.photos/800/500?random=3',
        price: 'Bs. 30',
        description: 'Análisis de casos prácticos de derecho constitucional con profesionales destacados.',
        featured: true
      },
      {
        id: 4,
        title: 'Jornada de Salud Preventiva',
        date: new Date('2025-06-05T09:00:00'),
        location: 'Campus Universitario',
        faculty: 'Medicina',
        imageUrl: 'https://picsum.photos/800/500?random=4',
        price: 'Gratuito',
        description: 'Jornada de atención médica preventiva abierta a toda la comunidad universitaria.',
      },
      {
        id: 5,
        title: 'Festival Cultural Universitario',
        date: new Date('2025-06-10T16:00:00'),
        location: 'Teatro Municipal',
        faculty: 'Humanidades',
        imageUrl: 'https://picsum.photos/800/500?random=5',
        price: 'Bs. 20',
        description: 'Presentaciones artísticas y culturales de los diferentes departamentos de la facultad.',
      },
      {
        id: 6,
        title: 'Hackathon Universitario',
        date: new Date('2025-06-15T08:00:00'),
        location: 'Laboratorio de Computación',
        faculty: 'Ingeniería',
        imageUrl: 'https://picsum.photos/800/500?random=6',
        price: 'Bs. 25',
        description: 'Competencia de programación para desarrollar soluciones innovadoras a problemas reales.',
      }
    ];

    // Filtrar eventos destacados para el carrusel
    this.featuredEvents = this.events.filter(event => event.featured);
    this.filteredEvents = [...this.events];
  }

  handleSearch(filters: SearchFilters): void {
    this.filteredEvents = this.events.filter(event => {
      // Filtro por término de búsqueda
      const matchesSearch = filters.searchTerm ? 
        event.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) : 
        true;
      
      // Filtro por facultad
      const matchesFaculty = filters.facultyId ? 
        event.faculty === this.faculties.find(f => f.id === filters.facultyId)?.name : 
        true;
      
      // Filtro por fecha
      const matchesDate = filters.date ? 
        event.date.toDateString() === filters.date.toDateString() : 
        true;
      
      return matchesSearch && matchesFaculty && matchesDate;
    });
  }

  resetFilters(): void {
    this.filteredEvents = [...this.events];
  }

  viewEventDetails(eventId: number): void {
    // Aquí iría la navegación a la página de detalles del evento
    console.log(`Navegando a detalles del evento ${eventId}`);
    // this.router.navigate(['/events', eventId]);
  }
}