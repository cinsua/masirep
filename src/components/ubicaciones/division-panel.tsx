"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Grid3x3,
  Plus,
  Edit,
  Trash2,
  Package,
  Archive,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { EntityIcon } from "@/components/ui/icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DivisionForm } from "./division-form";
import { createDebugAttributes } from "@/lib/debug-attributes";

export interface Cajon {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  estanteriaId?: string;
  armarioId?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    divisiones: number;
    repuestos: number;
  };
}

export interface Division {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  cajonId: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    repuestos: number;
  };
}

export interface DivisionPanelProps {
  cajon: Cajon;
  isOpen: boolean;
  onClose: () => void;
  onDivisionUpdate?: () => void;
}

export function DivisionPanel({
  cajon,
  isOpen,
  onClose,
  onDivisionUpdate,
}: DivisionPanelProps) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(false);
  const [divisionFormOpen, setDivisionFormOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [divisionToDelete, setDivisionToDelete] = useState<Division | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load divisions when panel opens
  useEffect(() => {
    if (isOpen) {
      loadDivisions();
    }
  }, [isOpen, cajon.id]);

  const loadDivisions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cajones/${cajon.id}/divisiones`);
      if (response.ok) {
        const data = await response.json();
        setDivisions(data.data || []);
      }
    } catch (error) {
      console.error("Error loading divisions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDivision = async (data: any) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/cajones/${cajon.id}/divisiones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await loadDivisions();
        onDivisionUpdate?.();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Error creating division");
      }
    } catch (error) {
      console.error("Error creating division:", error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDivision = async (data: any) => {
    if (!editingDivision) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/divisiones/${editingDivision.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await loadDivisions();
        onDivisionUpdate?.();
        setEditingDivision(null);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Error updating division");
      }
    } catch (error) {
      console.error("Error updating division:", error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDivision = async () => {
    if (!divisionToDelete) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/divisiones/${divisionToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadDivisions();
        onDivisionUpdate?.();
        setDivisionToDelete(null);
        setDeleteDialogOpen(false);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Error deleting division");
      }
    } catch (error) {
      console.error("Error deleting division:", error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateForm = () => {
    setEditingDivision(null);
    setDivisionFormOpen(true);
  };

  const openEditForm = (division: Division) => {
    setEditingDivision(division);
    setDivisionFormOpen(true);
  };

  const openDeleteDialog = (division: Division) => {
    setDivisionToDelete(division);
    setDeleteDialogOpen(true);
  };

  const closeDivisionForm = () => {
    setDivisionFormOpen(false);
    setEditingDivision(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        {...createDebugAttributes({
          componentName: 'DivisionPanel',
          filePath: 'src/components/ubicaciones/division-panel.tsx'
        })}
      >
        <div 
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          {...createDebugAttributes({
            componentName: 'DivisionPanel',
            filePath: 'src/components/ubicaciones/division-panel.tsx'
          })}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Grid3x3 className="h-6 w-6 text-blue-600" />
                Gestionar Divisiones
              </h2>
              <p className="text-gray-600 mt-1">
                Cajón: <span className="font-medium">{cajon.codigo} - {cajon.nombre}</span>
              </p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Archive className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Divisiones</p>
                      <p className="text-2xl font-bold text-blue-600">{divisions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Repuestos en Divisiones</p>
                      <p className="text-2xl font-bold text-green-600">
                        {divisions.reduce((acc, d) => acc + d._count.repuestos, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Repuestos Directos</p>
                      <p className="text-2xl font-bold text-gray-600">{cajon._count.repuestos}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Create Division Button */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Divisiones del Cajón</h3>
              <Button
                onClick={openCreateForm}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={divisions.length >= 20}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva División
                {divisions.length >= 20 && " (Límite alcanzado)"}
              </Button>
            </div>

            {/* Business Rule Warning */}
            {divisions.length >= 18 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    <strong>Límite próximo:</strong> Máximo 20 divisiones por cajón.
                    Actualmente tienes {divisions.length} divisiones.
                  </p>
                </div>
              </div>
            )}

            {/* Divisions List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Cargando divisiones...</span>
              </div>
            ) : divisions.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Grid3x3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay divisiones
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Este cajón no tiene divisiones configuradas.
                    Puedes crear divisiones para organizar mejor los repuestos.
                  </p>
                  <Button onClick={openCreateForm} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera División
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {divisions.map((division) => (
                  <Card key={division.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <EntityIcon entityType="division" className="h-4 w-4 text-blue-600" />
                            {division.codigo}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600 mt-1">
                            {division.nombre}
                          </CardDescription>
                        </div>

                        <div className="flex items-center gap-2">
                          {division._count.repuestos > 0 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {division._count.repuestos} repuesto{division._count.repuestos !== 1 ? 's' : ''}
                            </Badge>
                          )}

                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditForm(division)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDeleteDialog(division)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={division._count.repuestos > 0}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {division.descripcion && (
                        <p className="text-sm text-gray-700 mb-3">{division.descripcion}</p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Creado: {new Date(division.createdAt).toLocaleDateString('es-MX')}</span>
                        {division._count.repuestos === 0 && (
                          <span className="text-orange-600">Sin repuestos asignados</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Division Form Dialog */}
      <DivisionForm
        isOpen={divisionFormOpen}
        onClose={closeDivisionForm}
        onSubmit={editingDivision ? handleUpdateDivision : handleCreateDivision}
        initialData={editingDivision ? {
          codigo: editingDivision.codigo,
          nombre: editingDivision.nombre,
          descripcion: editingDivision.descripcion,
          cajonId: editingDivision.cajonId,
        } : undefined}
        title={editingDivision ? "Editar División" : "Crear Nueva División"}
        description={editingDivision
          ? `Modificar la división ${editingDivision.codigo}`
          : "Agregar una nueva división al cajón"
        }
        cajonId={cajon.id}
        cajonCodigo={cajon.codigo}
        isSubmitting={submitting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar División?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar la división{" "}
              <strong>{divisionToDelete?.codigo}</strong>?
              {divisionToDelete?._count.repuestos && divisionToDelete._count.repuestos > 0 && (
                <span className="text-red-600 block mt-2">
                  ⚠️ Esta división contiene {divisionToDelete._count.repuestos} repuesto(s).
                  Debes eliminar el contenido primero.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDivision}
              disabled={divisionToDelete?._count.repuestos ? divisionToDelete._count.repuestos > 0 : false}
              className={divisionToDelete?._count.repuestos && divisionToDelete._count.repuestos > 0
                ? "opacity-50 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
              }
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}