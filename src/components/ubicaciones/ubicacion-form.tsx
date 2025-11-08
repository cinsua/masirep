"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MapPin, AlertCircle } from "lucide-react";
import { z } from "zod";
import { UbicacionSchema } from "@/lib/validations/ubicacion";

interface UbicacionFormData {
  codigo: string;
  nombre: string;
  descripcion?: string;
  isActive: boolean;
}

interface UbicacionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UbicacionFormData) => Promise<void>;
  initialData?: Partial<UbicacionFormData>;
  title: string;
  description?: string;
}

export function UbicacionForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  description,
}: UbicacionFormProps) {
  const [formData, setFormData] = useState<UbicacionFormData>({
    codigo: "",
    nombre: "",
    descripcion: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        codigo: initialData.codigo || "",
        nombre: initialData.nombre || "",
        descripcion: initialData.descripcion || "",
        isActive: initialData.isActive ?? true,
      });
    } else {
      setFormData({
        codigo: "",
        nombre: "",
        descripcion: "",
        isActive: true,
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [initialData, isOpen]);

  const validateForm = () => {
    try {
      UbicacionSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error && typeof error === 'object' && 'issues' in error) {
        const fieldErrors: Record<string, string> = {};
        (error as any).issues.forEach((issue: any) => {
          fieldErrors[issue.path[0]] = issue.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Error al guardar la ubicación"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof UbicacionFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">
                Código <span className="text-red-500">*</span>
              </Label>
              <Input
                id="codigo"
                placeholder="Ej: ACERIA, MASI, REDUCCION"
                value={formData.codigo}
                onChange={(e) => handleInputChange("codigo", e.target.value)}
                className={errors.codigo ? "border-red-500" : ""}
              />
              {errors.codigo && (
                <p className="text-sm text-red-500">{errors.codigo}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                placeholder="Ej: Área de Acería, Taller Masi, Zona de Reducción"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                className={errors.nombre ? "border-red-500" : ""}
              />
              {errors.nombre && (
                <p className="text-sm text-red-500">{errors.nombre}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe la ubicación, su propósito o características especiales..."
                value={formData.descripcion || ""}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                rows={3}
              />
              {errors.descripcion && (
                <p className="text-sm text-red-500">{errors.descripcion}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange("isActive", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isActive" className="text-sm">
                Ubicación activa
              </Label>
              {formData.isActive ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Activa
                </Badge>
              ) : (
                <Badge variant="destructive">
                  Inactiva
                </Badge>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}