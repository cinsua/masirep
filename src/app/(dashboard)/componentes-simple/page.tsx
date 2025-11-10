"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Cpu } from "lucide-react";
import { EntityIcon } from "@/components/ui/icon";

interface Componente {
  id: string;
  categoria: string;
  descripcion: string;
  stockMinimo: number;
  stockActual: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function ComponentesPage() {
  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchComponentes = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      const response = await fetch(`/api/componentes-test?${params}`);
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

  const totalStock = componentes.reduce(
    (total, componente) => total + (componente.stockActual || 0),
    0
  );

  const lowStockItems = componentes.filter(
    componente => (componente.stockActual || 0) <= componente.stockMinimo
  ).length;

  return (
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
          <Button>
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
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <EntityIcon entityType="componente" className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {componentes.filter(c => c.isActive).length}
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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Componente
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {componentes.map((componente) => (
                <div key={componente.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{componente.descripcion}</h3>
                      <p className="text-sm text-muted-foreground">{componente.categoria}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{componente.stockActual || 0}</p>
                      <p className="text-sm text-muted-foreground">Stock</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}