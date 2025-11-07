# Masirep UX Design Specification

_Created on 2025-11-05 by Carlos_
_Generated using BMad Method - Create UX Design Workflow v1.0_

---

## Executive Summary

**Project Vision:** Masirep es un sistema de gestión de repuestos y componentes fullstack diseñado para reemplazar una base de datos de 30 años que fue perdida por el área de sistemas. El sistema opera localmente sin conexión a internet, específicamente para el área de mantenimiento de una empresa, proporcionando control total sobre los datos y autonomía del departamento.

**Target Users:** 7 técnicos de mantenimiento que operan en un modelo colaborativo donde todos tienen responsabilidades administrativas

**Core Experience:** Búsqueda ultra-rápida de repuestos + actualización simple de stock que hace que los técnicos se sientan eficientes y en control

**Desired Emotional Response:** Eficientes y en control - los usuarios deben sentir que encuentran lo que necesitan instantáneamente y tienen control total sobre su inventario

**Platform:** Aplicación web local accesible desde equipos Windows estándar del departamento

---

## 1. Design System Foundation

### 1.1 Design System Choice

**Chosen System: shadcn/ui**

**Rationale:** shadcn/ui fue seleccionado por ser moderno y altamente personalizable, basado en Tailwind CSS. Proporciona componentes de alta calidad que ya se ven profesionales mientras permite la personalización necesaria para crear una experiencia única para Masirep. Se alinea perfectamente con la meta de hacer que los usuarios se sientan "eficientes y en control" a través de una interfaz limpia y moderna.

**Provides:**
- Component library completa (buttons, forms, modals, tables, etc.)
- Accesibilidad integrada (WCAG compliance)
- Capacidades avanzadas de tematización con Tailwind CSS
- Patrones responsive optimizados
- Documentación clara y componentes reutilizables

**Customization Needs:**
- Personalización de colores para alinear con marca departamental
- Componentes específicos para gestión jerárquica de ubicaciones
- Adaptación de patrones de búsqueda para inventario técnico

---

## 2. Core User Experience

### 2.1 Defining Experience

**Defining Experience:** "El sistema donde buscas repuestos al instante, navegas el almacén como si estuvieras allí, y actualizas stock con un solo clic"

Esta experiencia combinada es lo que hace a Masirep único. A diferencia de otras herramientas de inventario que se enfocan en un solo aspecto, Masirep integra tres experiencias críticas en un flujo fluido:

1. **Búsqueda instantánea** - Como Google pero para repuestos técnicos
2. **Navegación visual** - Como explorar físicamente el almacén digitalmente
3. **Actualización simple** - Como marcar tareas completadas con un clic

**UX Pattern Analysis:** La experiencia de Masirep utiliza patrones establecidos (búsqueda, navegación jerárquica, actualización de estado) pero los combina de manera única. Los técnicos ya entienden cada patrón individualmente, pero la integración fluida de los tres es lo que crea valor excepcional.

### 2.2 Novel UX Patterns

**No novel patterns required** - Masirep utiliza patrones UX establecidos que los usuarios ya comprenden:

- **Búsqueda tipo Google**: Input de búsqueda con resultados instantáneos y filtros
- **Navegación tipo explorador de archivos**: Ubicación → Sub-ubicación → Elemento
- **Actualización tipo checklist**: Click para registrar cambio de estado

**Innovation Point:** La innovación no está en crear nuevos patrones, sino en la **integración fluida** de patrones existentes específicamente adaptados al flujo de trabajo de técnicos de mantenimiento.

---

## 3. Visual Foundation

### 3.1 Color System

**Chosen Theme: Ternium Classic**

**Color Palette:**
- **Primary Orange:** #FF6B00 (acciones principales, botones, elementos interactivos)
- **Primary Orange Dark:** #E55A00 (hover states, elementos activos)
- **Secondary Gray:** #6B7280 (acciones secundarias, texto supporting)
- **Success Green:** #10B981 (estados de éxito, confirmaciones)
- **Warning Yellow:** #F59E0B (alertas, stock bajo)
- **Error Red:** #EF4444 (errores, estados críticos)
- **Info Blue:** #3B82F6 (información, ayuda)

**Neutral Grays:**
- **Background:** #F9FAFB (fondo principal)
- **Surface:** #F3F4F6 (tarjetas, paneles)
- **Border:** #E5E7EB (bordes, separadores)
- **Border Light:** #D1D5DB (bordes sutiles)
- **Text Light:** #9CA3AF (texto secundario)
- **Text:** #6B7280 (texto normal)
- **Text Dark:** #4B5563 (texto importante)
- **Heading:** #374151 (títulos y encabezados)
- **Heading Dark:** #1F2937 (títulos principales)
- **Black:** #111827 (texto más importante)

**Typography System:**
- **Font Family:** -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Type Scale:** Basado en Tailwind CSS con jerarquía clara para técnicos
- **Font Weights:** Regular (400), Medium (500), Semibold (600), Bold (700)

**Spacing & Layout:**
- **Base Unit:** 4px (siguiendo Tailwind CSS)
- **Spacing Scale:** xs(4px), sm(8px), md(16px), lg(24px), xl(32px), 2xl(48px)
- **Layout Grid:** Sistema de 12 columnas responsive basado en Tailwind

**Rationale:** Ternium Classic fue elegido por transmitir profesionalismo y energía industrial, alineándose perfectamente con la identidad de un sistema de mantenimiento técnico. Los colores naranja proporcionan energía y visibilidad para acciones importantes, mientras que los grises mantienen la seriedad y profesionalismo necesarias para una herramienta empresarial.

**Interactive Visualizations:**

- Color Theme Explorer: [ux-color-themes.html](./ux-color-themes.html)

---

## 4. Design Direction

### 4.1 Chosen Design Approach

**Design Direction: Híbrido Profesional + Navegación por Ubicaciones**

**Rationale:** Esta dirección combinada ofrece lo mejor de ambos mundos - la estructura profesional del Híbrido con la intuitiva navegación geográfica. Los técnicos pueden acceder rápidamente a funciones principales mientras navegan el almacén de manera visual e intuitiva.

**Layout Decisions:**
- **Navigation pattern:** Top bar con navegación principal + acciones rápidas
- **Content structure:** Layout flexible que se adapta al contexto (búsqueda vs navegación)
- **Content organization:** Cards visuales para ubicaciones, tablas para resultados

**Hierarchy Decisions:**
- **Visual density:** Balanceado - información clara sin sobrecarga
- **Header emphasis:** Títulos claros con jerarquía visual apropiada
- **Content focus:** Mix de datos tabulares y elementos visuales

**Interaction Decisions:**
- **Primary action pattern:** Botones naranja prominentes para acciones críticas
- **Information disclosure:** Progressive disclosure con pestañas y expansión
- **User control:** Navegación flexible entre modos (búsqueda vs ubicaciones)

**Key Features Implemented:**
- **Búsqueda dual con pestañas:** Separación clara entre repuestos y componentes
- **Filtros específicos por tipo:** Técnicos para componentes (R > 30Ω, etc.)
- **Navegación geográfica:** Cards clickeables de ubicaciones con breadcrumbs
- **Actualización contextual de stock:** Forms que se adaptan al contexto

**Interactive Mockups:**

- Original Design Directions: [ux-design-directions.html](./ux-design-directions.html)
- **Final Custom Design:** [ux-design-directions-custom.html](./ux-design-directions-custom.html) ← **IMPLEMENTADO**

---

## 5. User Journey Flows

### 5.1 Critical User Paths

**Journey 1: Búsqueda y Localización Rápida**
1. **Entry:** Pantalla principal con búsqueda dual activa
2. **Input:** Usuario selecciona pestaña (Repuestos/Componentes) + ingresa término
3. **Filter:** Aplica filtros específicos según tipo (equipo para repuestos, técnicos para componentes)
4. **Results:** Tabla con stock actual y ubicación exacta
5. **Action:** Click en "Retirar" o "Ver" para continuar

**Journey 2: Navegación Geográfica del Almacén**
1. **Entry:** Click en "Ubicaciones" o cards de ubicación
2. **Navigation:** Breadcrumbs + clic en ubicación → sub-ubicación → elemento
3. **Visual:** Cards con resumen de contenidos por cada nivel jerárquico
4. **Context:** Información de stock y acciones disponibles en cada ubicación
5. **Action:** Exploración visual o acciones directas desde ubicación

**Journey 3: Actualización de Stock Contextual**
1. **Trigger:** Desde resultados de búsqueda o vista de ubicación
2. **Selection:** Item específico con múltiples ubicaciones disponibles
3. **Action:** Elección de tipo de movimiento (Retiro/Agregado/Ajuste)
4. **Input:** Cantidad + ubicación específica + notas opcionales
5. **Confirmation:** Feedback visual del movimiento realizado

**Journey 4: Gestión Multi-ubicación**
1. **Context:** Item con existencia en múltiples ubicaciones
2. **Visualization:** Distribución visual con porcentajes por ubicación
3. **Decision:** Selección inteligente de ubicación basada en stock disponible
4. **Transfer:** Opción de mover stock entre ubicaciones si es necesario
5. **Update:** Actualización automática de distribución

---

## 6. Component Library

### 6.1 Component Strategy

**From shadcn/ui Base System:**
- **Buttons:** Primary (naranja), Secondary (gris), Ghost variants
- **Forms:** Input, Select, Textarea, Checkbox con validación integrada
- **Tables:** Tables con sorting, filtering, pagination
- **Cards:** Card base con hover effects y responsive
- **Modals:** Dialog, Sheet, Popover para acciones contextuales
- **Navigation:** Tabs, Breadcrumb, Menus con estilos personalizados
- **Feedback:** Alert, Toast, Badge para estados y notificaciones
- **Data Display:** Skeleton, Progress, Charts para indicadores visuales

**Custom Components for Masirep:**

**LocationCard Component:**
- **Purpose:** Visual representation de ubicaciones físicas
- **Content:** Icon, nombre, estadísticas, botón de exploración
- **States:** Default, Hover (border naranja), Selected
- **Interactivity:** Click para navegar, hover effects con elevación

**DualTabSearch Component:**
- **Purpose:** Búsqueda separada para repuestos vs componentes
- **Content:** Tab navigation + search input + filtros específicos
- **Behavior:** Filters dinámicos según pestaña activa
- **Features:** Advanced filters para componentes técnicos

**StockUpdatePanel Component:**
- **Purpose:** Form contextual para actualización de stock
- **Content:** Movement type selector, cantidad, ubicación, notas
- **Layout:** Grid layout responsive con distribución visual
- **Integration:** Location breakdown y activity history

**FilterChip Component:**
- **Purpose:** Filtros clickeables para búsqueda avanzada
- **Behavior:** Toggle active/inactive states
- **Variants:** Default, Active (naranja), Hover effects
- **Usage:** Technical filters (R > 30Ω), categorías, estados

---

## 7. UX Pattern Decisions

### 7.1 Consistency Rules

**Button Hierarchy:**
- **Primary action:** Botón naranja (#FF6B00) para acciones críticas (Buscar, Confirmar, Retirar)
- **Secondary action:** Botón gris claro (#F3F4F6) con borde para acciones secundarias
- **Tertiary action:** Links naranja para acciones de bajo peso (Ver detalles, Editar)
- **Destructive action:** Botón rojo solo para acciones irreversibles importantes

**Feedback Patterns:**
- **Success:** Toast verde (top-right) para confirmaciones de acciones
- **Error:** Toast rojo (top-right) con mensaje claro y acción sugerida
- **Warning:** Badge amarillo en items con stock bajo
- **Info:** Tooltip azul para ayuda contextual
- **Loading:** Skeleton states para tablas, spinner para botones

**Form Patterns:**
- **Label position:** Labels arriba de los inputs (claridad para técnicos)
- **Required field indicator:** Asterisco rojo (*)
- **Validation timing:** Validación en blur para campos, en submit para form completo
- **Error display:** Messages rojos debajo del campo afectado
- **Help text:** Gris claro debajo del input cuando es necesario

**Modal Patterns:**
- **Size variants:** Small (confirmaciones), Medium (forms), Large (detalles)
- **Dismiss behavior:** Click outside + tecla Escape + botón Close
- **Focus management:** Auto-focus en primer input del modal
- **Stacking:** Solo un modal a la vez para no confundir

**Navigation Patterns:**
- **Active state:** Naranja con subrayado para navegación actual
- **Breadcrumb usage:** Siempre en navegación por ubicaciones
- **Back button:** Browser back button + breadcrumb navigation
- **Deep linking:** Todas las vistas principales deben ser linkables

**Empty State Patterns:**
- **First use:** Cards con "Agregar ubicación" y "Agregar primer repuesto"
- **No results:** Mensaje claro con "No se encontraron resultados" + sugerencias
- **Cleared content:** Opción de "Deshacer" última acción destructiva

**Confirmation Patterns:**
- **Delete:** Modal de confirmación siempre para eliminar items
- **Leave unsaved:** Modal de advertencia al navegar con cambios sin guardar
- **Irreversible actions:** Confirmación doble para acciones críticas

**Notification Patterns:**
- **Placement:** Top-right corner, stack vertical
- **Duration:** Auto-dismiss en 5 segundos para success/info, manual para errores
- **Stacking:** Máximo 3 notificaciones visibles simultáneamente
- **Priority:** Critical (rojo) > Warning (amarillo) > Info (azul) > Success (verde)

**Search Patterns:**
- **Trigger:** Auto-search después de 500ms de typing
- **Results display:** Instantáneo en tabla con paginación
- **Filters:** Chips clickeables con estado active/inactive claro
- **No results:** Mensaje útil con sugerencias de búsqueda

**Date/Time Patterns:**
- **Format:** Relativo para reciente (Hoy, Ayer) + absoluto para fechas antiguas
- **Timezone:** Siempre hora local del usuario
- **Pickers:** Date picker para fechas, time picker para horas específicas

---

## 8. Responsive Design & Accessibility

### 8.1 Responsive Strategy

**Breakpoint Strategy (Basado en Tailwind CSS):**
- **Mobile:** < 768px (1-column layout, bottom navigation, touch targets 44px+)
- **Tablet:** 768px - 1024px (2-column layout, sidebar collapsible, touch optimized)
- **Desktop:** > 1024px (3-column layout, sidebar permanente, hover states)

**Adaptation Patterns:**
- **Navigation:** Top bar mobile → Sidebar desktop + Bottom nav mobile
- **Search:** Full-width input mobile → Compact input desktop con filters
- **Tables:** Mobile stack view → Horizontal scroll tablet → Full table desktop
- **Cards:** Single column mobile → 2-column tablet → 3-column desktop
- **Modals:** Full screen mobile → Centered modal tablet/desktop
- **Forms:** Single column mobile → Multi-column tablet/desktop

**Mobile-First Considerations:**
- **Touch targets:** Mínimo 44px para todos los elementos interactivos
- **Thumb-friendly:** Botones grandes espaciados adecuadamente
- **Gestures:** Swipe para navigation, pull-to-refresh para actualizar datos
- **Performance:** Optimizado para conexiones locales rápidas pero sin dependencia de internet

**Accessibility Strategy (WCAG 2.1 Level AA):**
- **Color contrast:** Mínimo 4.5:1 para texto normal, 3:1 para texto grande
- **Keyboard navigation:** Todos los elementos interactivos accesibles con Tab
- **Focus indicators:** Visibles y consistentes (naranja #FF6B00)
- **Screen readers:** Etiquetas ARIA apropiadas para todos los componentes
- **Alt text:** Descriptivo para todas las imágenes significativas
- **Form labels:** Proper label associations con for/id attributes
- **Error identification:** Mensajes de error claros y asociados a campos

**Testing Strategy:**
- **Automated:** Lighthouse CI integration, axe DevTools para tests de accesibilidad
- **Manual:** Keyboard-only navigation testing semanal
- **Screen reader:** Testing con NVDA/JAWS para componentes críticos
- **Real devices:** Testing en tablets y laptops usados por técnicos

**Special Considerations for Technical Users:**
- **High contrast mode:** Opción para mejor visibilidad en talleres con mala iluminación
- **Large text mode:** Opción para aumentar tamaño de fuente sin romper layout
- **Reduced motion:** Respetar prefers-reduced-motion para usuarios sensibles
- **Voice control:** Considerar comandos de voz para hands-free operation en taller

---

## 9. Implementation Guidance

### 9.1 Completion Summary

**✅ Excellent work! Your UX Design Specification is complete.**

**What we created together:**

- **Design System:** shadcn/ui with 4 custom components for Masirep's specific needs
- **Visual Foundation:** Ternium Classic color theme with professional orange/gray palette and Tailwind CSS typography
- **Design Direction:** Híbrido Profesional + Navegación por Ubicaciones - perfect balance of professional structure and intuitive geographic navigation
- **User Journeys:** 4 critical flows designed with clear navigation paths and contextual actions
- **UX Patterns:** 10 pattern categories established for cohesive experience across the app
- **Responsive Strategy:** 3 breakpoints with adaptation patterns for mobile, tablet, and desktop
- **Accessibility:** WCAG 2.1 Level AA compliance requirements with special considerations for technical workshop environments

**Your Deliverables:**
- **UX Design Document:** `/home/analiticos/proyectos/masirep/docs/ux-design-specification.md`
- **Interactive Color Themes:** `/home/analiticos/proyectos/masirep/docs/ux-color-themes.html`
- **Original Design Directions:** `/home/analiticos/proyectos/masirep/docs/ux-design-directions.html`
- **Final Custom Design:** `/home/analiticos/proyectos/masirep/docs/ux-design-directions-custom.html`

**Key Design Decisions Made:**
1. **Dual-tab search system** for repuestos vs componentes with specialized filters
2. **Geographic navigation** through physical storage locations
3. **Technical filtering** for components (R > 30Ω, C > 100µF, etc.)
4. **Contextual stock updates** with location-based selection
5. **Professional orange/gray theme** inspired by Ternium's industrial aesthetic

**What happens next:**
- Designers can create high-fidelity mockups from this foundation
- Developers can implement with clear UX guidance and rationale
- All your design decisions are documented with reasoning for future reference

**You've made thoughtful choices through visual collaboration that will create a great user experience for the 7 maintenance technicians. The combination of efficient search, intuitive navigation, and contextual stock management will help them feel "efficient and in control" - exactly the emotional response we aimed for.**

Ready for design refinement and implementation!

---

## Appendix

### Related Documents

- Product Requirements: `/home/analiticos/proyectos/masirep/docs/PRD.md`
- Product Brief: `/home/analiticos/proyectos/masirep/docs/product-brief-masirep-2025-11-05.md`
- Brainstorming: _(No disponible)_

### Core Interactive Deliverables

This UX Design Specification was created through visual collaboration:

- **Color Theme Visualizer**: `/home/analiticos/proyectos/masirep/docs/ux-color-themes.html`
  - Interactive HTML showing all color theme options explored
  - Live UI component examples in each theme
  - Side-by-side comparison and semantic color usage

- **Design Direction Mockups**: `/home/analiticos/proyectos/masirep/docs/ux-design-directions.html`
  - Interactive HTML with 6-8 complete design approaches
  - Full-screen mockups of key screens
  - Design philosophy and rationale for each direction

### Optional Enhancement Deliverables

_This section will be populated if additional UX artifacts are generated through follow-up workflows._

<!-- Additional deliverables added here by other workflows -->

### Next Steps & Follow-Up Workflows

This UX Design Specification can serve as input to:

- **Wireframe Generation Workflow** - Create detailed wireframes from user flows
- **Figma Design Workflow** - Generate Figma files via MCP integration
- **Interactive Prototype Workflow** - Build clickable HTML prototypes
- **Component Showcase Workflow** - Create interactive component library
- **AI Frontend Prompt Workflow** - Generate prompts for v0, Lovable, Bolt, etc.
- **Solution Architecture Workflow** - Define technical architecture with UX context

### Version History

| Date     | Version | Changes                         | Author        |
| -------- | ------- | ------------------------------- | ------------- |
| 2025-11-05 | 1.0     | Initial UX Design Specification | Carlos |

---

_This UX Design Specification was created through collaborative design facilitation, not template generation. All decisions were made with user input and are documented with rationale._