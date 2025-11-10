"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Filter,
  Search,
  X,
  RotateCcw,
  Download,
  Wrench,
  Building,
  Hash
} from "lucide-react";
import { EntityIcon } from "@/components/ui/icon";
import { EquipoSearchParamsSchema } from "@/lib/validations/equipo";
import { EquipoWithRelations } from "@/types/api";
import { createDebugAttributes } from "@/lib/debug-attributes";

interface EquipoSearchFiltersProps {
  onSearch: (params: any) => void;
  onExport?: (equipos: EquipoWithRelations[]) => void;
  isLoading?: boolean;
  equipos?: EquipoWithRelations[];
}

export function EquipoSearchFilters({
  onSearch,
  onExport,
  isLoading = false,
  equipos = []
}: EquipoSearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    search: "",
    codigo: "",
    sap: "",
    nombre: "",
    marca: "",
    modelo: "",
    minRepuestos: "",
    maxRepuestos: "",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });

  useEffect(() => {
    // Track active filters
    const filters = [];
    if (formData.search) filters.push("Búsqueda general");
    if (formData.codigo) filters.push("Código");
    if (formData.sap) filters.push("SAP");
    if (formData.nombre) filters.push("Nombre");
    if (formData.marca) filters.push("Marca");
    if (formData.modelo) filters.push("Modelo");
    if (formData.minRepuestos || formData.maxRepuestos) filters.push("Repuestos");
    if (formData.sortBy !== "createdAt" || formData.sortOrder !== "desc") filters.push("Orden");
    setActiveFilters(filters);
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    const searchParams = {
      search: formData.search.trim(),
      sortBy: formData.sortBy,
      sortOrder: formData.sortOrder,
      ...(formData.codigo && { codigo: formData.codigo.trim() }),
      ...(formData.sap && { sap: formData.sap.trim() }),
      ...(formData.nombre && { nombre: formData.nombre.trim() }),
      ...(formData.marca && { marca: formData.marca.trim() }),
      ...(formData.modelo && { modelo: formData.modelo.trim() }),
      ...(formData.minRepuestos && { minRepuestos: parseInt(formData.minRepuestos) }),
      ...(formData.maxRepuestos && { maxRepuestos: parseInt(formData.maxRepuestos) }),
    };

    onSearch(searchParams);
  };

  const handleReset = () => {
    setFormData({
      search: "",
      codigo: "",
      sap: "",
      nombre: "",
      marca: "",
      modelo: "",
      minRepuestos: "",
      maxRepuestos: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    onSearch({});
  };

  const handleClearFilter = (field: string) => {
    setFormData(prev => ({ ...prev, [field]: "" }));
  };

  const handleExport = () => {
    if (onExport && equipos.length > 0) {
      onExport(equipos);
    }
  };

  const getUniqueValues = (field: keyof EquipoWithRelations) => {
    const values = new Set<string>();
    equipos.forEach(equipo => {
      const value = equipo[field];
      if (value && typeof value === 'string') {
        values.add(value);
      }
    });
    return Array.from(values).sort();
  };

  const uniqueMarcas = getUniqueValues('marca');
  const uniqueModelos = getUniqueValues('modelo');

return (
    <div className="space-y-4" {...createDebugAttributes({componentName: 'EquipoSearchFilters', filePath: 'src/components/equipos/equipo-search-filters.tsx'})}>
      {/* Main Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar equipos por código, SAP, nombre, marca, modelo..."
            value={formData.search}
            onChange={(e) => handleInputChange("search", e.target.value)}
            className="pl-10 pr-10"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          {formData.search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleInputChange("search", "")}
              className="absolute right-1 top-1 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros {activeFilters.length > 0 && <Badge variant="secondary">{activeFilters.length}</Badge>}
        </Button>
        <Button onClick={handleSearch} disabled={isLoading}>
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
        {activeFilters.length > 0 && (
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        )}
        {onExport && equipos.length > 0 && (
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar ({equipos.length})
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(filter => (
            <Badge key={filter} variant="outline" className="flex items-center gap-1">
              {filter}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => {
                  // Clear specific filter based on type
                  if (filter === "Búsqueda general") handleClearFilter("search");
                  else if (filter === "Código") handleClearFilter("codigo");
                  else if (filter === "SAP") handleClearFilter("sap");
                  else if (filter === "Nombre") handleClearFilter("nombre");
                  else if (filter === "Marca") handleClearFilter("marca");
                  else if (filter === "Modelo") handleClearFilter("modelo");
                  else if (filter === "Repuestos") {
                    handleClearFilter("minRepuestos");
                    handleClearFilter("maxRepuestos");
                  } else if (filter === "Orden") {
                    setFormData(prev => ({ ...prev, sortBy: "createdAt", sortOrder: "desc" }));
                  }
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Avanzados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Identification Fields */}
            <div className="space-y-4">
              <h4 className="font-medium">Identificación</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="codigo"
                      placeholder="Ej: EQ-001"
                      value={formData.codigo}
                      onChange={(e) => handleInputChange("codigo", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sap">SAP</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="sap"
                      placeholder="Ej: 1234567890"
                      value={formData.sap}
                      onChange={(e) => handleInputChange("sap", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Equipment Details */}
            <div className="space-y-4">
              <h4 className="font-medium">Detalles del Equipo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <div className="relative">
                    <EntityIcon entityType="equipo" className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nombre"
                      placeholder="Ej: ESP20, PREPMASTER"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <select
                      id="marca"
                      value={formData.marca}
                      onChange={(e) => handleInputChange("marca", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                    >
                      <option value="">Todas las marcas</option>
                      {uniqueMarcas.map(marca => (
                        <option key={marca} value={marca}>{marca}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <select
                      id="modelo"
                      value={formData.modelo}
                      onChange={(e) => handleInputChange("modelo", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                    >
                      <option value="">Todos los modelos</option>
                      {uniqueModelos.map(modelo => (
                        <option key={modelo} value={modelo}>{modelo}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Repuestos Count */}
            <div className="space-y-4">
              <h4 className="font-medium">Cantidad de Repuestos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minRepuestos">Mínimo</Label>
                  <Input
                    id="minRepuestos"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.minRepuestos}
                    onChange={(e) => handleInputChange("minRepuestos", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRepuestos">Máximo</Label>
                  <Input
                    id="maxRepuestos"
                    type="number"
                    min="0"
                    placeholder="Sin límite"
                    value={formData.maxRepuestos}
                    onChange={(e) => handleInputChange("maxRepuestos", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Sorting */}
            <div className="space-y-4">
              <h4 className="font-medium">Ordenamiento</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sortBy">Ordenar por</Label>
                  <select
                    id="sortBy"
                    value={formData.sortBy}
                    onChange={(e) => handleInputChange("sortBy", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="createdAt">Fecha de creación</option>
                    <option value="codigo">Código</option>
                    <option value="sap">SAP</option>
                    <option value="nombre">Nombre</option>
                    <option value="marca">Marca</option>
                    <option value="modelo">Modelo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Orden</Label>
                  <select
                    id="sortOrder"
                    value={formData.sortOrder}
                    onChange={(e) => handleInputChange("sortOrder", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="asc">Ascendente</option>
                    <option value="desc">Descendente</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetear Filtros
              </Button>
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                Aplicar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}