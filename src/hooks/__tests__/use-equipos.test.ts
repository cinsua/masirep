import { renderHook, act, waitFor } from '@testing-library/react';
import { useEquipos, useEquiposExtended, useEquiposSearch, useEquiposWithRepuestos } from '../use-equipos';
import { useApiData } from '../use-api-data';

// Mock the useApiData hook
jest.mock('../use-api-data');

const mockUseApiData = useApiData as jest.MockedFunction<typeof useApiData>;

describe('useEquipos', () => {
  beforeEach(() => {
    mockUseApiData.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockEquipoData = [
    {
      id: '1',
      codigo: 'EQ-001',
      sap: 'SAP-001',
      nombre: 'Equipo de Prueba',
      descripcion: 'Descripción del equipo',
      marca: 'Marca Test',
      modelo: 'Modelo Test',
      numeroSerie: 'SN-001',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      repuestos: [],
      _count: { repuestos: 0 },
    },
  ];

  describe('useEquipos', () => {
    it('should call useApiData with correct endpoint', () => {
      const mockReturn = {
        data: [],
        loading: false,
        error: null,
        fetch: jest.fn(),
        fetchById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        reset: jest.fn(),
        refetch: jest.fn(),
        clearError: jest.fn(),
      };

      mockUseApiData.mockReturnValue(mockReturn);

      const { result } = renderHook(() => useEquipos());

      expect(mockUseApiData).toHaveBeenCalledWith('/api/equipos');
      expect(result.current).toEqual(mockReturn);
    });
  });

  describe('useEquiposExtended', () => {
    it('should provide extended functionality', async () => {
      const mockBaseHook = {
        data: mockEquipoData,
        loading: false,
        error: null,
        fetch: jest.fn(),
        fetchById: jest.fn().mockResolvedValue(mockEquipoData[0]),
        create: jest.fn().mockResolvedValue(mockEquipoData[0]),
        update: jest.fn().mockResolvedValue(mockEquipoData[0]),
        delete: jest.fn().mockResolvedValue(true),
        reset: jest.fn(),
        refetch: jest.fn(),
        clearError: jest.fn(),
      };

      mockUseApiData.mockReturnValue(mockBaseHook);

      const { result } = renderHook(() => useEquiposExtended());

      expect(result.current.data).toEqual(mockEquipoData);

      // Test createEquipo
      const newEquipo = {
        codigo: 'EQ-002',
        nombre: 'Nuevo Equipo',
        descripcion: 'Descripción',
      };

      act(() => {
        result.current.createEquipo(newEquipo);
      });

      expect(mockBaseHook.create).toHaveBeenCalledWith(newEquipo);

      // Test updateEquipo
      act(() => {
        result.current.updateEquipo('1', { nombre: 'Updated' });
      });

      expect(mockBaseHook.update).toHaveBeenCalledWith('1', { nombre: 'Updated' });

      // Test deleteEquipo
      act(() => {
        result.current.deleteEquipo('1');
      });

      expect(mockBaseHook.delete).toHaveBeenCalledWith('1');

      // Test getEquipoById
      await act(async () => {
        await result.current.getEquipoById('1');
      });

      expect(mockBaseHook.fetchById).toHaveBeenCalledWith('1');

      // Test searchEquipos
      act(() => {
        result.current.searchEquipos('equipo', 20);
      });

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({ search: 'equipo', limit: 20 });

      // Test getEquiposByMarca
      act(() => {
        result.current.getEquiposByMarca('Marca Test', 50);
      });

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({ search: 'Marca Test', limit: 50 });

      // Test getEquiposWithRepuestos
      act(() => {
        result.current.getEquiposWithRepuestos(50);
      });

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({
        limit: 50,
        sortBy: 'repuestos_count',
        sortOrder: 'desc',
      });
    });
  });

  describe('useEquiposSearch', () => {
    it('should handle debounced search', () => {
      const mockBaseHook = {
        data: mockEquipoData,
        loading: false,
        error: null,
        fetch: jest.fn(),
        fetchById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        reset: jest.fn(),
        refetch: jest.fn(),
        clearError: jest.fn(),
      };

      mockUseApiData.mockReturnValue(mockBaseHook);

      const { result } = renderHook(() => useEquiposSearch(300));

      expect(result.current.data).toEqual(mockEquipoData);
      expect(result.current.searchTerm).toBe('');
      expect(result.current.loading).toBe(false);

      // Test search term change
      act(() => {
        result.current.setSearchTerm('equipo');
      });

      expect(result.current.searchTerm).toBe('equipo');

      // Should not call fetch immediately due to debounce
      expect(mockBaseHook.fetch).not.toHaveBeenCalled();

      // Fast forward time
      jest.advanceTimersByTime(300);

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({ search: 'equipo', limit: 20 });
    });

    it('should fetch initial data when search term is empty', () => {
      const mockBaseHook = {
        data: [],
        loading: false,
        error: null,
        fetch: jest.fn(),
        fetchById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        reset: jest.fn(),
        refetch: jest.fn(),
        clearError: jest.fn(),
      };

      mockUseApiData.mockReturnValue(mockBaseHook);

      const { result } = renderHook(() => useEquiposSearch(100));

      act(() => {
        result.current.setSearchTerm('');
      });

      jest.advanceTimersByTime(100);

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({ limit: 20 });
    });
  });

  describe('useEquiposWithRepuestos', () => {
    it('should provide repuestos-specific functionality', () => {
      const mockBaseHook = {
        data: mockEquipoData,
        loading: false,
        error: null,
        fetch: jest.fn(),
        fetchById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        reset: jest.fn(),
        refetch: jest.fn(),
        clearError: jest.fn(),
      };

      mockUseApiData.mockReturnValue(mockBaseHook);

      const { result } = renderHook(() => useEquiposWithRepuestos());

      expect(result.current.data).toEqual(mockEquipoData);

      // Test getEquiposWithRepuestoCount
      act(() => {
        result.current.getEquiposWithRepuestoCount(1);
      });

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({
        limit: 100,
        sortBy: 'repuestos_count',
        sortOrder: 'desc',
      });

      // Test getEquiposWithoutRepuestos
      act(() => {
        result.current.getEquiposWithoutRepuestos();
      });

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({
        limit: 100,
        sortBy: 'repuestos_count',
        sortOrder: 'asc',
      });
    });
  });
});