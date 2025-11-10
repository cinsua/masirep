"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Wrench, MapPin, Settings, AlertTriangle } from "lucide-react";
import { RepuestoWithRelations } from "@/types/api";
import { createDebugAttributes } from "@/lib/debug-attributes";

interface RepuestoDetailProps {
  repuesto: RepuestoWithRelations;
  onEdit: (repuesto: RepuestoWithRelations) => void;
  onBack: () => void;
}

export function RepuestoDetail({ repuesto, onEdit, onBack }: RepuestoDetailProps) {
  const getStockStatus = () => {
    if (repuesto.stockActual === 0) return { label: "Sin stock", variant: "destructive" as const, icon: AlertTriangle };
    if (repuesto.stockActual <= repuesto.stockMinimo) return { label: "Stock bajo", variant: "secondary" as const, icon: AlertTriangle };
    return { label: "En stock", variant: "default" as const, icon: Wrench };
  };

  const stockStatus = getStockStatus();

  const getLocationName = (ubicacion: { armario?: { nombre: string } | null; estanteria?: { nombre: string } | null; estante?: { nombre: string } | null; cajon?: { nombre: string } | null; division?: { nombre: string } | null }) => {
    if (ubicacion.armario) return `Armario: ${ubicacion.armario.nombre}`;
    if (ubicacion.estanteria) return `Estantería: ${ubicacion.estanteria.nombre}`;
    if (ubicacion.estante) return `Estante: ${ubicacion.estante.nombre}`;
    if (ubicacion.cajon) return `Cajón: ${ubicacion.cajon.nombre}`;
    if (ubicacion.division) return `División: ${ubicacion.division.nombre}`;
    return "Ubicación desconocida";
  };

return (
    <div className="space-y-6" {...createDebugAttributes({componentName: 'RepuestoDetail', filePath: 'src/components/repuestos/repuesto-detail.tsx'})}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-2">
            <Wrench className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Detalles del Repuesto</h1>
          </div>
        </div>
        <Button onClick={() => onEdit(repuesto)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Información Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Información Principal
            <Badge variant={stockStatus.variant} className="flex items-center space-x-1">
              <stockStatus.icon className="h-3 w-3" />
              <span>{stockStatus.label}</span>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Código</h4>
              <p className="font-mono text-lg">{repuesto.codigo}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Nombre</h4>
              <p className="text-lg">{repuesto.nombre}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Categoría</h4>
              <p>{repuesto.categoria || "Sin categoría"}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Marca</h4>
              <p>{repuesto.marca || "No especificada"}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Modelo</h4>
              <p>{repuesto.modelo || "No especificado"}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Número de Parte</h4>
              <p className="font-mono">{repuesto.numeroParte || "No especificado"}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Stock Actual</h4>
              <p className="text-2xl font-bold text-primary">{repuesto.stockActual}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Stock Mínimo</h4>
              <p className="text-lg">{repuesto.stockMinimo}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Estado</h4>
              <Badge variant={repuesto.isActive ? "default" : "secondary"}>
                {repuesto.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>
          {repuesto.descripcion && (
            <div className="mt-6">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Descripción</h4>
              <p className="text-sm leading-relaxed">{repuesto.descripcion}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Equipos Asociados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Equipos Asociados ({repuesto.equipos.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {repuesto.equipos.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay equipos asociados a este repuesto
            </p>
          ) : (
            <div className="space-y-3">
              {repuesto.equipos.map((equipo) => (
                <div key={equipo.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{equipo.equipo.nombre}</p>
                    <p className="text-sm text-muted-foreground font-mono">{equipo.equipo.codigo}</p>
                  </div>
                  <Badge variant="secondary">Compatible</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ubicaciones de Almacenamiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Ubicaciones de Almacenamiento ({repuesto.ubicaciones.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {repuesto.ubicaciones.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay ubicaciones asignadas a este repuesto
            </p>
          ) : (
            <div className="space-y-3">
              {repuesto.ubicaciones.map((ubicacion) => (
                <div key={ubicacion.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{getLocationName(ubicacion)}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {ubicacion.armario?.codigo || 
                         ubicacion.estanteria?.codigo || 
                         ubicacion.estante?.codigo || 
                         ubicacion.cajon?.codigo || 
                         ubicacion.division?.codigo}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Cantidad: {ubicacion.cantidad}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información de Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-muted-foreground">ID Interno</h4>
              <p className="font-mono">{repuesto.id}</p>
            </div>
            <div>
              <h4 className="font-semibold text-muted-foreground">Fecha de Creación</h4>
              <p>{new Date(repuesto.createdAt).toLocaleDateString('es-ES')}</p>
            </div>
            <div>
              <h4 className="font-semibold text-muted-foreground">Última Actualización</h4>
              <p>{new Date(repuesto.updatedAt).toLocaleDateString('es-ES')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}