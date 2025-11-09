"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, X, Check } from "lucide-react";
import { createDebugAttributes } from "@/lib/debug-attributes";
import { useEquipos } from "@/hooks/use-equipos";



interface EquipmentSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  multiple?: boolean;
  placeholder?: string;
}

export function EquipmentSelector({ 
  selected, 
  onChange, 
  multiple = true, 
  placeholder = "Buscar equipos..." 
}: EquipmentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: equipos, loading, fetch } = useEquipos();

  useEffect(() => {
    if (search.trim()) {
      const timeoutId = setTimeout(() => {
        fetch({ search: search, limit: 20 });
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [search, fetch]);

  const handleSelect = (equipoId: string) => {
    if (multiple) {
      if (selected.includes(equipoId)) {
        onChange(selected.filter(id => id !== equipoId));
      } else {
        onChange([...selected, equipoId]);
      }
    } else {
      onChange([equipoId]);
      setIsOpen(false);
    }
  };

  const removeSelection = (equipoId: string) => {
    onChange(selected.filter(id => id !== equipoId));
  };

  const getSelectedEquipos = () => {
    return (equipos || []).filter(equipo => selected.includes(equipo.id));
  };

  return (
    <div 
      className="space-y-2"
      {...createDebugAttributes({
        componentName: 'EquipmentSelector',
        filePath: 'src/components/forms/equipment-selector.tsx'
      })}
    >
      <Label>Equipos Asociados</Label>
      
      {/* Selected Items */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {getSelectedEquipos().map((equipo) => (
            <Badge key={equipo.id} variant="secondary" className="flex items-center space-x-1">
              <span>{equipo.nombre} ({equipo.codigo})</span>
              <button
                type="button"
                onClick={() => removeSelection(equipo.id)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (search || loading) && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Resultados de búsqueda</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                Buscando...
              </p>
            ) : (equipos || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                No se encontraron equipos
              </p>
            ) : (
              <div className="space-y-1">
                {(equipos || []).map((equipo) => {
                  const isSelected = selected.includes(equipo.id);
                  return (
                    <div
                      key={equipo.id}
                      onClick={() => handleSelect(equipo.id)}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted ${
                        isSelected ? "bg-muted" : ""
                      }`}
                    >
                      <div>
                        <p className="font-medium text-sm">{equipo.nombre}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {equipo.codigo}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}