"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, MapPin, Archive, Grid3x3, Layers, FolderOpen, Package, Wrench, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
  isDynamic?: boolean; // For IDs that need to be resolved to names
  type?: "ubicacion" | "armario" | "estanteria" | "cajon" | "division" | "organizador" | "cajoncito" | "default";
  showIcon?: boolean;
  showType?: boolean;
  isActive?: boolean;
}

const getIcon = (type?: BreadcrumbItem["type"]) => {
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

const getTypeLabel = (type?: BreadcrumbItem["type"]) => {
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
      return type || "";
  }
};

const getTypeColor = (type?: BreadcrumbItem["type"]) => {
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

export function Breadcrumb() {
  const pathname = usePathname();
  const [resolvedNames, setResolvedNames] = useState<Record<string, string>>({});

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
  }, [pathname]); // Only depend on pathname, not resolvedNames

  if (breadcrumbs.length <= 1) return null; // Hide if only Dashboard

  return (
    <nav
      className="flex items-center gap-2 text-sm flex-wrap mb-4"
      data-ai-tag="breadcrumb-navigation"
      data-ai-component="layout-breadcrumb"
    >
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
              {item.showIcon && getIcon(item.type)}

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