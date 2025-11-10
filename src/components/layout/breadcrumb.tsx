"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Home } from "lucide-react";
import { EntityIcon } from "@/components/ui/icon";
import { createDebugAttributes } from "@/lib/debug-attributes";
import { useEquipos } from "@/hooks/use-equipos";

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
  isDynamic?: boolean; // For IDs that need to be resolved to names
  type?: "ubicacion" | "armario" | "estanteria" | "cajon" | "division" | "organizador" | "cajoncito" | "equipo" | "default";
  showIcon?: boolean;
  showType?: boolean;
  isActive?: boolean;
}

// Función auxiliar para obtener el color del icono según el tipo
const getIconColor = (type?: BreadcrumbItem["type"]) => {
  switch (type) {
    case "ubicacion":
      return "text-purple-600";
    case "armario":
      return "text-blue-600";
    case "estanteria":
      return "text-green-600";
    case "cajon":
      return "text-orange-600";
    case "division":
      return "text-yellow-600";
    case "organizador":
      return "text-pink-600";
    case "cajoncito":
      return "text-indigo-600";
    case "equipo":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

export function Breadcrumb() {
  const pathname = usePathname();
  const [resolvedNames, setResolvedNames] = useState<Record<string, string>>({});
  const { fetchById } = useEquipos();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (!pathname) return [];

    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: "Dashboard",
        href: "/dashboard",
        type: "default",
        showIcon: true,
      },
    ];

    let currentPath = "";
    let shouldSkipIntermediate = false;
    let previousType: BreadcrumbItem["type"] = "default";

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];

      // Skip dashboard prefix since it's already added
      if (segment === "dashboard") continue;

      currentPath += `/${segment}`;
      const isLast = i === pathSegments.length - 1;

      // Check if this segment looks like an ID (long alphanumeric string)
      const isId = /^[a-zA-Z0-9]{15,}$/.test(segment);

      // Determine the type based on the previous segment
      let type: BreadcrumbItem["type"] = "default";
      if (isId) {
        shouldSkipIntermediate = true;
        if (previousType === "ubicacion") {
          type = "ubicacion";
        } else if (previousType === "armario") {
          type = "armario";
        } else if (previousType === "estanteria") {
          type = "estanteria";
        } else if (previousType === "cajon") {
          type = "cajon";
        } else if (previousType === "equipo") {
          type = "equipo";
        }
      } else {
        // This is a static path segment
        if (segment === "ubicaciones") {
          type = "ubicacion";
        } else if (segment === "armarios") {
          type = "armario";
        } else if (segment === "estanterias") {
          type = "estanteria";
        } else if (segment === "cajones") {
          type = "cajon";
        } else if (segment === "equipos") {
          type = "equipo";
        }
        previousType = type;
      }

      // Skip intermediate segments when navigating to specific items
      if (shouldSkipIntermediate && ['armarios', 'estanterias', 'cajones'].includes(segment)) {
        continue; // Skip this intermediate segment
      }

      if (isId) {
        // This is an ID, mark it as dynamic and we'll resolve it later
        breadcrumbs.push({
          label: resolvedNames[segment] || segment, // Use resolved name if available, fallback to ID
          href: currentPath,
          isCurrent: isLast,
          isDynamic: true,
          type,
          showIcon: true,
          showType: false,
        });
       } else {
         // This is a static path segment
         // Include "ubicaciones" when it's the main page or when navigating to specific items
         if (segment !== "ubicaciones" || isLast || pathSegments.some((s, i) => i > pathSegments.indexOf(segment) && /^[a-zA-Z0-9]{15,}$/.test(s))) {
           breadcrumbs.push({
             label: formatSegmentName(segment),
             href: currentPath,
             isCurrent: isLast,
             isDynamic: false,
             type,
             showIcon: true,
             showType: false,
           });
         }
       }
    }

    return breadcrumbs;
  };

  const formatSegmentName = (segment: string): string => {
    // Convert URL segments to display names
    const nameMap: Record<string, string> = {
      repuestos: "Repuestos",
      componentes: "Componentes",
      equipos: "Equipos",
      ubicaciones: "Ubicaciones",
      reportes: "Reportes",
    };

    return nameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const breadcrumbs = generateBreadcrumbs();

  // Calculate parent URL for back navigation
  const getParentUrl = (): string | null => {
    if (breadcrumbs.length <= 1) return null;

    // If we have more than 2 breadcrumbs, go to the previous level
    if (breadcrumbs.length > 2) {
      return breadcrumbs[breadcrumbs.length - 2].href;
    }

    // If we only have 2 breadcrumbs (Dashboard + current), go to dashboard
    return "/dashboard";
  };

  // Resolve dynamic names (IDs to names)
  useEffect(() => {
    const resolveNames = async () => {
      const pathSegments = pathname.split("/").filter(Boolean);
      const unresolvedIds: Array<{ id: string; type: string }> = [];

      // Find unresolved IDs
      for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];

        // Skip if not an ID or already resolved
        if (!/^[a-zA-Z0-9]{15,}$/.test(segment) || resolvedNames[segment]) {
          continue;
        }

        // Try to determine the type based on the previous segment
        let resourceType = '';
        if (i > 0) {
          const prevSegment = pathSegments[i - 1];
          if (prevSegment === 'ubicaciones') {
            resourceType = 'ubicacion';
          } else if (prevSegment === 'armarios') {
            resourceType = 'armario';
          } else if (prevSegment === 'estanterias') {
            resourceType = 'estanteria';
          } else if (prevSegment === 'equipos') {
            resourceType = 'equipo';
          }
        }

        if (resourceType) {
          unresolvedIds.push({ id: segment, type: resourceType });
        }
      }

      // If nothing to resolve, return
      if (unresolvedIds.length === 0) {
        return;
      }

      // Fetch names for all unresolved IDs
      const newResolvedNames: Record<string, string> = { ...resolvedNames };

      await Promise.all(unresolvedIds.map(async ({ id, type }) => {
        try {
          let name = id; // fallback to ID

          if (type === 'ubicacion') {
            const response = await fetch(`/api/ubicaciones/${id}`);
            if (response.ok) {
              const data = await response.json();
              name = data.success ? data.data.nombre : id;
            }
          } else if (type === 'armario') {
            const response = await fetch(`/api/armarios/${id}`);
            if (response.ok) {
              const data = await response.json();
              name = data.success ? data.data.armario.nombre : id;
            }
          } else if (type === 'estanteria') {
            const response = await fetch(`/api/estanterias/${id}`);
            if (response.ok) {
              const data = await response.json();
              name = data.success ? data.data.estanteria.nombre : id;
            }
          } else if (type === 'equipo') {
            const equipo = await fetchById(id);
            name = equipo ? equipo.nombre : id;
          }

          newResolvedNames[id] = name;
        } catch (error) {
          console.warn(`Failed to resolve name for ${type} ${id}:`, error);
          newResolvedNames[id] = id;
        }
      }));

      setResolvedNames(newResolvedNames);
    };

    resolveNames();
  }, [pathname, fetchById, resolvedNames]); // Include all dependencies

  if (breadcrumbs.length <= 1) return null; // Hide if only Dashboard

  const parentUrl = getParentUrl();

  return (
    <nav
      className="flex items-center gap-2 text-sm flex-wrap mb-4"
      {...createDebugAttributes({
        componentName: 'Breadcrumb',
        filePath: 'src/components/layout/breadcrumb.tsx'
      })}
    >
      {/* Back/Up navigation button */}
      {parentUrl && (
        <Link
          href={parentUrl}
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent rounded-md h-6 px-2 text-muted-foreground hover:text-foreground"
          title="Volver al nivel anterior"
          data-ai-tag="breadcrumb-back"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}

      {breadcrumbs.map((item, index) => {
        return (
          <React.Fragment key={item.href}>
            {/* Add chevron arrow before all items except the first one (home) */}
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" data-ai-tag="breadcrumb-chevron" />
            )}

            {/* Home icon for the first item */}
            {index === 0 ? (
              <Link
                href={item.href}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent rounded-md h-6 px-2 text-muted-foreground hover:text-foreground",
                  item.isCurrent && "text-foreground font-medium"
                )}
                data-ai-tag={`breadcrumb-link-${index}`}
                data-ai-type={item.type}
              >
                <Home className="h-4 w-4" data-ai-tag="breadcrumb-home" />
              </Link>
            ) : (
              <div className="flex items-center gap-2 min-w-0" data-ai-tag={`breadcrumb-element-${item.type}`}>
              {item.showIcon && (
                <EntityIcon
                  entityType={item.type || 'ubicacion'}
                  className={cn("h-4 w-4", getIconColor(item.type))}
                />
              )}

              {item.isCurrent ? (
                <span className="text-foreground font-medium truncate max-w-[150px]" data-ai-tag="breadcrumb-current">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="inline-flex items-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground rounded-md h-6 px-2 justify-start text-foreground font-medium truncate max-w-[150px]"
                  data-ai-tag={`breadcrumb-link-${index}`}
                  data-ai-type={item.type}
                >
                  {item.label}
                </Link>
              )}


              {item.isActive === false && (
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 text-xs" data-ai-tag="breadcrumb-inactive">
                  Inactivo
                </span>
              )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}