import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatumSectionAll, DatumSectionByEvent } from '../../../interfaces/section';

@Component({
  selector: 'app-section-card',
  templateUrl: './section-card.component.html',
  styleUrls: ['./section-card.component.scss']
})
export class SectionCardComponent {
  @Input() section!: DatumSectionAll | DatumSectionByEvent;
  @Input() showEventInfo: boolean = true;
  
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() createTickets = new EventEmitter<string>();
  @Output() viewTickets = new EventEmitter<string>();
  
  // Método para obtener el título del evento de manera segura
  getEventTitle(): string {
    // Verificar si la sección tiene un evento con título
    if ('event' in this.section && this.section.event && this.section.event.title) {
      return this.section.event.title;
    }
    // Si tiene event_title directamente (posible estructura alternativa)
    if ('event_title' in this.section && this.section.event_title) {
      return this.section.name
    }
    // Si tiene event_name como alternativa
    if ('event_name' in this.section && this.section.event_name) {
      return this.section.name;
    }
    return 'Sin evento';
  }

  isEventData(section: any): boolean {
    return ('event' in section && section.event) || 
           ('event_title' in section && section.event_title) || 
           ('event_name' in section && section.event_name);
  }

  isSectionByEvent(section: any): boolean {
    // Verificar si es una sección con la propiedad has_tickets
    return 'has_tickets' in section;
  }

  hasTickets(): any {
    if (this.isSectionByEvent(this.section) && 'has_tickets' in this.section) {
      return this.section.has_tickets;
    }
    return false;
  }

  getTicketsCount(): any {
    if (this.isSectionByEvent(this.section)) {
      if ('tickets_count' in this.section) {
        return this.section.tickets_count || 0;
      }
    }
    return 0;
  }

  getProgressValue(): number {
    if (!this.section.capacity) return 0;
    return (this.getTicketsCount() / this.section.capacity) * 100;
  }

  onEdit(): void {
    this.edit.emit(this.section.id);
  }

  onDelete(): void {
    this.delete.emit(this.section.id);
  }

  onCreateTickets(): void {
    this.createTickets.emit(this.section.id);
  }
  
  onViewTickets(): void {
    this.viewTickets.emit(this.section.id);
  }
}