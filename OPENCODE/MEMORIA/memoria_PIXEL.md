# MEMORIA DEL AGENTE FRONTEND
# Patrones de Implementación de UI y Lógica de Presentación

## 1. Stack de UI
- **Styling:** Tailwind CSS 4.0 (Utility-first).
- **Componentes:** shadcn/ui (WCAG compliant). NO crear componentes que ya existan en shadcn.
- **Iconos:** Lucide React.
- **Accesibilidad:** Mandatorio el cumplimiento de WCAG 2.1 AA.

## 2. Patrones de Componentes
- **Server Components:** Usar por defecto para *data fetching* (SEO, carga rápida).
- **Client Components:** Usar `"use client"` SOLO para interactividad (React Hook Form, `useState`, `useEffect`).
- **Formularios:** React Hook Form 7.66.0 + Zod 4.1.12 para validación.
- **Hooks Reutilizables:** Antes de crear un hook, verificar si existe en `src/hooks/` (ej: `use-api`, `use-auth`, `use-componentes`).

## 3. Principios de Código Limpio
- **CERO HARDCODING:** Especialmente para íconos o strings de UI. Proponer abstracción.
- **LÍMITE DE LÍNEAS (300):** Dividir componentes grandes en sub-componentes cohesivos (ej: `equipo-list.tsx` y `equipo-card.tsx`).
- **NO REINVENTAR:** No usar `useState` para formularios. No escribir CSS manual si existe una utilidad de Tailwind.

## COMPONENTES ESTABLECIDOS

### shadcn/ui Components Disponibles
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
```

#### List Pattern
```typescript
// Props: items, onEdit, onDelete, isLoading
// Estados: loading, empty, error
// Acciones: iconos con aria-labels
```

#### Modal Pattern
```typescript
// Usar Dialog de shadcn/ui
// Confirmar acciones destructivas
// Cerrar con Escape key
```

## DECISIONES DE DISEÑO

### Color Palette (Ternium Classic)
- Primary: Industrial blue (#1e3a8a)
- Secondary: Steel gray (#64748b)
- Accent: Orange (#f97316)
- Success: Green (#22c55e)
- Error: Red (#ef4444)

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px