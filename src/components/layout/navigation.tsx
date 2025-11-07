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

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Repuestos",
    href: "/repuestos",
    icon: Package,
  },
  {
    name: "Componentes",
    href: "/componentes",
    icon: Cog,
  },
  {
    name: "Equipos",
    href: "/equipos",
    icon: Wrench,
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
    <nav className="flex space-x-1">
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
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}