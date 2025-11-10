## 📋 ESTRUCTURA DE MEMORIA - MONOREPO V2

```
{project-root}/MIGRACION/
├── memoria_ARQUITECTO.md
├── memoria_FULLSTACK.md
├── memoria_PIXEL.md
├── memoria_REVIEW.md
├── memoria_DEVOPS.md
└── memoria_GITHUB.md

{project-root}/agent-workspace/
├── MEMORIA/
│   ├── memoria_ARQUITECTO.md
│   ├── memoria_FULLSTACK.md
│   ├── memoria_PIXEL.md
│   ├── memoria_REVIEW.md
│   ├── memoria_DEVOPS.md
│   └── memoria_GITHUB.md
├── PLAN/
│   ├── workflow_[nombre].md
│   └── review_[nombre].md
└── arquitectura-completa.md
```

## 🏗️ NUEVO STACK TECNOLÓGICO

### Frontend (Vite + React)
- **Runtime:** Vite + React 19.2.0 (apps/web/)
- **Styling:** Tailwind CSS 4.0
- **Componentes:** shadcn/ui desde packages/ui/
- **Tipado:** TypeScript strict con packages/types/
- **Data Fetching:** React Query + hooks personalizados

### Backend (FastAPI + Python)
- **Runtime:** FastAPI + Python 3.11+ (apps/api/)
- **Validación:** Pydantic v2 (mandatorio)
- **Base de Datos:** Prisma ORM (packages/database/)
- **Auth:** FastAPI OAuth2 con JWT
- **Documentación:** Swagger automática

### Monorepo
- **Orquestación:** Turborepo
- **Estructura:** apps/ + packages/
- **Compartido:** database, types, ui
- **Build:** Paralelo optimizado

## 🔄 FLUJO DE TRABAJO DEL MONOREPO

```
┌─────────────────────────────────────────────────────────────┐
│                 WORKFLOW MONOREPO V2                        │
└─────────────────────────────────────────────────────────────┘

1️⃣ NUEVO REQUERIMIENTO
   │
   ├─> Usuario/PM describe feature/bug
   │
   └─> ARQUITECTO: DEBE SER EL PRIMERO EN RESPONDER
       │
       ├─ Lee memoria_ARQUITECTO.md
       ├─ Analiza arquitectura del monorepo
       ├─ Define contratos Pydantic + TypeScript
       ├─ Divide tareas (BACK / FRONT / DEVOPS)
       ├─ Crea Plan en /agent-workspace/PLAN/workflow_[nombre].md
       └─ Actualiza memoria_ARQUITECTO.md

2️⃣ IMPLEMENTACIÓN BACKEND
   │
   └─> BACK: Solo después del Plan
       │
       ├─ Lee memoria_FULLSTACK.md
       ├─ Lee Plan del ARQUITECTO (contratos Pydantic)
       ├─ Implementa endpoints FastAPI + Prisma
       ├─ Valida con Pydantic server-side
       ├─ Verifica autenticación FastAPI JWT
       └─ Actualiza memoria_FULLSTACK.md (nuevos patrones)

3️⃣ IMPLEMENTACIÓN FRONTEND
   │
   └─> FRONT: Solo después del Plan + API
       │
       ├─ Lee memoria_PIXEL.md
       ├─ Lee Plan del ARQUITECTO (contratos)
       ├─ Lee tipos desde packages/types/
       ├─ Crea componentes React + Tailwind
       ├─ Implementa forms con React Hook Form + Zod
       ├─ Garantiza accesibilidad WCAG AA
       └─ Actualiza memoria_PIXEL.md (componentes nuevos)

4️⃣ CONFIGURACIÓN DE INFRAESTRUCTURA
   │
   └─> DEVOPS: Durante y después de implementación
       │
       ├─ Lee memoria_DEVOPS.md
       ├─ Configura Turborepo para builds óptimos
       ├─ Establece pipelines de CI/CD
       ├─ Configura variables de entorno
       ├─ Optimiza deploy de apps y packages
       └─ Actualiza memoria_DEVOPS.md (nuevos patrones)

5️⃣ REVISIÓN DE CALIDAD
   │
   └─> REVIEW: Al final de implementación
       │
       ├─ Lee memoria_REVIEW.md
       ├─ Lee Plan del ARQUITECTO (criterios)
       ├─ Ejecuta checklist completo
       │   ├─ Seguridad (FastAPI auth, Pydantic validation)
       │   ├─ Tipado (cero 'any', contratos sincronizados)
       │   ├─ Performance (queries N+1, builds Turborepo)
       │   └─ Calidad (integración monorepo, packages)
       ├─ Genera reporte en /agent-workspace/PLAN/review_[nombre].md
       ├─ Actualiza memoria_REVIEW.md (anti-patterns nuevos)
       └─ DECIDE: Aprobar / Aprobar con condiciones / Rechazar

6️⃣ COMMIT & PUSH
   │
   └─> GITHUB: Solo si REVIEW aprueba
       │
       ├─ Lee memoria_GITHUB.md
       ├─ Lee reporte del REVIEW
       ├─ Analiza cambios en apps/packages
       ├─ Determina tipo + scope + breaking changes
       ├─ Genera mensaje Conventional Commits
       ├─ Versiona packages si es necesario
       ├─ Actualiza memoria_GITHUB.md (versioning)
       └─ Push a branch correspondiente

7️⃣ DEPLOY AUTOMÁTICO
   │
   ├─ CI/CD ejecuta pipelines según cambios
   ├─ Deploy independiente por app (API → Railway, Web → Vercel)
   ├─ Deploy de packages a npm registry
   └─ Monitoreo y logging automático

┌─────────────────────────────────────────────────────────────┐
│                 REGLAS CRÍTICAS MONOREPO                     │
├─────────────────────────────────────────────────────────────┤
│ 1. ARQUITECTO SIEMPRE PRIMERO (define contratos)            │
│ 2. CADA AGENTE EN SU SCOPE (apps vs packages)               │
│ 3. LEER MEMORIA ANTES DE CADA TAREA                         │
│ 4. ACTUALIZAR MEMORIA AL CREAR NUEVOS PATRONES              │
│ 5. CÓDIGO SIMPLE Y LIMPIO (no hardcodear)                   │
│ 6. NO MODIFICAR LIBRERÍAS (node_modules intocable)          │
│ 7. DUPLICACIÓN = RED FLAG (informar para refactor)          │
│ 8. REVIEW ES GATE DE CALIDAD (su aprobación es obligatoria) │
│ 9. CONTRATOS SINCRONIZADOS (Pydantic ↔ TypeScript)           │
│10. BUILDS PARALELOS (Turborepo optimization)                 │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ ESTRUCTURA DEL MONOREPO

```
masirep-v2/
├── apps/
│   ├── web/                     # Frontend Vite + React
│   │   ├── src/
│   │   │   ├── components/       # Componentes específicos
│   │   │   ├── hooks/          # Hooks personalizados
│   │   │   ├── lib/            # API client, utils
│   │   │   └── pages/          # Páginas React Router
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── api/                     # Backend FastAPI + Python
│       ├── app/
│       │   ├── api/            # Endpoints API
│       │   ├── models/         # Modelos Pydantic
│       │   ├── services/       # Lógica de negocio
│       │   └── main.py         # Entry point
│       ├── requirements.txt
│       └── pyproject.toml
│
├── packages/
│   ├── database/                # Schema Prisma compartido
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── prisma-client.ts
│   ├── types/                  # Tipos compartidos
│   │   ├── api.ts             # Contratos API
│   │   └── database.ts        # Tipos DB
│   └── ui/                     # Componentes ShadCN base
│       ├── components/         # Button, Input, etc.
│       └── styles/            # Tailwind config
│
├── turbo.json                 # Configuración Turborepo
├── package.json               # Root con workspaces
├── docker-compose.yml         # Desarrollo local
└── .github/workflows/         # CI/CD pipelines
```

## 🎯 ROLES Y RESPONSABILIDADES

### 🏗️ ARQUITECTO
- **FOCO:** Diseño del sistema y contratos
- **MEMORIA:** `memoria_ARQUITECTO.md`
- **RESPONSABILIDADES:**
  - Definir estructura del monorepo (apps/packages)
  - Diseñar contratos Pydantic ↔ TypeScript
  - Establecer patrones de implementación
  - Validar decisiones técnicas

### ⚙️ BACK (FULLSTACK)
- **FOCO:** API FastAPI y lógica de negocio
- **MEMORIA:** `memoria_FULLSTACK.md`
- **RESPONSABILIDADES:**
  - Implementar endpoints FastAPI con Pydantic
  - Gestionar Prisma ORM (packages/database/)
  - Implementar autenticación JWT
  - Optimizar queries y performance

### 🎨 FRONT (PIXEL)
- **FOCO:** UI React y experiencia de usuario
- **MEMORIA:** `memoria_PIXEL.md`
- **RESPONSABILIDADES:**
  - Crear componentes React con Tailwind
  - Implementar forms con React Hook Form + Zod
  - Consumir API FastAPI con tipos sincronizados
  - Garantizar accesibilidad WCAG AA

### 🚀 DEVOPS
- **FOCO:** Infraestructura y deploy
- **MEMORIA:** `memoria_DEVOPS.md`
- **RESPONSABILIDADES:**
  - Configurar Turborepo y builds paralelos
  - Establecer pipelines de CI/CD
  - Gestionar deploy de apps y packages
  - Monitorear performance y logs

### 🛡️ REVIEW
- **FOCO:** Calidad y seguridad
- **MEMORIA:** `memoria_REVIEW.md`
- **RESPONSABILIDADES:**
  - Validar seguridad y performance
  - Revisar sincronización de contratos
  - Ejecutar checklist de calidad
  - Generar reportes de revisión

### 📦 GITHUB
- **FOCO:** Versionado y releases
- **MEMORIA:** `memoria_GITHUB.md`
- **RESPONSABILIDADES:**
  - Gestionar versionado semántico
  - Coordinar commits convencionales
  - Versionar packages compartidos
  - Gestionar releases del monorepo

## 🔄 PATRONES DE COMUNICACIÓN

### Entre ARQUITECTO y BACK
```yaml
ARQUITECTO → BACK:
  - Contratos Pydantic definidos
  - Estructura de endpoints
  - Requisitos de validación

BACK → ARQUITECTO:
  - Implementación de contratos
  - Problemas de integración
  - Sugerencias de optimización
```

### Entre BACK y FRONT
```yaml
BACK → FRONT:
  - Endpoints documentados con Swagger
  - Tipos Pydantic generados
  - Cambios en contratos API

FRONT → BACK:
  - Requerimientos de datos
  - Problemas de consumo
  - Sugerencias de endpoints
```

### Entre FRONT y DEVOPS
```yaml
FRONT → DEVOPS:
  - Variables de entorno necesarias
  - Requisitos de build
  - Optimización de assets

DEVOPS → FRONT:
  - Configuración de Vite
  - Estrategias de deploy
  - Métricas de performance
```

## 📋 PRINCIPIOS DE CÓDIGO LIMPIO

### Para TODO el Monorepo
- **CERO HARDCODING:** Usar variables de entorno y configuración
- **LÍMITE DE LÍNEAS:** Soft limit 300, Hard limit 400
- **NO REINVENTAR:** Usar el stack (FastAPI, Vite, Prisma, ShadCN)
- **CLARIDAD:** Nombres descriptivos, sin abreviaturas
- **DRY:** Abstraer lógica en packages compartidos

### Específico por Agente

#### BACK (FastAPI)
```python
# ✅ Patrón correcto
@router.post("/repuestos/", response_model=RepuestoResponse)
async def create_repuesto(
    repuesto: RepuestoCreate,
    current_user = Depends(get_current_user)
):
    # Validación Pydantic automática
    # Lógica de negocio en services/
    # Respuesta estandarizada
```

#### FRONT (React)
```typescript
// ✅ Patrón correcto
import { RepuestoCreate } from '@masirep/types';
import { Button } from '@masirep/ui';

export const RepuestoForm = () => {
  const createRepuesto = useCreateRepuesto();
  // Tipado estricto desde packages/types/
  // Componentes desde packages/ui/
};
```

#### DEVOPS (Turborepo)
```json
// ✅ Configuración óptima
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

## 🚨 REGLAS CRÍTICAS DEL MONOREPO

### 1. CONTRATOS SINCRONIZADOS
```bash
# ❌ Prohibido: Desincronización
# Backend Pydantic tiene campo "stock_minimo"
# Frontend TypeScript no lo tiene

# ✅ Obligatorio: Sincronización
# packages/types/api.ts se genera desde Pydantic
# Ambos lados usan los mismos tipos
```

### 2. DEPENDENCIAS CLARAS
```bash
# ✅ Apps dependen de packages
apps/web → @masirep/ui, @masirep/types
apps/api → packages/database

# ❌ Prohibido: Dependencias circulares
packages/ui → apps/web (CIRCULAR)
```

### 3. BUILDS PARALELOS
```bash
# ✅ Turborepo optimiza builds
npm run build  # Ejecuta en paralelo apps y packages

# ✅ Builds específicos
npm run build:api  # Solo API y sus dependencias
npm run build:web  # Solo Web y sus dependencias
```

### 4. VERSIONADO COORDINADO
```bash
# ✅ Cambios en packages requieren versionado
npm run version:patch  # packages/types@1.0.1

# ✅ Apps referencian versiones específicas
"@masirep/types": "1.0.1"
```

## 🎯 FLUJO DE TRABAJO PRÁCTICO

### Desarrollo Local
```bash
# 1. Instalar dependencias del monorepo
npm install

# 2. Iniciar desarrollo simultáneo
npm run dev  # API (8000) + Web (3000)

# 3. Desarrollo individual
npm run dev:api  # Solo backend
npm run dev:web  # Solo frontend
```

### Implementación de Feature
```bash
# 1. ARQUITECTO crea plan
echo "Plan creado en agent-workspace/PLAN/"

# 2. BACK implementa API
cd apps/api
# Implementar endpoints FastAPI

# 3. FRONT implementa UI
cd apps/web
# Implementar componentes React

# 4. REVIEW valida
npm run build  # Build completo
npm run test   # Tests completos

# 5. GITHUB versiona
git commit -m "feat(api): agregar endpoint de repuestos"
npm run version:patch  # Si hay cambios en packages
```

### Deploy Automático
```yaml
# Push a main → CI/CD → Deploy automático
apps/api changes → Deploy a Railway
apps/web changes → Deploy a Vercel
packages/* changes → Publish a npm
```

## 📊 MÉTRICAS DE ÉXITO

### Calidad Técnica
- ✅ Cero errores TypeScript
- ✅ Cero vulnerabilidades de seguridad
- ✅ Build time < 30 segundos
- ✅ Test coverage > 80%

### Performance
- ✅ API response time < 200ms
- ✅ Web bundle size < 1MB
- ✅ Lighthouse score > 90
- ✅ Cache hit rate > 80%

### Developer Experience
- ✅ Hot reload < 1 segundo
- ✅ Onboarding < 2 horas
- ✅ Documentación completa
- ✅ Debugging fácil

---
