# Story 3.3: Organizers and Compartments System

Status: ready-for-dev

## Story

As a **maintenance technician**,
I want to **manage organizadores (organizers) with their cajoncitos (small compartments)**,
So that **I can organize small components like resistors and capacitors efficiently**.

## Acceptance Criteria

1. Crear organizadores con nombre único alfanumérico
2. Asociar organizadores a estantería o armario padre
3. Crear cajoncitos numerados correlativamente (desde 1)
4. Asociar cajoncitos a organizador padre
5. Soportar múltiples repuestos por cajoncito
6. Soportar múltiples componentes por cajoncito
7. Mezclar diferentes componentes pequeños en un cajoncito
8. Proporcionar grid visual de organizador con cajoncitos
9. Asignación fácil de componentes a compartimientos
10. Identificación rápida de contenidos por cajoncito
11. Búsqueda dentro de contenidos de organizador

## Tasks / Subtasks

- [x] Task 1: Database Models Implementation (AC: 1, 2, 3, 4, 5, 6, 7)
  - [x] Subtask 1.1: Create Organizador model with unique name and parent relationships (estanteriaId OR armarioId)
  - [x] Subtask 1.2: Create Cajoncito model with sequential numbering (numero) and parent relationship (organizadorId)
  - [x] Subtask 1.3: Add foreign key constraints and indexes for performance (organizadorId, estanteriaId, armarioId)
  - [x] Subtask 1.4: Create Prisma migration for organizadores and cajoncitos tables
  - [x] Subtask 1.5: Update ComponenteUbicacion and RepuestoUbicacion models to support cajoncitoId

- [x] Task 2: Backend API - Organizadores Management (AC: 1, 2)
  - [x] Subtask 2.1: Implement /api/estanterias/[id]/organizadores endpoints (GET, POST) with auto-naming
  - [x] Subtask 2.2: Implement /api/armarios/[id]/organizadores endpoints (GET, POST) with auto-naming
  - [x] Subtask 2.3: Create validation schemas in src/lib/validations/organizador.ts with Spanish error messages
  - [x] Subtask 2.4: Add error handling for parent validation and unique name constraints
  - [x] Subtask 2.5: Implement individual organizador CRUD: /api/organizadores/[id]/route.ts

- [x] Task 3: Backend API - Cajoncitos Management (AC: 3, 4, 5, 6, 7)
   - [x] Subtask 3.1: Implement /api/organizadores/[id]/cajoncitos endpoints with sequential numbering (1, 2, 3...)
   - [x] Subtask 3.2: Add generateCajoncitoCode() function for automatic numbering within organizador
   - [x] Subtask 3.3: Implement validation for maximum cajoncitos per organizador (business rule: 50 max)
   - [x] Subtask 3.4: Add CRUD operations for cajoncito management with parent validation
   - [x] Subtask 3.5: Implement individual cajoncito CRUD: /api/cajoncitos/[id]/route.ts

- [x] Task 4: Frontend Components - Organizers Visualization (AC: 8, 10, 11)
   - [x] Subtask 4.1: Create OrganizerGrid component for visual grid layout with cajoncito cards
   - [x] Subtask 4.2: Create CajoncitoCard component with content indicators and hover tooltips
   - [x] Subtask 4.3: Implement visual distinction (colors/icons) for empty vs occupied cajoncitos
   - [x] Subtask 4.4: Add content summary indicators (repuestos count, componentes count, mixed content)
   - [x] Subtask 4.5: Create search/filter functionality within organizador contents

- [x] Task 5: Frontend Interface - Component Assignment (AC: 9)
  - [x] Subtask 5.1: Create CajoncitoAssignmentPanel component for drag-and-drop assignment
  - [x] Subtask 5.2: Implement assignment forms for repuestos and componentes to cajoncitos
  - [x] Subtask 5.3: Add visual feedback for successful assignments and quantity updates
  - [x] Subtask 5.4: Create confirmation dialogs for bulk assignment operations
  - [x] Subtask 5.5: Implement undo functionality for recent assignments

- [ ] Task 6: Integration with Storage Hierarchy (AC: 2, 4)
  - [ ] Subtask 6.1: Integrate Organizador management with existing Estanteria views (add organizadores section)
  - [ ] Subtask 6.2: Integrate Organizador management with existing Armario views (add organizadores section)
  - [ ] Subtask 6.3: Update breadcrumb navigation to include organizador → cajoncito levels
  - [ ] Subtask 6.4: Add organizadores/cajoncitos to StorageTree component with proper nesting
  - [ ] Subtask 6.5: Ensure OrganizerGrid/CajoncitoCard follow LocationCard/DrawerCard patterns

- [ ] Task 7: Testing and Validation (AC: All)
  - [ ] Subtask 7.1: Write unit tests for Organizador API endpoints (CRUD, validation, auto-naming)
  - [ ] Subtask 7.2: Write unit tests for Cajoncito API endpoints (CRUD, sequential numbering, constraints)
  - [ ] Subtask 7.3: Test polymorphic associations (repuestos/componentes to cajoncitos)
  - [ ] Subtask 7.4: Test frontend component rendering and user interactions (if Jest config allows)
  - [ ] Subtask 7.5: Validate parent-child relationships and cascading deletes
  - [ ] Subtask 7.6: Performance testing for organizador/cajoncito loading (< 1 second target)

- [ ] Task 4: Frontend Components - Organizers Visualization (AC: 8, 10, 11)
  - [ ] Subtask 4.1: Create OrganizerGrid component for visual grid layout with cajoncito cards
  - [ ] Subtask 4.2: Create CajoncitoCard component with content indicators and hover tooltips
  - [ ] Subtask 4.3: Implement visual distinction (colors/icons) for empty vs occupied cajoncitos
  - [ ] Subtask 4.4: Add content summary indicators (repuestos count, componentes count, mixed content)
  - [ ] Subtask 4.5: Create search/filter functionality within organizador contents

- [x] Task 5: Frontend Interface - Component Assignment (AC: 9)
  - [x] Subtask 5.1: Create CajoncitoAssignmentPanel component for drag-and-drop assignment
  - [x] Subtask 5.2: Implement assignment forms for repuestos and componentes to cajoncitos
  - [x] Subtask 5.3: Add visual feedback for successful assignments and quantity updates
  - [x] Subtask 5.4: Create confirmation dialogs for bulk assignment operations
  - [x] Subtask 5.5: Implement undo functionality for recent assignments

- [ ] Task 6: Integration with Storage Hierarchy (AC: 2, 4)
  - [ ] Subtask 6.1: Integrate Organizador management with existing Estanteria views (add organizadores section)
  - [ ] Subtask 6.2: Integrate Organizador management with existing Armario views (add organizadores section)
  - [ ] Subtask 6.3: Update breadcrumb navigation to include organizador → cajoncito levels
  - [ ] Subtask 6.4: Add organizadores/cajoncitos to StorageTree component with proper nesting
  - [ ] Subtask 6.5: Ensure OrganizerGrid/CajoncitoCard follow LocationCard/DrawerCard patterns

- [ ] Task 7: Testing and Validation (AC: All)
  - [ ] Subtask 7.1: Write unit tests for Organizador API endpoints (CRUD, validation, auto-naming)
  - [ ] Subtask 7.2: Write unit tests for Cajoncito API endpoints (CRUD, sequential numbering, constraints)
  - [ ] Subtask 7.3: Test polymorphic associations (repuestos/componentes to cajoncitos)
  - [ ] Subtask 7.4: Test frontend component rendering and user interactions (if Jest config allows)
  - [ ] Subtask 7.5: Validate parent-child relationships and cascading deletes
  - [ ] Subtask 7.6: Performance testing for organizador/cajoncito loading (< 1 second target)

## Dev Notes

### Requirements Context Summary

**Source Documents:**
- Epic 3: Hierarchical Storage System (epics.md)
- Technical Specification: Epic 3 (tech-spec-epic-3.md)
- Previous Story: 3-2 Drawers and Divisions System (Status: done)

**Core Requirements:**
The Organizers and Compartments System enables technicians to organize small electronic components (resistors, capacitors, integrated circuits, etc.) in dedicated organizers with numbered compartments. This system provides the finest level of organization in the storage hierarchy, allowing efficient storage and retrieval of small components that would be difficult to manage in larger drawers or divisions.

**Key Business Value:**
- Enables efficient organization of small components that are critical for maintenance work
- Provides visual grid interface for easy identification and assignment
- Supports mixing different component types in single compartments
- Maintains inventory accuracy at the compartment level

**Technical Scope:**
- Database models for Organizador and Cajoncito entities
- RESTful API endpoints for CRUD operations
- Frontend components for visual grid representation
- Integration with existing storage hierarchy navigation
- Component assignment functionality for repuestos and componentes

### Architecture Patterns and Constraints
- **Next.js 14 App Router**: Use server components for data fetching, client components for interactive UI [Source: docs/architecture.md#Architecture-Decision-Summary]
- **Prisma ORM**: Implement Organizador and Cajoncito models with proper foreign key relationships to Estanteria/Armario [Source: docs/architecture.md#Data-Architecture]
- **TypeScript**: Ensure type safety for all API contracts and component props [Source: docs/architecture.md#Architecture-Decision-Summary]
- **shadcn/ui**: Use consistent component library with Ternium Classic theme [Source: docs/architecture.md#Architecture-Decision-Summary]
- **Sequential Numbering Logic**: Implement automatic numbering for cajoncitos (1, 2, 3...) within parent organizador context

### Source Tree Components to Touch
- **Database Models**: `prisma/schema.prisma` - Add Organizador and Cajoncito models
- **API Routes**:
  - `src/app/api/estanterias/[id]/organizadores/route.ts` - Organizador CRUD for estanterías
  - `src/app/api/armarios/[id]/organizadores/route.ts` - Organizador CRUD for armarios
  - `src/app/api/organizadores/[id]/cajoncitos/route.ts` - Cajoncito CRUD for organizadores
- **Components**: `src/components/ubicaciones/` - OrganizerGrid, CajoncitoCard, CajoncitoAssignmentPanel
- **Pages**: Update existing estantería and armario pages to include organizadores management
- **Types**: `src/types/ubicaciones.ts` - TypeScript interfaces for Organizador and Cajoncito data
- **Validation Schemas**: `src/lib/validations/organizador.ts` - Zod schemas for Organizador and Cajoncito validation

### Testing Standards Summary
- **Unit Testing**: Jest for API endpoints and utility functions [Source: docs/architecture.md#Testing-Strategy]
- **Integration Testing**: Prisma Test Suite for database operations
- **Component Testing**: React Testing Library for UI components
- **Performance Target**: Organizador/cajoncito loading < 1 second, navigation < 500ms [Source: docs/tech-spec-epic-3.md#Non-Functional-Requirements]

### Project Structure Notes

- **API Route Pattern**: Follow RESTful conventions with nested routes for hierarchy (/api/estanterias/[id]/organizadores)
- **Component Organization**: Extend existing ubicaciones/ directory with organizer-related components
- **Database Naming**: Use Spanish names matching domain (Organizador, Cajoncito)
- **Sequential Numbering Strategy**: Query existing max number within parent organizador context and increment
- **State Management**: Use React Query for caching Organizador and Cajoncito data with optimistic updates

### Learnings from Previous Story

**From Story 3.2 (Status: done)**

- **New Service Created**: API endpoints structure at `/api/ubicaciones/` - extend pattern for organizadores/cajoncitos with nested routes (/api/estanterias/[id]/organizadores, /api/organizadores/[id]/cajoncitos)
- **New Components Created**: LocationCard, StorageTree, BreadcrumbNavigation - extend to include organizador/cajoncito levels in navigation hierarchy
- **Database Models**: Ubicacion, Estanteria, Armario models established - add Organizador/Cajoncito as children with proper foreign key relationships
- **API Patterns**: RESTful nested routes with Zod validation - follow same pattern for organizadores/cajoncitos with auto-numbering logic in API layer
- **UI Patterns**: shadcn/ui components with Ternium Classic theme - maintain consistency, create OrganizerGrid and CajoncitoCard following DrawerGrid/DrawerCard patterns
- **Testing Setup**: Test structure established for API and components - follow same patterns, note Jest configuration issues with Next.js 16
- **Auto-numbering Logic**: Implemented in API layer (not frontend) - use generateOrganizadorCode() and generateCajoncitoCode() functions
- **Performance Optimization**: Database indexes added for parent-child relationships - include indexes for organizadorId, estanteriaId, armarioId
- **Structured Logging**: Implemented using logger utility in API routes - apply to new organizador/cajoncito endpoints
- **Validation Layer**: Comprehensive Zod schemas with Spanish error messages - create src/lib/validations/organizador.ts following cajon.ts pattern
- **Component Architecture**: DrawerGrid/DrawerCard pattern established - create OrganizerGrid/CajoncitoCard with similar visual indicators and content display
- **File Organization**: Components in src/components/ubicaciones/ - maintain consistency with drawer-related components
- **Type Safety**: TypeScript interfaces in src/types/ubicaciones.ts - extend with Organizador and Cajoncito types
- **Error Handling**: Consistent error responses with Spanish messages - follow established patterns
- **Review Follow-ups**: Note that previous story has one unchecked review item: "Create DivisionPanel component for division CRUD operations (Task 5)" - while Senior Developer Review indicates implementation, follow-up remains open; monitor for epic-wide component consistency

[Source: docs/stories/3-2-drawers-divisions-system.md#Dev-Agent-Record]

### References

- [Source: docs/tech-spec-epic-3.md#Detailed-Design] - Complete Organizador and Cajoncito data models
- [Source: docs/tech-spec-epic-3.md#APIs-and-Interfaces] - API route structure for organizadores and cajoncitos
- [Source: docs/architecture.md#Data-Architecture] - Prisma model patterns and relationship conventions
- [Source: docs/epics.md#Epic-3] - Story 3.3 requirements and technical implementation notes
- [Source: docs/tech-spec-epic-3.md#Acceptance-Criteria-3.3] - AC-3.3 detailed acceptance criteria
- [Source: docs/stories/3-2-drawers-divisions-system.md] - Previous story patterns and established architecture

## Dev Agent Record

### Context Reference

- docs/stories/3-3-organizers-compartments-system.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- **Task 1 Complete**: Database models were already implemented in previous migrations. Added performance indexes for foreign key relationships to ensure efficient queries when loading organizadores and cajoncitos within their parent storage hierarchies.
- **Task 2 Complete**: Implemented complete REST API for organizadores management with auto-numbering (ORG-001, ORG-002...), validation schemas with Spanish error messages, and proper parent relationship handling for both estanterías and armarios.
- **Task 3 Complete**: Implemented complete REST API for cajoncitos management with sequential auto-numbering (CAJ-001, CAJ-002...), business rule validation (max 50 cajoncitos per organizador), and proper parent relationship handling with organizadores.
- **Task 4 Complete**: Created OrganizerGrid and CajoncitoCard components following DrawerGrid/DrawerCard patterns. Implemented visual distinction for empty vs occupied cajoncitos, content summary indicators with component category badges (R, C, IC, F), and search/filter functionality within organizador contents. Components provide intuitive grid visualization with hover tooltips and content identification.
- **Task 5 Complete**: Implemented comprehensive component assignment interface with CajoncitoAssignmentPanel and ComponenteAssignmentForm components. Features include drag-and-drop assignment workflow, real-time search and filtering, visual feedback with toast notifications, confirmation dialogs for safety, and undo functionality for recent assignments. Components integrate with existing notification system and provide intuitive user experience for assigning electronic components to cajoncito compartments.
- **Current Status**: Backend API, frontend visualization, and component assignment interfaces complete (Tasks 1-5). Storage hierarchy integration (Task 6) and testing (Task 7) remain pending. The organizadores and cajoncitos system now provides a complete end-to-end solution for managing small electronic component storage.

### File List

prisma/schema.prisma - Added performance indexes for Organizador and Cajoncito models
prisma/migrations/20251107235952_add_organizador_cajoncito_indexes/migration.sql - Migration for database indexes
src/lib/validations/organizador.ts - Zod validation schemas for Organizador and Cajoncito with Spanish error messages
src/app/api/estanterias/[id]/organizadores/route.ts - REST API endpoints for organizadores in estanterías
src/app/api/armarios/[id]/organizadores/route.ts - REST API endpoints for organizadores in armarios
src/app/api/organizadores/[id]/route.ts - Individual organizador CRUD operations
src/app/api/organizadores/[id]/cajoncitos/route.ts - REST API endpoints for cajoncitos in organizadores
src/app/api/cajoncitos/[id]/route.ts - Individual cajoncito CRUD operations
src/components/ubicaciones/organizer-grid.tsx - OrganizerGrid component for visual grid layout of organizadores
src/components/ubicaciones/cajoncito-card.tsx - CajoncitoCard component with content indicators and search functionality
src/components/ubicaciones/cajoncito-assignment-panel.tsx - CajoncitoAssignmentPanel component for component assignment workflow
src/components/ubicaciones/componente-assignment-form.tsx - ComponenteAssignmentForm component for individual component assignments
src/components/ubicaciones/index.ts - Updated exports for new organizer and assignment components

## Change Log

- **2025-11-07**: Story created from Epic 3 technical specifications
  - Extracted requirements from AC-3.3 in tech-spec-epic-3.md
  - Defined comprehensive task breakdown with 7 main tasks and 32 subtasks
  - Integrated learnings from previous Story 3.2 for architectural consistency
  - Established technical patterns following existing codebase conventions
- **2025-11-07**: Completed Task 1 - Database Models Implementation
  - Verified Organizador and Cajoncito models exist with proper relationships
  - Added performance indexes for foreign key columns (organizadorId, estanteriaId, armarioId)
  - Created and applied database migration for indexes
  - Confirmed ComponenteUbicacion supports cajoncitoId for component storage
- **2025-11-07**: Completed Tasks 2-3 - Backend API Implementation
   - Implemented complete REST API for organizadores management with auto-numbering (ORG-001, ORG-002...)
   - Implemented complete REST API for cajoncitos management with sequential numbering (CAJ-001, CAJ-002...)
   - Added comprehensive validation schemas with Spanish error messages
   - Implemented business rule validation (max 50 cajoncitos per organizador)
   - Created all CRUD endpoints with proper authentication and error handling
- **2025-11-07**: Completed Task 4 - Frontend Components Implementation
    - Created OrganizerGrid component following DrawerGrid patterns for visual organizador layout
    - Created CajoncitoCard component with content indicators, hover tooltips, and search functionality
    - Implemented visual distinction (colors/icons) for empty vs occupied cajoncitos
    - Added content summary indicators with component category badges (R=Resistencia, C=Capacitor, IC=Integrado, F=Ventilador)
    - Integrated search/filter functionality within organizador contents for cajoncito discovery
- **2025-11-07**: Completed Task 5 - Component Assignment Interface Implementation
    - Created CajoncitoAssignmentPanel component with comprehensive assignment workflow
    - Implemented ComponenteAssignmentForm for individual component assignments with search and validation
    - Added visual feedback system using toast notifications for success/error states
    - Implemented confirmation dialogs for assignment safety and user confirmation
    - Added undo functionality with recent assignments tracking and one-click reversal
    - Integrated components with existing notification system and UI patterns