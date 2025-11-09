import { NextRequest } from "next/server";
import { GET, POST } from "../route";
import { prisma } from "@/lib/prisma";

// Mock dependencies
const mockPrisma = {
  equipo: {
    count: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  repuestoEquipo: {
    create: jest.fn(),
    createMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

const mockGetServerSession = require("next-auth").getServerSession;

describe("/api/equipos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return equipos with pagination for authenticated user", async () => {
      // Mock authentication
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", email: "test@example.com" },
      });

      // Mock database response
      const mockEquipos = [
        {
          id: "1",
          codigo: "EQ-001",
          sap: "1234567890",
          nombre: "ESP20",
          marca: "Siemens",
          modelo: "S7-1200",
          descripcion: "PLC principal",
          isActive: true,
          createdAt: new Date("2023-01-01"),
          updatedAt: new Date("2023-01-01"),
          repuestos: [],
          _count: { repuestos: 0 },
        },
      ];

      mockPrisma.equipo.count.mockResolvedValue(1);
      mockPrisma.equipo.findMany.mockResolvedValue(mockEquipos);

      // Create mock request
      const request = new NextRequest("http://localhost:3000/api/equipos?page=1&limit=10");

      // Call the handler
      const response = await GET(request);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].codigo).toBe("EQ-001");
      expect(data.pagination).toBeDefined();
    });

    it("should filter equipos by search term", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", email: "test@example.com" },
      });

      mockPrisma.equipo.count.mockResolvedValue(1);
      mockPrisma.equipo.findMany.mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/equipos?search=ESP20");
      const response = await GET(request);

      expect(mockPrisma.equipo.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { codigo: { contains: "ESP20", mode: "insensitive" } },
            { sap: { contains: "ESP20", mode: "insensitive" } },
            { nombre: { contains: "ESP20", mode: "insensitive" } },
            { descripcion: { contains: "ESP20", mode: "insensitive" } },
            { marca: { contains: "ESP20", mode: "insensitive" } },
            { modelo: { contains: "ESP20", mode: "insensitive" } },
            { numeroSerie: { contains: "ESP20", mode: "insensitive" } },
          ],
          isActive: true,
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          repuestos: { include: { repuesto: true } },
          _count: { select: { repuestos: true } },
        },
      });
    });

    it("should return 401 for unauthenticated user", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/equipos");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });

    it("should handle database errors", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", email: "test@example.com" },
      });

      mockPrisma.equipo.count.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest("http://localhost:3000/api/equipos");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to fetch equipos");
    });
  });

  describe("POST", () => {
    it("should create new equipo for authenticated user", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", email: "test@example.com" },
      });

      const newEquipo = {
        codigo: "EQ-002",
        sap: "0987654321",
        nombre: "PREPMASTER",
        marca: "ABB",
        modelo: "ACS800",
      };

      const createdEquipo = {
        id: "2",
        ...newEquipo,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        repuestos: [],
        _count: { repuestos: 0 },
      };

      mockPrisma.equipo.findFirst.mockResolvedValue(null); // No duplicates
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });
      mockPrisma.equipo.create.mockResolvedValue(createdEquipo);

      const request = new NextRequest("http://localhost:3000/api/equipos", {
        method: "POST",
        body: JSON.stringify(newEquipo),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.codigo).toBe("EQ-002");
      expect(mockPrisma.equipo.create).toHaveBeenCalledWith({
        data: {
          ...newEquipo,
          isActive: true,
        },
        include: {
          repuestos: { include: { repuesto: true } },
          _count: { select: { repuestos: true } },
        },
      });
    });

    it("should prevent duplicate codigo", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", email: "test@example.com" },
      });

      const existingEquipo = {
        codigo: "EQ-001",
        nombre: "Existing Equipment",
      };

      mockPrisma.equipo.findFirst.mockResolvedValue(existingEquipo as any);

      const duplicateEquipo = {
        codigo: "EQ-001",
        nombre: "Duplicate Equipment",
      };

      const request = new NextRequest("http://localhost:3000/api/equipos", {
        method: "POST",
        body: JSON.stringify(duplicateEquipo),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Equipo with this código already exists");
    });

    it("should return 401 for unauthenticated user", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/equipos", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it("should create equipo with repuestos associations", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", email: "test@example.com" },
      });

      const equipoWithRepuestos = {
        codigo: "EQ-003",
        nombre: "Equipment with Repuestos",
        repuestos: [
          { repuestoId: "rep-1", cantidad: 2 },
          { repuestoId: "rep-2", cantidad: 1 },
        ],
      };

      const createdEquipo = {
        id: "3",
        codigo: "EQ-003",
        nombre: "Equipment with Repuestos",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        repuestos: [],
        _count: { repuestos: 2 },
      };

      mockPrisma.equipo.findFirst.mockResolvedValue(null);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        await callback(mockPrisma);
        return createdEquipo;
      });
      mockPrisma.equipo.create.mockResolvedValue(createdEquipo);
      mockPrisma.equipo.findUnique.mockResolvedValue(createdEquipo);

      const request = new NextRequest("http://localhost:3000/api/equipos", {
        method: "POST",
        body: JSON.stringify(equipoWithRepuestos),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.repuestoEquipo.createMany).toHaveBeenCalledWith({
        data: [
          { equipoId: "3", repuestoId: "rep-1", cantidad: 2 },
          { equipoId: "3", repuestoId: "rep-2", cantidad: 1 },
        ],
      });
    });
  });
});