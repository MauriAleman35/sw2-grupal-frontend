// Interfaces para el modelo de datos
export interface SectionResponse {
  statusCode: number;
  data:       DatumSectionAll[];
  message:    string;
  metadata:   Metadata;
}

export interface DatumSectionAll {
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

export interface Metadata {
  timestamp: string;
  version:   string;
}

export interface Section {
  id?: string;
  tenantId: string;
  name: string;
  description: string;
  price: number;
  created_at?: Date;
  updated_at?: Date;
  eventId: string;
  capacity: number;
  is_active: boolean;
  color?: string; // Campo adicional para identificación visual
}




export interface SectionByEventResponse {
  statusCode: number;
  data:       DatumSectionByEvent[];
  message:    string;
  metadata:   Metadata;
}

export interface DatumSectionByEvent {
  id:          string;
  tenantId:    string;
  name:        string;
  description: string;
  capacity:    number;
  price:       string;
  is_active:   boolean;
  created_at:  Date;
  updated_at:  Date;
  tickets:     Ticket[];
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

export interface CreateTicketsSection {
  statusCode: number;
  data:       Data;
  message:    string;
  metadata:   Metadata;
}

export interface Data {
  created: number;
}

export interface Metadata {
  timestamp: string;
  version:   string;
}


export interface SectionPostResponse {
  statusCode: number;
  data:       Data;
  message:    string;
  metadata:   Metadata;
}

export interface Data {
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

export interface Metadata {
  timestamp: string;
  version:   string;
}


export interface UpdateSectionResponse {
  statusCode: number;
  data:       Data;
  message:    string;
  metadata:   Metadata;
}

export interface Data {
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
  tickets:     any[];
}

export interface Event {
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

export interface Metadata {
  timestamp: string;
  version:   string;
}

export interface GetByIDResponse {
  statusCode: number;
  data:       DataSectionById;
  message:    string;
  metadata:   Metadata;
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
  event:       Event;
  tickets:     any[];
}

export interface Event {
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

export interface Metadata {
  timestamp: string;
  version:   string;
}
