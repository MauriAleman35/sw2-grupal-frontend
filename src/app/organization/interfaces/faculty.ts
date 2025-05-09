export interface FacultyResponse {
    statusCode: number;
    data:       DatumFaculty[];
    message:    string;
    metadata:   Metadata;
}

export interface DatumFaculty {
    id:         string;
    tenantId:   string;
    name:       string;
    location:   string;
    is_active:  boolean;
    created_at: Date;
    updated_at: Date;
    tenant:     Tenant;
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


export interface FacultyPostResponse {
    statusCode: number;
    data:       Data;
    message:    string;
    metadata:   Metadata;
}

export interface Data {
    tenantId:   string;
    name:       string;
    location:   string;
    created_at: Date;
    updated_at: Date;
    id:         string;
    is_active:  boolean;
}

export interface Metadata {
    timestamp: Date;
    version:   string;
}

export interface FacultyParams {
    id?: string;
    name: string;
    location?: string;
    tenantId?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  }
  
export interface FacultyUpdateResponse {
    statusCode: number;
    data:       Data;
    message:    string;
    metadata:   Metadata;
}

export interface Data {
    id:         string;
    tenantId:   string;
    name:       string;
    location:   string;
    is_active:  boolean;
    created_at: Date;
    updated_at: Date;
}

export interface Metadata {
    timestamp: Date;
    version:   string;
}
export interface FacultyDeleteResponse {
    statusCode: number;
    data:       null;
    message:    string;
    metadata:   Metadata;
}

export interface Metadata {
    timestamp: Date;
    version:   string;
}
