import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Event {
  id: string;
  title: string;
  date: Date;
  location: string;
  attendees: number;
  capacity: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled' | 'draft';
  imageUrl: string;
  price: string;
  categories: string[];
}

@Component({
  selector: 'app-org-events',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatMenuModule,
    MatDividerModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './org-events.component.html',
  styleUrls: ['./org-events.component.css']
})
export class OrgEventsComponent implements OnInit {
  events: Event[] = [
    {
      id: '1',
      title: 'Conferencia de Ingeniería',
      date: new Date('2025-05-15T14:00:00'),
      location: 'Auditorio Principal',
      attendees: 120,
      capacity: 200,
      status: 'upcoming',
      imageUrl: '/assets/events/conference.jpg',
      price: 'Bs. 50',
      categories: ['Ingeniería', 'Educación']
    },
    {
      id: '2',
      title: 'Taller de Programación',
      date: new Date('2025-05-18T10:00:00'),
      location: 'Laboratorio 3',
      attendees: 45,
      capacity: 50,
      status: 'upcoming',
      imageUrl: '/assets/events/workshop.jpg',
      price: 'Bs. 30',
      categories: ['Tecnología', 'Educación']
    },
    {
      id: '3',
      title: 'Seminario de Investigación',
      date: new Date('2025-05-20T16:30:00'),
      location: 'Sala de Conferencias',
      attendees: 80,
      capacity: 100,
      status: 'upcoming',
      imageUrl: '/assets/events/seminar.jpg',
      price: 'Bs. 25',
      categories: ['Investigación', 'Ciencia']
    },
    {
      id: '4',
      title: 'Feria de Ciencias',
      date: new Date('2025-05-01T09:00:00'),
      location: 'Campus Central',
      attendees: 350,
      capacity: 500,
      status: 'completed',
      imageUrl: '/assets/events/fair.jpg',
      price: 'Entrada Libre',
      categories: ['Ciencia', 'Feria']
    },
    {
      id: '5',
      title: 'Charla de Innovación',
      date: new Date('2025-05-03T15:00:00'),
      location: 'Auditorio Secundario',
      attendees: 95,
      capacity: 100,
      status: 'completed',
      imageUrl: '/assets/events/talk.jpg',
      price: 'Bs. 15',
      categories: ['Innovación', 'Tecnología']
    },
    {
      id: '6',
      title: 'Congreso Anual de Estudiantes',
      date: new Date('2025-06-10T08:00:00'),
      location: 'Centro de Convenciones',
      attendees: 0,
      capacity: 300,
      status: 'draft',
      imageUrl: '/assets/events/congress.jpg',
      price: 'Bs. 100',
      categories: ['Educación', 'Networking']
    }
  ];
  
  constructor() {}
  
  ngOnInit(): void {}
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  getStatusText(status: string): string {
    switch (status) {
      case 'upcoming':
        return 'Próximo';
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      case 'draft':
        return 'Borrador';
      default:
        return status;
    }
  }
  
  getAttendancePercentage(attendees: number, capacity: number): number {
    return Math.round((attendees / capacity) * 100);
  }
  
  getAttendanceClass(attendees: number, capacity: number): string {
    const percentage = this.getAttendancePercentage(attendees, capacity);
    if (percentage >= 90) return 'attendance-high';
    if (percentage >= 50) return 'attendance-medium';
    return 'attendance-low';
  }
  
  filterEvents(status: string): Event[] {
    if (status === 'all') return this.events;
    return this.events.filter(event => event.status === status);
  }
}