"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { X, Plus, Save, XCircle } from "lucide-react";
import { ComponenteWithRelations, ComponenteCreateInput, ComponenteUpdateInput } from "@/types/api";
import { validateComponente, validateComponenteByCategory } from "@/lib/validations/componente";

type ComponenteFormData = {
  categoria: string;
  descripcion: string;
  stockMinimo: number;
};

interface ComponenteFormProps {
  componente?: ComponenteWithRelations;
  onSubmit: (data: ComponenteCreateInput | ComponenteUpdateInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const CATEGORIA_LABELS = {
  RESISTENCIA: "Resistencia",
  CAPACITOR: "Capacitor",
  INTEGRADO: "Circuito Integrado",
  VENTILADOR: "Ventilador",
  OTROS: "Otros",
};

export function ComponenteForm({ componente, onSubmit, onCancel, isLoading = false }: ComponenteFormProps) {
  const [valorUnidadPairs, setValorUnidadPairs] = useState<Array<{ valor: string; unidad: string }>>(
    componente?.valorUnidad || [{ valor: "", unidad: "" }]
  );
  const [selectedUbicaciones, setSelectedUbicaciones] = useState<Array<{
    cajoncitoId: string;
    cantidad: number;
  }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger,
  } = useForm<ComponenteFormData>({
    defaultValues: {
      categoria: componente?.categoria || "OTROS",
      descripcion: componente?.descripcion || "",
      stockMinimo: componente?.stockMinimo || 0,
    },
  });

  const watchedCategoria = watch("categoria");

  useEffect(() => {
    if (componente) {
      setSelectedUbicaciones(
        componente.ubicaciones.map(ub => ({
          cajoncitoId: ub.cajoncitoId,
          cantidad: ub.cantidad,
        }))
      );
    }
  }, [componente]);

  const addValorUnidadPair = () => {
    setValorUnidadPairs([...valorUnidadPairs, { valor: "", unidad: "" }]);
  };

  const removeValorUnidadPair = (index: number) => {
    const newPairs = valorUnidadPairs.filter((_, i) => i !== index);
    setValorUnidadPairs(newPairs);
  };

  const updateValorUnidadPair = (index: number, field: "valor" | "unidad", value: string) => {
    const newPairs = [...valorUnidadPairs];
    newPairs[index][field] = value;
    setValorUnidadPairs(newPairs);
  };

  const addUbicacion = () => {
    setSelectedUbicaciones([...selectedUbicaciones, { cajoncitoId: "", cantidad: 1 }]);
  };

  const removeUbicacion = (index: number) => {
    const newUbicaciones = selectedUbicaciones.filter((_, i) => i !== index);
    setSelectedUbicaciones(newUbicaciones);
  };

  const updateUbicacion = (index: number, field: "cajoncitoId" | "cantidad", value: string | number) => {
    const newUbicaciones = [...selectedUbicaciones];
    if (field === "cantidad") {
      newUbicaciones[index][field] = Number(value);
    } else {
      newUbicaciones[index][field] = value as string;
    }
    setSelectedUbicaciones(newUbicaciones);
  };

  const onFormSubmit = async (data: ComponenteFormData) => {
    // Validate valor/unidad pairs
    const validPairs = valorUnidadPairs.filter(pair => pair.valor.trim() && pair.unidad.trim());
    if (validPairs.length === 0) {
      alert("Debe agregar al menos un par valor/unidad completo");
      return;
    }

    // Validate ubicaciones
    const validUbicaciones = selectedUbicaciones.filter(ub => ub.cajoncitoId && ub.cantidad > 0);

    const submitData: any = {
      ...data,
      valorUnidad: validPairs,
      ...(validUbicaciones.length > 0 && { ubicaciones: validUbicaciones }),
    };

    // Validate using Zod schema
    const validation = validateComponente(submitData, !!componente);

    if (!validation.isValid) {
      alert("Errores de validación:\n" + validation.errors.join("\n"));
      return;
    }

    // Category-specific validation
    if (data.categoria && validPairs.length > 0) {
      const categoryValidation = validateComponenteByCategory(data.categoria, validPairs);
      if (!categoryValidation.isValid) {
        alert("Errores de categoría:\n" + categoryValidation.errors.join("\n"));
        return;
      }
    }

    await onSubmit(submitData);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            {componente ? "Editar Componente" : "Nuevo Componente"}
          </CardTitle>
          <Button variant="ghost" onClick={onCancel}>
            <XCircle className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría *</Label>
              <select
                id="categoria"
                value={watchedCategoria}
                onChange={(e) => setValue("categoria", e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {Object.entries(CATEGORIA_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.categoria && (
                <p className="text-sm text-red-600">{errors.categoria.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockMinimo">Stock Mínimo</Label>
              <Input
                id="stockMinimo"
                type="number"
                min="0"
                {...register("stockMinimo", { valueAsNumber: true })}
              />
              {errors.stockMinimo && (
                <p className="text-sm text-red-600">{errors.stockMinimo.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción *</Label>
            <textarea
              id="descripcion"
              placeholder="Describe el componente electrónico..."
              {...register("descripcion")}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.descripcion && (
              <p className="text-sm text-red-600">{errors.descripcion.message}</p>
            )}
          </div>

          {/* Valor/Unidad Pairs */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Valores y Unidades</Label>
              <Button type="button" variant="outline" size="sm" onClick={addValorUnidadPair}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Valor/Unidad
              </Button>
            </div>

            <div className="space-y-2">
              {valorUnidadPairs.map((pair, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Valor (ej: 1K)"
                    value={pair.valor}
                    onChange={(e) => updateValorUnidadPair(index, "valor", e.target.value)}
                  />
                  <Input
                    placeholder="Unidad (ej: Ω)"
                    value={pair.unidad}
                    onChange={(e) => updateValorUnidadPair(index, "unidad", e.target.value)}
                  />
                  {valorUnidadPairs.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeValorUnidadPair(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Ubicaciones */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Ubicaciones</Label>
              <Button type="button" variant="outline" size="sm" onClick={addUbicacion}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Ubicación
              </Button>
            </div>

            <div className="space-y-2">
              {selectedUbicaciones.map((ubicacion, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="ID del Cajoncito"
                    value={ubicacion.cajoncitoId}
                    onChange={(e) => updateUbicacion(index, "cajoncitoId", e.target.value)}
                  />
                  <Input
                    type="number"
                    min="1"
                    placeholder="Cantidad"
                    value={ubicacion.cantidad}
                    onChange={(e) => updateUbicacion(index, "cantidad", e.target.value)}
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUbicacion(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting || isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}