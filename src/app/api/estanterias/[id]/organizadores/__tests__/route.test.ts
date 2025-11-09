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
    estanteria: {
      findUnique: jest.fn(),
    },
    organizador: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe("/api/estanterias/[id]/organizadores", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/estanterias/[id]/organizadores", () => {
    it("should return organizadores for estanteria", async () => {
      const mockEstanteria = {
        id: "est-1",
        codigo: "EST-001",
        nombre: "Estantería Principal",
      };

      const mockOrganizadores = [
        {
          id: "1",
          codigo: "ORG-001",
          nombre: "Organizador de Resistencias",
          descripcion: "Para resistencias pequeñas",
          estanteriaId: "est-1",
          armarioId: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { cajoncitos: 5 },
        },
        {
          id: "2",
          codigo: "ORG-002",
          nombre: "Organizador de Capacitores",
          descripcion: "Para capacitores",
          estanteriaId: "est-1",
          armarioId: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { cajoncitos: 3 },
        },
      ];

      (prisma.estanteria.findUnique as jest.Mock).mockResolvedValue(mockEstanteria);
      (prisma.organizador.findMany as jest.Mock).mockResolvedValue(mockOrganizadores);

      const request = new NextRequest("http://localhost:3000/api/estanterias/est-1/organizadores");
      const response = await GET(request, { params: Promise.resolve({ id: "est-1" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.organizadores).toEqual(mockOrganizadores);
      expect(data.data.estanteria).toEqual(mockEstanteria);
      expect(prisma.organizador.findMany).toHaveBeenCalledWith({
        where: {
          estanteriaId: "est-1",
        },
        orderBy: { codigo: "asc" },
        include: {
          _count: {
            select: {
              cajoncitos: true,
            },
          },
        },
      });
    });

    it("should search organizadores by query", async () => {
      const mockEstanteria = {
        id: "est-1",
        codigo: "EST-001",
        nombre: "Estantería Principal",
      };

      const mockOrganizadores = [
        {
          id: "1",
          codigo: "ORG-001",
          nombre: "Organizador de Resistencias",
          estanteriaId: "est-1",
          _count: { cajoncitos: 5 },
        },
      ];

      (prisma.estanteria.findUnique as jest.Mock).mockResolvedValue(mockEstanteria);
      (prisma.organizador.findMany as jest.Mock).mockResolvedValue(mockOrganizadores);

      const request = new NextRequest("http://localhost:3000/api/estanterias/est-1/organizadores?search=Resistencias");
      const response = await GET(request, { params: Promise.resolve({ id: "est-1" }) });

      expect(prisma.organizador.findMany).toHaveBeenCalledWith({
        where: {
          estanteriaId: "est-1",
          OR: [
            { codigo: { contains: "Resistencias", mode: "insensitive" } },
            { nombre: { contains: "Resistencias", mode: "insensitive" } },
            { descripcion: { contains: "Resistencias", mode: "insensitive" } },
          ],
        },
        orderBy: { codigo: "asc" },
        include: {
          _count: {
            select: {
              cajoncitos: true,
            },
          },
        },
      });
    });

    it("should return 404 for non-existent estanteria", async () => {
      (prisma.estanteria.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/estanterias/est-999/organizadores");
      const response = await GET(request, { params: Promise.resolve({ id: "est-999" }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Estantería no encontrada");
    });

    it("should handle empty results", async () => {
      const mockEstanteria = {
        id: "est-1",
        codigo: "EST-001",
        nombre: "Estantería Principal",
      };

      (prisma.estanteria.findUnique as jest.Mock).mockResolvedValue(mockEstanteria);
      (prisma.organizador.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/estanterias/est-1/organizadores");
      const response = await GET(request, { params: Promise.resolve({ id: "est-1" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.organizadores).toEqual([]);
    });
  });

  describe("POST /api/estanterias/[id]/organizadores", () => {
    it("should create a new organizador with auto-generated code", async () => {
      const mockEstanteria = {
        id: "est-1",
        codigo: "EST-001",
        nombre: "Estantería Principal",
      };

      const newOrganizadorData = {
        nombre: "Organizador de Resistencias",
        descripcion: "Para resistencias pequeñas",
      };

      const existingOrganizador = {
        id: "1",
        codigo: "ORG-001",
        nombre: "Organizador Existente",
        estanteriaId: "est-1",
      };

      const createdOrganizador = {
        id: "2",
        codigo: "ORG-002", // Auto-generated
        ...newOrganizadorData,
        estanteriaId: "est-1",
        armarioId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      (prisma.estanteria.findUnique as jest.Mock).mockResolvedValue(mockEstanteria);
      (prisma.organizador.findFirst as jest.Mock).mockResolvedValue(existingOrganizador);
      (prisma.organizador.create as jest.Mock).mockResolvedValue(createdOrganizador);

      const request = new NextRequest("http://localhost:3000/api/estanterias/est-1/organizadores", {
        method: "POST",
        body: JSON.stringify(newOrganizadorData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: Promise.resolve({ id: "est-1" }) });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.organizador).toEqual(createdOrganizador);
      expect(prisma.organizador.create).toHaveBeenCalledWith({
        data: {
          ...newOrganizadorData,
          codigo: "ORG-002", // Auto-generated
          estanteriaId: "est-1",
        },
      });
    });

    it("should create first organizador with ORG-001 code", async () => {
      const mockEstanteria = {
        id: "est-1",
        codigo: "EST-001",
        nombre: "Estantería Principal",
      };

      const newOrganizadorData = {
        nombre: "Primer Organizador",
        descripcion: "Descripción",
      };

      const createdOrganizador = {
        id: "1",
        codigo: "ORG-001", // First organizador gets ORG-001
        ...newOrganizadorData,
        estanteriaId: "est-1",
        armarioId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      (prisma.estanteria.findUnique as jest.Mock).mockResolvedValue(mockEstanteria);
      (prisma.organizador.findFirst as jest.Mock).mockResolvedValue(null); // No existing organizadores
      (prisma.organizador.create as jest.Mock).mockResolvedValue(createdOrganizador);

      const request = new NextRequest("http://localhost:3000/api/estanterias/est-1/organizadores", {
        method: "POST",
        body: JSON.stringify(newOrganizadorData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: Promise.resolve({ id: "est-1" }) });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.organizador.codigo).toBe("ORG-001");
    });

    it("should return 404 for non-existent estanteria", async () => {
      const newOrganizadorData = {
        nombre: "Organizador de Resistencias",
      };

      (prisma.estanteria.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/estanterias/est-999/organizadores", {
        method: "POST",
        body: JSON.stringify(newOrganizadorData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: Promise.resolve({ id: "est-999" }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Estantería no encontrada");
    });

    it("should validate required fields", async () => {
      const mockEstanteria = {
        id: "est-1",
        codigo: "EST-001",
        nombre: "Estantería Principal",
      };

      const invalidData = {
        descripcion: "Organizador sin nombre",
      };

      (prisma.estanteria.findUnique as jest.Mock).mockResolvedValue(mockEstanteria);

      const request = new NextRequest("http://localhost:3000/api/estanterias/est-1/organizadores", {
        method: "POST",
        body: JSON.stringify(invalidData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: Promise.resolve({ id: "est-1" }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Datos inválidos");
    });

    it("should validate field lengths", async () => {
      const mockEstanteria = {
        id: "est-1",
        codigo: "EST-001",
        nombre: "Estantería Principal",
      };

      const invalidData = {
        nombre: "N".repeat(101), // Exceeds 100 character limit
      };

      (prisma.estanteria.findUnique as jest.Mock).mockResolvedValue(mockEstanteria);

      const request = new NextRequest("http://localhost:3000/api/estanterias/est-1/organizadores", {
        method: "POST",
        body: JSON.stringify(invalidData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: Promise.resolve({ id: "est-1" }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});