export interface GetAllEventsResponse {
    statusCode: number;
    data:       DatumEventsAll[];
    message:    string;
    metadata:   Metadata;
}

export interface DatumEventsAll {
    id:            string;
    tenantId:      string;
    title:         string;
    description:   string;
    image_event:   string;
    image_section: null | string;
    start_date:    Date;
    end_date:      Date;
    address:       string;
    is_active:     boolean;
    created_at:    Date;
    updated_at:    Date;
    faculty:       Faculty;
    sections:      Section[];
}

export interface Faculty {
    id:         string;
    tenantId:   string;
    name:       string;
    location:   string;
    is_active:  boolean;
    created_at: Date;
    updated_at: Date;
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
    page:  string;
    limit: string;
    pages: number;
}


export interface GetByIDEventResponse {
    statusCode: number;
    data:       Data;
    message:    string;
    metadata:   Metadata;
}

export interface Data {
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
    faculty:       Faculty;
    sections:      Section[];
}

export interface Faculty {
    id:         string;
    tenantId:   string;
    name:       string;
    location:   string;
    is_active:  boolean;
    created_at: Date;
    updated_at: Date;
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
    timestamp: string;
    version:   string;
}
