import { useApiData } from "./use-api-data";
import { ComponenteWithRelations, ComponenteCreateInput, ComponenteUpdateInput } from "@/types/api";

/**
 * Hook específico para gestionar componentes electrónicos
 * Proporciona operaciones CRUD y búsqueda con cache automático
 */
export function useComponentes() {
  return useApiData<ComponenteWithRelations>('/api/componentes');
}

/**
 * Hook extendido para componentes con operaciones específicas
 */
export function useComponentesExtended() {
  const baseHook = useApiData<ComponenteWithRelations>('/api/componentes');

  const createComponente = async (data: ComponenteCreateInput): Promise<ComponenteWithRelations | null> => {
    return baseHook.create(data as Partial<ComponenteWithRelations>);
  };

  const updateComponente = async (id: string, data: ComponenteUpdateInput): Promise<ComponenteWithRelations | null> => {
    return baseHook.update(id, data as Partial<ComponenteWithRelations>);
  };

  const deleteComponente = async (id: string): Promise<boolean> => {
    return baseHook.delete(id);
  };

  const getComponenteById = async (id: string): Promise<ComponenteWithRelations | null> => {
    return baseHook.fetchById(id);
  };

  const searchComponentes = async (searchTerm: string, limit: number = 20) => {
    return baseHook.fetch({ search: searchTerm, limit });
  };

  const getComponentesByCategoria = async (categoria: string, limit: number = 50) => {
    return baseHook.fetch({ search: categoria, limit });
  };

  return {
    ...baseHook,
    createComponente,
    updateComponente,
    deleteComponente,
    getComponenteById,
    searchComponentes,
    getComponentesByCategoria,
  };
}

/**
 * Hook para búsqueda debounced de componentes
 * Ideal para campos de autocomplete o búsqueda en tiempo real
 */
export function useComponentesSearch(debounceMs: number = 300) {
  const { fetch, data, loading, error } = useApiData<ComponenteWithRelations>('/api/componentes');
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

// Import React for the hooks that use it
import React from "react";