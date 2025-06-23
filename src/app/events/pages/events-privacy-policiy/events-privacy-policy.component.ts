import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-events-privacy-policiy',
  standalone: true,
  imports: [  CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule],
  templateUrl: './events-privacy-policiy.component.html',
  styleUrl: './events-privacy-policiy.component.css'
})
export class EventsPrivacyPolicyComponent {
  lastUpdated = '20 de junio de 2023';
}
