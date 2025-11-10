"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Trash2, Monitor } from "lucide-react";
import { EquipoWithRelations } from "@/types/api";
import { createDebugAttributes } from "@/lib/debug-attributes";

interface EquipoListProps {
  equipos: EquipoWithRelations[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onCreateNew?: () => void;
  onEdit: (equipo: EquipoWithRelations) => void;
  onDelete: (equipo: EquipoWithRelations) => void;
}

export function EquipoList({ 
  equipos, 
  loading = false, 
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onCreateNew,
  onEdit, 
  onDelete 
}: EquipoListProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8" {...createDebugAttributes({componentName: 'EquipoList', filePath: 'src/components/equipos/equipo-list.tsx'})}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div {...createDebugAttributes({componentName: 'EquipoList', filePath: 'src/components/equipos/equipo-list.tsx'})}>
      {equipos.length === 0 ? (
        <div className="text-center py-8">
          <Monitor className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
            No hay equipos registrados
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea tu primer equipo para comenzar
          </p>
        </div>
      ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SAP</TableHead>
                <TableHead>Nombre</TableHead>
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
                      <Monitor className="h-3 w-3" />
                      {equipo._count.repuestos}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/equipos/${equipo.id}`)}
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
      )}
    </div>
  );
}