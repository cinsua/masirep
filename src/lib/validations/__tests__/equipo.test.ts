import {
  EquipoSchema,
  EquipoUpdateSchema,
  EquipoSearchParamsSchema,
  EquipoRepuestoAssociationSchema,
  EquipoFormData,
  EquipoUpdateFormData,
  EquipoSearchFormData,
  EquipoRepuestoAssociationFormData,
} from "../equipo";

describe("Equipo Validation Schemas", () => {
  describe("EquipoSchema", () => {
    const validEquipo: EquipoFormData = {
      sap: "ESP20",
      nombre: "PLC Principal",
      descripcion: "PLC principal de control",
      marca: "Siemens",
      modelo: "S7-1200",
      numeroSerie: "SN123456789",
      isActive: true,
      repuestos: [
        { repuestoId: "rep-1", cantidad: 2 },
        { repuestoId: "rep-2", cantidad: 1 },
      ],
    };

    it("should validate a complete valid equipo", () => {
      const result = EquipoSchema.safeParse(validEquipo);
      expect(result.success).toBe(true);
    });

    it("should validate equipo with only required fields", () => {
      const minimalEquipo = {
        sap: "PREPMASTER",
        nombre: "Equipo Principal",
      };

      const result = EquipoSchema.safeParse(minimalEquipo);
      expect(result.success).toBe(true);
    });

    it("should require sap field", () => {
      const invalidEquipo = { ...validEquipo, sap: "" };

      const result = EquipoSchema.safeParse(invalidEquipo);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("sap");
        expect(result.error.issues[0].message).toBe("El SAP es requerido");
      }
    });

    it("should require nombre field", () => {
      const invalidEquipo = { ...validEquipo, nombre: "" };

      const result = EquipoSchema.safeParse(invalidEquipo);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("nombre");
        expect(result.error.issues[0].message).toBe("El nombre es requerido");
      }
    });

    it("should validate SAP length constraints", () => {
      const tooLongSap = "A".repeat(51);

      const result = EquipoSchema.safeParse({ ...validEquipo, sap: tooLongSap });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("sap");
        expect(result.error.issues[0].message).toContain("no puede exceder 50 caracteres");
      }
    });

    it("should validate nombre length constraints", () => {
      const tooLongNombre = "A".repeat(101);

      const result = EquipoSchema.safeParse({ ...validEquipo, nombre: tooLongNombre });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("nombre");
        expect(result.error.issues[0].message).toContain("no puede exceder 100 caracteres");
      }
    });

    it("should validate optional descripcion field", () => {
      const equipoWithoutDescripcion = { ...validEquipo, descripcion: undefined };

      const result = EquipoSchema.safeParse(equipoWithoutDescripcion);
      expect(result.success).toBe(true);
    });

    it("should validate repuestos array", () => {
      const equipoWithInvalidRepuestos = {
        ...validEquipo,
        repuestos: [
          { repuestoId: "", cantidad: 1 }, // Invalid: empty repuestoId
          { repuestoId: "valid-id", cantidad: 0 }, // Invalid: quantity less than 1
        ],
      };

      const result = EquipoSchema.safeParse(equipoWithInvalidRepuestos);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
      }
    });

    it("should accept empty repuestos array", () => {
      const equipoWithoutRepuestos = { ...validEquipo, repuestos: [] };

      const result = EquipoSchema.safeParse(equipoWithoutRepuestos);
      expect(result.success).toBe(true);
    });

    it("should accept undefined repuestos", () => {
      const equipoWithoutRepuestosField = { ...validEquipo };
      delete (equipoWithoutRepuestosField as any).repuestos;

      const result = EquipoSchema.safeParse(equipoWithoutRepuestosField);
      expect(result.success).toBe(true);
    });

    it("should validate descripcion length constraints", () => {
      const tooLongDescripcion = "A".repeat(501);

      const result = EquipoSchema.safeParse({ ...validEquipo, descripcion: tooLongDescripcion });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("descripcion");
        expect(result.error.issues[0].message).toContain("no puede exceder 500 caracteres");
      }
    });

    it("should default isActive to true when not provided", () => {
      const equipoWithoutIsActive = { ...validEquipo };
      delete (equipoWithoutIsActive as any).isActive;

      const result = EquipoSchema.safeParse(equipoWithoutIsActive);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(true);
      }
    });
  });

  describe("EquipoUpdateSchema", () => {
    it("should allow partial updates", () => {
      const partialUpdate: EquipoUpdateFormData = {
        nombre: "Updated Name",
        marca: "Updated Brand",
      };

      const result = EquipoUpdateSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it("should accept empty object for update", () => {
      const emptyUpdate = {};

      const result = EquipoUpdateSchema.safeParse(emptyUpdate);
      expect(result.success).toBe(true);
    });

    it("should validate all same constraints as main schema", () => {
      const invalidUpdate = {
        codigo: "", // Invalid: empty
        nombre: "A".repeat(101), // Invalid: too long
      };

      const result = EquipoUpdateSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe("EquipoSearchParamsSchema", () => {
    it("should validate with default values", () => {
      const emptyParams = {};

      const result = EquipoSearchParamsSchema.safeParse(emptyParams);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.sortBy).toBe("createdAt");
        expect(result.data.sortOrder).toBe("desc");
      }
    });

    it("should validate provided search parameters", () => {
      const searchParams: EquipoSearchFormData = {
        page: 2,
        limit: 20,
        search: "ESP20",
        sortBy: "nombre",
        sortOrder: "asc",
      };

      const result = EquipoSearchParamsSchema.safeParse(searchParams);
      expect(result.success).toBe(true);
    });

    it("should coerce string values to numbers", () => {
      const stringParams = {
        page: "3",
        limit: "15",
      };

      const result = EquipoSearchParamsSchema.safeParse(stringParams);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(15);
      }
    });

    it("should validate sortBy enum values", () => {
      const validSortFields = ["sap", "nombre", "marca", "modelo", "createdAt"];

      validSortFields.forEach(sortBy => {
        const result = EquipoSearchParamsSchema.safeParse({ sortBy });
        expect(result.success).toBe(true);
      });

      const invalidSortBy = { sortBy: "invalidField" };
      const invalidResult = EquipoSearchParamsSchema.safeParse(invalidSortBy);
      expect(invalidResult.success).toBe(false);
    });

    it("should validate sortOrder enum values", () => {
      const ascResult = EquipoSearchParamsSchema.safeParse({ sortOrder: "asc" });
      expect(ascResult.success).toBe(true);

      const descResult = EquipoSearchParamsSchema.safeParse({ sortOrder: "desc" });
      expect(descResult.success).toBe(true);

      const invalidResult = EquipoSearchParamsSchema.safeParse({ sortOrder: "invalid" });
      expect(invalidResult.success).toBe(false);
    });

    it("should enforce maximum limit", () => {
      const overLimit = { limit: 101 };

      const result = EquipoSearchParamsSchema.safeParse(overLimit);
      expect(result.success).toBe(false);
    });

    it("should enforce positive page numbers", () => {
      const negativePage = { page: -1 };

      const result = EquipoSearchParamsSchema.safeParse(negativePage);
      expect(result.success).toBe(false);
    });

    it("should enforce positive limit", () => {
      const zeroLimit = { limit: 0 };

      const result = EquipoSearchParamsSchema.safeParse(zeroLimit);
      expect(result.success).toBe(false);
    });
  });

  describe("EquipoRepuestoAssociationSchema", () => {
    const validAssociation: EquipoRepuestoAssociationFormData = {
      repuestoId: "rep-123",
      cantidad: 5,
    };

    it("should validate valid association", () => {
      const result = EquipoRepuestoAssociationSchema.safeParse(validAssociation);
      expect(result.success).toBe(true);
    });

    it("should require repuestoId field", () => {
      const withoutRepuestoId = { ...validAssociation };
      delete (withoutRepuestoId as any).repuestoId;

      const result = EquipoRepuestoAssociationSchema.safeParse(withoutRepuestoId);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("repuestoId");
      }
    });

    it("should validate repuestoId is not empty", () => {
      const emptyRepuestoId = { ...validAssociation, repuestoId: "" };

      const result = EquipoRepuestoAssociationSchema.safeParse(emptyRepuestoId);
      expect(result.success).toBe(false);
    });

    it("should default cantidad to 1", () => {
      const withoutCantidad = { repuestoId: "rep-123" };

      const result = EquipoRepuestoAssociationSchema.safeParse(withoutCantidad);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cantidad).toBe(1);
      }
    });

    it("should require positive cantidad", () => {
      const negativeCantidad = { ...validAssociation, cantidad: -1 };

      const result = EquipoRepuestoAssociationSchema.safeParse(negativeCantidad);
      expect(result.success).toBe(false);
    });

    it("should require integer cantidad", () => {
      const floatCantidad = { ...validAssociation, cantidad: 1.5 };

      const result = EquipoRepuestoAssociationSchema.safeParse(floatCantidad);
      expect(result.success).toBe(false);
    });

    it("should not allow zero cantidad", () => {
      const zeroCantidad = { ...validAssociation, cantidad: 0 };

      const result = EquipoRepuestoAssociationSchema.safeParse(zeroCantidad);
      expect(result.success).toBe(false);
    });

    it("should coerce string cantidad to number", () => {
      const stringCantidad = { ...validAssociation, cantidad: "10" };

      const result = EquipoRepuestoAssociationSchema.safeParse(stringCantidad);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.cantidad).toBe("number");
        expect(result.data.cantidad).toBe(10);
      }
    });
  });
});