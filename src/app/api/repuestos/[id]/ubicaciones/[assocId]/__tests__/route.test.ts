import { NextRequest } from "next/server";
import { PUT, DELETE } from "../route";
import { prisma } from "@/lib/prisma";

// Mock dependencies
jest.mock("@/lib/auth", () => ({
  getServerSession: jest.fn(),
  authOptions: {},
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    repuestoUbicacion: {
      findFirst: jest.fn(),
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

describe("/api/repuestos/[id]/ubicaciones/[assocId]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockExistingAssociation = {
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
  };

  describe("PUT /api/repuestos/[id]/ubicaciones/[assocId]", () => {
    it("should update quantity of repuesto-ubicacion association", async () => {
      const updateData = {
        cantidad: 15,
      };

      const updatedAssociation = {
        ...mockExistingAssociation,
        cantidad: 15,
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      (prisma.repuestoUbicacion.findFirst as jest.Mock).mockResolvedValue(mockExistingAssociation);
      (prisma.repuestoUbicacion.update as jest.Mock).mockResolvedValue(updatedAssociation);

      const request = new NextRequest("http://localhost:3000/api/repuestos/rep-1/ubicaciones/assoc-1", {
        method: "PUT",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await PUT(request, { params: { id: "rep-1", assocId: "assoc-1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(updatedAssociation);
      expect(data.message).toBe("Cantidad actualizada exitosamente");
      expect(prisma.repuestoUbicacion.update).toHaveBeenCalledWith({
        where: { id: "assoc-1" },
        data: { cantidad: 15 },
        include: expect.any(Object),
      });
    });

    it("should return 404 if association not found", async () => {
      (prisma.repuestoUbicacion.findFirst as jest.Mock).mockResolvedValue(null);

      const updateData = {
        cantidad: 15,
      };

      const request = new NextRequest("http://localhost:3000/api/repuestos/rep-1/ubicaciones/assoc-999", {
        method: "PUT",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await PUT(request, { params: { id: "rep-1", assocId: "assoc-999" } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Asociación no encontrada");
    });

    it("should return 404 if association belongs to different repuesto", async () => {
      const wrongAssociation = {
        id: "assoc-1",
        repuestoId: "rep-999", // Different repuesto
        armarioId: "arm-1",
        cantidad: 5,
      };

      (prisma.repuestoUbicacion.findFirst as jest.Mock).mockResolvedValue(wrongAssociation);

      const updateData = {
        cantidad: 15,
      };

      const request = new NextRequest("http://localhost:3000/api/repuestos/rep-1/ubicaciones/assoc-1", {
        method: "PUT",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await PUT(request, { params: { id: "rep-1", assocId: "assoc-1" } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Asociación no encontrada");
    });

    it("should return 400 if validation fails", async () => {
      const invalidData = {
        cantidad: -5, // Invalid negative quantity
      };

      const request = new NextRequest("http://localhost:3000/api/repuestos/rep-1/ubicaciones/assoc-1", {
        method: "PUT",
        body: JSON.stringify(invalidData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await PUT(request, { params: { id: "rep-1", assocId: "assoc-1" } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Datos inválidos");
    });

    it("should return 400 if route parameters are invalid", async () => {
      const updateData = {
        cantidad: 15,
      };

      const request = new NextRequest("http://localhost:3000/api/repuestos//ubicaciones//", {
        method: "PUT",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await PUT(request, { params: { id: "", assocId: "" } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Parámetros inválidos");
    });

    it("should return 401 if unauthorized", async () => {
      const { getServerSession } = require("@/lib/auth");
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const updateData = {
        cantidad: 15,
      };

      const request = new NextRequest("http://localhost:3000/api/repuestos/rep-1/ubicaciones/assoc-1", {
        method: "PUT",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await PUT(request, { params: { id: "rep-1", assocId: "assoc-1" } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("DELETE /api/repuestos/[id]/ubicaciones/[assocId]", () => {
    it("should delete repuesto-ubicacion association", async () => {
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      (prisma.repuestoUbicacion.findFirst as jest.Mock).mockResolvedValue(mockExistingAssociation);
      (prisma.repuestoUbicacion.delete as jest.Mock).mockResolvedValue(mockExistingAssociation);

      const request = new NextRequest("http://localhost:3000/api/repuestos/rep-1/ubicaciones/assoc-1", {
        method: "DELETE",
      });

      const response = await DELETE(request, { params: { id: "rep-1", assocId: "assoc-1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Asociación eliminada exitosamente");
      expect(prisma.repuestoUbicacion.delete).toHaveBeenCalledWith({
        where: { id: "assoc-1" },
      });
    });

    it("should return 404 if association not found", async () => {
      (prisma.repuestoUbicacion.findFirst as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/repuestos/rep-1/ubicaciones/assoc-999", {
        method: "DELETE",
      });

      const response = await DELETE(request, { params: { id: "rep-1", assocId: "assoc-999" } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Asociación no encontrada");
    });

    it("should return 404 if association belongs to different repuesto", async () => {
      const wrongAssociation = {
        id: "assoc-1",
        repuestoId: "rep-999", // Different repuesto
        armarioId: "arm-1",
        cantidad: 5,
      };

      (prisma.repuestoUbicacion.findFirst as jest.Mock).mockResolvedValue(wrongAssociation);

      const request = new NextRequest("http://localhost:3000/api/repuestos/rep-1/ubicaciones/assoc-1", {
        method: "DELETE",
      });

      const response = await DELETE(request, { params: { id: "rep-1", assocId: "assoc-1" } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Asociación no encontrada");
    });

    it("should return 400 if route parameters are invalid", async () => {
      const request = new NextRequest("http://localhost:3000/api/repuestos//ubicaciones//", {
        method: "DELETE",
      });

      const response = await DELETE(request, { params: { id: "", assocId: "" } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Parámetros inválidos");
    });

    it("should return 401 if unauthorized", async () => {
      const { getServerSession } = require("@/lib/auth");
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/repuestos/rep-1/ubicaciones/assoc-1", {
        method: "DELETE",
      });

      const response = await DELETE(request, { params: { id: "rep-1", assocId: "assoc-1" } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });
  });
});