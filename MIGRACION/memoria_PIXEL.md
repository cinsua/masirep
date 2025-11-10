# MEMORIA DEL AGENTE FRONTEND (MONOREPO)
# Patrones de Implementación de UI y Lógica de Presentación

## 1. Stack de UI Monorepo
- **Runtime:** Vite + React 19.2.0 (ubicado en `apps/web/`)
- **Styling:** Tailwind CSS 4.0 (Utility-first).
- **Componentes:** shadcn/ui (WCAG compliant) desde `packages/ui/`. NO crear componentes que ya existan en shadcn.
- **Iconos:** Lucide React.
- **Accesibilidad:** Mandatorio el cumplimiento de WCAG 2.1 AA.
- **Tipado:** TypeScript strict con tipos desde `packages/types/`.

## 2. Patrones de Componentes
- **Todos los componentes son Client Components:** En Vite + React, no existe distinción Server/Client como en Next.js.
- **Data Fetching:** Usar hooks personalizados con `useEffect` o React Query para llamadas a API.
- **Interactividad:** Usar `"use client"` por defecto para cualquier componente con estado o interactividad.
- **Formularios:** React Hook Form 7.66.0 + Zod 4.1.12 para validación.
- **Hooks Reutilizables:** Antes de crear un hook, verificar si existe en `apps/web/src/hooks/` (ej: `use-api`, `use-auth`, `use-componentes`).

## 3. Principios de Código Limpio
- **CERO HARDCODING:** Especialmente para íconos o strings de UI. Proponer abstracción.
- **LÍMITE DE LÍNEAS (300):** Dividir componentes grandes en sub-componentes cohesivos (ej: `equipo-list.tsx` y `equipo-card.tsx`).
- **NO REINVENTAR:** No usar `useState` para formularios. No escribir CSS manual si existe una utilidad de Tailwind.

## 4. Componentes Compartidos del Monorepo
- **Base UI:** Importar desde `packages/ui/` (shadcn components)
- **Tipos:** Importar interfaces desde `packages/types/api.ts`
- **Iconos:** Centralizar en `packages/ui/icons.ts` si se necesita extender
- **Utilidades:** Compartir en `packages/ui/utils.ts` si aplica

## COMPONENTES ESTABLECIDOS

### shadcn/ui Components (Desde packages/ui/)
- Alert, AlertDialog
- Badge, Button
- Card, CardHeader, CardContent
- Dialog, DialogTrigger
- DropdownMenu
- Input, Label, Textarea
- Progress, ScrollArea
- Separator, Table, Tabs

### Patrones de Composición

#### Form Pattern
```typescript
// Siempre usar React Hook Form + Zod
// Props: initialData, onSubmit, onCancel
// Estados: isSubmitting, error
// Validación: aria-labels, error messages
// Tipos: Importar desde packages/types/
```

#### List Pattern
```typescript
// Props: items, onEdit, onDelete, isLoading
// Estados: loading, empty, error
// Acciones: iconos con aria-labels
// Componentes: Usar Table de packages/ui/
```

#### Modal Pattern
```typescript
// Usar Dialog de packages/ui/
// Confirmar acciones destructivas
// Cerrar con Escape key
// Tipado estricto para props
```

## 5. Data Fetching e Integración con API FastAPI

### Data Fetching Pattern
```typescript
// apps/web/src/lib/api.ts
import { RepuestoCreate, RepuestoResponse } from '@masirep/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = {
  repuestos: {
    create: async (data: RepuestoCreate): Promise<RepuestoResponse> => {
      const response = await fetch(`${API_BASE}/api/repuestos/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    
    list: async (): Promise<RepuestoResponse[]> => {
      const response = await fetch(`${API_BASE}/api/repuestos/`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      return response.json();
    },
  },
};
```

### Custom Hook Pattern
```typescript
// apps/web/src/hooks/use-repuestos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { RepuestoCreate, RepuestoResponse } from '@masirep/types';

export const useRepuestos = () => {
  return useQuery({
    queryKey: ['repuestos'],
    queryFn: apiClient.repuestos.list,
  });
};

export const useCreateRepuesto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.repuestos.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repuestos'] });
    },
  });
};
```

## 6. Estructura de Archivos Frontend

```
apps/web/
├── src/
│   ├── components/          # Componentes específicos del web app
│   │   ├── repuestos/
│   │   ├── equipos/
│   │   └── ubicaciones/
│   ├── hooks/              # Hooks personalizados
│   ├── lib/               # Utilidades y configuración
│   │   ├── api.ts        # Cliente API
│   │   ├── auth.ts       # Utilidades de autenticación
│   │   └── utils.ts      # Utilidades generales
│   ├── pages/             # Páginas de la aplicación
│   └── main.tsx          # Entry point
├── public/               # Assets estáticos
├── index.html           # Template HTML
└── vite.config.ts       # Configuración Vite
```

## 7. Configuración de Vite y Monorepo

### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@masirep/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@masirep/types': path.resolve(__dirname, '../../packages/types/src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

### package.json Dependencies
```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.66.0",
    "zod": "^4.1.12",
    "@tanstack/react-query": "^5.0.0",
    "@masirep/ui": "workspace:*",
    "@masirep/types": "workspace:*",
    "lucide-react": "^0.394.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.2.0",
    "tailwindcss": "^4.0.0"
  }
}
```

## 8. Autenticación con FastAPI

### Auth Provider Pattern
```typescript
// apps/web/src/contexts/auth-context.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '@masirep/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Validar token con API
      validateToken(token).then(user => {
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      });
    }
  }, []);
  
  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## 9. Manejo de Estados y Carga

### Loading States Pattern
```typescript
// Componente con estados de carga
import { Button } from '@masirep/ui';
import { useCreateRepuesto } from '@/hooks/use-repuestos';

export const RepuestoForm = () => {
  const createRepuesto = useCreateRepuesto();
  
  const handleSubmit = (data: RepuestoCreate) => {
    createRepuesto.mutate(data);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      
      <Button 
        type="submit" 
        disabled={createRepuesto.isPending}
      >
        {createRepuesto.isPending ? 'Guardando...' : 'Guardar'}
      </Button>
      
      {createRepuesto.isError && (
        <div className="text-red-500">
          Error: {createRepuesto.error.message}
        </div>
      )}
    </form>
  );
};
```

## 10. Testing de Componentes

### Test Pattern
```typescript
// apps/web/src/components/__tests__/repuesto-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RepuestoForm } from '../repuesto-form';
import { RepuestoCreate } from '@masirep/types';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('RepuestoForm', () => {
  it('should submit form data', async () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <RepuestoForm />
      </QueryClientProvider>
    );
    
    fireEvent.change(screen.getByLabelText('Código'), {
      target: { value: 'TEST-001' },
    });
    
    fireEvent.click(screen.getByText('Guardar'));
    
    // Assert...
  });
});
```

## COORDINACIÓN CON OTROS AGENTES

### Con ARQUITECTO
- Implementar componentes según especificaciones de diseño
- Usar tipos definidos en packages/types/
- Seguir estructura de componentes establecida

### Con BACK (FastAPI)
- Consumir endpoints según contratos definidos
- Implementar manejo de errores y estados de carga
- Mantener sincronización de tipos Pydantic ↔ TypeScript

### Con DEVOPS
- Configurar variables de entorno para Vite
- Optimizar build y bundle size
- Coordinar deploy de app web

### Con REVIEW
- Implementar accesibilidad WCAG AA
- Optimizar performance de componentes
- Seguir patrones de calidad establecidos