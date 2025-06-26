import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrganizationVerificationService } from '../../services/organization-verification.service';
import { VerifyTicketParams, VerifyTicketResponse } from '../../interfaces/verify';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-org-verification',
  standalone: true,
  imports: [
    CommonModule,
    ZXingScannerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule,
  ],
  templateUrl: './org-verification.component.html',
  styleUrls: ['./org-verification.component.css']
})
export class OrgVerificationComponent implements OnInit {
  scanning = true;
  result: string | null = null;
  loading = false;
  verifyResponse: VerifyTicketResponse | null = null;
  error: string | null = null;

  availableDevices: MediaDeviceInfo[] = [];
  selectedDevice: MediaDeviceInfo | undefined;
  hasDevices = false;
  hasPermission = false;

  formats = ['QR_CODE'] as any;

  // Tokens extraídos directamente de la URL
  authToken: string | null = null;
  tenantToken: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private verificationService: OrganizationVerificationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Solo extrae los tokens de la URL, no los guarda
    this.route.queryParams.subscribe(params => {
      this.authToken = params['authToken'];
      this.tenantToken = params['tenantToken'];
    });
  }

  onCamerasFound(devices: MediaDeviceInfo[]) {
    this.availableDevices = devices;
    this.hasDevices = devices && devices.length > 0;
    if (this.hasDevices && !this.selectedDevice) {
      this.selectedDevice = devices[devices.length - 1];
    }
  }

  onHasPermission(has: boolean) {
    this.hasPermission = has;
  }

  onDeviceSelectChange(event: any) {
    const deviceId = event.value;
    this.selectedDevice = this.availableDevices.find(d => d.deviceId === deviceId);
  }

  onCodeResult(resultString: string) {
    this.result = resultString;
    this.scanning = false;
    this.loading = true;
    this.error = null;
    this.verifyResponse = null;

    let params: VerifyTicketParams;
    try {
      params = JSON.parse(resultString);
    } catch (e) {
      this.error = 'El código QR no contiene datos válidos (JSON).';
      this.loading = false;
      return;
    }

    // Toma los tokens solo de los queryParams
    if (!this.authToken || !this.tenantToken) {
      this.error = 'Faltan los tokens en la URL. Debes ingresar desde el link correcto.';
      this.loading = false;
      return;
    }

    this.verificationService.VerifyTicket(params, this.authToken, this.tenantToken).subscribe({
      next: (response) => {
        this.verifyResponse = response;
        this.loading = false;
        if (response.data.isValid) {
          this.snackBar.open('¡Acceso permitido! Ticket válido.', 'Cerrar', {
            duration: 4000,
            panelClass: ['snackbar-success']
          });
        } else {
          this.snackBar.open('Ticket inválido: ' + (response.data.message || response.data.error), 'Cerrar', {
            duration: 4000,
            panelClass: ['snackbar-error']
          });
        }
      },
      error: (err) => {
        this.loading = false;
        let msg: string = 'Error al verificar el ticket.';
        if (err && err.error && err.error.message) {
          msg += ' ' + err.error.message;
        } else if (err && err.message) {
          msg += ' ' + err.message;
        } else if (typeof err === 'string') {
          msg += ' ' + err;
        }
        this.error = msg;
        this.snackBar.open(msg, 'Cerrar', {
          duration: 6000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  onScanError(error: any) {
    this.error = 'Error accediendo a la cámara: ' + (error?.name || error);
  }

  clearResult() {
    this.result = null;
    this.scanning = true;
    this.loading = false;
    this.verifyResponse = null;
    this.error = null;
  }
}