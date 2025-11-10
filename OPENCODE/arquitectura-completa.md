# 🏗️ **DIAGRAMA COMPLETO DE ARQUITECTURA MASIREP**

## 📊 **1. STACK TECNOLÓGICO (Technology Stack)**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Next.js 16.0.1 (App Router)                               │
│  ├── Server Components (data fetching, SEO)                │
│  ├── Client Components (interactivity)                     │
│  └── API Routes (backend functionality)                     │
│                                                             │
│  React 19.2.0 + TypeScript 5.x                             │
│  ├── React Hook Form 7.66.0 (form management)             │
│  ├── Zod 4.1.12 (validation)                              │
│  └── Custom hooks (use-api, use-auth, etc.)               │
│                                                             │
│  UI Framework:                                             │
│  ├── Tailwind CSS 4.0 (styling)                           │
│  ├── shadcn/ui components (WCAG compliant)                │
│  └── Lucide React (icons)                                 │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  NextAuth.js 4.24.13                                       │
│  ├── Credentials Provider (local auth)                     │
│  ├── Prisma Adapter (session storage)                      │
│  ├── Middleware (route protection)                        │
│  └── JWT Sessions (secure cookies)                         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  Prisma ORM 6.19.0                                        │
│  ├── Type-safe database access                             │
│  ├── Migration management                                  │
│  ├── Query optimization                                    │
│  └── Relationship handling                                 │
│                                                             │
│  SQLite Database (local file-based)                        │
│  ├── Hierarchical storage model                            │
│  ├── Full-text search capabilities                         │
│  ├── Transaction logging                                   │
│  └── Local backup strategy                                 │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                  DEVELOPMENT TOOLS                          │
├─────────────────────────────────────────────────────────────┤
│  Testing: Jest 30.2.0 + Testing Library                    │
│  Code Quality: ESLint 9 + TypeScript strict                │
│  Development: Hot reload, Prisma Studio                    │
│  Build: Next.js optimized production builds                │
└─────────────────────────────────────────────────────────────┘
```

## 🗄️ **2. ESQUEMA DE BASE DE DATOS (Database Schema)**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      USER       │    │   REPUESTO      │    │   EQUIPO        │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ email (unique)  │◄──►│ codigo (unique) │◄──►│ codigo (unique) │
│ name            │    │ nombre          │    │ sap (unique)    │
│ technicianId    │    │ descripcion     │    │ nombre          │
│ role            │    │ marca           │    │ marca           │
│ isActive        │    │ modelo          │    │ modelo          │
│ passwordHash    │    │ numeroParte     │    │ numeroSerie     │
│ createdAt       │    │ stockMinimo     │    │ isActive        │
│ updatedAt       │    │ stockActual     │    │ createdAt       │
│                 │    │ categoria       │    │ updatedAt       │
│ accounts[]      │    │ isActive        │    │                 │
│ sessions[]      │    │ createdAt       │    │ repuestos[]     │
│ transacciones[] │    │ updatedAt       │    │                 │
└─────────────────┘    │ equipos[]       │    └─────────────────┘
                       │ ubicaciones[]   │
                       │ transacciones[] │
                       └─────────────────┘
                                │
                                │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   COMPONENTE    │    │REPUESTOUBICACION│    │COMPONENTEUBIC   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ categoria       │    │ repuestoId (FK) │    │ componenteId(FK) │
│ descripcion     │    │ cantidad        │    │ cajoncitoId(FK) │
│ valorUnidad     │    │ armarioId (FK)  │    │ cantidad        │
│ stockMinimo     │    │ estanteriaId(FK)│    │ createdAt       │
│ isActive        │    │ estanteId (FK)  │    │ updatedAt       │
│ createdAt       │    │ cajonId (FK)    │    │                 │
│ updatedAt       │    │ divisionId (FK) │    │ componente      │
│ ubicaciones[]   │    │ createdAt       │    │ cajoncito       │
└─────────────────┘    │ updatedAt       │    └─────────────────┘
                       │ repuesto        │
                       │ armario         │
                       │ estanteria      │
                       │ estante         │
                       │ cajon           │
                       │ division        │
                       └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UBICACION     │    │   ESTANTERIA    │    │    ARMARIO      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │◄──►│ id (PK)         │◄──►│ id (PK)         │
│ codigo (unique) │    │ codigo (unique) │    │ codigo (unique) │
│ nombre          │    │ nombre          │    │ nombre          │
│ descripcion     │    │ descripcion     │    │ descripcion     │
│ isActive        │    │ ubicacionId (FK) │    │ ubicacionId (FK) │
│ createdAt       │    │ createdAt       │    │ createdAt       │
│ updatedAt       │    │ updatedAt       │    │ updatedAt       │
│ armarios[]      │    │ cajones[]       │    │ cajones[]       │
│ estanterias[]   │    │ estantes[]      │    │ organizadores[] │
└─────────────────┘    │ organizadores[] │    │ repuestos[]     │
                       │ repuestos[]     │    └─────────────────┘
                       └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     CAJON       │    │    DIVISION     │    │  ORGANIZADOR    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │◄──►│ id (PK)         │    │ id (PK)         │
│ codigo (unique) │    │ codigo (unique) │    │ codigo (unique) │
│ nombre          │    │ nombre          │    │ nombre          │
│ descripcion     │    │ cajonId (FK)    │    │ descripcion     │
│ estanteriaId(FK)│    │ createdAt       │    │ estanteriaId(FK)│
│ armarioId (FK)  │    │ updatedAt       │    │ armarioId (FK)  │
│ createdAt       │    │ division        │    │ createdAt       │
│ updatedAt       │    │ repuestos[]     │    │ updatedAt       │
│ divisiones[]    │    └─────────────────┘    │ cajoncitos[]    │
│ repuestos[]     │                            └─────────────────┘
└─────────────────┘
                                │
                                │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CAJONCITO     │    │  TRANSACCION    │    │ VERIFICATION    │
├─────────────────┤    ├─────────────────┤    │     TOKEN       │
├─────────────────┤    │ id (PK)         │    ├─────────────────┤
│ id (PK)         │    │ codigo (unique) │    │ identifier      │
│ codigo (unique) │    │ tipo            │    │ token (unique)  │
│ nombre          │    │ itemId          │    │ expires         │
│ descripcion     │    │ itemType        │    └─────────────────┘
│ organizadorId(FK)│   │ cantidad        │
│ createdAt       │    │ stockAnterior   │
│ updatedAt       │    │ stockNuevo      │
│ componentes[]   │    │ motivo          │
└─────────────────┘    │ userId (FK)     │
                       │ createdAt       │
                       │ updatedAt       │
                       │ user            │
                       └─────────────────┘

📦 **HIERARCHICAL STORAGE MODEL:**
Ubicación (Location)
├── Armario (Cabinet)
│   ├── Cajón (Drawer)
│   │   └── División (Division)
│   └── Organizador (Organizer)
│       └── Cajoncito (Small Drawer)
└── Estantería (Shelf)
    ├── Estante (Shelf Level)
    ├── Cajón (Drawer)
    │   └── División (Division)
    └── Organizador (Organizer)
        └── Cajoncito (Small Drawer)
```

## 📁 **3. ESTRUCTURA DE ARCHIVOS (File System Structure)**

```
masirep/
├── 📄 Configuration Files
│   ├── package.json                 # Dependencies & scripts
│   ├── tsconfig.json               # TypeScript configuration
│   ├── next.config.ts              # Next.js configuration
│   ├── tailwind.config.ts          # Tailwind CSS configuration
│   ├── eslint.config.mjs           # ESLint rules
│   ├── jest.config.js              # Jest testing setup
│   ├── middleware.ts               # NextAuth middleware
│   └── prisma.config.ts            # Prisma configuration
│
├── 📁 prisma/                      # Database layer
│   ├── schema.prisma              # Complete database schema
│   ├── seed.ts                    # Test data seeding
│   └── migrations/                # Database migrations
│       ├── 20251105214905_init/
│       ├── 20251105223424_add_inventory_models/
│       └── [other migrations]/
│
├── 📁 src/                        # Source code
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 (dashboard)/        # Protected route group
│   │   │   ├── 📁 ubicaciones/   # Storage management
│   │   │   │   ├── page.tsx      # Main locations page
│   │   │   │   └── test-page.tsx # Testing page
│   │   │   ├── layout.tsx        # Dashboard layout
│   │   │   └── page.tsx          # Dashboard home
│   │   │
│   │   ├── 📁 auth/              # Authentication pages
│   │   │   ├── 📁 error/         # Auth error pages
│   │   │   ├── 📁 signin/        # Login page
│   │   │   └── auth-error-content.tsx
│   │   │
│   │   ├── 📁 dashboard/         # Dashboard routes
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📁 api/               # API routes (backend)
│   │   │   ├── 📁 cajoncitos/    # Small drawers API
│   │   │   │   ├── [id]/route.ts
│   │   │   │   └── route.ts
│   │   │   ├── 📁 componentes/   # Components API
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── 📁 ubicaciones/
│   │   │   │   ├── debug/
│   │   │   │   └── route.ts
│   │   │   ├── 📁 equipos/       # Equipment API
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── 📁 repuestos/
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── 📁 repuestos/     # Spare parts API
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── 📁 equipos/
│   │   │   │   │   └── 📁 ubicaciones/
│   │   │   │   └── route.ts
│   │   │   ├── 📁 stock/         # Stock management API
│   │   │   │   └── route.ts
│   │   │   └── 📁 ubicaciones/   # Locations API
│   │   │       ├── [id]/
│   │   │       │   ├── 📁 armarios/
│   │   │       │   ├── 📁 estanterias/
│   │   │       │   └── 📁 contents/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   ├── globals.css           # Global styles
│   │   ├── _error.tsx            # Error boundary
│   │   └── not-found.tsx         # 404 page
│   │
│   ├── 📁 components/            # React components
│   │   ├── 📁 auth/              # Authentication components
│   │   │   └── login-form.tsx
│   │   ├── 📁 componentes/       # Component management UI
│   │   │   ├── componente-detail.tsx
│   │   │   ├── componente-form.tsx
│   │   │   ├── componente-list.tsx
│   │   │   ├── stock-calculator.tsx
│   │   │   └── 📁 __tests__/     # Component tests
│   │   ├── 📁 equipos/          # Equipment management UI
│   │   │   ├── equipo-detail.tsx
│   │   │   ├── equipo-form.tsx
│   │   │   ├── equipo-list.tsx
│   │   │   ├── equipo-repuesto-manager.tsx
│   │   │   ├── equipo-search-filters.tsx
│   │   │   └── equipos-manager.tsx
│   │   ├── 📁 forms/            # Form components
│   │   │   ├── componente-category-selector.tsx
│   │   │   ├── componente-location-selector.tsx
│   │   │   ├── equipment-selector.tsx
│   │   │   ├── location-selector.tsx
│   │   │   ├── technical-specs-display.tsx
│   │   │   └── value-unit-pair-manager.tsx
│   │   ├── 📁 layout/           # Layout components
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── header.tsx
│   │   │   ├── navigation.tsx
│   │   │   ├── protected-route.tsx
│   │   │   └── sidebar-layout.tsx
│   │   ├── 📁 notifications/    # Notification system
│   │   │   └── notification-provider.tsx
│   │   ├── 📁 repuestos/        # Spare parts UI
│   │   │   ├── repuesto-card.tsx
│   │   │   ├── repuesto-form.tsx
│   │   │   └── repuesto-list.tsx
│   │   ├── 📁 ubicaciones/      # Storage management UI
│   │   │   ├── cajoncito-assignment-panel.tsx
│   │   │   ├── cajoncito-card.tsx
│   │   │   ├── componente-assignment-form.tsx
│   │   │   ├── division-form.tsx
│   │   │   └── division-panel.tsx
│   │   ├── 📁 ui/               # shadcn/ui components
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── icon.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── textarea.tsx
│   │   └── error-boundary.tsx   # Global error boundary
│   │
│   ├── 📁 hooks/                # Custom React hooks
│   │   ├── use-api-data.ts      # API data management
│   │   ├── use-api.ts           # API wrapper
│   │   ├── use-auth.ts          # Authentication state
│   │   ├── use-componentes.ts   # Components data
│   │   ├── use-equipos.ts       # Equipment data
│   │   ├── use-repuestos.ts     # Spare parts data
│   │   └── 📁 __tests__/        # Hook tests
│   │
│   ├── 📁 lib/                  # Utilities and services
│   │   ├── 📁 services/         # Business logic
│   │   │   └── stock-calculator.ts
│   │   ├── 📁 validations/       # Zod schemas
│   │   │   ├── asociacion.ts
│   │   │   ├── cajon.ts
│   │   │   ├── componente.ts
│   │   │   ├── equipo.ts
│   │   │   ├── organizador.ts
│   │   │   ├── repuesto.ts
│   │   │   └── ubicacion.ts
│   │   ├── auth-client.ts       # Auth client config
│   │   ├── auth.ts              # NextAuth configuration
│   │   ├── debug-attributes.ts  # Debug utilities
│   │   ├── icons.ts             # Icon definitions
│   │   ├── logger.ts            # Logging utility
│   │   ├── prisma.ts            # Prisma client
│   │   ├── rate-limit.ts        # Rate limiting
│   │   └── utils.ts             # General utilities
│   │
│   └── 📁 types/                # TypeScript definitions
│       ├── api.ts               # API response types
│       └── next-auth.d.ts       # Auth types
│
├── 📁 public/                   # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── 📁 scripts/                  # Build/utility scripts
│   └── apply-debug-attributes.js
│
├── 📁 docs/                     # Documentation
│   ├── 📁 retrospectives/       # Sprint retrospectives
│   ├── 📁 stories/             # User stories with context
│   ├── architecture.md          # Architecture decisions
│   ├── PRD.md                  # Product requirements
│   ├── backlog.md              # Feature backlog
│   ├── epics.md               # Epic definitions
│   ├── tech-spec-epic-1.md     # Technical specifications
│   └── [other documentation]...
│
├── 📁 bmad/                     # AI Agent system (BMAD framework)
│   ├── 📁 _cfg/                # Configuration
│   ├── 📁 bmb/                 # Builder agents
│   ├── 📁 bmm/                 # Management agents
│   ├── 📁 cis/                 # System integration
│   └── 📁 core/                # Core agents
│
└── 📄 Project Files
    ├── README.md               # Project documentation
    ├── CLAUDE.md              # Claude AI instructions
    ├── .gitignore             # Git ignore rules
    └── [other config files]...
```

## 🔄 **4. FLUJO DE DATOS (Data Flow Architecture)**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   USER ACTION   │───▶│  REACT COMPONENT│───▶│   API ROUTE     │
│                 │    │                 │    │                 │
│ • Form submit   │    │ • Client-side   │    │ • Validation    │
│ • Search query  │    │   validation    │    │ • Business logic│
│ • Navigation    │    │ • State mgmt    │    │ • Error handling│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI UPDATE     │◀───│  REACT QUERY    │◀───│  PRISMA CLIENT  │
│                 │    │                 │    │                 │
│ • Re-render     │    │ • Caching       │    │ • Type-safe DB  │
│ • Error display │    │ • Background    │    │   operations    │
│ • Loading state │    │   sync          │    │ • Relationships │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │  SQLITE DATABASE │
                                              │                 │
                                              │ • Local file    │
                                              │ • ACID compliance│
                                              │ • Full-text search│
                                              └─────────────────┘

🔐 **Authentication Flow:**
User → Login Form → NextAuth → Database → Session Cookie → Protected Routes

📊 **Stock Management Flow:**
Transaction → API → Prisma → Database → Cache Update → UI Refresh
```

## 🎯 **5. ARQUITECTURA DE COMPONENTES (Component Architecture)**

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────┤
│  PRESENTATION LAYER                                         │
│  ├── Pages (app/**/*.tsx)                                   │
│  ├── Layout Components (components/layout/)                 │
│  └── Feature Components (components/[domain]/)            │
│                                                             │
│  BUSINESS LOGIC LAYER                                      │
│  ├── Custom Hooks (hooks/)                                  │
│  ├── Services (lib/services/)                              │
│  └── API Routes (app/api/)                                 │
│                                                             │
│  DATA ACCESS LAYER                                         │
│  ├── Prisma Client (lib/prisma.ts)                         │
│  ├── Validations (lib/validations/)                         │
│  └── Database (prisma/schema.prisma)                       │
│                                                             │
│  INFRASTRUCTURE LAYER                                      │
│  ├── Authentication (lib/auth.ts)                          │
│  ├── Error Handling (error-boundary.tsx)                    │
│  └── Utilities (lib/utils.ts)                              │
└─────────────────────────────────────────────────────────────┘

🏗️ **Component Hierarchy:**
App Layout
├── Auth Provider
├── Navigation Layout
│   ├── Header
│   ├── Sidebar
│   └── Breadcrumb
└── Page Content
    ├── Forms (React Hook Form + Zod)
    ├── Lists (Table components)
    ├── Cards (shadcn/ui cards)
    └── Modals (Dialog components)
```

## 🚀 **6. COMANDOS DE DESARROLLO (Development Commands)**

### Core Development
```bash
npm run dev              # Development server with hot reload (<1s startup)
npm run build            # Production build
npm run start            # Production server
```

### Code Quality
```bash
npm run lint             # ESLint checking
npm run lint:fix         # Auto-fix ESLint issues
npm run type-check       # TypeScript type checking (no emit)
```

### Testing
```bash
npm run test             # Run Jest tests
npm run test:watch       # Jest in watch mode
npm run test:coverage    # Jest with coverage report
```

### Database Operations
```bash
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Create and run new migration
npm run db:seed          # Seed database with test data (7 technicians)
npm run db:reset         # Reset database and reseed (destructive)
npm run db:studio        # Open Prisma Studio database browser
```

## 📋 **7. ENTIDADES PRINCIPALES (Main Entities)**

### Users & Authentication
- **Users**: Authentication with roles (`tecnico`, `admin`, `supervisor`)
- **7 Pre-configured technicians**: For testing and development
- **Session Management**: NextAuth.js with secure cookies

### Inventory Management
- **Repuestos**: Spare parts with stock tracking and minimum levels
- **Componentes**: Electronic components with technical specifications
- **Equipos**: Equipment that uses spare parts (many-to-many relationship)

### Hierarchical Storage
- **Ubicaciones**: Main storage locations
- **Armarios/Estanterias**: Cabinets and Shelves
- **Cajones/Divisiones**: Drawers and Divisions
- **Organizadores/Cajoncitos**: Organizers and Small Drawers

### Stock & Transactions
- **Real-time Stock**: Calculated from location assignments
- **Transactions**: Complete audit trail of stock movements
- **Alerts**: Minimum stock level notifications

## 🔧 **8. PATRONES DE IMPLEMENTACIÓN (Implementation Patterns)**

### API Patterns
- **RESTful endpoints**: Standard HTTP methods and status codes
- **Consistent response format**: `{ data?, error?, success: boolean }`
- **Zod validation**: Type-safe input validation for all endpoints
- **Error handling**: Graceful error responses with proper HTTP codes

### Frontend Patterns
- **Server Components**: Default for data fetching
- **Client Components**: Explicit `"use client"` for interactivity
- **Form handling**: React Hook Form + Zod integration
- **State management**: Custom hooks with React Query caching

### Database Patterns
- **Type-safe queries**: Prisma client with generated types
- **Migration management**: Version-controlled schema changes
- **Relationship handling**: Optimized queries for hierarchical data
- **Indexing strategy**: Performance indexes on search fields

## 🎨 **9. SISTEMA DE DISEÑO (Design System)**

### UI Framework
- **shadcn/ui**: WCAG compliant components
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Consistent icon system
- **Responsive design**: Mobile-first approach

### Theme & Branding
- **Ternium Classic theme**: Industrial color palette
- **Accessibility**: WCAG 2.1 AA compliance
- **Spanish language**: All UI text in Spanish
- **Technical focus**: Optimized for maintenance technicians

---