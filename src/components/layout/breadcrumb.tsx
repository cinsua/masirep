"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
}

export function Breadcrumb() {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (!pathname) return [];

    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: "Dashboard",
        href: "/dashboard",
      },
    ];

    let currentPath = "";

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];

      // Skip dashboard prefix since it's already added
      if (segment === "dashboard") continue;

      currentPath += `/${segment}`;

      const isLast = i === pathSegments.length - 1;

      breadcrumbs.push({
        label: formatSegmentName(segment),
        href: currentPath,
        isCurrent: isLast,
      });
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

  if (breadcrumbs.length <= 1) return null; // Hide if only Dashboard

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
          )}
          {item.isCurrent ? (
            <span className="text-foreground font-medium">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className={cn(
                "hover:text-foreground transition-colors",
                index === 0 && "flex items-center space-x-1"
              )}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}