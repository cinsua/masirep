/**
 * HOC para envolver componentes con atributos de depuración
 * Archivo separado con extensión .tsx para soporte de JSX
 */

import React from 'react';
import { createDebugAttributes, getDebugConfig } from './debug-attributes';

/**
 * Componente HOC que envuelve un componente con atributos de depuración
 * @param Component - Componente a envolver
 * @param componentName - Nombre personalizado del componente
 * @param filePath - Ruta del archivo del componente
 * @returns Componente envuelto con atributos de depuración
 */
export function withDebugAttributes<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
  filePath?: string
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    const config = getDebugConfig();
    const finalComponentName = componentName || Component.displayName || Component.name || 'AnonymousComponent';
    
    const debugAttrs = createDebugAttributes({
      componentName: finalComponentName,
      filePath,
      enabled: config.enabled
    });

    return <Component {...props} {...debugAttrs} />;
  };

  // Preservar metadatos del componente original
  WrappedComponent.displayName = `withDebugAttributes(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}