import { z } from "zod";

export const EquipoSchema = z.object({
  sap: z
    .string()
    .min(1, "El SAP es requerido")
    .max(50, "El SAP no puede exceder 50 caracteres"),
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  marca: z
    .string()
    .max(100, "La marca no puede exceder 100 caracteres")
    .optional(),
  modelo: z
    .string()
    .max(100, "El modelo no puede exceder 100 caracteres")
    .optional(),
  descripcion: z
    .string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional(),
  numeroSerie: z
    .string()
    .max(100, "El número de serie no puede exceder 100 caracteres")
    .optional(),
  isActive: z.boolean().optional().default(true),
  repuestos: z
    .array(
      z.object({
        repuestoId: z.string().min(1, "El ID del repuesto es requerido"),
        cantidad: z.number().min(1, "La cantidad debe ser al menos 1"),
      })
    )
    .optional(),
});

export const EquipoUpdateSchema = EquipoSchema.partial();

export const EquipoSearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().max(100).optional(),
  sortBy: z.enum(["sap", "nombre", "marca", "modelo", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const EquipoRepuestoAssociationSchema = z.object({
  repuestoId: z.string().min(1, "El ID del repuesto es requerido"),
  cantidad: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1").default(1),
});

export type EquipoFormData = z.infer<typeof EquipoSchema>;
export type EquipoUpdateFormData = z.infer<typeof EquipoUpdateSchema>;
export type EquipoSearchFormData = z.infer<typeof EquipoSearchParamsSchema>;
export type EquipoRepuestoAssociationFormData = z.infer<typeof EquipoRepuestoAssociationSchema>;