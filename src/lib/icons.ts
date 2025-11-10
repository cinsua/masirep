/**
 * Sistema de Iconos de Masirep
 * 
 * Este archivo define el sistema de iconos consistente para toda la aplicación.
 * Cada icono está cuidadosamente seleccionado para representar visualmente
 * las entidades del sistema de gestión de inventario.
 * 
 * @author Carlos
 * @version 1.0.0
 */

export const ICON_SYSTEM = {
  // Estructuras de almacenamiento principales
  estanteria: 'rows-3',
  armario: 'columns-2',
  
  // Contenedores y organizadores
  cajon: 'archive',
  cajoncito: 'shopping-bag',
  organizadores: 'grid-3x3',
  estante: 'rectangle-horizontal',
  caja: 'archive',
  
  // Subdivisiones
  division: 'frame',
  
  // Contenido general
  contenido: 'package',
  
  // Entidades de inventario
  repuesto: 'wrench',
  componente: 'cpu',
  equipo: 'monitor',
  
  // Ubicaciones generales
  ubicacion: 'map-pin',
  location: 'map-pin',
  
  // Acciones comunes
  add: 'plus',
  edit: 'edit',
  delete: 'trash-2',
  view: 'eye',
  search: 'search',
  filter: 'filter',
  
  // Navegación
  home: 'home',
  dashboard: 'layout-dashboard',
  settings: 'settings',
  
  // Estados
  active: 'check-circle',
  inactive: 'x-circle',
  warning: 'alert-triangle',
  error: 'x-circle',
  success: 'check-circle',
  
  // UI Elements
  menu: 'menu',
  close: 'x',
  expand: 'chevron-down',
  collapse: 'chevron-up',
  next: 'chevron-right',
  previous: 'chevron-left',
  
  // Data operations
  save: 'save',
  download: 'download',
  upload: 'upload',
  export: 'file-down',
  import: 'file-up',
  
  // Communication
  notification: 'bell',
  email: 'mail',
  user: 'user',
  users: 'users'
} as const;

// Tipos para TypeScript
export type IconType = keyof typeof ICON_SYSTEM;
export type IconName = typeof ICON_SYSTEM[IconType];

/**
 * Obtiene el nombre del icono para una entidad específica
 * @param entity - Nombre de la entidad
 * @returns Nombre del icono correspondiente
 */
export function getEntityIcon(entity: string): string {
  const normalizedEntity = entity.toLowerCase();
  
  // Mapeo específico para entidades del sistema
  const entityIconMap: Record<string, string> = {
    'estanteria': ICON_SYSTEM.estanteria,
    'estanterías': ICON_SYSTEM.estanteria,
    'armario': ICON_SYSTEM.armario,
    'armarios': ICON_SYSTEM.armario,
    'cajon': ICON_SYSTEM.cajon,
    'cajones': ICON_SYSTEM.cajon,
    'cajoncito': ICON_SYSTEM.cajoncito,
    'cajoncitos': ICON_SYSTEM.cajoncito,
    'organizador': ICON_SYSTEM.organizadores,
    'organizadores': ICON_SYSTEM.organizadores,
    'estante': ICON_SYSTEM.estante,
    'estantes': ICON_SYSTEM.estante,
    'caja': ICON_SYSTEM.caja,
    'cajas': ICON_SYSTEM.caja,
    'division': ICON_SYSTEM.division,
    'divisiones': ICON_SYSTEM.division,
    'contenido': ICON_SYSTEM.contenido,
    'repuesto': ICON_SYSTEM.repuesto,
    'repuestos': ICON_SYSTEM.repuesto,
    'componente': ICON_SYSTEM.componente,
    'componentes': ICON_SYSTEM.componente,
    'equipo': ICON_SYSTEM.equipo,
    'equipos': ICON_SYSTEM.equipo,
    'ubicacion': ICON_SYSTEM.ubicacion,
    'ubicaciones': ICON_SYSTEM.ubicacion
  };
  
  return entityIconMap[normalizedEntity] || ICON_SYSTEM.ubicacion;
}

/**
 * Utilidad para verificar si un icono existe en el sistema
 * @param iconName - Nombre del icono a verificar
 * @returns true si el icono existe, false en caso contrario
 */
export function isValidIcon(iconName: string): boolean {
  return Object.values(ICON_SYSTEM).includes(iconName as any);
}

/**
 * Obtiene todos los iconos disponibles para una categoría específica
 * @param category - Categoría de iconos (opcional)
 * @returns Array de nombres de iconos
 */
export function getAvailableIcons(category?: string): string[] {
  const allIcons = Object.values(ICON_SYSTEM);
  
  if (!category) {
    return allIcons;
  }
  
  // Filtrar por categoría basado en convenciones de nombres
  return allIcons.filter(icon => 
    icon.toLowerCase().includes(category.toLowerCase())
  );
}

export default ICON_SYSTEM;