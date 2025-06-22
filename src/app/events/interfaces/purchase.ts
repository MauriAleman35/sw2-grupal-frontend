export interface GetPurchaseByUserResponse {
    statusCode: number;
    data:       any[];
    message:    string;
    metadata:   Metadata;
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


export interface GetPurcharseByUserResponse {
    statusCode: number;
    data:       Datum[];
    message:    string;
    metadata:   Metadata;
}

export interface Datum {
    id:              string;
    tenantId:        string;
    total:           string;
    status:          string;
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
    method:                string;
    status:                string;
    payment_date:          Date;
    transaction_id:        string;
    stripePaymentIntentId: string;
    stripeCustomerId:      null;
    created_at:            Date;
    updated_at:            Date;
}

export interface Tenant {
    id:           string;
    name:         string;
    display_name: string;
    logo_url:     null;
    is_active:    boolean;
    created_at:   Date;
    updated_at:   Date;
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
    qrCodeUrl:    string;
}

export interface Ticket {
    id:               string;
    tenantId:         string;
    date:             Date;
    price:            string;
    originalPrice:    string;
    modificationType: null;
    validFrom:        null;
    validUntil:       null;
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


export interface PostPurchaseResponse {
    statusCode: number;
    data:       Data;
    message:    string;
    metadata:   Metadata;
}

export interface Data {
    id:              string;
    total:           number;
    status:          string;
    created_at:      Date;
    ticketPurchases: TicketPurchase[];
}



export interface Purchase {
    id: string;
}

export interface Metadata {
    timestamp: string;
    version:   string;
}


export interface PostPurchaseParam {
    items: Item[];
}

export interface Item {
    sectionId: string;
    quantity:  number;
}

export interface PostPurchaseByIDResponse {
    statusCode: number;
    data:       Data;
    message:    string;
    metadata:   Metadata;
}

export interface Data {
    tenantId:              string;
    amount:                string;
    method:                string;
    status:                string;
    transaction_id:        string;
    purchase:              Purchase;
    payment_date:          null;
    stripePaymentIntentId: null;
    stripeCustomerId:      null;
    id:                    string;
    created_at:            Date;
    updated_at:            Date;
    checkoutUrl:           string;
}

export interface Purchase {
    id: string;
}

export interface Metadata {
    timestamp: string;
    version:   string;
}
export interface VerifyPaymentResponse {
    statusCode: number;
    data:       Data;
    message:    string;
    metadata:   VerifyPaymentResponseMetadata;
}


export interface Purchase {
    id:           string;
    tenantId:     string;
    total:        string;
    status:       string;
    observations: null;
    date:         Date;
    created_at:   Date;
    updated_at:   Date;
}

export interface StripePaymentIntentID {
    id:                                   string;
    object:                               string;
    amount:                               number;
    amount_capturable:                    number;
    amount_details:                       AmountDetails;
    amount_received:                      number;
    application:                          null;
    application_fee_amount:               null;
    automatic_payment_methods:            null;
    canceled_at:                          null;
    cancellation_reason:                  null;
    capture_method:                       string;
    client_secret:                        string;
    confirmation_method:                  string;
    created:                              number;
    currency:                             string;
    customer:                             null;
    description:                          null;
    last_payment_error:                   null;
    latest_charge:                        string;
    livemode:                             boolean;
    metadata:                             TipClass;
    next_action:                          null;
    on_behalf_of:                         null;
    payment_method:                       string;
    payment_method_configuration_details: null;
    payment_method_options:               PaymentMethodOptions;
    payment_method_types:                 string[];
    processing:                           null;
    receipt_email:                        null;
    review:                               null;
    setup_future_usage:                   null;
    shipping:                             null;
    source:                               null;
    statement_descriptor:                 null;
    statement_descriptor_suffix:          null;
    status:                               string;
    transfer_data:                        null;
    transfer_group:                       null;
}

export interface AmountDetails {
    tip: TipClass;
}

export interface TipClass {
}

export interface PaymentMethodOptions {
    card: Card;
}

export interface Card {
    installments:           null;
    mandate_options:        null;
    network:                null;
    request_three_d_secure: string;
}

export interface VerifyPaymentResponseMetadata {
    timestamp: string;
    version:   string;
}
