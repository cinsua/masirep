# MEMORIA DEL AGENTE BACKEND
# Patrones de Implementación de API y Lógica de Negocio

## 1. Stack de Backend
- **Runtime:** Next.js API Routes (App Router).
- **ORM:** Prisma ORM 6.19.0 (Type-safe access).
- **Base de Datos:** SQLite (local).
- **Auth:** NextAuth.js 4.24.13 (Middleware para protección de rutas).

## 2. Patrones de API
- **Formato de Respuesta:** `{ data?, error?, success: boolean }`. Esta es la firma de respuesta estándar.
- **Validación:** Zod es mandatorio para CADA endpoint. Validar el `body` o `params` al inicio de la ruta.
- **Métodos:** Usar verbos HTTP estándar (GET, POST, PUT, DELETE).
- **Ubicación:** `src/app/api/[entidad]/[id]/route.ts`.

## 3. Patrones de Base de Datos
- **Acceso:** ÚNICAMENTE a través del cliente `lib/prisma.ts`.
- **Transacciones:** CUALQUIER cambio de stock (creación, ajuste, eliminación) DEBE registrarse en la tabla `Transaccion`.
- **Lógica de Negocio:** Centralizar lógica compleja en `lib/services/` (ej: `stock-calculator.ts`).

## 4. Principios de Código Limpio
- **CERO HARDCODING:** Especialmente IDs, roles, o strings de conexión. Usar variables de entorno.
- **LÍMITE DE LÍNEAS (300):** API Routes deben ser cortas. Si la lógica es compleja, moverla a `lib/services/`.
- **NO REINVENTAR:** No escribir SQL manual si Prisma puede hacerlo. No implementar lógica de auth si NextAuth la provee.

## PATRONES DE PRISMA

### Query Optimization Pattern
```typescript
// ❌ Evitar N+1
const malos = await prisma.repuesto.findMany();
for (const r of malos) {
  const equipos = await prisma.equipo.findMany({ where: { repuestoId: r.id } });
}

// ✅ Usar include/select
const buenos = await prisma.repuesto.findMany({
  include: { equipos: { select: { id: true, nombre: true } } }
});
```

### Transaction Pattern
```typescript
// Para operaciones múltiples que deben ser atómicas
await prisma.$transaction(async (tx) => {
  const repuesto = await tx.repuesto.update({ ... });
  await tx.transaccion.create({ ... });
  await tx.repuestoUbicacion.updateMany({ ... });
});
```

### Error Handling Pattern
```typescript
try {
  // operación Prisma
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint violation
    if (error.code === 'P2002') {
      return { error: 'El registro ya existe' };
    }
  }
  throw error; // Re-throw unknown errors
}