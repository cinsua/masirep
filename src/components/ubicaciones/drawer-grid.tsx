"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DrawerCard } from "./drawer-card";
import { Button } from "@/components/ui/button";
import { Plus, Grid, Layers } from "lucide-react";
import { createDebugAttributes } from "@/lib/debug-attributes";

export interface Cajon {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  estanteriaId?: string;
  armarioId?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    divisiones: number;
    repuestos: number;
  };
}

export interface Division {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  cajonId: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    repuestos: number;
  };
}

export interface DrawerGridProps {
  cajones: Cajon[];
  divisions: Record<string, Division[]>;
  loading?: boolean;
  onCajonClick?: (cajon: Cajon) => void;
  onDivisionClick?: (division: Division) => void;
  onAddCajon?: () => void;
  onEditCajon?: (cajon: Cajon) => void;
  onDeleteCajon?: (cajon: Cajon) => void;
  onEditDivision?: (division: Division) => void;
  onDeleteDivision?: (division: Division) => void;
  showActions?: boolean;
  className?: string;
}

export function DrawerGrid({
  cajones,
  divisions,
  loading = false,
  onCajonClick,
  onDivisionClick,
  onAddCajon,
  onEditCajon,
  onDeleteCajon,
  onEditDivision,
  onDeleteDivision,
  showActions = false,
  className,
}: DrawerGridProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-sm text-gray-500">Cargando cajones...</p>
      </div>
    );
  }

  if (cajones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <Layers className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay cajones configurados
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Comienza agregando cajones para organizar tu inventario
        </p>
        {onAddCajon && (
          <Button onClick={onAddCajon} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Cajón
          </Button>
        )}
      </div>
    );
  }

  return (
    <div 
      className={cn("space-y-6", className)}
      {...createDebugAttributes({
        componentName: 'DrawerGrid',
        filePath: 'src/components/ubicaciones/drawer-grid.tsx'
      })}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Grid className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Cajones ({cajones.length})
          </h2>
          {cajones.some((c) => c._count.divisiones > 0) && (
            <span className="text-sm text-gray-500">
              • {cajones.reduce((acc, c) => acc + c._count.divisiones, 0)} divisiones
            </span>
          )}
        </div>
        {onAddCajon && (
          <Button onClick={onAddCajon} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Cajón
          </Button>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cajones.map((cajon) => {
          const cajonDivisions = divisions[cajon.id] || [];
          const hasContent = cajon._count.repuestos > 0 || cajonDivisions.some(d => d._count.repuestos > 0);

          return (
            <DrawerCard
              key={cajon.id}
              cajon={cajon}
              divisions={cajonDivisions}
              hasContent={hasContent}
              showActions={showActions}
              onClick={() => onCajonClick?.(cajon)}
              onEdit={() => onEditCajon?.(cajon)}
              onDelete={() => onDeleteCajon?.(cajon)}
              onDivisionClick={onDivisionClick}
              onEditDivision={onEditDivision}
              onDeleteDivision={onDeleteDivision}
            />
          );
        })}
      </div>

      {/* Summary Statistics */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Resumen</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Total Cajones:</span>
            <span className="ml-2 font-medium text-gray-900">{cajones.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Con Divisiones:</span>
            <span className="ml-2 font-medium text-gray-900">
              {cajones.filter(c => c._count.divisiones > 0).length}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Repuestos Directos:</span>
            <span className="ml-2 font-medium text-gray-900">
              {cajones.reduce((acc, c) => acc + c._count.repuestos, 0)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Total Divisiones:</span>
            <span className="ml-2 font-medium text-gray-900">
              {cajones.reduce((acc, c) => acc + c._count.divisiones, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

