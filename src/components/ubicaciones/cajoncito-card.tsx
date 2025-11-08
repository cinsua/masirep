"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Package,
  Edit,
  Trash2,
  MoreVertical,
  Grid3x3,
  Cpu,
  ChevronRight,
  Plus,
  Search,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";

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

export interface ComponenteData {
  id: string;
  categoria: 'RESISTENCIA' | 'CAPACITOR' | 'INTEGRADO' | 'VENTILADOR' | 'OTROS';
  descripcion: string;
  valorUnidad: string;
  stockMinimo: number;
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
    componente: ComponenteData;
  }>;
  _count: {
    componentes: number;
  };
}

export interface CajoncitoCardProps {
  organizador: Organizador;
  cajoncitos: Cajoncito[];
  hasContent: boolean;
  showActions?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCajoncitoClick?: (cajoncito: Cajoncito) => void;
  onEditCajoncito?: (cajoncito: Cajoncito) => void;
  onDeleteCajoncito?: (cajoncito: Cajoncito) => void;
  className?: string;
}

export function CajoncitoCard({
  organizador,
  cajoncitos,
  hasContent,
  showActions = false,
  onClick,
  onEdit,
  onDelete,
  onCajoncitoClick,
  onEditCajoncito,
  onDeleteCajoncito,
  className,
}: CajoncitoCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCajoncitoDialogOpen, setDeleteCajoncitoDialogOpen] = useState(false);
  const [cajoncitoToDelete, setCajoncitoToDelete] = useState<Cajoncito | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const hasCajoncitos = cajoncitos.length > 0;
  const totalContent = cajoncitos.reduce((acc, caj) => acc + caj._count.componentes, 0);

  // Filter cajoncitos based on search term
  const filteredCajoncitos = cajoncitos.filter((cajoncito) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const matchesCodigo = cajoncito.codigo.toLowerCase().includes(searchLower);
    const matchesNombre = cajoncito.nombre.toLowerCase().includes(searchLower);
    const matchesComponentes = cajoncito.componentes.some(c =>
      c.componente.descripcion.toLowerCase().includes(searchLower) ||
      c.componente.categoria.toLowerCase().includes(searchLower) ||
      c.componente.valorUnidad.toLowerCase().includes(searchLower)
    );

    return matchesCodigo || matchesNombre || matchesComponentes;
  });

  const getStatusColor = () => {
    if (totalContent > 0) return "bg-green-100 text-green-800 border-green-200";
    if (hasCajoncitos) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusText = () => {
    if (totalContent > 0) return "Con componentes";
    if (hasCajoncitos) return "Con cajoncitos";
    return "Vacío";
  };

  const handleDeleteOrganizador = () => {
    setDeleteDialogOpen(false);
    onDelete?.();
  };

  const handleDeleteCajoncito = () => {
    if (cajoncitoToDelete) {
      setDeleteCajoncitoDialogOpen(false);
      onDeleteCajoncito?.(cajoncitoToDelete);
      setCajoncitoToDelete(null);
    }
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
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-600" />
                {organizador.codigo}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1">
                {organizador.nombre}
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
                    Editar Organizador
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); setDeleteDialogOpen(true); }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Organizador
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {getStatusText()}
            </Badge>
            {organizador.descripcion && (
              <Badge variant="outline" className="text-xs">
                Con descripción
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Cajoncitos Section */}
          {hasCajoncitos && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Grid3x3 className="h-3 w-3" />
                  Cajoncitos ({cajoncitos.length})
                </h4>
              </div>

              {/* Search Input */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar cajoncitos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>

              <div className="space-y-1">
                {filteredCajoncitos.length === 0 ? (
                  <div className="text-center py-4 text-sm text-gray-500">
                    {searchTerm ? "No se encontraron cajoncitos que coincidan con la búsqueda" : "No hay cajoncitos"}
                  </div>
                ) : (
                  filteredCajoncitos.slice(0, 3).map((cajoncito) => {
                    const hasCajoncitoContent = cajoncito._count.componentes > 0;
                    const componentCategories = cajoncito.componentes.map(c => c.componente.categoria);
                    const uniqueCategories = [...new Set(componentCategories)];

                    // Get category icons/colors
                    const getCategoryInfo = (categoria: string) => {
                      switch (categoria) {
                        case 'RESISTENCIA': return { icon: 'R', color: 'bg-red-100 text-red-800' };
                        case 'CAPACITOR': return { icon: 'C', color: 'bg-yellow-100 text-yellow-800' };
                        case 'INTEGRADO': return { icon: 'IC', color: 'bg-blue-100 text-blue-800' };
                        case 'VENTILADOR': return { icon: 'F', color: 'bg-green-100 text-green-800' };
                        default: return { icon: '?', color: 'bg-gray-100 text-gray-800' };
                      }
                    };

                    return (
                      <div
                        key={cajoncito.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition-colors hover:bg-gray-50",
                          hasCajoncitoContent
                            ? "bg-green-50 border-green-200 text-green-800"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCajoncitoClick?.(cajoncito);
                        }}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Cpu className="h-3 w-3" />
                          <span className="font-medium">{cajoncito.codigo}</span>
                          <span className="truncate">{cajoncito.nombre}</span>

                          {/* Component category indicators */}
                          {hasCajoncitoContent && (
                            <div className="flex gap-1 ml-2">
                              {uniqueCategories.slice(0, 2).map((categoria) => {
                                const { icon, color } = getCategoryInfo(categoria);
                                return (
                                  <Badge key={categoria} variant="secondary" className={cn("text-xs h-4 px-1", color)}>
                                    {icon}
                                  </Badge>
                                );
                              })}
                              {uniqueCategories.length > 2 && (
                                <Badge variant="secondary" className="text-xs h-4 px-1 bg-gray-100 text-gray-800">
                                  +{uniqueCategories.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {cajoncito._count.componentes > 0 && (
                            <Badge variant="secondary" className="text-xs h-4 px-1">
                              {cajoncito._count.componentes}
                            </Badge>
                          )}
                          <ChevronRight className="h-3 w-3" />
                        </div>
                      </div>
                    );
                  })
                )}

                {filteredCajoncitos.length > 3 && (
                  <div className="text-xs text-gray-500 text-center py-1 border-t border-dashed border-gray-200">
                    +{filteredCajoncitos.length - 3} cajoncito{filteredCajoncitos.length - 3 > 1 ? 's' : ''} más
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Direct Content (Componentes without cajoncitos) */}
          {!hasCajoncitos && totalContent > 0 && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Componentes Directos
                  </span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {totalContent}
                </Badge>
              </div>
            </div>
          )}

          {/* Add Cajoncito Button */}
          {showActions && (
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement add cajoncito functionality
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Cajoncito
              </Button>

              {totalContent === 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement add componente functionality
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Componente
                </Button>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
            Creado: {new Date(organizador.createdAt).toLocaleDateString('es-MX')}
          </div>
        </CardContent>
      </Card>

      {/* Delete Organizador Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Organizador?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar el organizador <strong>{organizador.codigo}</strong>?
              {totalContent > 0 && (
                <span className="text-red-600 block mt-2">
                  ⚠️ Este organizador contiene {totalContent} componente(s). Debes eliminar el contenido primero.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrganizador}
              disabled={totalContent > 0}
              className={totalContent > 0 ? "opacity-50 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Cajoncito Dialog */}
      <AlertDialog open={deleteCajoncitoDialogOpen} onOpenChange={setDeleteCajoncitoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Cajoncito?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar el cajoncito <strong>{cajoncitoToDelete?.codigo}</strong>?
              {cajoncitoToDelete?._count.componentes && cajoncitoToDelete._count.componentes > 0 && (
                <span className="text-red-600 block mt-2">
                  ⚠️ Este cajoncito contiene {cajoncitoToDelete._count.componentes} componente(s). Debes eliminar el contenido primero.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCajoncito}
              disabled={cajoncitoToDelete?._count.componentes ? cajoncitoToDelete._count.componentes > 0 : false}
              className={cajoncitoToDelete?._count.componentes && cajoncitoToDelete._count.componentes > 0 ? "opacity-50 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}