/**
 * Utilidad de depuración para componentes React
 * Añade automáticamente atributos data-debug para identificar componentes en el DOM
 * 
 * @author Sally - UX Designer
 * @version 1.0.0
 */

interface DebugOptions {
  componentName: string;
  filePath?: string;
  enabled?: boolean;
}

/**
 * Configuración global de depuración
 */
const DEBUG_CONFIG = {
  enabled: (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') || 
           (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_DEBUG_COMPONENTS === 'true'),
  prefix: 'debug-',
  includeFilePath: typeof process === 'undefined' || process.env?.NEXT_PUBLIC_DEBUG_INCLUDE_FILE_PATH !== 'false',
  verbose: typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_DEBUG_VERBOSE === 'true',
  excludedComponents: [
    'Button', 'Input', 'Label', 'Card', 'Badge', 'Alert', 'Dialog', 
    'Separator', 'ScrollArea', 'Tabs', 'Table', 'Progress', 'Textarea', 
    'DropdownMenu', 'Collapsible'
  ]
};

/**
 * Verificar si un componente debe tener atributos de depuración
 */
function shouldDebugComponent(componentName: string): boolean {
  if (!DEBUG_CONFIG.enabled) return false;
  return !DEBUG_CONFIG.excludedComponents.includes(componentName);
}

/**
 * Genera atributos de depuración para un componente
 * @param options - Opciones de configuración del componente
 * @returns Objeto con atributos data-debug para spreading en React
 */
export function createDebugAttributes(options: DebugOptions): Record<string, string> {
  const { componentName, filePath, enabled } = options;

  // Verificar si la depuración está habilitada globalmente y para este componente
  const isDebugEnabled = enabled !== undefined ? enabled : 
    (DEBUG_CONFIG.enabled && shouldDebugComponent(componentName));

  if (!isDebugEnabled) {
    return {};
  }

  const attributes: Record<string, string> = {};

  // Siempre añadir el nombre del componente
  attributes['data-debug-component-name'] = componentName;

  // Añadir ruta del archivo si se proporciona y está configurado
  if (filePath && DEBUG_CONFIG.includeFilePath) {
    // Convertir ruta absoluta a relativa desde src/components/
    const relativePath = filePath
      .replace(/.*src\/components\//, 'src/components/')
      .replace(/\\/g, '/'); // Normalizar para Windows
    
    attributes['data-debug-component-file'] = relativePath;
  }

  if (DEBUG_CONFIG.verbose) {
    console.log(`🔍 Debug attributes added for ${componentName}:`, attributes);
  }

  return attributes;
}

/**
 * Hook personalizado para obtener atributos de depuración automáticamente
 * @param componentName - Nombre del componente (se detecta automáticamente si no se proporciona)
 * @returns Objeto con atributos data-debug
 */
export function useDebugAttributes(componentName?: string): Record<string, string> {
  // Intentar obtener el nombre del componente automáticamente del stack trace
  if (!componentName) {
    try {
      const stack = new Error().stack;
      if (stack) {
        const lines = stack.split('\n');
        // Buscar la línea que contiene el componente
        for (const line of lines) {
          const match = line.match(/at (\w+)\s+\(/);
          if (match && match[1] !== 'useDebugAttributes' && !match[1].includes('React')) {
            componentName = match[1];
            break;
          }
        }
      }
    } catch (error) {
      if (DEBUG_CONFIG.verbose) {
        console.warn('No se pudo detectar automáticamente el nombre del componente');
      }
    }
  }

  // Fallback a un nombre genérico
  const finalComponentName = componentName || 'UnknownComponent';

  return createDebugAttributes({
    componentName: finalComponentName,
    // No podemos obtener la ruta del archivo en runtime de forma confiable
    enabled: DEBUG_CONFIG.enabled && shouldDebugComponent(finalComponentName)
  });
}

/**
 * Función para habilitar/deshabilitar la depuración globalmente
 * @param enabled - Estado de la depuración
 */
export function setDebugMode(enabled: boolean): void {
  DEBUG_CONFIG.enabled = enabled;
  if (DEBUG_CONFIG.verbose) {
    console.log('🔍 Debug mode:', enabled ? 'ENABLED' : 'DISABLED');
  }
}

/**
 * Función para verificar si la depuración está habilitada
 * @returns true si la depuración está habilitada
 */
export function isDebugEnabled(): boolean {
  return DEBUG_CONFIG.enabled;
}

/**
 * Utilidad para obtener información de depuración del DOM
 * @param element - Elemento DOM del que obtener información
 * @returns Objeto con información de depuración
 */
export function getDebugInfo(element: HTMLElement): {
  componentName?: string;
  filePath?: string;
} | null {
  if (!element) return null;

  const componentName = element.getAttribute('data-debug-component-name');
  const filePath = element.getAttribute('data-debug-component-file');

  if (!componentName && !filePath) return null;

  return {
    componentName: componentName || undefined,
    filePath: filePath || undefined
  };
}

/**
 * Función para excluir componentes de la depuración
 * @param componentNames - Nombres de componentes a excluir
 */
export function excludeComponents(componentNames: string[]): void {
  DEBUG_CONFIG.excludedComponents.push(...componentNames);
  if (DEBUG_CONFIG.verbose) {
    console.log('🔍 Excluded components:', componentNames);
  }
}

/**
 * Función para obtener la configuración actual
 */
export function getDebugConfig() {
  return { ...DEBUG_CONFIG };
}