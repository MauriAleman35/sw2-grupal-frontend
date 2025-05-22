import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Section } from '../../../interfaces/section';

@Component({
  selector: 'app-section-list',
  templateUrl: './section-list.component.html',
  styleUrls: ['./section-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionListComponent {
  @Input() sections: Section[] | null = [];
  @Input() loading = false;
  
  @Output() edit = new EventEmitter<Section>();
  @Output() delete = new EventEmitter<Section>();
  @Output() view = new EventEmitter<Section>();
  @Output() createTickets = new EventEmitter<Section>();
  
  displayedColumns: string[] = ['name', 'capacity', 'price', 'status', 'actions'];
  
  getStatusClass(status: string | undefined): string {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'limited':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold_out':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  getStatusLabel(status: string | undefined): string {
    if (!status) return 'Desconocido';
    
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'limited':
        return 'Limitado';
      case 'sold_out':
        return 'Agotado';
      default:
        return 'Desconocido';
    }
  }
}