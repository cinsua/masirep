"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EquipoList } from "@/components/equipos/equipo-list";
import { EquipoWithRelations } from "@/types/api";
import { Wrench } from "lucide-react";
import { EntityIcon } from "@/components/ui/icon";

type Equipo = EquipoWithRelations;

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  totalPages: number;
}

// Force dynamic rendering to avoid build-time static generation issues
export const dynamic = 'force-dynamic';

export default function EquiposPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    totalPages: 0,
  });
  

  const fetchEquipos = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: "codigo",
        sortOrder: "asc",
      });

      const response = await fetch(`/api/equipos?${params}`);
      const result = await response.json();

      if (result.success) {
        setEquipos(result.data);
        setPagination(result.pagination);
      } else {
        console.error("Error fetching equipos:", result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching equipos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipos();
  }, [fetchEquipos]);

  

  const handleEdit = (equipo: EquipoWithRelations) => {
    // Navigate to edit page with query parameter
    window.location.href = `/equipos/${equipo.id}?edit=true`;
  };

  const handleDelete = async (equipo: EquipoWithRelations) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el equipo "${equipo.nombre}" (${equipo.codigo})? Esta acción se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/equipos/${equipo.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.error || "Error al eliminar equipo");
      } else {
        await fetchEquipos(pagination.page, pagination.limit);
      }
    } catch (error) {
      alert("Error de conexión al eliminar equipo");
    }
  };

  

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchEquipos(newPage, pagination.limit);
  };

  

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header con icono y descripción */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <EntityIcon entityType="equipo" className="h-8 w-8" />
              Equipos
            </h1>
            <p className="text-muted-foreground">
              Gestiona los equipos y maquinaria del taller
            </p>
          </div>
        </div>

        {/* Únicamente el listado en una tarjeta */}
        <Card>
          <CardContent>
            <EquipoList
              equipos={equipos}
              loading={loading}
              pagination={pagination}
              onEdit={handleEdit}
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