"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, X, Plus, Trash2 } from "lucide-react";
import { createDebugAttributes } from "@/lib/debug-attributes";

interface Ubicacion {
  id: string;
  codigo: string;
  nombre: string;
  tipo: 'armario' | 'estanteria' | 'estante' | 'cajon' | 'division' | 'cajoncito';
}

interface LocationSelectorProps {
  selected: Array<{
    tipo: 'armario' | 'estanteria' | 'estante' | 'cajon' | 'division' | 'cajoncito';
    id: string;
    cantidad: number;
  }>;
  onChange: (selected: Array<{
    tipo: 'armario' | 'estanteria' | 'estante' | 'cajon' | 'division' | 'cajoncito';
    id: string;
    cantidad: number;
  }>) => void;
}

export function LocationSelector({ selected, onChange }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<'armario' | 'estanteria' | 'estante' | 'cajon' | 'division' | 'cajoncito'>('armario');

  const tipos = [
    { value: 'armario', label: 'Armario' },
    { value: 'estanteria', label: 'Estantería' },
    { value: 'estante', label: 'Estante' },
    { value: 'cajon', label: 'Cajón' },
    { value: 'division', label: 'División' },
    { value: 'cajoncito', label: 'Cajoncito' },
  ];

  const fetchUbicaciones = async () => {
    if (!search.trim()) {
      setUbicaciones([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/ubicaciones?search=${encodeURIComponent(search)}&type=${selectedTipo}`);
      const data = await response.json();
      
      if (data.success) {
        setUbicaciones(data.data || []);
      } else {
        console.error("Error fetching ubicaciones:", data.error);
        setUbicaciones([]);
      }
    } catch (error) {
      console.error("Error fetching ubicaciones:", error);
      setUbicaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUbicaciones();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, selectedTipo]);

  const handleSelect = (ubicacion: Ubicacion) => {
    const existingIndex = selected.findIndex(
      s => s.tipo === ubicacion.tipo && s.id === ubicacion.id
    );

    if (existingIndex >= 0) {
      // Update quantity if already exists
      const updated = [...selected];
      updated[existingIndex].cantidad += 1;
      onChange(updated);
    } else {
      // Add new location
      onChange([...selected, {
        tipo: ubicacion.tipo,
        id: ubicacion.id,
        cantidad: 1
      }]);
    }
    
    setIsOpen(false);
    setSearch("");
  };

  const removeSelection = (index: number) => {
    onChange(selected.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, cantidad: number) => {
    if (cantidad < 1) return;
    
    const updated = [...selected];
    updated[index].cantidad = cantidad;
    onChange(updated);
  };

  const getUbicacionName = (item: typeof selected[0]) => {
    const ubicacion = ubicaciones.find(u => u.id === item.id);
    return ubicacion ? `${ubicacion.nombre} (${ubicacion.codigo})` : `${item.tipo} - ${item.id}`;
  };

  return (
    <div 
      className="space-y-2"
      {...createDebugAttributes({
        componentName: 'LocationSelector',
        filePath: 'src/components/forms/location-selector.tsx'
      })}
    >
      <Label>Ubicaciones de Almacenamiento</Label>
      
      {/* Selected Items */}
      {selected.length > 0 && (
        <div className="space-y-2 mb-4">
          {selected.map((item, index) => (
            <div key={`${item.tipo}-${item.id}`} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{getUbicacionName(item)}</p>
                <p className="text-sm text-muted-foreground capitalize">Tipo: {item.tipo}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="1"
                  value={item.cantidad}
                  onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                  className="w-20 text-center"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSelection(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Location Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Agregar Ubicación
      </Button>

      {/* Location Selection Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Seleccionar Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo Selector */}
              <div>
                <Label>Tipo de Ubicación</Label>
                <select
                  value={selectedTipo}
                  onChange={(e) => setSelectedTipo(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                >
                  {tipos.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar ubicación..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Results */}
              <div className="max-h-60 overflow-auto">
                {loading ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Buscando...
                  </p>
                ) : ubicaciones.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No se encontraron ubicaciones
                  </p>
                ) : (
                  <div className="space-y-2">
                    {ubicaciones.map((ubicacion) => (
                      <div
                        key={ubicacion.id}
                        onClick={() => handleSelect(ubicacion)}
                        className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-muted"
                      >
                        <div>
                          <p className="font-medium">{ubicacion.nombre}</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {ubicacion.codigo}
                          </p>
                        </div>
                        <Badge variant="outline">{ubicacion.tipo}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}