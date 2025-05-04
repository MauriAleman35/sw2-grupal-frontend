import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EventsService } from '../../services/events.service';
import { Tenant } from '../../interfaces/tenants';
interface Role {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}



interface TenantsResponse {
  statusCode: number;
  message: string;
  data: {
    total: number;
    tenants: Tenant[];
  };
}
@Component({
  selector: 'app-events-my-tenants',
  standalone: true,
  imports: [  CommonModule,
    RouterModule,

    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule],
  templateUrl: './events-my-tenants.component.html',
  styleUrl: './events-my-tenants.component.css'
})
export class EventsMyTenantsComponent implements OnInit {
  tenants: Tenant[] = [];
  loading: boolean = true;
  error: boolean = false;
  
  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private eventsService: EventsService
  ) {}
  
  ngOnInit(): void {
    this.loadTenants();
  }
  
  loadTenants(): void {
    this.loading = true;
    this.error = false;


    this.eventsService.getAllTenants().subscribe({
      next:(res)=>{
        this.tenants = res.data.tenants;
        this.loading = false;
      },
        error: (error) => {
          console.error('Error loading tenants:', error);
          this.error = true;
          this.loading = false;
        }
  
    })

  }
  
  accessTenant(tenant: Tenant): void {
    // Guardar el token y metadatos en localStorage
    localStorage.setItem('tenant-token', tenant.token);
    localStorage.setItem('current-tenant-id', tenant.memberTenantId); // del backend
    localStorage.setItem('current-tenant-name', tenant.tenantName);   // visible en URL
  
    const safeTenantName = tenant.tenantName.replace(/\./g, '-');
  
    this.snackBar.open(`Accediendo a ${tenant.displayName}...`, 'Cerrar', {
      duration: 2000
    });
  
    setTimeout(() => {
      this.router.navigate(['/tenant', safeTenantName, 'dashboard']);
    }, 500);
  }
  
  createNewTenant(): void {
    // Redireccionar a la página de creación de tenant
    this.router.navigate(['Create-Event']);
  }
  
  getRoleBadgeClass(roleName: string): string {
    switch (roleName) {
      case 'ADMIN':
        return 'bg-[#d4a017] text-white';
      case 'EDITOR':
        return 'bg-blue-500 text-white';
      case 'VIEWER':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  }
  
  // Generar iniciales para el avatar
  getInitials(name: string): string {
    if (!name) return '?';
    
    const words = name.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  
  // Generar color de fondo para el avatar basado en el nombre
  getAvatarColor(name: string): string {
    if (!name) return '#d4a017';
    
    const colors = [
      '#d4a017', // Dorado (color principal)
      '#a58d65', // Dorado oscuro
      '#e6b325', // Dorado claro
      '#8a7553', // Marrón dorado
      '#c49c3f'  // Ámbar
    ];
    
    // Usar el nombre para seleccionar un color de manera determinista
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  }
  
  

}
