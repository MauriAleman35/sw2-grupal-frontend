export interface GetTicketByUserResponse {
    statusCode: number;
    data:       Datum[];
    message:    string;
    metadata:   Metadata;
}

export interface Datum {
    id:              string;
    tenantId:        string;
    total:           string;
    status:          DatumStatus;
    observations:    null;
    date:            Date;
    created_at:      Date;
    updated_at:      Date;
    payment:         Payment;
    ticketPurchases: TicketPurchase[];
    tenant:          Tenant;
}

export interface Payment {
    id:                    string;
    tenantId:              string;
    amount:                string;
    method:                Method;
    status:                PaymentStatus;
    payment_date:          Date | null;
    transaction_id:        string;
    stripePaymentIntentId: null | string;
    stripeCustomerId:      null;
    created_at:            Date;
    updated_at:            Date;
}

export enum Method {
    Card = "card",
}

export enum PaymentStatus {
    Completed = "completed",
    Failed = "failed",
    Pending = "pending",
}

export enum DatumStatus {
    Cancelled = "cancelled",
    Paid = "paid",
}

export interface Tenant {
    id:           string;
    name:         Name;
    display_name: DisplayName;
    logo_url:     null;
    is_active:    boolean;
    created_at:   Date;
    updated_at:   Date;
}

export enum DisplayName {
    MiTenantParaMoiso = "Mi tenant para moiso",
}

export enum Name {
    UnidadMoisoUagrmEdu = "unidad.moiso.uagrm.edu",
}

export interface TicketPurchase {
    id:           string;
    tenantId:     string;
    quantity:     number;
    price:        string;
    subtotal:     string;
    system_fee:   string;
    validated_at: null;
    is_used:      boolean;
    status:       boolean;
    created_at:   Date;
    updated_at:   Date;
    ticket:       Ticket;
    qrCodeUrl?:   string;
}

export interface Ticket {
    id:               string;
    tenantId:         string;
    date:             Date;
    price:            string;
    originalPrice:    string;
    modificationType: null | string;
    validFrom:        Date | null;
    validUntil:       Date | null;
    is_active:        boolean;
    created_at:       Date;
    updated_at:       Date;
    section:          Section;
}

export interface Section {
    id:          string;
    tenantId:    string;
    name:        string;
    description: string;
    capacity:    number;
    price:       string;
    is_active:   boolean;
    created_at:  Date;
    updated_at:  Date;
    event:       Event;
}

export interface Event {
    id:            string;
    tenantId:      string;
    title:         string;
    description:   string;
    image_event:   string;
    image_section: string;
    start_date:    Date;
    end_date:      Date;
    address:       string;
    is_active:     boolean;
    created_at:    Date;
    updated_at:    Date;
}



export interface Metadata {
    timestamp:  string;
    version:    string;
    pagination: Pagination;
}

export interface Pagination {
    total: number;
    page:  number;
    limit: number;
    pages: number;
}
