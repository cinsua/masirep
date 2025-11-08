import { StockCalculator, LocationStock, DistributedStock, StockCalculationOptions } from "../stock-calculator";
import { prisma } from "@/lib/prisma";

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  prisma: {
    repuesto: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    componente: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    repuestoUbicacion: {
      findMany: jest.fn(),
    },
    componenteUbicacion: {
      findMany: jest.fn(),
    },
  },
}));

describe("StockCalculator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRepuesto = {
    id: "rep-1",
    nombre: "Fusible 5A",
    codigo: "REP-001",
    stockMinimo: 10,
  };

  const mockComponente = {
    id: "comp-1",
    nombre: "Resistencia SMD 10k",
    codigo: "COMP-001",
    stockMinimo: 20,
  };

  const mockRepuestoAssociations = [
    {
      id: "assoc-1",
      cantidad: 15,
      armario: {
        id: "arm-1",
        nombre: "Armario Principal",
        codigo: "ARM-001",
        ubicacion: {
          id: "ubic-1",
          nombre: "Almacén Central",
          codigo: "UBIC-001",
        },
      },
    },
    {
      id: "assoc-2",
      cantidad: 5,
      cajoncito: {
        id: "caj-1",
        nombre: "Cajoncito de fusibles",
        codigo: "CAJ-001",
        organizador: {
          id: "org-1",
          nombre: "Organizador de componentes",
          codigo: "ORG-001",
          armario: {
            id: "arm-1",
            nombre: "Armario Principal",
            codigo: "ARM-001",
            ubicacion: {
              id: "ubic-1",
              nombre: "Almacén Central",
              codigo: "UBIC-001",
            },
          },
        },
      },
    },
  ];

  const mockComponenteAssociations = [
    {
      id: "assoc-3",
      cantidad: 25,
      cajoncito: {
        id: "caj-2",
        nombre: "Cajoncito de resistencias",
        codigo: "CAJ-002",
        organizador: {
          id: "org-2",
          nombre: "Organizador de SMD",
          codigo: "ORG-002",
          estanteria: {
            id: "est-1",
            nombre: "Estantería de componentes",
            codigo: "EST-001",
            ubicacion: {
              id: "ubic-1",
              nombre: "Almacén Central",
              codigo: "UBIC-001",
            },
          },
        },
      },
    },
  ];

  describe("calculateRepuestoStock", () => {
    it("should calculate total stock for a repuesto across all locations", async () => {
      (prisma.repuesto.findFirst as jest.Mock).mockResolvedValue(mockRepuesto);
      (prisma.repuestoUbicacion.findMany as jest.Mock).mockResolvedValue(mockRepuestoAssociations);

      const result = await StockCalculator.calculateRepuestoStock("rep-1");

      expect(result).toEqual({
        itemId: "rep-1",
        itemType: "repuesto",
        itemName: "Fusible 5A",
        itemCode: "REP-001",
        totalStock: 20, // 15 + 5
        locations: expect.arrayContaining([
          expect.objectContaining({
            locationId: "arm-1",
            locationType: "armario",
            locationName: "Armario Principal",
            locationCode: "ARM-001",
            quantity: 15,
            locationPath: "Almacén Central > Armario Principal",
          }),
          expect.objectContaining({
            locationId: "caj-1",
            locationType: "cajoncito",
            locationName: "Cajoncito de fusibles",
            locationCode: "CAJ-001",
            quantity: 5,
            locationPath: "Almacén Central > Armario Principal > Organizador de componentes > Cajoncito de fusibles",
          }),
        ]),
        lowStockThreshold: 10,
        isLowStock: false, // 20 > 10
      });
    });

    it("should identify low stock items", async () => {
      const lowStockAssociations = [
        {
          id: "assoc-1",
          cantidad: 5, // Less than stockMinimo (10)
          armario: mockRepuestoAssociations[0].armario,
        },
      ];

      (prisma.repuesto.findFirst as jest.Mock).mockResolvedValue(mockRepuesto);
      (prisma.repuestoUbicacion.findMany as jest.Mock).mockResolvedValue(lowStockAssociations);

      const result = await StockCalculator.calculateRepuestoStock("rep-1");

      expect(result.totalStock).toBe(5);
      expect(result.isLowStock).toBe(true);
      expect(result.lowStockThreshold).toBe(10);
    });

    it("should throw error if repuesto not found", async () => {
      (prisma.repuesto.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(StockCalculator.calculateRepuestoStock("rep-999"))
        .rejects.toThrow("Repuesto con ID rep-999 no encontrado");
    });

    it("should respect includeInactiveItems option", async () => {
      const options: StockCalculationOptions = { includeInactiveItems: true };

      (prisma.repuesto.findFirst as jest.Mock).mockResolvedValue(mockRepuesto);
      (prisma.repuestoUbicacion.findMany as jest.Mock).mockResolvedValue(mockRepuestoAssociations);

      await StockCalculator.calculateRepuestoStock("rep-1", options);

      expect(prisma.repuesto.findFirst).toHaveBeenCalledWith({
        where: {
          id: "rep-1",
          isActive: true,
        },
        select: expect.any(Object),
      });
    });

    it("should filter zero quantities when includeZeroQuantities is false", async () => {
      const associationsWithZero = [
        ...mockRepuestoAssociations,
        {
          id: "assoc-3",
          cantidad: 0,
          estanteria: {
            id: "est-1",
            nombre: "Estantería vacía",
            codigo: "EST-999",
            ubicacion: { id: "ubic-1", nombre: "Almacén", codigo: "UBIC-001" },
          },
        },
      ];

      const options: StockCalculationOptions = { includeZeroQuantities: false };

      (prisma.repuesto.findFirst as jest.Mock).mockResolvedValue(mockRepuesto);
      (prisma.repuestoUbicacion.findMany as jest.Mock).mockResolvedValue(associationsWithZero);

      const result = await StockCalculator.calculateRepuestoStock("rep-1", options);

      expect(result.locations).toHaveLength(2); // Should filter out the zero quantity location
      expect(result.locations.every(loc => loc.quantity > 0)).toBe(true);
    });

    it("should handle repuesto with no associations", async () => {
      (prisma.repuesto.findFirst as jest.Mock).mockResolvedValue(mockRepuesto);
      (prisma.repuestoUbicacion.findMany as jest.Mock).mockResolvedValue([]);

      const result = await StockCalculator.calculateRepuestoStock("rep-1");

      expect(result.totalStock).toBe(0);
      expect(result.locations).toEqual([]);
      expect(result.isLowStock).toBe(true); // 0 < 10 (stockMinimo)
    });
  });

  describe("calculateComponenteStock", () => {
    it("should calculate total stock for a componente across all cajoncitos", async () => {
      (prisma.componente.findFirst as jest.Mock).mockResolvedValue(mockComponente);
      (prisma.componenteUbicacion.findMany as jest.Mock).mockResolvedValue(mockComponenteAssociations);

      const result = await StockCalculator.calculateComponenteStock("comp-1");

      expect(result).toEqual({
        itemId: "comp-1",
        itemType: "componente",
        itemName: "Resistencia SMD 10k",
        itemCode: "COMP-001",
        totalStock: 25,
        locations: expect.arrayContaining([
          expect.objectContaining({
            locationId: "caj-2",
            locationType: "cajoncito",
            locationName: "Cajoncito de resistencias",
            locationCode: "CAJ-002",
            quantity: 25,
            locationPath: "Almacén Central > Estantería de componentes > Organizador de SMD > Cajoncito de resistencias",
          }),
        ]),
        isLowStock: false, // Componentes don't have low stock thresholds
      });
    });

    it("should throw error if componente not found", async () => {
      (prisma.componente.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(StockCalculator.calculateComponenteStock("comp-999"))
        .rejects.toThrow("Componente con ID comp-999 no encontrado");
    });

    it("should handle componente with no associations", async () => {
      (prisma.componente.findFirst as jest.Mock).mockResolvedValue(mockComponente);
      (prisma.componenteUbicacion.findMany as jest.Mock).mockResolvedValue([]);

      const result = await StockCalculator.calculateComponenteStock("comp-1");

      expect(result.totalStock).toBe(0);
      expect(result.locations).toEqual([]);
      expect(result.isLowStock).toBe(false); // Componentes don't have low stock thresholds
    });
  });

  describe("getDistributedStock", () => {
    it("should calculate stock for multiple repuestos", async () => {
      const mockRepuestos = [
        mockRepuesto,
        { ...mockRepuesto, id: "rep-2", nombre: "Resistencia 1k", codigo: "REP-002" },
      ];

      (prisma.repuesto.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockRepuestos[0])
        .mockResolvedValueOnce(mockRepuestos[1]);

      (prisma.repuestoUbicacion.findMany as jest.Mock)
        .mockResolvedValueOnce(mockRepuestoAssociations)
        .mockResolvedValueOnce([]); // Second repuesto has no associations

      const results = await StockCalculator.getDistributedStock(
        ["rep-1", "rep-2"],
        "repuesto"
      );

      expect(results).toHaveLength(2);
      expect(results[0].itemId).toBe("rep-1");
      expect(results[0].totalStock).toBe(20);
      expect(results[1].itemId).toBe("rep-2");
      expect(results[1].totalStock).toBe(0);
    });

    it("should calculate stock for multiple componentes", async () => {
      const mockComponentes = [
        mockComponente,
        { ...mockComponente, id: "comp-2", nombre: "Capacitor 100nF", codigo: "COMP-002" },
      ];

      (prisma.componente.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockComponentes[0])
        .mockResolvedValueOnce(mockComponentes[1]);

      (prisma.componenteUbicacion.findMany as jest.Mock)
        .mockResolvedValueOnce(mockComponenteAssociations)
        .mockResolvedValueOnce([]);

      const results = await StockCalculator.getDistributedStock(
        ["comp-1", "comp-2"],
        "componente"
      );

      expect(results).toHaveLength(2);
      expect(results[0].itemId).toBe("comp-1");
      expect(results[0].totalStock).toBe(25);
      expect(results[1].itemId).toBe("comp-2");
      expect(results[1].totalStock).toBe(0);
    });

    it("should handle errors gracefully and continue with other items", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      (prisma.repuesto.findFirst as jest.Mock)
        .mockRejectedValueOnce(new Error("Database error"))
        .mockResolvedValueOnce(mockRepuesto);

      (prisma.repuestoUbicacion.findMany as jest.Mock)
        .mockResolvedValueOnce(mockRepuestoAssociations);

      const results = await StockCalculator.getDistributedStock(
        ["rep-1", "rep-2"],
        "repuesto"
      );

      expect(results).toHaveLength(1); // Only the successful calculation
      expect(results[0].itemId).toBe("rep-2");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error calculating stock for repuesto rep-1:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getLowStockItems", () => {
    it("should return repuestos that are below their stock threshold", async () => {
      const lowStockRepuesto = {
        id: "rep-2",
        nombre: "Item con stock bajo",
        codigo: "REP-002",
        stockMinimo: 50,
      };

      (prisma.repuesto.findMany as jest.Mock).mockResolvedValue([
        { id: "rep-1" },
        { id: "rep-2" },
      ]);

      (prisma.repuesto.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockRepuesto) // rep-1 has total stock 20 > threshold 10
        .mockResolvedValueOnce(lowStockRepuesto); // rep-2 will have low stock

      (prisma.repuestoUbicacion.findMany as jest.Mock)
        .mockResolvedValueOnce(mockRepuestoAssociations) // rep-1 associations
        .mockResolvedValueOnce([{ id: "assoc-low", cantidad: 5 }]); // rep-2 associations (5 < 50)

      const results = await StockCalculator.getLowStockItems();

      expect(results).toHaveLength(1);
      expect(results[0].itemId).toBe("rep-2");
      expect(results[0].isLowStock).toBe(true);
    });

    it("should handle includeInactiveItems option", async () => {
      const options: StockCalculationOptions = { includeInactiveItems: true };

      (prisma.repuesto.findMany as jest.Mock).mockResolvedValue([{ id: "rep-1" }]);

      await StockCalculator.getLowStockItems(options);

      expect(prisma.repuesto.findMany).toHaveBeenCalledWith({
        where: {
          stockMinimo: { not: null },
          isActive: true,
        },
        select: { id: true },
      });
    });
  });

  describe("recalculateAllStock", () => {
    it("should recalculate stock for all repuestos and componentes", async () => {
      const mockAllRepuestos = [
        { id: "rep-1" },
        { id: "rep-2" },
      ];

      const mockAllComponentes = [
        { id: "comp-1" },
      ];

      (prisma.repuesto.findMany as jest.Mock).mockResolvedValue(mockAllRepuestos);
      (prisma.componente.findMany as jest.Mock).mockResolvedValue(mockAllComponentes);

      (prisma.repuesto.findFirst as jest.Mock)
        .mockResolvedValue(mockRepuesto)
        .mockResolvedValue({ ...mockRepuesto, id: "rep-2", nombre: "Repuesto 2" });

      (prisma.componente.findFirst as jest.Mock).mockResolvedValue(mockComponente);

      (prisma.repuestoUbicacion.findMany as jest.Mock)
        .mockResolvedValue(mockRepuestoAssociations)
        .mockResolvedValue([]);

      (prisma.componenteUbicacion.findMany as jest.Mock).mockResolvedValue(mockComponenteAssociations);

      const result = await StockCalculator.recalculateAllStock();

      expect(result.repuestos).toHaveLength(2);
      expect(result.componentes).toHaveLength(1);
      expect(result.summary.totalRepuestos).toBe(2);
      expect(result.summary.totalComponentes).toBe(1);
    });

    it("should recalculate only repuestos when itemType is 'repuesto'", async () => {
      (prisma.repuesto.findMany as jest.Mock).mockResolvedValue([{ id: "rep-1" }]);
      (prisma.repuesto.findFirst as jest.Mock).mockResolvedValue(mockRepuesto);
      (prisma.repuestoUbicacion.findMany as jest.Mock).mockResolvedValue(mockRepuestoAssociations);

      const result = await StockCalculator.recalculateAllStock("repuesto");

      expect(result.repuestos).toHaveLength(1);
      expect(result.componentes).toHaveLength(0);
      expect(result.summary.totalRepuestos).toBe(1);
      expect(result.summary.totalComponentes).toBe(0);
    });

    it("should recalculate only componentes when itemType is 'componente'", async () => {
      (prisma.componente.findMany as jest.Mock).mockResolvedValue([{ id: "comp-1" }]);
      (prisma.componente.findFirst as jest.Mock).mockResolvedValue(mockComponente);
      (prisma.componenteUbicacion.findMany as jest.Mock).mockResolvedValue(mockComponenteAssociations);

      const result = await StockCalculator.recalculateAllStock("componente");

      expect(result.repuestos).toHaveLength(0);
      expect(result.componentes).toHaveLength(1);
      expect(result.summary.totalRepuestos).toBe(0);
      expect(result.summary.totalComponentes).toBe(1);
    });
  });
});