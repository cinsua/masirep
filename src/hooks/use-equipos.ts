import { useApiData } from "./use-api-data";
import { EquipoWithRelations, EquipoCreateInput, EquipoUpdateInput } from "@/types/api";

/**
 * Hook específico para gestionar equipos
 * Proporciona operaciones CRUD y búsqueda con cache automático
 */
export function useEquipos() {
  return useApiData<EquipoWithRelations>('/api/equipos');
}

/**
 * Hook extendido para equipos con operaciones específicas
 */
export function useEquiposExtended() {
  const baseHook = useApiData<EquipoWithRelations>('/api/equipos');

  const createEquipo = async (data: EquipoCreateInput): Promise<EquipoWithRelations | null> => {
    return baseHook.create(data as Partial<EquipoWithRelations>);
  };

  const updateEquipo = async (id: string, data: EquipoUpdateInput): Promise<EquipoWithRelations | null> => {
    return baseHook.update(id, data as Partial<EquipoWithRelations>);
  };

  const deleteEquipo = async (id: string): Promise<boolean> => {
    return baseHook.delete(id);
  };

  const getEquipoById = async (id: string): Promise<EquipoWithRelations | null> => {
    return baseHook.fetchById(id);
  };

  const searchEquipos = async (searchTerm: string, limit: number = 20) => {
    return baseHook.fetch({ search: searchTerm, limit });
  };

  const getEquiposByMarca = async (marca: string, limit: number = 50) => {
    return baseHook.fetch({ search: marca, limit });
  };

  const getEquiposWithRepuestos = async (limit: number = 50) => {
    return baseHook.fetch({ 
      limit, 
      sortBy: 'repuestos_count',
      sortOrder: 'desc' 
    });
  };

  return {
    ...baseHook,
    createEquipo,
    updateEquipo,
    deleteEquipo,
    getEquipoById,
    searchEquipos,
    getEquiposByMarca,
    getEquiposWithRepuestos,
  };
}

/**
 * Hook para búsqueda debounced de equipos
 * Ideal para campos de autocomplete o búsqueda en tiempo real
 */
export function useEquiposSearch(debounceMs: number = 300) {
  const { fetch, data, loading, error } = useApiData<EquipoWithRelations>('/api/equipos');
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
 * Hook para gestión de equipos con repuestos asociados
 */
export function useEquiposWithRepuestos() {
  const baseHook = useApiData<EquipoWithRelations>('/api/equipos');

  const getEquiposWithRepuestoCount = async (minRepuestos: number = 1) => {
    return baseHook.fetch({ 
      limit: 100,
      sortBy: 'repuestos_count',
      sortOrder: 'desc' 
    });
  };

  const getEquiposWithoutRepuestos = async () => {
    return baseHook.fetch({ 
      limit: 100,
      sortBy: 'repuestos_count',
      sortOrder: 'asc' 
    });
  };

  return {
    ...baseHook,
    getEquiposWithRepuestoCount,
    getEquiposWithoutRepuestos,
  };
}

// Import React for the hooks that use it
import React from "react";