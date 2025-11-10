# MEMORIA GITHUB - MASIREP (MONOREPO)
## SEMANTIC VERSIONING PARA MONOREPO

### Formato: MAJOR.MINOR.PATCH

**MAJOR (v2.0.0)**: Breaking changes en el monorepo
- Cambios en estructura apps/packages que rompen compatibilidad
- Modificaciones en schema DB que requieren migración manual
- Cambios en autenticación/autorización entre apps
- Actualizaciones mayores de dependencias compartidas

**MINOR (v1.3.0)**: Nuevas features (backward compatible)
- Nuevos endpoints API en apps/api
- Nuevos componentes UI en packages/ui
- Nuevas funcionalidades en apps/web
- Nuevos tipos compartidos en packages/types

**PATCH (v1.2.4)**: Bug fixes y mejoras menores
- Correcciones de bugs en cualquier app/package
- Mejoras de performance del monorepo
- Actualizaciones de documentación
- Optimización de builds de Turborepo

### Historial de Versiones

#### v1.0.0 (2024-11-05)
- Release inicial del monorepo
- Sistema de autenticación con FastAPI + JWT
- CRUD básico de Repuestos y Equipos
- 7 técnicos pre-configurados
- Estructura inicial apps/packages

#### v1.1.0 (2024-11-09)
- feat: Sistema de ubicaciones jerárquico
- feat: Asignación de repuestos a ubicaciones
- feat: Cálculo de stock en tiempo real
- packages/types: Contratos API sincronizados

#### v1.2.0 (2024-11-09)
- feat: Implementar sistema OpenCode completo
- feat: Sistema de depuración con debug attributes
- feat: Nuevo componente EntityIcon centralizado
- feat: Mejoras en componentes de ubicaciones
- BREAKING CHANGE: Migración de BMAD a OpenCode

#### v2.0.0 (2025-11-09)
- BREAKING CHANGE: Migración a monorepo Vite + FastAPI
- BREAKING CHANGE: Remoción completa de Next.js/Node.js
- feat: Turborepo para coordinación de builds
- feat: Packages compartidos (database, types, ui)
- feat: Deploy independiente por app

#### [Agregar nuevas versiones aquí]

## CONVENCIONES DE COMMIT ESPECÍFICAS DEL MONOREPO

### Scopes por App/Package
```yaml
# Apps
api/repuestos
api/equipos
api/ubicaciones
web/repuestos
web/equipos
web/ubicaciones

# Packages
packages/database
packages/types
packages/ui

# Monorepo
build/turborepo
ci/cd
deps/shared
```

## 🚨 REGLA CRÍTICA: FORMATO DE COMMIT

### ❌ NUNCA USAR PATRONES COMPLEJOS
```bash
# ❌ ESTO ESTÁ PROHIBIDO - Causa errores en GitHub
git commit -m "$(cat <<'EOF')
feat(api): agregar endpoint
EOF
)"

# ❌ TAMBIÉN PROHIBIDO
git commit -m "$(printf "feat: %s" "$mensaje")"
git commit -m "$(echo "feat: mensaje")"
```

### ✅ SIEMPRE USAR FORMATO SIMPLE
```bash
# ✅ ÚNICO FORMATO PERMITIDO
git commit -m "feat(api): agregar endpoint para gestión de usuarios"

# ✅ CON CUERPO OPCIONAL
git commit -m "fix(auth): corregir validación de tokens

El middleware no estaba validando correctamente la expiración
de tokens JWT, permitiendo acceso no autorizado.

Resuelve: #123"
```

## REGLAS CRÍTICAS
```typescript
// 🚨 SIEMPRE LEER ANTES DE INICIAR
const BEFORE_START = [
  "Leer {project-root}/agent-workspace/MEMORIA/memoria_GITHUB.md",
  "Revisar reporte del REVIEW (estado final)",
  "Verificar branch actual y estrategia de merge",
  "Identificar apps/packages afectados"
];

// ❌ PROHIBIDO
const FORBIDDEN = [
  "Commits con mensaje genérico ('fix', 'update', 'wip')",
  "Push directo a 'main' sin PR",
  "Commits que mezclan múltiples tipos (feat + fix)",
  "Mensajes en inglés (proyecto en español)",
  "Commits sin scope cuando el cambio es específico",
  "USAR PATRONES COMO $(cat <<'EOF') - PROHIBIDO ABSOLUTAMENTE",
  "CUALQUIER COMANDO COMPLEJO PARA MENSAJES DE COMMIT",
  "Cambios en packages sin actualizar versiones"
];

// ✅ OBLIGATORIO
const MANDATORY = [
  "Usar git commit -m \"mensaje\" SIEMPRE",
  "Formato Conventional Commits estricto",
  "Scope específico (app/package, ej: api/repuestos)",
  "Cuerpo del mensaje explicando el 'por qué'",
  "Referencias a issues/tickets si existen",
  "Actualizar memoria_GITHUB.md con decisiones de versioning",
  "Versionar packages cuando hay cambios breaking",
  "Ejecutar npm run build para validar integración"
];
```

## 🔍 RECUPERACIÓN DE ERRORES

Si cometiste el error de usar patrones complejos:

```bash
# 1. Identificar commits problemáticos
git log --oneline | grep "\$(cat"

# 2. Corregir último commit
git commit --amend -m "feat(api): mensaje correcto y simple"

# 3. Para múltiples commits
git rebase -i HEAD~N  # y editar los mensajes manualmente
```

## VERSIONADO DE PACKAGES

### Lerna/Nx Style Versioning
```bash
# Para cambios en packages compartidos
npm run version:patch  # packages/types@1.0.1
npm run version:minor  # packages/ui@1.1.0
npm run version:major  # packages/database@2.0.0

# Publicar packages
npm run publish:packages

# Actualizar dependencias en apps
npm run update:deps
```

### Coordinación de Versiones
```json
// package.json (root)
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "version:patch": "lerna version patch --yes",
    "version:minor": "lerna version minor --yes",
    "version:major": "lerna version major --yes",
    "publish:packages": "lerna publish from-package --yes",
    "update:deps": "npm install && lerna bootstrap"
  }
}
```

## 🔄 FLUJO DE TRABAJO CON MONOREPO

### 1. Desarrollo Local
```bash
# Instalar dependencias del monorepo
npm install

# Desarrollo simultáneo
npm run dev          # Inicia API (8000) + Web (3000)

# Desarrollo individual
cd apps/api && npm run dev    # Solo API
cd apps/web && npm run dev    # Solo Web
```

### 2. Builds y Testing
```bash
# Build completo del monorepo
npm run build

# Build por app
npm run build:api
npm run build:web

# Tests completos
npm run test

# Tests por app
npm run test:api
npm run test:web
```

### 3. Commits y Versionado
```bash
# 1. Hacer cambios en apps/packages
git add .

# 2. Commit con formato estándar
git commit -m "feat(api): agregar endpoint de ubicaciones"

# 3. Si hay cambios en packages, versionar
npm run version:patch

# 4. Push con tags
git push origin main --tags
```

## 📋 ESTRATEGIA DE DEPLOY

### Deploy Independiente por App
```yaml
# API (FastAPI)
provider: Railway/Render
trigger: push a main en apps/api/
build: npm run build:api
env: DATABASE_URL, SECRET_KEY

# Web (Vite)
provider: Vercel/Netlify
trigger: push a main en apps/web/
build: npm run build:web
env: VITE_API_URL
```

### Deploy de Packages
```yaml
# Packages (npm registry)
trigger: version change en packages/
build: npm run build:packages
publish: npm run publish:packages
```

## 📊 MONITOREO Y LOGGING

### Métricas del Monorepo
- Build time: Tiempo de npm run build
- Bundle size: Tamaño de apps/web/dist
- Test coverage: Porcentaje de cobertura
- Package versions: Sincronización de versiones
- CI/CD duration: Tiempo de pipeline

### Alertas Automáticas
- Build failures en cualquier app/package
- Dependencias desincronizadas
- Tests fallidos en CI/CD
- Version breaking sin changelog

## 🏷️ ETIQUETADO Y RELEASES

### Git Tags
```bash
# Crear tag para release
git tag -a v2.0.0 -m "Release v2.0.0: Monorepo migration"

# Push tags
git push origin --tags

# Automated release desde GitHub Actions
# Genera changelog automáticamente
```

### Changelog Automático
```markdown
# CHANGELOG.md
## [2.0.0] - 2025-11-09
### Breaking Changes
- Migración completa a monorepo Vite + FastAPI
- Remoción de Next.js y Node.js

### Added
- Turborepo para coordinación de builds
- Packages compartidos (database, types, ui)
- Deploy independiente por app

### Changed
- Actualización de dependencias principales
- Mejoras en performance de builds
```

## 🎯 DECISIONES DE VERSIONADO

### Cuándo hacer MAJOR
- Cambios en estructura del monorepo
- Breaking changes en packages compartidos
- Migraciones de tecnología principales
- Cambios en contratos API que afectan múltiples apps

### Cuándo hacer MINOR
- Nuevas features en apps individuales
- Nuevos componentes en packages/ui
- Nuevos tipos en packages/types
- Mejoras en configuración de Turborepo

### Cuándo hacer PATCH
- Bug fixes en cualquier app/package
- Mejoras de performance
- Actualizaciones de documentación
- Correcciones en CI/CD