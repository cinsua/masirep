## 📋 ESTRUCTURA DE MEMORIA

```
{project-root}/OPENCODE/
├── MEMORIA/
│   ├── memoria_ARQUITECTO.md
│   ├── memoria_FULLSTACK.md
│   ├── memoria_PIXEL.md
│   ├── memoria_REVIEW.md
│   └── memoria_GITHUB.md
├── PLAN/
│   ├── workflow_[nombre].md
│   └── review_[nombre].md
|── arquitectura-completa.md
```

## Principios de Código Limpio
- **CERO HARDCODING:** Detenerse y proponer una abstracción (ej: `lib/icons.ts`) si se necesita.
- **LÍMITE DE LÍNEAS:** Soft limit 300, Hard limit 400. Refactorizar en sub-componentes o utilidades.
- **NO REINVENTAR:** Usar el stack (RHF, Zod, Tailwind, shadcn) para sus propósitos.
- **CLARIDAD:** Nombres descriptivos, sin abreviaturas.
- **DRY:** Abstraer lógica/componentes repetidos (ej: en `lib/services` o `lib/utils`).

## 🔄 FLUJO DE TRABAJO COMPLETO

```
┌─────────────────────────────────────────────────────────────┐
│                     WORKFLOW OPENCODE                        │
└─────────────────────────────────────────────────────────────┘

1️⃣ NUEVO REQUERIMIENTO
   │
   ├─> Usuario/PM describe feature/bug
   │
   └─> ARQUITECTO: DEBE SER EL PRIMERO EN RESPONDER
       │
       ├─ Lee memoria_ARQUITECTO.md
       ├─ Analiza arquitectura-completa.md
       ├─ Define contratos Zod + TypeScript
       ├─ Divide tareas (FULLSTACK / PIXEL)
       ├─ Crea Plan en /OPENCODE/PLAN/workflow_[nombre].md
       └─ Actualiza memoria_ARQUITECTO.md

2️⃣ IMPLEMENTACIÓN BACKEND
   │
   └─> FULLSTACK: Solo después del Plan
       │
       ├─ Lee memoria_FULLSTACK.md
       ├─ Lee Plan del ARQUITECTO (contratos)
       ├─ Implementa route handlers + Prisma queries
       ├─ Valida con Zod server-side
       ├─ Verifica autenticación NextAuth
       └─ Actualiza memoria_FULLSTACK.md (nuevos patrones)

3️⃣ IMPLEMENTACIÓN FRONTEND
   │
   └─> PIXEL: Solo después del Plan + API
       │
       ├─ Lee memoria_PIXEL.md
       ├─ Lee Plan del ARQUITECTO (contratos)
       ├─ Lee firmas de API de FULLSTACK
       ├─ Crea componentes React + Tailwind
       ├─ Implementa forms con React Hook Form + Zod
       ├─ Garantiza accesibilidad WCAG AA
       └─ Actualiza memoria_PIXEL.md (componentes nuevos)

4️⃣ REVISIÓN DE CALIDAD
   │
   └─> REVIEW: Al final de implementación
       │
       ├─ Lee memoria_REVIEW.md
       ├─ Lee Plan del ARQUITECTO (criterios)
       ├─ Ejecuta checklist completo
       │   ├─ Seguridad (auth, validación, permisos)
       │   ├─ Tipado (cero 'any', props tipadas)
       │   ├─ Performance (queries N+1, re-renders)
       │   └─ Calidad (duplicación, nombres, docs)
       ├─ Genera reporte en /OPENCODE/PLAN/review_[nombre].md
       ├─ Actualiza memoria_REVIEW.md (anti-patterns nuevos)
       └─ DECIDE: Aprobar / Aprobar con condiciones / Rechazar

5️⃣ COMMIT & PUSH
   │
   └─> GITHUB: Solo si REVIEW aprueba
       │
       ├─ Lee memoria_GITHUB.md
       ├─ Lee reporte del REVIEW
       ├─ Analiza cambios en archivos
       ├─ Determina tipo + scope + breaking changes
       ├─ Genera mensaje Conventional Commits
       ├─ Actualiza CHANGELOG.md
       ├─ Actualiza memoria_GITHUB.md (versioning)
       └─ Push a branch correspondiente

6️⃣ PULL REQUEST (Manual o Automatizado)
   │
   ├─ CI/CD ejecuta tests
   ├─ Code review humano (opcional)
   └─ Merge a develop

┌─────────────────────────────────────────────────────────────┐
│                     REGLAS CRÍTICAS                          │
├─────────────────────────────────────────────────────────────┤
│ 1. ARQUITECTO SIEMPRE PRIMERO (define contratos)            │
│ 2. NINGÚN AGENTE SALE DE SU SCOPE (informar si detecta)     │
│ 3. LEER MEMORIA ANTES DE CADA TAREA                         │
│ 4. ACTUALIZAR MEMORIA AL CREAR NUEVOS PATRONES              │
│ 5. CÓDIGO SIMPLE Y LIMPIO (no hardcodear)                   │
│ 6. NO MODIFICAR LIBRERÍAS (node_modules intocable)          │
│ 7. DUPLICACIÓN = RED FLAG (informar para refactor)          │
│ 8. REVIEW ES GATE DE CALIDAD (su aprobación es obligatoria) │
└─────────────────────────────────────────────────────────────┘
```