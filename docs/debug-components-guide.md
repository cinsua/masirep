# Sistema de Depuración de Componentes

## 🎯 Propósito

Este sistema permite identificar fácilmente cualquier componente React en el DOM del navegador mediante atributos `data-debug` personalizados. Es especialmente útil para:

- **Identificar componentes rápidamente** con el inspector del navegador
- **Facilitar la comunicación** entre diseñadores UX y desarrolladores
- **Agilizar el proceso de depuración** y corrección de errores
- **Mejorar la colaboración** en equipos multidisciplinarios

## 🚀 Características

### ✅ Atributos Automáticos
- `data-debug-component-name`: Nombre del componente
- `data-debug-component-file`: Ruta relativa del archivo

### ✅ Configuración Flexible
- Habilitar/deshabilitar globalmente
- Excluir componentes específicos
- Configuración por entorno
- Modo verbose para desarrollo

### ✅ Múltiples Formas de Uso
- Función `createDebugAttributes()`
- Hook `useDebugAttributes()`
- HOC `withDebugAttributes()`

## 📦 Instalación y Configuración

### 1. Variables de Entorno

Añade a tu archivo `.env.local`:

```bash
# Habilitar atributos de depuración (default: true en desarrollo)
NEXT_PUBLIC_DEBUG_COMPONENTS=true

# Incluir ruta del archivo (default: true)
NEXT_PUBLIC_DEBUG_INCLUDE_FILE_PATH=true

# Modo verbose con logs en consola (default: false)
NEXT_PUBLIC_DEBUG_VERBOSE=true
```

### 2. Configuración por Defecto

El sistema se configura automáticamente según el entorno:

- **Development**: Habilitado por defecto
- **Production**: Deshabilitado por defecto
- **Test**: Habilitado por defecto

## 🔧 Uso Básico

### Método 1: Función `createDebugAttributes`

```tsx
import { createDebugAttributes } from '@/lib/debug-attributes';

export function MiComponente() {
  const debugAttrs = createDebugAttributes({
    componentName: 'MiComponente',
    filePath: 'src/components/mi-componente.tsx'
  });

  return (
    <div {...debugAttrs}>
      Contenido del componente
    </div>
  );
}
```

### Método 2: Hook `useDebugAttributes`

```tsx
import { useDebugAttributes } from '@/lib/debug-attributes';

export function MiComponente() {
  const debugAttrs = useDebugAttributes('MiComponente');

  return (
    <div {...debugAttrs}>
      Contenido del componente
    </div>
  );
}
```

### Método 3: HOC `withDebugAttributes`

```tsx
import { withDebugAttributes } from '@/lib/debug-attributes';

const MiComponente = () => <div>Contenido</div>;

export default withDebugAttributes(
  MiComponente,
  'MiComponente',
  'src/components/mi-componente.tsx'
);
```

## 🎨 Ejemplos Prácticos

### Componente con Sub-elementos

```tsx
export function LocationCard({ nombre, tipo }: LocationCardProps) {
  const cardDebugAttrs = createDebugAttributes({
    componentName: 'LocationCard',
    filePath: 'src/components/ubicaciones/location-card.tsx'
  });

  const headerDebugAttrs = createDebugAttributes({
    componentName: 'LocationCard-Header',
    filePath: 'src/components/ubicaciones/location-card.tsx'
  });

  return (
    <Card {...cardDebugAttrs}>
      <CardHeader {...headerDebugAttrs}>
        <h3>{nombre}</h3>
        <Badge>{tipo}</Badge>
      </CardHeader>
    </Card>
  );
}
```

### Componentes Condicionales

```tsx
export function StatusIndicator({ isActive }: { isActive: boolean }) {
  const debugAttrs = createDebugAttributes({
    componentName: 'StatusIndicator',
    filePath: 'src/components/ui/status-indicator.tsx'
  });

  return (
    <div {...debugAttrs}>
      {isActive ? (
        <span {...createDebugAttributes({
          componentName: 'StatusIndicator-Active',
          filePath: 'src/components/ui/status-indicator.tsx'
        })}>
          Activo
        </span>
      ) : (
        <span {...createDebugAttributes({
          componentName: 'StatusIndicator-Inactive',
          filePath: 'src/components/ui/status-indicator.tsx'
        })}>
          Inactivo
        </span>
      )}
    </div>
  );
}
```

## ⚙️ Configuración Avanzada

### Modificar Configuración en Runtime

```tsx
import { updateDebugConfig } from '@/lib/debug-attributes';

// Habilitar depuración
updateDebugConfig({ 
  enabled: true,
  verbose: true 
});

// Excluir componentes específicos
updateDebugConfig({
  excludedComponents: ['Button', 'Input', 'Label']
});
```

### Configuración Personalizada

```tsx
import { getDebugConfig, updateDebugConfig } from '@/lib/debug-attributes';

// Obtener configuración actual
const config = getDebugConfig();

// Actualizar configuración
updateDebugConfig({
  enabled: true,
  prefix: 'debug-',
  includeFilePath: true,
  verbose: false,
  excludedComponents: ['Button', 'Input'],
  enabledEnvironments: ['development', 'staging']
});
```

## 🔍 Inspección en el Navegador

### Usando Chrome DevTools

1. **Abre DevTools** (F12 o Cmd+Opt+I)
2. **Selecciona Elements tab**
3. **Busca atributos `data-debug`**:
   - `data-debug-component-name="LocationCard"`
   - `data-debug-component-file="src/components/ubicaciones/location-card.tsx"`

### Console API

```javascript
// Encontrar todos los elementos con atributos de depuración
const debugElements = document.querySelectorAll('[data-debug-component-name]');

// Filtrar por nombre de componente
const locationCards = document.querySelectorAll('[data-debug-component-name="LocationCard"]');

// Obtener información de depuración
const element = document.querySelector('[data-debug-component-name="LocationCard"]');
const componentName = element?.getAttribute('data-debug-component-name');
const filePath = element?.getAttribute('data-debug-component-file');
```

### Bookmarklet Útil

```javascript
javascript:(function(){
  const elements = document.querySelectorAll('[data-debug-component-name]');
  const components = {};
  elements.forEach(el => {
    const name = el.getAttribute('data-debug-component-name');
    const file = el.getAttribute('data-debug-component-file');
    components[name] = components[name] || [];
    if (file) components[name].push(file);
  });
  console.table(components);
})();
```

## 🎯 Mejores Prácticas

### ✅ Recomendaciones

1. **Nombres descriptivos**: Usa nombres claros y consistentes
   ```tsx
   // ✅ Bueno
   componentName: 'LoginForm-SubmitButton'
   
   // ❌ Evitar
   componentName: 'Btn1'
   ```

2. **Jerarquía clara**: Usa guiones para subcomponentes
   ```tsx
   // ✅ Bueno
   componentName: 'LocationCard-Header-Title'
   
   // ✅ También bueno
   componentName: 'LocationCard.Header.Title'
   ```

3. **Rutas relativas**: Siempre usa rutas desde `src/components/`
   ```tsx
   // ✅ Bueno
   filePath: 'src/components/ubicaciones/location-card.tsx'
   
   // ❌ Evitar
   filePath: 'C:/Users/Proyecto/src/components/...'
   ```

### ❌ Qué Evitar

1. **No añadir a componentes UI básicos**: Button, Input, etc.
2. **No usar en producción**: Deshabilita en producción
3. **No sobrecargar**: No añadir a cada div individualmente

## 🐛 Solución de Problemas

### Los atributos no aparecen

1. **Verifica variables de entorno**:
   ```bash
   echo $NEXT_PUBLIC_DEBUG_COMPONENTS
   ```

2. **Revisa la configuración**:
   ```tsx
   import { getDebugConfig } from '@/lib/debug-attributes';
   console.log(getDebugConfig());
   ```

3. **Verifica el componente no esté excluido**:
   ```tsx
   import { shouldDebugComponent } from '@/lib/debug-attributes';
   console.log(shouldDebugComponent('MiComponente'));
   ```

### Rendimiento afectado

1. **Deshabilita modo verbose**:
   ```tsx
   updateDebugConfig({ verbose: false });
   ```

2. **Excluye componentes renderizados masivamente**:
   ```tsx
   updateDebugConfig({
     excludedComponents: ['ListItem', 'TableRow']
   });
   ```

## 📚 Referencia API

### Funciones Principales

#### `createDebugAttributes(options)`

Crea atributos de depuración para un componente.

**Parámetros:**
- `componentName` (string): Nombre del componente
- `filePath` (string, opcional): Ruta del archivo
- `enabled` (boolean, opcional): Forzar habilitar/deshabilitar

**Retorna:** Objeto con atributos para spreading

#### `useDebugAttributes(componentName?)`

Hook para obtener atributos de depuración.

**Parámetros:**
- `componentName` (string, opcional): Nombre del componente

**Retorna:** Objeto con atributos para spreading

#### `withDebugAttributes(Component, componentName?, filePath?)`

HOC que envuelve un componente con atributos de depuración.

**Parámetros:**
- `Component` (React.ComponentType): Componente a envolver
- `componentName` (string, opcional): Nombre personalizado
- `filePath` (string, opcional): Ruta del archivo

**Retorna:** Componente envuelto con atributos

### Funciones de Configuración

#### `updateDebugConfig(config)`

Actualiza la configuración global.

#### `getDebugConfig()`

Obtiene la configuración actual.

#### `shouldDebugComponent(componentName)`

Verifica si un componente debe tener atributos de depuración.

## 🔄 Integración con Flujo de Trabajo

### Para Diseñadores UX

1. **Inspecciona componentes** directamente en el navegador
2. **Identifica rápidamente** qué componente modificar
3. **Comunica cambios específicos** con nombres exactos

### Para Desarrolladores

1. **Añade atributos** a nuevos componentes
2. **Mantén consistencia** en nombres
3. **Usa configuración** para excluir componentes UI básicos

### Para QA Testing

1. **Identifica elementos** para pruebas automatizadas
2. **Crea selectores CSS** estables basados en atributos
3. **Documenta casos de prueba** con nombres de componentes

---

## 🎉 Conclusión

Este sistema de depuración transforma la forma en que interactúas con los componentes React, haciendo que el desarrollo y la colaboración sean más eficientes y transparentes. ¡Feliz depuración! 🚀