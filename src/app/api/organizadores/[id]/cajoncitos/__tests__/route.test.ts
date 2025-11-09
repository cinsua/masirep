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
    organizador: {
      findUnique: jest.fn(),
    },
    cajoncito: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe("/api/organizadores/[id]/cajoncitos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/organizadores/[id]/cajoncitos", () => {
    it("should return cajoncitos for organizador", async () => {
      const mockOrganizador = {
        id: "org-1",
        codigo: "ORG-001",
        nombre: "Organizador de Resistencias",
      };

      const mockCajoncitos = [
        {
          id: "1",
          codigo: "CAJ-001",
          nombre: "Cajoncito 1",
          descripcion: "Primera sección",
          organizadorId: "org-1",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { componentes: 3 },
          componentes: [
            {
              componente: {
                id: "comp-1",
                categoria: "RESISTENCIA",
                descripcion: "Resistencia 10k",
                valorUnidad: "10kΩ",
                stockMinimo: 10,
              },
            },
          ],
        },
        {
          id: "2",
          codigo: "CAJ-002",
          nombre: "Cajoncito 2",
          descripcion: "Segunda sección",
          organizadorId: "org-1",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { componentes: 0 },
          componentes: [],
        },
      ];

      (prisma.organizador.findUnique as jest.Mock).mockResolvedValue(mockOrganizador);
      (prisma.cajoncito.findMany as jest.Mock).mockResolvedValue(mockCajoncitos);

      const request = new NextRequest("http://localhost:3000/api/organizadores/org-1/cajoncitos");
      const response = await GET(request, { params: Promise.resolve({ id: "org-1" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.cajoncitos).toEqual(mockCajoncitos);
      expect(data.data.organizador).toEqual(mockOrganizador);
      expect(prisma.cajoncito.findMany).toHaveBeenCalledWith({
        where: {
          organizadorId: "org-1",
        },
        orderBy: { codigo: "asc" },
        include: {
          componentes: {
            include: {
              componente: {
                select: {
                  id: true,
                  categoria: true,
                  descripcion: true,
                  valorUnidad: true,
                  stockMinimo: true,
                },
              },
            },
          },
          _count: {
            select: {
              componentes: true,
            },
          },
        },
      });
    });

    it("should search cajoncitos by query", async () => {
      const mockOrganizador = {
        id: "org-1",
        codigo: "ORG-001",
        nombre: "Organizador de Resistencias",
      };

      const mockCajoncitos = [
        {
          id: "1",
          codigo: "CAJ-001",
          nombre: "Cajoncito Primera",
          organizadorId: "org-1",
          _count: { componentes: 3 },
          componentes: [],
        },
      ];

      (prisma.organizador.findUnique as jest.Mock).mockResolvedValue(mockOrganizador);
      (prisma.cajoncito.findMany as jest.Mock).mockResolvedValue(mockCajoncitos);

      const request = new NextRequest("http://localhost:3000/api/organizadores/org-1/cajoncitos?search=Primera");
      const response = await GET(request, { params: Promise.resolve({ id: "org-1" }) });

      expect(prisma.cajoncito.findMany).toHaveBeenCalledWith({
        where: {
          organizadorId: "org-1",
          OR: [
            { codigo: { contains: "Primera", mode: "insensitive" } },
            { nombre: { contains: "Primera", mode: "insensitive" } },
            { descripcion: { contains: "Primera", mode: "insensitive" } },
          ],
        },
        orderBy: { codigo: "asc" },
        include: {
          componentes: {
            include: {
              componente: {
                select: {
                  id: true,
                  categoria: true,
                  descripcion: true,
                  valorUnidad: true,
                  stockMinimo: true,
                },
              },
            },
          },
          _count: {
            select: {
              componentes: true,
            },
          },
        },
      });
    });

    it("should return 404 for non-existent organizador", async () => {
      (prisma.organizador.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/organizadores/org-999/cajoncitos");
      const response = await GET(request, { params: Promise.resolve({ id: "org-999" }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Organizador no encontrado");
    });

    it("should handle empty results", async () => {
      const mockOrganizador = {
        id: "org-1",
        codigo: "ORG-001",
        nombre: "Organizador de Resistencias",
      };

      (prisma.organizador.findUnique as jest.Mock).mockResolvedValue(mockOrganizador);
      (prisma.cajoncito.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/organizadores/org-1/cajoncitos");
      const response = await GET(request, { params: Promise.resolve({ id: "org-1" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.cajoncitos).toEqual([]);
    });
  });

  describe("POST /api/organizadores/[id]/cajoncitos", () => {
    it("should create a new cajoncito with sequential numbering", async () => {
      const mockOrganizador = {
        id: "org-1",
        codigo: "ORG-001",
        nombre: "Organizador de Resistencias",
      };

      const newCajoncitoData = {
        nombre: "Cajoncito para resistencias",
        descripcion: "Sección de resistencias pequeñas",
      };

      const existingCajoncito = {
        id: "1",
        codigo: "CAJ-001",
        numero: 1,
        nombre: "Cajoncito existente",
        organizadorId: "org-1",
      };

      const createdCajoncito = {
        id: "2",
        codigo: "CAJ-002", // Auto-generated based on sequential numbering
        numero: 2, // Sequential number
        ...newCajoncitoData,
        organizadorId: "org-1",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      (prisma.organizador.findUnique as jest.Mock).mockResolvedValue(mockOrganizador);
      (prisma.cajoncito.findFirst as jest.Mock).mockResolvedValue(existingCajoncito);
      (prisma.cajoncito.create as jest.Mock).mockResolvedValue(createdCajoncito);

      const request = new NextRequest("http://localhost:3000/api/organizadores/org-1/cajoncitos", {
        method: "POST",
        body: JSON.stringify(newCajoncitoData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: Promise.resolve({ id: "org-1" }) });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.cajoncito).toEqual(createdCajoncito);
      expect(prisma.cajoncito.create).toHaveBeenCalledWith({
        data: {
          ...newCajoncitoData,
          codigo: "CAJ-002", // Auto-generated
          numero: 2, // Sequential number
          organizadorId: "org-1",
        },
      });
    });

    it("should create first cajoncito with CAJ-001 and numero 1", async () => {
      const mockOrganizador = {
        id: "org-1",
        codigo: "ORG-001",
        nombre: "Organizador de Resistencias",
      };

      const newCajoncitoData = {
        nombre: "Primer Cajoncito",
        descripcion: "Primera sección",
      };

      const createdCajoncito = {
        id: "1",
        codigo: "CAJ-001", // First cajoncito gets CAJ-001
        numero: 1, // First cajoncito gets numero 1
        ...newCajoncitoData,
        organizadorId: "org-1",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      (prisma.organizador.findUnique as jest.Mock).mockResolvedValue(mockOrganizador);
      (prisma.cajoncito.findFirst as jest.Mock).mockResolvedValue(null); // No existing cajoncitos
      (prisma.cajoncito.create as jest.Mock).mockResolvedValue(createdCajoncito);

      const request = new NextRequest("http://localhost:3000/api/organizadores/org-1/cajoncitos", {
        method: "POST",
        body: JSON.stringify(newCajoncitoData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: Promise.resolve({ id: "org-1" }) });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.cajoncito.codigo).toBe("CAJ-001");
      expect(data.data.cajoncito.numero).toBe(1);
    });

    it("should enforce maximum 50 cajoncitos per organizador", async () => {
      const mockOrganizador = {
        id: "org-1",
        codigo: "ORG-001",
        nombre: "Organizador de Resistencias",
      };

      const existingCajoncito = {
        id: "50",
        codigo: "CAJ-050",
        numero: 50, // Already at maximum
        organizadorId: "org-1",
      };

      const newCajoncitoData = {
        nombre: "Cajoncito excedido",
      };

      (prisma.organizador.findUnique as jest.Mock).mockResolvedValue(mockOrganizador);
      (prisma.cajoncito.findFirst as jest.Mock).mockResolvedValue(existingCajoncito);

      const request = new NextRequest("http://localhost:3000/api/organizadores/org-1/cajoncitos", {
        method: "POST",
        body: JSON.stringify(newCajoncitoData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: Promise.resolve({ id: "org-1" }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Un organizador no puede tener más de 50 cajoncitos");
    });

    it("should return 404 for non-existent organizador", async () => {
      const newCajoncitoData = {
        nombre: "Cajoncito nuevo",
      };

      (prisma.organizador.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/organizadores/org-999/cajoncitos", {
        method: "POST",
        body: JSON.stringify(newCajoncitoData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: Promise.resolve({ id: "org-999" }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Organizador no encontrado");
    });

    it("should validate required fields", async () => {
      const mockOrganizador = {
        id: "org-1",
        codigo: "ORG-001",
        nombre: "Organizador de Resistencias",
      };

      const invalidData = {
        descripcion: "Cajoncito sin nombre",
      };

      (prisma.organizador.findUnique as jest.Mock).mockResolvedValue(mockOrganizador);

      const request = new NextRequest("http://localhost:3000/api/organizadores/org-1/cajoncitos", {
        method: "POST",
        body: JSON.stringify(invalidData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: Promise.resolve({ id: "org-1" }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Datos inválidos");
    });

    it("should validate field lengths", async () => {
      const mockOrganizador = {
        id: "org-1",
        codigo: "ORG-001",
        nombre: "Organizador de Resistencias",
      };

      const invalidData = {
        nombre: "N".repeat(101), // Exceeds 100 character limit
      };

      (prisma.organizador.findUnique as jest.Mock).mockResolvedValue(mockOrganizador);

      const request = new NextRequest("http://localhost:3000/api/organizadores/org-1/cajoncitos", {
        method: "POST",
        body: JSON.stringify(invalidData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: Promise.resolve({ id: "org-1" }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});