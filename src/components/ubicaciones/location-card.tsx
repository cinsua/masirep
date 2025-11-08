"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MapPin, Archive, Grid3x3, Edit, MoreVertical } from "lucide-react";

export interface LocationCardProps {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  isActive?: boolean;
  armariosCount?: number;
  estanteriasCount?: number;
  cajonesCount?: number;
  itemCount?: number;
  type?: "ubicacion" | "armario" | "estanteria";
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  className?: string;
}

export function LocationCard({
  id,
  codigo,
  nombre,
  descripcion,
  isActive = true,
  armariosCount = 0,
  estanteriasCount = 0,
  cajonesCount = 0,
  itemCount,
  type = "ubicacion",
  onClick,
  onEdit,
  onDelete,
  showActions = false,
  className,
}: LocationCardProps) {
  const totalContent = itemCount ?? (armariosCount + estanteriasCount + cajonesCount);
  const hasContent = totalContent > 0;

  const getIcon = () => {
    switch (type) {
      case "armario":
        return <Archive className="h-5 w-5" />;
      case "estanteria":
        return <Grid3x3 className="h-5 w-5" />;
      default:
        return <MapPin className="h-5 w-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "armario":
        return "Armario";
      case "estanteria":
        return "Estantería";
      default:
        return "Ubicación";
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "armario":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "estanteria":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when clicking on actions
    if ((e.target as HTMLElement).closest('.location-actions')) {
      return;
    }
    onClick?.();
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-2 group relative",
        !isActive && "opacity-60 border-muted",
        onClick && "hover:border-primary",
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-lg font-semibold">{nombre}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={getTypeColor()}>
              {getTypeLabel()}
            </Badge>
            {showActions && (
              <div className="location-actions flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.();
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                  }}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <MoreVertical className="h-3 w-3 rotate-90" />
                </Button>
              </div>
            )}
          </div>
        </div>
        <CardDescription className="text-sm">
          <span className="font-mono">{codigo}</span>
          {!isActive && (
            <Badge variant="destructive" className="ml-2 text-xs">
              Inactivo
            </Badge>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {descripcion && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {descripcion}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-sm text-muted-foreground">
            {armariosCount > 0 && (
              <div className="flex items-center gap-1">
                <Archive className="h-4 w-4" />
                <span>{armariosCount}</span>
              </div>
            )}
            {estanteriasCount > 0 && (
              <div className="flex items-center gap-1">
                <Grid3x3 className="h-4 w-4" />
                <span>{estanteriasCount}</span>
              </div>
            )}
            {!hasContent && (
              <span className="text-xs italic">Vacío</span>
            )}
          </div>

          {hasContent && (
            <Badge variant="outline" className="text-xs">
              {totalContent} unidad{totalContent !== 1 ? "es" : ""}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}