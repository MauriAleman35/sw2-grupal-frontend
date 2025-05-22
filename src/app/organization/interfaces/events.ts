export interface EventsCreateResponse {
    statusCode: number;
    data:       Data;
    message:    string;
    metadata:   Metadata;
}

export interface Data {
    tenantId:    string;
    title:       string;
    description: string;
    image_url:   string;
    image_section: string;
    start_date:  Date;
    end_date:    Date;
    address:     string;
    faculty:     Faculty;
    tenant:      Tenant;
    id:          string;
    is_active:   boolean;
    created_at:  Date;
    updated_at:  Date;
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

export interface Tenant {
    id:           string;
    name:         string;
    display_name: string;
    logo_url:     null;
    is_active:    boolean;
    created_at:   Date;
    updated_at:   Date;
}

export interface Metadata {
    timestamp: Date;
    version:   string;
}

export interface Event {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  address: string;
  facultyId: string;
  image: File | null;
  imageSection: File | null;
}
export interface EventUpdate {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  address?: string;
  facultyId?: string;
  image?: File | null;
}

export interface EventsResponse {
    statusCode: number;
    data:       DatumEvent[];
    message:    string;
    metadata:   Metadata;
}

export interface DatumEvent {
    id:          string;
    tenantId:    string;
    title:       string;
    description: string;
    image_event: string;
    image_section:   string;
    start_date:  Date;
    end_date:    Date;
    address:     string;
    is_active:   boolean;
    created_at:  Date;
    updated_at:  Date;
    faculty:     Faculty;
    sections:    any[];
    tenant:      Tenant;
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

export interface Tenant {
    id:           string;
    name:         string;
    display_name: string;
    logo_url:     null;
    is_active:    boolean;
    created_at:   Date;
    updated_at:   Date;
}

export interface Metadata {
    timestamp:  Date;
    version:    string;
    pagination: Pagination;
}

export interface Pagination {
    total: number;
    page:  number;
    limit: number;
    pages: number;
}

export interface GetSectionByIDResponse {
    statusCode: number;
    data:       DataSectionById;
    message:    string;
    metadata:   MetadataById;
}

export interface DataSectionById {
    id:          string;
    tenantId:    string;
    name:        string;
    description: string;
    capacity:    number;
    price:       string;
    is_active:   boolean;
    created_at:  Date;
    updated_at:  Date;
    event:       EventById;
    tickets:     any[];
}

export interface EventById {
    id:          string;
    tenantId:    string;
    title:       string;
    description: string;
    image_url:   string;
    start_date:  Date;
    end_date:    Date;
    address:     string;
    is_active:   boolean;
    created_at:  Date;
    updated_at:  Date;
}

export interface MetadataById {
    timestamp: string;
    version:   string;
}
