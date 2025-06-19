import { Component, Input, Output, EventEmitter, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatChipsModule } from "@angular/material/chips"
import { MatCheckboxModule } from "@angular/material/checkbox"
import { MatProgressBarModule } from "@angular/material/progress-bar"
import { MatTooltipModule } from "@angular/material/tooltip"
import { MatBadgeModule } from "@angular/material/badge"
import { PriceModificationType, type TicketGroup } from "../../../interfaces/tickets"

@Component({
  selector: "app-ticket-card",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatBadgeModule,
  ],
  templateUrl: "./ticket-card.component.html",
  styleUrls: ["./ticket-card.component.css"],
})
export class TicketCardComponent implements OnInit {
  @Input() ticketGroup!: TicketGroup
  @Input() isSelected = false
  @Output() selectionChange = new EventEmitter<boolean>()

  constructor() {}

  ngOnInit(): void {
    // CORREGIDO: Mover el console.log aquí donde los @Input ya están disponibles
    console.log("TicketCardComponent initialized with ticketGroup:", this.ticketGroup)

    // Validar que ticketGroup existe
    if (!this.ticketGroup) {
      console.error("TicketGroup is undefined!")
      return
    }
  }

  onSelectionChange(selected: boolean): void {
    this.selectionChange.emit(selected)
  }

  getOccupancyPercentage(): number {
    if (!this.ticketGroup || this.ticketGroup.totalTickets === 0) return 0
    return Math.round((this.ticketGroup.soldTickets / this.ticketGroup.totalTickets) * 100)
  }

  getOccupancyColor(): string {
    const percentage = this.getOccupancyPercentage()
    if (percentage < 30) return "primary"
    if (percentage < 70) return "accent"
    return "warn"
  }

  // Método helper para convertir string a número de manera segura
  private parsePrice(priceString: string): number {
    if (!priceString) return 0
    return Number.parseFloat(priceString) || 0
  }

  formatCurrency(amount: string): string {
    const numericAmount = this.parsePrice(amount)
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(numericAmount)
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  getPromotionTypeLabel(): string {
    if (!this.ticketGroup?.modificationType) return ""

    switch (this.ticketGroup.modificationType) {
      case PriceModificationType.EARLY_BIRD:
        return "Early Bird"
      case PriceModificationType.PRESALE:
        return "Preventa"
      case PriceModificationType.DISCOUNT:
        return "Descuento"
      case PriceModificationType.PROMOTION:
        return "Promoción"
      case PriceModificationType.SPECIAL_OFFER:
        return "Oferta Especial"
      case PriceModificationType.GROUP_DISCOUNT:
        return "Descuento Grupal"
      case PriceModificationType.REGULAR_SALE:
        return "Precio Regular"
      default:
        return ""
    }
  }

  getPromotionColor(): string {
    if (!this.ticketGroup?.modificationType) return "primary"

    switch (this.ticketGroup.modificationType) {
      case PriceModificationType.EARLY_BIRD:
        return "primary"
      case PriceModificationType.PRESALE:
        return "accent"
      case PriceModificationType.DISCOUNT:
        return "warn"
      case PriceModificationType.PROMOTION:
        return "primary"
      case PriceModificationType.SPECIAL_OFFER:
        return "accent"
      case PriceModificationType.GROUP_DISCOUNT:
        return "warn"
      case PriceModificationType.REGULAR_SALE:
        return "primary"
      default:
        return "primary"
    }
  }

  getPromotionIcon(): string {
    if (!this.ticketGroup?.modificationType) return "local_offer"

    switch (this.ticketGroup.modificationType) {
      case PriceModificationType.EARLY_BIRD:
        return "schedule"
      case PriceModificationType.PRESALE:
        return "preview"
      case PriceModificationType.DISCOUNT:
        return "local_offer"
      case PriceModificationType.PROMOTION:
        return "campaign"
      case PriceModificationType.SPECIAL_OFFER:
        return "star"
      case PriceModificationType.GROUP_DISCOUNT:
        return "group"
      case PriceModificationType.REGULAR_SALE:
        return "sell"
      default:
        return "local_offer"
    }
  }

  isPromotionActive(): boolean {
    if (!this.ticketGroup) return false

    if (!this.ticketGroup.validFrom || !this.ticketGroup.validUntil) {
      return this.ticketGroup.hasActivePromotion
    }

    const now = new Date()
    const validFrom = new Date(this.ticketGroup.validFrom)
    const validUntil = new Date(this.ticketGroup.validUntil)

    return now >= validFrom && now <= validUntil
  }

  // Método para calcular el porcentaje de descuento
  getDiscountPercentage(): number {
    if (!this.ticketGroup || !this.ticketGroup.hasActivePromotion || !this.ticketGroup.originalPrice) {
      return 0
    }

    const originalPrice = this.parsePrice(this.ticketGroup.originalPrice)
    const currentPrice = this.parsePrice(this.ticketGroup.currentPrice)

    if (originalPrice === 0) return 0

    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
  }

  // Método para obtener el estado de disponibilidad
  getAvailabilityStatus(): { label: string; color: string; icon: string } {
    if (!this.ticketGroup) {
      return { label: "Sin datos", color: "warn", icon: "error" }
    }

    const availablePercentage = (this.ticketGroup.availableTickets / this.ticketGroup.totalTickets) * 100

    if (availablePercentage === 0) {
      return { label: "Agotado", color: "warn", icon: "block" }
    } else if (availablePercentage < 10) {
      return { label: "Últimas entradas", color: "warn", icon: "warning" }
    } else if (availablePercentage < 30) {
      return { label: "Pocas disponibles", color: "accent", icon: "info" }
    } else {
      return { label: "Disponible", color: "primary", icon: "check_circle" }
    }
  }

  // Método para formatear números grandes
  formatNumber(num: number): string {
    if (!num) return "0"
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }
}
