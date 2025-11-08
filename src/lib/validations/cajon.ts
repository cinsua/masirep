import { z } from "zod";

export const CajonSchema = z.object({
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

export const CajonUpdateSchema = CajonSchema.partial();

export const CajonSearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().max(100).optional(),
  sortBy: z.enum(["codigo", "nombre", "createdAt"]).default("codigo"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  estanteriaId: z.string().optional(),
  armarioId: z.string().optional(),
});

export const DivisionSchema = z.object({
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
  cajonId: z
    .string()
    .min(1, "El ID del cajón es requerido"),
});

export const DivisionUpdateSchema = DivisionSchema.partial();

export const DivisionSearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().max(100).optional(),
  sortBy: z.enum(["codigo", "nombre", "createdAt"]).default("codigo"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  cajonId: z.string().optional(),
});

export type CajonFormData = z.infer<typeof CajonSchema>;
export type CajonUpdateFormData = z.infer<typeof CajonUpdateSchema>;
export type CajonSearchFormData = z.infer<typeof CajonSearchParamsSchema>;
export type DivisionFormData = z.infer<typeof DivisionSchema>;
export type DivisionUpdateFormData = z.infer<typeof DivisionUpdateSchema>;
export type DivisionSearchFormData = z.infer<typeof DivisionSearchParamsSchema>;