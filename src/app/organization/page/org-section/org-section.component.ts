import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { CdkDragDrop, moveItemInArray, CdkDragHandle, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';

interface Section {
  id: string;
  title: string;
  description: string;
  type: 'banner' | 'featured' | 'categories' | 'events' | 'about' | 'contact';
  active: boolean;
  order: number;
  icon: string;
}

@Component({
  selector: 'app-org-section',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatTabsModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle
  ],
  templateUrl: './org-section.component.html',
  styleUrls: ['./org-section.component.css']
})
export class OrgSectionComponent implements OnInit {
  sections: Section[] = [
    {
      id: '1',
      title: 'Banner Principal',
      description: 'Banner destacado con imágenes de eventos principales',
      type: 'banner',
      active: true,
      order: 1,
      icon: 'view_carousel'
    },
    {
      id: '2',
      title: 'Eventos Destacados',
      description: 'Muestra los eventos más importantes',
      type: 'featured',
      active: true,
      order: 2,
      icon: 'star'
    },
    {
      id: '3',
      title: 'Categorías',
      description: 'Listado de categorías de eventos',
      type: 'categories',
      active: true,
      order: 3,
      icon: 'category'
    },
    {
      id: '4',
      title: 'Próximos Eventos',
      description: 'Lista de eventos próximos',
      type: 'events',
      active: true,
      order: 4,
      icon: 'event'
    },
    {
      id: '5',
      title: 'Sobre Nosotros',
      description: 'Información sobre la organización',
      type: 'about',
      active: false,
      order: 5,
      icon: 'info'
    },
    {
      id: '6',
      title: 'Contacto',
      description: 'Formulario de contacto y ubicación',
      type: 'contact',
      active: true,
      order: 6,
      icon: 'contact_mail'
    }
  ];
  
  availableSections: Section[] = [
    {
      id: '7',
      title: 'Galería de Fotos',
      description: 'Muestra imágenes de eventos pasados',
      type: 'banner',
      active: false,
      order: 0,
      icon: 'photo_library'
    },
    {
      id: '8',
      title: 'Testimonios',
      description: 'Opiniones de asistentes a eventos',
      type: 'about',
      active: false,
      order: 0,
      icon: 'format_quote'
    }
  ];
  
  constructor() {}
  
  ngOnInit(): void {
    // Ordenar secciones por orden
    this.sections.sort((a, b) => a.order - b.order);
  }
  
  drop(event: CdkDragDrop<Section[]>): void {
    moveItemInArray(this.sections, event.previousIndex, event.currentIndex);
    
    // Actualizar el orden
    this.sections.forEach((section, index) => {
      section.order = index + 1;
    });
  }
  
  toggleSectionActive(section: Section): void {
    section.active = !section.active;
  }
  
  getActiveStatusClass(active: boolean): string {
    return active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  }
  
  getActiveStatusText(active: boolean): string {
    return active ? 'Activo' : 'Inactivo';
  }
  
  addSection(section: Section): void {
    // Clonar la sección y añadirla a las secciones activas
    const newSection = { ...section };
    newSection.order = this.sections.length + 1;
    newSection.active = true;
    this.sections.push(newSection);
    
    // Eliminar de las secciones disponibles
    const index = this.availableSections.findIndex(s => s.id === section.id);
    if (index !== -1) {
      this.availableSections.splice(index, 1);
    }
  }
  
  removeSection(section: Section): void {
    // Eliminar la sección
    const index = this.sections.findIndex(s => s.id === section.id);
    if (index !== -1) {
      this.sections.splice(index, 1);
      
      // Actualizar el orden
      this.sections.forEach((s, i) => {
        s.order = i + 1;
      });
      
      // Añadir a las secciones disponibles
      section.active = false;
      section.order = 0;
      this.availableSections.push(section);
    }
  }
}