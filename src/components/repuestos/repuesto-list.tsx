"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Eye, Trash2, Package } from "lucide-react";
import { RepuestoWithRelations, PaginatedResponse } from "@/types/api";

interface RepuestoListProps {
  onCreateNew: () => void;
  onEdit: (repuesto: RepuestoWithRelations) => void;
  onView: (repuesto: RepuestoWithRelations) => void;
  onDelete: (repuesto: RepuestoWithRelations) => void;
}

export function RepuestoList({ onCreateNew, onEdit, onView, onDelete }: RepuestoListProps) {
  const [repuestos, setRepuestos] = useState<RepuestoWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchRepuestos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(search && { search }),
      });

      const response = await fetch(`/api/repuestos?${params}`);
      const data: PaginatedResponse<RepuestoWithRelations> = await response.json();

      if (data.success) {
        setRepuestos(data.data || []);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching repuestos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepuestos();
  }, [currentPage, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const getStockStatus = (repuesto: RepuestoWithRelations) => {
    if (repuesto.stockActual === 0) return { label: "Sin stock", variant: "destructive" as const };
    if (repuesto.stockActual <= repuesto.stockMinimo) return { label: "Stock bajo", variant: "secondary" as const };
    return { label: "En stock", variant: "default" as const };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Repuestos</h1>
        </div>
        <Button onClick={onCreateNew} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nuevo Repuesto</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Búsqueda y Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por código, nombre, descripción..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {total} repuestos encontrados
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repuestos Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Stock Actual</TableHead>
                <TableHead>Stock Mínimo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Equipos</TableHead>
                <TableHead>Ubicaciones</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : repuestos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    No se encontraron repuestos
                  </TableCell>
                </TableRow>
              ) : (
                repuestos.map((repuesto) => {
                  const stockStatus = getStockStatus(repuesto);
                  return (
                    <TableRow key={repuesto.id}>
                      <TableCell className="font-medium">{repuesto.codigo}</TableCell>
                      <TableCell>{repuesto.nombre}</TableCell>
                      <TableCell className="max-w-xs truncate">{repuesto.descripcion || "-"}</TableCell>
                      <TableCell>{repuesto.stockActual}</TableCell>
                      <TableCell>{repuesto.stockMinimo}</TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                      </TableCell>
                      <TableCell>{repuesto.equipos.length}</TableCell>
                      <TableCell>{repuesto.ubicaciones.length}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(repuesto)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(repuesto)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(repuesto)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}