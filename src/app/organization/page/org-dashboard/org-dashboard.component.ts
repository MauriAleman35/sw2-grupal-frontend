import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';

interface StatCard {
  title: string;
  value: string;
  icon: string;
  change: number;
  color: string;
}

interface Event {
  id: string;
  title: string;
  date: Date;
  location: string;
  attendees: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  imageUrl: string;
}

@Component({
  selector: 'app-org-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  templateUrl: './org-dashboard.component.html',
  styleUrls: ['./org-dashboard.component.css']
})
export class OrgDashboardComponent implements OnInit {
  statCards: StatCard[] = [
    {
      title: 'Total Eventos',
      value: '24',
      icon: 'event',
      change: 12.5,
      color: '#d4a017'
    },
    {
      title: 'Asistentes',
      value: '1,250',
      icon: 'people',
      change: 8.3,
      color: '#10b981'
    },
    {
      title: 'Ingresos',
      value: 'Bs. 15,400',
      icon: 'payments',
      change: -2.4,
      color: '#ef4444'
    },
    {
      title: 'Tasa de Conversión',
      value: '68%',
      icon: 'trending_up',
      change: 5.7,
      color: '#3b82f6'
    }
  ];
  
  upcomingEvents: Event[] = [
    {
      id: '1',
      title: 'Conferencia de Ingeniería',
      date: new Date('2025-05-15T14:00:00'),
      location: 'Auditorio Principal',
      attendees: 120,
      status: 'upcoming',
      imageUrl: '/assets/events/conference.jpg'
    },
    {
      id: '2',
      title: 'Taller de Programación',
      date: new Date('2025-05-18T10:00:00'),
      location: 'Laboratorio 3',
      attendees: 45,
      status: 'upcoming',
      imageUrl: '/assets/events/workshop.jpg'
    },
    {
      id: '3',
      title: 'Seminario de Investigación',
      date: new Date('2025-05-20T16:30:00'),
      location: 'Sala de Conferencias',
      attendees: 80,
      status: 'upcoming',
      imageUrl: '/assets/events/seminar.jpg'
    }
  ];
  
  recentEvents: Event[] = [
    {
      id: '4',
      title: 'Feria de Ciencias',
      date: new Date('2025-05-01T09:00:00'),
      location: 'Campus Central',
      attendees: 350,
      status: 'completed',
      imageUrl: '/assets/events/fair.jpg'
    },
    {
      id: '5',
      title: 'Charla de Innovación',
      date: new Date('2025-05-03T15:00:00'),
      location: 'Auditorio Secundario',
      attendees: 95,
      status: 'completed',
      imageUrl: '/assets/events/talk.jpg'
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
      default:
        return status;
    }
  }
  
  getChangeClass(change: number): string {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  }
  
  getChangeIcon(change: number): string {
    return change >= 0 ? 'arrow_upward' : 'arrow_downward';
  }
}