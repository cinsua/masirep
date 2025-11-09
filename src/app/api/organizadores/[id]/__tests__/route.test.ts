import { NextRequest } from "next/server";
import { GET, PUT, DELETE } from "../route";
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
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe("/api/organizadores/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/organizadores/[id]", () => {
    it("should return organizador by id", async () => {
      const mockOrganizador = {
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
        estanteria: {
          id: "est-1",
          codigo: "EST-001",
          nombre: "Estantería Principal",
        },
        armario: null,
      };

      (prisma.organizador.findUnique as jest.Mock).mockResolvedValue(mockOrganizador);

      const request = new NextRequest("http://localhost:3000/api/organizadores/1");
      const response = await GET(request, { params: Promise.resolve({ id: "1" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.organizador).toEqual(mockOrganizador);
      expect(prisma.organizador.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        include: {
          estanteria: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
            },
          },
          armario: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
            },
          },
          _count: {
            select: {
              cajoncitos: true,
            },
          },
        },
      });
    });

    it("should return 404 for non-existent organizador", async () => {
      (prisma.organizador.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/organizadores/999");
      const response = await GET(request, { params: Promise.resolve({ id: "999" }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Organizador no encontrado");
    });

    it("should handle database errors", async () => {
      (prisma.organizador.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      const request = new NextRequest("http://localhost:3000/api/organizadores/1");
      const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

      expect(response.status).toBe(500);
    });
  });

  describe("PUT /api/organizadores/[id]", () => {
    it("should update organizador", async () => {
      const existingOrganizador = {
        id: "1",
        codigo: "ORG-001",
        nombre: "Organizador Antiguo",
        descripcion: "Descripción antigua",
        estanteriaId: "est-1",
        armarioId: null,
      };

      const updatedData = {
        nombre: "Organizador Actualizado",
        descripcion: "Descripción actualizada",
      };

      const updatedOrganizador = {
        ...existingOrganizador,
        ...updatedData,
        updatedAt: new Date(),
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      (prisma.organizador.findUnique as jest.Mock)
        .mockResolvedValueOnce(existingOrganizador) // For duplicate check
        .mockResolvedValueOnce(updatedOrganizador); // For return

      (prisma.organizador.update as jest.Mock).mockResolvedValue(updatedOrganizador);

      const request = new NextRequest("http://localhost:3000/api/organizadores/1", {
        method: "PUT",
        body: JSON.stringify(updatedData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.organizador).toEqual(updatedOrganizador);
      expect(prisma.organizador.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: updatedData,
      });
    });

    it("should reject parent relationship change", async () => {
      const updateData = {
        nombre: "Organizador Actualizado",
        estanteriaId: "est-2", // Trying to change parent
      };

      const request = new NextRequest("http://localhost:3000/api/organizadores/1", {
        method: "PUT",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("No se puede cambiar la ubicación padre del organizador");
    });

    it("should return 404 for non-existent organizador", async () => {
      (prisma.organizador.findUnique as jest.Mock).mockResolvedValue(null);

      const updateData = {
        nombre: "Organizador Actualizado",
      };

      const request = new NextRequest("http://localhost:3000/api/organizadores/999", {
        method: "PUT",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: "999" }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Organizador no encontrado");
    });

    it("should validate field lengths", async () => {
      const invalidData = {
        nombre: "N".repeat(101), // Exceeds 100 character limit
      };

      const request = new NextRequest("http://localhost:3000/api/organizadores/1", {
        method: "PUT",
        body: JSON.stringify(invalidData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe("DELETE /api/organizadores/[id]", () => {
    it("should delete organizador with cajoncitos", async () => {
      const mockOrganizador = {
        id: "1",
        codigo: "ORG-001",
        nombre: "Organizador a Eliminar",
      };

      const mockCajoncitos = [
        { id: "caj-1", codigo: "CAJ-001" },
        { id: "caj-2", codigo: "CAJ-002" },
      ];

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      (prisma.organizador.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockOrganizador) // For existence check
        .mockResolvedValueOnce({
          ...mockOrganizador,
          cajoncitos: mockCajoncitos,
        }); // For cajoncitos check

      (prisma.organizador.delete as jest.Mock).mockResolvedValue(mockOrganizador);

      const request = new NextRequest("http://localhost:3000/api/organizadores/1", {
        method: "DELETE",
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe("Organizador y sus cajoncitos eliminados correctamente");
      expect(prisma.organizador.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("should delete organizador without cajoncitos", async () => {
      const mockOrganizador = {
        id: "1",
        codigo: "ORG-001",
        nombre: "Organizador a Eliminar",
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      (prisma.organizador.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockOrganizador) // For existence check
        .mockResolvedValueOnce({
          ...mockOrganizador,
          cajoncitos: [], // No cajoncitos
        });

      (prisma.organizador.delete as jest.Mock).mockResolvedValue(mockOrganizador);

      const request = new NextRequest("http://localhost:3000/api/organizadores/1", {
        method: "DELETE",
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe("Organizador eliminado correctamente");
    });

    it("should return 404 for non-existent organizador", async () => {
      (prisma.organizador.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/organizadores/999", {
        method: "DELETE",
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: "999" }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Organizador no encontrado");
    });

    it("should handle database errors during deletion", async () => {
      (prisma.organizador.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      const request = new NextRequest("http://localhost:3000/api/organizadores/1", {
        method: "DELETE",
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) });

      expect(response.status).toBe(500);
    });
  });
});