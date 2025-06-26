import { Component, OnInit } from "@angular/core"
import { Router, RouterLink, RouterLinkActive } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MaterialModule } from "../../../material.module";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../../auth/services/auth.service";
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import { EventsService } from "../../services/events.service";
interface Tab{
  label:string;
  route:string;
}
@Component({
  selector: "app-header",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatButtonModule,MaterialModule,CommonModule,MatMenuModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrl:'./header.component.css'
})
export class HeaderComponent implements OnInit {
  tabs: Tab[] = [];
  tenants: any[] = [];
  constructor(public router: Router, public authService:AuthService,public eventsService:EventsService) {}
  ngOnInit(): void {
    this.authService.getUser().subscribe((user) => {
      // Re-armar tabs cada vez que cambie el usuario (login/logout)
      this.tabs = [
        { label: 'Comprar', route: 'payment' },

        { label: 'Crear Evento', route: 'Create-Event' },
        {label:'Mis tickets', route:'MyTickets'},
      ];
  
      // Solo si hay un usuario logeado, buscar tenants
      if (user) {
                   // this.tabs.push({ label: 'Cuenta', route: 'Account' },)
        this.eventsService.getAllTenants().subscribe((res) => {
          this.tenants = res.data.tenants;
  
          if (this.tenants.length > 0) {
            this.tabs.push({ label: 'Mis Organizaciones', route: 'MyUnit' });

          }
        });
      }
    });
  }
  onTabClick(route: string) {
  if (route === 'MyTickets') {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/MyTickets']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  } else {
    this.router.navigate([`/${route}`]);
  }
}
 // Cambia eslto según el estado de autenticación del usuario
  isMobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  openLogin():void{
    this.router.navigate(['/auth/login'])
  }
  logout(): void {
    this.authService.logout();
  }
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
  openAccount(): void {
    this.router.navigate(['/Account']);
  }

  
}
