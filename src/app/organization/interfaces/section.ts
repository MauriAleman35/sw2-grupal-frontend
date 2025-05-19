// Interfaces para el modelo de datos
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