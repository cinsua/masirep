# MEMORIA GITHUB - MASIREP

## SEMANTIC VERSIONING

### Formato: MAJOR.MINOR.PATCH

**MAJOR (v2.0.0)**: Breaking changes
- Cambios en API que rompen compatibilidad
- Modificaciones en schema DB que requieren migración manual
- Cambios en autenticación/autorización

**MINOR (v1.3.0)**: Nuevas features (backward compatible)
- Nuevos endpoints API
- Nuevos componentes UI
- Nuevas funcionalidades en features existentes

**PATCH (v1.2.4)**: Bug fixes y mejoras menores
- Correcciones de bugs
- Mejoras de performance
- Actualizaciones de documentación

### Historial de Versiones

#### v1.0.0 (2024-11-05)
- Release inicial
- Sistema de autenticación con NextAuth
- CRUD básico de Repuestos y Equipos
- 7 técnicos pre-configurados

#### v1.1.0 (2024-11-09)
- feat: Sistema de ubicaciones jerárquico
- feat: Asignación de repuestos a ubicaciones
- feat: Cálculo de stock en tiempo real

#### v1.2.0 (2024-11-09)
- feat: Implementar sistema OpenCode completo
- feat: Sistema de depuración con debug attributes
- feat: Nuevo componente EntityIcon centralizado
- feat: Mejoras en componentes de ubicaciones
- BREAKING CHANGE: Migración de BMAD a OpenCode

#### v1.3.0 (2025-11-09)
- refactor: Complete migration from BMAD to OpenCode framework
- feat: Simplified project structure removing legacy dependencies
- BREAKING CHANGE: Removed entire BMAD framework system

#### [Agregar nuevas versiones aquí]

## CONVENCIONES DE COMMIT ESPECÍFICAS DEL PROYECTO

### Scopes por Módulo
```yaml
# API
api/repuestos
api/equipos
api/ubicaciones
api/componentes
api/stock

# Componentes
components/repuestos
components/equipos
components/ubicaciones
components/forms
components/layout

# Base de datos
db/schema
db/migration
db/seed

# Autenticación
auth/session
auth/middleware
auth/roles
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
  "Leer {project-root}/OPENCODE/MEMORIA/memoria_GITHUB.md",
  "Revisar reporte del REVIEW (estado final)",
  "Verificar branch actual y estrategia de merge"
];

// ❌ PROHIBIDO
const FORBIDDEN = [
  "Commits con mensaje genérico ('fix', 'update', 'wip')",
  "Push directo a 'main' sin PR",
  "Commits que mezclan múltiples tipos (feat + fix)",
  "Mensajes en inglés (proyecto en español)",
  "Commits sin scope cuando el cambio es específico",
  "USAR PATRONES COMO $(cat <<'EOF') - PROHIBIDO ABSOLUTAMENTE",
  "CUALQUIER COMANDO COMPLEJO PARA MENSAJES DE COMMIT"
];

// ✅ OBLIGATORIO
const MANDATORY = [
  "Usar git commit -m \"mensaje\" SIEMPRE",
  "Formato Conventional Commits estricto",
  "Scope específico (componente, api, db, etc.)",
  "Cuerpo del mensaje explicando el 'por qué'",
  "Referencias a issues/tickets si existen",
  "Actualizar memoria_GITHUB.md con decisiones de versioning"
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