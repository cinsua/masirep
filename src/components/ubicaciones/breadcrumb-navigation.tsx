"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  MapPin,
  Archive,
  Grid3x3,
  Layers,
  FolderOpen,
  Package,
  Wrench,
  Home,
} from "lucide-react";

export interface BreadcrumbItem {
  id: string;
  codigo: string;
  nombre: string;
  type: "ubicacion" | "armario" | "estanteria" | "cajon" | "division" | "organizador" | "cajoncito";
  isActive?: boolean;
}

export interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  onNavigate?: (item: BreadcrumbItem, index: number) => void;
  showIcons?: boolean;
  showTypes?: boolean;
  maxItems?: number;
  className?: string;
}

export function BreadcrumbNavigation({
  items,
  onNavigate,
  showIcons = true,
  showTypes = true,
  maxItems = 5,
  className,
}: BreadcrumbNavigationProps) {
  const getIcon = (type: BreadcrumbItem["type"]) => {
    const iconClass = "h-4 w-4";
    switch (type) {
      case "ubicacion":
        return <MapPin className={cn(iconClass, "text-purple-600")} />;
      case "armario":
        return <Archive className={cn(iconClass, "text-blue-600")} />;
      case "estanteria":
        return <Grid3x3 className={cn(iconClass, "text-green-600")} />;
      case "cajon":
        return <Layers className={cn(iconClass, "text-orange-600")} />;
      case "division":
        return <FolderOpen className={cn(iconClass, "text-yellow-600")} />;
      case "organizador":
        return <Package className={cn(iconClass, "text-pink-600")} />;
      case "cajoncito":
        return <Wrench className={cn(iconClass, "text-indigo-600")} />;
      default:
        return <MapPin className={iconClass} />;
    }
  };

  const getTypeLabel = (type: BreadcrumbItem["type"]) => {
    switch (type) {
      case "ubicacion":
        return "Ubicación";
      case "armario":
        return "Armario";
      case "estanteria":
        return "Estantería";
      case "cajon":
        return "Cajón";
      case "division":
        return "División";
      case "organizador":
        return "Organizador";
      case "cajoncito":
        return "Cajoncito";
      default:
        return type;
    }
  };

  const getTypeColor = (type: BreadcrumbItem["type"]) => {
    switch (type) {
      case "ubicacion":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "armario":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "estanteria":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cajon":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "division":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "organizador":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300";
      case "cajoncito":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (onNavigate) {
      onNavigate(item, index);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Home className="h-4 w-4" />
        <span>Inicio</span>
      </div>
    );
  }

  // If there are too many items, show ellipsis in the middle
  const displayItems = items.length > maxItems
    ? [
        items[0],
        { id: "...", codigo: "...", nombre: "...", type: "ubicacion" } as BreadcrumbItem,
        ...items.slice(-(maxItems - 2))
      ]
    : items;

  return (
    <nav
      className={cn("flex items-center gap-2 text-sm flex-wrap", className)}
      data-ai-tag="breadcrumb-navigation"
      data-ai-component="ubicaciones-breadcrumb"
    >
      {/* Home/Root link */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-muted-foreground hover:text-foreground"
        onClick={() => handleItemClick(items[0], 0)}
        data-ai-tag="breadcrumb-home"
      >
        <Home className="h-4 w-4" />
      </Button>

      {displayItems.map((item, index) => {
        // Get the actual index in the original array
        const actualIndex = item.id === "..." ? -1 : items.findIndex(i => i.id === item.id);
        const isLastItem = index === displayItems.length - 1;
        const isEllipsis = item.id === "...";

        if (isEllipsis) {
          return (
            <React.Fragment key="ellipsis">
              <ChevronRight className="h-4 w-4 text-muted-foreground" data-ai-tag="breadcrumb-ellipsis" />
              <span className="text-muted-foreground">...</span>
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={item.id}>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" data-ai-tag="breadcrumb-chevron" />

            <div className="flex items-center gap-2 min-w-0" data-ai-tag={`breadcrumb-element-${item.type}`}>
              {showIcons && getIcon(item.type)}

              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 px-2 justify-start",
                  isLastItem
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground",
                  !item.isActive && "opacity-60"
                )}
                onClick={() => handleItemClick(item, actualIndex)}
                disabled={isLastItem}
                data-ai-tag={`breadcrumb-button-${item.type}-${index}`}
              >
                <span className="truncate max-w-[150px]">{item.nombre}</span>
              </Button>

              {showTypes && (
                <Badge
                  variant="secondary"
                  className={cn("text-xs", getTypeColor(item.type))}
                  data-ai-tag={`breadcrumb-type-${item.type}`}
                >
                  {getTypeLabel(item.type)}
                </Badge>
              )}

              {!item.isActive && (
                <Badge variant="destructive" className="text-xs" data-ai-tag="breadcrumb-inactive">
                  Inactivo
                </Badge>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// Helper function to generate breadcrumb items from storage path
export function generateBreadcrumbFromPath(
  path: Array<{
    id: string;
    codigo: string;
    nombre: string;
    type: BreadcrumbItem["type"];
    isActive?: boolean;
  }>
): BreadcrumbItem[] {
  return path.map((item, index) => ({
    ...item,
    type: item.type,
    isActive: item.isActive !== false, // Default to true if not specified
  }));
}