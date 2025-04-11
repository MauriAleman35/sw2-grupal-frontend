import { Component } from "@angular/core"
import { Router, RouterLink, RouterLinkActive } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MaterialModule } from "../../../material.module";
import { CommonModule } from "@angular/common";

interface Tab{
  label:string;
  route:string;
}
@Component({
  selector: "app-header",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatButtonModule,MaterialModule,CommonModule],
  templateUrl: './header.component.html',
  styleUrl:'./header.component.css'
})
export class HeaderComponent {
  tabs:Tab[]=[
    {label:'Comprar',route:''},
    {
      label:'Mis Tickets',route:'MyTickets'
    },{label:'Crear Evento',route:'Create-Event'},
   
  ] 

  isMobileMenuOpen = false;
  constructor(private router: Router) {}
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  openLogin():void{
    this.router.navigate(['/auth/login'])
  }
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
