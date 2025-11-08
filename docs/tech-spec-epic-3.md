# Epic Technical Specification: Hierarchical Storage System

Date: 2025-11-07
Author: Carlos
Epic ID: 3
Status: Draft

---

## Overview

El Epic 3: Sistema de Almacenamiento Jerárquico construye el mapeo completo entre el inventario digital y las ubicaciones físicas de almacenamiento. Este epic implementa la estructura jerárquica de almacenamiento que refleja exactamente cómo están organizados los repuestos y componentes en el mundo real del taller de mantenimiento. El sistema permite navegar desde las ubicaciones principales (Aceria, Masi, Reducción) hasta los niveles más finos de detalle (divisiones de cajones y cajoncitos de organizadores), permitiendo a los técnicos encontrar rápidamente dónde se encuentra cada pieza físicamente.

Este epic transforma el inventario abstracto en un mapa físico navegable, conectando cada repuesto y componente con su ubicación exacta en el espacio físico del taller.

## Objectives and Scope

### In Scope
- Implementar jerarquía completa de almacenamiento: Ubicación → Estantería/Armario → Cajón → División → Organizador → Cajoncito
- Crear interfaces de gestión para cada nivel jerárquico con validaciones específicas
- Desarrollar navegación visual por ubicaciones con breadcrumbs y contexto
- Implementar sistema de asociación inventario-almacenamiento con soporte para múltiples ubicaciones por item
- Crear interfaces de gestión de organizadores y compartimientos para componentes pequeños
- Proporcionar visualización jerárquica del almacenamiento con indicadores de contenido

### Out of Scope
- Sistema de búsqueda de repuestos (Epic 4)
- Actualización automática de stock por transacciones (Epic 5)
- Generación de reportes de inventario (Epic 5)
- Sistema de impresión de etiquetas para ubicaciones (Epic 5)
- Integración con equipos SAP para referencia cruzada (parte de Epic 2)

## System Architecture Alignment

El Epic 3 se alinea perfectamente con la arquitectura Next.js 14 + Prisma + SQLite establecida:

**Componentes de Arquitectura:**
- **Modelos de Datos Prisma**: Implementa modelos jerárquicos (Ubicacion → Estanteria/Armario → Cajon → Division → Organizador → Cajoncito) con relaciones polimórficas para asociación de inventario
- **API Routes**: Endpoints RESTful en `/api/ubicaciones/` con rutas anidadas para gestión jerárquica
- **Componentes Frontend**: LocationCard, StorageTree, y componentes específicos para cada nivel jerárquico
- **State Management**: React Query para caché de estructura jerárquica y actualizaciones optimistas

**Alineación con Patrones UX:**
- **Navegación Geográfica**: Implementa LocationCard components con diseño Ternium Classic
- **Breadcrumbs**: Navegación jerárquica con contexto visual
- **Responsive Design**: Adaptación de navegación jerárquica para mobile/tablet/desktop

**Integración con Epics Previos:**
- **Epic 1**: Utiliza infraestructura de autenticación y API structure establecidas
- **Epic 2**: Se integra con modelos de Repuestos, Componentes, y Equipos para asociaciones
- Base de datos SQLite local para operación autónoma sin dependencias corporativas

## Detailed Design

### Services and Modules

**Módulos de Backend (src/app/api/ubicaciones/):**

| Módulo | Responsabilidades | Entradas/Salidas | Owner |
|--------|------------------|------------------|-------|
| **locations.service.ts** | Gestión CRUD de ubicaciones principales | GET/POST/PUT/DELETE ubicaciones | Story 3.1 |
| **storage-units.service.ts** | Gestión de estanterías y armarios | Operaciones jerárquicas con validaciones | Story 3.1 |
| **drawers.service.ts** | Gestión de cajones y divisiones | Numeración automática, relaciones anidadas | Story 3.2 |
| **organizers.service.ts** | Gestión de organizadores y cajoncitos | Grid systems, asignación de componentes | Story 3.3 |
| **associations.service.ts** | Asociación inventario-almacenamiento | Mapeo many-to-many con cantidades | Story 3.4 |

**Componentes Frontend (src/components/ubicaciones/):**

| Componente | Responsabilidades | Estado/Props | Integración |
|------------|------------------|--------------|-------------|
| **LocationCard.tsx** | Visual representation de ubicaciones físicas | hover states, stock counts | Story 3.1 |
| **StorageTree.tsx** | Navegación jerárquica expandible | tree data, selected node | Story 3.1 |
| **DrawerGrid.tsx** | Grid visual de cajones y divisiones | drawer layout, division indicators | Story 3.2 |
| **OrganizerGrid.tsx** | Grid de organizadores con cajoncitos | organizer matrix, component assignment | Story 3.3 |
| **AssociationPanel.tsx** | Panel de asociación inventario-ubicación | item selection, location picker | Story 3.4 |

### Data Models and Contracts

**Modelos Prisma para Jerarquía de Almacenamiento:**

```prisma
// Ubicación principal (Aceria, Masi, Reducción, etc.)
model Ubicacion {
  id          Int       @id @default(autoincrement())
  nombre      String    @unique
  estanterias Estanteria[]
  armarios    Armario[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Estantería con estantes y cajones
model Estanteria {
  id           Int         @id @default(autoincrement())
  nombre       String
  ubicacionId  Int
  ubicacion    Ubicacion   @relation(fields: [ubicacionId], references: [id])
  cajones      Cajon[]
  estantes     Estante[]
  organizadores Organizador[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

// Armario con cajones y organizadores
model Armario {
  id           Int         @id @default(autoincrement())
  nombre       String
  ubicacionId  Int
  ubicacion    Ubicacion   @relation(fields: [ubicacionId], references: [id])
  cajones      Cajon[]
  organizadores Organizador[]
  repuestos    RepuestoUbicacion[] // Direct storage
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

// Cajón (pertenece a estantería o armario)
model Cajon {
  id           Int         @id @default(autoincrement())
  numero       Int
  estanteriaId Int?
  estanteria   Estanteria? @relation(fields: [estanteriaId], references: [id])
  armarioId    Int?
  armario      Armario?    @relation(fields: [armarioId], references: [id])
  divisiones   Division[]
  repuestos    RepuestoUbicacion[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

// División dentro de un cajón
model Division {
  id       Int     @id @default(autoincrement())
  numero   Int
  cajonId  Int
  cajon    Cajon   @relation(fields: [cajonId], references: [id])
  repuestos RepuestoUbicacion[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Organizador con cajoncitos
model Organizador {
  id           Int          @id @default(autoincrement())
  nombre       String
  estanteriaId Int?
  estanteria   Estanteria?  @relation(fields: [estanteriaId], references: [id])
  armarioId    Int?
  armario      Armario?     @relation(fields: [armarioId], references: [id])
  cajoncitos   Cajoncito[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}

// Cajoncito (compartimiento pequeño para componentes)
model Cajoncito {
  id           Int                    @id @default(autoincrement())
  numero       Int
  organizadorId Int
  organizador  Organizador             @relation(fields: [organizadorId], references: [id])
  repuestos    RepuestoUbicacion[]
  componentes  ComponenteUbicacion[]
  createdAt    DateTime                @default(now())
  updatedAt    DateTime                @updatedAt
}
```

**Tablas de Asociación Many-to-Many:**

```prisma
// Asociación de Repuestos a Ubicaciones (polimórfica)
model RepuestoUbicacion {
  id          Int       @id @default(autoincrement())
  repuestoId  Int
  repuesto    Repuesto  @relation(fields: [repuestoId], references: [id])
  cantidad    Int       @default(1)

  // Relación polimórfica a ubicaciones (solo un campo no nulo)
  armarioId   Int?
  armario     Armario?  @relation(fields: [armarioId], references: [id])
  estanteId   Int?
  estante     Estante?  @relation(fields: [estanteId], references: [id])
  cajonId     Int?
  cajon       Cajon?    @relation(fields: [cajonId], references: [id])
  divisionId  Int?
  division    Division? @relation(fields: [divisionId], references: [id])
  cajoncitoId Int?
  cajoncito   Cajoncito? @relation(fields: [cajoncitoId], references: [id])

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Asociación de Componentes a Cajoncitos
model ComponenteUbicacion {
  id           Int         @id @default(autoincrement())
  componenteId Int
  componente   Componente  @relation(fields: [componenteId], references: [id])
  cantidad     Int         @default(1)
  cajoncitoId  Int
  cajoncito    Cajoncito   @relation(fields: [cajoncitoId], references: [id])
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}
```

### APIs and Interfaces

**API Routes Structure:**

```typescript
// Gestión de Ubicaciones Principales
GET    /api/ubicaciones                 // List all locations
POST   /api/ubicaciones                 // Create new location
GET    /api/ubicaciones/[id]            // Get location details
PUT    /api/ubicaciones/[id]            // Update location
DELETE /api/ubicaciones/[id]            // Delete location

// Gestión de Unidades de Almacenamiento
GET    /api/ubicaciones/[id]/estanterias // List estanterías in location
POST   /api/ubicaciones/[id]/estanterias // Create estantería
GET    /api/ubicaciones/[id]/armarios    // List armarios in location
POST   /api/ubicaciones/[id]/armarios    // Create armario

// Gestión de Cajones y Divisiones
GET    /api/estanterias/[id]/cajones     // List cajones in estantería
POST   /api/estanterias/[id]/cajones     // Create cajón
GET    /api/armarios/[id]/cajones        // List cajones in armario
POST   /api/armarios/[id]/cajones        // Create cajón
GET    /api/cajones/[id]/divisiones      // List divisiones in cajón
POST   /api/cajones/[id]/divisiones      // Create división

// Gestión de Organizadores
GET    /api/estanterias/[id]/organizadores // List organizadores
POST   /api/estanterias/[id]/organizadores // Create organizador
GET    /api/armarios/[id]/organizadores    // List organizadores
POST   /api/armarios/[id]/organizadores    // Create organizador
GET    /api/organizadores/[id]/cajoncitos  // List cajoncitos
POST   /api/organizadores/[id]/cajoncitos  // Create cajoncito

// Asociación Inventario-Almacenamiento
GET    /api/repuestos/[id]/ubicaciones    // Get locations for repuesto
POST   /api/repuestos/[id]/ubicaciones    // Add repuesto to location
PUT    /api/repuestos/[id]/ubicaciones/[assocId] // Update quantity
DELETE /api/repuestos/[id]/ubicaciones/[assocId] // Remove association

GET    /api/componentes/[id]/ubicaciones   // Get cajoncitos for componente
POST   /api/componentes/[id]/ubicaciones   // Add componente to cajoncito
PUT    /api/componentes/[id]/ubicaciones/[assocId] // Update quantity
DELETE /api/componentes/[id]/ubicaciones/[assocId] // Remove association

// Navegación Jerárquica
GET    /api/navigation/tree              // Get complete storage tree
GET    /api/navigation/path/[locationId]  // Get breadcrumb path
GET    /api/navigation/contents/[nodeId]  // Get contents at any level
```

**Request/Response Contracts:**

```typescript
// Create Storage Unit Request
interface CreateEstanteriaRequest {
  nombre: string;
  ubicacionId: number;
}

interface CreateCajonRequest {
  numero: number;
  estanteriaId?: number;
  armarioId?: number;
}

interface CreateDivisionRequest {
  numero: number;
  cajonId: number;
}

// Association Requests
interface RepuestoUbicacionRequest {
  repuestoId: number;
  cantidad: number;
  // Polymorphic location (solo uno)
  armarioId?: number;
  estanteId?: number;
  cajonId?: number;
  divisionId?: number;
  cajoncitoId?: number;
}

// Navigation Response
interface NavigationNode {
  id: number;
  nombre: string;
  tipo: 'ubicacion' | 'estanteria' | 'armario' | 'cajon' | 'division' | 'organizador' | 'cajoncito';
  children?: NavigationNode[];
  contents: {
    repuestosCount: number;
    componentesCount: number;
  };
  path: string[];
}

// Location Contents Response
interface LocationContents {
  node: NavigationNode;
  repuestos: RepuestoUbicacion[];
  componentes: ComponenteUbicacion[];
  childNodes: NavigationNode[];
  availableActions: string[];
}
```

### Workflows and Sequencing

**Workflow 1: Creación Jerarquía de Almacenamiento**

1. **Usuario** accede a sección "Ubicaciones"
2. **Sistema** muestra lista de ubicaciones principales existentes
3. **Usuario** crea nueva ubicación con nombre único
4. **Usuario** navega a ubicación → crea estanterías/armarios
5. **Usuario** navega a estantería/armario → crea cajones numerados automáticamente
6. **Usuario** opcionalmente crea divisiones dentro de cajones
7. **Usuario** opcionalmente crea organizadores con cajoncitos numerados

**Workflow 2: Asociación Inventario-Ubicación**

1. **Usuario** busca repuesto/componente existente
2. **Usuario** selecciona "Asignar a ubicación"
3. **Sistema** muestra navegación jerárquica de almacenamiento
4. **Usuario** navega hasta ubicación específica
5. **Usuario** especifica cantidad en esa ubicación
6. **Sistema** valida tipo de almacenamiento adecuado (componentes → cajoncitos)
7. **Sistema** crea asociación many-to-many con cantidad
8. **Sistema** actualiza stock calculado del item

**Workflow 3: Navegación Visual de Almacenamiento**

1. **Usuario** accede a "Ubicaciones" → ve cards de ubicaciones principales
2. **Usuario** click en ubicación → ve cards de estanterías/armarios
3. **Usuario** click en unidad → vista de cajones/organizadores
4. **Usuario** click en cajón → vista de divisiones o contenidos directos
5. **Usuario** click en organizador → grid de cajoncitos con contenidos
6. **Sistema** mantiene breadcrumbs para navegación fácil
7. **Sistema** muestra indicadores visuales de contenido en cada nivel

**Secuencia de Actualización de Asociaciones:**

```
Frontend AssociationPanel → API POST /api/repuestos/[id]/ubicaciones
→ Service Layer validation → Prisma Transaction → Database Update
→ React Query Cache Invalidation → UI Update
```

## Non-Functional Requirements

### Performance

**Búsqueda y Navegación Jerárquica:**
- **Carga de estructura jerárquica**: < 1 segundo para cualquier nivel de profundidad
- **Navegación entre niveles**: < 500ms entre clicks en navegación
- **Expansión/contracción de árboles**: < 300ms para animaciones visuales
- **Carga de contenidos de ubicación**: < 2 segundos para ubicaciones con 100+ items

**Asociación Inventario-Ubicación:**
- **Creación de asociaciones**: < 1 segundo para asociación individual
- **Actualización de cantidades**: < 500ms con feedback inmediato
- **Cálculo de stock distribuido**: < 2 segundos para items con 10+ ubicaciones
- **Batch operations**: < 5 segundos para operaciones masivas de 50+ asociaciones

**Optimizaciones Específicas:**
- **Índices de base de datos**: En campos de jerarquía (ubicacionId, estanteriaId, etc.)
- **Caching React Query**: 5 minutos para estructura jerárquica, 2 minutos para contenidos
- **Lazy loading**: Carga progresiva de niveles jerárquicos profundos
- **Virtual scrolling**: Para listas largas de cajoncitos o divisiones

### Security

**Control de Acceso y Autenticación:**
- **Autenticación requerida**: Todas las operaciones de gestión de ubicaciones requieren login
- **Autorización uniforme**: Todos los técnicos tienen permisos completos de gestión (modelo departamental)
- **Validación de inputs**: Zod schemas para todos los datos de entrada
- **Protección contra inyección SQL**: Prisma ORM con consultas parametrizadas

**Validaciones de Negocio:**
- **Unicidad de nombres**: Validación de nombres únicos por nivel jerárquico
- **Integridad referencial**: No permitir eliminación de ubicaciones con contenido asociado
- **Validaciones de cantidades**: Cantidades positivas, límites razonables
- **Validaciones de estructura**: Prevenir ciclos en jerarquía de almacenamiento

**Protección de Datos:**
- **Operaciones locales**: Todos los datos permanecen en base de datos SQLite local
- **Logs de auditoría**: Registro de todas las modificaciones de estructura y asociaciones
- **Backups incluidos**: Estructura jerárquica incluida en backups automáticos

### Reliability/Availability

**Disponibilidad del Sistema:**
- **Operación offline**: 100% funcionalidad sin conexión a internet
- **Recuperación de datos**: Restauración completa desde backup en < 10 minutos
- **Consistencia de datos**: Transacciones ACID para todas las operaciones de asociación
- **Resiliencia a errores**: Manejo robusto de errores con mensajes claros para usuarios

**Manejo de Escenarios Edge:**
- **Eliminación con contenido**: Confirmación obligatoria y migración de contenidos
- **Reorganización de jerarquía**: Actualización automática de todas las asociaciones afectadas
- **Importación masiva**: Validación y rollback en caso de errores parciales
- **Concurrencia**: Manejo de múltiples usuarios modificando ubicaciones simultáneamente

**Backup y Recuperación:**
- **Backup incremental**: Cada 30 minutos para cambios en estructura jerárquica
- **Backup completo**: Diario para toda la base de datos incluyendo jerarquía
- **Retención**: 30 días de historial de cambios en estructura de almacenamiento
- **Validación de backups**: Verificación semanal de integridad de backups

### Observability

**Logging y Monitoreo:**
- **Operaciones de gestión**: Log de todas las CRUD operations en ubicaciones
- **Asociaciones modificadas**: Log completo de cambios en asociaciones inventario-ubicación
- **Errores de validación**: Log detallado de fallos con contexto del usuario
- **Rendimiento de queries**: Log de operaciones > 2 segundos para optimización

**Métricas de Uso:**
- **Navegación jerárquica**: Conteo de accesos por nivel y ubicación
- **Operaciones de asociación**: Frecuencia de asignaciones por tipo de almacenamiento
- **Tiempo de navegación**: Métricas de tiempo entre niveles jerárquicos
- **Uso de organizadores**: Estadísticas de utilización de cajoncitos vs almacenamiento directo

**Alertas y Notificaciones:**
- **Errores de integridad**: Alerta inmediata por detección de inconsistencias en jerarquía
- **Operaciones fallidas**: Notificación de operaciones CRUD fallidas con contexto
- **Rendimiento degradado**: Alerta si operaciones exceden tiempos umbral
- **Backup verification**: Alerta si falla verificación de backups de estructura

**Dashboard de Administración:**
- **Estado de jerarquía**: Resumen visual de estructura completa de almacenamiento
- **Métricas de uso**: Estadísticas de utilización por tipo de almacenamiento
- **Audit trail**: Timeline de cambios recientes en estructura y asociaciones
- **Performance metrics**: Dashboard de rendimiento de operaciones críticas

## Dependencies and Integrations

### Internal Dependencies (Epic Dependencies)

**Dependencias Críticas de Epics Previos:**
- **Epic 1 - Foundation**: Infraestructura Next.js 14, autenticación NextAuth.js, estructura API base
- **Epic 2 - Core Inventory**: Modelos de datos de Repuestos, Componentes, y Equipos para asociaciones

**Integraciones con Epics Posteriores:**
- **Epic 4 - Search**: Estructura jerárquica como filtro de búsqueda y contexto de resultados
- **Epic 5 - Stock Management**: Ubicaciones para transacciones de stock y reportes por ubicación

### Technology Dependencies

**Backend Dependencies:**
```json
{
  "prisma": "^5.14.0", // ORM para relaciones jerárquicas complejas
  "@prisma/client": "^5.14.0", // Type-safe database access
  "next-auth": "^4.24.0", // Autenticación para protección de rutas
  "@auth/prisma-adapter": "^4.24.0", // Session management
  "zod": "^3.22.0", // Validación de inputs de jerarquía
  "react-hook-form": "^7.48.0", // Forms para gestión de ubicaciones
  "@hookform/resolvers": "^3.3.0", // Zod integration
  "@tanstack/react-query": "^5.0.0" // Caching para estructura jerárquica
}
```

**Frontend Dependencies:**
```json
{
  "@radix-ui/react-dialog": "^1.0.0", // Modals para creación/edición
  "@radix-ui/react-tabs": "^1.0.0", // Navegación por tipos de almacenamiento
  "@radix-ui/react-dropdown-menu": "^2.0.0", // Menús contextuales
  "class-variance-authority": "^0.7.0", // Component variants
  "clsx": "^2.0.0", // Utility classes
  "tailwind-merge": "^2.0.0", // Class merging
  "lucide-react": "^0.292.0" // Iconos para navegación jerárquica
}
```

**Database Dependencies:**
- **SQLite 3.45+**: Base de datos local para operación autónoma
- **FTS5 Extension**: Para búsqueda de contenido por ubicación
- **Foreign Key Constraints**: Para integridad referencial en jerarquía

### External Integrations

**Integraciones Opcionales (Futuras):**
- **SAP Integration**: Sincronización de ubicaciones con sistema corporativo (Post-MVP)
- **Barcode Scanners**: API para escaneo de códigos en ubicaciones físicas
- **Label Printers**: Integración para impresión de etiquetas de ubicación

**No Dependencies Externas Requeridas:**
- Operación 100% offline sin dependencias de internet
- No requiere APIs externas para funcionalidad core
- Base de datos auto-contenida en archivo local

### Integration Patterns

**Pattern 1: Hierarchical Data Loading**
```
Frontend Component → React Query Cache → API Route → Prisma Service → SQLite
       ↓                ↓                    ↓           ↓            ↓
Location Cards → Cached Tree Data → /api/navigation/tree → Recursive Query → Hierarchical Models
```

**Pattern 2: Association Management**
```
Association Panel → Form Validation → API POST → Transaction → Multiple Table Updates
       ↓               ↓                ↓           ↓                 ↓
Item + Location Selection → Zod Schema → /api/associations → Prisma Transaction → RepuestoUbicacion + Stock Update
```

**Pattern 3: Real-time Updates**
```
User Action → Optimistic Update → API Call → Database Update → Cache Invalidation → UI Refresh
```

### Data Flow Dependencies

**Flujo de Datos de Jerarquía:**
1. **Load**: Componente solicita estructura → React Query cache → API route → Prisma recursive query
2. **Navigate**: Click en nodo → Update selected state → Load children → Update breadcrumbs
3. **Create**: Form submit → Validation → API POST → Database insert → Cache update → UI refresh

**Flujo de Asociaciones:**
1. **Select**: Item picker + location picker → Form validation → Association request
2. **Validate**: Check location type compatibility → Validate quantities → Check for duplicates
3. **Persist**: Transaction create association → Update calculated stock → Invalidate related caches

### API Integration Points

**Endpoints Required by Epic 3:**
- `/api/ubicaciones/*` - CRUD de jerarquía de almacenamiento
- `/api/navigation/*` - Estructura jerárquica para navegación
- `/api/repuestos/[id]/ubicaciones` - Asociación repuestos-ubicaciones
- `/api/componentes/[id]/ubicaciones` - Asociación componentes-cajoncitos

**Integration con APIs Existentes:**
- `/api/repuestos/*` - Para asociación de repuestos existentes
- `/api/componentes/*` - Para asociación de componentes existentes
- `/api/auth/session` - Para protección de rutas de gestión

### State Management Integration

**React Query Configuration:**
```typescript
// Queries para jerarquía
useQuery(['ubicaciones'], fetchUbicaciones)
useQuery(['navigation-tree'], fetchNavigationTree)
useQuery(['location-contents', nodeId], fetchLocationContents)

// Queries para asociaciones
useQuery(['repuesto-ubicaciones', repuestoId], fetchRepuestoUbicaciones)
useQuery(['componente-ubicaciones', componenteId], fetchComponenteUbicaciones)

// Mutations para operaciones
useMutation(createUbicacion, { onSuccess: invalidateUbicacionesQueries })
useMutation(createAssociation, { onSuccess: invalidateAssociationQueries })
```

**Local State Management:**
- **selectedLocation**: Node actual en navegación jerárquica
- **breadcrumbPath**: Ruta de navegación actual
- **associationMode**: Modo de asociación activo/inactivo
- **expandedNodes**: Nodos expandidos en tree view

## Acceptance Criteria (Authoritative)

### AC-3.1: Locations and Storage Units Management (Story 3.1)

**Given** soy un técnico de mantenimiento
**When** accedo a la interfaz de gestión de ubicaciones
**Then** puedo crear y gestionar la estructura jerárquica completa de almacenamiento

**And** puedo crear:
- Ubicaciones principales (Aceria, Masi, Reducción, etc.) con nombres únicos
- Estanterías dentro de ubicaciones con nombres alfanuméricos
- Armarios dentro de ubicaciones con nombres alfanuméricos

**And** cada unidad de almacenamiento incluye:
- Nombre alfanumérico único por nivel
- Asociación con ubicación padre
- Soporte para cajones (estanterías y armarios)
- Soporte para organizadores (estanterías y armarios)
- Soporte para estantes (solo estanterías)
- Soporte para repuestos directos (solo armarios)

**And** puedo navegar visualmente la jerarquía con:
- Cards clickeables para cada nivel
- Indicadores visuales de contenido
- Breadcrumb navigation
- Expand/collapse functionality

### AC-3.2: Drawers and Divisions System (Story 3.2)

**Given** tengo unidades de almacenamiento creadas (estanterías/armarios)
**When** gestiono cajones y divisiones internas
**Then** puedo crear la estructura completa de organización interna

**And** cada cajón incluye:
- Número correlativo automático (cajón 1, cajón 2, etc.)
- Asociación a estantería o armario padre
- Soporte para divisiones (0 a muchas)
- Soporte para repuestos sueltos (0 a muchos)

**And** cada división incluye:
- Número correlativo automático (desde 1)
- Asociación a cajón padre
- Soporte para múltiples repuestos

**And** el sistema permite:
- Crear cajones simples sin divisiones
- Agregar divisiones a cajones existentes
- Asignar repuestos a nivel de cajón o división
- Visualizar layout de cajones y divisiones

### AC-3.3: Organizers and Compartments System (Story 3.3)

**Given** necesito organizar componentes pequeños (resistencias, capacitores, etc.)
**When** utilizo el sistema de organizadores
**Then** puedo crear y gestionar organizadores con compartimientos

**And** cada organizador incluye:
- Nombre único alfanumérico
- Asociación a estantería o armario padre
- Cajoncitos numerados correlativamente

**And** cada cajoncito puede contener:
- Múltiples repuestos (pequeños)
- Múltiples componentes (principalmente)
- Mezcla de diferentes componentes pequeños

**And** la interfaz proporciona:
- Grid visual de organizador con cajoncitos
- Asignación fácil de componentes a compartimientos
- Identificación rápida de contenidos por cajoncito
- Búsqueda dentro de contenidos de organizador

### AC-3.4: Inventory-Storage Association Management (Story 3.4)

**Given** tengo items de inventario y ubicaciones de almacenamiento creadas
**When** gestiono asociaciones inventario-almacenamiento
**Then** puedo asignar cualquier repuesto o componente a múltiples ubicaciones

**And** el sistema de asociaciones incluye:
- Soporte para múltiples ubicaciones por item
- Seguimiento de cantidad por ubicación
- Indicadores visuales de items en cada ubicación
- Operaciones fáciles de agregar/eliminar asociaciones

**And** puedo:
- Ver qué items están almacenados en cada ubicación
- Actualizar cantidades en ubicaciones específicas
- Mover items entre ubicaciones
- Ver cálculo automático de stock total across locations

**And** las validaciones incluyen:
- Componentes solo pueden asignarse a cajoncitos
- Repuestos pueden asignarse a cualquier tipo de almacenamiento
- Cantidades deben ser positivas
- No permite duplicados en misma ubicación

### AC-3.5: Hierarchical Navigation and Visual Management

**Given** necesito navegar el sistema de almacenamiento
**When** exploro las ubicaciones físicas digitalmente
**Then** puedo navegar la jerarquía completa con experiencia intuitiva

**And** la navegación incluye:
- Vista de cards por ubicación con resumen de contenidos
- Información de armarios/estanterías con conteos de items
- Navegación jerárquica fluida: ubicación → unidad → cajón → división → cajoncito
- Quick actions para agregar items desde cualquier nivel

**And** los indicadores visuales muestran:
- Cantidad de items en cada nivel
- Tipo de contenido (repuestos vs componentes)
- Capacidad utilizada vs disponible
- Items con stock bajo o agotado

### AC-3.6: Data Integrity and Validation

**Given** gestiono la estructura de almacenamiento
**When** realizo operaciones de modificación
**Then** el sistema mantiene integridad de datos completa

**And** las validaciones incluyen:
- Nombres únicos por nivel jerárquico
- No permitir eliminación de ubicaciones con contenido
- Integridad referencial en todas las relaciones
- Validación de cantidades positivas

**And** el sistema proporciona:
- Confirmación para operaciones destructivas
- Opciones de migración de contenidos al reorganizar
- Logs de auditoría para todos los cambios
- Rollback automático en caso de errores

## Traceability Mapping

| AC ID | Acceptance Criteria | Spec Section | Component/API | Test Idea |
|-------|-------------------|--------------|---------------|-----------|
| AC-3.1.1 | Crear ubicaciones principales con nombres únicos | Data Models | Ubicacion API | POST /api/ubicaciones + validación unique |
| AC-3.1.2 | Crear estanterías y armarios dentro de ubicaciones | Data Models | Storage Units API | POST /api/ubicaciones/[id]/estanterias |
| AC-3.1.3 | Navegación visual con cards y breadcrumbs | APIs & Interfaces | LocationCard + StorageTree | Click navigation test + breadcrumb accuracy |
| AC-3.2.1 | Crear cajones numerados automáticamente | Data Models | Drawers API | POST /api/estanterias/[id]/cajones + auto-numbering |
| AC-3.2.2 | Crear divisiones dentro de cajones | Data Models | Divisions API | POST /api/cajones/[id]/divisiones |
| AC-3.2.3 | Asignar repuestos a cajón o división | Workflows | AssociationPanel | Test assignment at both levels |
| AC-3.3.1 | Crear organizadores con cajoncitos numerados | Data Models | Organizers API | POST /api/estanterias/[id]/organizadores |
| AC-3.3.2 | Grid visual de organizadores con contenidos | APIs & Interfaces | OrganizerGrid | Visual grid test + content display |
| AC-3.3.3 | Asignar componentes a cajoncitos | Workflows | ComponenteUbicacion API | POST component to cajoncito test |
| AC-3.4.1 | Asociar items a múltiples ubicaciones | Data Models | RepuestoUbicacion API | Multiple location association test |
| AC-3.4.2 | Actualizar cantidades por ubicación | Workflows | AssociationPanel PUT | Quantity update with stock recalculation |
| AC-3.4.3 | Validar compatibilidad tipo item-ubicación | APIs & Interfaces | Association validation | Component only to cajoncito validation |
| AC-3.5.1 | Navegación jerárquica fluida | Workflows | Navigation API | Full hierarchy navigation test |
| AC-3.5.2 | Indicadores visuales de contenido | APIs & Interfaces | LocationCard content indicators | Visual indicators accuracy test |
| AC-3.6.1 | Validaciones de integridad referencial | Security | API validation middleware | Delete with content test |
| AC-3.6.2 | Logs de auditoría de cambios | Observability | Logging service | Change tracking verification |
| AC-3.6.3 | Confirmación para operaciones destructivas | APIs & Interfaces | Confirmation modals | Destructive operation confirmation test |

**Traceability to PRD Requirements:**

| PRD FR | AC Coverage | Implementation |
|--------|-------------|----------------|
| FR-4: Gestión de Ubicaciones | AC-3.1.1, AC-3.1.2 | Ubicacion model + CRUD API |
| FR-5: Gestión de Estanterías | AC-3.1.2, AC-3.1.3 | Estanteria model + parent-child API |
| FR-6: Gestión de Armarios | AC-3.1.2, AC-3.1.3 | Armario model + parent-child API |
| FR-7: Gestión de Cajones | AC-3.2.1, AC-3.2.2 | Cajon + Division models |
| FR-8: Gestión de Organizadores | AC-3.3.1, AC-3.3.2 | Organizador + Cajoncito models |
| FR-10: Navegación por Ubicaciones | AC-3.5.1, AC-3.5.2 | Navigation API + UI components |

**Component-Level Traceability:**

| Story | Components | APIs | Data Models |
|-------|------------|------|-------------|
| 3.1 | LocationCard, StorageTree | /api/ubicaciones/* | Ubicacion, Estanteria, Armario |
| 3.2 | DrawerGrid, DivisionPanel | /api/cajones/*, /api/divisiones/* | Cajon, Division |
| 3.3 | OrganizerGrid, CajoncitoGrid | /api/organizadores/*, /api/cajoncitos/* | Organizador, Cajoncito |
| 3.4 | AssociationPanel, LocationPicker | /api/associations/* | RepuestoUbicacion, ComponenteUbicacion |

## Risks, Assumptions, Open Questions

### Risks

**Risk 1: Complejidad de Modelo de Datos Polimórfico**
- **Descripción**: La relación polimórfica de RepuestoUbicacion con múltiples foreign keys puede introducir complejidad en queries y validaciones
- **Impacto**: Alto - Podría afectar performance y dificultad de debugging
- **Mitigación**: Implementar Prisma models con indexes apropiados, crear helper functions para validaciones, exhaustivo testing de edge cases

**Risk 2: Performance en Jerarquías Profundas**
- **Descripción**: Queries recursivas para cargar árboles jerárquicos profundos podrían degradar performance
- **Impacto**: Medio - Afectaría experiencia de usuario en navegación
- **Mitigación**: Implementar lazy loading, caching agresivo con React Query, paginación virtual, índices optimizados

**Risk 3: Consistencia de Datos en Asociaciones Many-to-Many**
- **Descripción**: Mantener sincronización entre stock calculado y asociaciones de ubicación podría generar inconsistencias
- **Impacto**: Alto - Datos incorrectos afectarían operaciones críticas
- **Mitigación**: Usar Prisma transactions para operaciones atómicas, implementar recálculo automático, audits periódicos

**Risk 4: Complejidad de UI para Navegación Jerárquica**
- **Descripción**: La navegación por múltiples niveles podría confundir usuarios técnicos no familiarizados con interfaces complejas
- **Impacto**: Medio - Podría reducir adopción del sistema
- **Mitigación**: UX testing con usuarios reales, diseño intuitivo con breadcrumbs claros, tutorial integrado

### Assumptions

**Assumption 1: Estructura Física Conocida**
- **Assumption**: Los técnicos conocen y comprenden la estructura física actual del almacenamiento
- **Validation**: Realizar walkthrough físico con técnicos, validar que modelo jerárquico refleja realidad
- **Risk if wrong**: Modelo digital no mapea correctamente a almacenamiento físico

**Assumption 2: Nomenclatura Consistente**
- **Assumption**: Existe nomenclatura consistente para ubicaciones (Aceria, Masi, etc.)
- **Validation**: Revisar documentación existente, entrevistar a técnicos sobre naming conventions
- **Risk if wrong**: Datos inconsistentes o duplicados en sistema

**Assumption 3: Volúmenes Manejables**
- **Assumption**: Volumen de items por ubicación es manejable para UI sin necesidad de paginación compleja
- **Validation**: Analizar datos actuales si existen, hacer estimaciones con técnicos
- **Risk if wrong**: Performance issues y UX degradada

**Assumption 4: Disponibilidad de Datos Iniciales**
- **Assumption**: Los datos actuales de almacenamiento pueden ser extraídos o migrados
- **Validation**: Evaluar disponibilidad de datos existentes, planear proceso de migración
- **Risk if wrong**: Trabajo manual extenso para configurar estructura inicial

### Open Questions

**Question 1: Numeración Automática vs Manual**
- **Pregunta**: ¿La numeración de cajones y divisiones debe ser completamente automática o permitir override manual?
- **Impact**: Afecta UX y lógica de numeración
- **Next Step**: Consultar con técnicos sobre preferencias y casos de uso especiales

**Question 2: Soporte para Múltiples Tipos de Organizadores**
- **Pregunta**: ¿Necesitamos soporte para diferentes tipos de organizadores (tamaños estandarizados vs personalizados)?
- **Impact**: Afecta modelo de datos y UI de gestión
- **Next Step**: Investigar tipos de organizadores físicos utilizados actualmente

**Question 3: Integración con Sistema de Referencia Existente**
- **Pregunta**: ¿Cómo se integra la jerarquía digital con posibles referencias o códigos existentes en papel?
- **Impact**: Podría requerir campos adicionales o mapping systems
- **Next Step**: Explorar sistemas de referencia actuales con técnicos

**Question 4: Migración de Datos Históricos**
- **Pregunta**: ¿Qué información histórica sobre ubicaciones necesita ser preservada y cómo se migrará?
- **Impact**: Afecta data modeling y proceso de onboarding
- **Next Step**: Evaluar datos históricos disponibles y requerimientos de conservación

## Test Strategy Summary

### Test Levels and Frameworks

**Unit Testing (Jest + Testing Library)**
- **Service Layer**: Testing de lógica de negocio para gestión jerárquica
- **API Endpoints**: Testing de routes de ubicaciones con mock database
- **Utility Functions**: Testing de helpers para navegación y validación
- **Component Logic**: Testing de state management y event handlers

**Integration Testing (Jest + Prisma Test Suite)**
- **Database Operations**: Testing de models Prisma con relaciones complejas
- **API Integration**: Testing completo de endpoints con database real de prueba
- **Association Logic**: Testing de operaciones many-to-many con transacciones
- **Hierarchy Operations**: Testing de operaciones CRUD en estructura jerárquica

**End-to-End Testing (Playwright)**
- **User Workflows**: Testing completo de flujos críticos de usuario
- **Navigation Testing**: Testing de navegación jerárquica completa
- **Association Workflows**: Testing de asignación inventario-ubicación
- **Cross-browser Testing**: Validación en navegadores utilizados por técnicos

### Test Coverage Areas

**Functional Coverage (90%+ target)**
- CRUD operations para todos los niveles jerárquicos
- Navigation flows y breadcrumb accuracy
- Association operations con validaciones
- Visual indicators y content display
- Error handling y edge cases

**Performance Testing**
- Load testing para estructura jerárquica con 1000+ nodos
- Navigation timing (< 1 segundo entre niveles)
- Association operations timing (< 2 segundos)
- Memory usage en navegación profunda

**Usability Testing**
- User testing con técnicos reales
- Navigation intuitividad测试
- Content discovery efficiency
- Error message clarity and helpfulness

**Security Testing**
- Input validation en todos los endpoints
- SQL injection prevention testing
- Authentication/authorization testing
- Data integrity testing under concurrent load

### Test Data Strategy

**Master Test Data Set**
- Estructura jerárquica completa representativa (3 ubicaciones × 4 estanterías × 5 cajones × 2 divisiones)
- 500+ repuestos y componentes con asociaciones variadas
- Escenarios edge (ubicaciones vacías, items con múltiples ubicaciones, etc.)

**Data Variants for Edge Cases**
- Estructuras jerárquicas muy profundas (6+ niveles)
- Items con 10+ ubicaciones asociadas
- Operaciones concurrentes en mismos datos
- Large datasets para performance testing

### Automated Testing Pipeline

**Continuous Integration**
- Unit tests en cada PR (required)
- Integration tests en cada PR (required)
- E2E tests en staging antes de producción
- Performance regression tests weekly

**Test Environment Setup**
- SQLite database con seed data consistente
- Mock services para external dependencies
- Browser matrix: Chrome, Firefox, Edge (Windows)
- Mobile testing en tablets técnicas

**Quality Gates**
- 90%+ code coverage requirement
- All critical path tests must pass
- Performance benchmarks must meet targets
- Security scans must pass

### User Acceptance Testing

**UAT Scenarios**
- Técnicos reales realizan tareas diarias simuladas
- Navigation speed tests vs método actual
- Data accuracy validation
- Error recovery testing

**Success Criteria**
- Tiempo de localización de items reducido en 80%
- 100% de usuarios puede navegar estructura sin training extensivo
- Zero data loss en operaciones de asociación

## Post-Review Follow-ups

**Story 3.2: Drawers and Divisions System (2025-11-07)**

Action items from Senior Developer Review:
- **[Enhancement - Medium]** Create DrawerGrid component for visual cajón layout (AC #11) - Backend API ready, need frontend visualization
- **[Enhancement - Medium]** Create DrawerCard component with division indicators (AC #11) - Essential for user experience
- **[Enhancement - Medium]** Implement cajon visualization in existing estantería/armario views (AC #11) - Integration with current UI
- **[TechDebt - Low]** Consider structured logging for production - Improve observability
- **[Task - High]** Correct Task 7.4 status from complete to not-applicable - Clarify testing scope

Review Summary: Backend implementation excellent (91% AC coverage). Frontend visualization components needed to complete story. Backend production-ready.
- Positive user feedback scores (> 4/5)