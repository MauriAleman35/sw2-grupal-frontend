import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Event {
  id: number;
  title: string;
  slug: string; // Añadimos slug para las URLs amigables
  date: Date;
  location: string;
  faculty: string;
  imageUrl: string;
  price: string;
  description: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: string;
  ageRestriction?: string;
  venueName?: string;
  venueAddress?: string;
  venueCity?: string;
  venueCountry?: string;
  sku?: string;
  dates?: {
    date: string;
    times: string[];
  }[];
}

@Component({
  selector: 'app-events-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatSnackBarModule
  ],
  templateUrl: './events-detail.component.html',
  styleUrls: ['./events-detail.component.css']
})
export class EventsDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('continueSection') continueSection!: ElementRef;
  
  event: Event | null = null;
  loading = true;
  error = false;
  selectedDate: string = '';
  selectedTime: string = '';
  availableTimes: string[] = [];
  
  // Datos de ejemplo para simular la carga de un evento
  mockEvents: Event[] = [
    {
      id: 1,
      title: 'Conferencia de Innovación Tecnológica',
      slug: 'conferencia-innovacion-tecnologica',
      date: new Date('2025-05-15T18:00:00'),
      location: 'Auditorio Central',
      faculty: 'Ingeniería',
      imageUrl: 'https://picsum.photos/800/500?random=1',
      price: 'Bs. 50',
      description: 'Conferencia sobre las últimas tendencias en innovación tecnológica con expertos internacionales.',
      minPrice: 50,
      maxPrice: 50,
      duration: '3 horas con 30 minutos',
      ageRestriction: 'Mayores de 16 años',
      venueName: 'Auditorio Central',
      venueAddress: 'Campus Universitario',
      venueCity: 'La Paz',
      venueCountry: 'Bolivia',
      sku: 'CONF-TECH-001',
      dates: [
        {
          date: '2025-05-15',
          times: ['18:00:00']
        }
      ]
    },
    {
      id: 2,
      title: 'Feria de Emprendimientos',
      slug: 'feria-emprendimientos',
      date: new Date('2025-05-20T10:00:00'),
      location: 'Plaza Principal',
      faculty: 'Ciencias Económicas',
      imageUrl: 'https://picsum.photos/800/500?random=2',
      price: 'Entrada Libre',
      description: 'Exposición de proyectos de emprendimiento de estudiantes universitarios.',
      minPrice: 0,
      maxPrice: 0,
      duration: '8 horas',
      ageRestriction: 'Todo público',
      venueName: 'Plaza Principal',
      venueAddress: 'Centro de la Ciudad',
      venueCity: 'La Paz',
      venueCountry: 'Bolivia',
      sku: 'FERIA-EMP-001',
      dates: [
        {
          date: '2025-05-20',
          times: ['10:00:00', '14:00:00']
        }
      ]
    },
    {
      id: 3,
      title: 'C.R.O - Cochabamba',
      slug: 'cro-cochabamba',
      date: new Date('2025-04-11T20:00:00'),
      location: 'Alice Park',
      faculty: 'Humanidades',
      imageUrl: 'https://picsum.photos/800/500?random=7',
      price: 'Bs. 150 - 250',
      description: 'Concierto del reconocido artista C.R.O en su gira mundial 2025.',
      minPrice: 150,
      maxPrice: 250,
      duration: '3 horas con 59 minutos',
      ageRestriction: 'Mayores de 18 años',
      venueName: 'Alice Park',
      venueAddress: 'Av. Principal #123',
      venueCity: 'Cochabamba',
      venueCountry: 'Bolivia',
      sku: 'CRO-CBBA-001',
      dates: [
        {
          date: '2025-04-11',
          times: ['20:00:00']
        }
      ]
    }
  ];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const eventSlug = params['slug']; // Ahora usamos slug en lugar de id
      this.loadEventDetailsBySlug(eventSlug);
    });
    
    // Scroll al inicio de la página cuando se carga el componente
    window.scrollTo(0, 0);
  }
  
  ngAfterViewInit(): void {
    // Aseguramos que el scroll se realice después de que la vista se haya inicializado
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }
  
  loadEventDetailsBySlug(slug: string): void {
    this.loading = true;
    this.error = false;
    
    // Simulación de carga de datos
    setTimeout(() => {
      const foundEvent = this.mockEvents.find(e => e.slug === slug);
      
      if (foundEvent) {
        this.event = foundEvent;
        
        if (this.event.dates && this.event.dates.length > 0) {
          this.selectedDate = this.event.dates[0].date;
          this.updateAvailableTimes();
          
          if (this.availableTimes.length > 0) {
            this.selectedTime = this.availableTimes[0];
          }
        }
        
        this.loading = false;
      } else {
        this.error = true;
        this.loading = false;
      }
    }, 1000);
  }
  
  updateAvailableTimes(): void {
    if (!this.event || !this.event.dates) {
      this.availableTimes = [];
      return;
    }
    
    const dateOption = this.event.dates.find(d => d.date === this.selectedDate);
    this.availableTimes = dateOption?.times || [];
  }
  
  selectDate(date: string): void {
    this.selectedDate = date;
    this.updateAvailableTimes();
    
    if (this.availableTimes.length > 0) {
      this.selectedTime = this.availableTimes[0];
    } else {
      this.selectedTime = '';
    }
  }
  
  selectTime(time: string): void {
    this.selectedTime = time;
  }
  
  buyTickets(): void {
    if (!this.selectedDate || !this.selectedTime) {
      this.snackBar.open('Por favor selecciona fecha y horario', 'Cerrar', {
        duration: 3000
      });
      return;
    }
    
    // Scroll a la sección de continuar
    if (this.continueSection) {
      this.continueSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  continue(): void {
    if (!this.selectedDate || !this.selectedTime) {
      this.snackBar.open('Por favor selecciona fecha y horario', 'Cerrar', {
        duration: 3000
      });
      return;
    }
    
    // Aquí iría la navegación al proceso de compra
    this.router.navigate(['/checkout'], {
      queryParams: { 
        eventId: this.event?.id,
        date: this.selectedDate, 
        time: this.selectedTime 
      }
    });
  }
  
  getVenueInfo(): string {
    if (!this.event) return '';
    
    let info = '';
    
    if (this.event.venueCity && this.event.venueCountry) {
      info = `${this.event.venueCity}, ${this.event.venueCountry}`;
    } else if (this.event.venueCity) {
      info = this.event.venueCity;
    } else if (this.event.venueCountry) {
      info = this.event.venueCountry;
    }
    
    return info;
  }
}