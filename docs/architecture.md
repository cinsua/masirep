# Masirep - Architecture Decision Document

**Author:** Carlos
**Date:** 2025-11-05
**Version:** 2.0
**Architect:** Product Manager (John) with Carlos Collaboration
**Project Level:** Medium
**Target Scale:** 7 users, enterprise maintenance

---

## Executive Summary

Masirep es un sistema de gestión de inventario fullstack con arquitectura **Next.js 14 App Router + TypeScript + Prisma + SQLite** diseñada para operación local autónoma por 7 técnicos de mantenimiento. La arquitectura enfatiza performance de búsqueda (<2 segundos), consistencia de implementación entre agentes IA, y autonomía departamental total sin dependencias de TI corporativa.

**Core Architectural Decision:** Next.js 14 App Router con Server/Client Components, Prisma ORM, y shadcn/ui con tema Ternium Classic para una experiencia de usuario optimizada para técnicos de mantenimiento.

---

## Project Initialization

### First Implementation Story Command

```bash
npx create-next-app@latest masirep --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### Post-Initialization Dependencies

```bash
# Base de datos y ORM
npm install prisma @prisma/client
npm install -D prisma

# Autenticación local
npm install next-auth @auth/prisma-adapter

# UI Components (shadcn/ui base)
npm install @radix-ui/react-dialog @radix-ui/react-tabs
npm install class-variance-authority clsx tailwind-merge

# Forms y validation
npm install react-hook-form @hookform/resolvers zod

# Utilidades
npm install lucide-react date-fns

# Development tools
npm install -D @types/node
```

This establishes the complete architecture with:
- Next.js 14 App Router (MVC moderno)
- TypeScript (type safety extremo a extremo)
- Tailwind CSS + shadcn/ui (tu UX work)
- Prisma ORM (database local autónoma)
- NextAuth.js (autenticación local para 7 técnicos)

---

## Architecture Decision Summary

| Category | Decision | Version | Affects Epics | Rationale |
|----------|----------|---------|---------------|-----------|
| **Framework** | Next.js 14 App Router | 14.2.4 | All | MVC moderno con Server/Client Components, deployment local simplificado |
| **Language** | TypeScript | 5.4+ | All | Type safety extremo a extremo para consistencia de agentes IA |
| **Styling** | Tailwind CSS + shadcn/ui | Tailwind 3.4+, shadcn 0.8+ | 2, 4 | Directamente compatible con UX work de Carlos |
| **Database** | SQLite (dev) / PostgreSQL (prod) | SQLite 3.45 / PG 16 | 1, 2 | Local autonomous operation + escalabilidad futura |
| **ORM** | Prisma | 5.14.0 | 1, 2 | Type-safe database access, migrations, seed data |
| **Authentication** | NextAuth.js | 4.24.0 | 1 | Local user management, session-based auth |
| **Validation** | Zod + React Hook Form | Zod 3.22+, RHF 7.48+ | All | Type-safe validation para forms y API |
| **UI Components** | Radix UI + shadcn/ui | Radix 1.0+ | All | WCAG compliance, accessibility, tema Ternium Classic |
| **State Management** | React Query + Server Components | TanStack Query 5.0+ | 4, 5 | Optimistic updates, caching para búsqueda <2s |

---

## Complete Project Structure

```
masirep/
├── README.md
├── next.config.js
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── repuestos/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   └── nuevo/
│   │   ├── componentes/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   └── nuevo/
│   │   ├── equipos/
│   │   │   ├── page.tsx
│   │   │   └── nuevo/
│   │   ├── ubicaciones/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   ├── busqueda/
│   │   │   └── page.tsx
│   │   ├── reportes/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── repuestos/
│   │   │   ├── componentes/
│   │   │   ├── equipos/
│   │   │   ├── ubicaciones/
│   │   │   ├── busqueda/
│   │   │   └── reportes/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Table.tsx
│   │   │   └── Modal.tsx
│   │   ├── forms/
│   │   │   ├── RepuestoForm.tsx
│   │   │   ├── ComponenteForm.tsx
│   │   │   └── EquipoForm.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Navigation.tsx
│   │   └── inventory/
│   │       ├── StorageTree.tsx
│   │       ├── ItemCard.tsx
│   │       └── LocationBadge.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── utils.ts
│   │   └── validations.ts
│   ├── types/
│   │   ├── inventory.ts
│   │   ├── auth.ts
│   │   └── api.ts
│   └── hooks/
│       ├── useAuth.ts
│       ├── useInventory.ts
│       └── useSearch.ts
├── public/
│   └── icons/
└── docs/
    ├── architecture.md
    ├── PRD.md
    ├── epics.md
    └── product-brief-masirep-2025-11-05.md
```

---

## Epic to Architecture Mapping

### Epic 1: Foundation for Autonomous System
- **Story 1.1:** Project setup (`npx create-next-app@latest masirep...`)
- **Story 1.2:** Prisma schema + models (`prisma/schema.prisma`)
- **Story 1.3:** API routes (`src/app/api/auth/`, authentication service)
- **Story 1.4:** Frontend structure (`src/app/layout.tsx`, `src/app/(auth)/`)

### Epic 2: Core Inventory Management
- **Story 2.1:** Repuestos CRUD (`src/app/api/repuestos/`, `src/components/inventory/repuesto-card.tsx`)
- **Story 2.2:** Componentes CRUD (`src/app/api/componentes/`, `src/components/inventory/componente-card.tsx`)
- **Story 2.3:** Equipment management (`src/app/api/equipos/`, association components)

### Epic 3: Hierarchical Storage System
- **Story 3.1:** Location management (`src/app/api/ubicaciones/`, `src/components/ubicaciones/location-card.tsx` ✅)
- **Story 3.2:** Drawers and divisions (`src/app/api/ubicaciones/[id]/cajones/`, nested navigation)
- **Story 3.3:** Organizers and compartments (`src/components/ubicaciones/storage-grid.tsx`)
- **Story 3.4:** Inventory-storage associations (`src/lib/repositories/`, many-to-many management)

### Epic 4: Search and Discovery
- **Story 4.1:** Main search engine (`src/app/api/search/route.ts`, `src/components/search/` ✅ DualTabSearch)
- **Story 4.2:** Advanced filtering (`src/components/search/advanced-filters.tsx` ✅ FilterChip)
- **Story 4.3:** Location navigation (`src/components/ubicaciones/location-tree.tsx`)
- **Story 4.4:** Detailed views (`src/components/inventory/`, quick actions)

### Epic 5: Stock Management and Reporting
- **Story 5.1:** Real-time stock updates (`src/app/api/stock/update/route.ts`, `src/components/stock/stock-update-panel.tsx` ✅)
- **Story 5.2:** Stock alerts (`src/app/api/stock/alerts/route.ts`, alert dashboard)
- **Story 5.3:** Comprehensive reporting (`src/app/api/reports/generate/route.ts`, export functionality)
- **Story 5.4:** Label printing (`src/lib/services/export.service.ts`, print templates)

---

## Technology Stack Details

### Frontend: Next.js 14 with App Router
- **Server Components**: For data fetching and SEO
- **Client Components**: For interactive UI elements
- **API Routes**: Backend functionality within same project
- **Middleware**: Authentication and route protection

### Database: SQLite with Prisma ORM
```prisma
// Key database models for inventory hierarchy
model Ubicacion {
  id          Int       @id @default(autoincrement())
  nombre      String    @unique
  estanterias Estanteria[]
  armarios    Armario[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Estanteria {
  id           Int      @id @default(autoincrement())
  nombre       String
  ubicacionId  Int
  ubicacion    Ubicacion @relation(fields: [ubicacionId], references: [id])
  cajones      Cajon[]
  estantes     Estante[]
  organizadores Organizador[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// ... (complete models defined in Data Architecture section)
```

### Authentication: NextAuth.js with Local Provider
- **Credentials Provider**: Local username/password authentication
- **Session Strategy**: Database sessions for persistence
- **Callbacks**: Custom session and JWT handling
- **Middleware**: Route protection for authenticated areas

### State Management: React Query (TanStack Query)
- **Server State**: API data caching and synchronization
- **Optimistic Updates**: Immediate UI feedback
- **Background Refetching**: Automatic data synchronization
- **Error Handling**: Graceful error states and retries

---

## Integration Points

### API Architecture
```
Frontend Components → API Routes → Prisma Client → SQLite Database
        ↓
React Query (caching, background sync)
```

### Data Flow
1. **User Action** → Component triggers API call
2. **API Route** → Validates request, calls business logic
3. **Prisma Client** → Type-safe database operation
4. **SQLite** → Local file-based persistence
5. **React Query** → Updates cache, re-renders components

### Authentication Flow
1. **Login** → Credentials provider validates against database
2. **Session** → JWT stored in secure cookie
3. **Protected Routes** → Middleware verifies authentication
4. **API Calls** → Session attached to each request

---

## Data Architecture

### Core Entity Models

```prisma
// Complete database schema for Masirep
model Repuesto {
  id           Int          @id @default(autoincrement())
  codigo       String       @unique
  descripcion  String
  nota         String?
  stockMinimo  Int          @default(0)
  stockActual  Int          @default(0)
  equipos      Equipo[]     @relation
  ubicaciones  RepuestoUbicacion[]
  transacciones Transaccion[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}

model Componente {
  id           Int                @id @default(autoincrement())
  categoria    String
  descripcion  String
  valores      ComponenteValor[]
  ubicaciones  ComponenteUbicacion[]
  transacciones Transaccion[]
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt
}

model ComponenteValor {
  id          Int    @id @default(autoincrement())
  componenteId Int
  componente  Componente @relation(fields: [componenteId], references: [id])
  valor       String  // "22 ohms"
  unidad      String  // "2w"
  createdAt   DateTime @default(now())
}

model Equipo {
  id          Int        @id @default(autoincrement())
  sap         String     @unique
  nombre      String
  marca       String
  modelo      String
  repuestos   Repuesto[] @relation
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

// Storage Hierarchy
model Ubicacion {
  id          Int       @id @default(autoincrement())
  nombre      String    @unique
  estanterias Estanteria[]
  armarios    Armario[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

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

model Armario {
  id           Int         @id @default(autoincrement())
  nombre       String
  ubicacionId  Int
  ubicacion    Ubicacion   @relation(fields: [ubicacionId], references: [id])
  cajones      Cajon[]
  organizadores Organizador[]
  repuestos    RepuestoUbicacion[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

model Estante {
  id           Int      @id @default(autoincrement())
  numero       Int
  estanteriaId Int
  estanteria   Estanteria @relation(fields: [estanteriaId], references: [id])
  repuestos    RepuestoUbicacion[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Cajon {
  id           Int         @id @default(autoincrement())
  numero       Int
  estanteriaId Int?
  estanteria   Estanteria?  @relation(fields: [estanteriaId], references: [id])
  armarioId    Int?
  armario      Armario?    @relation(fields: [armarioId], references: [id])
  divisiones   Division[]
  repuestos    RepuestoUbicacion[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

model Division {
  id       Int     @id @default(autoincrement())
  numero   Int
  cajonId  Int
  cajon    Cajon   @relation(fields: [cajonId], references: [id])
  repuestos RepuestoUbicacion[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

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

// Association Tables for Many-to-Many Relationships
model RepuestoUbicacion {
  id          Int                 @id @default(autoincrement())
  repuestoId  Int
  repuesto    Repuesto             @relation(fields: [repuestoId], references: [id])
  cantidad    Int                  @default(1)
  // Polymorphic relationship to storage locations
  armarioId   Int?
  armario     Armario?             @relation(fields: [armarioId], references: [id])
  estanteId   Int?
  estante     Estante?             @relation(fields: [estanteId], references: [id])
  cajonId     Int?
  cajon       Cajon?               @relation(fields: [cajonId], references: [id])
  divisionId  Int?
  division    Division?            @relation(fields: [divisionId], references: [id])
  cajoncitoId Int?
  cajoncito   Cajoncito?           @relation(fields: [cajoncitoId], references: [id])
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt
}

model ComponenteUbicacion {
  id          Int          @id @default(autoincrement())
  componenteId Int
  componente  Componente   @relation(fields: [componenteId], references: [id])
  cantidad    Int          @default(1)
  // Storage locations (only cajoncitos for small components)
  cajoncitoId Int
  cajoncito   Cajoncito    @relation(fields: [cajoncitoId], references: [id])
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

// Transactions and Stock Management
model Transaccion {
  id           Int           @id @default(autoincrement())
  tipo         TransaccionTipo @default(CONSUMO) // CONSUMO, RECEPCION, TRANSFERENCIA, AJUSTE
  cantidad     Int
  motivo       String?
  usuarioId    Int
  usuario      Usuario       @relation(fields: [usuarioId], references: [id])
  repuestoId   Int?
  repuesto     Repuesto?     @relation(fields: [repuestoId], references: [id])
  componenteId Int?
  componente   Componente?   @relation(fields: [componenteId], references: [id])
  createdAt    DateTime      @default(now())
}

model Usuario {
  id        Int       @id @default(autoincrement())
  username  String    @unique
  password  String    // hashed
  role      String    @default("tecnico") // tecnico, supervisor, referente
  transacciones Transaccion[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

enum TransaccionTipo {
  CONSUMO
  RECEPCION
  TRANSFERENCIA
  AJUSTE
}
```

### Key Data Relationships
- **Repuesto** ↔ **Equipo**: Many-to-many (repuestos can belong to multiple equipos)
- **Repuesto** ↔ **Storage**: Many-to-many (repuestos in multiple locations)
- **Componente** ↔ **Storage**: Many-to-many through Cajoncito (small components)
- **Jerarquía**: Ubicacion → Estanteria/Armario → Cajon → Division
- **Stock**: Calculated real-time from RepuestoUbicacion/ComponenteUbicacion

---

## API Contracts

### RESTful API Structure

```typescript
// Standard API Response Format
interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  success: boolean;
}

// Example: Repuestos API
GET    /api/repuestos           // List with filtering/pagination
GET    /api/repuestos/[id]      // Get single repuesto
POST   /api/repuestos           // Create new repuesto
PUT    /api/repuestos/[id]      // Update repuesto
DELETE /api/repuestos/[id]      // Delete repuesto

// Search API
GET    /api/busqueda?q={query}&tipo={repuesto|componente}&filters={...}

// Stock Management
POST   /api/transacciones       // Record stock transaction
GET    /api/reportes/faltantes  // Items out of stock
GET    /api/reportes/minimos    // Items at/below minimum
```

### Request/Response Examples

```typescript
// Create Repuesto Request
POST /api/repuestos
{
  "codigo": "REP-001",
  "descripcion": "Sensor de temperatura ESP20",
  "nota": "Original equipment",
  "stockMinimo": 5,
  "equipos": ["ESP20"],
  "ubicaciones": [
    {
      "tipo": "cajon",
      "id": 1,
      "cantidad": 10
    }
  ]
}

// Search Response
GET /api/busqueda?q=ESP20
{
  "data": {
    "repuestos": [
      {
        "id": 1,
        "codigo": "REP-001",
        "descripcion": "Sensor de temperatura ESP20",
        "stockActual": 10,
        "ubicaciones": ["Cajon 1", "Armario ACE"],
        "equipos": ["ESP20"]
      }
    ],
    "componentes": []
  },
  "success": true
}
```

---

## Security Architecture

### Authentication & Authorization
- **Local Authentication**: Username/password stored in database
- **Session Management**: Secure HTTP-only cookies
- **Password Hashing**: bcrypt with salt rounds
- **Route Protection**: Middleware validates session tokens
- **API Security**: All API routes require authentication

### Data Protection
- **Input Validation**: Zod schemas for all API inputs
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: SameSite cookies for API requests
- **Local Data Only**: No external data transmissions

### Backup Strategy
- **Database Backups**: Automated SQLite file copies
- **Local Storage**: Backups stored on local network
- **Version Control**: Git repository for code backup
- **Recovery Process**: Documented restoration procedures

---

## Performance Considerations

### Database Optimization
- **Indexes**: On codigo, descripcion, and search fields
- **Query Optimization**: Efficient joins for hierarchical data
- **Connection Pooling**: Prisma connection management
- **Caching**: React Query for frequently accessed data

### Frontend Performance
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Next.js Image component
- **Bundle Size**: Tree shaking and dynamic imports
- **Caching Strategy**: Static assets and API responses

### Search Performance
- **Full-Text Search**: SQLite FTS for descriptions
- **Indexed Fields**: codigo and categoria searches
- **Debounced Input**: Search on type delay
- **Result Caching**: React Query caching

---

## Deployment Architecture

### Local Deployment
- **Single Machine Setup**: All components on one server/workstation
- **Static Build**: `next build && next start` for production
- **Database File**: SQLite file in project directory
- **Service Configuration**: Windows service or systemd service
- **Port Configuration**: Custom port (e.g., 3001) to avoid conflicts

### Network Access
- **Local Network**: Accessible from maintenance department computers
- **DNS Configuration**: Local hostname or IP address
- **Firewall Rules**: Allow local network access only
- **SSL Certificate**: Self-signed certificate for HTTPS

### Backup Infrastructure
- **Automated Backups**: Scheduled database file copies
- **Multiple Locations**: Backup to different local machines
- **Retention Policy**: Keep 30 days of daily backups
- **Recovery Testing**: Monthly backup restoration tests

---

## Development Environment

### Prerequisites
```bash
# Required software
Node.js 18.x or later
npm or yarn
Git for version control
VS Code (recommended) with extensions:
  - Prisma
  - TypeScript
  - Tailwind CSS IntelliSense
  - ESLint
```

### Setup Commands
```bash
# 1. Initialize project (First Story)
npx create-next-app@latest masirep --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. Install dependencies
cd masirep
npm install prisma @prisma/client
npm install next-auth @auth/prisma-adapter
npm install @tanstack/react-query
npm install react-hook-form @hookform/resolvers zod
npm install @headlessui/react @heroicons/react
npm install lucide-react

# 3. Initialize database
npx prisma init
npx prisma migrate dev --name init
npx prisma generate

# 4. Start development
npm run dev
```

### Development Workflow
1. **Feature Branches**: `git checkout -b feature/story-name`
2. **Database Changes**: Prisma migrations for schema changes
3. **API Development**: API routes first, then frontend integration
4. **Testing**: Manual testing with real data scenarios
5. **Code Quality**: ESLint and TypeScript checks

---

## Architecture Decision Records

### ADR-001: Next.js over Alternative Frameworks
**Decision**: Use Next.js 14 with App Router
**Rationale**: Fullstack integration, excellent local operation, strong TypeScript support
**Alternatives Considered**: Express + React, Fastify + Vue, Remix
**Impact**: Simplified deployment, unified development experience

### ADR-002: SQLite over PostgreSQL
**Decision**: Use SQLite for local database
**Rationale**: Zero configuration, file-based backup, complete offline operation
**Alternatives Considered**: PostgreSQL, MySQL, SQL Server
**Impact**: Simplified deployment, reduced maintenance overhead

### ADR-003: Prisma over Direct SQL
**Decision**: Use Prisma ORM for database operations
**Rationale**: Type safety, migration management, complex relationship handling
**Alternatives Considered**: Direct SQL queries, other ORMs
**Impact**: Better development experience, reduced runtime errors

### ADR-004: React Hook Form over Formik
**Decision**: Use React Hook Form for form management
**Rationale**: Performance, validation integration, smaller bundle size
**Alternatives Considered**: Formik, uncontrolled forms
**Impact**: Better form performance, cleaner code

### ADR-005: Tailwind CSS over CSS Modules
**Decision**: Use Tailwind CSS for styling
**Rationale**: Rapid development, consistent design system, utility-first approach
**Alternatives Considered**: CSS Modules, styled-components, plain CSS
**Impact**: Faster development, design consistency

---

## Consistency Rules

### Naming Conventions
- **Database**: snake_case (repuesto_ubicacion)
- **TypeScript**: PascalCase for types, camelCase for variables
- **API Routes**: kebab-case (/api/repuestos-ubicaciones)
- **Components**: PascalCase (RepuestoForm.tsx)
- **Files**: kebab-case (repuesto-form.tsx)

### Code Organization
- **Features**: Group by domain (repuestos/, componentes/)
- **Shared**: Reusable components in components/ui/
- **Types**: Centralized in types/ directory
- **Utilities**: Helper functions in lib/ directory

### Error Handling
- **API Errors**: Consistent error response format
- **Frontend**: Error boundaries with user-friendly messages
- **Database**: Prisma error handling with user translations
- **Validation**: Zod schemas with detailed error messages

### Testing Strategy
- **Unit Tests**: Business logic and utilities
- **Integration Tests**: API endpoints with database
- **E2E Tests**: Critical user workflows (manual initially)
- **Type Checking**: TypeScript strict mode enabled

---

_This architecture document serves as the consistency contract for all AI agents implementing Masirep. All technical decisions, patterns, and conventions must be followed exactly to ensure coherent system development._