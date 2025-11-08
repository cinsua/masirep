import { z } from "zod";

export const UbicacionSchema = z.object({
  codigo: z
    .string()
    .max(50, "El código no puede exceder 50 caracteres")
    .optional(),
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  descripcion: z
    .string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional(),
  isActive: z.boolean().optional().default(true),
});

export const UbicacionUpdateSchema = UbicacionSchema.partial();

export const EstanteriaSchema = z.object({
  codigo: z
    .string()
    .min(1, "El código es requerido")
    .max(50, "El código no puede exceder 50 caracteres"),
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  descripcion: z
    .string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional(),
  ubicacionId: z
    .string()
    .min(1, "El ID de la ubicación es requerido"),
});

export const EstanteriaUpdateSchema = EstanteriaSchema.partial();

export const ArmarioSchema = z.object({
  codigo: z
    .string()
    .min(1, "El código es requerido")
    .max(50, "El código no puede exceder 50 caracteres"),
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  descripcion: z
    .string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional(),
  ubicacionId: z
    .string()
    .min(1, "El ID de la ubicación es requerido"),
});

export const ArmarioUpdateSchema = ArmarioSchema.partial();

export const UbicacionSearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().max(100).optional(),
  sortBy: z.enum(["codigo", "nombre", "createdAt"]).default("codigo"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  isActive: z.enum(["true", "false"]).optional().transform(val => val === "true" ? true : val === "false" ? false : undefined),
});

export type UbicacionFormData = z.infer<typeof UbicacionSchema>;
export type UbicacionUpdateFormData = z.infer<typeof UbicacionUpdateSchema>;
export type EstanteriaFormData = z.infer<typeof EstanteriaSchema>;
export type EstanteriaUpdateFormData = z.infer<typeof EstanteriaUpdateSchema>;
export type ArmarioFormData = z.infer<typeof ArmarioSchema>;
export type ArmarioUpdateFormData = z.infer<typeof ArmarioUpdateSchema>;
export type UbicacionSearchFormData = z.infer<typeof UbicacionSearchParamsSchema>;