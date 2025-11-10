"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { X, Plus, Save, XCircle } from "lucide-react";
import { RepuestoWithRelations, RepuestoCreateInput, RepuestoUpdateInput } from "@/types/api";
import { createDebugAttributes } from "@/lib/debug-attributes";

const repuestoSchema = z.object({
  codigo: z.string().min(1, "Código requerido"),
  nombre: z.string().min(1, "Nombre requerido"),
  descripcion: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  numeroParte: z.string().optional(),
  stockMinimo: z.number().int().min(0),
  categoria: z.string().optional(),
});

type RepuestoFormData = z.infer<typeof repuestoSchema>;

interface RepuestoFormProps {
  repuesto?: RepuestoWithRelations;
  onSubmit: (data: RepuestoCreateInput | RepuestoUpdateInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RepuestoForm({ repuesto, onSubmit, onCancel, isLoading = false }: RepuestoFormProps) {
  const [codigoError, setCodigoError] = useState("");
  const [selectedEquipos, setSelectedEquipos] = useState<string[]>([]);
  const [selectedUbicaciones, setSelectedUbicaciones] = useState<Array<{
    tipo: 'armario' | 'estanteria' | 'estante' | 'cajon' | 'division' | 'cajoncito';
    id: string;
    cantidad: number;
  }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RepuestoFormData>({
    resolver: zodResolver(repuestoSchema),
    defaultValues: {
      codigo: repuesto?.codigo || "",
      nombre: repuesto?.nombre || "",
      descripcion: repuesto?.descripcion || "",
      marca: repuesto?.marca || "",
      modelo: repuesto?.modelo || "",
      numeroParte: repuesto?.numeroParte || "",
      stockMinimo: repuesto?.stockMinimo || 0,
      categoria: repuesto?.categoria || "",
    },
  });

  const watchedCodigo = watch("codigo");

  useEffect(() => {
    if (repuesto) {
      setSelectedEquipos(repuesto.equipos.map(eq => eq.equipo.id));
      setSelectedUbicaciones(
        repuesto.ubicaciones.map(ub => {
          let tipo: 'armario' | 'estanteria' | 'estante' | 'cajon' | 'division' | 'cajoncito';
          if (ub.armario) tipo = 'armario';
          else if (ub.estanteria) tipo = 'estanteria';
          else if (ub.estante) tipo = 'estante';
          else if (ub.cajon) tipo = 'cajon';
          else if (ub.division) tipo = 'division';
          else tipo = 'cajoncito';

          return {
            tipo,
            id: ub.armario?.id || ub.estanteria?.id || ub.estante?.id || ub.cajon?.id || ub.division?.id || '',
            cantidad: ub.cantidad,
          };
        })
      );
    }
  }, [repuesto]);

  const validateCodigo = async (codigo: string) => {
    if (!codigo || (repuesto && codigo === repuesto.codigo)) {
      setCodigoError("");
      return;
    }

    try {
      const response = await fetch(`/api/repuestos/validate/code/${encodeURIComponent(codigo)}`);
      const data = await response.json();
      
      if (data.success && !data.data.isAvailable) {
        setCodigoError("El código ya existe");
      } else {
        setCodigoError("");
      }
    } catch (error) {
      console.error("Error validating code:", error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedCodigo) {
        validateCodigo(watchedCodigo);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedCodigo]);

  const onFormSubmit = async (data: RepuestoFormData) => {
    if (codigoError) {
      return;
    }

    const submitData: RepuestoCreateInput | RepuestoUpdateInput = {
      ...data,
      equipos: selectedEquipos,
      ubicaciones: selectedUbicaciones,
    };

    await onSubmit(submitData);
  };

  const addUbicacion = () => {
    setSelectedUbicaciones([
      ...selectedUbicaciones,
      { tipo: 'armario', id: '', cantidad: 1 }
    ]);
  };

  const removeUbicacion = (index: number) => {
    setSelectedUbicaciones(selectedUbicaciones.filter((_, i) => i !== index));
  };

  const updateUbicacion = (index: number, field: string, value: string | number) => {
    const updated = [...selectedUbicaciones];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedUbicaciones(updated);
  };

return (
    <div className="space-y-6" {...createDebugAttributes({componentName: 'RepuestoForm', filePath: 'src/components/repuestos/repuesto-form.tsx'})}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {repuesto ? "Editar Repuesto" : "Nuevo Repuesto"}
        </h2>
        <Button variant="outline" onClick={onCancel}>
          <XCircle className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  {...register("codigo")}
                  placeholder="Ej: REP-001"
                  className={codigoError ? "border-red-500" : ""}
                />
                {errors.codigo && (
                  <p className="text-sm text-red-500 mt-1">{errors.codigo.message}</p>
                )}
                {codigoError && (
                  <p className="text-sm text-red-500 mt-1">{codigoError}</p>
                )}
              </div>

              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  {...register("nombre")}
                  placeholder="Ej: Motor eléctrico 220V"
                />
                {errors.nombre && (
                  <p className="text-sm text-red-500 mt-1">{errors.nombre.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  {...register("marca")}
                  placeholder="Ej: Siemens"
                />
              </div>

              <div>
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  {...register("modelo")}
                  placeholder="Ej: 3RT1016-1AB42"
                />
              </div>

              <div>
                <Label htmlFor="numeroParte">Número de Parte</Label>
                <Input
                  id="numeroParte"
                  {...register("numeroParte")}
                  placeholder="Ej: 3RT1016-1AB42"
                />
              </div>

              <div>
                <Label htmlFor="categoria">Categoría</Label>
                <Input
                  id="categoria"
                  {...register("categoria")}
                  placeholder="Ej: Eléctrico"
                />
              </div>

              <div>
                <Label htmlFor="stockMinimo">Stock Mínimo</Label>
                <Input
                  id="stockMinimo"
                  type="number"
                  min="0"
                  {...register("stockMinimo", { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.stockMinimo && (
                  <p className="text-sm text-red-500 mt-1">{errors.stockMinimo.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                {...register("descripcion")}
                placeholder="Descripción detallada del repuesto"
              />
            </div>
          </CardContent>
        </Card>

        {/* Ubicaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Ubicaciones de Almacenamiento
              <Button type="button" variant="outline" size="sm" onClick={addUbicacion}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Ubicación
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUbicaciones.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No hay ubicaciones asignadas
              </p>
            ) : (
              <div className="space-y-4">
                {selectedUbicaciones.map((ubicacion, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Tipo</Label>
                        <select
                          value={ubicacion.tipo}
                          onChange={(e) => updateUbicacion(index, 'tipo', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="armario">Armario</option>
                          <option value="estanteria">Estantería</option>
                          <option value="estante">Estante</option>
                          <option value="cajon">Cajón</option>
                          <option value="division">División</option>
                          <option value="cajoncito">Cajoncito</option>
                        </select>
                      </div>
                      <div>
                        <Label>ID Ubicación</Label>
                        <Input
                          value={ubicacion.id}
                          onChange={(e) => updateUbicacion(index, 'id', e.target.value)}
                          placeholder="ID de la ubicación"
                        />
                      </div>
                      <div>
                        <Label>Cantidad</Label>
                        <Input
                          type="number"
                          min="1"
                          value={ubicacion.cantidad}
                          onChange={(e) => updateUbicacion(index, 'cantidad', parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUbicacion(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoading || !!codigoError}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting || isLoading ? "Guardando..." : (repuesto ? "Actualizar" : "Crear")}
          </Button>
        </div>
      </form>
    </div>
  );
}