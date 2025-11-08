"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Package,
  Cpu,
  MapPin,
  Loader2,
  AlertTriangle,
  Building,
  Archive,
  Layers,
  Grid3x3
} from "lucide-react";
import { useNotifications } from "@/components/notifications/notification-provider";
import { LocationPicker } from "./location-picker";

interface ItemData {
  id: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  categoria?: string;
  stockMinimo?: number;
  stockActual?: number;
  valor?: number;
}

interface AssociationPanelProps {
  itemType: 'repuesto' | 'componente';
  itemId: string;
  itemName: string;
  itemCode: string;
  trigger?: React.ReactNode;
  onAssociationUpdate?: () => void;
}

export function AssociationPanel({
  itemType,
  itemId,
  itemName,
  itemCode,
  trigger,
  onAssociationUpdate,
}: AssociationPanelProps) {
  const { showSuccess, showError } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [cantidad, setCantidad] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [currentAssociations, setCurrentAssociations] = useState<any[]>([]);

  // Fetch current associations for the item
  const fetchCurrentAssociations = async () => {
    try {
      const response = await fetch(`/api/${itemType}s/${itemId}/ubicaciones`);
      const data = await response.json();

      if (data.success) {
        setCurrentAssociations(data.data || []);
      } else {
        showError(data.error || "Error al cargar asociaciones", "Error de carga");
      }
    } catch (error) {
      console.error("Error fetching associations:", error);
      showError("Error de conexión al cargar asociaciones", "Error de conexión");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCurrentAssociations();
    }
  }, [isOpen, itemType, itemId]);

  const handleCreateAssociation = async () => {
    if (!selectedLocation) return;

    try {
      setAssigning(true);

      const payload: any = {
        cantidad: cantidad,
      };

      // Add location-specific ID based on location type
      switch (selectedLocation.type) {
        case 'armario':
          payload.armarioId = selectedLocation.id;
          break;
        case 'estanteria':
          payload.estanteriaId = selectedLocation.id;
          break;
        case 'estante':
          payload.estanteId = selectedLocation.id;
          break;
        case 'cajon':
          payload.cajonId = selectedLocation.id;
          break;
        case 'division':
          payload.divisionId = selectedLocation.id;
          break;
        case 'cajoncito':
          payload.cajoncitoId = selectedLocation.id;
          break;
      }

      const response = await fetch(`/api/${itemType}s/${itemId}/ubicaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(
          `${itemType === 'repuesto' ? 'Repuesto' : 'Componente'} asignado exitosamente a ${selectedLocation.name}`,
          "Asignación exitosa"
        );
        setIsOpen(false);
        setConfirmDialog(false);
        setSelectedLocation(null);
        setCantidad(1);
        if (onAssociationUpdate) {
          onAssociationUpdate();
        }
        fetchCurrentAssociations();
      } else {
        showError(data.error || "Error al asignar", "Error de asignación");
      }
    } catch (error) {
      console.error("Error creating association:", error);
      showError("Error de conexión al asignar", "Error de conexión");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAssociation = async (associationId: string) => {
    try {
      const response = await fetch(`/api/${itemType}s/${itemId}/ubicaciones/${associationId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showSuccess("Asociación eliminada exitosamente", "Eliminación exitosa");
        fetchCurrentAssociations();
        if (onAssociationUpdate) {
          onAssociationUpdate();
        }
      } else {
        showError(data.error || "Error al eliminar asociación", "Error de eliminación");
      }
    } catch (error) {
      console.error("Error removing association:", error);
      showError("Error de conexión al eliminar asociación", "Error de conexión");
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'ubicacion': return <Building className="h-4 w-4" />;
      case 'armario': return <Archive className="h-4 w-4" />;
      case 'estanteria': return <Layers className="h-4 w-4" />;
      case 'estante': return <Package className="h-4 w-4" />;
      case 'cajon': return <Package className="h-4 w-4" />;
      case 'division': return <Grid3x3 className="h-4 w-4" />;
      case 'cajoncito': return <Cpu className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const formatLocationPath = (association: any) => {
    let path = [];

    if (association.armario) {
      path.push(association.armario.ubicacion?.nombre || '', association.armario.nombre);
    } else if (association.estanteria) {
      path.push(association.estanteria.ubicacion?.nombre || '', association.estanteria.nombre);
    } else if (association.estante) {
      path.push(
        association.estante.estanteria?.ubicacion?.nombre || '',
        association.estante.estanteria?.nombre || '',
        association.estante.nombre
      );
    } else if (association.cajon) {
      if (association.cajon.armario) {
        path.push(
          association.cajon.armario.ubicacion?.nombre || '',
          association.cajon.armario.nombre || '',
          association.cajon.nombre
        );
      } else if (association.cajon.estanteria) {
        path.push(
          association.cajon.estanteria.ubicacion?.nombre || '',
          association.cajon.estanteria.nombre || '',
          association.cajon.nombre
        );
      }
    } else if (association.division) {
      const cajon = association.division.cajon;
      if (cajon?.armario) {
        path.push(
          cajon.armario.ubicacion?.nombre || '',
          cajon.armario.nombre || '',
          cajon.nombre,
          association.division.nombre
        );
      } else if (cajon?.estanteria) {
        path.push(
          cajon.estanteria.ubicacion?.nombre || '',
          cajon.estanteria.nombre || '',
          cajon.nombre,
          association.division.nombre
        );
      }
    } else if (association.cajoncito) {
      const organizador = association.cajoncito.organizador;
      if (organizador?.estanteria) {
        path.push(
          organizador.estanteria.ubicacion?.nombre || '',
          organizador.estanteria.nombre || '',
          organizador.nombre || '',
          association.cajoncito.nombre || ''
        );
      } else if (organizador?.armario) {
        path.push(
          organizador.armario.ubicacion?.nombre || '',
          organizador.armario.nombre || '',
          organizador.nombre || '',
          association.cajoncito.nombre || ''
        );
      }
    }

    return path.filter(Boolean).join(' > ');
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <Button onClick={() => setIsOpen(true)} size="sm">
          <MapPin className="h-4 w-4 mr-2" />
          Gestionar Ubicaciones
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {itemType === 'repuesto' ? (
                <Package className="h-5 w-5 text-blue-600" />
              ) : (
                <Cpu className="h-5 w-5 text-orange-600" />
              )}
              Gestionar Ubicaciones - {itemName}
            </DialogTitle>
            <DialogDescription>
              Administra las ubicaciones donde se almacena este {itemType === 'repuesto' ? 'repuesto' : 'componente'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">Ubicaciones Actuales</TabsTrigger>
              <TabsTrigger value="add">Agregar Ubicación</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              {/* Current Associations */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Ubicaciones Actuales</h4>

                {currentAssociations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Este {itemType === 'repuesto' ? 'repuesto' : 'componente'} no tiene ubicaciones asignadas</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentAssociations.map((association) => (
                      <div key={association.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getLocationIcon(
                            association.armario ? 'armario' :
                            association.estanteria ? 'estanteria' :
                            association.estante ? 'estante' :
                            association.cajon ? 'cajon' :
                            association.division ? 'division' :
                            association.cajoncito ? 'cajoncito' : 'ubicacion'
                          )}
                          <div>
                            <div className="font-medium">
                              {association.armario?.nombre ||
                               association.estanteria?.nombre ||
                               association.estante?.nombre ||
                               association.cajon?.nombre ||
                               association.division?.nombre ||
                               association.cajoncito?.nombre}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatLocationPath(association)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">
                            Cantidad: {association.cantidad}
                          </Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveAssociation(association.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              {/* Add New Association */}
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-sm mb-1">
                    {itemType === 'repuesto' ? 'Repuesto' : 'Componente'}:
                  </div>
                  <div className="flex items-center gap-2">
                    {itemType === 'repuesto' ? (
                      <Package className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Cpu className="h-4 w-4 text-orange-600" />
                    )}
                    <span className="font-medium">{itemCode}</span>
                    <span className="text-gray-600">-</span>
                    <span>{itemName}</span>
                  </div>
                </div>

                {/* Location Picker */}
                <div className="space-y-2">
                  <Label htmlFor="location">Seleccionar Ubicación</Label>
                  <LocationPicker
                    itemType={itemType}
                    onLocationSelect={setSelectedLocation}
                    selectedLocation={selectedLocation}
                  />
                </div>

                {/* Quantity Input */}
                {selectedLocation && (
                  <div className="space-y-2">
                    <Label htmlFor="cantidad">Cantidad</Label>
                    <Input
                      id="cantidad"
                      type="number"
                      min="1"
                      value={cantidad}
                      onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-32"
                    />
                  </div>
                )}

                {/* Selected Location Summary */}
                {selectedLocation && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-sm mb-1">Ubicación Seleccionada:</div>
                    <div className="flex items-center gap-2">
                      {getLocationIcon(selectedLocation.type)}
                      <span className="font-medium">{selectedLocation.name}</span>
                      <span className="text-gray-600">({selectedLocation.code})</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedLocation && (
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedLocation(null);
                        setCantidad(1);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => setConfirmDialog(true)}
                      disabled={assigning}
                    >
                      {assigning ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Asignando...
                        </>
                      ) : (
                        "Confirmar Asignación"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Asignación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas asignar {cantidad} unidades de {itemName} a {selectedLocation?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateAssociation}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}