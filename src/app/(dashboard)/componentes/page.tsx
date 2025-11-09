"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ComponenteList } from "@/components/componentes/componente-list";
import { ComponenteWithRelations } from "@/types/api";
import { Cpu } from "lucide-react";
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
    }
  }, [pagination.page, pagination.limit, fetchComponentes]);



  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchComponentes(newPage, pagination.limit);
  };

  

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header con icono y descripción */}
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
        </div>

        {/* Únicamente el listado en una tarjeta */}
        <Card>
          <CardContent>
            <ComponenteList
              componentes={componentes}
              loading={loading}
              pagination={pagination}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
            />
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

      
    </>
  );
}