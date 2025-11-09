"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Trash2 } from "lucide-react";
import { ComponenteWithRelations } from "@/types/api";
import { createDebugAttributes } from "@/lib/debug-attributes";

interface ComponenteListProps {
  componentes: ComponenteWithRelations[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

export function ComponenteList({
  componentes,
  loading = false,
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onEdit,
  onView,
  onDelete
}: ComponenteListProps) {

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
    <div {...createDebugAttributes({componentName: 'ComponenteList', filePath: 'src/components/componentes/componente-list.tsx'})}>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : componentes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No se encontraron componentes</p>
        </div>
      ) : (
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
                      {componente.ubicaciones?.slice(0, 2).map((ubicacion) => (
                        <Badge key={ubicacion.id} variant="outline" className="text-xs">
                          {ubicacion.cajoncito.codigo}
                        </Badge>
                      )) || null}
                      {(componente.ubicaciones?.length || 0) > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{(componente.ubicaciones?.length || 0) - 2}
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
      )}
    </div>
  );
}