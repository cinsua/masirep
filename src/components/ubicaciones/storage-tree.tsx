"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ChevronDown,
  MapPin,
  Archive,
  Grid3x3,
  Layers,
  FolderOpen,
  Package,
  Wrench,
} from "lucide-react";

export interface StorageNode {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  isActive?: boolean;
  type: "ubicacion" | "armario" | "estanteria" | "cajon" | "division" | "organizador" | "cajoncito";
  children?: StorageNode[];
  itemCount?: number;
  armariosCount?: number;
  estanteriasCount?: number;
  cajonesCount?: number;
}

export interface StorageTreeProps {
  data: StorageNode[];
  onNodeClick?: (node: StorageNode) => void;
  expandByDefault?: boolean;
  showItemCount?: boolean;
  maxDepth?: number;
  className?: string;
}

interface TreeNodeProps {
  node: StorageNode;
  level: number;
  onNodeClick?: (node: StorageNode) => void;
  expandByDefault?: boolean;
  showItemCount?: boolean;
  maxDepth?: number;
}

function TreeNode({
  node,
  level,
  onNodeClick,
  expandByDefault = false,
  showItemCount = true,
  maxDepth = 3,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(expandByDefault && level < maxDepth);
  const hasChildren = node.children && node.children.length > 0;
  const isBeyondMaxDepth = level >= maxDepth;

  const getIcon = () => {
    const iconClass = "h-4 w-4";
    switch (node.type) {
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

  const getTypeColor = () => {
    switch (node.type) {
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

  const getTotalItems = () => {
    if (node.itemCount) return node.itemCount;

    let total = 0;
    if (node.armariosCount) total += node.armariosCount;
    if (node.estanteriasCount) total += node.estanteriasCount;
    if (node.cajonesCount) total += node.cajonesCount;

    if (node.children) {
      total += node.children.reduce((sum, child) => sum + (child.itemCount || 0), 0);
    }

    return total;
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleNodeClick = () => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer transition-colors hover:bg-accent/50 group",
          !node.isActive && "opacity-60"
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={handleNodeClick}
      >
        {hasChildren && !isBeyondMaxDepth && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-muted"
            onClick={toggleExpand}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}

        {hasChildren && isBeyondMaxDepth && (
          <div className="h-4 w-4 flex items-center justify-center">
            <div className="h-1 w-1 bg-muted-foreground rounded-full" />
          </div>
        )}

        {!hasChildren && (
          <div className="h-4 w-4" />
        )}

        {getIcon()}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{node.nombre}</span>
            <Badge variant="secondary" className={cn("text-xs", getTypeColor())}>
              {node.type}
            </Badge>
            {!node.isActive && (
              <Badge variant="destructive" className="text-xs">
                Inactivo
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{node.codigo}</span>
            {node.descripcion && (
              <span className="truncate">• {node.descripcion}</span>
            )}
          </div>
        </div>

        {showItemCount && (
          <div className="flex items-center gap-2">
            {getTotalItems() > 0 && (
              <Badge variant="outline" className="text-xs">
                {getTotalItems()} items
              </Badge>
            )}

            {node.armariosCount && node.armariosCount > 0 && (
              <Badge variant="outline" className="text-xs bg-blue-50">
                {node.armariosCount} armarios
              </Badge>
            )}

            {node.estanteriasCount && node.estanteriasCount > 0 && (
              <Badge variant="outline" className="text-xs bg-green-50">
                {node.estanteriasCount} estanterías
              </Badge>
            )}
          </div>
        )}
      </div>

      {hasChildren && isExpanded && !isBeyondMaxDepth && (
        <div className="ml-2 border-l border-border/50">
          {node.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onNodeClick={onNodeClick}
              expandByDefault={expandByDefault}
              showItemCount={showItemCount}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function StorageTree({
  data,
  onNodeClick,
  expandByDefault = false,
  showItemCount = true,
  maxDepth = 3,
  className,
}: StorageTreeProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No hay ubicaciones disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5" />
          Navegación Jerárquica
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {data.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              level={0}
              onNodeClick={onNodeClick}
              expandByDefault={expandByDefault}
              showItemCount={showItemCount}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}