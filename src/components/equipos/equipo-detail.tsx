"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Wrench,
  Edit,
  Settings,
  Hash,
  Building,
  Tag,
  Search,
  Minus
} from "lucide-react";
import { EntityIcon } from "@/components/ui/icon";
import { EquipoWithRelations } from "@/types/api";
import { createDebugAttributes } from "@/lib/debug-attributes";

interface EquipoDetailProps {
  equipo: EquipoWithRelations;
  onEdit: () => void;
  onManageRepuestos: () => void;
}

export function EquipoDetail({ equipo, onEdit, onManageRepuestos }: EquipoDetailProps) {
  const [activeTab, setActiveTab] = useState<"general" | "repuestos">("general");

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const InfoItem = ({ icon: Icon, label, value, emptyValue = "No especificado" }: {
    icon: any;
    label: string;
    value?: string | number | null;
    emptyValue?: string;
  }) => (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
      <div className="flex-1">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className="text-base">
          {value || <span className="text-muted-foreground">{emptyValue}</span>}
        </div>
      </div>
    </div>
  );

return (
    <div className="space-y-6" {...createDebugAttributes({componentName: 'EquipoDetail', filePath: 'src/components/equipos/equipo-detail.tsx'})}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6" />
            {equipo.nombre}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onManageRepuestos} className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gestionar Repuestos
          </Button>
          <Button onClick={onEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>



      {/* Tabs */}
      <div className="flex space-x-1 border-b">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "general"
              ? "bg-primary text-primary-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Información General
        </button>
        <button
          onClick={() => setActiveTab("repuestos")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "repuestos"
              ? "bg-primary text-primary-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Repuestos Asociados ({equipo._count.repuestos})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem icon={Hash} label="Código" value={equipo.codigo} />
              {equipo.sap && (
                <InfoItem icon={Hash} label="SAP" value={equipo.sap} />
              )}
              <InfoItem icon={Wrench} label="Nombre" value={equipo.nombre} />
              {equipo.descripcion && (
                <div className="flex items-start gap-3">
                  <EntityIcon entityType="equipo" className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-muted-foreground">Descripción</div>
                    <div className="text-base mt-1">{equipo.descripcion}</div>
                  </div>
                </div>
              )}
              <InfoItem
                icon={Tag}
                label="Estado"
                value={equipo.isActive ? "Activo" : "Inactivo"}
              />
            </CardContent>
          </Card>

          {/* Información Técnica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Técnica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem icon={Building} label="Marca" value={equipo.marca} />
              <InfoItem icon={Tag} label="Modelo" value={equipo.modelo} />
              <InfoItem icon={Hash} label="Número de Serie" value={equipo.numeroSerie} />

              <Separator />

              <InfoItem
                icon={Wrench}
                label="Repuestos Asociados"
                value={`${equipo._count.repuestos} repuestos`}
              />

              <div className="pt-2">
                <div className="text-sm font-medium text-muted-foreground mb-2">Fechas</div>
                <div className="space-y-1 text-sm">
                  <div>Creado: {formatDate(equipo.createdAt)}</div>
                  <div>Actualizado: {formatDate(equipo.updatedAt)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "repuestos" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Repuestos Asociados</CardTitle>
          </CardHeader>
          <CardContent>
            {equipo.repuestos.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
                  Sin repuestos asociados
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Este equipo no tiene repuestos asociados actualmente
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {equipo.repuestos.map((association) => (
                  <div key={association.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{association.repuesto.codigo}</h4>
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">Compatible</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {association.repuesto.nombre}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {association.repuesto.marca && (
                          <span>Marca: {association.repuesto.marca}</span>
                        )}
                        {association.repuesto.modelo && (
                          <span>Modelo: {association.repuesto.modelo}</span>
                        )}
                        <span>Stock: {association.repuesto.stockActual}/{association.repuesto.stockMinimo}</span>
                      </div>
                      {association.repuesto.categoria && (
                        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground mt-2">
                          {association.repuesto.categoria}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        Asociado el {formatDate(association.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Summary */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium">Total de repuestos asociados:</span>{" "}
                      {equipo._count.repuestos}
                    </div>
                    <Button
                      onClick={onManageRepuestos}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Gestionar Asociaciones
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}