"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RepuestoList } from "@/components/repuestos/repuesto-list";
import { RepuestoForm } from "@/components/repuestos/repuesto-form";
import { RepuestoDetail } from "@/components/repuestos/repuesto-detail";
import { RepuestoWithRelations, RepuestoCreateInput, RepuestoUpdateInput } from "@/types/api";
import { Plus, Package } from "lucide-react";
import { EntityIcon } from "@/components/ui/icon";

type Repuesto = RepuestoWithRelations;

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Force dynamic rendering to avoid build-time static generation issues
export const dynamic = 'force-dynamic';

export default function RepuestosPage() {
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit" | "detail">("list");
  const [selectedRepuesto, setSelectedRepuesto] = useState<RepuestoWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRepuestos = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: "codigo",
        sortOrder: "asc",
      });

      const response = await fetch(`/api/repuestos?${params}`);
      const result = await response.json();

if (result.success) {
        setRepuestos(result.data);
        setPagination(result.pagination);
      } else {
        console.error("Error fetching repuestos:", result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching repuestos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepuestos();
  }, [fetchRepuestos]);

const handleCreateNew = () => {
    setSelectedRepuesto(null);
    setViewMode("create");
  };

  const handleEdit = (repuesto: RepuestoWithRelations) => {
    // Navigate to edit page with query parameter
    window.location.href = `/repuestos/${repuesto.id}?edit=true`;
  };

  const handleView = (repuesto: RepuestoWithRelations) => {
    // Navigate to individual repuesto page
    window.location.href = `/repuestos/${repuesto.id}`;
  };

  const handleDelete = async (repuesto: RepuestoWithRelations) => {
    if (!confirm(`¿Está seguro de que desea eliminar el repuesto "${repuesto.nombre}"?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/repuestos/${repuesto.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchRepuestos(pagination.page, pagination.limit);
      } else {
        const error = await response.json();
        alert(`Error al eliminar: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting repuesto:", error);
      alert("Error al eliminar el repuesto");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (data: RepuestoCreateInput | RepuestoUpdateInput) => {
    try {
      setIsLoading(true);
      const url = selectedRepuesto 
        ? `/api/repuestos/${selectedRepuesto.id}`
        : "/api/repuestos";
      
      const method = selectedRepuesto ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setViewMode("list");
        await fetchRepuestos(pagination.page, pagination.limit);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error saving repuesto:", error);
      alert("Error al guardar el repuesto");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setViewMode("list");
    setSelectedRepuesto(null);
  };

  const handleBack = () => {
    setViewMode("list");
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchRepuestos(newPage, pagination.limit);
  };

const totalStock = repuestos.reduce(
    (total, repuesto) => total + (repuesto.stockActual || 0),
    0
  );

  const lowStockItems = repuestos.filter(
    repuesto => (repuesto.stockActual || 0) <= repuesto.stockMinimo
  ).length;

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <EntityIcon entityType="repuesto" className="h-8 w-8" />
              Repuestos
            </h1>
            <p className="text-muted-foreground">
              Gestiona los repuestos y materiales del taller
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Repuesto
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Repuestos</CardTitle>
              <EntityIcon entityType="repuesto" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <Package className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{lowStockItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipos</CardTitle>
              <EntityIcon entityType="equipo" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {repuestos.reduce((total, r) => total + r.equipos.length, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Repuestos Disponibles</CardTitle>
                <CardDescription>
                  {loading
                    ? "Cargando..."
                    : `Mostrando ${repuestos.length} de ${pagination.total} repuestos`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Cargando repuestos...</p>
              </div>
            ) : repuestos.length === 0 ? (
              <div className="text-center py-8">
                <EntityIcon entityType="repuesto" className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No se encontraron repuestos</h3>
                <p className="text-muted-foreground mb-4">
                  Comienza agregando tu primer repuesto
                </p>
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Repuesto
                </Button>
              </div>
            ) : (
              <RepuestoList
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
      {(viewMode === "create" || viewMode === "edit") && (
        <RepuestoForm
          repuesto={selectedRepuesto || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}
      
      {viewMode === "detail" && selectedRepuesto && (
        <RepuestoDetail
          repuesto={selectedRepuesto}
          onEdit={handleEdit}
          onBack={handleBack}
        />
      )}
    </>
  );
}