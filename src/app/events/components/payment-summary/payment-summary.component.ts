import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDividerModule,
    MatCheckboxModule,
    FormsModule
  ],
  template: `
    <div *ngIf="ticketSelections.length > 0" class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4 flex items-center">
        <mat-icon class="text-[#d4a017] mr-2">receipt</mat-icon>
        Resumen de compra
      </h2>
      
      <!-- Detalles de tickets -->
      <div class="space-y-3 mb-6">
        <div *ngFor="let ticket of ticketSelections" class="flex justify-between items-center py-2 border-b border-gray-100">
          <div>
            <div class="font-medium">{{ ticket.name }}</div>
            <div class="text-sm text-gray-600">{{ ticket.quantity }} ticket{{ ticket.quantity > 1 ? 's' : '' }}</div>
          </div>
          <div class="font-medium">{{ currencySymbol }} {{ (ticket.price * ticket.quantity).toFixed(2) }}</div>
        </div>
      </div>
      
      <!-- Subtotal -->
      <div class="flex justify-between py-2">
        <span class="text-gray-600">Subtotal</span>
        <span>{{ currencySymbol }} {{ totalAmount.toFixed(2) }}</span>
      </div>
      
      <!-- Impuestos -->
      <div class="flex justify-between py-2">
        <span class="text-gray-600">Impuestos</span>
        <span>{{ currencySymbol }} 0.00</span>
      </div>
      
      <mat-divider class="my-3"></mat-divider>
      
      <!-- Total -->
      <div class="flex justify-between py-2 font-semibold text-lg">
        <span>Total</span>
        <span class="text-[#d4a017]">{{ currencySymbol }} {{ totalAmount.toFixed(2) }}</span>
      </div>
      
      <!-- Términos y condiciones (opcional) -->
      <div *ngIf="showTerms" class="mt-6 pt-4 border-t border-gray-200">
        <mat-checkbox [(ngModel)]="termsAccepted" color="primary">
          Acepto los <a href="#" class="text-[#d4a017]">términos y condiciones</a>
        </mat-checkbox>
      </div>
    </div>
  `
})
export class PaymentSummaryComponent {
  @Input() ticketSelections: any[] = [];
  @Input() totalAmount: number = 0;
  @Input() showTerms: boolean = false;
  @Input() currencySymbol: string = 'Bs.'; // Por defecto en Bolivianos
  
  termsAccepted: boolean = false;
}