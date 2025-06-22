import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

import { EventsService } from '../../services/events.service';
import { DatumEventsAll } from '../../interfaces/events';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-events-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,    MatSnackBarModule
  ],
  templateUrl: './events-detail.component.html',
  styleUrls: ['./events-detail.component.css']
})
export class EventsDetailComponent implements OnInit {
    @ViewChild('continueSection') continueSection!: ElementRef; // Añadido nuevamente
  @ViewChild('ticketsSection') ticketsSection!: ElementRef;
  
  event: DatumEventsAll | null = null;
  loading = true;
  error = false;
  eventSlug: string = '';
  
  // Para controlar las pestañas de información adicional
  activeTab: 'direccion' | 'informacion' | 'mapa' = 'direccion';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventsService: EventsService, 
       private snackBar: MatSnackBar, 
       private authService:AuthService
  ) {}
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.eventSlug = params['slug'];
      this.loadEventDetailsBySlug(this.eventSlug);
    });
    
    window.scrollTo(0, 0);
  }
  
  loadEventDetailsBySlug(slug: string): void {
    this.loading = true;
    this.error = false;
    
    // Convertimos el slug a un formato legible
    const formattedTitle = this.transformSlugToTitle(slug);
    
    this.eventsService.getAllEvents(1, 100).subscribe({
      next: (res) => {
        // Buscamos el evento que coincida con el título formateado
        const foundEvent = res.data.find(e => 
          e.title.toLowerCase() === formattedTitle.toLowerCase() || 
          this.slugify(e.title) === slug
        );
        
        if (foundEvent) {
          this.event = foundEvent;
          this.loading = false;
        } else {
          this.error = true;
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error al cargar el evento:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
   // Restaurado: Método para continuar y hacer scroll
 buyTickets(): void {
  // Scroll a la sección de tickets (botón de compra)
  if (this.ticketsSection) {
    this.ticketsSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
}

  continue(): void {
       console.log(this.authService.isLoggedIn())
    if(this.authService.isLoggedIn()){
       if (this.event) {
      this.router.navigate(['/events', this.eventSlug, 'payment']);
    }
    }else{
      this.router.navigate(['/auth/login'])
    }
  
}
  transformSlugToTitle(slug: string): string {
    if (!slug) return '';
    
    const words = slug.split('-');
    
    const formattedWords = words.map((word, index) => {
      if (word.length === 0) return word;
      const lowercaseWords = ['de', 'la', 'el', 'los', 'las', 'del', 'y', 'e', 'o', 'u', 'a'];
      
      if (lowercaseWords.includes(word) && index !== 0) {
        return word;
      }
      
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    
    return formattedWords.join(' ');
  }
  
  slugify(text: string): string {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }
  
  formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  formatTime(date: Date | string | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  getDuration(): string {
    if (!this.event) return '';
    
    const start = new Date(this.event.start_date);
    const end = new Date(this.event.end_date);
    
    const diffMs = end.getTime() - start.getTime();
    const diffHrs = Math.round(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 24) {
      return `${diffHrs} hora${diffHrs !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffHrs / 24);
      const hours = diffHrs % 24;
      return `${days} día${days !== 1 ? 's' : ''}${hours > 0 ? ` y ${hours} hora${hours !== 1 ? 's' : ''}` : ''}`;
    }
  }
  
  setPriceRange(): string {
    if (!this.event || !this.event.sections || this.event.sections.length === 0) {
      return 'Precio no disponible';
    }
    
    const prices = this.event.sections.map(section => 
      parseFloat(section.price.replace(/[^\d.]/g, ''))
    );
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return `S/. ${minPrice.toFixed(2)}`;
    } else {
      return `Desde S/. ${minPrice.toFixed(2)} - Hasta S/. ${maxPrice.toFixed(2)}`;
    }
  }
  
  setActiveTab(tab: 'direccion' | 'informacion' | 'mapa'): void {
    this.activeTab = tab;
  }
  
  
  goToPayment(): void {
    
    
    if (this.event) {
      this.router.navigate(['/events', this.eventSlug, 'payment']);
    }
  }
}