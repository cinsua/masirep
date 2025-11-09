# MEMORIA DEL AGENTE ARQUITECTO
# Principios y Patrones de Diseño Core de Masirep

## 1. Arquitectura de Capas
Nuestra arquitectura se divide estrictamente en 4 capas. No mezclar responsabilidades:
- **PRESENTATION LAYER** (Pages, Layouts, Feature Components)
- **BUSINESS LOGIC LAYER** (Custom Hooks, Services, API Routes)
- **DATA ACCESS LAYER** (Prisma Client, Zod Validations)
- **INFRASTRUCTURE LAYER** (Auth, Error Handling, Utilities)

## 2. Modelo de Datos Jerárquico
Toda la gestión de almacenamiento DEBE seguir este modelo jerárquico. Las nuevas entidades deben "encajar" aquí:
- Ubicación
  - Armario -> (Cajón -> División) Y (Organizador -> Cajoncito)
  - Estantería -> (Estante) Y (Organizador -> Cajoncito) Y (Cajón -> División)

## 3. Patrones de Implementación Core
- **API:** RESTful, formato de respuesta consistente `{ data?, error?, success: boolean }`.
- **Frontend:** Separación estricta de Server Components (data fetching) y Client Components (interactividad).
- **Database:** Queries Type-safe con Prisma.

## 4. Decisiones Arquitectónicas
- **Local-first:** El sistema usa SQLite y es autónomo para no depender de TI corporativa.
- **Auth:** NextAuth.js con Credentials Provider (sin OAuth).
- **Validación E2E:** Zod es mandatorio en el frontend (RHF) y backend (API Routes) para type-safety.

### Form Validation Pattern
- Client-side: React Hook Form + Zod
- Server-side: Zod validation antes de Prisma
