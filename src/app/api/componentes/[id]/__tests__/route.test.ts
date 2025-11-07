import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '../route';
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
  findFirst: jest.fn(),
  update: jest.fn(),
};

const mockPrisma = {
  componente: mockPrismaComponente,
} as any;

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

const mockGetServerSession = require('next-auth').getServerSession;

describe('/api/componentes/[id]', () => {
  const mockComponenteId = '1';

  const mockComponente = {
    id: mockComponenteId,
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/componentes/[id]', () => {
    it('returns unauthorized when no session', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/componentes/1');
      const response = await GET(request, { params: Promise.resolve({ id: mockComponenteId }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns componente when found', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.findFirst.mockResolvedValue(mockComponente);

      const request = new NextRequest('http://localhost:3000/api/componentes/1');
      const response = await GET(request, { params: Promise.resolve({ id: mockComponenteId }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(mockComponenteId);
      expect(data.data.descripcion).toBe('Resistencia 1K');
    });

    it('returns 404 when componente not found', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.findFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/componentes/999');
      const response = await GET(request, { params: Promise.resolve({ id: '999' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Componente no encontrado');
    });

    it('returns 404 for inactive componente', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.findFirst.mockResolvedValue({
        ...mockComponente,
        isActive: false,
      });

      const request = new NextRequest('http://localhost:3000/api/componentes/1');
      const response = await GET(request, { params: Promise.resolve({ id: mockComponenteId }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Componente no encontrado');
    });

    it('computes stockActual correctly', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.findFirst.mockResolvedValue(mockComponente);

      const request = new NextRequest('http://localhost:3000/api/componentes/1');
      const response = await GET(request, { params: Promise.resolve({ id: mockComponenteId }) });
      const data = await response.json();

      expect(data.data.stockActual).toBe(50);
      expect(data.data.valorUnidad).toEqual([{ valor: '1K', unidad: 'Ω' }]);
    });

    it('handles database errors gracefully', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.findFirst.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/componentes/1');
      const response = await GET(request, { params: Promise.resolve({ id: mockComponenteId }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('includes cajoncito information in ubicaciones', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.findFirst.mockResolvedValue(mockComponente);

      const request = new NextRequest('http://localhost:3000/api/componentes/1');
      const response = await GET(request, { params: Promise.resolve({ id: mockComponenteId }) });
      const data = await response.json();

      expect(data.data.ubicaciones[0].cajoncito).toEqual({
        id: '1',
        nombre: 'Cajoncito 1',
        codigo: 'C1',
      });
    });
  });

  describe('PUT /api/componentes/[id]', () => {
    const validUpdateData = {
      descripcion: 'Resistencia Actualizada',
      stockMinimo: 15,
    };

    const updatedComponente = {
      ...mockComponente,
      ...validUpdateData,
    };

    it('returns unauthorized when no session', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/componentes/1', {
        method: 'PUT',
        body: JSON.stringify(validUpdateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PUT(request, { params: Promise.resolve({ id: mockComponenteId }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('updates componente successfully with valid data', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.findFirst.mockResolvedValue(mockComponente);
      mockPrisma.componente.update.mockResolvedValue(updatedComponente);

      const request = new NextRequest('http://localhost:3000/api/componentes/1', {
        method: 'PUT',
        body: JSON.stringify(validUpdateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PUT(request, { params: Promise.resolve({ id: mockComponenteId }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Componente actualizado exitosamente');
      expect(data.data.descripcion).toBe('Resistencia Actualizada');
      expect(data.data.stockMinimo).toBe(15);
    });

    it('returns 404 when componente to update not found', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.findFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/componentes/999', {
        method: 'PUT',
        body: JSON.stringify(validUpdateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PUT(request, { params: Promise.resolve({ id: '999' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Componente no encontrado');
    });

    it('validates update data and returns errors for invalid data', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.findFirst.mockResolvedValue(mockComponente);

      const invalidUpdateData = {
        categoria: 'INVALID_CATEGORY',
        stockMinimo: -1,
      };

      const request = new NextRequest('http://localhost:3000/api/componentes/1', {
        method: 'PUT',
        body: JSON.stringify(invalidUpdateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PUT(request, { params: Promise.resolve({ id: mockComponenteId }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Datos inválidos');
      expect(data.details).toBeDefined();
      expect(Array.isArray(data.details)).toBe(true);
    });

    it('allows partial updates', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.findFirst.mockResolvedValue(mockComponente);

      const partialUpdate = { descripcion: 'Nueva descripción' };
      const partiallyUpdatedComponente = { ...mockComponente, ...partialUpdate };

      mockPrisma.componente.update.mockResolvedValue(partiallyUpdatedComponente);

      const request = new NextRequest('http://localhost:3000/api/componentes/1', {
        method: 'PUT',
        body: JSON.stringify(partialUpdate),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PUT(request, { params: Promise.resolve({ id: mockComponenteId }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.descripcion).toBe('Nueva descripción');
      expect(data.data.categoria).toBe('RESISTENCIA'); // Unchanged
    });

    it('updates only provided fields', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.findFirst.mockResolvedValue(mockComponente);
      mockPrisma.componente.update.mockResolvedValue(updatedComponente);

      const request = new NextRequest('http://localhost:3000/api/componentes/1', {
        method: 'PUT',
        body: JSON.stringify(validUpdateData),
        headers: { 'Content-Type': 'application/json' },
      });
      await PUT(request, { params: Promise.resolve({ id: mockComponenteId }) });

      expect(mockPrisma.componente.update).toHaveBeenCalledWith({
        where: { id: mockComponenteId },
        data: {
          descripcion: 'Resistencia Actualizada',
          stockMinimo: 15,
        },
        include: {
          ubicaciones: {
            include: {
              cajoncito: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                },
              },
            },
          },
        },
      });
    });

    it('handles empty update data gracefully', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.findFirst.mockResolvedValue(mockComponente);
      mockPrisma.componente.update.mockResolvedValue(mockComponente);

      const request = new NextRequest('http://localhost:3000/api/componentes/1', {
        method: 'PUT',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PUT(request, { params: Promise.resolve({ id: mockComponenteId }) });

      expect(response.status).toBe(200);
      expect(response.status).toBeLessThan(400);
    });

    it('handles malformed JSON request', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });

      const request = new NextRequest('http://localhost:3000/api/componentes/1', {
        method: 'PUT',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PUT(request, { params: Promise.resolve({ id: mockComponenteId }) });

      expect(response.status).toBe(500);
    });

    it('computes stockActual after update', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.findFirst.mockResolvedValue(mockComponente);
      mockPrisma.componente.update.mockResolvedValue(updatedComponente);

      const request = new NextRequest('http://localhost:3000/api/componentes/1', {
        method: 'PUT',
        body: JSON.stringify(validUpdateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PUT(request, { params: Promise.resolve({ id: mockComponenteId }) });
      const data = await response.json();

      expect(data.data.stockActual).toBe(50);
    });
  });

  describe('DELETE /api/componentes/[id]', () => {
    it('returns unauthorized when no session', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/componentes/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: Promise.resolve({ id: mockComponenteId }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('soft deletes componente successfully', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.findFirst.mockResolvedValue(mockComponente);
      mockPrisma.componente.update.mockResolvedValue({
        ...mockComponente,
        isActive: false,
      });

      const request = new NextRequest('http://localhost:3000/api/componentes/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: Promise.resolve({ id: mockComponenteId }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Componente eliminado exitosamente');
    });

    it('returns 404 when componente to delete not found', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.findFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/componentes/999', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: Promise.resolve({ id: '999' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Componente no encontrado');
    });

    it('returns 404 for inactive componente', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.findFirst.mockResolvedValue({
        ...mockComponente,
        isActive: false,
      });

      const request = new NextRequest('http://localhost:3000/api/componentes/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: Promise.resolve({ id: mockComponenteId }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Componente no encontrado');
    });

    it('performs soft delete by setting isActive to false', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.findFirst.mockResolvedValue(mockComponente);
      mockPrisma.componente.update.mockResolvedValue({
        ...mockComponente,
        isActive: false,
      });

      const request = new NextRequest('http://localhost:3000/api/componentes/1', {
        method: 'DELETE',
      });
      await DELETE(request, { params: Promise.resolve({ id: mockComponenteId }) });

      expect(mockPrisma.componente.update).toHaveBeenCalledWith({
        where: { id: mockComponenteId },
        data: { isActive: false },
      });
    });

    it('handles database errors during deletion', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.findFirst.mockResolvedValue(mockComponente);
      mockPrisma.componente.update.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/componentes/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: Promise.resolve({ id: mockComponenteId }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('does not hard delete componente', async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: '1' } });
      mockPrisma.componente.findFirst.mockResolvedValue(mockComponente);

      // Mock the update to verify it's called with isActive: false
      const updateSpy = jest.spyOn(mockPrisma.componente, 'update');
      updateSpy.mockResolvedValue({
        ...mockComponente,
        isActive: false,
      });

      const request = new NextRequest('http://localhost:3000/api/componentes/1', {
        method: 'DELETE',
      });
      await DELETE(request, { params: Promise.resolve({ id: mockComponenteId }) });

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: mockComponenteId },
        data: { isActive: false },
      });

      // Ensure no hard delete method is called
      expect(mockPrisma.componente.findFirst).toHaveBeenCalledTimes(1);
      expect(mockPrisma.componente.update).toHaveBeenCalledTimes(1);
    });
  });
});