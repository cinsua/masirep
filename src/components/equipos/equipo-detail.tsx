"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Wrench,
  ArrowLeft,
  Edit,
  Package,
  Hash,
  Building,
  Tag,
  Search,
  Plus,
  Minus
} from "lucide-react";
import { EquipoWithRelations } from "@/types/api";

interface EquipoDetailProps {
  equipo: EquipoWithRelations;
  onBack: () => void;
  onEdit: () => void;
  onManageRepuestos: () => void;
}

export function EquipoDetail({ equipo, onBack, onEdit, onManageRepuestos }: EquipoDetailProps) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wrench className="h-6 w-6" />
              {equipo.nombre}
            </h1>
            <p className="text-muted-foreground">
              Detalles del equipo {equipo.codigo}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <Badge variant={equipo.isActive ? "default" : "secondary"} className="text-sm">
          {equipo.isActive ? "Activo" : "Inactivo"}
        </Badge>
        {equipo.sap && (
          <Badge variant="outline" className="font-mono">
            SAP: {equipo.sap}
          </Badge>
        )}
        <Badge variant="secondary" className="flex items-center gap-1">
          <Package className="h-3 w-3" />
          {equipo._count.repuestos} repuestos
        </Badge>
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
                  <Wrench className="h-4 w-4 mt-0.5 text-muted-foreground" />
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
                icon={Package}
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Repuestos Asociados</CardTitle>
            <Button onClick={onManageRepuestos} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Gestionar Repuestos
            </Button>
          </CardHeader>
          <CardContent>
            {equipo.repuestos.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
                  Sin repuestos asociados
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Este equipo no tiene repuestos asociados actualmente
                </p>
                <div className="mt-6">
                  <Button onClick={onManageRepuestos} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Agregar Primer Repuesto
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {equipo.repuestos.map((association) => (
                  <div key={association.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{association.repuesto.codigo}</h4>
                        <Badge variant="secondary">Compatible</Badge>
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
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {association.repuesto.categoria}
                        </Badge>
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