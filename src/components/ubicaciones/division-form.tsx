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
import { Loader2, Grid3x3 } from "lucide-react";
import { DivisionSchema, DivisionFormData } from "@/lib/validations/cajon";

export interface DivisionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DivisionFormData) => Promise<void>;
  initialData?: Partial<DivisionFormData>;
  title: string;
  description?: string;
  cajonId: string;
  cajonCodigo?: string;
  isSubmitting?: boolean;
}

export function DivisionForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  description,
  cajonId,
  cajonCodigo,
  isSubmitting = false,
}: DivisionFormProps) {
  const [formData, setFormData] = useState<DivisionFormData>({
    codigo: "",
    nombre: "",
    descripcion: "",
    cajonId: cajonId,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        codigo: initialData.codigo || "",
        nombre: initialData.nombre || "",
        descripcion: initialData.descripcion || "",
        cajonId: initialData.cajonId || cajonId,
      });
    } else if (isOpen) {
      // Reset form for new division
      setFormData({
        codigo: "",
        nombre: "",
        descripcion: "",
        cajonId: cajonId,
      });
    }
    setErrors({});
  }, [isOpen, initialData, cajonId]);

  const handleInputChange = (
    field: keyof DivisionFormData,
    value: string
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
      const validatedData = DivisionSchema.parse(formData);

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
            <Grid3x3 className="h-5 w-5" />
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Parent Cajon Information (Read-only) */}
          <div className="p-3 bg-blue-50 rounded-md">
            <Label className="text-sm font-medium text-blue-700">
              Se creará en el Cajón: {cajonCodigo}
            </Label>
            <div className="text-xs text-blue-500 mt-1">
              ID: {cajonId}
            </div>
          </div>

          {/* Nombre (Required) */}
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre de la División <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange("nombre", e.target.value)}
              placeholder="Ej: División de herramientas pequeñas"
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
              placeholder="Descripción opcional de la división..."
              rows={3}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Máximo 500 caracteres
            </p>
          </div>

          {/* Auto-numbering Information */}
          <Alert>
            <Grid3x3 className="h-4 w-4" />
            <AlertDescription>
              El código de la división se generará automáticamente (ej: DIV-001, DIV-002, etc.)
            </AlertDescription>
          </Alert>

          {/* Business Rule Information */}
          <Alert>
            <AlertDescription>
              <strong>Nota:</strong> Máximo 20 divisiones permitidas por cajón
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
              disabled={isSubmitting || !formData.nombre.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : initialData ? (
                "Actualizar División"
              ) : (
                "Crear División"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}