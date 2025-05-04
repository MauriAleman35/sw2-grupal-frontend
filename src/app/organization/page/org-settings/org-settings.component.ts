import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  lastActive: Date | null;
}

@Component({
  selector: 'app-org-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule  ,MatMenuModule,   // ⬅️ necesario para <mat-menu>
    MatBadgeModule 
  ],
  templateUrl: './org-settings.component.html',
  styleUrls: ['./org-settings.component.css']
})
export class OrgSettingsComponent implements OnInit {
  generalForm!: FormGroup;
  appearanceForm!: FormGroup;
  notificationsForm!: FormGroup;
  
  users: User[] = [
    {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan.perez@uagrm.edu.bo',
      role: 'ADMIN',
      status: 'active',
      lastActive: new Date('2025-05-02T14:30:00')
    },
    {
      id: '2',
      name: 'María López',
      email: 'maria.lopez@uagrm.edu.bo',
      role: 'EDITOR',
      status: 'active',
      lastActive: new Date('2025-05-01T10:15:00')
    },
    {
      id: '3',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@uagrm.edu.bo',
      role: 'VIEWER',
      status: 'pending',
      lastActive: null
    },
    {
      id: '4',
      name: 'Ana Martínez',
      email: 'ana.martinez@uagrm.edu.bo',
      role: 'EDITOR',
      status: 'inactive',
      lastActive: new Date('2025-04-15T09:45:00')
    }
  ];
  
  roles = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'EDITOR', label: 'Editor' },
    { value: 'VIEWER', label: 'Visualizador' }
  ];
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit(): void {
    this.initForms();
  }
  
  initForms(): void {
    // Formulario de configuración general
    this.generalForm = this.fb.group({
      displayName: ['Facultad de Ingeniería', [Validators.required]],
      description: ['Facultad de Ingeniería de la Universidad Autónoma Gabriel René Moreno', [Validators.required]],
      contactEmail: ['ingenieria@uagrm.edu.bo', [Validators.required, Validators.email]],
      contactPhone: ['+591 3 3464000', [Validators.required]],
      address: ['Av. Busch, Santa Cruz de la Sierra, Bolivia', [Validators.required]],
      website: ['https://ingenieria.uagrm.edu.bo', [Validators.pattern('https?://.+')]]
    });
    
    // Formulario de apariencia
    this.appearanceForm = this.fb.group({
      primaryColor: ['#d4a017', [Validators.required]],
      secondaryColor: ['#a58d65', [Validators.required]],
      logo: [''],
      favicon: [''],
      showSocialLinks: [true],
      facebookUrl: ['https://facebook.com/ingenieriauagrm'],
      twitterUrl: ['https://twitter.com/ingenieriauagrm'],
      instagramUrl: ['https://instagram.com/ingenieriauagrm'],
      youtubeUrl: ['']
    });
    
    // Formulario de notificaciones
    this.notificationsForm = this.fb.group({
      emailNotifications: [true],
      newEventNotification: [true],
      eventReminderNotification: [true],
      eventCancellationNotification: [true],
      userJoinedNotification: [false],
      systemUpdatesNotification: [true]
    });
  }
  
  saveGeneralSettings(): void {
    if (this.generalForm.valid) {
      console.log('Guardando configuración general:', this.generalForm.value);
      // Aquí iría la lógica para guardar en el backend
    }
  }
  
  saveAppearanceSettings(): void {
    if (this.appearanceForm.valid) {
      console.log('Guardando configuración de apariencia:', this.appearanceForm.value);
      // Aquí iría la lógica para guardar en el backend
    }
  }
  
  saveNotificationSettings(): void {
    if (this.notificationsForm.valid) {
      console.log('Guardando configuración de notificaciones:', this.notificationsForm.value);
      // Aquí iría la lógica para guardar en el backend
    }
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'pending':
        return 'Pendiente';
      case 'inactive':
        return 'Inactivo';
      default:
        return status;
    }
  }
  
  getRoleText(role: string): string {
    const roleObj = this.roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  }
  
  getRoleClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'role-admin';
      case 'EDITOR':
        return 'role-editor';
      case 'VIEWER':
        return 'role-viewer';
      default:
        return '';
    }
  }
  
  inviteUser(): void {
    console.log('Invitar usuario');
    // Aquí iría la lógica para mostrar un modal de invitación
  }
  
  changeUserRole(user: User, newRole: string): void {
    console.log(`Cambiando rol de ${user.name} a ${newRole}`);
    // Aquí iría la lógica para cambiar el rol en el backend
    user.role = newRole;
  }
  
  deactivateUser(user: User): void {
    console.log(`Desactivando usuario ${user.name}`);
    // Aquí iría la lógica para desactivar el usuario en el backend
    user.status = 'inactive';
  }
  
  activateUser(user: User): void {
    console.log(`Activando usuario ${user.name}`);
    // Aquí iría la lógica para activar el usuario en el backend
    user.status = 'active';
  }
  
  removeUser(user: User): void {
    console.log(`Eliminando usuario ${user.name}`);
    // Aquí iría la lógica para eliminar el usuario en el backend
    const index = this.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }
}