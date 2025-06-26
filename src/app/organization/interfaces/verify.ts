export interface VerifyTicketParams {
    purchaseId:    string;
    ticketId:      string;
    ticketSection: string;
    quantity:      number;
    price:         string;
    hash:          string;
    timestamp:     number;
    is_used:       boolean;
    validated_at:  null;
}
export interface VerifyTicketResponse {
    statusCode: number;
    data:       Data;
    message:    string;
    metadata:   Metadata;
}

export interface Data {
    isValid:    boolean;
    message:    string;
    error:      string;
    ticketData: TicketData;
}

export interface TicketData {
    ticketId:    string;
    section:     Section;
    event:       Event;
    validatedAt: Date;
}

export interface Event {
    address: string;
    id:      string;
    date:    Date;
}

export interface Section {
    name: string;
    id:   string;
}

export interface Metadata {
    timestamp: string;
    version:   string;
}
