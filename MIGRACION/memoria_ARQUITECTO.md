# MEMORIA DEL AGENTE ARQUITECTO (MONOREPO)
# Principios y Patrones de Diseño Core para Monorepo Masirep

## 1. Arquitectura de Monorepo
Nuestra arquitectura se divide estrictamente en apps/ y packages/. No mezclar responsabilidades:
- **apps/**: Aplicaciones independientes (web, api)
- **packages/**: Código compartido y reutilizable (database, types, ui)
- **PRESENTATION LAYER** (apps/web/src/components/, packages/ui/)
- **BUSINESS LOGIC LAYER** (apps/api/app/, apps/web/src/hooks/)
- **DATA ACCESS LAYER** (packages/database/, packages/types/)
- **INFRASTRUCTURE LAYER** (Turborepo, CI/CD, deploy)

## 2. Modelo de Datos Jerárquico (Compartido)
Toda la gestión de almacenamiento DEBE seguir este modelo jerárquico. Las nuevas entidades deben "encajar" aquí:
- Ubicación
  - Armario -> (Cajón -> División) Y (Organizador -> Cajoncito)
  - Estantería -> (Estante) Y (Organizador -> Cajoncito) Y (Cajón -> División)

## 3. Patrones de Implementación Core
- **API:** FastAPI con Pydantic, formato de respuesta consistente `{ data?, error?, success: boolean }`.
- **Frontend:** Vite + React + TypeScript, separación estricta de Server Components (data fetching) y Client Components (interactividad).
- **Database:** Prisma ORM compartido en packages/database/.
- **Contratos:** Pydantic (backend) ↔ TypeScript (frontend) sincronizados en packages/types/.

## 4. Decisiones Arquitectónicas
- **Monorepo-first:** El sistema usa Turborepo para coordinar builds y dependencias.
- **Auth:** FastAPI OAuth2 con JWT (sin NextAuth).
- **Validación E2E:** Pydantic es mandatorio en el backend y Zod en el frontend para type-safety.
- **Shared Packages:** Database schema, tipos, y UI components son compartidos entre apps.

### Form Validation Pattern
- Backend: FastAPI + Pydantic validation
- Frontend: React Hook Form + Zod validation
- Contracts: Sincronización automática via packages/types/

## 5. Estructura de Monorepo
```
masirep-v2/
├── apps/
│   ├── web/          # Frontend Vite + React + TypeScript
│   └── api/          # Backend FastAPI + Python + Pydantic
├── packages/
│   ├── database/     # Schema Prisma compartido
│   ├── types/        # Tipos TS + contratos API sincronizados
│   └── ui/           # Componentes ShadCN base
├── turbo.json        # Configuración Turborepo
├── package.json      # Root package.json con workspaces
└── docker-compose.yml # Desarrollo local
```

## 6. Contratos API Sincronizados
Los contratos DEBEN mantenerse sincronizados:
- **Backend:** Pydantic models en `apps/api/app/models/`
- **Frontend:** TypeScript interfaces en `packages/types/api.ts`
- **Validación:** Generación automática de tipos desde Pydantic

## 7. Flujo de Trabajo del Monorepo
1. **ARQUITECTO** define contratos y estructura
2. **BACK** implementa endpoints FastAPI con Pydantic
3. **FRONT** implementa UI con tipos de packages/types/
4. **DEVOPS** configura Turborepo y CI/CD
5. **REVIEW** valida integración completa
6. **GITHUB** gestiona versionado del monorepo

## 8. Principios de Diseño para Monorepo
- **Separación de responsabilidades:** Apps específicas vs packages compartidos
- **Dependencias claras:** Sin dependencias circulares
- **Builds optimizados:** Turborepo coordina builds paralelos
- **Versionado semántico:** Coordinado entre packages y apps
- **Despliegue independiente:** Cada app puede desplegarse separadamente