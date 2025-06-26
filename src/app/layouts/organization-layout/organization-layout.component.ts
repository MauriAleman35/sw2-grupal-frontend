import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

interface CurrentTenant {
  id: string;
  name: string;
  displayName: string;
  role: string;
}

@Component({
  selector: 'app-organization-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatBadgeModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './organization-layout.component.html',
  styleUrls: ['./organization-layout.component.css']
})
export class OrganizationLayoutComponent implements OnInit {
  sidebarCollapsed: boolean = false;
  isMobile: boolean = false;
  mobileSidebarOpen: boolean = false;
  currentTenant: CurrentTenant | null = null;
  menuItems: MenuItem[] = [];

  constructor() {
    this.checkScreenSize();
    console.log('OrganizationLayoutComponent cargado');
  }

  ngOnInit(): void {
    this.loadCurrentTenant();
    this.initMenu(); // inicializamos después de obtener el tenant
  }

  @HostListener('window:resize')
  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.sidebarCollapsed = true;
      this.mobileSidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      this.mobileSidebarOpen = !this.mobileSidebarOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  closeMobileSidebar(): void {
    if (this.isMobile) {
      this.mobileSidebarOpen = false;
    }
  }

  loadCurrentTenant(): void {
    const tenantName = localStorage.getItem('current-tenant-name');
    const tenantId = localStorage.getItem('current-tenant-id');
  
    if (tenantName && tenantId) {
      this.currentTenant = {
        id: tenantId,
        name: tenantName.replace(/\./g, '-'),  // 👈 puntos por guiones
        displayName: tenantName.split('.')[0], // 👈 opcional: usa la primera parte como displayName
        role: 'ADMIN' // 👈 si lo tienes, también podrías obtenerlo desde el usuario
      };
    } else {
      // Fallback por si algo falla
      this.currentTenant = {
        id: 'default-id',
        name: 'default-tenant',
        displayName: 'Organización',
        role: 'ADMIN'
      };
    }
  }
  

  get tenantRoutePrefix(): string {
    return this.currentTenant?.name ? `/tenant/${this.currentTenant.name}` : '';
  }

  initMenu(): void {
    const base = `/tenant/${this.currentTenant?.name}`;
    this.menuItems = [
      { icon: 'dashboard', label: 'Dashboard', route: `${base}/dashboard` },
      {icon:'local_activity', label: 'Entradas', route: `${base}/ticket`},
      { icon:'school',label:'Facultades',route:`${base}/faculty`},
      { icon: 'event', label: 'Eventos', route: `${base}/events`, badge: 3 },
      { icon: 'view_module', label: 'Secciones', route: `${base}/section` },
      { icon: 'bookmark_added', label: 'Verificar Tickets', route: `${base}/generate` }
    ];
  }
  logout(): void {
    console.log('Cerrando sesión...');
    localStorage.removeItem('tenant-token');
    localStorage.removeItem('current-tenant-name');
        localStorage.removeItem('current-tenant-id');

    window.location.href = '/';
  }

  switchTenant(): void {
    console.log('Cambiando de organización...');
    window.location.href = '/organizations';
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const words = name.split(' ');
    return words.length === 1
      ? words[0].substring(0, 2).toUpperCase()
      : (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  getAvatarColor(name: string): string {
    if (!name) return '#d4a017';
    const colors = ['#d4a017', '#a58d65', '#e6b325', '#8a7553', '#c49c3f'];
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  }
}
