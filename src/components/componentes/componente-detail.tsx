"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, MapPin, Archive, Cog } from "lucide-react";
import { ComponenteWithRelations } from "@/types/api";
import { createDebugAttributes } from "@/lib/debug-attributes";

interface ComponenteDetailProps {
  componente: ComponenteWithRelations;
  onEdit: (componente: ComponenteWithRelations) => void;
  onBack: () => void;
}

const CATEGORIA_LABELS = {
  RESISTENCIA: "Resistencia",
  CAPACITOR: "Capacitor",
  INTEGRADO: "Circuito Integrado",
  VENTILADOR: "Ventilador",
  OTROS: "Otros",
};

const CATEGORIA_COLORS = {
  RESISTENCIA: "bg-red-100 text-red-800",
  CAPACITOR: "bg-blue-100 text-blue-800",
  INTEGRADO: "bg-green-100 text-green-800",
  VENTILADOR: "bg-yellow-100 text-yellow-800",
  OTROS: "bg-gray-100 text-gray-800",
};

export function ComponenteDetail({ componente, onEdit, onBack }: ComponenteDetailProps) {
  if (!componente) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Componente no encontrado</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const formatValorUnidad = (valorUnidad: Array<{ valor: string; unidad: string }>) => {
    return valorUnidad.map(pair => `${pair.valor} ${pair.unidad}`).join(", ");
  };

  const getStockStatus = (componente: ComponenteWithRelations) => {
    const stockActual = componente.stockActual || 0;
    const stockMinimo = componente.stockMinimo;

    if (stockActual === 0) {
      return { label: "Sin stock", color: "bg-red-100 text-red-800" };
    } else if (stockActual <= stockMinimo) {
      return { label: "Stock bajo", color: "bg-orange-100 text-orange-800" };
    } else {
      return { label: "En stock", color: "bg-green-100 text-green-800" };
    }
  };

  const stockStatus = getStockStatus(componente);
  const totalStock = componente.ubicaciones?.reduce((sum, ub) => sum + ub.cantidad, 0) || 0;

return (
    <div className="max-w-4xl mx-auto space-y-6" {...createDebugAttributes({componentName: 'ComponenteDetail', filePath: 'src/components/componentes/componente-detail.tsx'})}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-2">
            <Cog className="h-6 w-6 text-orange-600" />
            <h1 className="text-2xl font-bold">Detalles del Componente</h1>
          </div>
        </div>
        <Button onClick={() => onEdit(componente)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Main Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Información General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Categoría</label>
                <div className="mt-1">
                  <Badge className={CATEGORIA_COLORS[componente.categoria]}>
                    {CATEGORIA_LABELS[componente.categoria]}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Descripción</label>
                <p className="mt-1 text-base">{componente.descripcion}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Especificaciones Técnicas</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {componente.valorUnidad.map((pair, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {pair.valor} {pair.unidad}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Stock</label>
                <div className="mt-1 flex items-center gap-2">
                  <Badge className={stockStatus.color}>
                    {stockStatus.label}: {totalStock} unidades
                  </Badge>
                  <span className="text-sm text-gray-500">
                    (Mínimo: {componente.stockMinimo})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ubicaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ubicaciones de Almacenamiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(componente.ubicaciones?.length || 0) === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Este componente no tiene ubicaciones asignadas
            </p>
          ) : (
            <div className="space-y-3">
              {componente.ubicaciones?.map((ubicacion) => {
                // Simplified location path (only cajoncito info available)
                const locationPath = [
                  `Cajoncito: ${ubicacion.cajoncito.codigo} (${ubicacion.cajoncito.nombre})`
                ];

                return (
                  <div
                    key={ubicacion.id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-lg">
                          {ubicacion.cantidad} unidades
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {locationPath.join(" → ")}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {ubicacion.cajoncito.codigo}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-sm font-medium text-gray-500">ID del Componente</label>
              <p className="font-mono mt-1">{componente.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Fecha de Creación</label>
              <p className="mt-1">
                {new Date(componente.createdAt).toLocaleString("es-MX")}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Última Actualización</label>
              <p className="mt-1">
                {new Date(componente.updatedAt).toLocaleString("es-MX")}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Estado</label>
              <p className="mt-1">
                <Badge className={componente.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {componente.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}