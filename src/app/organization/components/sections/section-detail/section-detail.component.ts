import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Section } from '../../../interfaces/section';

@Component({
  selector: 'app-section-detail',
  templateUrl: './section-detail.component.html',
  styleUrls: ['./section-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionDetailComponent {
  @Input() section: Section | null = null;
  @Input() eventId: string | null = null;
  
  @Output() edit = new EventEmitter<Section>();
  @Output() delete = new EventEmitter<Section>();
  @Output() createTickets = new EventEmitter<Section>();
  @Output() back = new EventEmitter<void>();
  
  getStatusColor(status: string | undefined): string {
    if (!status) return 'gray';
    
    switch (status) {
      case 'available': return 'green';
      case 'limited': return 'yellow';
      case 'sold_out': return 'red';
      default: return 'gray';
    }
  }
  
  getStatusLabel(status: string | undefined): string {
    if (!status) return 'Desconocido';
    
    switch (status) {
      case 'available': return 'Disponible';
      case 'limited': return 'Limitado';
      case 'sold_out': return 'Agotado';
      default: return 'Desconocido';
    }
  }
}