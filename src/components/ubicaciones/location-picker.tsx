"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Building,
  Archive,
  Layers,
  Package,
  Grid3x3,
  Cpu,
  Loader2,
  MapPin
} from "lucide-react";
import { EntityIcon } from "@/components/ui/icon";
import { createDebugAttributes } from "@/lib/debug-attributes";

interface Location {
  id: string;
  nombre: string;
  codigo: string;
  type: 'ubicacion' | 'armario' | 'estanteria' | 'estante' | 'cajon' | 'division' | 'cajoncito';
  children?: Location[];
  parentId?: string;
}

interface LocationPickerProps {
  itemType: 'repuesto' | 'componente';
  onLocationSelect: (location: Location) => void;
  selectedLocation?: Location | null;
}

export function LocationPicker({ itemType, onLocationSelect, selectedLocation }: LocationPickerProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Fetch all locations
  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ubicaciones?tree=true');
      const data = await response.json();

      if (data.success) {
        setLocations(data.data || []);
      } else {
        console.error("Error fetching locations:", data.error);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Filter locations based on search term
  const filterLocations = (locations: Location[], term: string): Location[] => {
    if (!term.trim()) return locations;

    return locations.reduce((acc: Location[], location) => {
      const matchesSearch = location.nombre.toLowerCase().includes(term.toLowerCase()) ||
                           location.codigo.toLowerCase().includes(term.toLowerCase());

      const filteredChildren = location.children ? filterLocations(location.children, term) : [];

      if (matchesSearch || filteredChildren.length > 0) {
        acc.push({
          ...location,
          children: filteredChildren.length > 0 ? filteredChildren : location.children
        });
      }

      return acc;
    }, []);
  };

  // Filter locations based on item type
  const filterLocationsByItemType = (locations: Location[]): Location[] => {
    if (itemType === 'repuesto') {
      // Repuestos can be assigned to any location type
      return locations;
    } else {
      // Componentes can only be assigned to cajoncitos
      const filterToCajoncitos = (locs: Location[]): Location[] => {
        return locs.reduce((acc: Location[], location) => {
          if (location.type === 'cajoncito') {
            acc.push(location);
          } else if (location.children) {
            const children = filterToCajoncitos(location.children);
            if (children.length > 0) {
              acc.push({
                ...location,
                children
              });
            }
          }
          return acc;
        }, []);
      };
      return filterToCajoncitos(locations);
    }
  };

  const filteredLocations = filterLocationsByItemType(
    filterLocations(locations, searchTerm)
  );

  const toggleExpand = (locationId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(locationId)) {
        newSet.delete(locationId);
      } else {
        newSet.add(locationId);
      }
      return newSet;
    });
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'ubicacion': return <EntityIcon entityType="ubicacion" className="h-4 w-4" />;
      case 'armario': return <EntityIcon entityType="armario" className="h-4 w-4" />;
      case 'estanteria': return <EntityIcon entityType="estanteria" className="h-4 w-4" />;
      case 'estante': return <EntityIcon entityType="estante" className="h-4 w-4" />;
      case 'cajon': return <EntityIcon entityType="cajon" className="h-4 w-4" />;
      case 'division': return <EntityIcon entityType="division" className="h-4 w-4" />;
      case 'cajoncito': return <EntityIcon entityType="cajoncito" className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case 'ubicacion': return 'Ubicación';
      case 'armario': return 'Armario';
      case 'estanteria': return 'Estantería';
      case 'estante': return 'Estante';
      case 'cajon': return 'Cajón';
      case 'division': return 'División';
      case 'cajoncito': return 'Cajoncito';
      default: return 'Desconocido';
    }
  };

  const isSelectable = (type: string) => {
    if (itemType === 'repuesto') {
      // Repuestos can be assigned to any location except 'ubicacion' (parent location)
      return type !== 'ubicacion';
    } else {
      // Componentes can only be assigned to cajoncitos
      return type === 'cajoncito';
    }
  };

  const renderLocationTree = (locations: Location[], level = 0): React.ReactElement[] => {
    return locations.map((location) => {
      const hasChildren = location.children && location.children.length > 0;
      const isExpanded = expandedNodes.has(location.id);
      const isSelectableLocation = isSelectable(location.type);
      const isSelected = selectedLocation?.id === location.id;

      return (
        <div key={location.id} className="select-none">
          <div
            className={`
              flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors
              ${isSelected ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100'}
              ${!isSelectableLocation ? 'opacity-60 cursor-not-allowed' : ''}
            `}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => {
              if (hasChildren) {
                toggleExpand(location.id);
              }
              if (isSelectableLocation) {
                onLocationSelect(location);
              }
            }}
          >
            {hasChildren && (
              <div className="w-4 h-4 flex items-center justify-center">
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </div>
            )}
            {!hasChildren && <div className="w-4" />}

            {getLocationIcon(location.type)}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{location.nombre}</span>
                <Badge variant="outline" className="text-xs">
                  {getLocationTypeLabel(location.type)}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 truncate">
                {location.codigo}
              </div>
            </div>

            {isSelectableLocation && (
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                )}
              </div>
            )}
          </div>

          {hasChildren && isExpanded && (
            <div className="ml-2">
              {renderLocationTree(location.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div 
      className="space-y-3"
      {...createDebugAttributes({
        componentName: 'LocationPicker',
        filePath: 'src/components/ubicaciones/location-picker.tsx'
      })}
    >
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar ubicación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Location Tree */}
      <div className="border rounded-lg">
        <ScrollArea className="h-64">
          <div className="p-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Cargando ubicaciones...</span>
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>
                  {searchTerm
                    ? "No se encontraron ubicaciones que coincidan con la búsqueda"
                    : itemType === 'componente'
                    ? "No hay cajoncitos disponibles"
                    : "No hay ubicaciones disponibles"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {renderLocationTree(filteredLocations)}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Info Message */}
      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
        {itemType === 'repuesto' ? (
          <p>Los repuestos pueden ser asignados a cualquier tipo de ubicación (armarios, estanterías, cajones, etc.)</p>
        ) : (
          <p>Los componentes solo pueden ser asignados a cajoncitos</p>
        )}
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            {getLocationIcon(selectedLocation.type)}
            <div>
              <div className="font-medium text-sm">Ubicación seleccionada:</div>
              <div className="text-sm">{selectedLocation.nombre} ({selectedLocation.codigo})</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}