import { z } from "zod";

export const OrganizadorSchema = z.object({
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
  estanteriaId: z
    .string()
    .optional(),
  armarioId: z
    .string()
    .optional(),
}).refine((data) => data.estanteriaId || data.armarioId, {
  message: "Debe especificar estanteriaId o armarioId",
  path: ["estanteriaId"],
}).refine((data) => !(data.estanteriaId && data.armarioId), {
  message: "No puede especificar ambos estanteriaId y armarioId",
  path: ["estanteriaId"],
});

export const OrganizadorUpdateSchema = OrganizadorSchema.partial();

export const OrganizadorSearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().max(100).optional(),
  sortBy: z.enum(["codigo", "nombre", "createdAt"]).default("codigo"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  estanteriaId: z.string().optional(),
  armarioId: z.string().optional(),
});

export const CajoncitoSchema = z.object({
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
  organizadorId: z
    .string()
    .min(1, "El ID del organizador es requerido"),
});

export const CajoncitoUpdateSchema = CajoncitoSchema.partial();

export const CajoncitoSearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().max(100).optional(),
  sortBy: z.enum(["codigo", "nombre", "createdAt"]).default("codigo"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  organizadorId: z.string().optional(),
});

export type OrganizadorFormData = z.infer<typeof OrganizadorSchema>;
export type OrganizadorUpdateFormData = z.infer<typeof OrganizadorUpdateSchema>;
export type OrganizadorSearchFormData = z.infer<typeof OrganizadorSearchParamsSchema>;
export type CajoncitoFormData = z.infer<typeof CajoncitoSchema>;
export type CajoncitoUpdateFormData = z.infer<typeof CajoncitoUpdateSchema>;
export type CajoncitoSearchFormData = z.infer<typeof CajoncitoSearchParamsSchema>;