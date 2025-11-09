import { NextRequest } from "next/server";
import { GET, POST } from "../route";
import { PUT, DELETE } from "../[assocId]/route";
import { prisma } from "@/lib/prisma";

// Mock dependencies
jest.mock("@/lib/auth", () => ({
  getServerSession: jest.fn(),
  authOptions: {},
}));

const mockPrisma = {
  componente: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
  componenteUbicacion: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
  },
  cajoncito: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

describe("/api/componentes/[id]/ubicaciones", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockComponente = {
    id: "comp-1",
    codigo: "RES-001",
    nombre: "Resistencia 10k",
    categoria: "RESISTENCIA",
    descripcion: "Resistencia de 10k ohmios",
    valorUnidad: "10kΩ",
    stockMinimo: 10,
  };

  describe("POST /api/componentes/[id]/ubicaciones (assign to cajoncito)", () => {
    it("should assign componente to cajoncito", async () => {
      const mockCajoncito = {
        id: "caj-1",
        codigo: "CAJ-001",
        nombre: "Cajoncito de resistencias",
        organizadorId: "org-1",
      };

      const assignmentData = {
        cajoncitoId: "caj-1",
        cantidad: 5,
        ubicadoPor: "Diego Sánchez",
        notas: "Resistencias nuevas",
      };

      const createdAssignment = {
        id: "assign-1",
        componenteId: "comp-1",
        cajoncitoId: "caj-1",
        cantidad: 5,
        ubicadoPor: "Diego Sánchez",
        notas: "Resistencias nuevas",
        fechaUbicacion: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      mockPrisma.componente.findUnique.mockResolvedValue(mockComponente);
      mockPrisma.cajoncito.findUnique.mockResolvedValue(mockCajoncito);
      mockPrisma.componenteUbicacion.findFirst.mockResolvedValue(null); // No existing assignment
      mockPrisma.componenteUbicacion.create.mockResolvedValue(createdAssignment);

      const request = new NextRequest("http://localhost:3000/api/componentes/comp-1/ubicaciones", {
        method: "POST",
        body: JSON.stringify(assignmentData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: Promise.resolve({ id: "comp-1" }) });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(createdAssignment);
      expect(prisma.componenteUbicacion.create).toHaveBeenCalledWith({
        data: {
          ...assignmentData,
          componenteId: "comp-1",
        },
      });
    });

    it("should update existing assignment to cajoncito", async () => {
      const mockCajoncito = {
        id: "caj-1",
        codigo: "CAJ-001",
        nombre: "Cajoncito de resistencias",
        organizadorId: "org-1",
      };

      const assignmentData = {
        cajoncitoId: "caj-1",
        cantidad: 10,
        ubicadoPor: "Ana Martínez",
        notas: "Actualización de stock",
      };

      const existingAssignment = {
        id: "assign-1",
        componenteId: "comp-1",
        cajoncitoId: "caj-1",
        cantidad: 5,
        ubicadoPor: "Diego Sánchez",
        notas: "Asignación anterior",
      };

      const updatedAssignment = {
        ...existingAssignment,
        ...assignmentData,
        updatedAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      mockPrisma.componente.findUnique.mockResolvedValue(mockComponente);
      mockPrisma.cajoncito.findUnique.mockResolvedValue(mockCajoncito);
      mockPrisma.componenteUbicacion.findFirst.mockResolvedValue(existingAssignment);
      mockPrisma.componenteUbicacion.update.mockResolvedValue(updatedAssignment);

      const request = new NextRequest("http://localhost:3000/api/componentes/comp-1/ubicaciones", {
        method: "POST",
        body: JSON.stringify(assignmentData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: Promise.resolve({ id: "comp-1" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(updatedAssignment);
      expect(prisma.componenteUbicacion.update).toHaveBeenCalledWith({
        where: { id: "assign-1" },
        data: assignmentData,
      });
    });

    it("should return 404 for non-existent componente", async () => {
      const assignmentData = {
        cajoncitoId: "caj-1",
        cantidad: 5,
      };

      mockPrisma.componente.findUnique.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/componentes/comp-999/ubicaciones", {
        method: "POST",
        body: JSON.stringify(assignmentData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: Promise.resolve({ id: "comp-999" }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Componente no encontrado");
    });

    it("should return 404 for non-existent cajoncito", async () => {
      const assignmentData = {
        cajoncitoId: "caj-999",
        cantidad: 5,
      };

      mockPrisma.componente.findUnique.mockResolvedValue(mockComponente);
      mockPrisma.cajoncito.findUnique.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/componentes/comp-1/ubicaciones", {
        method: "POST",
        body: JSON.stringify(assignmentData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: Promise.resolve({ id: "comp-1" }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Cajoncito no encontrado");
    });

    it("should validate required fields", async () => {
      const invalidData = {
        cantidad: 5,
        // Missing cajoncitoId
      };

      mockPrisma.componente.findUnique.mockResolvedValue(mockComponente);

      const request = new NextRequest("http://localhost:3000/api/componentes/comp-1/ubicaciones", {
        method: "POST",
        body: JSON.stringify(invalidData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: Promise.resolve({ id: "comp-1" }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Datos inválidos");
    });

    it("should validate cantidad is positive", async () => {
      const invalidData = {
        cajoncitoId: "caj-1",
        cantidad: 0, // Must be greater than 0
      };

      mockPrisma.componente.findUnique.mockResolvedValue(mockComponente);

      const request = new NextRequest("http://localhost:3000/api/componentes/comp-1/ubicaciones", {
        method: "POST",
        body: JSON.stringify(invalidData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request, { params: Promise.resolve({ id: "comp-1" }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe("GET /api/componentes/[id]/ubicaciones", () => {
    it("should return componente ubicaciones including cajoncitos", async () => {
      const mockUbicaciones = [
        {
          id: "assign-1",
          componenteId: "comp-1",
          cajoncitoId: "caj-1",
          cantidad: 5,
          ubicadoPor: "Diego Sánchez",
          fechaUbicacion: new Date(),
          cajoncito: {
            id: "caj-1",
            codigo: "CAJ-001",
            nombre: "Cajoncito de resistencias",
            organizador: {
              id: "org-1",
              codigo: "ORG-001",
              nombre: "Organizador de Resistencias",
              estanteria: {
                id: "est-1",
                codigo: "EST-001",
                nombre: "Estantería Principal",
                ubicacion: {
                  id: "ubic-1",
                  codigo: "ACERIA",
                  nombre: "Área de Acería",
                },
              },
            },
          },
        },
      ];

      mockPrisma.componente.findUnique.mockResolvedValue(mockComponente);
      mockPrisma.componenteUbicacion.findMany.mockResolvedValue(mockUbicaciones);

      const request = new NextRequest("http://localhost:3000/api/componentes/comp-1/ubicaciones");
      const response = await GET(request, { params: Promise.resolve({ id: "comp-1" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockUbicaciones);
      expect(data.data.componente).toEqual(mockComponente);
      expect(prisma.componenteUbicacion.findMany).toHaveBeenCalledWith({
        where: {
          componenteId: "comp-1",
        },
        include: {
          cajoncito: {
            include: {
              organizador: {
                include: {
                  estanteria: {
                    include: {
                      ubicacion: {
                        select: {
                          id: true,
                          codigo: true,
                          nombre: true,
                        },
                      },
                    },
                  },
                  armario: {
                    include: {
                      ubicacion: {
                        select: {
                          id: true,
                          codigo: true,
                          nombre: true,
                        },
                      },
                    },
                  },
                  select: {
                    id: true,
                    codigo: true,
                    nombre: true,
                  },
                },
              },
              select: {
                id: true,
                codigo: true,
                nombre: true,
              },
            },
          },
        },
        orderBy: { fechaUbicacion: "desc" },
      });
    });

    it("should return 404 for non-existent componente", async () => {
      mockPrisma.componente.findUnique.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/componentes/comp-999/ubicaciones");
      const response = await GET(request, { params: Promise.resolve({ id: "comp-999" }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Componente no encontrado");
    });
  });

  describe("PUT /api/componentes/[id]/ubicaciones/[ubicacionId]", () => {
    it("should update componente ubicacion in cajoncito", async () => {
      const mockExistingAssignment = {
        id: "assign-1",
        componenteId: "comp-1",
        cajoncitoId: "caj-1",
        cantidad: 5,
        ubicadoPor: "Diego Sánchez",
        notas: "Asignación original",
      };

      const updateData = {
        cantidad: 10,
        ubicadoPor: "Ana Martínez",
        notas: "Actualización de cantidad",
      };

      const updatedAssignment = {
        ...mockExistingAssignment,
        ...updateData,
        updatedAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      mockPrisma.componente.findUnique.mockResolvedValue(mockComponente);
      mockPrisma.componenteUbicacion.findUnique.mockResolvedValue(mockExistingAssignment);
      mockPrisma.componenteUbicacion.update.mockResolvedValue(updatedAssignment);

      const request = new NextRequest("http://localhost:3000/api/componentes/comp-1/ubicaciones/assign-1", {
        method: "PUT",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: "comp-1", assocId: "assign-1" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(updatedAssignment);
      expect(prisma.componenteUbicacion.update).toHaveBeenCalledWith({
        where: { id: "assign-1" },
        data: updateData,
      });
    });

    it("should return 404 for non-existent assignment", async () => {
      const updateData = {
        cantidad: 10,
      };

      mockPrisma.componente.findUnique.mockResolvedValue(mockComponente);
      mockPrisma.componenteUbicacion.findUnique.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/componentes/comp-1/ubicaciones/assign-999", {
        method: "PUT",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: "comp-1", assocId: "assign-999" }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Ubicación de componente no encontrada");
    });
  });

  describe("DELETE /api/componentes/[id]/ubicaciones/[ubicacionId]", () => {
    it("should delete componente ubicacion from cajoncito", async () => {
      const mockExistingAssignment = {
        id: "assign-1",
        componenteId: "comp-1",
        cajoncitoId: "caj-1",
        cantidad: 5,
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      mockPrisma.componente.findUnique.mockResolvedValue(mockComponente);
      mockPrisma.componenteUbicacion.findUnique.mockResolvedValue(mockExistingAssignment);
      mockPrisma.componenteUbicacion.delete.mockResolvedValue(mockExistingAssignment);

      const request = new NextRequest("http://localhost:3000/api/componentes/comp-1/ubicaciones/assign-1", {
        method: "DELETE",
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: "comp-1", assocId: "assign-1" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe("Ubicación de componente eliminada correctamente");
      expect(prisma.componenteUbicacion.delete).toHaveBeenCalledWith({
        where: { id: "assign-1" },
      });
    });

    it("should return 404 for non-existent assignment", async () => {
      mockPrisma.componente.findUnique.mockResolvedValue(mockComponente);
      mockPrisma.componenteUbicacion.findUnique.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/componentes/comp-1/ubicaciones/assign-999", {
        method: "DELETE",
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: "comp-1", assocId: "assign-999" }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Ubicación de componente no encontrada");
    });
  });
});