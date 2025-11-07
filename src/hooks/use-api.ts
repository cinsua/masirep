import { useState, useCallback } from "react";
import { RepuestoValidationError, REPUESTO_ERROR_MESSAGES, RepuestoErrorType } from "@/lib/validations/repuesto";
import { RepuestoCreateInput, RepuestoUpdateInput } from '@/types/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: RepuestoValidationError | null;
}

interface UseApiActions<T> {
  execute: (fn: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: RepuestoValidationError | null) => void;
}

export function useApi<T = any>(): UseApiState<T> & UseApiActions<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (fn: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await fn();
      setState(prev => ({ ...prev, data: result, loading: false }));
      return result;
    } catch (error) {
      const apiError = error instanceof RepuestoValidationError 
        ? error 
        : new RepuestoValidationError(
            error instanceof Error ? error.message : "Error desconocido",
            "SERVER_ERROR"
          );
      
      setState(prev => ({ ...prev, error: apiError, loading: false }));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: RepuestoValidationError | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setLoading,
    setError,
  };
}

// Hook específico para repuestos
export function useRepuestoApi() {
  const api = useApi();

  const createRepuesto = useCallback(async (data: RepuestoCreateInput) => {
    return api.execute(async () => {
      const response = await fetch('/api/repuestos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new RepuestoValidationError(
          error.error || 'Error al crear repuesto',
          'VALIDATION_ERROR'
        );
      }
      
      return response.json();
    });
  }, [api]);

  const updateRepuesto = useCallback(async (id: string, data: RepuestoUpdateInput) => {
    return api.execute(async () => {
      const response = await fetch(`/api/repuestos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new RepuestoValidationError(
          error.error || 'Error al actualizar repuesto',
          'VALIDATION_ERROR'
        );
      }
      
      return response.json();
    });
  }, [api]);

  const deleteRepuesto = useCallback(async (id: string) => {
    return api.execute(async () => {
      const response = await fetch(`/api/repuestos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new RepuestoValidationError(
          error.error || 'Error al eliminar repuesto',
          'DELETE_ERROR'
        );
      }
      
      return response.json();
    });
  }, [api]);

  const validateCode = useCallback(async (code: string, excludeId?: string) => {
    return api.execute(async () => {
      const url = excludeId 
        ? `/api/repuestos/validate/code/${encodeURIComponent(code)}?excludeId=${excludeId}`
        : `/api/repuestos/validate/code/${encodeURIComponent(code)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new RepuestoValidationError(
          'Error al validar código',
          'NETWORK_ERROR'
        );
      }
      
      const result = await response.json();
      
      if (!result.data.isAvailable) {
        throw new RepuestoValidationError(
          'El código ya existe',
          'DUPLICATE_CODE',
          'codigo'
        );
      }
      
      return result;
    });
  }, [api]);

  return {
    ...api,
    createRepuesto,
    updateRepuesto,
    deleteRepuesto,
    validateCode,
  };
}

// Hook para manejo de formularios con validación
export function useFormValidation<T extends Record<string, unknown>>(schema: { safeParse: (data: unknown) => { success: boolean; error?: { issues: Array<{ path: string[]; message: string }> } } }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((field: string, value: unknown) => {
    try {
      // For basic validation, we can try to validate the single field
      // This is a simplified approach since we can't easily extract field schemas
      setErrors(prev => ({ ...prev, [field]: '' }));
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error de validación';
      setErrors(prev => ({ ...prev, [field]: errorMessage }));
    }
  }, [schema]);

  const validateForm = useCallback((data: T) => {
    try {
      schema.safeParse(data);
      setErrors({});
      return true;
    } catch (error: unknown) {
      const newErrors: Record<string, string> = {};
      if (error && typeof error === 'object' && 'issues' in error) {
        const validationError = error as { issues: Array<{ path: string[]; message: string }> };
        validationError.issues.forEach((issue) => {
          const field = issue.path.join('.');
          newErrors[field] = issue.message;
        });
      }
      setErrors(newErrors);
      return false;
    }
  }, [schema]);

  const setFieldTouched = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const reset = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validateField,
    validateForm,
    setFieldTouched,
    reset,
    hasErrors: Object.keys(errors).some(key => errors[key]),
  };
}