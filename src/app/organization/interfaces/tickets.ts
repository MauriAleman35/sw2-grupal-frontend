export interface TicketsResponse {
  statusCode: number
  data: Datum[]
  message: string
  metadata: Metadata
}

export interface Datum {
  id: string
  tenantId: string
  date: Date
  price: string
  originalPrice: string
  modificationType: PriceModificationType | null
  validFrom: string | null
  validUntil: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
  section: Section
}

export interface Section {
  id: string
  tenantId: string
  name: string
  description: string
  capacity: number
  price: string
  is_active: boolean
  created_at: Date
  updated_at: Date
  event: Event
}

export interface Event {
  id: string
  tenantId: string
  title: string
  description: string
  image_event: string
  image_section: string
  start_date: Date
  end_date: Date
  address: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Metadata {
  timestamp: string
  version: string
  pagination: Pagination
}

export interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

// NUEVAS INTERFACES PARA PAGINACIÓN
export interface PaginationParams {
  page: number
  limit: number
  search?: string
  eventId?: string
  priceFilter?: string
  statusFilter?: string
}

export interface PaginatedTicketsResponse {
  tickets: TicketGroup[]
  pagination: Pagination
  totalStats: TicketStatistics
}

export interface TicketStatistics {
  totalTickets: number
  soldTickets: number
  availableTickets: number
  totalRevenue: number
  averagePrice: number
  eventsCount: number
  sectionsCount: number
}

export interface TicketsBySectionResponse {
  statusCode: number
  data: DatumTicketsBySection[]
  message: string
  metadata: Metadata
}

export interface DatumTicketsBySection {
  id: string
  tenantId: string
  date: Date
  price: string
  originalPrice: string
  modificationType: PriceModificationType | null
  validFrom: string | null
  validUntil: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
  ticketPurchases: any[]
}

export interface GetByIDTicketResponse {
  statusCode: number
  data: Data
  message: string
  metadata: Metadata
}

export interface Data {
  id: string
  tenantId: string
  date: Date
  price: string
  originalPrice: string
  modificationType: PriceModificationType | null
  validFrom: string | null
  validUntil: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
  section: Section
}

export interface TicketGroup {
  sectionId: string
  sectionName: string
  sectionDescription: string
  eventTitle: string
  eventId: string
  totalTickets: number
  availableTickets: number
  soldTickets: number
  currentPrice: string
  originalPrice: string
  modificationType: PriceModificationType | null
  validFrom: string | null
  validUntil: string | null
  hasActivePromotion: boolean
  section: Section
}

export interface PriceUpdateRequest {
  sectionId: string
  price: number
  modificationType: string
  validFrom: string
  validUntil: string
}

export enum PriceModificationType {
  PRESALE = "PRESALE",
  REGULAR_SALE = "REGULAR_SALE",
  DISCOUNT = "DISCOUNT",
  PROMOTION = "PROMOTION",
  SPECIAL_OFFER = "SPECIAL_OFFER",
  GROUP_DISCOUNT = "GROUP_DISCOUNT",
  EARLY_BIRD = "EARLY_BIRD",
}
// Actualizar la interfaz TicketsBySectionResponse para incluir estadísticas
export interface TicketsBySectionResponse {
  statusCode: number;
  data: DatumTicketsBySection[];
  message: string;
  metadata: Metadata;
  // Añadir estadísticas (opcional)
  ticketStats?: {
    totalUniqueTypes: number;
    totalRealTickets: number;
    activeTickets: number;
    inactiveTickets: number;
  };
}

// Actualizar la interfaz DatumTicketsBySection para incluir campos de agrupamiento
export interface DatumTicketsBySection {
  id: string;
  tenantId: string;
  date: Date;
  price: string;
  originalPrice: string;
  modificationType: PriceModificationType | null;
  validFrom: string | null;
  validUntil: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  ticketPurchases: any[];
  // Campos adicionales para agrupamiento
  _count?: number;  // Cantidad de tickets en este grupo
  _ticketIds?: string[];  // IDs de los tickets agrupados
}

// Actualizar la interfaz TicketGroup para incluir campos de agrupamiento
export interface TicketGroup {
  sectionId: string;
  sectionName: string;
  sectionDescription: string;
  eventTitle: string;
  eventId: string;
  totalTickets: number;
  availableTickets: number;
  soldTickets: number;
  currentPrice: string;
  originalPrice: string;
  modificationType: PriceModificationType | null;
  validFrom: string | null;
  validUntil: string | null;
  hasActivePromotion: boolean;
  section: Section;
  // Campos adicionales para agrupamiento
  _count?: number;
  _ticketIds?: string[];
}