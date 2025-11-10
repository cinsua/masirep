# Sistema de Iconos de Masirep

## 🎨 Overview

Este documento define el sistema de iconos consistente utilizado en toda la aplicación Masirep para el sistema de gestión de inventario de mantenimiento. Los iconos fueron cuidadosamente seleccionados para proporcionar una experiencia visual intuitiva para los técnicos.

## 📋 Tabla de Iconos por Entidad

### Estructuras de Almacenamiento

| Entidad | Icono | Visual | Descripción |
|---------|-------|--------|-------------|
| **Estantería** | `rows-3` | ≡ | Representa las filas horizontales apiladas de una estantería industrial |
| **Armario** | `columns-2` | ▦ | Muestra la estructura vertical de un armario de almacenamiento |
| **Estante** | `rectangle-horizontal` | ▬ | Representa una superficie horizontal plana para almacenamiento |

### Contenedores y Organizadores

| Entidad | Icono | Visual | Descripción |
|---------|-------|--------|-------------|
| **Cajoncito** | `shopping-bag` | 🛍️ | Pequeño contenedor tipo bolsa para componentes pequeños |
| **Organizadores** | `grid-3x3` | ⊞ | Sistema de cuadrícula para organización múltiple |
| **Caja** | `archive` | 📦 | Contenedor genérico para almacenamiento |
| **División** | `frame` | ⬜ | Compartimento o sección dentro de un contenedor mayor |

### Entidades de Inventario

| Entidad | Icono | Visual | Descripción |
|---------|-------|--------|-------------|
| **Repuesto** | `wrench` | 🔧 | Herramienta que representa repuestos y piezas |
| **Componente** | `cpu` | 💻 | Componente electrónico o tecnológico |
| **Equipo** | `monitor` | 🖥️ | Equipo completo o dispositivo |

## 🛠️ Implementación Técnica

### Archivo de Configuración

El sistema de iconos está centralizado en:
```
src/lib/icons.ts
```

### Uso en Componentes

```typescript
import { getEntityIcon } from '@/lib/icons';
import { Icon } from '@/components/ui/icon';

// Ejemplo de uso
const iconoEstanteria = getEntityIcon('estanteria'); // 'rows-3'
const iconoArmario = getEntityIcon('armario'); // 'columns-2'

// En un componente
<Icon name={iconoEstanteria} className="w-5 h-5" />
```

### Tipos TypeScript

```typescript
export type IconType = keyof typeof ICON_SYSTEM;
export type IconName = typeof ICON_SYSTEM[IconType];
```

## 🎯 Directrices de Uso

### 1. Consistencia
- Siempre usar `getEntityIcon()` para obtener iconos de entidades
- No hardcodear nombres de iconos en componentes

### 2. Accesibilidad
- Incluir siempre texto alternativo descriptivo
- Usar iconos con suficiente contraste visual

### 3. Escalado
- Mantener proporciones consistentes (w-5 h-5 para tamaños estándar)
- Usar variantes de tamaño según contexto (w-4 h-4 para espacios reducidos)

## 🔄 Iconos de Acciones Comunes

| Acción | Icono | Uso Típico |
|--------|-------|------------|
| Agregar | `plus` | Botones de creación |
| Editar | `edit` | Modificación de registros |
| Eliminar | `trash-2` | Eliminación de elementos |
| Ver | `eye` | Vista detallada |
| Buscar | `search` | Campos de búsqueda |
| Filtrar | `filter` | Opciones de filtrado |

## 📍 Iconos de Navegación

| Elemento | Icono | Contexto |
|-----------|-------|----------|
| Inicio | `home` | Navegación principal |
| Dashboard | `layout-dashboard` | Panel principal |
| Configuración | `settings` | Preferencias del sistema |
| Ubicación | `map-pin` | Gestión de ubicaciones |

## 🎨 Iconos de Estados

| Estado | Icono | Color Asociado |
|--------|-------|----------------|
| Activo | `check-circle` | Verde |
| Inactivo | `x-circle` | Rojo |
| Advertencia | `alert-triangle` | Amarillo |
| Error | `x-circle` | Rojo |
| Éxito | `check-circle` | Verde |

## 📚 Ejemplos Prácticos

### Componente de Tarjeta de Ubicación

```typescript
interface LocationCardProps {
  type: 'estanteria' | 'armario' | 'cajoncito';
  name: string;
}

export function LocationCard({ type, name }: LocationCardProps) {
  const icon = getEntityIcon(type);
  
  return (
    <div className="flex items-center space-x-2">
      <Icon name={icon} className="w-5 h-5 text-blue-600" />
      <span>{name}</span>
    </div>
  );
}
```

### Navegación con Breadcrumbs

```typescript
const breadcrumbIcons = {
  ubicacion: getEntityIcon('ubicacion'),
  armario: getEntityIcon('armario'),
  cajon: getEntityIcon('division')
};
```

## 🚀 Buenas Prácticas

1. **Mantener consistencia visual** - Usar siempre los mismos iconos para las mismas entidades
2. **Pensar en el contexto** - Considerar el tamaño y el color según el uso
3. **Test de usabilidad** - Verificar que los técnicos entienden los iconos
4. **Documentar cambios** - Actualizar esta documentación al modificar iconos

## 📝 Historial de Cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2025-11-08 | Creación inicial del sistema de iconos |

---

**Autor**: Carlos  
**Última Actualización**: 2025-11-08  
**Versión**: 1.0.0