// section-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';



import { Section } from '../../interfaces/section';
import { EventsService } from '../../../events/services/events.service';
import { OrganizationService } from '../../services/organization.service';
import { Event } from '../../interfaces/events';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel } from '@angular/material/form-field';

@Component({
  selector: 'app-section-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
     MatProgressSpinnerModule,
    RouterModule,MatFormField,MatLabel
  ],
  templateUrl: './org-section.component.html',
  styleUrls: ['./org-section.component.css']
})
export class OrgSectionComponent implements OnInit {
  sections: Section[] = [];
  event: any | null = null;
  tenantId: string = '';
  eventId: string = '';
  isLoading: boolean = true;
  error: string | null = null;
    tenantName: string = '';
  constructor(
    private sectionService: OrganizationService,
    private eventService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tenantId = params['tenantId'];
      this.eventId = params['eventId'];
      this.loadEvent();
      this.loadSections();
    });

      this.route.parent?.paramMap.subscribe(params => {
    const tenantParam = params.get('tenantName');
    if (tenantParam) {
      this.tenantName = tenantParam;
    }
  });
  }

  loadEvent(): void {
    this.eventService.getByIdEvent(this.eventId).subscribe({
      next: (response) => {
        this.event = response.data;
      },
      error: (error) => {
        console.error('Error al cargar el evento', error);
        this.error = 'No se pudo cargar la información del evento';
      }
    });
  }

  loadSections(): void {
    this.isLoading = true;
    this.sectionService.getSectionsByEventId(this.eventId).subscribe({
      next: (response) => {
        this.sections = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar las secciones', error);
        this.error = 'No se pudieron cargar las secciones';
        this.isLoading = false;
      }
    });
  }

  createSection(): void {
         this.router.navigate(['/tenant', this.tenantName, 'section', 'create']);
  }

  editSection(sectionId: string): void {
    this.router.navigate([`/tenant/${this.tenantId}/events/${this.eventId}/sections/${sectionId}/edit`]);
  }

  viewSectionDetails(sectionId: string): void {
    this.router.navigate([`/tenant/${this.tenantId}/events/${this.eventId}/sections/${sectionId}`]);
  }

  toggleSectionStatus(section: Section): void {
    const updatedSection = { ...section, is_active: !section.is_active };
    this.sectionService.updateSection(section.id!, updatedSection).subscribe({
      next: () => {
        section.is_active = !section.is_active;
      },
      error: (error) => {
        console.error('Error al cambiar el estado de la sección', error);
      }
    });
  }

  getOccupancyPercentage(section: Section): number {
    // Aquí iría la lógica para calcular la ocupación
    // Por ahora, retornamos un valor aleatorio como ejemplo
    return Math.floor(Math.random() * 100);
  }

  getOccupancyColor(percentage: number): string {
    if (percentage < 30) return 'bg-green-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-BO', { 
      style: 'currency', 
      currency: 'BOB' 
    }).format(price);
  }
}