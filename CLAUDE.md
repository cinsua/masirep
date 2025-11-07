# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Masirep** is an autonomous inventory management system for maintenance departments. It's built for 7 technicians to operate locally without corporate IT dependencies, managing spare parts, components, equipment, and hierarchical storage locations.

## Technology Stack

- **Framework**: Next.js 16.0.1 (App Router)
- **Language**: TypeScript 5.x
- **Database**: SQLite with Prisma ORM 6.19.0
- **Authentication**: NextAuth.js 4.24.13 (credentials provider)
- **UI Framework**: Tailwind CSS 4.0 with shadcn/ui components
- **Form Handling**: React Hook Form 7.66.0 + Zod 4.1.12
- **Testing**: Jest 30.2.0 + Testing Library 6.9.1/16.3.0

## Development Commands

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

## Architecture Overview

### Database Schema
The system uses a hierarchical storage model:

**Core Entities:**
- **Users**: Authentication with roles (`tecnico`, `admin`, `supervisor`)
- **Repuestos**: Spare parts with stock tracking
- **Componentes**: Electronic components with stock tracking
- **Equipos**: Equipment that uses spare parts
- **Ubicaciones**: Hierarchical storage locations (Location → Cabinet → Drawer → Division)

**Storage Hierarchy:**
```
Ubicación (Location)
├── Armario (Cabinet)
│   ├── Cajón (Drawer)
│   │   └── División (Division)
│   └── Organizador (Organizer)
│       └── Cajoncito (Small Drawer)
└── Estantería (Shelf)
    ├── Estante (Shelf Level)
    └── Organizador (Organizer)
        └── Cajoncito (Small Drawer)
```

### Application Structure
- **App Router**: File-based routing with server/client components
- **API Routes**: RESTful endpoints in `src/app/api/`
- **Authentication**: NextAuth.js with credentials provider
- **Data Layer**: Prisma ORM with type-safe database access
- **Validation**: Zod schemas for API input validation
- **UI**: shadcn/ui components with Tailwind CSS

### Key Patterns
- **Server Components**: Default for non-interactive components
- **Client Components**: Explicit `"use client"` directive for interactivity
- **Route Protection**: Middleware-based authentication
- **Error Handling**: Custom error types and consistent responses
- **Forms**: React Hook Form + Zod integration

## Important Configuration

### Environment Setup
```bash
# Copy and configure environment
cp .env .env.local

# Default development configuration (works out-of-the-box):
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="masirep-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### Pre-configured Test Users
The system includes 7 technicians for testing:
- **Diego Sánchez**: `diego.sanchez@masirep.com` (admin) - `temp123`
- **Ana Martínez**: `ana.martinez@masirep.com` (supervisor) - `temp123`
- **5 other technicians**: `tecnico` role - `temp123`

## Development Workflow

### Database Schema Changes
1. Modify `prisma/schema.prisma`
2. Run `npm run db:migrate` to create migration
3. Run `npm run db:generate` to update Prisma client
4. Update TypeScript types if needed

### Testing New Features
1. Write tests in appropriate `__tests__` directories
2. Use `npm run test:watch` during development
3. Ensure `npm run type-check` passes
4. Verify `npm run lint` reports no issues

### Adding New API Endpoints
1. Create route in `src/app/api/[resource]/route.ts`
2. Use Prisma client for database operations
3. Implement Zod validation for inputs
4. Follow existing error handling patterns
5. Add proper authentication checks if needed

### Authentication & Authorization
- All protected routes require authentication
- Role-based access control (admin, supervisor, tecnico)
- Sessions managed via NextAuth.js with Prisma adapter
- Authentication pages in `src/app/auth/`

## Key Files to Understand

- `src/app/layout.tsx` - Root layout with authentication provider
- `src/lib/auth.ts` - NextAuth.js configuration
- `src/lib/prisma.ts` - Prisma client configuration
- `prisma/schema.prisma` - Complete database schema
- `src/lib/validations/` - Zod validation schemas
- `src/components/ui/` - shadcn/ui component library

## Spanish Language Context

This is a Spanish-language application for Mexican maintenance technicians. All user-facing text, database schema, and documentation should be in Spanish. The system is designed for autonomous operation without corporate dependencies.

## Production Deployment

- Change `NEXTAUTH_SECRET` for production
- Configure `NEXTAUTH_URL` with actual domain
- Run `npm run build` then `npm start`
- Currently uses SQLite but ready for PostgreSQL/MySQL migration