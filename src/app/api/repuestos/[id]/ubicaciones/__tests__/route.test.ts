import { NextRequest } from "next/server";
import { GET, POST } from "../route";
import { prisma } from "@/lib/prisma";

// Mock dependencies
jest.mock("@/lib/auth", () => ({
  getServerSession: jest.fn(),
  authOptions: {},
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    repuesto: {
      findUnique: jest.fn(),
    },
    repuestoUbicacion: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    armario: {
      findUnique: jest.fn(),
    },
    estanteria: {
      findUnique: jest.fn(),
    },
    estante: {
      findUnique: jest.fn(),
    },
    cajon: {
      findUnique: jest.fn(),
    },
    division: {
      findUnique: jest.fn(),
    },
    cajoncito: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe("/api/repuestos/[id]/ubicaciones", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRepuesto = {
    id: "rep-1",
    codigo: "REP-001",
    nombre: "Fusible 5A",
    descripcion: "Fusible de 5 amperios",
    stockMinimo: 10,
    categoria: "FUSIBLE",
  };

  describe("GET /api/repuestos/[id]/ubicaciones", () => {
    it("should return all ubicaciones for a repuesto", async () => {
      const mockUbicaciones = [
        {
          id: "assoc-1",
          repuestoId: "rep-1",
          armarioId: "arm-1",
          cantidad: 5,
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
          repuestoId: "rep-1",
          cajoncitoId: "caj-1",
          cantidad: 3,
          cajoncito: {
            id: "caj-1",
            nombre: "Cajoncito de fusibles",
            codigo: "CAJ-001",
          },
        },
      ];

      (prisma.repuesto.findUnique as jest.Mock).mockResolvedValue(mockRepuesto);
      (prisma.repuestoUbicacion.findMany as jest.Mock).mockResolvedValue(mockUbicaciones);

      const request = new NextRequest("http://localhost:3000/api/repuestos/rep-1/ubicaciones");
      const response = await GET(request, { params: { id: "rep-1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockUbicaciones);
      expect(prisma.repuesto.findUnique).toHaveBeenCalledWith({
        where: { id: "rep-1", isActive: true },
      });
    });

    it("should return 404 if repuesto not found", async () => {
      (prisma.repuesto.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/repuestos/rep-999/ubicaciones");
      const response = await GET(request, { params: { id: "rep-999" } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Repuesto no encontrado");
    });

    it("should return 401 if unauthorized", async () => {
      const { getServerSession } = require("@/lib/auth");
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/repuestos/rep-1/ubicaciones");
      const response = await GET(request, { params: { id: "rep-1" } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("POST /api/repuestos/[id]/ubicaciones", () => {
    it("should assign repuesto to armario", async () => {
      const mockArmario = {
        id: "arm-1",
        nombre: "Armario Principal",
        codigo: "ARM-001",
        ubicacionId: "ubic-1",
      };

      const assignmentData = {
        armarioId: "arm-1",
        cantidad: 10,
      };

      const createdAssignment = {
        id: "assoc-1",
        repuestoId: "rep-1",
        armarioId: "arm-1",
        cantidad: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        armario: mockArmario,
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      (prisma.repuesto.findUnique as jest.Mock).mockResolvedValue(mockRepuesto);
      (prisma.armario.findUnique as jest.Mock).mockResolvedValue(mockArmario);
      (prisma.repuestoUbicacion.findFirst as jest.Mock).mockResolvedValue(null); // No existing assignment
      (prisma.repuestoUbicacion.create as jest.Mock).mockResolvedValue(createdAssignment);

      const request = new NextRequest("http://localhost:3000/api/repuestos/rep-1/ubicaciones", {
        method: "POST",
        body: JSON.stringify(assignmentData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: { id: "rep-1" } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(createdAssignment);
      expect(prisma.repuestoUbicacion.create).toHaveBeenCalledWith({
        data: {
          ...assignmentData,
          repuestoId: "rep-1",
        },
        include: expect.any(Object),
      });
    });

    it("should assign repuesto to cajoncito", async () => {
      const mockCajoncito = {
        id: "caj-1",
        nombre: "Cajoncito de fusibles",
        codigo: "CAJ-001",
      };

      const assignmentData = {
        cajoncitoId: "caj-1",
        cantidad: 5,
      };

      const createdAssignment = {
        id: "assoc-2",
        repuestoId: "rep-1",
        cajoncitoId: "caj-1",
        cantidad: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        cajoncito: mockCajoncito,
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      (prisma.repuesto.findUnique as jest.Mock).mockResolvedValue(mockRepuesto);
      (prisma.cajoncito.findUnique as jest.Mock).mockResolvedValue(mockCajoncito);
      (prisma.repuestoUbicacion.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.repuestoUbicacion.create as jest.Mock).mockResolvedValue(createdAssignment);

      const request = new NextRequest("http://localhost:3000/api/repuestos/rep-1/ubicaciones", {
        method: "POST",
        body: JSON.stringify(assignmentData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: { id: "rep-1" } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(createdAssignment);
    });

    it("should return 400 if validation fails", async () => {
      const invalidData = {
        cantidad: -5, // Invalid negative quantity
      };

      const request = new NextRequest("http://localhost:3000/api/repuestos/rep-1/ubicaciones", {
        method: "POST",
        body: JSON.stringify(invalidData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: { id: "rep-1" } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Datos inválidos");
    });

    it("should return 409 if association already exists", async () => {
      const assignmentData = {
        armarioId: "arm-1",
        cantidad: 10,
      };

      const existingAssociation = {
        id: "assoc-1",
        repuestoId: "rep-1",
        armarioId: "arm-1",
        cantidad: 5,
      };

      (prisma.repuesto.findUnique as jest.Mock).mockResolvedValue(mockRepuesto);
      (prisma.armario.findUnique as jest.Mock).mockResolvedValue({ id: "arm-1" });
      (prisma.repuestoUbicacion.findFirst as jest.Mock).mockResolvedValue(existingAssociation);

      const request = new NextRequest("http://localhost:3000/api/repuestos/rep-1/ubicaciones", {
        method: "POST",
        body: JSON.stringify(assignmentData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: { id: "rep-1" } });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe("El repuesto ya está asociado a esta ubicación");
    });

    it("should return 404 if location not found", async () => {
      const assignmentData = {
        armarioId: "arm-999",
        cantidad: 10,
      };

      (prisma.repuesto.findUnique as jest.Mock).mockResolvedValue(mockRepuesto);
      (prisma.armario.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/repuestos/rep-1/ubicaciones", {
        method: "POST",
        body: JSON.stringify(assignmentData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: { id: "rep-1" } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Ubicación no encontrada");
    });
  });
});