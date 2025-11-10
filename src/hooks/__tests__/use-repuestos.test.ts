import { renderHook, act, waitFor } from '@testing-library/react';
import { useRepuestos, useRepuestosExtended, useRepuestosSearch, useRepuestosInventory, useRepuestoValidation } from '../use-repuestos';
import { useApiData } from '../use-api-data';

// Mock the useApiData hook
jest.mock('../use-api-data');

const mockUseApiData = useApiData as jest.MockedFunction<typeof useApiData>;

// Mock fetch for validation hook
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('useRepuestos', () => {
  beforeEach(() => {
    mockUseApiData.mockClear();
    mockFetch.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockRepuestoData = [
    {
      id: '1',
      codigo: 'REP-001',
      nombre: 'Repuesto de Prueba',
      descripcion: 'Descripción del repuesto',
      marca: 'Marca Test',
      modelo: 'Modelo Test',
      numeroParte: 'PN-001',
      stockMinimo: 10,
      stockActual: 25,
      categoria: 'CATEGORIA-1',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      equipos: [],
      ubicaciones: [],
    },
  ];

  describe('useRepuestos', () => {
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

      const { result } = renderHook(() => useRepuestos());

      expect(mockUseApiData).toHaveBeenCalledWith('/api/repuestos');
      expect(result.current).toEqual(mockReturn);
    });
  });

  describe('useRepuestosExtended', () => {
    it('should provide extended functionality', async () => {
      const mockBaseHook = {
        data: mockRepuestoData,
        loading: false,
        error: null,
        fetch: jest.fn(),
        fetchById: jest.fn().mockResolvedValue(mockRepuestoData[0]),
        create: jest.fn().mockResolvedValue(mockRepuestoData[0]),
        update: jest.fn().mockResolvedValue(mockRepuestoData[0]),
        delete: jest.fn().mockResolvedValue(true),
        reset: jest.fn(),
        refetch: jest.fn(),
        clearError: jest.fn(),
      };

      mockUseApiData.mockReturnValue(mockBaseHook);

      const { result } = renderHook(() => useRepuestosExtended());

      expect(result.current.data).toEqual(mockRepuestoData);

      // Test createRepuesto
      const newRepuesto = {
        codigo: 'REP-002',
        nombre: 'Nuevo Repuesto',
        descripcion: 'Descripción',
        stockMinimo: 5,
      };

      act(() => {
        result.current.createRepuesto(newRepuesto);
      });

      expect(mockBaseHook.create).toHaveBeenCalledWith(newRepuesto);

      // Test updateRepuesto
      act(() => {
        result.current.updateRepuesto('1', { nombre: 'Updated' });
      });

      expect(mockBaseHook.update).toHaveBeenCalledWith('1', { nombre: 'Updated' });

      // Test deleteRepuesto
      act(() => {
        result.current.deleteRepuesto('1');
      });

      expect(mockBaseHook.delete).toHaveBeenCalledWith('1');

      // Test getRepuestoById
      await act(async () => {
        await result.current.getRepuestoById('1');
      });

      expect(mockBaseHook.fetchById).toHaveBeenCalledWith('1');

      // Test searchRepuestos
      act(() => {
        result.current.searchRepuestos('repuesto', 20);
      });

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({ search: 'repuesto', limit: 20 });

      // Test getRepuestosByCategoria
      act(() => {
        result.current.getRepuestosByCategoria('CATEGORIA-1', 50);
      });

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({ search: 'CATEGORIA-1', limit: 50 });

      // Test getRepuestosWithLowStock
      act(() => {
        result.current.getRepuestosWithLowStock();
      });

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({
        limit: 100,
        sortBy: 'stock_actual',
        sortOrder: 'asc',
      });

      // Test getRepuestosByMarca
      act(() => {
        result.current.getRepuestosByMarca('Marca Test', 50);
      });

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({ search: 'Marca Test', limit: 50 });
    });
  });

  describe('useRepuestosSearch', () => {
    it('should handle debounced search', () => {
      const mockBaseHook = {
        data: mockRepuestoData,
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

      const { result } = renderHook(() => useRepuestosSearch(300));

      expect(result.current.data).toEqual(mockRepuestoData);
      expect(result.current.searchTerm).toBe('');
      expect(result.current.loading).toBe(false);

      // Test search term change
      act(() => {
        result.current.setSearchTerm('repuesto');
      });

      expect(result.current.searchTerm).toBe('repuesto');

      // Should not call fetch immediately due to debounce
      expect(mockBaseHook.fetch).not.toHaveBeenCalled();

      // Fast forward time
      jest.advanceTimersByTime(300);

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({ search: 'repuesto', limit: 20 });
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

      const { result } = renderHook(() => useRepuestosSearch(100));

      act(() => {
        result.current.setSearchTerm('');
      });

      jest.advanceTimersByTime(100);

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({ limit: 20 });
    });
  });

  describe('useRepuestosInventory', () => {
    it('should provide inventory-specific functionality', () => {
      const mockBaseHook = {
        data: mockRepuestoData,
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

      const { result } = renderHook(() => useRepuestosInventory());

      expect(result.current.data).toEqual(mockRepuestoData);

      // Test getCriticalStock
      act(() => {
        result.current.getCriticalStock();
      });

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({
        limit: 50,
        sortBy: 'stock_ratio',
        sortOrder: 'asc',
      });

      // Test getMostUsed
      act(() => {
        result.current.getMostUsed();
      });

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({
        limit: 50,
        sortBy: 'usage_count',
        sortOrder: 'desc',
      });

      // Test getByLocation
      act(() => {
        result.current.getByLocation('armario', 'ARM-001');
      });

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({
        search: 'armario:ARM-001',
        limit: 100,
      });
    });
  });

  describe('useRepuestoValidation', () => {
    it('should validate code successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { isAvailable: true },
        }),
      } as Response);

      const { result } = renderHook(() => useRepuestoValidation());

      expect(result.current.validating).toBe(false);
      expect(result.current.validationError).toBe(null);

      const isValid = await result.current.validateCode('NEW-CODE');

      expect(isValid).toBe(true);
      expect(result.current.validating).toBe(false);
      expect(result.current.validationError).toBe(null);
      expect(mockFetch).toHaveBeenCalledWith('/api/repuestos/validate/code/NEW-CODE');
    });

    it('should handle duplicate code', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { isAvailable: false },
        }),
      } as Response);

      const { result } = renderHook(() => useRepuestoValidation());

      const isValid = await result.current.validateCode('EXISTING-CODE');

      expect(isValid).toBe(false);
      expect(result.current.validating).toBe(false);
      expect(result.current.validationError).toBe('El código ya existe');
    });

    it('should handle validation with exclude ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { isAvailable: true },
        }),
      } as Response);

      const { result } = renderHook(() => useRepuestoValidation());

      await result.current.validateCode('CODE-001', 'exclude-123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/repuestos/validate/code/CODE-001?excludeId=exclude-123'
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response);

      const { result } = renderHook(() => useRepuestoValidation());

      const isValid = await result.current.validateCode('ERROR-CODE');

      expect(isValid).toBe(false);
      expect(result.current.validating).toBe(false);
      expect(result.current.validationError).toBe('Error al validar código');
    });

    it('should clear validation error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { isAvailable: false },
        }),
      } as Response);

      const { result } = renderHook(() => useRepuestoValidation());

      await result.current.validateCode('DUPLICATE-CODE');

      expect(result.current.validationError).toBe('El código ya existe');

      act(() => {
        result.current.clearValidationError();
      });

      expect(result.current.validationError).toBe(null);
    });
  });
});