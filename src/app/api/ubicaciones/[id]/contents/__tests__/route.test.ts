import { NextRequest } from "next/server";
import { GET } from "../route";
import { prisma } from "@/lib/prisma";

// Mock dependencies
jest.mock("@/lib/auth", () => ({
  getServerSession: jest.fn(),
  authOptions: {},
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    ubicacion: {
      findUnique: jest.fn(),
    },
    armario: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    estanteria: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    estante: {
      findMany: jest.fn(),
    },
    cajon: {
      findMany: jest.fn(),
    },
    division: {
      findMany: jest.fn(),
    },
    organizador: {
      findMany: jest.fn(),
    },
    cajoncito: {
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

describe("/api/ubicaciones/[id]/contents", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUbicacion = {
    id: "ubic-1",
    nombre: "Almacén Central",
    codigo: "UBIC-001",
  };

  const mockArmario = {
    id: "arm-1",
    nombre: "Armario Principal",
    codigo: "ARM-001",
    ubicacionId: "ubic-1",
  };

  const mockEstanteria = {
    id: "est-1",
    nombre: "Estantería de Componentes",
    codigo: "EST-001",
    ubicacionId: "ubic-1",
  };

  const mockRepuestos = [
    {
      id: "assoc-1",
      cantidad: 10,
      repuesto: {
        id: "rep-1",
        nombre: "Fusible 5A",
        codigo: "REP-001",
        descripcion: "Fusible de 5 amperios",
        categoria: "FUSIBLE",
        stockMinimo: 10,
        isActive: true,
      },
      armario: mockArmario,
    },
    {
      id: "assoc-2",
      cantidad: 5,
      repuesto: {
        id: "rep-2",
        nombre: "Resistencia 10k",
        codigo: "REP-002",
        descripcion: "Resistencia de 10k ohmios",
        categoria: "RESISTENCIA",
        stockMinimo: 5,
        isActive: true,
      },
      estanteria: mockEstanteria,
    },
  ];

  const mockComponentes = [
    {
      id: "assoc-3",
      cantidad: 20,
      componente: {
        id: "comp-1",
        nombre: "Resistencia SMD 10k",
        codigo: "COMP-001",
        descripcion: "Resistencia SMD de 10k ohmios",
        categoria: "RESISTENCIA",
        stockMinimo: 20,
        isActive: true,
      },
      cajoncito: {
        id: "caj-1",
        nombre: "Cajoncito de resistencias SMD",
        codigo: "CAJ-001",
      },
    },
  ];

  describe("GET /api/ubicaciones/[id]/contents", () => {
    it("should return all contents (repuestos and componentes) for a location", async () => {
      (prisma.ubicacion.findUnique as jest.Mock).mockResolvedValue(mockUbicacion);
      (prisma.armario.findMany as jest.Mock).mockResolvedValue([mockArmario]);
      (prisma.estanteria.findMany as jest.Mock).mockResolvedValue([mockEstanteria]);
      (prisma.repuestoUbicacion.findMany as jest.Mock).mockResolvedValue(mockRepuestos);
      (prisma.componenteUbicacion.findMany as jest.Mock).mockResolvedValue(mockComponentes);

      const request = new NextRequest("http://localhost:3000/api/ubicaciones/ubic-1/contents");
      const response = await GET(request, { params: { id: "ubic-1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.repuestos).toEqual(mockRepuestos);
      expect(data.data.componentes).toEqual(mockComponentes);
      expect(data.data.summary.totalRepuestos).toBe(2);
      expect(data.data.summary.totalComponentes).toBe(1);
      expect(data.data.summary.totalItems).toBe(3);
    });

    it("should return only repuestos when itemType is 'repuestos'", async () => {
      (prisma.ubicacion.findUnique as jest.Mock).mockResolvedValue(mockUbicacion);
      (prisma.armario.findMany as jest.Mock).mockResolvedValue([mockArmario]);
      (prisma.repuestoUbicacion.findMany as jest.Mock).mockResolvedValue(mockRepuestos);

      const request = new NextRequest("http://localhost:3000/api/ubicaciones/ubic-1/contents?itemType=repuestos");
      const response = await GET(request, { params: { id: "ubic-1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.repuestos).toEqual(mockRepuestos);
      expect(data.data.componentes).toEqual([]);
      expect(data.data.summary.totalRepuestos).toBe(2);
      expect(data.data.summary.totalComponentes).toBe(0);
      expect(data.data.summary.totalItems).toBe(2);
    });

    it("should return only componentes when itemType is 'componentes'", async () => {
      (prisma.ubicacion.findUnique as jest.Mock).mockResolvedValue(mockUbicacion);
      (prisma.estanteria.findMany as jest.Mock).mockResolvedValue([mockEstanteria]);
      (prisma.componenteUbicacion.findMany as jest.Mock).mockResolvedValue(mockComponentes);

      const request = new NextRequest("http://localhost:3000/api/ubicaciones/ubic-1/contents?itemType=componentes");
      const response = await GET(request, { params: { id: "ubic-1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.repuestos).toEqual([]);
      expect(data.data.componentes).toEqual(mockComponentes);
      expect(data.data.summary.totalRepuestos).toBe(0);
      expect(data.data.summary.totalComponentes).toBe(1);
      expect(data.data.summary.totalItems).toBe(1);
    });

    it("should handle pagination correctly", async () => {
      (prisma.ubicacion.findUnique as jest.Mock).mockResolvedValue(mockUbicacion);
      (prisma.armario.findMany as jest.Mock).mockResolvedValue([mockArmario]);
      (prisma.repuestoUbicacion.findMany as jest.Mock).mockResolvedValue(mockRepuestos);
      (prisma.componenteUbicacion.findMany as jest.Mock).mockResolvedValue(mockComponentes);

      const request = new NextRequest("http://localhost:3000/api/ubicaciones/ubic-1/contents?page=1&limit=10");
      const response = await GET(request, { params: { id: "ubic-1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.pagination.page).toBe(1);
      expect(data.data.pagination.limit).toBe(10);
      expect(data.data.pagination.totalPages).toBe(1);
      expect(data.data.pagination.total).toBe(3);
    });

    it("should return empty results when location has no contents", async () => {
      (prisma.ubicacion.findUnique as jest.Mock).mockResolvedValue(mockUbicacion);
      (prisma.armario.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.estanteria.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.repuestoUbicacion.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.componenteUbicacion.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/ubicaciones/ubic-1/contents");
      const response = await GET(request, { params: { id: "ubic-1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.repuestos).toEqual([]);
      expect(data.data.componentes).toEqual([]);
      expect(data.data.summary.totalRepuestos).toBe(0);
      expect(data.data.summary.totalComponentes).toBe(0);
      expect(data.data.summary.totalItems).toBe(0);
    });

    it("should return 404 if location not found", async () => {
      (prisma.ubicacion.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/ubicaciones/ubic-999/contents");
      const response = await GET(request, { params: { id: "ubic-999" } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Ubicación no encontrada");
    });

    it("should return 401 if unauthorized", async () => {
      const { getServerSession } = require("@/lib/auth");
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/ubicaciones/ubic-1/contents");
      const response = await GET(request, { params: { id: "ubic-1" } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });

    it("should handle invalid itemType parameter", async () => {
      const request = new NextRequest("http://localhost:3000/api/ubicaciones/ubic-1/contents?itemType=invalid");
      const response = await GET(request, { params: { id: "ubic-1" } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Parámetros inválidos");
    });

    it("should handle invalid page parameter", async () => {
      const request = new NextRequest("http://localhost:3000/api/ubicaciones/ubic-1/contents?page=invalid");
      const response = await GET(request, { params: { id: "ubic-1" } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Parámetros inválidos");
    });

    it("should handle invalid limit parameter", async () => {
      const request = new NextRequest("http://localhost:3000/api/ubicaciones/ubic-1/contents?limit=invalid");
      const response = await GET(request, { params: { id: "ubic-1" } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Parámetros inválidos");
    });

    it("should exclude children when includeChildren is false", async () => {
      (prisma.ubicacion.findUnique as jest.Mock).mockResolvedValue(mockUbicacion);
      (prisma.armario.findMany as jest.Mock).mockResolvedValue([mockArmario]);
      (prisma.repuestoUbicacion.findMany as jest.Mock).mockResolvedValue(mockRepuestos.slice(0, 1)); // Only items in the location itself

      const request = new NextRequest("http://localhost:3000/api/ubicaciones/ubic-1/contents?includeChildren=false");
      const response = await GET(request, { params: { id: "ubic-1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.repuestos).toHaveLength(1);
    });
  });

  describe("Location Type Tests", () => {
    it("should handle armario location type", async () => {
      const mockArmarioLocation = {
        id: "arm-1",
        nombre: "Armario Principal",
        codigo: "ARM-001",
        ubicacionId: "ubic-1",
      };

      (prisma.armario.findUnique as jest.Mock).mockResolvedValue(mockArmarioLocation);
      (prisma.cajon.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.repuestoUbicacion.findMany as jest.Mock).mockResolvedValue(mockRepuestos);
      (prisma.componenteUbicacion.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/ubicaciones/arm-1/contents");
      const response = await GET(request, { params: { id: "arm-1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.armario.findUnique).toHaveBeenCalledWith({
        where: { id: "arm-1" },
        select: expect.any(Object),
      });
    });

    it("should handle estanteria location type", async () => {
      const mockEstanteriaLocation = {
        id: "est-1",
        nombre: "Estantería de Componentes",
        codigo: "EST-001",
        ubicacionId: "ubic-1",
      };

      (prisma.estanteria.findUnique as jest.Mock).mockResolvedValue(mockEstanteriaLocation);
      (prisma.estante.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.organizador.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.repuestoUbicacion.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.componenteUbicacion.findMany as jest.Mock).mockResolvedValue(mockComponentes);

      const request = new NextRequest("http://localhost:3000/api/ubicaciones/est-1/contents");
      const response = await GET(request, { params: { id: "est-1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.estanteria.findUnique).toHaveBeenCalledWith({
        where: { id: "est-1" },
        select: expect.any(Object),
      });
    });

    it("should handle cajoncito location type", async () => {
      const mockCajoncito = {
        id: "caj-1",
        nombre: "Cajoncito de resistencias",
        codigo: "CAJ-001",
        organizadorId: "org-1",
      };

      (prisma.cajoncito.findUnique as jest.Mock).mockResolvedValue(mockCajoncito);
      (prisma.repuestoUbicacion.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.componenteUbicacion.findMany as jest.Mock).mockResolvedValue(mockComponentes);

      const request = new NextRequest("http://localhost:3000/api/ubicaciones/caj-1/contents");
      const response = await GET(request, { params: { id: "caj-1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.cajoncito.findUnique).toHaveBeenCalledWith({
        where: { id: "caj-1" },
        select: expect.any(Object),
      });
    });
  });
});