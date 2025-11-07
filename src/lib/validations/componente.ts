import * as z from "zod";

// Valor/Unidad pair validation
const valorUnidadPairSchema = z.object({
  valor: z.string().min(1, "El valor es requerido"),
  unidad: z.string().min(1, "La unidad es requerida"),
});

// Componente base schema
const componenteBaseSchema = z.object({
  categoria: z.enum(["RESISTENCIA", "CAPACITOR", "INTEGRADO", "VENTILADOR", "OTROS"]),
  descripcion: z.string()
    .min(1, "La descripción es requerida")
    .max(500, "La descripción no puede exceder 500 caracteres"),
  valorUnidad: z.array(valorUnidadPairSchema)
    .min(1, "Se requiere al menos un par valor/unidad")
    .max(10, "No se pueden especificar más de 10 pares valor/unidad"),
  stockMinimo: z.number()
    .int("El stock mínimo debe ser un número entero")
    .min(0, "El stock mínimo no puede ser negativo")
    .max(999999, "El stock mínimo no puede exceder 999999"),
});

// Create component schema
export const componenteCreateSchema = componenteBaseSchema.extend({
  valorUnidad: z.array(valorUnidadPairSchema)
    .min(1, "Se requiere al menos un par valor/unidad completo")
    .refine(
      (pairs) => pairs.some(pair => pair.valor.trim() && pair.unidad.trim()),
      "Al menos un par valor/unidad debe estar completo"
    ),
  ubicaciones: z.array(z.object({
    cajoncitoId: z.string().min(1, "El ID del cajoncito es requerido"),
    cantidad: z.number()
      .int("La cantidad debe ser un número entero")
      .min(1, "La cantidad debe ser mayor a 0")
      .max(999999, "La cantidad no puede exceder 999999"),
  })).optional(),
});

// Update component schema
export const componenteUpdateSchema = componenteBaseSchema.partial().extend({
  valorUnidad: z.array(valorUnidadPairSchema)
    .min(1, "Se requiere al menos un par valor/unidad")
    .max(10, "No se pueden especificar más de 10 pares valor/unidad")
    .optional(),
  ubicaciones: z.array(z.object({
    cajoncitoId: z.string().min(1, "El ID del cajoncito es requerido"),
    cantidad: z.number()
      .int("La cantidad debe ser un número entero")
      .min(1, "La cantidad debe ser mayor a 0")
      .max(999999, "La cantidad no puede exceder 999999"),
  })).optional(),
});

// Category-specific validation rules
export const categoryValidationRules = {
  RESISTENCIA: {
    allowedUnits: ["Ω", "kΩ", "MΩ", "W", "%", "ppm", "T°"],
    commonValues: ["1K", "10K", "100K", "1M", "0.25", "0.5", "1", "2", "5"],
    maxValues: 5, // Resistencia typically has ohms and power
    rules: [
      {
        test: (pairs: Array<{valor: string, unidad: string}>) =>
          pairs.some(p => p.unidad.includes("Ω")),
        message: "Las resistencias deben especificar el valor en ohmios (Ω, kΩ, MΩ)"
      },
      {
        test: (pairs: Array<{valor: string, unidad: string}>) =>
          !pairs.some(p => p.valor.includes(".") && !p.unidad.includes("Ω")),
        message: "El valor de resistencia debe ser numérico"
      }
    ]
  },
  CAPACITOR: {
    allowedUnits: ["pF", "nF", "µF", "mF", "F", "V", "tolerance"],
    commonValues: ["10", "22", "47", "100", "220", "470", "1000"],
    maxValues: 4, // Capacitance and voltage typically
    rules: [
      {
        test: (pairs: Array<{valor: string, unidad: string}>) =>
          pairs.some(p => ["pF", "nF", "µF", "mF", "F"].some(unit => p.unidad.includes(unit))),
        message: "Los capacitores deben especificar la capacitancia (pF, nF, µF, mF, F)"
      }
    ]
  },
  INTEGRADO: {
    allowedUnits: ["pines", "MHz", "V", "mA", "W", "package", "temp", "°C"],
    commonValues: ["5", "3.3", "12", "24"],
    maxValues: 8, // ICs can have many specifications
    rules: [
      {
        test: (pairs: Array<{valor: string, unidad: string}>) =>
          pairs.some(p => p.unidad.includes("V")),
        message: "Los circuitos integrados deben especificar el voltaje de operación"
      }
    ]
  },
  VENTILADOR: {
    allowedUnits: ["V", "mA", "RPM", "CFM", "m³/h", "dB", "mm"],
    commonValues: ["5", "12", "24", "48"],
    maxValues: 6,
    rules: [
      {
        test: (pairs: Array<{valor: string, unidad: string}>) =>
          pairs.some(p => p.unidad.includes("V")),
        message: "Los ventiladores deben especificar el voltaje de operación"
      }
    ]
  },
  OTROS: {
    allowedUnits: ["V", "A", "W", "Hz", "Ω", "F", "H", "m", "mm", "°C", "%"],
    commonValues: [],
    maxValues: 10,
    rules: []
  }
};

// Category-specific validation function
export function validateComponenteByCategory(
  categoria: string,
  valorUnidad: Array<{valor: string, unidad: string}>
): { isValid: boolean; errors: string[] } {
  const rules = categoryValidationRules[categoria as keyof typeof categoryValidationRules];

  if (!rules) {
    return { isValid: true, errors: [] };
  }

  const errors: string[] = [];

  // Check max values
  if (valorUnidad.length > rules.maxValues) {
    errors.push(`${categoria} no debe tener más de ${rules.maxValues} especificaciones`);
  }

  // Check allowed units
  const invalidUnits = valorUnidad.filter(pair =>
    !rules.allowedUnits.some(allowed => pair.unidad.toLowerCase().includes(allowed.toLowerCase()))
  );

  if (invalidUnits.length > 0) {
    errors.push(`Unidades no permitidas para ${categoria}: ${invalidUnits.map(u => u.unidad).join(", ")}`);
  }

  // Apply category-specific rules
  rules.rules.forEach(rule => {
    if (!rule.test(valorUnidad)) {
      errors.push(rule.message);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Complete validation function for componente creation/update
export function validateComponente(
  data: any,
  isUpdate: boolean = false
): { isValid: boolean; errors: string[] } {
  const schema = isUpdate ? componenteUpdateSchema : componenteCreateSchema;
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = (result.error as any).errors?.map((err: any) => err.message) || [];
    return { isValid: false, errors };
  }

  // If categoria is provided, do category-specific validation
  if (result.data.categoria && result.data.valorUnidad) {
    const categoryValidation = validateComponenteByCategory(
      result.data.categoria,
      result.data.valorUnidad
    );

    if (!categoryValidation.isValid) {
      return categoryValidation;
    }
  }

  return { isValid: true, errors: [] };
}

// Export types
export type ComponenteCreateInput = z.infer<typeof componenteCreateSchema>;
export type ComponenteUpdateInput = z.infer<typeof componenteUpdateSchema>;
export type ComponenteBaseInput = z.infer<typeof componenteBaseSchema>;