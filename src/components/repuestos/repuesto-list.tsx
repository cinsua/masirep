"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Trash2 } from "lucide-react";
import { RepuestoWithRelations } from "@/types/api";
import { createDebugAttributes } from "@/lib/debug-attributes";

interface RepuestoListProps {
  repuestos: RepuestoWithRelations[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onEdit: (repuesto: RepuestoWithRelations) => void;
  onView: (repuesto: RepuestoWithRelations) => void;
  onDelete: (repuesto: RepuestoWithRelations) => void;
}

export function RepuestoList({ 
  repuestos, 
  loading = false, 
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onEdit, 
  onView, 
  onDelete 
}: RepuestoListProps) {

const getStockStatus = (repuesto: RepuestoWithRelations) => {
    if (repuesto.stockActual === 0) return { label: "Sin stock", variant: "destructive" as const };
    if (repuesto.stockActual <= repuesto.stockMinimo) return { label: "Stock bajo", variant: "secondary" as const };
    return { label: "En stock", variant: "default" as const };
  };

return (
    <div {...createDebugAttributes({componentName: 'RepuestoList', filePath: 'src/components/repuestos/repuesto-list.tsx'})}>
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
</div>
  );
}