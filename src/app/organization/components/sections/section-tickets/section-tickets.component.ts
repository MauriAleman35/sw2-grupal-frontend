import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-ticket-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>Crear Tickets</h2>
    <mat-dialog-content>
      <p class="mb-4">¿Cuántos tickets deseas generar para la sección "{{ data.sectionName }}"?</p>
      
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Cantidad de tickets</mat-label>
        <input matInput type="number" [formControl]="quantityControl" min="1" [max]="data.maxCapacity">
        <mat-hint>Máximo disponible: {{ data.maxCapacity }}</mat-hint>
        <mat-error *ngIf="quantityControl.hasError('required')">La cantidad es requerida</mat-error>
        <mat-error *ngIf="quantityControl.hasError('min')">La cantidad debe ser mayor a 0</mat-error>
        <mat-error *ngIf="quantityControl.hasError('max')">
          La cantidad no puede superar la capacidad ({{ data.maxCapacity }})
        </mat-error>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button 
        mat-raised-button 
        color="primary" 
        [disabled]="quantityControl.invalid"
        [mat-dialog-close]="quantityControl.valid ? quantityControl.value : null">
        Crear tickets
      </button>
    </mat-dialog-actions>
  `
})
export class TicketConfirmationDialogComponent {
  quantityControl: FormControl;
  
  constructor(
    public dialogRef: MatDialogRef<TicketConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      sectionId: string; 
      sectionName: string; 
      maxCapacity: number;
    }
  ) {
    // Inicializar con el valor máximo disponible
    this.quantityControl = new FormControl(
      this.data.maxCapacity || 1, 
      [
        Validators.required,
        Validators.min(1),
        Validators.max(this.data.maxCapacity || 1)
      ]
    );
  }
}