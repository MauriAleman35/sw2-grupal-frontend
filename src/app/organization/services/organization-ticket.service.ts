import { Injectable } from "@angular/core";
import { HttpClient, HttpContext, HttpParams } from "@angular/common/http";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { map, tap, catchError } from "rxjs/operators";

import { environment } from "../../environments/environments";
import {
  Datum,
  DatumTicketsBySection,
  TicketGroup,
  TicketsBySectionResponse,
  TicketsResponse,
  PriceUpdateRequest,
  PaginationParams,
  PaginatedTicketsResponse,
  TicketStatistics,
} from "../interfaces/tickets";
import { USE_TENANT_TOKEN } from "../../context/tenant-token.context";
import { GetByIDResponse } from "../interfaces/section";

@Injectable({
  providedIn: "root",
})
export class OrganizationTicketService {
  private apiUrl = `${environment.apiUrl}/ticket`;

  // BehaviorSubjects para manejar estado
  private ticketsBySectionSubject = new BehaviorSubject<DatumTicketsBySection[]>([]);
  public ticketsBySection$ = this.ticketsBySectionSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private paginatedTicketsSubject = new BehaviorSubject<PaginatedTicketsResponse>({
    tickets: [],
    pagination: { total: 0, page: 1, limit: 10, pages: 0 },
    totalStats: {
      totalTickets: 0,
      soldTickets: 0,
      availableTickets: 0,
      totalRevenue: 0,
      averagePrice: 0,
      eventsCount: 0,
      sectionsCount: 0,
    },
  });
  public paginatedTickets$ = this.paginatedTicketsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // MÉTODO PRINCIPAL CON PAGINACIÓN - CORREGIDO PARA EVITAR ERRORES DE API
  getTicketsPaginated(params: PaginationParams): Observable<PaginatedTicketsResponse> {
    this.loadingSubject.next(true);

    let httpParams = new HttpParams().set("page", params.page.toString()).set("limit", params.limit.toString());

    // Agregar filtros opcionales (excepto eventId que no es aceptado por la API)
    if (params.search && params.search.trim()) {
      httpParams = httpParams.set("search", params.search.trim());
    }
    // IMPORTANTE: No incluimos eventId como parámetro HTTP
    if (params.priceFilter && params.priceFilter !== "all") {
      httpParams = httpParams.set("priceFilter", params.priceFilter);
    }
    if (params.statusFilter && params.statusFilter !== "all") {
      httpParams = httpParams.set("statusFilter", params.statusFilter);
    }

    return this.http
      .get<TicketsResponse>(this.apiUrl, {
        context: new HttpContext().set(USE_TENANT_TOKEN, true),
        params: httpParams,
      })
      .pipe(
        map((response) => {
          console.log("API Response:", response);

          if (response.statusCode === 200) {
            // Filtrar por eventId si es necesario (en el cliente)
            let filteredData = response.data;
            if (params.eventId && params.eventId !== "all") {
              filteredData = response.data.filter(
                (ticket) => ticket.section.event.id === params.eventId
              );
            }

            // Agrupar tickets por sección
            const groupedTickets = this.groupTicketsBySection(filteredData);

            // Calcular estadísticas
            const stats = this.calculateStatistics(filteredData, groupedTickets);

            const result: PaginatedTicketsResponse = {
              tickets: groupedTickets,
              // Si se filtró por evento, ajustar la paginación
              pagination: params.eventId && params.eventId !== "all" 
                ? {
                    total: groupedTickets.length,
                    page: params.page,
                    limit: params.limit,
                    pages: Math.ceil(groupedTickets.length / params.limit)
                  }
                : response.metadata.pagination,
              totalStats: stats,
            };

            this.paginatedTicketsSubject.next(result);
            this.loadingSubject.next(false);

            return result;
          }

          this.loadingSubject.next(false);
          throw new Error("Error loading tickets");
        }),
        catchError((error) => {
          console.error("Error in getTicketsPaginated:", error);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  // NUEVO MÉTODO: Específico para obtener secciones por evento
  getEventSectionsAndTickets(eventId: string, page = 1, limit = 10, search = ""): Observable<PaginatedTicketsResponse> {
    this.loadingSubject.next(true);
    
    // Usamos un enfoque en 2 pasos para superar las limitaciones de la API:
    
    // 1. Obtenemos todos los tickets con un límite grande para poder filtrar por evento
    return this.http
      .get<TicketsResponse>(this.apiUrl, {
        context: new HttpContext().set(USE_TENANT_TOKEN, true),
        params: new HttpParams()
          .set("page", "1")
          .set("limit", "500") // Un número razonable pero suficientemente grande
      })
      .pipe(
        map((response) => {
          if (response.statusCode === 200) {
            // 2. Filtramos los tickets que pertenecen al evento solicitado
            const filteredData = response.data.filter(
              ticket => ticket.section.event.id === eventId
            );
            
            // Filtrar por búsqueda si es necesario
            const searchFiltered = search 
              ? filteredData.filter(ticket => 
                  ticket.section.name.toLowerCase().includes(search.toLowerCase()) ||
                  ticket.section.event.title.toLowerCase().includes(search.toLowerCase())
                )
              : filteredData;
            
            // Agrupar por sección
            const groupedTickets = this.groupTicketsBySection(searchFiltered);
            
            // Aplicar paginación manual
            const startIndex = (page - 1) * limit;
            const paginatedTickets = groupedTickets.slice(startIndex, startIndex + limit);
            
            // Calcular estadísticas
            const stats = this.calculateStatistics(searchFiltered, groupedTickets);
            
            const result: PaginatedTicketsResponse = {
              tickets: paginatedTickets,
              pagination: {
                total: groupedTickets.length,
                page: page,
                limit: limit,
                pages: Math.ceil(groupedTickets.length / limit)
              },
              totalStats: stats
            };
            
            this.loadingSubject.next(false);
            return result;
          }
          
          this.loadingSubject.next(false);
          throw new Error("Error loading tickets");
        }),
        catchError((error) => {
          console.error("Error loading event sections:", error);
          this.loadingSubject.next(false);
          return of({
            tickets: [],
            pagination: { total: 0, page: 1, limit: 10, pages: 0 },
            totalStats: {
              totalTickets: 0,
              soldTickets: 0,
              availableTickets: 0,
              totalRevenue: 0,
              averagePrice: 0,
              eventsCount: 0,
              sectionsCount: 0,
            }
          });
        })
      );
  }

  // Método legacy para compatibilidad
  getTickets(): Observable<TicketsResponse> {
    return this.http.get<TicketsResponse>(this.apiUrl, {
      context: new HttpContext().set(USE_TENANT_TOKEN, true),
    });
  }

  getTicketsBySection(force = false): Observable<TicketsBySectionResponse> {
    this.loadingSubject.next(true);
    return this.http
      .get<TicketsBySectionResponse>(`${this.apiUrl}/section`, {
        context: new HttpContext().set(USE_TENANT_TOKEN, true),
      })
      .pipe(
        map((response) => {
          if (response.statusCode === 200) {
            this.ticketsBySectionSubject.next(response.data);
          }
          this.loadingSubject.next(false);
          return response;
        }),
      );
  }

  // Método para obtener tickets de una sección específica
  getTicketsBySectionId(sectionId: string, page = 1, limit = 10): Observable<TicketsBySectionResponse> {
    this.loadingSubject.next(true);
    
    let httpParams = new HttpParams()
      .set("page", page.toString())
      .set("limit", limit.toString());
      
    return this.http
      .get<TicketsBySectionResponse>(`${this.apiUrl}/section/${sectionId}`, {
        context: new HttpContext().set(USE_TENANT_TOKEN, true),
        params: httpParams
      })
      .pipe(
        map((response) => {
          this.loadingSubject.next(false);
          return response;
        }),
        catchError((error) => {
          this.loadingSubject.next(false);
          console.error(`Error retrieving tickets for section ${sectionId}:`, error);
          return throwError(() => error);
        })
      );
  }

  getTicketById(ticketId: string): Observable<GetByIDResponse> {
    return this.http.get<GetByIDResponse>(`${this.apiUrl}/${ticketId}`, {
      context: new HttpContext().set(USE_TENANT_TOKEN, true),
    });
  }
// Modificar para actualizar una sola sección a la vez
updateTicketPrice(priceUpdate: PriceUpdateRequest, page = 1, limit = 10): Observable<any> {
  console.log("Sending price update to backend:", priceUpdate);
  
  // Agrega los parámetros de consulta page y limit
  const params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());
  
  return this.http.post(`${this.apiUrl}/bulk/price-update`, priceUpdate, {
    context: new HttpContext().set(USE_TENANT_TOKEN, true),
    params: params
  });
}
 // Método para procesar múltiples actualizaciones de manera secuencial
updateTicketPrices(priceUpdates: PriceUpdateRequest[], page = 1, limit = 10): Observable<any> {
  if (priceUpdates.length === 0) {
    return of({ success: true });
  }
  
  
  return this.updateTicketPrice(priceUpdates[0], page, limit);
}

  restoreOriginalPrices(sectionIds: string[],page = 1, limit = 10): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/bulk/restore-prices`,
      { sectionIds ,page, limit },
      {
        context: new HttpContext().set(USE_TENANT_TOKEN, true),
      },
    );
  }

  getTicketStatistics(tenantId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics/${tenantId}`, {
      context: new HttpContext().set(USE_TENANT_TOKEN, true),
    });
  }

  // MÉTODO MEJORADO PARA AGRUPAR TICKETS
  groupTicketsBySection(tickets: Datum[]): TicketGroup[] {
    console.log("Grouping tickets:", tickets.length, "tickets");

    if (!tickets || tickets.length === 0) {
      console.log("No tickets to group");
      return [];
    }

    const groupedMap = new Map<string, TicketGroup>();

    tickets.forEach((ticket) => {
      const sectionId = ticket.section.id;
      const eventId = ticket.section.event.id;
      const groupKey = `${sectionId}-${eventId}`;

      if (!groupedMap.has(groupKey)) {
        // Para la paginación, necesitamos calcular basado en los datos disponibles
        // En lugar de filtrar todos los tickets, usamos la capacidad de la sección
        const totalTickets = ticket.section.capacity;

        // Contar tickets en esta página que pertenecen a esta sección
        const sectionTicketsInPage = tickets.filter((t) => t.section.id === sectionId && t.section.event.id === eventId);

        // Para estadísticas más precisas, necesitaríamos una llamada separada al backend
        // Por ahora, estimamos basado en los datos disponibles
        const soldTicketsInPage = sectionTicketsInPage.filter((t) => !t.is_active).length;
        const availableTicketsInPage = sectionTicketsInPage.filter((t) => t.is_active).length;

        // Determinar si hay promoción activa
        const hasActivePromotion = ticket.modificationType !== null && this.isPromotionActive(ticket);

        const ticketGroup: TicketGroup = {
          sectionId: ticket.section.id,
          sectionName: ticket.section.name,
          sectionDescription: ticket.section.description || "",
          eventTitle: ticket.section.event.title,
          eventId: ticket.section.event.id,
          totalTickets,
          availableTickets: availableTicketsInPage, // Esto es una estimación
          soldTickets: soldTicketsInPage, // Esto es una estimación
          currentPrice: ticket.price,
          originalPrice: ticket.originalPrice || ticket.price,
          modificationType: ticket.modificationType,
          validFrom: ticket.validFrom,
          validUntil: ticket.validUntil,
          hasActivePromotion,
          section: ticket.section,
        };

        groupedMap.set(groupKey, ticketGroup);
      }
    });

    const result = Array.from(groupedMap.values());
    console.log("Grouped tickets result:", result.length, "groups");
    return result;
  }

  // Método para calcular estadísticas
  private calculateStatistics(tickets: Datum[], groups: TicketGroup[]): TicketStatistics {
    const uniqueEvents = new Set(tickets.map((t) => t.section.event.id));
    const uniqueSections = new Set(tickets.map((t) => t.section.id));

    return {
      totalTickets: groups.reduce((sum, group) => sum + group.totalTickets, 0),
      soldTickets: groups.reduce((sum, group) => sum + group.soldTickets, 0),
      availableTickets: groups.reduce((sum, group) => sum + group.availableTickets, 0),
      totalRevenue: groups.reduce((sum, group) => {
        const price = Number.parseFloat(group.currentPrice) || 0;
        return sum + price * group.soldTickets;
      }, 0),
      averagePrice:
        groups.length > 0
          ? groups.reduce((sum, group) => sum + (Number.parseFloat(group.currentPrice) || 0), 0) / groups.length
          : 0,
      eventsCount: uniqueEvents.size,
      sectionsCount: uniqueSections.size,
    };
  }

  // Método para verificar si una promoción está activa
  private isPromotionActive(ticket: Datum): boolean {
    if (!ticket.validFrom || !ticket.validUntil) {
      return ticket.modificationType !== null;
    }

    const now = new Date();
    const validFrom = new Date(ticket.validFrom);
    const validUntil = new Date(ticket.validUntil);

    return now >= validFrom && now <= validUntil;
  }

  formatDateForBackend(date: Date): string {
    const offset = date.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offset) / 60);
    const offsetMinutes = Math.abs(offset) % 60;
    const offsetSign = offset <= 0 ? "+" : "-";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const offsetString = `${offsetSign}${String(offsetHours).padStart(2, "0")}:${String(offsetMinutes).padStart(2, "0")}`;

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetString}`;
  }

  // Método para obtener eventos únicos (necesitará una llamada separada para ser preciso)
  getUniqueEvents(tickets: Datum[]): Array<{ id: string; title: string; ticketCount: number }> {
    const eventMap = new Map<string, { id: string; title: string; ticketCount: number }>();

    tickets.forEach((ticket) => {
      const event = ticket.section.event;
      if (!eventMap.has(event.id)) {
        eventMap.set(event.id, {
          id: event.id,
          title: event.title,
          ticketCount: 0,
        });
      }
      eventMap.get(event.id)!.ticketCount++;
    });

    return Array.from(eventMap.values()).sort((a, b) => a.title.localeCompare(b.title));
  }

  // Método para obtener todos los eventos (para filtros)
  getAllEvents(): Observable<Array<{ id: string; title: string; ticketCount: number }>> {
    return this.http
      .get<any>(`${environment.apiUrl}/event`, {
        context: new HttpContext().set(USE_TENANT_TOKEN, true),
      })
      .pipe(
        map((response) => {
          if (response.statusCode === 200) {
            return response.data.map((event: any) => ({
              id: event.id,
              title: event.title,
              ticketCount: 0, // Se actualizará con datos reales
            }));
          }
          return [];
        }),
        catchError(error => {
          console.error("Error loading events:", error);
          return of([]);
        })
      );
  }
}