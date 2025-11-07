import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('@/lib/auth', () => ({
  authOptions: {
    session: { strategy: 'jwt' },
  },
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

const mockPrismaComponente = {
  count: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  findFirst: jest.fn(),
  update: jest.fn(),
};

const mockPrisma = {
  componente: mockPrismaComponente,
  $transaction: jest.fn(),
} as any;

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

const mockGetServerSession = require('next-auth').getServerSession;

describe('/api/componentes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/componentes', () => {
    const mockComponentes = [
      {
        id: '1',
        categoria: 'RESISTENCIA',
        descripcion: 'Resistencia 1K',
        valorUnidad: [{ valor: '1K', unidad: 'Ω' }],
        stockMinimo: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ubicaciones: [
          {
            id: '1',
            cantidad: 50,
            cajoncito: { id: '1', nombre: 'Cajoncito 1', codigo: 'C1' },
          },
        ],
      },
      {
        id: '2',
        categoria: 'CAPACITOR',
        descripcion: 'Capacitor 100nF',
        valorUnidad: [{ valor: '100', unidad: 'nF' }],
        stockMinimo: 5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ubicaciones: [],
      },
    ];

    it('returns unauthorized when no session', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/componentes');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns componentes with pagination when authenticated', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.count.mockResolvedValue(2);
      mockPrisma.componente.findMany.mockResolvedValue(mockComponentes);

      const request = new NextRequest('http://localhost:3000/api/componentes?page=1&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('applies search filter correctly', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.count.mockResolvedValue(1);
      mockPrisma.componente.findMany.mockResolvedValue([mockComponentes[0]]);

      const request = new NextRequest('http://localhost:3000/api/componentes?search=Resistencia');
      await GET(request);

      expect(mockPrisma.componente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [{ descripcion: { contains: 'Resistencia', mode: 'insensitive' } }],
          }),
        })
      );
    });

    it('applies categoria filter correctly', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.count.mockResolvedValue(1);
      mockPrisma.componente.findMany.mockResolvedValue([mockComponentes[0]]);

      const request = new NextRequest('http://localhost:3000/api/componentes?categoria=RESISTENCIA');
      await GET(request);

      expect(mockPrisma.componente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoria: 'RESISTENCIA',
          }),
        })
      );
    });

    it('applies sorting correctly', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.count.mockResolvedValue(2);
      mockPrisma.componente.findMany.mockResolvedValue(mockComponentes);

      const request = new NextRequest('http://localhost:3000/api/componentes?sortBy=descripcion&sortOrder=asc');
      await GET(request);

      expect(mockPrisma.componente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { descripcion: 'asc' },
        })
      );
    });

    it('computes stockActual correctly', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.count.mockResolvedValue(1);
      mockPrisma.componente.findMany.mockResolvedValue([mockComponentes[0]]);

      const request = new NextRequest('http://localhost:3000/api/componentes');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data[0].stockActual).toBe(50);
      expect(data.data[0].valorUnidad).toEqual([{ valor: '1K', unidad: 'Ω' }]);
    });

    it('handles server errors gracefully', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.count.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/componentes');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('uses default pagination parameters', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.count.mockResolvedValue(0);
      mockPrisma.componente.findMany.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/componentes');
      await GET(request);

      expect(mockPrisma.componente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0, // (page - 1) * limit = (1 - 1) * 10 = 0
          take: 10,
        })
      );
    });
  });

  describe('POST /api/componentes', () => {
    const validComponenteData = {
      categoria: 'RESISTENCIA',
      descripcion: 'Nueva Resistencia',
      valorUnidad: [{ valor: '10K', unidad: 'Ω' }],
      stockMinimo: 5,
      ubicaciones: [
        {
          cajoncitoId: '1',
          cantidad: 25,
        },
      ],
    };

    const mockCreatedComponente = {
      id: '3',
      ...validComponenteData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ubicaciones: [
        {
          id: '3',
          componenteId: '3',
          cajoncitoId: '1',
          cantidad: 25,
          createdAt: new Date(),
          updatedAt: new Date(),
          cajoncito: { id: '1', nombre: 'Cajoncito 1', codigo: 'C1' },
        },
      ],
    };

    it('returns unauthorized when no session', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/componentes', {
        method: 'POST',
        body: JSON.stringify(validComponenteData),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('creates componente successfully with valid data', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback(mockPrisma);
      });
      mockPrisma.componente.create.mockResolvedValue(mockCreatedComponente);
      mockPrisma.componenteUbicacion = {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
        findMany: jest.fn().mockResolvedValue(mockCreatedComponente.ubicaciones),
      };

      const request = new NextRequest('http://localhost:3000/api/componentes', {
        method: 'POST',
        body: JSON.stringify(validComponenteData),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Componente creado exitosamente');
      expect(data.data.descripcion).toBe('Nueva Resistencia');
    });

    it('validates componente data and returns errors for invalid data', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });

      const invalidData = {
        categoria: 'INVALID_CATEGORY',
        descripcion: '',
        valorUnidad: [],
        stockMinimo: -1,
      };

      const request = new NextRequest('http://localhost:3000/api/componentes', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Datos inválidos');
      expect(data.details).toBeDefined();
      expect(Array.isArray(data.details)).toBe(true);
    });

    it('creates componente without ubicaciones when not provided', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      const { ubicaciones, ...componenteWithoutUbicaciones } = validComponenteData;

      const { ubicaciones: _, ...mockComponenteNoUbicaciones } = mockCreatedComponente;

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback(mockPrisma);
      });
      mockPrisma.componente.create.mockResolvedValue(mockComponenteNoUbicaciones);

      const request = new NextRequest('http://localhost:3000/api/componentes', {
        method: 'POST',
        body: JSON.stringify(componenteWithoutUbicaciones),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(response.status).toBeLessThan(400);
    });

    it('computes stockActual correctly on creation', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback(mockPrisma);
      });
      mockPrisma.componente.create.mockResolvedValue(mockCreatedComponente);
      mockPrisma.componenteUbicacion = {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
        findMany: jest.fn().mockResolvedValue(mockCreatedComponente.ubicaciones),
      };

      const request = new NextRequest('http://localhost:3000/api/componentes', {
        method: 'POST',
        body: JSON.stringify(validComponenteData),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data.data.stockActual).toBe(25);
    });

    it('handles database errors during creation', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.$transaction.mockRejectedValue(new Error('Database constraint error'));

      const request = new NextRequest('http://localhost:3000/api/componentes', {
        method: 'POST',
        body: JSON.stringify(validComponenteData),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('handles malformed JSON request', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });

      const request = new NextRequest('http://localhost:3000/api/componentes', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it('creates multiple ubicaciones correctly', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });

      const componenteWithMultipleUbicaciones = {
        ...validComponenteData,
        ubicaciones: [
          { cajoncitoId: '1', cantidad: 25 },
          { cajoncitoId: '2', cantidad: 15 },
        ],
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback(mockPrisma);
      });
      mockPrisma.componente.create.mockResolvedValue({
        ...mockCreatedComponente,
        ubicaciones: componenteWithMultipleUbicaciones.ubicaciones.map((ub, index) => ({
          ...ub,
          id: `${index + 1}`,
          componenteId: '3',
          createdAt: new Date(),
          updatedAt: new Date(),
          cajoncito: { id: ub.cajoncitoId, nombre: `Cajoncito ${ub.cajoncitoId}`, codigo: `C${ub.cajoncitoId}` },
        })),
      });
      mockPrisma.componenteUbicacion = {
        createMany: jest.fn().mockResolvedValue({ count: 2 }),
        findMany: jest.fn().mockResolvedValue([]),
      } as any;

      const request = new NextRequest('http://localhost:3000/api/componentes', {
        method: 'POST',
        body: JSON.stringify(componenteWithMultipleUbicaciones),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockPrisma.componenteUbicacion.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ cajoncitoId: '1', cantidad: 25 }),
          expect.objectContaining({ cajoncitoId: '2', cantidad: 15 }),
        ]),
      });
    });
  });
});