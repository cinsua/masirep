# MEMORIA DEL AGENTE REVIEW (MONOREPO)
## PATRONES DE PROBLEMAS DETECTADOS

### Security Anti-patterns

#### Problema: Falta de verificación de sesión FastAPI
```python
# ❌ Vulnerable
@router.delete("/{id}")
async def delete_repuesto(id: int):
    await prisma.repuesto.delete(where={"id": id})

# ✅ Seguro
@router.delete("/{id}")
async def delete_repuesto(
    id: int,
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await prisma.repuesto.delete(where={"id": id})
```

#### Problema: SQL Injection via raw queries
```python
# ❌ Vulnerable (si se usara Prisma raw)
await prisma.query_raw(f"SELECT * FROM User WHERE email = '{user_input}'")

# ✅ Usar métodos seguros de Prisma
await prisma.user.find_unique(where={"email": user_input})
```

### Performance Anti-patterns

#### Problema: N+1 Queries
```python
# ❌ N+1 problem
repuestos = await prisma.repuesto.find_many()
for r in repuestos:
    r.equipos = await prisma.equipo.find_many(where={"repuesto_id": r.id})

# ✅ Single query
repuestos = await prisma.repuesto.find_many(
    include={"equipos": True}
)
```

#### Problema: Client Component innecesario
```typescript
// ❌ Fuerza re-render en cliente
'use client';
export default function Page() {
  const data = fetch('/api/data'); // No funciona correctamente
}

// ✅ Server Component con Client Component para interactividad
async function Page() {
  const data = await fetch('/api/data', { cache: 'no-store' });
  return <ClientList data={data} />;
}
```

### Type Safety Anti-patterns

#### Problema: Desincronización Pydantic ↔ TypeScript
```python
# ❌ Backend Pydantic
class RepuestoCreate(BaseModel):
    codigo: str = Field(..., min_length=1)
    nombre: str = Field(..., min_length=1)
    stock_minimo: int = Field(0, ge=0)
```

```typescript
// ❌ Frontend TypeScript desincronizado
interface RepuestoCreate {
  codigo: string;
  nombre: string;
  // Falta stock_minimo - ERROR DE SINCRONIZACIÓN
}
```

```typescript
// ✅ Tipado sincronizado (desde packages/types/)
interface RepuestoCreate {
  codigo: string;
  nombre: string;
  stock_minimo: number;
}
```

#### Problema: Uso de 'any'
```typescript
// ❌ Pierde type safety
const handleSubmit = (data: any) => { ... };

// ✅ Tipado explícito desde packages/types/
const handleSubmit = (data: RepuestoCreate) => { ... };
```

## CHECKLIST COMPLETO

### Pre-Review
- [ ] Código compila sin errores TypeScript (apps/web y packages/)
- [ ] Tests pasan (si existen)
- [ ] No hay console.log/debugger residuales
- [ ] Build del monorepo exitoso (`npm run build`)

### Seguridad
- [ ] Auth verificada en endpoints FastAPI protegidos
- [ ] Validación Pydantic server-side
- [ ] Roles/permisos verificados
- [ ] Secrets en .env, no hardcoded
- [ ] Rate limiting en endpoints públicos
- [ ] CORS configurado correctamente

### Performance
- [ ] No hay queries N+1 en backend
- [ ] Server Components para data fetching
- [ ] Images optimizadas con next/image
- [ ] Lazy loading donde aplica
- [ ] Bundle sizes optimizados
- [ ] Cache de Turborepo efectivo

### Type Safety
- [ ] Cero uso de 'any' en frontend
- [ ] Props tipadas en componentes
- [ ] API responses tipadas (Pydantic ↔ TypeScript)
- [ ] Zod schemas con z.infer
- [ ] Contratos sincronizados entre apps y packages

### Code Quality
- [ ] Sin duplicación de código
- [ ] Nombres descriptivos
- [ ] Comentarios en lógica compleja
- [ ] Sigue convenciones del proyecto
- [ ] Componentes reutilizables en packages/ui/

### Integración Monorepo
- [ ] Dependencias correctamente definidas entre packages
- [ ] Sin dependencias circulares
- [ ] Builds paralelos funcionando
- [ ] Imports relativos correctos (@masirep/*)
- [ ] Versiones sincronizadas

### Accesibilidad
- [ ] aria-labels en botones/iconos
- [ ] Keyboard navigation
- [ ] Contraste de colores WCAG AA
- [ ] Estados de error descriptivos
- [ ] Screen reader support

### Testing
- [ ] Tests de API (FastAPI)
- [ ] Tests de componentes (React)
- [ ] Tests de integración (monorepo)
- [ ] Coverage mínimo aceptable
- [ ] Tests de contratos API

### [Agregar nuevos patrones aquí]

## PATRONES ESPECÍFICOS DE MONOREPO

### Validación de Contratos
```bash
# Verificar sincronización Pydantic ↔ TypeScript
npm run verify-contracts

# Generar tipos desde Pydantic
npm run generate-types

# Build de packages compartidos
cd packages/types && npm run build
cd packages/ui && npm run build
```

### Testing de Integración
```bash
# Tests completos del monorepo
npm run test

# Tests por app
cd apps/api && npm run test
cd apps/web && npm run test

# Tests de packages
cd packages/types && npm run test
cd packages/ui && npm run test
```

### Build y Deploy
```bash
# Build completo del monorepo
npm run build

# Build por app
npm run build:api
npm run build:web

# Deploy específico
npm run deploy:api
npm run deploy:web
```

## COORDINACIÓN CON OTROS AGENTES

### Con ARQUITECTO
- Validar que contratos estén implementados correctamente
- Verificar estructura del monorepo según especificaciones
- Revisar decisiones de ubicación (apps vs packages)

### Con BACK (FastAPI)
- Revisar seguridad y validación Pydantic
- Optimizar queries y performance
- Validar documentación Swagger
- Verificar manejo de errores

### Con FRONT (Vite + React)
- Revisar integración con packages compartidos
- Validar accesibilidad WCAG AA
- Optimizar performance de componentes
- Verificar tipado TypeScript

### Con DEVOPS
- Validar configuración de Turborepo
- Revisar pipeline de CI/CD
- Verificar configuración de deploy
- Optimizar builds y cache

### Con GITHUB
- Validar estrategia de versionado
- Revisar convenciones de commits
- Coordinar releases del monorepo
- Validar changelog automático