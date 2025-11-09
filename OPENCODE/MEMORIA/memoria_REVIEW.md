# MEMORIA DEL AGENTE REVIEW
## PATRONES DE PROBLEMAS DETECTADOS

### Security Anti-patterns

#### Problema: Falta de verificación de sesión
```typescript
// ❌ Vulnerable
export async function DELETE(request: NextRequest) {
  await prisma.recurso.delete({ ... });
}

// ✅ Seguro
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  await prisma.recurso.delete({ ... });
}
```

#### Problema: SQL Injection via raw queries
```typescript
// ❌ Vulnerable (si se usara Prisma raw)
await prisma.$queryRaw`SELECT * FROM User WHERE email = ${userInput}`;

// ✅ Usar métodos seguros de Prisma
await prisma.user.findUnique({ where: { email: userInput } });
```

### Performance Anti-patterns

#### Problema: N+1 Queries
```typescript
// ❌ N+1 problem
const repuestos = await prisma.repuesto.findMany();
for (const r of repuestos) {
  r.equipos = await prisma.equipo.findMany({ where: { repuestoId: r.id } });
}

// ✅ Single query
const repuestos = await prisma.repuesto.findMany({
  include: { equipos: true }
});
```

#### Problema: Client Component innecesario
```typescript
// ❌ Fuerza re-render en cliente
'use client';
export default function Page() {
  const data = await fetch('/api/data'); // No funciona
}

// ✅ Server Component
export default async function Page() {
  const data = await fetch('/api/data', { cache: 'no-store' });
  return <ClientList data={data} />;
}
```

### Type Safety Anti-patterns

#### Problema: Uso de 'any'
```typescript
// ❌ Pierde type safety
const handleSubmit = (data: any) => { ... };

// ✅ Tipado explícito
const handleSubmit = (data: CreateRecursoInput) => { ... };
```

## CHECKLIST COMPLETO

### Pre-Review
- [ ] Código compila sin errores TypeScript
- [ ] Tests pasan (si existen)
- [ ] No hay console.log/debugger residuales

### Seguridad
- [ ] Auth verificada en routes protegidas
- [ ] Validación Zod server-side
- [ ] Roles/permisos verificados
- [ ] Secrets en .env, no hardcoded
- [ ] Rate limiting en endpoints públicos

### Performance
- [ ] No hay queries N+1
- [ ] Server Components para data fetching
- [ ] Images optimizadas con next/image
- [ ] Lazy loading donde aplica

### Type Safety
- [ ] Cero uso de 'any'
- [ ] Props tipadas
- [ ] API responses tipadas
- [ ] Zod schemas con z.infer

### Code Quality
- [ ] Sin duplicación de código
- [ ] Nombres descriptivos
- [ ] Comentarios en lógica compleja
- [ ] Sigue convenciones del proyecto

### Accesibilidad
- [ ] aria-labels en botones/iconos
- [ ] Keyboard navigation
- [ ] Contraste de colores WCAG AA
- [ ] Estados de error descriptivos

### [Agregar nuevos patrones aquí]
```