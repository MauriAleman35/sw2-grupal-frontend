import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './events/components/header/header.component';
import { FooterComponent } from './events/components/footer/footer.component';
import { ThemeSwitchService } from './events/services/theme-switch.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,HeaderComponent,FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private themeSwitchService: ThemeSwitchService) {}
  ngOnInit() {
    // Inicializar el servicio de cambio de tema
   
  }
  title = 'university-events-frontend';
}
