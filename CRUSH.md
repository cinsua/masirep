# CRUSH.md - Development Guide for Masirep

## Project Overview

**Masirep** is an autonomous inventory management system for maintenance departments, built with Next.js 14, TypeScript, Prisma, and SQLite. Designed for 7 technicians to operate locally without corporate IT dependencies.

## Essential Commands

### Development
```bash
npm run dev              # Start development server (http://localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
npm run type-check       # TypeScript type checking
```

### Database Operations
```bash
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with test data
npm run db:reset         # Reset database and reseed (destructive)
npm run db:studio        # Open Prisma Studio (database GUI)
```

### Environment Setup
```bash
# Copy and configure environment
cp .env.example .env.local  # (if .env.example exists)
# Generate secure NextAuth secret
openssl rand -base64 32
# Initialize database
npx prisma migrate dev --name init
npm run db:seed
```

## Architecture & Tech Stack

### Core Technologies
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js v4 with credentials provider
- **UI**: Tailwind CSS + shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── (dashboard)/       # Protected dashboard routes
│   └── dashboard/         # Main dashboard
├── components/
│   ├── ui/               # shadcn/ui base components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client setup
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
└── hooks/                # Custom React hooks
```

### Database Schema

The system manages a hierarchical storage structure:

- **Users**: Authentication with roles (admin, supervisor, tecnico)
- **Equipment**: Machinery/equipment with SAP codes
- **Repuestos**: Spare parts with stock management
- **Componentes**: Electronic components with values/specifications
- **Storage Hierarchy**: Ubicación → Estanteria/Armario → Cajón → División → Organizador → Cajoncito

Key relationships:
- Repuestos ↔ Equipment (many-to-many)
- Repuestos ↔ Storage locations (many-to-many)
- Componentes ↔ Cajoncitos (many-to-many for small parts)

## Code Patterns & Conventions

### Naming Conventions
- **Database**: snake_case (repuesto_ubicacion)
- **TypeScript**: PascalCase for types, camelCase for variables
- **Components**: PascalCase (RepuestoForm.tsx)
- **API Routes**: kebab-case (/api/repuestos-ubicaciones)
- **Files**: kebab-case for non-components, PascalCase for components

### Component Architecture
- Use shadcn/ui base components for consistency
- Server Components for data fetching (default)
- Client Components (`"use client"`) only when interactivity needed
- Forms with React Hook Form + Zod schemas
- Error boundaries with user-friendly fallbacks

### API Patterns
- RESTful API structure in `src/app/api/`
- Consistent response format: `{ data?, error?, success: boolean }`
- Input validation with Zod schemas
- Prisma for type-safe database operations
- Authentication middleware for protected routes

### Authentication Flow
1. **Local Credentials**: Email/password stored in database
2. **Session Management**: JWT tokens in HTTP-only cookies
3. **Route Protection**: Middleware validates authentication
4. **Role-Based Access**: admin/supervisor/tecnico roles

## Security Considerations

### Critical Setup Steps
1. **Generate secure NEXTAUTH_SECRET**: `openssl rand -base64 32`
2. **Configure CORS headers** in next.config.ts for production
3. **Enable HTTPS** in production (required for secure cookies)
4. **Rate limiting** built-in for authentication endpoints

### Security Features
- Password hashing with bcryptjs
- CSRF protection via NextAuth.js
- XSS protection via React
- SQL injection prevention via Prisma ORM
- Rate limiting on auth endpoints
- Security headers configured in next.config.ts

## Pre-configured Test Data

The system includes 7 technician accounts for testing:

| Email | Role | Password |
|-------|------|----------|
| carlos.rodriguez@masirep.com | tecnico | temp123 |
| maría.gonzalez@masirep.com | tecnico | temp123 |
| juan.perez@masirep.com | tecnico | temp123 |
| ana.martinez@masirep.com | supervisor | temp123 |
| luis.fernandez@masirep.com | tecnico | temp123 |
| sofia.lopez@masirep.com | tecnico | temp123 |
| diego.sanchez@masirep.com | admin | temp123 |

**⚠️ Change default passwords in production!**

## Development Workflow

### Before Starting
1. Ensure Node.js 18+ installed
2. Install dependencies: `npm install`
3. Set up environment variables
4. Initialize database: `npm run db:seed`
5. Start dev server: `npm run dev`

### Making Changes
1. **Database Schema Changes**: Create Prisma migration first
2. **API Development**: Build API routes before UI integration
3. **UI Components**: Use existing shadcn/ui patterns
4. **Testing**: Use pre-configured technician accounts
5. **Type Safety**: Always run `npm run type-check` before committing

### Common Gotchas
- **Database resets**: `npm run db:reset` is destructive - clears all data
- **Authentication**: Must configure NEXTAUTH_SECRET for sessions to work
- **Port conflicts**: Default port 3000 - change if needed
- **Rate limiting**: Resets on server restart (stored in memory)
- **Environment variables**: Must restart dev server after changes

## Key Files to Understand

- `src/lib/auth.ts` - NextAuth.js configuration with credentials provider
- `src/middleware.ts` - Authentication and rate limiting middleware
- `prisma/schema.prisma` - Complete database schema with relationships
- `next.config.ts` - Security headers, CORS, and redirects configuration
- `src/components/ui/` - Base shadcn/ui components for consistent styling

## Error Handling Patterns

- **API Errors**: Consistent error response format with error codes
- **Frontend**: Error boundaries with fallback components
- **Database**: Prisma error handling with user-friendly messages
- **Validation**: Zod schemas with detailed error messages
- **Authentication**: Redirect to sign-in page with error messages

## Performance Considerations

- **Database**: Indexed on codigo and descripcion fields for fast search
- **Frontend**: Server Components for data fetching, Client Components for interaction
- **Search**: Optimized for <2 second response times
- **Startup**: Development server starts in <1 second (measured: 711ms)

## Deployment Notes

### Local Production Deployment
1. Set `NODE_ENV=production`
2. Configure `NEXTAUTH_URL` with actual domain
3. Generate secure `NEXTAUTH_SECRET`
4. Run `npm run build && npm start`
5. Configure firewall for local network access only

### Database Backup Strategy
- SQLite file (`prisma/dev.db`) can be copied directly
- Automated backups to local network locations
- Keep 30 days of daily backups
- Test monthly restoration procedures

---

**This guide serves as the consistency contract for all development work in Masirep. Follow these patterns and conventions exactly to ensure coherent system development.**