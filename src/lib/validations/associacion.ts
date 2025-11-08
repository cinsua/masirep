import { z } from "zod";

// Esquema base para asociaciones
const baseAssociationSchema = z.object({
  cantidad: z
    .number()
    .int("La cantidad debe ser un número entero")
    .min(1, "La cantidad debe ser mayor a 0"),
});

// Esquema para asociación de repuesto (puede tener múltiples tipos de ubicación)
export const repuestoAssociationSchema = z.object({
  armarioId: z.string().optional(),
  estanteriaId: z.string().optional(),
  estanteId: z.string().optional(),
  cajonId: z.string().optional(),
  divisionId: z.string().optional(),
  cajoncitoId: z.string().optional(),
}).merge(baseAssociationSchema).refine(
  (data) => {
    // Debe especificar al menos un tipo de ubicación
    const locationFields = [
      data.armarioId,
      data.estanteriaId,
      data.estanteId,
      data.cajonId,
      data.divisionId,
      data.cajoncitoId,
    ].filter(Boolean);

    return locationFields.length === 1;
  },
  {
    message: "Debe especificar exactamente un tipo de ubicación para el repuesto",
  }
);

// Esquema para asociación de componente (solo cajoncitos)
export const componenteAssociationSchema = z.object({
  cajoncitoId: z.string().min(1, "El ID del cajoncito es requerido"),
}).merge(baseAssociationSchema);

// Esquema para actualizar cantidad
export const updateQuantitySchema = z.object({
  cantidad: z
    .number()
    .int("La cantidad debe ser un número entero")
    .min(1, "La cantidad debe ser mayor a 0"),
});

// Esquema para validación de parámetros de ruta
export const routeParamsSchema = z.object({
  id: z.string().min(1, "El ID es requerido"),
});

// Esquema para parámetros de asociación
export const associationParamsSchema = z.object({
  id: z.string().min(1, "El ID del item es requerido"),
  assocId: z.string().min(1, "El ID de la asociación es requerido"),
});

// Tipos TypeScript exportados
export type RepuestoAssociationInput = z.infer<typeof repuestoAssociationSchema>;
export type ComponenteAssociationInput = z.infer<typeof componenteAssociationSchema>;
export type UpdateQuantityInput = z.infer<typeof updateQuantitySchema>;
export type RouteParams = z.infer<typeof routeParamsSchema>;
export type AssociationParams = z.infer<typeof associationParamsSchema>;