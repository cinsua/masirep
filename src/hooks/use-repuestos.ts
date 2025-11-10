import { useApiData } from "./use-api-data";
import { RepuestoWithRelations, RepuestoCreateInput, RepuestoUpdateInput } from "@/types/api";

/**
 * Hook específico para gestionar repuestos
 * Proporciona operaciones CRUD y búsqueda con cache automático
 */
export function useRepuestos() {
  return useApiData<RepuestoWithRelations>('/api/repuestos');
}

/**
 * Hook extendido para repuestos con operaciones específicas
 */
export function useRepuestosExtended() {
  const baseHook = useApiData<RepuestoWithRelations>('/api/repuestos');

  const createRepuesto = async (data: RepuestoCreateInput): Promise<RepuestoWithRelations | null> => {
    return baseHook.create(data as Partial<RepuestoWithRelations>);
  };

  const updateRepuesto = async (id: string, data: RepuestoUpdateInput): Promise<RepuestoWithRelations | null> => {
    return baseHook.update(id, data as Partial<RepuestoWithRelations>);
  };

  const deleteRepuesto = async (id: string): Promise<boolean> => {
    return baseHook.delete(id);
  };

  const getRepuestoById = async (id: string): Promise<RepuestoWithRelations | null> => {
    return baseHook.fetchById(id);
  };

  const searchRepuestos = async (searchTerm: string, limit: number = 20) => {
    return baseHook.fetch({ search: searchTerm, limit });
  };

  const getRepuestosByCategoria = async (categoria: string, limit: number = 50) => {
    return baseHook.fetch({ search: categoria, limit });
  };

  const getRepuestosWithLowStock = async () => {
    return baseHook.fetch({ 
      limit: 100,
      sortBy: 'stock_actual',
      sortOrder: 'asc' 
    });
  };

  const getRepuestosByMarca = async (marca: string, limit: number = 50) => {
    return baseHook.fetch({ search: marca, limit });
  };

  return {
    ...baseHook,
    createRepuesto,
    updateRepuesto,
    deleteRepuesto,
    getRepuestoById,
    searchRepuestos,
    getRepuestosByCategoria,
    getRepuestosWithLowStock,
    getRepuestosByMarca,
  };
}

/**
 * Hook para búsqueda debounced de repuestos
 * Ideal para campos de autocomplete o búsqueda en tiempo real
 */
export function useRepuestosSearch(debounceMs: number = 300) {
  const { fetch, data, loading, error } = useApiData<RepuestoWithRelations>('/api/repuestos');
  const [searchTerm, setSearchTerm] = React.useState('');
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (searchTerm.trim()) {
      timeoutRef.current = setTimeout(() => {
        fetch({ search: searchTerm, limit: 20 });
      }, debounceMs);
} else {
      fetch({ search: "", limit: 20 });
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, debounceMs, fetch]);

  return {
    data,
    loading,
    error,
    searchTerm,
    setSearchTerm,
  };
}

/**
 * Hook para gestión de inventario de repuestos
 */
export function useRepuestosInventory() {
  const baseHook = useApiData<RepuestoWithRelations>('/api/repuestos');

  const getCriticalStock = async () => {
    return baseHook.fetch({ 
      limit: 50,
      sortBy: 'stock_ratio',
      sortOrder: 'asc' 
    });
  };

  const getMostUsed = async () => {
    return baseHook.fetch({ 
      limit: 50,
      sortBy: 'usage_count',
      sortOrder: 'desc' 
    });
  };

  const getByLocation = async (locationType: string, locationId: string) => {
    return baseHook.fetch({ 
      search: `${locationType}:${locationId}`,
      limit: 100 
    });
  };

  return {
    ...baseHook,
    getCriticalStock,
    getMostUsed,
    getByLocation,
  };
}

/**
 * Hook para validación de códigos de repuestos
 */
export function useRepuestoValidation() {
  const [validating, setValidating] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const validateCode = async (code: string, excludeId?: string): Promise<boolean> => {
    setValidating(true);
    setValidationError(null);

    try {
      const url = excludeId 
        ? `/api/repuestos/validate/code/${encodeURIComponent(code)}?excludeId=${excludeId}`
        : `/api/repuestos/validate/code/${encodeURIComponent(code)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al validar código');
      }
      
      const result = await response.json();
      
      if (!result.data.isAvailable) {
        setValidationError('El código ya existe');
        return false;
      }
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de validación';
      setValidationError(errorMessage);
      return false;
    } finally {
      setValidating(false);
    }
  };

  return {
    validateCode,
    validating,
    validationError,
    clearValidationError: () => setValidationError(null),
  };
}

// Import React for the hooks that use it
import React from "react";