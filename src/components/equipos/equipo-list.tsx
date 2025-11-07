"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Eye, Trash2, Wrench, Filter } from "lucide-react";
import { EquipoWithRelations } from "@/types/api";

interface EquipoListProps {
  onCreateNew: () => void;
  onEdit: (equipo: EquipoWithRelations) => void;
  onView: (equipo: EquipoWithRelations) => void;
  onDelete: (equipo: EquipoWithRelations) => void;
}

export function EquipoList({ onCreateNew, onEdit, onView, onDelete }: EquipoListProps) {
  const [equipos, setEquipos] = useState<EquipoWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchEquipos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        sortBy,
        sortOrder,
        ...(search && { search }),
      });

      const response = await fetch(`/api/equipos?${params}`);
      const data = await response.json();

      if (data.success) {
        setEquipos(data.data || []);
        setTotalPages(Math.ceil(data.pagination?.totalPages || 1));
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching equipos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipos();
  }, [currentPage, search, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Cargando Equipos...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Gestión de Equipos ({total})
          </CardTitle>
          <Button onClick={onCreateNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Equipo
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por SAP, nombre, marca, modelo..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {equipos.length === 0 ? (
          <div className="text-center py-8">
            <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
              {search ? "No se encontraron equipos" : "No hay equipos registrados"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search
                ? "Intenta con otros términos de búsqueda"
                : "Crea tu primer equipo para comenzar"
              }
            </p>
            {!search && (
              <div className="mt-6">
                <Button onClick={onCreateNew} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Primer Equipo
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("sap")}
                  >
                    SAP
                    {sortBy === "sap" && (
                      <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("nombre")}
                  >
                    Nombre
                    {sortBy === "nombre" && (
                      <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Repuestos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipos.map((equipo) => (
                  <TableRow key={equipo.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {equipo.sap ? (
                        <Badge variant="outline" className="font-mono text-sm">
                          {equipo.sap}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground font-mono text-sm">Sin SAP</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{equipo.nombre}</div>
                        {equipo.descripcion && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {equipo.descripcion}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {equipo.marca || (
                        <span className="text-muted-foreground text-sm">Sin marca</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {equipo.modelo || (
                        <span className="text-muted-foreground text-sm">Sin modelo</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <Wrench className="h-3 w-3" />
                        {equipo._count.repuestos}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(equipo)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(equipo)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(equipo)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {((currentPage - 1) * 10) + 1} a {Math.min(currentPage * 10, total)} de {total} equipos
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
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
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
      </CardContent>
    </Card>
  );
}