/**
 * Ejemplo de componente con atributos de depuración
 * 
 * Este componente demuestra cómo usar la utilidad de depuración
 * para añadir automáticamente atributos data-debug al DOM
 */

'use client';

import { createDebugAttributes } from '@/lib/debug-attributes';

interface DebugExampleProps {
  title: string;
  message: string;
  variant?: 'primary' | 'secondary';
}

export function DebugExample({ title, message, variant = 'primary' }: DebugExampleProps) {
  // Obtener atributos de depuración automáticamente
  const debugAttrs = createDebugAttributes({
    componentName: 'DebugExample',
    filePath: 'src/components/examples/debug-example.tsx',
    enabled: true // Forzar habilitado para este ejemplo
  });

  return (
    <div 
      className={`p-4 rounded-lg border ${
        variant === 'primary' 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-gray-50 border-gray-200'
      }`}
      {...debugAttrs} // Atributos de depuración aplicados aquí
    >
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-700">{message}</p>
      
      {/* Subcomponente con sus propios atributos de depuración */}
      <div 
        className="mt-3 text-sm text-gray-500"
        {...createDebugAttributes({
          componentName: 'DebugExample-Content',
          filePath: 'src/components/examples/debug-example.tsx'
        })}
      >
        <span>Este es un subcomponente con atributos de depuración propios</span>
      </div>
    </div>
  );
}