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
import { Grid3x3 } from "lucide-react";

interface EstanteriaFormData {
  nombre: string;
  descripcion?: string;
  ubicacionId: string;
}

interface EstanteriaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EstanteriaFormData) => Promise<void>;
  initialData?: Partial<EstanteriaFormData>;
  title: string;
  description: string;
  ubicacionCodigo?: string;
  ubicacionId: string;
}

export function EstanteriaForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  description,
  ubicacionCodigo,
  ubicacionId,
}: EstanteriaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EstanteriaFormData>({
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

  const handleInputChange = (field: keyof EstanteriaFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      // Generate code automatically
      const generatedCode = ubicacionCodigo
        ? `${ubicacionCodigo}-E${Date.now().toString().slice(-3)}`
        : `E${Date.now().toString().slice(-6)}`;

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
      console.error("Error submitting estanteria form:", error);
      // Error is handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              placeholder="Ej: Estantería de Repuestos"
              value={formData.nombre}
              onChange={(e) => handleInputChange("nombre", e.target.value)}
              disabled={isSubmitting}
              required
            />
            <p className="text-sm text-muted-foreground">
              Nombre descriptivo de la estantería
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="Descripción detallada del contenido o propósito de la estantería..."
              className="resize-none"
              rows={3}
              value={formData.descripcion}
              onChange={(e) => handleInputChange("descripcion", e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-sm text-muted-foreground">
              Información adicional sobre la estantería (opcional)
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
              {isSubmitting ? "Guardando..." : "Guardar Estantería"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}