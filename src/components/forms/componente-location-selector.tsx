"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, Plus, Trash2, MapPin } from "lucide-react";

interface Cajoncito {
  id: string;
  codigo: string;
  nombre: string;
  organizador?: {
    id: string;
    codigo: string;
    nombre: string;
    estanteria?: {
      id: string;
      codigo: string;
      nombre: string;
      ubicacion: {
        id: string;
        nombre: string;
      };
    };
    armario?: {
      id: string;
      codigo: string;
      nombre: string;
      ubicacion: {
        id: string;
        nombre: string;
      };
    };
  };
}

interface ComponenteLocationSelectorProps {
  selected: Array<{
    cajoncitoId: string;
    cantidad: number;
  }>;
  onChange: (selected: Array<{
    cajoncitoId: string;
    cantidad: number;
  }>) => void;
  disabled?: boolean;
}

export function ComponenteLocationSelector({ selected, onChange, disabled = false }: ComponenteLocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cajoncitos, setCajoncitos] = useState<Cajoncito[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCajoncitos = async () => {
    if (!search.trim()) {
      setCajoncitos([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/cajoncitos?search=${encodeURIComponent(search)}`);
      const data = await response.json();

      if (data.success) {
        setCajoncitos(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching cajoncitos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCajoncitos();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const addUbicacion = (cajoncito: Cajoncito) => {
    // Check if already selected
    const alreadySelected = selected.some(s => s.cajoncitoId === cajoncito.id);
    if (alreadySelected) {
      alert("Este cajoncito ya está seleccionado");
      return;
    }

    const newSelected = [
      ...selected,
      {
        cajoncitoId: cajoncito.id,
        cantidad: 1,
      }
    ];
    onChange(newSelected);
    setSearch("");
    setCajoncitos([]);
    setIsOpen(false);
  };

  const removeUbicacion = (cajoncitoId: string) => {
    const newSelected = selected.filter(s => s.cajoncitoId !== cajoncitoId);
    onChange(newSelected);
  };

  const updateCantidad = (cajoncitoId: string, cantidad: number) => {
    if (cantidad <= 0) return;

    const newSelected = selected.map(s =>
      s.cajoncitoId === cajoncitoId
        ? { ...s, cantidad }
        : s
    );
    onChange(newSelected);
  };

  const getUbicacionPath = (cajoncito: Cajoncito) => {
    const path = [];

    if (cajoncito.organizador?.estanteria) {
      path.push(
        cajoncito.organizador.estanteria.ubicacion.nombre,
        cajoncito.organizador.estanteria.codigo,
        cajoncito.organizador.codigo,
        cajoncito.codigo
      );
    } else if (cajoncito.organizador?.armario) {
      path.push(
        cajoncito.organizador.armario.ubicacion.nombre,
        cajoncito.organizador.armario.codigo,
        cajoncito.organizador.codigo,
        cajoncito.codigo
      );
    } else {
      path.push(cajoncito.codigo);
    }

    return path.join(" → ");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-orange-600" />
            Ubicaciones de Almacenamiento
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Ubicación
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Los componentes electrónicos solo pueden almacenarse en cajoncitos (pequeños compartimentos)
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Dialog */}
        {isOpen && (
          <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar cajoncito por código o nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                disabled={disabled}
              />
            </div>

            {loading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
              </div>
            )}

            {!loading && search && cajoncitos.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No se encontraron cajoncitos que coincidan con "{search}"
              </p>
            )}

            {!loading && cajoncitos.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {cajoncitos.map((cajoncito) => (
                  <div
                    key={cajoncito.id}
                    className="flex justify-between items-center p-3 bg-white border rounded-lg hover:bg-orange-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {cajoncito.codigo} - {cajoncito.nombre}
                      </div>
                      <div className="text-sm text-gray-600">
                        {getUbicacionPath(cajoncito)}
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addUbicacion(cajoncito)}
                      disabled={disabled}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                setSearch("");
                setCajoncitos([]);
              }}
            >
              Cancelar
            </Button>
          </div>
        )}

        {/* Selected Locations */}
        {selected.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No hay ubicaciones seleccionadas. Los componentes deben almacenarse en cajoncitos.
          </p>
        ) : (
          <div className="space-y-3">
            {selected.map((ubicacion) => {
              // Find the cajoncito details (would need to fetch or have in state)
              return (
                <div
                  key={ubicacion.cajoncitoId}
                  className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      Cajoncito ID: {ubicacion.cajoncitoId}
                    </div>
                    <div className="text-sm text-gray-600">
                      Cantidad: {ubicacion.cantidad} unidades
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={ubicacion.cantidad}
                      onChange={(e) => updateCantidad(ubicacion.cajoncitoId, parseInt(e.target.value) || 1)}
                      className="w-20"
                      disabled={disabled}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUbicacion(ubicacion.cajoncitoId)}
                      disabled={disabled}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {selected.length > 0 && (
          <div className="pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Total de ubicaciones: {selected.length}
              </span>
              <span className="text-sm font-medium">
                Total de unidades: {selected.reduce((sum, ub) => sum + ub.cantidad, 0)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}