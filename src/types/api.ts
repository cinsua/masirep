export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: string[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface RepuestoCreateInput {
  codigo: string;
  nombre: string;
  descripcion?: string;
  marca?: string;
  modelo?: string;
  numeroParte?: string;
  stockMinimo?: number;
  categoria?: string;
  equipos?: string[];
  ubicaciones?: Array<{
    tipo: 'armario' | 'estanteria' | 'estante' | 'cajon' | 'division' | 'cajoncito';
    id: string;
    cantidad: number;
  }>;
}

export interface RepuestoUpdateInput extends Partial<RepuestoCreateInput> {}

export type RepuestoWithRelations = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  marca: string | null;
  modelo: string | null;
  numeroParte: string | null;
  stockMinimo: number;
  stockActual: number;
  categoria: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  equipos: Array<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    repuestoId: string;
    equipoId: string;
    equipo: {
      id: string;
      nombre: string;
      codigo: string;
    };
  }>;
  ubicaciones: Array<{
    id: string;
    cantidad: number;
    createdAt: Date;
    updatedAt: Date;
    repuestoId: string;
    armarioId: string | null;
    estanteriaId: string | null;
    estanteId: string | null;
    cajonId: string | null;
    divisionId: string | null;
    armario?: {
      id: string;
      nombre: string;
      codigo: string;
    } | null;
    estanteria?: {
      id: string;
      nombre: string;
      codigo: string;
    } | null;
    estante?: {
      id: string;
      nombre: string;
      codigo: string;
    } | null;
    cajon?: {
      id: string;
      nombre: string;
      codigo: string;
    } | null;
    division?: {
      id: string;
      nombre: string;
      codigo: string;
    } | null;
  }>;
}

// Componente Types
export interface ComponenteCreateInput {
  categoria: 'RESISTENCIA' | 'CAPACITOR' | 'INTEGRADO' | 'VENTILADOR' | 'OTROS';
  descripcion: string;
  valorUnidad: Array<{ valor: string; unidad: string }>;
  stockMinimo?: number;
  ubicaciones?: Array<{
    cajoncitoId: string;
    cantidad: number;
  }>;
}

export interface ComponenteUpdateInput extends Partial<ComponenteCreateInput> {}

export type ComponenteWithRelations = {
  id: string;
  categoria: 'RESISTENCIA' | 'CAPACITOR' | 'INTEGRADO' | 'VENTILADOR' | 'OTROS';
  descripcion: string;
  valorUnidad: Array<{ valor: string; unidad: string }>;
  stockMinimo: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  ubicaciones: Array<{
    id: string;
    cantidad: number;
    createdAt: Date;
    updatedAt: Date;
    componenteId: string;
    cajoncitoId: string;
    cajoncito: {
      id: string;
      nombre: string;
      codigo: string;
    };
  }>;
  // Computed stock from ubicaciones
  stockActual?: number;
};

// Equipo Types
export interface EquipoCreateInput {
  codigo: string;
  sap?: string | null;
  nombre: string;
  descripcion?: string | null;
  marca?: string | null;
  modelo?: string | null;
  numeroSerie?: string | null;
  isActive?: boolean;
  repuestos?: Array<{
    repuestoId: string;
    cantidad: number;
  }>;
}

export interface EquipoUpdateInput extends Partial<EquipoCreateInput> {}

export type EquipoWithRelations = {
  id: string;
  codigo: string;
  sap?: string | null;
  nombre: string;
  descripcion?: string | null;
  marca?: string | null;
  modelo?: string | null;
  numeroSerie?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  repuestos: Array<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    equipoId: string;
    repuestoId: string;
    repuesto: {
      id: string;
      codigo: string;
      nombre: string;
      descripcion?: string | null;
      marca?: string | null;
      modelo?: string | null;
      numeroParte?: string | null;
      categoria?: string | null;
      stockActual: number;
      stockMinimo: number;
      isActive: boolean;
    };
  }>;
  _count: {
    repuestos: number;
  };
};