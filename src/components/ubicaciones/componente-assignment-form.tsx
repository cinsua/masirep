"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Search, Loader2, AlertTriangle } from "lucide-react";
import { EntityIcon } from "@/components/ui/icon";
import { useNotifications } from "@/components/notifications/notification-provider";
import { createDebugAttributes } from "@/lib/debug-attributes";
import { useComponentes } from "@/hooks/use-componentes";
import { ComponenteWithRelations } from "@/types/api";

// Use ComponenteWithRelations type instead of custom ComponenteData
type ComponenteData = ComponenteWithRelations;

interface Cajoncito {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  organizadorId: string;
}

export interface ComponenteAssignmentFormProps {
  cajoncito: Cajoncito;
  trigger?: React.ReactNode;
}

export function ComponenteAssignmentForm({
  cajoncito,
  trigger,
}: ComponenteAssignmentFormProps) {
  const { showSuccess, showError } = useNotifications();
  const { data: componentes, loading, fetch: fetchComponentes } = useComponentes();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedComponente, setSelectedComponente] = useState<ComponenteData | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState(false);

// Fetch componentes based on search using hook
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isOpen && searchTerm.trim()) {
        fetchComponentes({ search: searchTerm, limit: 10 });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, isOpen, fetchComponentes]);

  const handleAssignComponente = async () => {
    if (!selectedComponente) return;

    try {
      setAssigning(selectedComponente.id);

      const response = await fetch(`/api/componentes/${selectedComponente.id}/ubicaciones`, {
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
        showSuccess(`Componente asignado exitosamente al cajoncito ${cajoncito.codigo}`, "Asignación exitosa");
        setIsOpen(false);
        setConfirmDialog(false);
setSelectedComponente(null);
        setCantidad(1);
        setSearchTerm("");
        fetchComponentes({ search: "", limit: 10 });
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

  const handleComponenteSelect = (componente: ComponenteData) => {
    setSelectedComponente(componente);
    setCantidad(1);
  };

  return (
    <>
      {trigger ? (
        <div 
          onClick={() => setIsOpen(true)}
          {...createDebugAttributes({
            componentName: 'ComponenteAssignmentForm',
            filePath: 'src/components/ubicaciones/componente-assignment-form.tsx'
          })}
        >{trigger}</div>
      ) : (
        <Button 
          onClick={() => setIsOpen(true)} 
          size="sm"
          {...createDebugAttributes({
            componentName: 'ComponenteAssignmentForm',
            filePath: 'src/components/ubicaciones/componente-assignment-form.tsx'
          })}
        >
          <EntityIcon entityType="componente" className="h-4 w-4 mr-2" />
          Asignar Componente
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="max-w-2xl"
          {...createDebugAttributes({
            componentName: 'ComponenteAssignmentForm',
            filePath: 'src/components/ubicaciones/componente-assignment-form.tsx'
          })}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <EntityIcon entityType="componente" className="h-5 w-5 text-orange-600" />
              Asignar Componente al Cajoncito
            </DialogTitle>
            <DialogDescription>
              Busca y asigna un componente electrónico al cajoncito {cajoncito.codigo}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Cajoncito Info */}
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="font-medium text-sm mb-1">Cajoncito Destino:</div>
              <div className="flex items-center gap-2">
                <EntityIcon entityType="cajoncito" className="h-4 w-4 text-orange-600" />
                <span className="font-medium">{cajoncito.codigo}</span>
                <span className="text-gray-600">-</span>
                <span>{cajoncito.nombre}</span>
              </div>
            </div>

            {/* Component Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar Componente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por descripción, categoría o valor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Component Selection */}
            {selectedComponente ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="font-medium mb-2">Componente Seleccionado:</div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className={getCategoryColor(selectedComponente.categoria)}
                    >
                      {getCategoryIcon(selectedComponente.categoria)}
                    </Badge>
                    <span className="font-medium">{selectedComponente.descripcion}</span>
                  </div>
<div className="text-sm text-gray-600">
                    Valor: {selectedComponente.valorUnidad.map(v => `${v.valor} ${v.unidad}`).join(', ')} |
                    Stock: {selectedComponente.stockActual || 0}/{selectedComponente.stockMinimo}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cantidad">Cantidad a asignar</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    min="1"
                    max={selectedComponente.stockActual || 0}
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                  />
                  <p className="text-xs text-gray-600">
                    Stock disponible: {selectedComponente.stockActual || 0} unidades
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedComponente(null)}
                    className="flex-1"
                  >
                    Cambiar Componente
                  </Button>
                  <Button
                    onClick={() => setConfirmDialog(true)}
                    disabled={cantidad <= 0 || cantidad > (selectedComponente.stockActual || 0)}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    Asignar
                  </Button>
                </div>
              </div>
            ) : (
              <>
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
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {componentes.map((componente) => (
                      <div
                        key={componente.id}
                        className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-orange-50 cursor-pointer"
                        onClick={() => handleComponenteSelect(componente)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="secondary"
                              className={getCategoryColor(componente.categoria)}
                            >
                              {getCategoryIcon(componente.categoria)}
                            </Badge>
                            <span className="font-medium text-sm">{componente.descripcion}</span>
                          </div>
<div className="text-xs text-gray-600">
                            Valor: {componente.valorUnidad.map(v => `${v.valor} ${v.unidad}`).join(', ')} | Stock: {componente.stockActual || 0}/{componente.stockMinimo}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Confirmar Asignación
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres asignar {cantidad} unidades del componente al cajoncito?
              Esta acción asignará el componente al compartimento seleccionado.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedComponente && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm">
                  <strong>Componente:</strong> {selectedComponente.descripcion}
                </div>
                <div className="text-sm">
                  <strong>Cantidad:</strong> {cantidad} unidades
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm">
                  <strong>Cajoncito:</strong> {cajoncito.codigo} - {cajoncito.nombre}
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAssignComponente}
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