"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Archive,
  Edit,
  Trash2,
  MoreVertical,
  Grid3x3,
  Package,
  ChevronRight,
  Plus,
} from "lucide-react";
import { EntityIcon } from "@/components/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DivisionPanel } from "./division-panel";
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

export interface DrawerCardProps {
  cajon: Cajon;
  divisions: Division[];
  hasContent: boolean;
  showActions?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDivisionClick?: (division: Division) => void;
  onEditDivision?: (division: Division) => void;
  onDeleteDivision?: (division: Division) => void;
  className?: string;
}

export function DrawerCard({
  cajon,
  divisions,
  hasContent,
  showActions = false,
  onClick,
  onEdit,
  onDelete,
  onDivisionClick,
  onEditDivision,
  onDeleteDivision,
  className,
}: DrawerCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDivisionDialogOpen, setDeleteDivisionDialogOpen] = useState(false);
  const [divisionToDelete, setDivisionToDelete] = useState<Division | null>(null);
  const [divisionPanelOpen, setDivisionPanelOpen] = useState(false);

  const hasDivisions = divisions.length > 0;
  const totalContent = cajon._count.repuestos + divisions.reduce((acc, d) => acc + d._count.repuestos, 0);

  const getStatusColor = () => {
    if (totalContent > 0) return "bg-green-100 text-green-800 border-green-200";
    if (hasDivisions) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusText = () => {
    if (totalContent > 0) return "Con contenido";
    if (hasDivisions) return "Con divisiones";
    return "Vacío";
  };

  const handleDeleteCajon = () => {
    setDeleteDialogOpen(false);
    onDelete?.();
  };

  const handleDeleteDivision = () => {
    if (divisionToDelete) {
      setDeleteDivisionDialogOpen(false);
      onDeleteDivision?.(divisionToDelete);
      setDivisionToDelete(null);
    }
  };

  const handleDivisionUpdate = () => {
    // Trigger parent component to refresh data
    onDivisionClick?.(cajon as any);
  };

  return (
    <>
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
          getStatusColor(),
          hasContent && "ring-2 ring-green-500 ring-opacity-20",
          className
        )}
        onClick={onClick}
        {...createDebugAttributes({
          componentName: 'DrawerCard',
          filePath: 'src/components/ubicaciones/drawer-card.tsx'
        })}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <EntityIcon entityType="cajon" className="h-4 w-4 text-gray-600" />
                {cajon.codigo}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1">
                {cajon.nombre}
              </CardDescription>
            </div>

            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Cajón
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); setDeleteDialogOpen(true); }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Cajón
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {getStatusText()}
            </Badge>
            {cajon.descripcion && (
              <Badge variant="outline" className="text-xs">
                Con descripción
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Divisiones Section */}
          {hasDivisions && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Grid3x3 className="h-3 w-3" />
                  Divisiones ({divisions.length})
                </h4>
              </div>

              <div className="space-y-1">
                {divisions.slice(0, 3).map((division) => {
                  const hasDivisionContent = division._count.repuestos > 0;

                  return (
                    <div
                      key={division.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition-colors hover:bg-gray-50",
                        hasDivisionContent
                          ? "bg-green-50 border-green-200 text-green-800"
                          : "bg-gray-50 border-gray-200 text-gray-700"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDivisionClick?.(division);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Package className="h-3 w-3" />
                        <span className="font-medium">{division.codigo}</span>
                        <span>{division.nombre}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {division._count.repuestos > 0 && (
                          <Badge variant="secondary" className="text-xs h-4 px-1">
                            {division._count.repuestos}
                          </Badge>
                        )}
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </div>
                  );
                })}

                {divisions.length > 3 && (
                  <div className="text-xs text-gray-500 text-center py-1 border-t border-dashed border-gray-200">
                    +{divisions.length - 3} division{divisions.length - 3 > 1 ? 'es' : ''} más
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Direct Content (Repuestos without divisions) */}
          {!hasDivisions && cajon._count.repuestos > 0 && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EntityIcon entityType="repuesto" className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Repuestos Directos
                  </span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {cajon._count.repuestos}
                </Badge>
              </div>
            </div>
          )}

          {/* Add Division Button */}
          {showActions && (
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setDivisionPanelOpen(true);
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                División
              </Button>

              {totalContent === 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement add repuesto functionality
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Repuesto
                </Button>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
            Creado: {new Date(cajon.createdAt).toLocaleDateString('es-MX')}
          </div>
        </CardContent>
      </Card>

      {/* Delete Cajon Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Cajón?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar el cajón <strong>{cajon.codigo}</strong>?
              {totalContent > 0 && (
                <span className="text-red-600 block mt-2">
                  ⚠️ Este cajón contiene {totalContent} item(s). Debes eliminar el contenido primero.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCajon}
              disabled={totalContent > 0}
              className={totalContent > 0 ? "opacity-50 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Division Dialog */}
      <AlertDialog open={deleteDivisionDialogOpen} onOpenChange={setDeleteDivisionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar División?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar la división <strong>{divisionToDelete?.codigo}</strong>?
              {divisionToDelete?._count.repuestos && divisionToDelete._count.repuestos > 0 && (
                <span className="text-red-600 block mt-2">
                  ⚠️ Esta división contiene {divisionToDelete._count.repuestos} repuesto(s). Debes eliminar el contenido primero.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDivision}
              disabled={divisionToDelete?._count.repuestos ? divisionToDelete._count.repuestos > 0 : false}
              className={divisionToDelete?._count.repuestos && divisionToDelete._count.repuestos > 0 ? "opacity-50 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Division Panel */}
      <DivisionPanel
        cajon={cajon}
        isOpen={divisionPanelOpen}
        onClose={() => setDivisionPanelOpen(false)}
        onDivisionUpdate={handleDivisionUpdate}
      />
    </>
  );
}