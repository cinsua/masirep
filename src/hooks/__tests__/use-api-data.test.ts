import { renderHook, act, waitFor } from '@testing-library/react';
import { useApiData } from '../use-api-data';

// Mock fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('useApiData', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockApiResponse = {
    success: true,
    data: [{ id: '1', name: 'Test Item' }],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };

  describe('fetch', () => {
    it('should fetch data successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const { result } = renderHook(() => useApiData('/api/test'));

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual([]);

      act(() => {
        result.current.fetch();
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.data).toEqual(mockApiResponse.data);
        expect(result.current.pagination).toEqual(mockApiResponse.pagination);
        expect(result.current.error).toBe(null);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/test');
    });

    it('should handle fetch error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Network error' }),
      } as Response);

      const { result } = renderHook(() => useApiData('/api/test'));

      act(() => {
        result.current.fetch();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Network error');
        expect(result.current.data).toEqual([]);
      });
    });

    it('should use cache for repeated requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const { result } = renderHook(() => useApiData('/api/test'));

      // First fetch
      act(() => {
        result.current.fetch();
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockApiResponse.data);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second fetch with same params should use cache
      act(() => {
        result.current.fetch();
      });

      // Should not call fetch again due to cache
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should pass query parameters correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const { result } = renderHook(() => useApiData('/api/test'));

      act(() => {
        result.current.fetch({
          page: 2,
          limit: 5,
          search: 'test',
          sortBy: 'name',
          sortOrder: 'desc',
        });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test?page=2&limit=5&search=test&sortBy=name&sortOrder=desc'
      );
    });
  });

  describe('fetchById', () => {
    it('should fetch item by id successfully', async () => {
      const mockItem = { id: '1', name: 'Test Item' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockItem,
        }),
      } as Response);

      const { result } = renderHook(() => useApiData('/api/test'));

      const item = await result.current.fetchById('1');

      expect(item).toEqual(mockItem);
      expect(mockFetch).toHaveBeenCalledWith('/api/test/1');
    });

    it('should return null on fetchById error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Not found' }),
      } as Response);

      const { result } = renderHook(() => useApiData('/api/test'));

      const item = await result.current.fetchById('999');

      expect(item).toBe(null);
      expect(result.current.error).toBe('Not found');
    });
  });

  describe('create', () => {
    it('should create item successfully', async () => {
      const newItem = { name: 'New Item' };
      const createdItem = { id: '2', ...newItem };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: createdItem,
        }),
      } as Response);

      const { result } = renderHook(() => useApiData('/api/test'));

      const created = await result.current.create(newItem);

      expect(created).toEqual(createdItem);
      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
    });

    it('should return null on create error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Validation error' }),
      } as Response);

      const { result } = renderHook(() => useApiData('/api/test'));

      const created = await result.current.create({ name: '' });

      expect(created).toBe(null);
      expect(result.current.error).toBe('Validation error');
    });
  });

  describe('update', () => {
    it('should update item successfully', async () => {
      const updatedItem = { id: '1', name: 'Updated Item' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: updatedItem,
        }),
      } as Response);

      const { result } = renderHook(() => useApiData('/api/test'));

      const updated = await result.current.update('1', { name: 'Updated Item' });

      expect(updated).toEqual(updatedItem);
      expect(mockFetch).toHaveBeenCalledWith('/api/test/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Updated Item' }),
      });
    });
  });

  describe('delete', () => {
    it('should delete item successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
        }),
      } as Response);

      const { result } = renderHook(() => useApiData('/api/test'));

      const deleted = await result.current.delete('1');

      expect(deleted).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/test/1', {
        method: 'DELETE',
      });
    });

    it('should return false on delete error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Cannot delete' }),
      } as Response);

      const { result } = renderHook(() => useApiData('/api/test'));

      const deleted = await result.current.delete('1');

      expect(deleted).toBe(false);
      expect(result.current.error).toBe('Cannot delete');
    });
  });

  describe('reset', () => {
    it('should reset state to initial values', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const { result } = renderHook(() => useApiData('/api/test'));

      // Fetch some data first
      act(() => {
        result.current.fetch();
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockApiResponse.data);
      });

      // Reset the state
      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.pagination).toBe(undefined);
    });
  });

  describe('refetch', () => {
    it('should refetch with last used parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const { result } = renderHook(() => useApiData('/api/test'));

      // Initial fetch with params
      act(() => {
        result.current.fetch({ search: 'test' });
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockApiResponse.data);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('/api/test?search=test');

      // Refetch should use same params
      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockApiResponse.data);
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenLastCalledWith('/api/test?search=test');
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Test error' }),
      } as Response);

      const { result } = renderHook(() => useApiData('/api/test'));

      act(() => {
        result.current.fetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Test error');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('cache expiration', () => {
    it('should expire cache after TTL', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const { result } = renderHook(() => useApiData('/api/test'));

      // First fetch
      act(() => {
        result.current.fetch();
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockApiResponse.data);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Fast forward time beyond cache TTL (5 minutes)
      jest.advanceTimersByTime(6 * 60 * 1000);

      // Second fetch should call API again due to cache expiration
      act(() => {
        result.current.fetch();
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockApiResponse.data);
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});