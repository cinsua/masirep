/**
 * Configuración del sistema de depuración de componentes
 * 
 * Este archivo permite configurar globalmente el comportamiento
 * de los atributos de depuración en toda la aplicación
 */

export interface DebugConfig {
  /** Habilitar/deshabilitar atributos de depuración globalmente */
  enabled: boolean;
  /** Prefijo para los atributos de depuración */
  prefix: string;
  /** Incluir ruta del archivo en los atributos */
  includeFilePath: boolean;
  /** Modo verbose (más información en consola) */
  verbose: boolean;
  /** Componentes excluidos de la depuración */
  excludedComponents: string[];
  /** Entornos donde se habilita automáticamente */
  enabledEnvironments: string[];
}

/**
 * Configuración por defecto
 */
export const DEFAULT_DEBUG_CONFIG: DebugConfig = {
  enabled: process.env.NODE_ENV === 'development',
  prefix: 'debug-',
  includeFilePath: true,
  verbose: false,
  excludedComponents: [
    // Componentes de UI que no necesitan depuración
    'Button',
    'Input',
    'Label',
    'Card',
    'Badge',
    'Alert',
    'Dialog',
    'Separator',
    'ScrollArea',
    'Tabs',
    'Table',
    'Progress',
    'Textarea',
    'DropdownMenu',
    'Collapsible'
  ],
  enabledEnvironments: ['development', 'test']
};

/**
 * Configuración actual (puede ser modificada en runtime)
 */
let currentConfig: DebugConfig = { ...DEFAULT_DEBUG_CONFIG };

/**
 * Actualizar la configuración de depuración
 */
export function updateDebugConfig(newConfig: Partial<DebugConfig>): void {
  currentConfig = { ...currentConfig, ...newConfig };
  
  if (currentConfig.verbose) {
    console.log('🔍 Debug config updated:', currentConfig);
  }
}

/**
 * Obtener la configuración actual
 */
export function getDebugConfig(): DebugConfig {
  return { ...currentConfig };
}

/**
 * Verificar si un componente debe tener atributos de depuración
 */
export function shouldDebugComponent(componentName: string): boolean {
  if (!currentConfig.enabled) return false;
  
  // Verificar si el componente está en la lista de excluidos
  return !currentConfig.excludedComponents.includes(componentName);
}

/**
 * Inicializar la configuración desde variables de entorno
 */
export function initializeDebugFromEnv(): void {
  const envConfig: Partial<DebugConfig> = {
    enabled: process.env.NEXT_PUBLIC_DEBUG_COMPONENTS === 'true' || 
             (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_COMPONENTS !== 'false'),
    verbose: process.env.NEXT_PUBLIC_DEBUG_VERBOSE === 'true',
    includeFilePath: process.env.NEXT_PUBLIC_DEBUG_INCLUDE_FILE_PATH !== 'false'
  };

  updateDebugConfig(envConfig);
}

// Inicializar automáticamente al importar
initializeDebugFromEnv();