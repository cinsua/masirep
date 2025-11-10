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
import { EntityIcon } from "@/components/ui/icon";
import { createDebugAttributes } from "@/lib/debug-attributes";

interface ArmarioFormData {
  nombre: string;
  descripcion?: string;
  ubicacionId: string;
}

interface ArmarioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ArmarioFormData) => Promise<void>;
  initialData?: Partial<ArmarioFormData>;
  title: string;
  description: string;
  ubicacionCodigo?: string;
  ubicacionId: string;
}

export function ArmarioForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  description,
  ubicacionCodigo,
  ubicacionId,
}: ArmarioFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ArmarioFormData>({
    nombre: "",
    descripcion: "",
    ubicacionId: ubicacionId,
  });

  useEffect(() => {
    if (isOpen) {
      const defaultData = {
        nombre: "",
        descripcion: "",
        ubicacionId: ubicacionId,
        ...initialData,
      };

      setFormData(defaultData);
    }
  }, [isOpen, initialData, ubicacionId]);

  const handleInputChange = (field: keyof ArmarioFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      // Generate code automatically
      const generatedCode = ubicacionCodigo
        ? `${ubicacionCodigo}-A${Date.now().toString().slice(-3)}`
        : `A${Date.now().toString().slice(-6)}`;

      const dataToSubmit = {
        ...formData,
        codigo: generatedCode,
      };

      await onSubmit(dataToSubmit);
      setFormData({
        nombre: "",
        descripcion: "",
        ubicacionId: ubicacionId,
      });
      onClose();
    } catch (error) {
      console.error("Error submitting armario form:", error);
      // Error is handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[425px]"
        {...createDebugAttributes({
          componentName: 'ArmarioForm',
          filePath: 'src/components/ubicaciones/armario-form.tsx'
        })}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <EntityIcon entityType="armario" className="h-5 w-5 text-blue-600" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              placeholder="Ej: Armario de Herramientas"
              value={formData.nombre}
              onChange={(e) => handleInputChange("nombre", e.target.value)}
              disabled={isSubmitting}
              required
            />
            <p className="text-sm text-muted-foreground">
              Nombre descriptivo del armario
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="Descripción detallada del contenido o propósito del armario..."
              className="resize-none"
              rows={3}
              value={formData.descripcion}
              onChange={(e) => handleInputChange("descripcion", e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-sm text-muted-foreground">
              Información adicional sobre el armario (opcional)
            </p>
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
              {isSubmitting ? "Guardando..." : "Guardar Armario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}