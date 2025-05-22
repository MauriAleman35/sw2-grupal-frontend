import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-ticket-progress-dialog',
  template: `
    <div class="p-6 text-center">
      <div class="mb-6 flex justify-center">
        <div class="relative">
          <div class="ticket-icon-container">
            <mat-icon class="ticket-icon text-accent-600" style="font-size: 60px; width: 60px; height: 60px;">
              confirmation_number
            </mat-icon>
            <div class="ticket-icon-overlay">
              <div class="circular-progress"></div>
            </div>
          </div>
        </div>
      </div>
      
      <h2 class="text-xl font-semibold mb-4">{{ data.title }}</h2>
      <p class="mb-6">{{ data.message }}</p>
      
      <div class="progress-container">
        <mat-progress-bar
          mode="indeterminate"
          color="accent"
          class="mb-2"
        ></mat-progress-bar>
        <p class="text-sm text-gray-600">Esto puede tomar unos momentos...</p>
      </div>
    </div>
  `,
  styles: [`
    .ticket-icon-container {
      position: relative;
      display: inline-block;
    }
    
    .ticket-icon {
      animation: pulse 1.5s infinite ease-in-out;
      filter: drop-shadow(0 0 10px rgba(66, 99, 235, 0.5));
      color: #4263eb;
    }
    
    .ticket-icon-overlay {
      position: absolute;
      top: -10px;
      left: -10px;
      right: -10px;
      bottom: -10px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .circular-progress {
      border: 4px solid transparent;
      border-radius: 50%;
      border-top: 4px solid #4263eb;
      border-right: 4px solid transparent;
      width: 80px;
      height: 80px;
      animation: spin 1s linear infinite;
    }
    
    .progress-container {
      max-width: 280px;
      margin: 0 auto;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `]
})
export class SectionProgressDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SectionProgressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      title: string;
      message: string;
    }
  ) {}
}