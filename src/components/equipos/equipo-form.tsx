"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, X, Plus, Wrench, Trash2 } from "lucide-react";
import { EquipoFormData, EquipoSchema } from "@/lib/validations/equipo";
import { EquipoWithRelations } from "@/types/api";

interface EquipoFormProps {
  item?: EquipoWithRelations;
  onSubmit: (data: EquipoFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface RepuestoItem {
  id: string;
  codigo: string;
  nombre: string;
  stockActual: number;
}

export function EquipoForm({ item, onSubmit, onCancel, isLoading = false }: EquipoFormProps) {
  const [repuestos, setRepuestos] = useState<RepuestoItem[]>([]);
  const [selectedRepuestos, setSelectedRepuestos] = useState<Array<{ repuestoId: string }>>(
    item?.repuestos.map(r => ({ repuestoId: r.repuesto.id })) || []
  );
  const [loadingRepuestos, setLoadingRepuestos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(EquipoSchema),
    defaultValues: item ? {
      sap: item.sap || "",
      nombre: item.nombre,
      descripcion: item.descripcion || "",
      marca: item.marca || "",
      modelo: item.modelo || "",
      numeroSerie: item.numeroSerie || "",
      isActive: item.isActive ?? true,
      repuestos: [],
    } : {
      sap: "",
      nombre: "",
      descripcion: "",
      marca: "",
      modelo: "",
      numeroSerie: "",
      isActive: true,
      repuestos: [],
    },
  });

  useEffect(() => {
    fetchRepuestos();
  }, []);

  const fetchRepuestos = async () => {
    try {
      setLoadingRepuestos(true);
      const response = await fetch("/api/repuestos?limit=1000");
      const data = await response.json();

      if (data.success) {
        setRepuestos(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching repuestos:", error);
      setError("Error al cargar repuestos disponibles");
    } finally {
      setLoadingRepuestos(false);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setError(null);
      const submitData = {
        ...data,
        repuestos: selectedRepuestos,
      };
      await onSubmit(submitData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al guardar equipo");
    }
  };

  const addRepuesto = (repuestoId: string) => {
    const existing = selectedRepuestos.find(r => r.repuestoId === repuestoId);
    if (!existing) {
      setSelectedRepuestos([...selectedRepuestos, { repuestoId }]);
    }
  };

  const removeRepuesto = (repuestoId: string) => {
    setSelectedRepuestos(selectedRepuestos.filter(r => r.repuestoId !== repuestoId));
  };

  // Función updateRepuestoCantidad eliminada - las asociaciones técnicas no manejan cantidades

  const getRepuestoById = (id: string) => repuestos.find(r => r.id === id);

  const availableRepuestos = repuestos.filter(
    r => !selectedRepuestos.find(sr => sr.repuestoId === r.id)
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          {item ? "Editar Equipo" : "Nuevo Equipo"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Básica</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sap">SAP *</Label>
                <Input
                  id="sap"
                  {...register("sap")}
                  placeholder="Ej: ESP20, PREPMASTER"
                  disabled={isLoading}
                  className={errors.sap ? "border-red-500" : ""}
                />
                {errors.sap && (
                  <p className="text-sm text-red-500">{errors.sap.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                {...register("nombre")}
                placeholder="Ej: ESP20, PREPMASTER"
                disabled={isLoading}
                className={errors.nombre ? "border-red-500" : ""}
              />
              {errors.nombre && (
                <p className="text-sm text-red-500">{errors.nombre.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                {...register("descripcion")}
                placeholder="Descripción detallada del equipo..."
                rows={3}
                disabled={isLoading}
                className={errors.descripcion ? "border-red-500" : ""}
              />
              {errors.descripcion && (
                <p className="text-sm text-red-500">{errors.descripcion.message}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Información Técnica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Técnica</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  {...register("marca")}
                  placeholder="Ej: Siemens"
                  disabled={isLoading}
                  className={errors.marca ? "border-red-500" : ""}
                />
                {errors.marca && (
                  <p className="text-sm text-red-500">{errors.marca.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  {...register("modelo")}
                  placeholder="Ej: S7-1200"
                  disabled={isLoading}
                  className={errors.modelo ? "border-red-500" : ""}
                />
                {errors.modelo && (
                  <p className="text-sm text-red-500">{errors.modelo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroSerie">Número de Serie</Label>
                <Input
                  id="numeroSerie"
                  {...register("numeroSerie")}
                  placeholder="Ej: SN123456789"
                  disabled={isLoading}
                  className={errors.numeroSerie ? "border-red-500" : ""}
                />
                {errors.numeroSerie && (
                  <p className="text-sm text-red-500">{errors.numeroSerie.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Repuestos Asociados */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Repuestos Asociados</h3>

            {/* Selector de repuestos */}
            <div className="space-y-2">
              <Label>Agregar Repuesto</Label>
              {loadingRepuestos ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando repuestos disponibles...
                </div>
              ) : availableRepuestos.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay repuestos disponibles para asociar
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(e) => {
                      if (e.target.value) {
                        addRepuesto(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    disabled={isLoading}
                  >
                    <option value="">Seleccionar repuesto...</option>
                    {availableRepuestos.map((repuesto) => (
                      <option key={repuesto.id} value={repuesto.id}>
                        {repuesto.codigo} - {repuesto.nombre} (Stock: {repuesto.stockActual})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Lista de repuestos seleccionados */}
            {selectedRepuestos.length > 0 && (
              <div className="space-y-2">
                <Label>Repuestos Seleccionados ({selectedRepuestos.length})</Label>
                <div className="space-y-2">
                  {selectedRepuestos.map(({ repuestoId }) => {
                    const repuesto = getRepuestoById(repuestoId);
                    if (!repuesto) return null;

                    return (
                      <div key={repuestoId} className="flex items-center gap-2 p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{repuesto.codigo}</div>
                          <div className="text-sm text-muted-foreground">{repuesto.nombre}</div>
                          <div className="text-xs text-muted-foreground">
                            Stock disponible: {repuesto.stockActual}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Asociación Técnica
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRepuesto(repuestoId)}
                            disabled={isLoading}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isDirty}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}