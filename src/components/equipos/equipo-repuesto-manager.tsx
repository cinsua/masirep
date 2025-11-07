"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Plus,
  Minus,
  Package,
  Search,
  AlertCircle,
  Check,
  X
} from "lucide-react";
import { EquipoWithRelations } from "@/types/api";

interface RepuestoItem {
  id: string;
  codigo: string;
  nombre: string;
  marca?: string | null;
  modelo?: string | null;
  categoria?: string | null;
  stockActual: number;
  stockMinimo: number;
  isActive: boolean;
}

interface AssociationItem {
  repuestoId: string;
  repuesto: RepuestoItem;
}

interface EquipoRepuestoManagerProps {
  equipo: EquipoWithRelations;
  onSave: (associations: Array<{ repuestoId: string }>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EquipoRepuestoManager({
  equipo,
  onSave,
  onCancel,
  isLoading = false
}: EquipoRepuestoManagerProps) {
  const [availableRepuestos, setAvailableRepuestos] = useState<RepuestoItem[]>([]);
  const [associations, setAssociations] = useState<AssociationItem[]>(
    equipo.repuestos.map(r => ({
      repuestoId: r.repuestoId,
      repuesto: {
        id: r.repuesto.id,
        codigo: r.repuesto.codigo,
        nombre: r.repuesto.nombre,
        marca: r.repuesto.marca,
        modelo: r.repuesto.modelo,
        categoria: r.repuesto.categoria,
        stockActual: r.repuesto.stockActual,
        stockMinimo: r.repuesto.stockMinimo,
        isActive: r.repuesto.isActive,
      }
    }))
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableRepuestos();
  }, []);

  const fetchAvailableRepuestos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/repuestos?limit=1000");
      const data = await response.json();

      if (data.success) {
        const allRepuestos = data.data || [];
        const associatedRepuestoIds = new Set(associations.map(a => a.repuestoId));

        const filtered = allRepuestos.filter((repuesto: RepuestoItem) =>
          repuesto.isActive && !associatedRepuestoIds.has(repuesto.id)
        );

        setAvailableRepuestos(filtered);
      }
    } catch (error) {
      console.error("Error fetching repuestos:", error);
      setError("Error al cargar repuestos disponibles");
    } finally {
      setLoading(false);
    }
  };

  const addRepuesto = (repuesto: RepuestoItem) => {
    const newAssociation: AssociationItem = {
      repuestoId: repuesto.id,
      repuesto
    };

    setAssociations([...associations, newAssociation]);

    // Remove from available repuestos
    setAvailableRepuestos(availableRepuestos.filter(r => r.id !== repuesto.id));

    // Clear search
    setSearch("");
  };

  const removeRepuesto = (repuestoId: string) => {
    const association = associations.find(a => a.repuestoId === repuestoId);
    if (association) {
      // Add back to available repuestos
      setAvailableRepuestos([...availableRepuestos, association.repuesto]);
    }

    setAssociations(associations.filter(a => a.repuestoId !== repuestoId));
  };

  // Función updateCantidad eliminada - las asociaciones técnicas no manejan cantidades

  const handleSave = async () => {
    try {
      setError(null);
      const associationData = associations.map(a => ({
        repuestoId: a.repuestoId
      }));
      await onSave(associationData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al guardar asociaciones");
    }
  };

  const filteredRepuestos = availableRepuestos.filter(repuesto =>
    repuesto.codigo.toLowerCase().includes(search.toLowerCase()) ||
    repuesto.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (repuesto.marca && repuesto.marca.toLowerCase().includes(search.toLowerCase())) ||
    (repuesto.modelo && repuesto.modelo.toLowerCase().includes(search.toLowerCase())) ||
    (repuesto.categoria && repuesto.categoria.toLowerCase().includes(search.toLowerCase()))
  );

  const getStockStatusColor = (stockActual: number, stockMinimo: number) => {
    if (stockActual <= stockMinimo) return "destructive";
    if (stockActual <= stockMinimo * 1.2) return "secondary";
    return "default";
  };

  const getStockStatusText = (stockActual: number, stockMinimo: number) => {
    if (stockActual <= stockMinimo) return "Stock bajo";
    if (stockActual <= stockMinimo * 1.2) return "Stock medio";
    return "Stock suficiente";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestionar Repuestos para Equipo</h2>
          <p className="text-muted-foreground">
            Equipo: {equipo.codigo} - {equipo.nombre}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {associations.length} asociaciones
          </Badge>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Repuestos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Repuestos Disponibles</CardTitle>
            <p className="text-sm text-muted-foreground">
              Asocia repuestos como compatibles técnicas (no consume stock)
            </p>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar repuestos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredRepuestos.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">
                  {search ? "No se encontraron repuestos" : "No hay repuestos disponibles"}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredRepuestos.map((repuesto) => (
                  <div key={repuesto.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{repuesto.codigo}</span>
                        <Badge
                          variant={getStockStatusColor(repuesto.stockActual, repuesto.stockMinimo)}
                          className="text-xs"
                        >
                          {getStockStatusText(repuesto.stockActual, repuesto.stockMinimo)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{repuesto.nombre}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        {repuesto.marca && <span>Marca: {repuesto.marca}</span>}
                        {repuesto.modelo && <span>Modelo: {repuesto.modelo}</span>}
                        <span>Stock: {repuesto.stockActual}/{repuesto.stockMinimo}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addRepuesto(repuesto)}
                      title={`Asociar ${repuesto.codigo} como compatible`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Associations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Repuestos Compatibles ({associations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {associations.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">
                  Sin repuestos asociados
                </p>
                <p className="text-xs text-muted-foreground">
                  Agrega repuestos desde la lista de disponibles
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {associations.map((association) => (
                  <div key={association.repuestoId} className="p-3 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{association.repuesto.codigo}</span>
                          <Badge variant="secondary">Compatible</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {association.repuesto.nombre}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          {association.repuesto.marca && (
                            <span>Marca: {association.repuesto.marca}</span>
                          )}
                          {association.repuesto.modelo && (
                            <span>Modelo: {association.repuesto.modelo}</span>
                          )}
                          <span>Stock disponible: {association.repuesto.stockActual}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Asociación Técnica
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRepuesto(association.repuestoId)}
                          disabled={isLoading}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {associations.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="text-sm text-muted-foreground">
                  Total de repuestos asociados: {associations.length}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}