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

 // Método mejorado para obtener tickets por sección con agrupamiento más preciso
getTicketsBySectionId(sectionId: string, page = 1, limit = 10): Observable<TicketsBySectionResponse> {
  this.loadingSubject.next(true);
  
  let httpParams = new HttpParams()
    .set("page", "1")  // Pedimos todos los tickets de la primera página
    .set("limit", "1000");  // Un límite alto para obtener más tickets
    
  return this.http
    .get<TicketsBySectionResponse>(`${this.apiUrl}/section/${sectionId}`, {
      context: new HttpContext().set(USE_TENANT_TOKEN, true),
      params: httpParams
    })
    .pipe(
      map((response) => {
        if (response.statusCode === 200) {
          console.log(`Recibidos ${response.data.length} tickets para sección ${sectionId}`);
          
          // Agrupar tickets por características únicas usando el método mejorado
          const uniqueTickets = this.groupTicketsByUniqueProperties(response.data);
          console.log(`Agrupados en ${uniqueTickets.length} tipos de tickets únicos`);
          
          // Calcular el total real de tickets (contando duplicados)
          const totalRealTickets = response.data.length;
          
          // Aplicar paginación manual a los tickets agrupados
          const startIndex = (page - 1) * limit;
          const paginatedUniqueTickets = uniqueTickets.slice(startIndex, startIndex + limit);
          
          // Crear respuesta modificada con tickets agrupados y paginados
          const modifiedResponse: TicketsBySectionResponse = {
            ...response,
            data: paginatedUniqueTickets,
            metadata: {
              ...response.metadata,
              pagination: {
                total: uniqueTickets.length,  // Total de tipos únicos
                page: page,
                limit: limit,
                pages: Math.ceil(uniqueTickets.length / limit)
              }
            },
            // Añadir información sobre total real y total agrupado
            ticketStats: {
              totalUniqueTypes: uniqueTickets.length,
              totalRealTickets: totalRealTickets,
              activeTickets: response.data.filter(t => t.is_active).length,
              inactiveTickets: response.data.filter(t => !t.is_active).length
            }
          };
          
          this.loadingSubject.next(false);
          return modifiedResponse;
        }
        
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

// Nuevo método mejorado para agrupar tickets con criterios más específicos
private groupTicketsByUniqueProperties(tickets: DatumTicketsBySection[]): DatumTicketsBySection[] {
  if (!tickets || tickets.length === 0) return [];
  
  // Primero, agrupamos los tickets con el mismo ID (para asegurarnos de no duplicar)
  const ticketsById = this.groupTicketsByIds(tickets);
  
  // Ahora agrupamos por propiedades únicas más específicas
  const result: DatumTicketsBySection[] = [];
  const processedKeys = new Set<string>();
  
  ticketsById.forEach(ticket => {
    // Verificar si este ticket ya fue incluido en un grupo
    let found = false;
    
    // Comparar este ticket con cada grupo ya existente
    for (const existingTicket of result) {
      // Usar la comparación mejorada para determinar si los tickets son realmente iguales
      if (this.areTicketsEqual(ticket, existingTicket)) {
        // Son el mismo tipo de ticket, incrementar contador
        existingTicket._count = (existingTicket._count || 1) + 1;
        existingTicket._ticketIds = [...(existingTicket._ticketIds || []), ticket.id];
        found = true;
        break;
      }
    }
    
    // Si no se encontró en ningún grupo, crear uno nuevo
    if (!found) {
      result.push({
        ...ticket,
        _count: 1,
        _ticketIds: [ticket.id]
      });
    }
  });
  
  console.log(`Agrupamiento mejorado: ${tickets.length} tickets -> ${result.length} tipos únicos`);
  return result;
}

// Método para agrupar tickets por IDs (eliminar duplicados exactos)
private groupTicketsByIds(tickets: DatumTicketsBySection[]): DatumTicketsBySection[] {
  const uniqueTicketsMap: { [key: string]: DatumTicketsBySection } = {};
  
  tickets.forEach(ticket => {
    if (!uniqueTicketsMap[ticket.id]) {
      uniqueTicketsMap[ticket.id] = ticket;
    }
  });
  
  return Object.values(uniqueTicketsMap);
}
  // Método para agrupar tickets por propiedades únicas
 private groupUniqueTicketsByProperties(tickets: DatumTicketsBySection[]): DatumTicketsBySection[] {
  if (!tickets || tickets.length === 0) return [];
  
  // Mapa para agrupar tickets con propiedades similares
  const uniqueTicketsMap: { [key: string]: DatumTicketsBySection & { _count?: number, _ticketIds?: string[] } } = {};
  
  tickets.forEach(ticket => {
    // Crear una clave única más específica para diferenciar correctamente los tickets
    const uniqueKey = this.createMoreSpecificUniqueTicketKey(ticket);
    
    if (!uniqueTicketsMap[uniqueKey]) {
      // Si es el primer ticket de este tipo, lo agregamos al mapa
      uniqueTicketsMap[uniqueKey] = {
        ...ticket,
        // Añadir campos para conteo y tracking
        _count: 1,
        _ticketIds: [ticket.id]
      };
    } else {
      // Si ya existe un ticket similar, incrementamos el contador
      uniqueTicketsMap[uniqueKey]._count = (uniqueTicketsMap[uniqueKey]._count || 1) + 1;
      // Añadir este ID a la lista de IDs agrupados
      uniqueTicketsMap[uniqueKey]._ticketIds?.push(ticket.id);
    }
  });
  
  // Convertir el mapa a un array
  return Object.values(uniqueTicketsMap);
}

// Método mejorado para crear una clave única más específica
private createMoreSpecificUniqueTicketKey(ticket: DatumTicketsBySection): string {
  // Combinar propiedades que hacen único a un tipo de ticket
  // Añadir más propiedades para hacer la clave más específica
  return [
    ticket.price,
    ticket.originalPrice,
    ticket.modificationType || 'none',
    ticket.is_active ? 'active' : 'inactive',
    ticket.validFrom || 'no-start',
    ticket.validUntil || 'no-end',
    // Añadir más propiedades para distinguir mejor los tickets
    ticket.date ? new Date(ticket.date).toISOString().split('T')[0] : 'no-date', // Incluir solo la fecha (sin hora)
    // Si hay otros campos que podrían diferenciar los tickets, añadirlos aquí
  ].join('|');  // Usar un separador más claro
}
  
  // Método para crear una clave única para cada tipo de ticket
  private createUniqueTicketKey(ticket: DatumTicketsBySection): string {
    // Combinar propiedades que hacen único a un tipo de ticket
    return [
      ticket.price,
      ticket.originalPrice,
      ticket.modificationType || 'none',
      ticket.is_active ? 'active' : 'inactive',
      ticket.validFrom || 'no-start',
      ticket.validUntil || 'no-end'
    ].join('-');
  }

  getTicketById(ticketId: string): Observable<GetByIDResponse> {
    return this.http.get<GetByIDResponse>(`${this.apiUrl}/${ticketId}`, {
      context: new HttpContext().set(USE_TENANT_TOKEN, true),
    });
  }
  // Añadir este método al servicio para verificar si dos tickets son realmente iguales
private areTicketsEqual(ticket1: DatumTicketsBySection, ticket2: DatumTicketsBySection): boolean {
  // Verificación más estricta de igualdad entre tickets
  return (
    ticket1.price === ticket2.price &&
    ticket1.originalPrice === ticket2.originalPrice &&
    ticket1.modificationType === ticket2.modificationType &&
    ticket1.is_active === ticket2.is_active &&
    ticket1.validFrom === ticket2.validFrom &&
    ticket1.validUntil === ticket2.validUntil &&
    // Comparar solo las fechas (sin la hora)
    this.getSameDatePart(ticket1.date) === this.getSameDatePart(ticket2.date) &&
    // Otras propiedades específicas que puedan diferenciar los tickets
    this.getAdditionalTicketProperties(ticket1) === this.getAdditionalTicketProperties(ticket2)
  );
}

// Método auxiliar para obtener solo la parte de fecha (sin hora)
private getSameDatePart(date: any): string {
  if (!date) return 'no-date';
  return new Date(date).toISOString().split('T')[0];
}

// Método para extraer propiedades adicionales que puedan diferenciar tickets
private getAdditionalTicketProperties(ticket: DatumTicketsBySection): string {
  // Extraer cualquier propiedad adicional que pueda hacer que los tickets sean diferentes
  // Por ejemplo, si tienen alguna propiedad personalizada o metadatos
  const additionalProps = [];
  
  // Ejemplo: si hay alguna propiedad en ticketPurchases que distinga los tickets
  if (ticket.ticketPurchases && ticket.ticketPurchases.length > 0) {
    additionalProps.push('has-purchases');
  }
  
  return additionalProps.join('-');
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

  restoreOriginalPrices(sectionIds: string[], page = 1, limit = 10): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/bulk/restore-prices`,
      { sectionIds, page, limit },
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
          // Añadir información de agrupamiento
          _count: sectionTicketsInPage.length,
          _ticketIds: sectionTicketsInPage.map(t => t.id)
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