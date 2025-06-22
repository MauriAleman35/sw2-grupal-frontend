import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Section } from '../../interfaces/purchase';


interface TicketSelection {
  sectionId: string;
  quantity: number;
  price: number;
  name: string;
}

@Component({
  selector: 'app-ticket-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './ticket-selector.component.html',
  styleUrls: ['./ticket-selector.component.css']
})
export class TicketSelectorComponent implements OnInit {
  @Input() sections: Section[] = [];
  @Input() eventImage: string | null = ''; // Imagen del evento
  @Input() sectionImage: string | null = ''; // Imagen específica de la sección (mapa de asientos)
  @Input() eventTitle: string = '';
  
  @Output() selectionChange = new EventEmitter<TicketSelection[]>();
  
  ticketCounts: { [key: string]: number } = {};
  selections: TicketSelection[] = [];
  
  ngOnInit(): void {
    // Inicializar contador de tickets para cada sección
    if (this.sections) {
      this.sections.forEach(section => {
        this.ticketCounts[section.id] = 0;
      });
    }
    console.log(this.sections)
  }
  
  decrementCount(sectionId: string): void {
    if (this.ticketCounts[sectionId] > 0) {
      this.ticketCounts[sectionId]--;
      this.updateSelections();
    }
  }
  
  incrementCount(sectionId: string): void {
    this.ticketCounts[sectionId]++;
    this.updateSelections();
  }
  
  updateSelections(): void {
    this.selections = [];
    
    this.sections.forEach(section => {
      const quantity = this.ticketCounts[section.id];
      if (quantity > 0) {
        const priceValue = this.getPriceValue(section.price);
        
        this.selections.push({
          sectionId: section.id,
          quantity,
          price: priceValue,
          name: section.name
        });
      }
    });
    
    this.selectionChange.emit(this.selections);
  }
  
  // Método para obtener el precio como número (elimina S/. y convierte a número)
 getPriceValue(priceString: string): number {
  // Extrae solo el valor numérico, independientemente de si tiene "S/.", "Bs." u otro prefijo
  return parseFloat(priceString.replace(/[^\d.]/g, ''));
}
  // Método para calcular el total de la compra
  getTotalAmount(): number {
    let total = 0;
    this.selections.forEach(selection => {
      total += selection.price * selection.quantity;
    });
    return total;
  }
}