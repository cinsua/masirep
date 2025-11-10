"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { getEntityIcon, isValidIcon } from "@/lib/icons";
import {
  // Estructuras de almacenamiento
  Rows3,
  Columns2,
  // Contenedores
  ShoppingBag,
  Grid3x3,
  RectangleHorizontal,
  Archive,
  Frame,
  // Entidades de inventario
  Wrench,
  Cpu,
  Monitor,
  // Ubicaciones
  MapPin,
  // Acciones
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  // Navegación
  Home,
  LayoutDashboard,
  Settings,
  // Estados
  CheckCircle,
  XCircle,
  AlertTriangle,
  // UI Elements
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  // Data operations
  Save,
  Download,
  Upload,
  FileDown,
  FileUp,
  // Communication
  Bell,
  Mail,
  User,
  Users,
  // Iconos adicionales para compatibilidad
  Package,
  Layers,
  FolderOpen,
  Grid3X3,
} from "lucide-react";

// Mapeo completo de nombres de iconos a componentes de Lucide React
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // Estructuras de almacenamiento
  'rows-3': Rows3,
  'columns-2': Columns2,
  
  // Contenedores y organizadores
  'shopping-bag': ShoppingBag,
  'grid-3x3': Grid3x3,
  'rectangle-horizontal': RectangleHorizontal,
  'archive': Archive,
  'frame': Frame,
  
  // Entidades de inventario
  'wrench': Wrench,
  'cpu': Cpu,
  'monitor': Monitor,
  
  // Ubicaciones generales
  'map-pin': MapPin,
  'location': MapPin,
  
  // Acciones comunes
  'plus': Plus,
  'edit': Edit,
  'trash-2': Trash2,
  'eye': Eye,
  'search': Search,
  'filter': Filter,
  
  // Navegación
  'home': Home,
  'layout-dashboard': LayoutDashboard,
  'settings': Settings,
  
  // Estados
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  'alert-triangle': AlertTriangle,
  
  // UI Elements
  'menu': Menu,
  'close': X,
  'expand': ChevronDown,
  'collapse': ChevronUp,
  'next': ChevronRight,
  'previous': ChevronLeft,
  
  // Data operations
  'save': Save,
  'download': Download,
  'upload': Upload,
  'file-down': FileDown,
  'file-up': FileUp,
  
  // Communication
  'notification': Bell,
  'email': Mail,
  'user': User,
  'users': Users,
  
  // Iconos adicionales para compatibilidad
  'package': Package,
  'layers': Layers,
  'folder-open': FolderOpen,
  'grid-3X3': Grid3X3,
};

export interface IconProps {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
}

/**
 * Componente de Icono genérico que utiliza el sistema de iconos de Masirep
 * 
 * @param name - Nombre del icono según el sistema de iconos
 * @param className - Clases CSS adicionales
 * @param size - Tamaño predefinido del icono
 * @param color - Color personalizado (opcional)
 */
export function Icon({ name, className, size = "md", color }: IconProps) {
  // Obtener el componente de icono correspondiente
  const IconComponent = iconMap[name] || MapPin;
  
  // Mapeo de tamaños a clases
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
  };
  
  // Construir clases CSS
  const iconClasses = cn(
    sizeClasses[size],
    color,
    className
  );
  
  return <IconComponent className={iconClasses} />;
}

/**
 * Componente de Icono para entidades del sistema
 * Automáticamente obtiene el icono correcto según el tipo de entidad
 */
export interface EntityIconProps {
  entityType: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
}

export function EntityIcon({ entityType, className, size = "md", color }: EntityIconProps) {
  const iconName = getEntityIcon(entityType);
  return <Icon name={iconName} className={className} size={size} color={color} />;
}

/**
 * Componente de Icono con tooltip integrado
 */
export interface IconWithTooltipProps extends IconProps {
  tooltip: string;
  position?: "top" | "bottom" | "left" | "right";
}

export function IconWithTooltip({ name, tooltip, position = "top", ...iconProps }: IconWithTooltipProps) {
  return (
    <div className="group relative inline-block">
      <Icon name={name} {...iconProps} />
      <div
        className={cn(
          "absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap",
          position === "top" && "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
          position === "bottom" && "top-full left-1/2 transform -translate-x-1/2 mt-2",
          position === "left" && "right-full top-1/2 transform -translate-y-1/2 mr-2",
          position === "right" && "left-full top-1/2 transform -translate-y-1/2 ml-2"
        )}
      >
        {tooltip}
        <div
          className={cn(
            "absolute w-2 h-2 bg-gray-800 transform rotate-45",
            position === "top" && "top-full left-1/2 transform -translate-x-1/2 -mt-1",
            position === "bottom" && "bottom-full left-1/2 transform -translate-x-1/2 -mb-1",
            position === "left" && "right-full top-1/2 transform -translate-y-1/2 -mr-1",
            position === "right" && "left-full top-1/2 transform -translate-y-1/2 -ml-1"
          )}
        />
      </div>
    </div>
  );
}

export default Icon;