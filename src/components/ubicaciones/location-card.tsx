"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MapPin, Archive, Grid3x3 } from "lucide-react";

export interface LocationCardProps {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  isActive?: boolean;
  armariosCount?: number;
  estanteriasCount?: number;
  type?: "ubicacion" | "armario" | "estanteria";
  onClick?: () => void;
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
  type = "ubicacion",
  onClick,
  className,
}: LocationCardProps) {
  const totalContent = armariosCount + estanteriasCount;
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

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-2",
        !isActive && "opacity-60 border-muted",
        onClick && "hover:border-primary",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-lg font-semibold">{nombre}</CardTitle>
          </div>
          <Badge variant="secondary" className={getTypeColor()}>
            {getTypeLabel()}
          </Badge>
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