"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Package, Grid3X3 } from "lucide-react";
import { OrganizadorSchema, OrganizadorFormData } from "@/lib/validations/organizador";

export interface OrganizadorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OrganizadorFormData) => Promise<void>;
  initialData?: Partial<OrganizadorFormData>;
  title: string;
  description?: string;
  parentType: "estanteria" | "armario";
  parentId: string;
  isSubmitting?: boolean;
}

export function OrganizadorForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  description,
  parentType,
  parentId,
  isSubmitting = false,
}: OrganizadorFormProps) {
  const [formData, setFormData] = useState<OrganizadorFormData>({
    codigo: "",
    nombre: "",
    descripcion: "",
    estanteriaId: parentType === "estanteria" ? parentId : undefined,
    armarioId: parentType === "armario" ? parentId : undefined,
    cantidadCajoncitos: 24, // Valor por defecto
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        codigo: initialData.codigo || "",
        nombre: initialData.nombre || "",
        descripcion: initialData.descripcion || "",
        estanteriaId: initialData.estanteriaId,
        armarioId: initialData.armarioId,
        cantidadCajoncitos: initialData.cantidadCajoncitos || 24,
      });
    } else if (isOpen) {
      // Reset form for new organizador
      setFormData({
        codigo: "",
        nombre: "",
        descripcion: "",
        estanteriaId: parentType === "estanteria" ? parentId : undefined,
        armarioId: parentType === "armario" ? parentId : undefined,
        cantidadCajoncitos: 24, // Valor por defecto
      });
    }
    setErrors({});
  }, [isOpen, initialData, parentType, parentId]);

  const handleInputChange = (
    field: keyof OrganizadorFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form data using Zod schema
      const validatedData = OrganizadorSchema.parse(formData);

      // Clear any existing errors
      setErrors({});

      // Submit form
      await onSubmit(validatedData);

      // Close dialog on success
      onClose();
    } catch (error) {
      if (error && typeof error === 'object' && 'issues' in error) {
        // Handle Zod validation errors
        const validationErrors: Record<string, string> = {};
        (error as any).issues.forEach((issue: any) => {
          if (issue.path && issue.path.length > 0) {
            const field = issue.path[0] as string;
            validationErrors[field] = issue.message;
          }
        });
        setErrors(validationErrors);
      }
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Parent Information (Read-only) */}
          <div className="p-3 bg-gray-50 rounded-md">
            <Label className="text-sm font-medium text-gray-700">
              Se creará en: {parentType === "estanteria" ? "Estantería" : "Armario"}
            </Label>
            <div className="text-xs text-gray-500 mt-1">
              ID: {parentId}
            </div>
          </div>

          {/* Nombre (Required) */}
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre del Organizador <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange("nombre", e.target.value)}
              placeholder="Ej: Organizador de resistencias"
              className={errors.nombre ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.nombre && (
              <p className="text-sm text-red-500">{errors.nombre}</p>
            )}
          </div>

          {/* Descripción (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion || ""}
              onChange={(e) => handleInputChange("descripcion", e.target.value)}
              placeholder="Descripción opcional del organizador..."
              rows={3}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Máximo 500 caracteres
            </p>
          </div>

          {/* Cantidad de Cajoncitos (Required) */}
          <div className="space-y-2">
            <Label htmlFor="cantidadCajoncitos">
              Cantidad de Cajoncitos <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cantidadCajoncitos"
              type="number"
              min="1"
              max="50"
              value={formData.cantidadCajoncitos}
              onChange={(e) => handleInputChange("cantidadCajoncitos", parseInt(e.target.value) || 1)}
              placeholder="Ej: 24"
              className={errors.cantidadCajoncitos ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.cantidadCajoncitos && (
              <p className="text-sm text-red-500">{errors.cantidadCajoncitos}</p>
            )}
            <p className="text-xs text-gray-500">
              Los cajoncitos se crearán automáticamente y no podrán modificarse individualmente.
              Solo se pueden eliminar borrando todo el organizador.
            </p>
          </div>

          {/* Auto-numbering and Cajoncitos Information */}
          <Alert>
            <Grid3X3 className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Al crear este organizador se generarán automáticamente{" "}
              <strong>{formData.cantidadCajoncitos} cajoncitos</strong> numerados correlativamente.
              Una vez creados, los cajoncitos serán fijos y solo podrán eliminarse si se borra todo el organizador.
            </AlertDescription>
          </Alert>

          {/* Form Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.nombre.trim() || !formData.cantidadCajoncitos}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  Crear Organizador
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}