"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RepuestoList } from "@/components/repuestos/repuesto-list";
import { RepuestoWithRelations } from "@/types/api";
import { Package } from "lucide-react";
import { EntityIcon } from "@/components/ui/icon";

type Repuesto = RepuestoWithRelations;

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  totalPages: number;
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
    totalPages: 0,
  });
  

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
    }
  };

  

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchRepuestos(newPage, pagination.limit);
  };



  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header con icono y descripción */}
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
        </div>

        {/* Únicamente el listado en una tarjeta */}
        <Card>
          <CardContent>
            <RepuestoList
              repuestos={repuestos}
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