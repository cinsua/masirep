"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CajoncitoCard } from "./cajoncito-card";
import { Button } from "@/components/ui/button";
import { Plus, Grid, Package } from "lucide-react";
import { createDebugAttributes } from "@/lib/debug-attributes";

// Re-export CajoncitoCard types for convenience
export type { CajoncitoCardProps } from "./cajoncito-card";

export interface Organizador {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  estanteriaId?: string;
  armarioId?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    cajoncitos: number;
  };
}

export interface Cajoncito {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  organizadorId: string;
  createdAt: string;
  updatedAt: string;
  componentes: Array<{
    componente: {
      id: string;
      categoria: 'RESISTENCIA' | 'CAPACITOR' | 'INTEGRADO' | 'VENTILADOR' | 'OTROS';
      descripcion: string;
      valorUnidad: string;
      stockMinimo: number;
    };
  }>;
  _count: {
    componentes: number;
  };
}

export interface OrganizerGridProps {
  organizadores: Organizador[];
  cajoncitos: Record<string, Cajoncito[]>;
  loading?: boolean;
  onOrganizadorClick?: (organizador: Organizador) => void;
  onCajoncitoClick?: (cajoncito: Cajoncito) => void;
  onAddOrganizador?: () => void;
  onEditOrganizador?: (organizador: Organizador) => void;
  onDeleteOrganizador?: (organizador: Organizador) => void;
  onEditCajoncito?: (cajoncito: Cajoncito) => void;
  onDeleteCajoncito?: (cajoncito: Cajoncito) => void;
  showActions?: boolean;
  className?: string;
}

export function OrganizerGrid({
  organizadores,
  cajoncitos,
  loading = false,
  onOrganizadorClick,
  onCajoncitoClick,
  onAddOrganizador,
  onEditOrganizador,
  onDeleteOrganizador,
  onEditCajoncito,
  onDeleteCajoncito,
  showActions = false,
  className,
}: OrganizerGridProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-sm text-gray-500">Cargando organizadores...</p>
      </div>
    );
  }

  if (organizadores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <Package className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay organizadores configurados
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Comienza agregando organizadores para organizar componentes pequeños
        </p>
        {onAddOrganizador && (
          <Button onClick={onAddOrganizador} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Organizador
          </Button>
        )}
      </div>
    );
  }

  return (
    <div 
      className={cn("space-y-6", className)}
      {...createDebugAttributes({
        componentName: 'OrganizerGrid',
        filePath: 'src/components/ubicaciones/organizer-grid.tsx'
      })}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Grid className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Organizadores ({organizadores.length})
          </h2>
          {organizadores.some((org) => org._count.cajoncitos > 0) && (
            <span className="text-sm text-gray-500">
              • {organizadores.reduce((acc, org) => acc + org._count.cajoncitos, 0)} cajoncitos
            </span>
          )}
        </div>
        {onAddOrganizador && (
          <Button onClick={onAddOrganizador} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Organizador
          </Button>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {organizadores.map((organizador) => {
          const organizadorCajoncitos = cajoncitos[organizador.id] || [];
          const hasContent = organizadorCajoncitos.some(caj => caj._count.componentes > 0);

          return (
            <CajoncitoCard
              key={organizador.id}
              organizador={organizador}
              cajoncitos={organizadorCajoncitos}
              hasContent={hasContent}
              showActions={showActions}
              onClick={() => onOrganizadorClick?.(organizador)}
              onEdit={() => onEditOrganizador?.(organizador)}
              onDelete={() => onDeleteOrganizador?.(organizador)}
              onCajoncitoClick={onCajoncitoClick}
              onEditCajoncito={onEditCajoncito}
              onDeleteCajoncito={onDeleteCajoncito}
            />
          );
        })}
      </div>

      {/* Summary Statistics */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Resumen</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Total Organizadores:</span>
            <span className="ml-2 font-medium text-gray-900">{organizadores.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Con Cajoncitos:</span>
            <span className="ml-2 font-medium text-gray-900">
              {organizadores.filter(org => org._count.cajoncitos > 0).length}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Total Cajoncitos:</span>
            <span className="ml-2 font-medium text-gray-900">
              {organizadores.reduce((acc, org) => acc + org._count.cajoncitos, 0)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Con Componentes:</span>
            <span className="ml-2 font-medium text-gray-900">
              {Object.values(cajoncitos).flat().filter(caj => caj._count.componentes > 0).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}