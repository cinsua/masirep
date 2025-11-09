"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Cog,
  Wrench,
  MapPin,
  FileText
} from "lucide-react";
import { ICON_SYSTEM } from "@/lib/icons";
import { createDebugAttributes } from "@/lib/debug-attributes";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Repuestos",
    href: "/repuestos",
    icon: Wrench, // Usando wrench para repuestos según nuestro sistema
  },
  {
    name: "Componentes",
    href: "/componentes",
    icon: Cog, // Usando cog para componentes según nuestro sistema
  },
  {
    name: "Equipos",
    href: "/equipos",
    icon: Package, // Usando package para equipos según nuestro sistema
  },
  {
    name: "Ubicaciones",
    href: "/ubicaciones",
    icon: MapPin,
  },
  {
    name: "Reportes",
    href: "/reportes",
    icon: FileText,
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav
      className="flex space-x-1"
      {...createDebugAttributes({
        componentName: 'Navigation',
        filePath: 'src/components/layout/navigation.tsx'
      })}
    >
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            data-ai-tag={`nav-link-${item.name.toLowerCase()}`}
            data-ai-component={`nav-${item.name.toLowerCase()}-link`}
            data-ai-active={isActive}
            data-ai-href={item.href}
          >
            <item.icon
              className="h-4 w-4"
              data-ai-tag={`nav-icon-${item.name.toLowerCase()}`}
            />
            <span
              data-ai-tag={`nav-label-${item.name.toLowerCase()}`}
            >{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}