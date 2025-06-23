import { Component } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon, MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-events-terms-conditions',
  standalone: true,
  imports: [MatIconModule,MatDividerModule],
  templateUrl: './events-terms-conditions.component.html',
  styleUrl: './events-terms-conditions.component.css'
})
export class EventsTermsConditionsComponent {
  lastUpdated = '20 de junio de 2023';
  
}
