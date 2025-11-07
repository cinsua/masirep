"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Eye, Trash2, Zap } from "lucide-react";
import { ComponenteWithRelations, PaginatedResponse } from "@/types/api";

interface ComponenteListProps {
  onCreateNew: () => void;
  onEdit: (componente: ComponenteWithRelations) => void;
  onView: (componente: ComponenteWithRelations) => void;
  onDelete: (componente: ComponenteWithRelations) => void;
}

const CATEGORIA_LABELS = {
  RESISTENCIA: "Resistencia",
  CAPACITOR: "Capacitor",
  INTEGRADO: "Circuito Integrado",
  VENTILADOR: "Ventilador",
  OTROS: "Otros",
};

const CATEGORIA_COLORS = {
  RESISTENCIA: "bg-red-100 text-red-800",
  CAPACITOR: "bg-blue-100 text-blue-800",
  INTEGRADO: "bg-green-100 text-green-800",
  VENTILADOR: "bg-yellow-100 text-yellow-800",
  OTROS: "bg-gray-100 text-gray-800",
};

export function ComponenteList({ onCreateNew, onEdit, onView, onDelete }: ComponenteListProps) {
  const [componentes, setComponentes] = useState<ComponenteWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchComponentes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(search && { search }),
        ...(categoria && { categoria }),
      });

      const response = await fetch(`/api/componentes?${params}`);
      const data: PaginatedResponse<ComponenteWithRelations> = await response.json();

      if (data.success) {
        setComponentes(data.data || []);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching componentes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponentes();
  }, [currentPage, search, categoria]);

  const formatValorUnidad = (valorUnidad: Array<{ valor: string; unidad: string }>) => {
    return valorUnidad.map(pair => `${pair.valor} ${pair.unidad}`).join(", ");
  };

  const getStockStatus = (componente: ComponenteWithRelations) => {
    const stockActual = componente.stockActual || 0;
    const stockMinimo = componente.stockMinimo;

    if (stockActual === 0) {
      return { label: "Sin stock", color: "bg-red-100 text-red-800" };
    } else if (stockActual <= stockMinimo) {
      return { label: "Stock bajo", color: "bg-orange-100 text-orange-800" };
    } else {
      return { label: "En stock", color: "bg-green-100 text-green-800" };
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Componentes Electrónicos
          </CardTitle>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Componente
          </Button>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Todas las categorías</option>
            {Object.entries(CATEGORIA_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <div className="text-sm text-gray-500">
            {total} componente{total !== 1 ? "s" : ""} encontrados
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : componentes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No se encontraron componentes</p>
            <p className="text-sm">Intenta ajustar los filtros o crea un nuevo componente</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Valor/Unidad</TableHead>
                  <TableHead>Stock Actual</TableHead>
                  <TableHead>Stock Mínimo</TableHead>
                  <TableHead>Ubicaciones</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {componentes.map((componente) => {
                  const stockStatus = getStockStatus(componente);
                  return (
                    <TableRow key={componente.id}>
                      <TableCell>
                        <Badge className={CATEGORIA_COLORS[componente.categoria]}>
                          {CATEGORIA_LABELS[componente.categoria]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {componente.descripcion}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatValorUnidad(componente.valorUnidad)}
                      </TableCell>
                      <TableCell>
                        <Badge className={stockStatus.color}>
                          {componente.stockActual || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>{componente.stockMinimo}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {componente.ubicaciones.slice(0, 2).map((ubicacion) => (
                            <Badge key={ubicacion.id} variant="outline" className="text-xs">
                              {ubicacion.cajoncito.codigo}
                            </Badge>
                          ))}
                          {componente.ubicaciones.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{componente.ubicaciones.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(componente)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(componente)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(componente)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-3 text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}