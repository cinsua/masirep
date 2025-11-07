# Masirep - Product Requirements Document

**Author:** Carlos
**Date:** 2025-11-05
**Version:** 1.0

---

## Executive Summary

Masirep es un sistema de gestión de repuestos y componentes fullstack diseñado para reemplazar una base de datos de 30 años que fue perdida por el área de sistemas. El sistema opera localmente sin conexión a internet, específicamente para el área de mantenimiento de una empresa, proporcionando control total sobre los datos y autonomía del departamento. La solución recupera y moderniza la funcionalidad crítica perdida, con arquitectura descentralizada que evita dependencias de TI corporativa.

### What Makes This Special

**La magia de Masirep es la recuperación soberana de conocimiento organizacional**: transforma 30 años de experiencia en inventario perdida en un sistema vivo, auto-gestionado por los propios técnicos, que nunca más dependerá de nadie para proteger datos críticos de mantenimiento. Cada búsqueda exitosa, cada actualización de stock en tiempo real, es un acto de recuperación de autonomía departamental.

---

## Project Classification

**Technical Type:** Fullstack Web Application
**Domain:** Enterprise Maintenance Management
**Complexity:** Medium

**Aplicación web completa con frontend y backend independientes, base de datos local, sin dependencias de red corporativa, diseñada para equipos pequeños (7 usuarios) con necesidades específicas de gestión de inventario técnico.**

---

## Success Criteria

**Éxito significa que los técnicos encuentran repuestos en minutos en lugar de horas, y que el departamento tiene control total sobre sus datos críticos sin depender de nadie más.**

### Métricas Específicas:

- **Reducción del 80% en tiempo de búsqueda** de repuestos (de horas a minutos)
- **Visibilidad del 100% del inventario** en tiempo real
- **Zero pérdida de datos** mediante sistema de backup local autónomo
- **Adopción del 100%** por los 7 técnicos del departamento
- **Reducción del 90% de compras duplicadas** por falta de visibilidad de stock

---

## Product Scope

### MVP - Minimum Viable Product

**Sistema funcional que resuelve el problema crítico de búsquedas y gestión básica:**

1. **Búsqueda Inteligente** - Búsqueda por código/descripción con stock y ubicación exacta
2. **Gestión Dual de Inventario** - Repuestos específicos y componentes genéricos
3. **Sistema de Almacenamiento Jerárquico** - Navegación por ubicaciones físicas
4. **Altas de Elementos** - Registro de nuevos repuestos/componentes
5. **Reportes de Faltantes** - Existencias en cero o bajo stock mínimo
6. **Actualización de Stock** - Registro de consumos y recepciones

### Growth Features (Post-MVP)

1. **Sistema de Impresión de Etiquetas** - Para cajones y organizadores
2. **Historial de Movimientos** - Trazaabilidad de consumos
3. **Alertas Automáticas** - Notificaciones de stock mínimo
4. **Backup Automático Programado** - Copias de seguridad automatizadas
5. **Interfaz Mejorada** - Mejoras UX basadas en uso real

### Vision (Future)

1. **Integración con SAP** - Sincronización con equipo de SAP existente
2. **Móvil Offline** - Aplicación móvil para búsquedas en taller
3. **Análisis Predictivo** - Patrones de consumo y predicción de necesidades
4. **Gestión de Proveedores** - Integración completa de cadena de suministro

---

## Functional Requirements

### 1. Gestión de Inventario Dual

**FR-1: Gestión de Repuestos**
- Sistema debe permitir registrar repuestos con: código/número de parte, descripción, nota opcional, stock mínimo (defecto 0), stock actual calculado
- Repuestos pueden asociarse a múltiples equipos (relación 0 a muchos)
- Repuestos pueden estar en múltiples ubicaciones de almacenamiento
- Sistema debe calcular stock actual automáticamente sumando todas las existencias

**FR-2: Gestión de Componentes**
- Sistema debe permitir registrar componentes con: categoría (resistencia, capacitor, integrado, etc), descripción, pares valor/unidad (22 ohms, 2w)
- Componentes pueden tener múltiples mediciones/tipos
- Componentes pueden estar en múltiples ubicaciones de almacenamiento
- Sistema debe categorizar automáticamente por tipo de componente

**FR-3: Gestión de Equipos**
- Sistema debe registrar equipos con: SAP (identificación interna), Nombre (ESP20, PREPMASTER), Marca, Modelo
- Sistema debe asociar repuestos específicos a equipos como **referencia técnica**
- La asociación indica compatibilidad (este repuesto sirve para este equipo) y **NO afecta stock disponible**
- Un mismo repuesto puede estar asociado a múltiples equipos sin límites
- Stock management se mantiene exclusivamente via ubicaciones de almacenamiento

### 2. Sistema de Almacenamiento Jerárquico

**FR-4: Gestión de Ubicaciones**
- Sistema debe manejar ubicaciones físicas con nombre (Aceria, Masi, Reduccion, etc)
- Cada ubicación contiene estanterías y/o armarios

**FR-5: Gestión de Estanterías**
- Sistema debe registrar estanterías con: nombre (ESTANTERIA FRX), cajones (0 a muchos), estantes (0 a muchos), organizadores (0 a muchos)
- Estantes numerados del 1 en adelante con múltiples repuestos

**FR-6: Gestión de Armarios**
- Sistema debe registrar armarios con: nombre (ARMARIO ACE), cajones (0 a muchos), organizadores (0 a muchos), repuestos sueltos (0 a muchos)

**FR-7: Gestión de Cajones**
- Sistema debe manejar cajones numerados (cajón 1, cajón 2) con: divisiones (0 a muchos), repuestos sueltos (0 a muchos)
- Divisiones numeradas del 1 en adelante con múltiples repuestos

**FR-8: Gestión de Organizadores**
- Sistema debe registrar organizadores con: nombre, cajoncitos numerados del 1 en adelante
- Cada cajoncito puede contener múltiples repuestos

### 3. Sistema de Búsqueda y Navegación

**FR-9: Búsqueda Principal**
- Sistema debe buscar por: código/número de parte, descripción, categoría
- Sistema debe permitir filtrar resultados por tipo (repuesto/componente)
- Sistema debe permitir ordenar resultados por: código, descripción, stock actual
- Resultados deben mostrar información principal con elementos clickeables para expandir

**FR-10: Navegación por Ubicaciones**
- Sistema debe mostrar vista de ubicaciones con tarjetas de armarios/estanterías
- Sistema debe permitir navegación jerárquica: ubicación → armario/estantería → cajón → división
- Sistema debe mostrar información resumida de contenidos en cada nivel

**FR-11: Detalles de Elementos**
- Sistema debe mostrar vista detallada con toda la información del repuesto/componente
- Sistema debe mostrar todas las ubicaciones donde se encuentra el elemento
- Sistema debe permitir actualizar stock desde vista detallada

### 4. Sistema de Altas Interactivas

**FR-12: Altas Contextuales**
- Sistema debe permitir agregar elementos desde cualquier nivel del almacenamiento
- Al tocar armario/estantería, debe mostrar opciones: agregar componente, agregar repuesto, agregar organizador
- Sistema debe pre-seleccionar ubicación basada en navegación actual del usuario

**FR-13: Validación de Datos**
- Sistema debe validar formatos de códigos y números de parte
- Sistema debe evitar duplicados por código/número de parte
- Sistema debe validar valores técnicos para componentes (ej: valores de resistencia)

### 5. Gestión de Stock y Reportes

**FR-14: Actualización de Stock**
- Sistema debe actualizar stock actual automáticamente al registrar consumos
- Sistema debe actualizar stock actual automáticamente al registrar recepciones
- Sistema debe mostrar historial de movimientos de stock

**FR-15: Reportes de Faltantes**
- Sistema debe generar reporte de elementos con existencia = 0
- Sistema debe generar reporte de elementos con existencia ≤ stock mínimo
- Reportes deben ser exportables a Excel/PDF

**FR-16: Alertas de Stock**
- Sistema debe identificar visualmente elementos con stock bajo
- Sistema debe enviar alertas al alcanzar stock mínimo

### 6. Sistema de Impresión

**FR-17: Listados para Etiquetas**
- Sistema debe generar listas de componentes/repuestos por ubicación
- Sistema debe formatear listas para impresión física y pegado en cajones
- Sistema debe permitir personalizar formato de impresión

### 7. Administración del Sistema

**FR-18: Gestión de Usuarios**
- Sistema debe permitir acceso a los 7 técnicos del departamento
- Sistema debe tener modelo de permisos igual para todos (auto-administración)
- Sistema debe registrar quién realiza cada actualización

**FR-19: Backup y Recuperación**
- Sistema debe realizar backups automáticos locales
- Sistema debe permitir restauración desde backups
- Sistema debe tener control total del departamento sobre datos

---

## UX Requirements

### Design System Foundation

**Design System:** shadcn/ui con personalización Ternium Classic
- **Color Theme:** Ternium Classic con naranja industrial (#FF6B00) y grises profesionales
- **Typography:** Sistema tipográfico basado en Tailwind CSS para máxima legibilidad
- **Components:** Biblioteca completa con 4 componentes personalizados para Masirep

### Custom UX Components

**LocationCard Component**
- Visual representation de ubicaciones físicas con información de stock
- Estados: Default, Hover (border naranja), Selected
- Interactividad: Click para navegar, efectos hover con elevación

**DualTabSearch Component**
- Búsqueda separada para repuestos vs componentes con filtros dinámicos
- Comportamiento: Filters específicos según pestaña activa
- Features: Advanced filters para componentes técnicos (R > 30Ω, etc.)

**StockUpdatePanel Component**
- Form contextual para actualización de stock con movement type selector
- Layout: Grid layout responsive con distribución visual
- Integration: Location breakdown y activity history

**FilterChip Component**
- Filtros clickeables con toggle active/inactive states
- Variants: Default, Active (naranja), Hover effects
- Usage: Technical filters, categorías, estados de stock

### User Interface Patterns

**Navigation Patterns**
- Top bar con navegación principal + acciones rápidas
- Breadcrumb navigation para exploración jerárquica de ubicaciones
- Active state: Naranja con subrayado para navegación actual

**Search Experience**
- Auto-search después de 500ms de typing
- Resultados instantáneos en tabla con paginación
- Chips clickeables para filtros con estado active/inactive claro

**Visual Hierarchy**
- Primary actions: Botones naranja (#FF6B00) para acciones críticas
- Secondary actions: Botones gris claro con borde para acciones secundarias
- Visual density: Balanceado - información clara sin sobrecarga

**Responsive Strategy**
- Desktop: > 1024px (3-column layout, sidebar permanente)
- Tablet: 768px - 1024px (2-column layout, sidebar collapsible)
- Mobile: < 768px (1-column layout, bottom navigation)

### Accessibility Requirements

**WCAG 2.1 Level AA Compliance**
- Color contrast mínimo 4.5:1 para texto normal
- Keyboard navigation para todos elementos interactivos
- Focus indicators visibles y consistentes (naranja #FF6B00)
- Screen reader compatibility con etiquetas ARIA apropiadas

**Special Considerations for Technical Users**
- High contrast mode para mejor visibilidad en talleres
- Large text mode sin romper layout
- Reduced motion support para usuarios sensibles

---

## Non-Functional Requirements

### Performance

**La velocidad de búsqueda es crítica para la usabilidad diaria:**

- **Búsqueda**: < 2 segundos para cualquier consulta en base de datos completa
- **Carga de interfaces**: < 3 segundos para cualquier vista
- **Actualización de stock**: < 1 segundo para registrar consumo/recepción
- **Backup**: < 5 minutos para backup completo de base de datos

### Security

**Seguridad enfocada en integridad y control departamental:**

- **Autenticación local**: Usuarios gestionados internamente sin integración corporativa
- **Control de acceso**: Solo accesible desde equipos del departamento de mantenimiento
- **Integridad de datos**: Logs de auditoría para todas las actualizaciones
- **Backup encriptado**: Copias de seguridad con encriptación local

### Scalability

**Diseñado para equipo pequeño pero con crecimiento potencial:**

- **Usuarios**: Soporte hasta 50 usuarios simultáneos
- **Registros**: Soporte hasta 100,000 items de inventario
- **Transacciones**: 1,000 actualizaciones por hora sin degradación
- **Almacenamiento**: 10 años de historial sin impacto en rendimiento

### Integration

**Independencia total con futuro opcional de integración:**

- **Sin dependencias**: Operación completamente offline sin requerimientos de red
- **Importación/Exportación**: Capacidad de importar datos desde Excel y exportar reportes
- **Futura integración SAP**: Arquitectura preparada para futura integración con SAP existente

---

## Implementation Planning

### Epic Breakdown Required

Requirements must be decomposed into epics and bite-sized stories (200k context limit).

**Next Step:** Run `workflow epics-stories` to create the implementation breakdown.

---

## References

- Product Brief: /home/analiticos/proyectos/masirep/docs/product-brief-masirep-2025-11-05.md
- UX Design Specification: /home/analiticos/proyectos/masirep/docs/ux-design-specification.md
- UX Interactive Mockups: /home/analiticos/proyectos/masirep/docs/ux-design-directions-custom.html
- UX Color Themes: /home/analiticos/proyectos/masirep/docs/ux-color-themes.html

---

## Next Steps

1. **Epic & Story Breakdown** - Run: `workflow epics-stories`
2. **UX Design** - Run: `workflow ux-design`
3. **Architecture** - Run: `workflow create-architecture`

---

_This PRD captures the essence of Masirep - la recuperación soberana de conocimiento organizacional a través de un sistema auto-gestionado que nunca más dependerá de nadie para proteger datos críticos._

_Created through collaborative discovery between Carlos and AI facilitator._