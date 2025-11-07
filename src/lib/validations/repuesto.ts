import * as z from "zod";

export const RepuestoSchema = z.object({
  codigo: z.string().min(1, "Código requerido").max(50, "Máximo 50 caracteres"),
  nombre: z.string().min(1, "Nombre requerido").max(200, "Máximo 200 caracteres"),
  descripcion: z.string().max(1000, "Máximo 1000 caracteres").optional(),
  marca: z.string().max(100, "Máximo 100 caracteres").optional(),
  modelo: z.string().max(100, "Máximo 100 caracteres").optional(),
  numeroParte: z.string().max(100, "Máximo 100 caracteres").optional(),
  stockMinimo: z.number().int().min(0, "Stock mínimo debe ser mayor o igual a 0").max(9999, "Máximo 9999 unidades"),
  categoria: z.string().max(100, "Máximo 100 caracteres").optional(),
  equipos: z.array(z.string()).optional(),
  ubicaciones: z.array(z.object({
    tipo: z.enum(['armario', 'estanteria', 'estante', 'cajon', 'division', 'cajoncito']),
    id: z.string().min(1, "ID de ubicación requerido"),
    cantidad: z.number().int().min(1, "Cantidad debe ser mayor a 0").max(9999, "Máximo 9999 unidades"),
  })).optional(),
});

export const RepuestoUpdateSchema = RepuestoSchema.partial();

export const RepuestoFilterSchema = z.object({
  search: z.string().max(100, "Máximo 100 caracteres").optional(),
  page: z.number().int().min(1, "Página debe ser mayor a 0").default(1),
  limit: z.number().int().min(1, "Límite debe ser mayor a 0").max(100, "Máximo 100 resultados").default(10),
  sortBy: z.enum(['codigo', 'nombre', 'createdAt', 'updatedAt', 'stockActual']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const EquipoAssociationSchema = z.object({
  equipoIds: z.array(z.string()).min(1, "Seleccione al menos un equipo"),
  cantidad: z.number().int().min(1, "Cantidad debe ser mayor a 0").default(1),
});

export const LocationAssignmentSchema = z.object({
  tipo: z.enum(['armario', 'estanteria', 'estante', 'cajon', 'division', 'cajoncito']),
  id: z.string().min(1, "ID de ubicación requerido"),
  cantidad: z.number().int().min(1, "Cantidad debe ser mayor a 0").max(9999, "Máximo 9999 unidades"),
});

// Validation functions
export const validateRepuesto = (data: unknown) => {
  return RepuestoSchema.safeParse(data);
};

export const validateRepuestoUpdate = (data: unknown) => {
  return RepuestoUpdateSchema.safeParse(data);
};

export const validateRepuestoFilter = (data: unknown) => {
  return RepuestoFilterSchema.safeParse(data);
};

export const validateEquipoAssociation = (data: unknown) => {
  return EquipoAssociationSchema.safeParse(data);
};

export const validateLocationAssignment = (data: unknown) => {
  return LocationAssignmentSchema.safeParse(data);
};

// Error messages
export const REPUESTO_ERROR_MESSAGES = {
  REQUIRED: "Este campo es requerido",
  INVALID_CODE: "Código inválido",
  DUPLICATE_CODE: "El código ya existe",
  INVALID_STOCK: "Stock inválido",
  INVALID_QUANTITY: "Cantidad inválida",
  INVALID_LOCATION: "Ubicación inválida",
  NETWORK_ERROR: "Error de conexión",
  VALIDATION_ERROR: "Error de validación",
  NOT_FOUND: "Repuesto no encontrado",
  DELETE_ERROR: "No se puede eliminar un repuesto con stock existente",
  UNAUTHORIZED: "No autorizado",
  FORBIDDEN: "Acceso denegado",
  SERVER_ERROR: "Error del servidor",
} as const;

export type RepuestoErrorType = keyof typeof REPUESTO_ERROR_MESSAGES;

export class RepuestoValidationError extends Error {
  constructor(
    message: string,
    public type: RepuestoErrorType,
    public field?: string
  ) {
    super(message);
    this.name = "RepuestoValidationError";
  }
}

export const createValidationError = (
  field: string,
  message: string,
  type: RepuestoErrorType = "VALIDATION_ERROR"
): RepuestoValidationError => {
  return new RepuestoValidationError(message, type, field);
};

export const formatZodError = (error: z.ZodError): RepuestoValidationError[] => {
  return error.issues.map(err => 
    new RepuestoValidationError(
      err.message,
      "VALIDATION_ERROR",
      err.path.join('.')
    )
  );
};