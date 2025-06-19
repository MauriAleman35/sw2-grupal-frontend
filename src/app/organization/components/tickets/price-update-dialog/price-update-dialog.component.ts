import { Component, Inject, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule,  FormBuilder, FormGroup, Validators } from "@angular/forms"
import { MAT_DIALOG_DATA, MatDialogModule,  MatDialogRef } from "@angular/material/dialog"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatNativeDateModule } from "@angular/material/core"
import { MatChipsModule } from "@angular/material/chips"
import { MatCheckboxModule } from "@angular/material/checkbox"
import type { PriceUpdateRequest, TicketGroup } from "../../../interfaces/tickets"
import{ OrganizationTicketService } from "../../../services/organization-ticket.service"

@Component({
  selector: "app-price-update-dialog",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,


    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatCheckboxModule,
  ],
  templateUrl: "./price-update-dialog.component.html",
  styleUrls: ["./price-update-dialog.component.css"],
})
export class PriceUpdateDialogComponent implements OnInit {
  priceForm: FormGroup
  selectedSections: string[]
  ticketGroups: TicketGroup[]

  // Tipos de modificación de precio con el enum correcto
  promotionTypes = [
    {
      value: "EARLY_BIRD",
      label: "Early Bird",
      description: "Precio especial por compra anticipada",
      icon: "schedule",
    },
    {
      value: "PRESALE",
      label: "Preventa",
      description: "Precio de preventa antes del lanzamiento oficial",
      icon: "preview",
    },
    {
      value: "DISCOUNT",
      label: "Descuento",
      description: "Reducción de precio por tiempo limitado",
      icon: "local_offer",
    },
    {
      value: "PROMOTION",
      label: "Promoción",
      description: "Oferta especial promocional",
      icon: "campaign",
    },
    {
      value: "SPECIAL_OFFER",
      label: "Oferta Especial",
      description: "Oferta única por evento especial",
      icon: "star",
    },
    {
      value: "GROUP_DISCOUNT",
      label: "Descuento Grupal",
      description: "Descuento para compras en grupo",
      icon: "group",
    },
  ]

  // Opciones de aplicación
  applyToAll = true
  individualPrices: { [sectionId: string]: number } = {}

  constructor(
    private fb: FormBuilder,
    private ticketService: OrganizationTicketService,
    private dialogRef: MatDialogRef<PriceUpdateDialogComponent>,
     @Inject(MAT_DIALOG_DATA) data: { selectedSections: string[]; ticketGroups: TicketGroup[]},
  ) {
    this.selectedSections = data.selectedSections
    this.ticketGroups = data.ticketGroups

    console.log("PriceUpdateDialog initialized with:", {
      selectedSections: this.selectedSections,
      ticketGroups: this.ticketGroups,
    })

    this.priceForm = this.fb.group({
      newPrice: [0, [Validators.required, Validators.min(0.01)]],
      modificationType: ["EARLY_BIRD", Validators.required],
      validFrom: [new Date(), Validators.required],
      validUntil: [new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), Validators.required], // 7 días por defecto
      applyToAll: [true],
    })

    // Inicializar precios individuales
    this.ticketGroups.forEach((group) => {
      this.individualPrices[group.sectionId] = this.parsePrice(group.currentPrice)
    })
  }

  ngOnInit(): void {
    // Establecer precio promedio como valor inicial
    const averagePrice =
      this.ticketGroups.reduce((sum, group) => sum + this.parsePrice(group.currentPrice), 0) / this.ticketGroups.length

    this.priceForm.patchValue({
      newPrice: Math.round(averagePrice * 0.8), // 20% de descuento por defecto
    })

    // Suscribirse a cambios en applyToAll
    this.priceForm.get("applyToAll")?.valueChanges.subscribe((value) => {
      this.applyToAll = value
      if (value) {
        // Si se aplica a todos, actualizar precios individuales con el precio general
        const generalPrice = this.priceForm.get("newPrice")?.value || 0
        this.ticketGroups.forEach((group) => {
          this.individualPrices[group.sectionId] = generalPrice
        })
      }
    })

    // Suscribirse a cambios en el precio general
    this.priceForm.get("newPrice")?.valueChanges.subscribe((value) => {
      if (this.applyToAll && value) {
        this.ticketGroups.forEach((group) => {
          this.individualPrices[group.sectionId] = value
        })
      }
    })
  }

  // Método helper para convertir string a número
  parsePrice(priceString: string): number {
    return Number.parseFloat(priceString) || 0
  }

  onSubmit(): void {
    if (this.priceForm.valid) {
      const formValue = this.priceForm.value

      const priceUpdates: PriceUpdateRequest[] = this.ticketGroups.map((group) => ({
        sectionId: group.sectionId,
        price: this.applyToAll ? formValue.newPrice : this.individualPrices[group.sectionId],
        modificationType: formValue.modificationType,
        validFrom: this.ticketService.formatDateForBackend(formValue.validFrom),
        validUntil: this.ticketService.formatDateForBackend(formValue.validUntil),
      }))

      console.log("Submitting price updates:", priceUpdates)
      this.dialogRef.close(priceUpdates)
    }
  }

  onCancel(): void {
    this.dialogRef.close()
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(amount)
  }

  calculateDiscount(sectionId?: string): number {
    let newPrice: number
    let originalPrice: number

    if (sectionId) {
      // Calcular descuento para una sección específica
      const group = this.ticketGroups.find((g) => g.sectionId === sectionId)
      if (!group) return 0

      newPrice = this.individualPrices[sectionId] || 0
      originalPrice = this.parsePrice(group.originalPrice)
    } else {
      // Calcular descuento promedio
      newPrice = this.priceForm.get("newPrice")?.value || 0
      const averageOriginalPrice =
        this.ticketGroups.reduce((sum, group) => sum + this.parsePrice(group.originalPrice), 0) /
        this.ticketGroups.length
      originalPrice = averageOriginalPrice
    }

    if (originalPrice === 0) return 0

    return Math.round(((originalPrice - newPrice) / originalPrice) * 100)
  }

  getTotalRevenueDifference(): number {
    let currentRevenue = 0
    let newRevenue = 0

    this.ticketGroups.forEach((group) => {
      const currentPrice = this.parsePrice(group.currentPrice)
      const newPrice = this.applyToAll
        ? this.priceForm.get("newPrice")?.value || 0
        : this.individualPrices[group.sectionId] || 0

      currentRevenue += currentPrice * group.availableTickets
      newRevenue += newPrice * group.availableTickets
    })

    return newRevenue - currentRevenue
  }

  onIndividualPriceChange(sectionId: string, price: number): void {
    this.individualPrices[sectionId] = price
  }

  getPromotionTypeInfo(type: string) {
    return this.promotionTypes.find((p) => p.value === type)
  }

  // Método helper para obtener el precio actual de una sección como número
  getCurrentPriceAsNumber(group: TicketGroup): number {
    return this.parsePrice(group.currentPrice)
  }

  // Método helper para obtener el precio individual o general
  getNewPriceForSection(sectionId: string): number {
    return this.applyToAll ? this.priceForm.get("newPrice")?.value || 0 : this.individualPrices[sectionId] || 0
  }
}
