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
    ubicacion: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("/api/ubicaciones", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/ubicaciones", () => {
    it("should return ubicaciones list with pagination", async () => {
      const mockUbicaciones = [
        {
          id: "1",
          codigo: "ACERIA",
          nombre: "Área de Acería",
          descripcion: "Ubicación principal de acero",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { armarios: 2, estanterias: 3 },
        },
      ];

      const mockCount = 1;

      (prisma.ubicacion.findMany as jest.Mock).mockResolvedValue(mockUbicaciones);
      (prisma.ubicacion.count as jest.Mock).mockResolvedValue(mockCount);

      const request = new NextRequest("http://localhost:3000/api/ubicaciones?page=1&limit=10");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.ubicaciones).toEqual(mockUbicaciones);
      expect(data.data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      });
    });

    it("should search ubicaciones by query", async () => {
      const mockUbicaciones = [
        {
          id: "1",
          codigo: "ACERIA",
          nombre: "Área de Acería",
          descripcion: "Ubicación principal de acero",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { armarios: 2, estanterias: 3 },
        },
      ];

      (prisma.ubicacion.findMany as jest.Mock).mockResolvedValue(mockUbicaciones);
      (prisma.ubicacion.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest("http://localhost:3000/api/ubicaciones?search=ACERIA");
      const response = await GET(request);
      const data = await response.json();

      expect(prisma.ubicacion.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { codigo: { contains: "ACERIA", mode: "insensitive" } },
            { nombre: { contains: "ACERIA", mode: "insensitive" } },
            { descripcion: { contains: "ACERIA", mode: "insensitive" } },
          ],
        },
        orderBy: { codigo: "asc" },
        skip: 0,
        take: 10,
        include: {
          _count: {
            select: {
              armarios: true,
              estanterias: true,
            },
          },
        },
      });
    });

    it("should filter by active status", async () => {
      const mockUbicaciones = [
        {
          id: "1",
          codigo: "ACERIA",
          nombre: "Área de Acería",
          isActive: true,
          _count: { armarios: 0, estanterias: 0 },
        },
      ];

      (prisma.ubicacion.findMany as jest.Mock).mockResolvedValue(mockUbicaciones);
      (prisma.ubicacion.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest("http://localhost:3000/api/ubicaciones?isActive=true");
      const response = await GET(request);

      expect(prisma.ubicacion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        })
      );
    });

    it("should handle empty results", async () => {
      (prisma.ubicacion.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.ubicacion.count as jest.Mock).mockResolvedValue(0);

      const request = new NextRequest("http://localhost:3000/api/ubicaciones");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.ubicaciones).toEqual([]);
      expect(data.data.pagination.total).toBe(0);
    });
  });

  describe("POST /api/ubicaciones", () => {
    it("should create a new ubicacion", async () => {
      const newUbicacion = {
        codigo: "MASI",
        nombre: "Taller Masi",
        descripcion: "Área principal de taller",
        isActive: true,
      };

      const createdUbicacion = {
        id: "2",
        ...newUbicacion,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.ubicacion.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.ubicacion.create as jest.Mock).mockResolvedValue(createdUbicacion);

      const request = new NextRequest("http://localhost:3000/api/ubicaciones", {
        method: "POST",
        body: JSON.stringify(newUbicacion),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(createdUbicacion);
      expect(prisma.ubicacion.create).toHaveBeenCalledWith({
        data: newUbicacion,
      });
    });

    it("should reject duplicate codigo", async () => {
      const existingUbicacion = {
        id: "1",
        codigo: "ACERIA",
        nombre: "Área de Acería",
      };

      const newUbicacion = {
        codigo: "ACERIA",
        nombre: "Área Duplicada",
      };

      (prisma.ubicacion.findUnique as jest.Mock).mockResolvedValue(existingUbicacion);

      const request = new NextRequest("http://localhost:3000/api/ubicaciones", {
        method: "POST",
        body: JSON.stringify(newUbicacion),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe("El código de ubicación ya existe");
    });

    it("should validate required fields", async () => {
      const invalidUbicacion = {
        nombre: "Ubicación sin código",
      };

      const request = new NextRequest("http://localhost:3000/api/ubicaciones", {
        method: "POST",
        body: JSON.stringify(invalidUbicacion),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Datos inválidos");
    });

    it("should validate field lengths", async () => {
      const invalidUbicacion = {
        codigo: "A".repeat(51), // Exceeds 50 character limit
        nombre: "NOMBRE_VÁLIDO",
      };

      const request = new NextRequest("http://localhost:3000/api/ubicaciones", {
        method: "POST",
        body: JSON.stringify(invalidUbicacion),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});