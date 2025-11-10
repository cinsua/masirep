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