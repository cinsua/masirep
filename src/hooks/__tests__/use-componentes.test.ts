import { renderHook, act, waitFor } from '@testing-library/react';
import { useComponentes, useComponentesExtended, useComponentesSearch } from '../use-componentes';
import { useApiData } from '../use-api-data';

// Mock the useApiData hook
jest.mock('../use-api-data');

const mockUseApiData = useApiData as jest.MockedFunction<typeof useApiData>;

describe('useComponentes', () => {
  beforeEach(() => {
    mockUseApiData.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockComponenteData = [
    {
      id: '1',
      categoria: 'RESISTENCIA' as const,
      descripcion: 'Resistencia 10k',
      valorUnidad: [{ valor: '10k', unidad: 'Ω' }],
      stockMinimo: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ubicaciones: [],
      stockActual: 25,
    },
  ];

  describe('useComponentes', () => {
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

      const { result } = renderHook(() => useComponentes());

      expect(mockUseApiData).toHaveBeenCalledWith('/api/componentes');
      expect(result.current).toEqual(mockReturn);
    });
  });

  describe('useComponentesExtended', () => {
    it('should provide extended functionality', async () => {
      const mockBaseHook = {
        data: mockComponenteData,
        loading: false,
        error: null,
        fetch: jest.fn(),
        fetchById: jest.fn().mockResolvedValue(mockComponenteData[0]),
        create: jest.fn().mockResolvedValue(mockComponenteData[0]),
        update: jest.fn().mockResolvedValue(mockComponenteData[0]),
        delete: jest.fn().mockResolvedValue(true),
        reset: jest.fn(),
        refetch: jest.fn(),
        clearError: jest.fn(),
      };

      mockUseApiData.mockReturnValue(mockBaseHook);

      const { result } = renderHook(() => useComponentesExtended());

      expect(result.current.data).toEqual(mockComponenteData);

      // Test createComponente
      const newComponente = {
        categoria: 'CAPACITOR' as const,
        descripcion: 'Capacitor 100uF',
        valorUnidad: [{ valor: '100uF', unidad: 'F' }],
        stockMinimo: 5,
      };

      act(() => {
        result.current.createComponente(newComponente);
      });

      expect(mockBaseHook.create).toHaveBeenCalledWith(newComponente);

      // Test updateComponente
      act(() => {
        result.current.updateComponente('1', { descripcion: 'Updated' });
      });

      expect(mockBaseHook.update).toHaveBeenCalledWith('1', { descripcion: 'Updated' });

      // Test deleteComponente
      act(() => {
        result.current.deleteComponente('1');
      });

      expect(mockBaseHook.delete).toHaveBeenCalledWith('1');

      // Test getComponenteById
      await act(async () => {
        await result.current.getComponenteById('1');
      });

      expect(mockBaseHook.fetchById).toHaveBeenCalledWith('1');

      // Test searchComponentes
      act(() => {
        result.current.searchComponentes('resistencia', 20);
      });

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({ search: 'resistencia', limit: 20 });

      // Test getComponentesByCategoria
      act(() => {
        result.current.getComponentesByCategoria('RESISTENCIA', 50);
      });

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({ search: 'RESISTENCIA', limit: 50 });
    });
  });

  describe('useComponentesSearch', () => {
    it('should handle debounced search', () => {
      const mockBaseHook = {
        data: mockComponenteData,
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

      const { result } = renderHook(() => useComponentesSearch(300));

      expect(result.current.data).toEqual(mockComponenteData);
      expect(result.current.searchTerm).toBe('');
      expect(result.current.loading).toBe(false);

      // Test search term change
      act(() => {
        result.current.setSearchTerm('resistencia');
      });

      expect(result.current.searchTerm).toBe('resistencia');

      // Should not call fetch immediately due to debounce
      expect(mockBaseHook.fetch).not.toHaveBeenCalled();

      // Fast forward time
      jest.advanceTimersByTime(300);

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({ search: 'resistencia', limit: 20 });
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

      const { result } = renderHook(() => useComponentesSearch(100));

      act(() => {
        result.current.setSearchTerm('');
      });

      jest.advanceTimersByTime(100);

      expect(mockBaseHook.fetch).toHaveBeenCalledWith({ limit: 20 });
    });

    it('should clear timeout on search term change', () => {
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

      const { result } = renderHook(() => useComponentesSearch(300));

      // First search
      act(() => {
        result.current.setSearchTerm('resistencia');
      });

      // Second search before timeout completes
      act(() => {
        result.current.setSearchTerm('capacitor');
      });

      jest.advanceTimersByTime(300);

      // Should only call fetch once with the last search term
      expect(mockBaseHook.fetch).toHaveBeenCalledTimes(1);
      expect(mockBaseHook.fetch).toHaveBeenCalledWith({ search: 'capacitor', limit: 20 });
    });
  });
});