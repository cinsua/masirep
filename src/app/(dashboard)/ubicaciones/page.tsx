"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationCard, UbicacionForm, StorageTree } from "@/components/ubicaciones";
import { UbicacionFormData } from "@/lib/validations/ubicacion";
import { Plus, Grid, TreePine } from "lucide-react";
import { EntityIcon } from "@/components/ui/icon";

interface Ubicacion {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    armarios: number;
    estanterias: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Force dynamic rendering to avoid build-time static generation issues
export const dynamic = 'force-dynamic';

export default function UbicacionesPage() {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [viewMode, setViewMode] = useState<"grid" | "tree">("grid");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUbicacion, setEditingUbicacion] = useState<Ubicacion | null>(null);

  const fetchUbicaciones = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: "codigo",
        sortOrder: "asc",
      });

      const response = await fetch(`/api/ubicaciones?${params}`);
      const result = await response.json();

      if (result.success) {
        setUbicaciones(result.data.ubicaciones);
        setPagination(result.data.pagination);
      } else {
        console.error("Error fetching ubicaciones:", result.error);
      }
    } catch (error) {
      console.error("Error fetching ubicaciones:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUbicaciones();
  }, [fetchUbicaciones]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchUbicaciones(newPage, pagination.limit);
  };

  const handleCardClick = (ubicacion: Ubicacion) => {
    // Navigate to ubicacion details page
    window.location.href = `/ubicaciones/${ubicacion.id}`;
  };

  const handleCreateUbicacion = () => {
    setEditingUbicacion(null);
    setIsFormOpen(true);
  };

  const handleEditUbicacion = (ubicacion: Ubicacion) => {
    setEditingUbicacion(ubicacion);
    setIsFormOpen(true);
  };

  const handleDeleteUbicacion = async (ubicacion: Ubicacion) => {
    if (ubicacion._count.armarios > 0 || ubicacion._count.estanterias > 0) {
      alert("No se puede eliminar la ubicación porque contiene armarios o estanterías asociadas");
      return;
    }

    if (!confirm(`¿Estás seguro de que quieres eliminar la ubicación "${ubicacion.nombre}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/ubicaciones/${ubicacion.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await fetchUbicaciones(pagination.page, pagination.limit);
      } else {
        alert(`Error al eliminar ubicación: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting ubicacion:", error);
      alert("Error al eliminar la ubicación");
    }
  };

  const handleSubmitUbicacion = async (formData: UbicacionFormData) => {
    const url = editingUbicacion
      ? `/api/ubicaciones/${editingUbicacion.id}`
      : "/api/ubicaciones";

    const method = editingUbicacion ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Error al guardar la ubicación");
    }

    await fetchUbicaciones(pagination.page, pagination.limit);
  };

  const totalItems = ubicaciones.reduce(
    (total, ubicacion) => total + ubicacion._count.armarios + ubicacion._count.estanterias,
    0
  );

  
  // Prepare data for StorageTree component
  const storageTreeData = ubicaciones.map(ubicacion => ({
    id: ubicacion.id,
    codigo: ubicacion.codigo,
    nombre: ubicacion.nombre,
    descripcion: ubicacion.descripcion,
    isActive: ubicacion.isActive,
    type: "ubicacion" as const,
    armariosCount: ubicacion._count.armarios,
    estanteriasCount: ubicacion._count.estanterias,
    children: [] // TODO: Load children when stories 3-2 and 3-3 are implemented
  }));

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <EntityIcon entityType="ubicacion" className="h-8 w-8" />
              Ubicaciones
            </h1>
            <p className="text-muted-foreground">
              Gestiona las ubicaciones principales del taller
            </p>
          </div>
          <div className="flex gap-2">
             <div className="flex">
               <Button
                 type="button"
                 variant={viewMode === "grid" ? "default" : "outline"}
                 size="sm"
                 onClick={() => setViewMode("grid")}
                 className="rounded-r-none"
               >
                 <Grid className="h-4 w-4" />
               </Button>
               <Button
                 type="button"
                 variant={viewMode === "tree" ? "default" : "outline"}
                 size="sm"
                 onClick={() => setViewMode("tree")}
                 className="rounded-l-none"
               >
                 <TreePine className="h-4 w-4" />
               </Button>
             </div>
            <Button onClick={handleCreateUbicacion}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Ubicación
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ubicaciones</CardTitle>
              <EntityIcon entityType="ubicacion" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Armarios</CardTitle>
              <EntityIcon entityType="armario" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ubicaciones.reduce((total, u) => total + u._count.armarios, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estanterías</CardTitle>
                <EntityIcon entityType="estanteria" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ubicaciones.reduce((total, u) => total + u._count.estanterias, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Unidades</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
            </CardContent>
          </Card>
        </div>

        
        {/* Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Ubicaciones Disponibles</CardTitle>
                <CardDescription>
                  {loading
                    ? "Cargando..."
                    : `Mostrando ${ubicaciones.length} de ${pagination.total} ubicaciones`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Cargando ubicaciones...</p>
              </div>
            ) : ubicaciones.length === 0 ? (
              <div className="text-center py-8">
                <EntityIcon entityType="ubicacion" className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No se encontraron ubicaciones</h3>
                <p className="text-muted-foreground mb-4">
                  Comienza agregando tu primera ubicación
                </p>
                <Button onClick={handleCreateUbicacion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Ubicación
                </Button>
              </div>
            ) : viewMode === "tree" ? (
              <StorageTree
                data={storageTreeData}
                onNodeClick={(node) => {
                  if (node.type === "ubicacion") {
                    handleCardClick(ubicaciones.find(u => u.id === node.id)!);
                  }
                }}
                expandByDefault={true}
                showItemCount={true}
                maxDepth={1}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ubicaciones.map((ubicacion) => (
                  <LocationCard
                    key={ubicacion.id}
                    id={ubicacion.id}
                    codigo={ubicacion.codigo}
                    nombre={ubicacion.nombre}
                    descripcion={ubicacion.descripcion}
                    isActive={ubicacion.isActive}
                    armariosCount={ubicacion._count.armarios}
                    estanteriasCount={ubicacion._count.estanterias}
                    type="ubicacion"
                    onClick={() => handleCardClick(ubicacion)}
                    onEdit={() => handleEditUbicacion(ubicacion)}
                    onDelete={() => handleDeleteUbicacion(ubicacion)}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Anterior
            </Button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>

      {/* Ubicacion Form Modal */}
      <UbicacionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitUbicacion}
         initialData={editingUbicacion ? {
           nombre: editingUbicacion.nombre,
           descripcion: editingUbicacion.descripcion,
           isActive: editingUbicacion.isActive,
         } : undefined}
        title={editingUbicacion ? "Editar Ubicación" : "Nueva Ubicación"}
        description={editingUbicacion
          ? "Edita los datos de la ubicación seleccionada"
          : "Crea una nueva ubicación en el sistema"
        }
      />
    </>
  );
}