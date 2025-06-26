import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-generate-verification-link',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './org-generate-verification-link.component.html',
  styleUrls: ['./org-generate-verification-link.component.css']
})
export class OrgGenerateVerificationLinkComponent {
  verificationLink: string | null = null;

  generateLink() {
    const tenantToken = localStorage.getItem('tenant-token');
    const tenantName = localStorage.getItem('current-tenant-name');
    const authToken = localStorage.getItem('auth-token');

    if (tenantToken && tenantName && authToken) {
      // Usa tenantToken y authToken en camelCase para la URL
      this.verificationLink =
        `${window.location.origin}/tenant/${tenantName}/verification?authToken=${authToken}&tenantToken=${tenantToken}`;
    } else {
      alert('No hay datos suficientes en localStorage');
    }
  }
  selectInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (input) {
      input.select();
    }
  }
}