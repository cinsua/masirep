import { useState, useCallback, useRef, useMemo } from "react";
import { ApiResponse, PaginationParams, PaginatedResponse } from "@/types/api";

export interface UseApiDataState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UseApiDataActions<T> {
  fetch: (params?: PaginationParams) => Promise<void>;
  fetchById: (id: string) => Promise<T | null>;
  create: (data: Partial<T>) => Promise<T | null>;
  update: (id: string, data: Partial<T>) => Promise<T | null>;
  delete: (id: string) => Promise<boolean>;
  reset: () => void;
  refetch: () => void;
  clearError: () => void;
}

interface CacheEntry<T> {
  data: T[];
  pagination?: any;
  timestamp: number;
}

export function useApiData<T = any>(endpoint: string): UseApiDataState<T> & UseApiDataActions<T> {
  const [state, setState] = useState<UseApiDataState<T>>({
    data: [],
    loading: false,
    error: null,
    pagination: undefined,
  });

  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());
  const lastParams = useRef<PaginationParams | undefined>(undefined);

  // Cache configuration
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  const MAX_CACHE_SIZE = 100;

  const getCacheKey = useCallback((params?: PaginationParams) => {
    return `${endpoint}?${JSON.stringify(params || {})}`;
  }, [endpoint]);

  const isCacheValid = useCallback((entry: CacheEntry<T>) => {
    return Date.now() - entry.timestamp < CACHE_TTL;
  }, []);

  const cleanCache = useCallback(() => {
    const now = Date.now();
    for (const [key, entry] of cache.current.entries()) {
      if (now - entry.timestamp > CACHE_TTL) {
        cache.current.delete(key);
      }
    }
    
    // Limit cache size
    if (cache.current.size > MAX_CACHE_SIZE) {
      const entries = Array.from(cache.current.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toDelete = entries.slice(0, cache.current.size - MAX_CACHE_SIZE);
      toDelete.forEach(([key]) => cache.current.delete(key));
    }
  }, []);

  const handleApiError = useCallback((error: any): string => {
    if (error?.error) return error.error;
    if (error?.message) return error.message;
    if (typeof error === 'string') return error;
    return "Error desconocido al cargar datos";
  }, []);

  const fetch = useCallback(async (params?: PaginationParams) => {
    const cacheKey = getCacheKey(params);
    
    // Check cache first
    const cachedEntry = cache.current.get(cacheKey);
    if (cachedEntry && isCacheValid(cachedEntry)) {
      setState({
        data: cachedEntry.data,
        loading: false,
        error: null,
        pagination: cachedEntry.pagination,
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    lastParams.current = params;

    try {
      const queryString = new URLSearchParams();
      if (params?.page) queryString.append('page', params.page.toString());
      if (params?.limit) queryString.append('limit', params.limit.toString());
      if (params?.search) queryString.append('search', params.search);
      if (params?.sortBy) queryString.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryString.append('sortOrder', params.sortOrder);

      const url = queryString.toString() ? `${endpoint}?${queryString}` : endpoint;
      const response = await global.fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: PaginatedResponse<T> = await response.json();

      if (result.success && result.data) {
        const newState = {
          data: result.data,
          loading: false,
          error: null,
          pagination: result.pagination,
        };

        setState(newState);

        // Cache the result
        cache.current.set(cacheKey, {
          data: result.data,
          pagination: result.pagination,
          timestamp: Date.now(),
        });

        cleanCache();
      } else {
        throw new Error(result.error || 'Error al cargar datos');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [endpoint, getCacheKey, isCacheValid, handleApiError, cleanCache]);

  const fetchById = useCallback(async (id: string): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await global.fetch(`${endpoint}/${id}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<T> = await response.json();

      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
        }));
        return result.data;
      } else {
        throw new Error(result.error || 'Error al cargar el elemento');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [endpoint, handleApiError]);

  const create = useCallback(async (data: Partial<T>): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await global.fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<T> = await response.json();

      if (result.success && result.data) {
        // Invalidate cache to force refresh
        cache.current.clear();
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
          data: [...prev.data, result.data!],
        }));
        
        return result.data;
      } else {
        throw new Error(result.error || 'Error al crear el elemento');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [endpoint, handleApiError]);

  const update = useCallback(async (id: string, data: Partial<T>): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await global.fetch(`${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<T> = await response.json();

      if (result.success && result.data) {
        // Invalidate cache to force refresh
        cache.current.clear();
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
          data: prev.data.map(item => 
            (item as any).id === id ? result.data! : item
          ),
        }));
        
        return result.data;
      } else {
        throw new Error(result.error || 'Error al actualizar el elemento');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [endpoint, handleApiError]);

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await global.fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse = await response.json();

      if (result.success) {
        // Invalidate cache to force refresh
        cache.current.clear();
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
          data: prev.data.filter(item => (item as any).id !== id),
        }));
        
        return true;
      } else {
        throw new Error(result.error || 'Error al eliminar el elemento');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [endpoint, handleApiError]);

  const reset = useCallback(() => {
    setState({
      data: [],
      loading: false,
      error: null,
      pagination: undefined,
    });
    cache.current.clear();
    lastParams.current = undefined;
  }, []);

  const refetch = useCallback(() => {
    if (lastParams.current) {
      fetch(lastParams.current);
    } else {
      fetch();
    }
  }, [fetch]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetch,
    fetchById,
    create,
    update,
    delete: deleteItem,
    reset,
    refetch,
    clearError,
  };
}

// Utility hook for prefetching data
export function usePrefetch<T = any>(endpoint: string, params?: PaginationParams) {
  const { fetch } = useApiData<T>(endpoint);
  
  return useCallback(() => {
    // Prefetch without updating state
    fetch(params || {}).catch(() => {
      // Silently fail prefetch
    });
  }, [endpoint, params, fetch]);
}

// Utility hook for debounced search
export function useDebouncedSearch<T = any>(endpoint: string, delay: number = 300) {
  const { fetch, data, loading, error } = useApiData<T>(endpoint);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFetch = useCallback((params?: PaginationParams) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      fetch(params);
    }, delay);
  }, [fetch, delay]);

  return {
    fetch: debouncedFetch,
    data,
    loading,
    error,
  };
}