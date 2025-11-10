"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Search,
  Plus,
  Trash2,
  Package,
  Cpu,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/components/notifications/notification-provider";
import { createDebugAttributes } from "@/lib/debug-attributes";
import { useComponentes } from "@/hooks/use-componentes";
import { ComponenteWithRelations } from "@/types/api";

// Use ComponenteWithRelations type instead of custom ComponenteData
type ComponenteData = ComponenteWithRelations;

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
    cantidad: number;
  }>;
  _count: {
    componentes: number;
  };
}

export interface Organizador {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  estanteriaId?: string;
  armarioId?: string;
  createdAt: string;
  updatedAt: string;
  cajoncitos: Cajoncito[];
  _count: {
    cajoncitos: number;
  };
}

export interface RecentAssignment {
  id: string;
  componenteId: string;
  componenteNombre: string;
  cajoncitoId: string;
  cajoncitoCodigo: string;
  cantidad: number;
  timestamp: Date;
  ubicacionId: string;
}

export interface CajoncitoAssignmentPanelProps {
  organizador: Organizador;
  className?: string;
}

export function CajoncitoAssignmentPanel({
  organizador,
  className,
}: CajoncitoAssignmentPanelProps) {
  const { showSuccess, showError } = useNotifications();
  const { data: componentes, loading, fetch: fetchComponentes } = useComponentes();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCajoncito, setSelectedCajoncito] = useState<Cajoncito | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [assigning, setAssigning] = useState<string | null>(null);
  const [assignmentDialog, setAssignmentDialog] = useState<{
    open: boolean;
    componente: ComponenteData | null;
    cantidad: number;
  }>({
    open: false,
    componente: null,
    cantidad: 1,
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    componente: ComponenteData | null;
    cajoncito: Cajoncito | null;
    cantidad: number;
  }>({
    open: false,
    componente: null,
    cajoncito: null,
    cantidad: 1,
  });
  const [recentAssignments, setRecentAssignments] = useState<RecentAssignment[]>([]);
  const [undoLoading, setUndoLoading] = useState<string | null>(null);

// Fetch componentes based on search using hook
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchComponentes({ search: searchTerm, limit: 20 });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchComponentes]);

const handleAssignComponente = async (componente: ComponenteData, cajoncito: Cajoncito, cantidad: number) => {
    try {
      setAssigning(componente.id);

      const response = await fetch(`/api/componentes/${componente.id}/ubicaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cajoncitoId: cajoncito.id,
          cantidad: cantidad,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Track the assignment for undo functionality
        const newAssignment: RecentAssignment = {
          id: Date.now().toString(),
          componenteId: confirmDialog.componente!.id,
          componenteNombre: confirmDialog.componente!.descripcion,
          cajoncitoId: confirmDialog.cajoncito!.id,
          cajoncitoCodigo: confirmDialog.cajoncito!.codigo,
          cantidad: confirmDialog.cantidad,
          timestamp: new Date(),
          ubicacionId: data.data.id,
        };

        setRecentAssignments(prev => [newAssignment, ...prev.slice(0, 4)]); // Keep only last 5

        showSuccess(`Componente asignado exitosamente al cajoncito ${confirmDialog.cajoncito!.codigo}`, "Asignación exitosa");
        setConfirmDialog({ open: false, componente: null, cajoncito: null, cantidad: 1 });
        setAssignmentDialog({ open: false, componente: null, cantidad: 1 });
        setSearchTerm("");
        // Refetch to clear the componentes list
        fetchComponentes({ search: "", limit: 20 });
      } else {
        showError(data.error || "Error al asignar componente", "Error de asignación");
      }
    } catch (error) {
      console.error("Error assigning componente:", error);
      showError("Error de conexión al asignar componente", "Error de conexión");
    } finally {
      setAssigning(null);
    }
  };

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'RESISTENCIA': return 'R';
      case 'CAPACITOR': return 'C';
      case 'INTEGRADO': return 'IC';
      case 'VENTILADOR': return 'F';
      default: return '?';
    }
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'RESISTENCIA': return 'bg-red-100 text-red-800';
      case 'CAPACITOR': return 'bg-yellow-100 text-yellow-800';
      case 'INTEGRADO': return 'bg-blue-100 text-blue-800';
      case 'VENTILADOR': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUndoAssignment = async (assignment: RecentAssignment) => {
    try {
      setUndoLoading(assignment.id);

      const response = await fetch(
        `/api/componentes/${assignment.componenteId}/ubicaciones/${assignment.ubicacionId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        setRecentAssignments(prev => prev.filter(a => a.id !== assignment.id));
        showSuccess(`Asignación de ${assignment.componenteNombre} deshecha`, "Deshacer exitoso");
      } else {
        showError(data.error || "Error al deshacer la asignación", "Error al deshacer");
      }
    } catch (error) {
      console.error("Error undoing assignment:", error);
      showError("Error de conexión al deshacer la asignación", "Error de conexión");
    } finally {
      setUndoLoading(null);
    }
  };

  const filteredCajoncitos = organizador.cajoncitos.filter((cajoncito) => {
    if (!selectedCajoncito) return true;
    return cajoncito.id === selectedCajoncito.id;
  });

  return (
    <>
      <Card 
        className={cn("w-full", className)}
        {...createDebugAttributes({
          componentName: 'CajoncitoAssignmentPanel',
          filePath: 'src/components/ubicaciones/cajoncito-assignment-panel.tsx'
        })}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-600" />
                Asignación de Componentes
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Asigna componentes electrónicos a los cajoncitos del organizador {organizador.codigo}
              </p>
            </div>
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Asignar Componentes
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizador.cajoncitos.map((cajoncito) => {
              const hasContent = cajoncito._count.componentes > 0;
              const componentCategories = cajoncito.componentes.map(c => c.componente.categoria);
              const uniqueCategories = [...new Set(componentCategories)];

              return (
                <div
                  key={cajoncito.id}
                  className={cn(
                    "border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
                    hasContent
                      ? "bg-green-50 border-green-200 hover:bg-green-100"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  )}
                  onClick={() => {
                    setSelectedCajoncito(cajoncito);
                    setIsOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{cajoncito.codigo}</h4>
                      <p className="text-xs text-gray-600 truncate">{cajoncito.nombre}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        hasContent ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {cajoncito._count.componentes}
                    </Badge>
                  </div>

                  {hasContent && (
                    <div className="flex gap-1 mb-2">
                      {uniqueCategories.slice(0, 3).map((categoria) => (
                        <Badge
                          key={categoria}
                          variant="secondary"
                          className={cn("text-xs h-4 px-1", getCategoryColor(categoria))}
                        >
                          {getCategoryIcon(categoria)}
                        </Badge>
                      ))}
                      {uniqueCategories.length > 3 && (
                        <Badge variant="secondary" className="text-xs h-4 px-1 bg-gray-100 text-gray-800">
                          +{uniqueCategories.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    {hasContent ? "Con componentes" : "Vacío"}
                  </div>
                </div>
              );
            })}
          </div>

          {organizador.cajoncitos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay cajoncitos en este organizador</p>
              <p className="text-sm">Crea cajoncitos primero para poder asignar componentes</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              Asignar Componentes - {organizador.codigo}
            </DialogTitle>
            <DialogDescription>
              Busca componentes y asígnalos a los cajoncitos del organizador
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Component Search */}
            <div className="space-y-4">
              <Label>Buscar Componentes</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por descripción, categoría o valor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {loading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                </div>
              )}

              {!loading && searchTerm && componentes.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No se encontraron componentes que coincidan con "{searchTerm}"
                </p>
              )}

              {!loading && componentes.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                  {componentes.map((componente) => (
                    <div
                      key={componente.id}
                      className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-orange-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="secondary"
                            className={cn("text-xs", getCategoryColor(componente.categoria))}
                          >
                            {getCategoryIcon(componente.categoria)}
                          </Badge>
                          <span className="font-medium text-sm">{componente.descripcion}</span>
                        </div>
<div className="text-xs text-gray-600">
                          Valor: {componente.valorUnidad.map(v => `${v.valor} ${v.unidad}`).join(', ')} | Stock: {componente.stockActual || 0}/{componente.stockMinimo}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!selectedCajoncito) {
                            setSelectedCajoncito(organizador.cajoncitos[0] || null);
                          }
                          setAssignmentDialog({
                            open: true,
                            componente,
                            cantidad: 1,
                          });
                        }}
                        disabled={assigning === componente.id}
                      >
                        {assigning === componente.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cajoncito Selection */}
            {organizador.cajoncitos.length > 0 && (
              <div className="space-y-4">
                <Label>Seleccionar Cajoncito</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {organizador.cajoncitos.map((cajoncito) => {
                    const isSelected = selectedCajoncito?.id === cajoncito.id;
                    const hasContent = cajoncito._count.componentes > 0;

                    return (
                      <div
                        key={cajoncito.id}
                        className={cn(
                          "border rounded-lg p-3 cursor-pointer transition-all",
                          isSelected
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:bg-gray-50"
                        )}
                        onClick={() => setSelectedCajoncito(cajoncito)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{cajoncito.codigo}</div>
                            <div className="text-xs text-gray-600">{cajoncito.nombre}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {cajoncito._count.componentes} componentes
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle className="h-5 w-5 text-orange-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Assignments */}
            {recentAssignments.length > 0 && (
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium">Asignaciones Recientes</Label>
                  <div className="space-y-2 mt-2">
                    {recentAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{assignment.componenteNombre}</div>
                          <div className="text-gray-600">
                            {assignment.cantidad} unidades → {assignment.cajoncitoCodigo}
                          </div>
                          <div className="text-gray-500">
                            {assignment.timestamp.toLocaleTimeString('es-MX')}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUndoAssignment(assignment)}
                          disabled={undoLoading === assignment.id}
                          className="text-xs h-7"
                        >
                          {undoLoading === assignment.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Deshacer"
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Confirmation Dialog */}
      <Dialog
        open={assignmentDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setAssignmentDialog({ open: false, componente: null, cantidad: 1 });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Asignación</DialogTitle>
            <DialogDescription>
              ¿Cuántas unidades del componente deseas asignar al cajoncito?
            </DialogDescription>
          </DialogHeader>

          {assignmentDialog.componente && selectedCajoncito && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium mb-2">Componente:</div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", getCategoryColor(assignmentDialog.componente.categoria))}
                  >
                    {getCategoryIcon(assignmentDialog.componente.categoria)}
                  </Badge>
                  <span>{assignmentDialog.componente.descripcion}</span>
                </div>
<div className="text-sm text-gray-600 mt-1">
                  Valor: {assignmentDialog.componente.valorUnidad.map(v => `${v.valor} ${v.unidad}`).join(', ')}
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="font-medium mb-2">Cajoncito Destino:</div>
                <div>{selectedCajoncito.codigo} - {selectedCajoncito.nombre}</div>
                <div className="text-sm text-gray-600 mt-1">
                  Organizador: {organizador.codigo}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad a asignar</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  max={assignmentDialog.componente.stockActual || 0}
                  value={assignmentDialog.cantidad}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setAssignmentDialog(prev => ({ ...prev, cantidad: value }));
                  }}
                />
                <p className="text-xs text-gray-600">
                  Stock disponible: {assignmentDialog.componente.stockActual || 0} unidades
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignmentDialog({ open: false, componente: null, cantidad: 1 })}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (assignmentDialog.componente && selectedCajoncito) {
                  setConfirmDialog({
                    open: true,
                    componente: assignmentDialog.componente,
                    cajoncito: selectedCajoncito,
                    cantidad: assignmentDialog.cantidad,
                  });
                }
              }}
              disabled={!assignmentDialog.componente || !selectedCajoncito || assignmentDialog.cantidad <= 0}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Asignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDialog({ open: false, componente: null, cajoncito: null, cantidad: 1 });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Confirmar Asignación
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres asignar {confirmDialog.cantidad} unidades del componente al cajoncito?
              Esta acción no se puede deshacer fácilmente.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {confirmDialog.componente && confirmDialog.cajoncito && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm">
                  <strong>Componente:</strong> {confirmDialog.componente.descripcion}
                </div>
                <div className="text-sm">
                  <strong>Cantidad:</strong> {confirmDialog.cantidad} unidades
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm">
                  <strong>Cajoncito:</strong> {confirmDialog.cajoncito.codigo} - {confirmDialog.cajoncito.nombre}
                </div>
                <div className="text-sm">
                  <strong>Organizador:</strong> {organizador.codigo}
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.componente && confirmDialog.cajoncito) {
                  handleAssignComponente(
                    confirmDialog.componente,
                    confirmDialog.cajoncito,
                    confirmDialog.cantidad
                  );
                }
              }}
              disabled={assigning !== null}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {assigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Asignando...
                </>
              ) : (
                "Confirmar Asignación"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}