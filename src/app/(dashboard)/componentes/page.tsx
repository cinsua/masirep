"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ComponenteList } from "@/components/componentes/componente-list";
import { ComponenteForm } from "@/components/componentes/componente-form";
import { ComponenteDetail } from "@/components/componentes/componente-detail";
import { ComponenteWithRelations } from "@/types/api";
import { validateComponente } from "@/lib/validations/componente";
import { Plus, Cpu } from "lucide-react";
import { EntityIcon } from "@/components/ui/icon";

type Componente = ComponenteWithRelations;

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Force dynamic rendering to avoid build-time static generation issues
export const dynamic = 'force-dynamic';

type View = "list" | "form" | "detail";

export default function ComponentesPage() {
  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [view, setView] = useState<View>("list");
  const [selectedComponente, setSelectedComponente] = useState<ComponenteWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchComponentes = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: "codigo",
        sortOrder: "asc",
      });

      const response = await fetch(`/api/componentes?${params}`);
      const result = await response.json();

      if (result.success) {
        setComponentes(result.data);
        setPagination(result.pagination);
      } else {
        console.error("Error fetching componentes:", result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching componentes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComponentes();
  }, [fetchComponentes]);

  const handleCreateNew = useCallback(() => {
    setSelectedComponente(null);
    setView("form");
  }, []);

  const handleEdit = useCallback((componente: ComponenteWithRelations) => {
    // Navigate to edit page with query parameter
    window.location.href = `/componentes/${componente.id}?edit=true`;
  }, []);

  const handleView = useCallback((componente: ComponenteWithRelations) => {
    // Navigate to individual component page
    window.location.href = `/componentes/${componente.id}`;
  }, []);

const handleDelete = useCallback(async (componente: ComponenteWithRelations) => {
    if (!confirm(`¿Está seguro de que desea eliminar el componente "${componente.descripcion}"?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/componentes/${componente.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        alert("Componente eliminado exitosamente");
        await fetchComponentes(pagination.page, pagination.limit);
      } else {
        alert(`Error al eliminar componente: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting componente:", error);
      alert("Error de conexión al eliminar componente");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, fetchComponentes]);

const handleFormSubmit = useCallback(async (data: any) => {
    try {
      setIsLoading(true);

      const url = selectedComponente
        ? `/api/componentes/${selectedComponente.id}`
        : "/api/componentes";

      const method = selectedComponente ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        alert(selectedComponente ? "Componente actualizado exitosamente" : "Componente creado exitosamente");
        setView("list");
        await fetchComponentes(pagination.page, pagination.limit);
      } else {
        const errorMessage = result.details
          ? result.details.join("\n")
          : result.error || "Error desconocido";
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error saving componente:", error);
      alert("Error de conexión al guardar componente");
    } finally {
      setIsLoading(false);
    }
  }, [selectedComponente, pagination.page, pagination.limit, fetchComponentes]);

const handleFormCancel = useCallback(() => {
    setView("list");
    setSelectedComponente(null);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchComponentes(newPage, pagination.limit);
  };

  const totalStock = componentes.reduce(
    (total, componente) => total + (componente.stockActual || 0),
    0
  );

  const lowStockItems = componentes.filter(
    componente => (componente.stockActual || 0) <= componente.stockMinimo
  ).length;

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <EntityIcon entityType="componente" className="h-8 w-8" />
              Componentes Electrónicos
            </h1>
            <p className="text-muted-foreground">
              Gestión de componentes electrónicos con especificaciones técnicas
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Componente
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Componentes</CardTitle>
              <EntityIcon entityType="componente" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <Cpu className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{lowStockItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ubicaciones</CardTitle>
              <EntityIcon entityType="ubicacion" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {componentes.reduce((total, c) => total + (c.ubicaciones?.length || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Componentes Disponibles</CardTitle>
                <CardDescription>
                  {loading
                    ? "Cargando..."
                    : `Mostrando ${componentes.length} de ${pagination.total} componentes`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Cargando componentes...</p>
              </div>
            ) : componentes.length === 0 ? (
              <div className="text-center py-8">
                <EntityIcon entityType="componente" className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No se encontraron componentes</h3>
                <p className="text-muted-foreground mb-4">
                  Comienza agregando tu primer componente
                </p>
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Componente
                </Button>
              </div>
            ) : (
              <ComponenteList
                componentes={componentes}
                loading={loading}
                pagination={pagination}
                onCreateNew={handleCreateNew}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}
              />
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

      {/* Form Modal */}
      {view === "form" && (
        <ComponenteForm
          componente={selectedComponente || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={isLoading}
        />
      )}

      {view === "detail" && selectedComponente && (
        <ComponenteDetail
          componente={selectedComponente}
          onEdit={handleEdit}
          onBack={() => setView("list")}
        />
      )}
    </>
  );
}