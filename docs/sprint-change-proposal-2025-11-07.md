# Sprint Change Proposal - Separación de Asociación Técnica vs Gestión de Stock

**Fecha:** 2025-11-07
**Autor:** Amelia (Developer Agent)
**Severity:** MAJOR
**Scope:** Fundamental - Cambia el modelo de datos del sistema
**Affected Epics:** 2, 3, 4, 5

---

## **1. Issue Summary**

### **Problema Identificado**
El sistema actualmente implementa incorrectamente la asociación entre repuestos y equipos, confundiendo **asociación técnica** con **asignación de stock**.

### **Comportamiento Actual (INCORRECTO)**
- Al asociar un repuesto a un equipo, se consume stock real
- Se limita la asociación por disponibilidad de stock
- La UI muestra controles de cantidad basados en stock disponible
- El modelo de datos incluye `cantidad` en la relación equipo-repuesto

### **Comportamiento Deseado (CORRECTO)**
- La asociación equipo-repuesto es puramente **referencia técnica**
- Indica "este repuesto sirve para este equipo"
- **NO afecta el stock disponible**
- Un repuesto puede servir a múltiples equipos sin límite de cantidad

### **Contexto del Descubrimiento**
Descubierto durante uso real del sistema: técnicos quieren saber qué repuestos son compatibles con qué equipos, independientemente del stock actual.

---

## **2. Impact Analysis**

### **🔴 Epic Impact - CRÍTICO**

**Epic 2: Core Inventory Management**
- ❌ `RepuestoEquipo` model requiere modificación fundamental
- ❌ API endpoints de asociación necesitan rewrite completo
- ❌ UI components de asociación necesitan redesign
- ❌ Story 2.3 (Equipment Management) afectada directamente

**Epic 3: Hierarchical Storage System**
- ⚠️ Lógica de stock por ubicación no debe ser afectada
- ⚠️ Relación repuesto-equipo-ubicación necesita clarificación
- ❌ Queries de stock actual se volverán más complejas

**Epic 4: Search and Discovery**
- ⚠️ Filtros de búsqueda por "repuestos asociados" cambiarán significado
- ❌ Queries necesitan distinción entre "compatible con" vs "asignado a"

**Epic 5: Stock Management and Reporting**
- 🔴 **MÁS CRÍTICAMENTE AFECTADO**
- ❌ Reportes de stock no deben incluir asociaciones técnicas
- ❌ Alerts de stock bajo no deben considerar asociaciones a equipos
- ❌ Transacciones de stock (entrada/salida) completamente separadas

### **🔴 Artifact Conflicts**

**PRD.md**
- **Sección:** FR-3: Gestión de Equipos
- **Problema:** Línea 91 "Sistema debe asociar repuestos específicos a equipos" es ambigua
- **Requiere:** Clarificación que la asociación es técnica, no de stock

**Architecture.md**
- **Falta:** Definición clara de la separación entre asociación técnica y gestión de stock
- **Requiere:** Nueva sección "Data Model: Technical Associations vs Stock Management"

**Database Schema**
- **Modelo afectado:** `RepuestoEquipo`
- **Cambio requerido:** Eliminar campo `cantidad`
- **Impacto:** Todas las queries y relaciones

### **🔴 Technical Impact**

**Code Files Requiring Changes:**
1. **Database Schema**
   - `prisma/schema.prisma` - Model RepuestoEquipo
   - Migration necesaria

2. **API Endpoints**
   - `src/app/api/equipos/[id]/repuestos/route.ts` - Rewrite completo
   - `src/app/api/repuestos/[id]/equipos/route.ts` - Simetría de cambios
   - Validaciones y tipo changes

3. **UI Components**
   - `src/components/equipos/equipo-repuesto-manager.tsx` - Redesign completo
   - Eliminar controles de cantidad basados en stock
   - Cambiar a selector de compatibilidad técnica

4. **Tests**
   - API tests para endpoints de asociación
   - Component tests para UI de asociación
   - Integration tests para workflows completos

---

## **3. Recommended Approach**

### **🎯 Estrategia Recomendada: Direct Adjustment con Separación Clara**

**Rationale:**
1. El modelo conceptual actual es incorrecto, no solo una implementación defectuosa
2. No hay "rollback" a un estado correcto previo
3. Necesitamos definir el modelo correcto desde el principio

### **🔧 Solución Propuesta**

**1. Nuevo Modelo Conceptual:**
```
Repuesto ←→ Equipo (Asociación Técnica)
├── Este repuesto sirve para este equipo
├── Relación muchos-a-muchos
├── NO implica consumo de stock
└── Independent: Stock management via ubicaciones

Repuesto ←→ Ubicación (Gestión de Stock)
├── X unidades de este repuesto en esta ubicación
├── Control de cantidades reales
└── Afecta stock disponible
```

**2. Schema Changes:**
```prisma
// Modelo CORREGIDO - Asociación Técnica
model RepuestoEquipo {
  id         String   @id @default(cuid())
  repuestoId String
  equipoId   String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  equipo     Equipo   @relation(fields: [equipoId], references: [id], onDelete: Cascade)
  repuesto   Repuesto @relation(fields: [repuestoId], references: [id], onDelete: Cascade)

  @@unique([repuestoId, equipoId])
  @@map("repuesto_equipo")
  // IMPORTANTE: campo 'cantidad' ELIMINADO
}

// Modelo EXISTENTE - Gestión de Stock (sin cambios)
model RepuestoUbicacion {
  id           String      @id @default(cuid())
  repuestoId   String
  cantidad     Int         @default(1)  // ← Este SÍ maneja stock
  armarioId    String?
  estanteriaId String?
  // ... resto del modelo sin cambios
}
```

**3. API Changes:**
```typescript
// ANTES: POST /api/equipos/[id]/repuestos
{
  "repuestoId": "rep-123",
  "cantidad": 5  // ❌ Eliminar
}

// DESPUÉS: POST /api/equipos/[id]/repuestos
{
  "repuestoId": "rep-123"  // ✅ Solo referencia técnica
}
```

### **⏰ Effort Estimate & Timeline**

**Development Effort:** MEDIUM (2-3 days)
- Schema changes & migration: 4 hours
- API endpoints rewrite: 8 hours
- UI component redesign: 6 hours
- Testing & validation: 6 hours

**Risk Assessment:** MEDIUM
- **High Risk:** Data migration (limpieza de datos inconsistentes)
- **Medium Risk:** User experience change
- **Low Risk:** Performance impact (reduce complexity)

---

## **4. Detailed Change Proposals**

### **A. PRD Changes**

**Section:** FR-3: Gestión de Equipos

**OLD:**
```
- Sistema debe asociar repuestos específicos a equipos
```

**NEW:**
```
- Sistema debe asociar repuestos específicos a equipos como **referencia técnica**
- La asociación indica compatibilidad (este repuesto sirve para este equipo)
- La asociación **NO consume stock** ni afecta disponibilidad
- Un mismo repuesto puede servir a múltiples equipos sin límites
- Stock management se mantiene exclusivamente via ubicaciones de almacenamiento
```

### **B. Architecture Changes**

**NEW Section: Data Model Separation**
```markdown
### Data Model: Technical Associations vs Stock Management

**Two Distinct Relationships:**

1. **Repuesto ↔ Equipo (Technical Association)**
   - Purpose: Indicate which spare parts are compatible with which equipment
   - Model: Many-to-many relationship without quantity
   - Impact: Zero effect on stock availability
   - Use Case: "¿Qué repuestos sirven para el equipo ESP20?"

2. **Repuesto ↔ Ubicación (Stock Management)**
   - Purpose: Track physical inventory in specific storage locations
   - Model: Many-to-many relationship with quantity
   - Impact: Determines stock availability and allocation
   - Use Case: "¿Cuántas unidades del repuesto X tenemos disponibles?"

**Key Principle:** Technical associations are independent of stock management. A spare part can be associated with multiple equipment regardless of current stock levels.
```

### **C. Database Schema Changes**

**File:** `prisma/schema.prisma`

**OLD Model (lines 237-249):**
```prisma
model RepuestoEquipo {
  id         String   @id @default(cuid())
  repuestoId String
  equipoId   String
  cantidad   Int      @default(1)  // ← ELIMINAR
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  equipo     Equipo   @relation(fields: [equipoId], references: [id], onDelete: Cascade)
  repuesto   Repuesto @relation(fields: [repuestoId], references: [id], onDelete: Cascade)

  @@unique([repuestoId, equipoId])
  @@map("repuesto_equipo")
}
```

**NEW Model:**
```prisma
model RepuestoEquipo {
  id         String   @id @default(cuid())
  repuestoId String
  equipoId   String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  equipo     Equipo   @relation(fields: [equipoId], references: [id], onDelete: Cascade)
  repuesto   Repuesto @relation(fields: [repuestoId], references: [id], onDelete: Cascade)

  @@unique([repuestoId, equipoId])
  @@map("repuesto_equipo")
  // IMPORTANTE: campo 'cantidad' completamente eliminado
}
```

### **D. API Changes**

**File:** `src/app/api/equipos/[id]/repuestos/route.ts`

**Request Body Changes:**
```typescript
// OLD (line 83):
const { repuestoId, cantidad = 1 } = body;

// NEW:
const { repuestoId } = body;  // Solo repuestoId required

// Remove cantidad validation (lines 85-94 become simpler)
```

**Response Changes:**
```typescript
// OLD Response (lines 46-53):
{
  success: true,
  data: repuestosAsociados,  // Incluye cantidad
  message: `${repuestosAsociados.length} repuestos found for equipo`,
  details: [
    `Equipo: ${equipo.codigo} - ${equipo.nombre}`,
    `Total asociaciones: ${repuestosAsociados.length}`,
  ],
}

// NEW Response:
{
  success: true,
  data: repuestosAsociados,  // Sin campo cantidad
  message: `${repuestosAsociados.length} repuestos compatible with equipo`,
  details: [
    `Equipo: ${equipo.codigo} - ${equipo.nombre}`,
    `Total compatibilities: ${repuestosAsociados.length}`,
  ],
}
```

### **E. UI Component Changes**

**File:** `src/components/equipos/equipo-repuesto-manager.tsx`

**Interface Changes:**
```typescript
// OLD Interface (lines 23-43):
interface RepuestoItem {
  id: string;
  codigo: string;
  nombre: string;
  marca?: string | null;
  modelo?: string | null;
  categoria?: string | null;
  stockActual: number;  // ← Eliminar stock references
  stockMinimo: number;  // ← Eliminar stock references
}

interface Association {
  repuestoId: string;
  cantidad: number;  // ← Eliminar cantidad
}

interface EquipoRepuestoManagerProps {
  equipo: EquipoWithRelations;
  associations: Array<{ repuestoId: string; cantidad: number }>;  // ← Simplificar
  onSave: (associations: Array<{ repuestoId: string; cantidad: number }>) => Promise<void>;  // ← Simplificar
}

// NEW Interface:
interface RepuestoItem {
  id: string;
  codigo: string;
  nombre: string;
  marca?: string | null;
  modelo?: string | null;
  categoria?: string | null;
  // Sin campos de stock
}

interface Association {
  repuestoId: string;
  // Sin campo cantidad
}

interface EquipoRepuestoManagerProps {
  equipo: EquipoWithRelations;
  associations: Array<{ repuestoId: string }>;
  onSave: (associations: Array<{ repuestoId: string }>) => Promise<void>;
}
```

**Component Logic Changes:**
- Eliminar todas las referencias a `cantidad`
- Eliminar validaciones de stock disponible
- Eliminar límites basados en `stockActual`
- Cambiar UI a simple selector de compatibilidad

---

## **5. Implementation Handoff**

### **Change Scope Classification: MAJOR**
- **Impact:** Fundamental data model change
- **Scope:** Affects multiple epics and core business logic
- **Complexity:** Requires database migration and significant code changes

### **Handoff Recipients**

**Primary:** Development Team (Technical Implementation)
- Database schema changes & migration
- API endpoints rewrite
- UI component redesign
- Testing & validation

**Secondary:** Product Owner / Scrum Master (Process Coordination)
- Epic 3-5 story updates
- Sprint replanning considerations
- User acceptance criteria updates

**Tertiary:** Users (Communication)
- Training on new behavior
- Documentation updates
- Process clarification

### **Success Criteria**
1. ✅ Database migration completes without data loss
2. ✅ API endpoints support new association model
3. ✅ UI allows adding/removing technical associations without stock constraints
4. ✅ Stock management remains completely functional via ubicaciones
5. ✅ No performance regression in existing stock-related operations
6. ✅ User can clearly distinguish between "compatible with" vs "assigned to"

### **Risk Mitigation**
1. **Data Migration:** Create backup and test migration thoroughly
2. **User Experience:** Provide clear messaging about new behavior
3. **Rollback Plan:** Maintain ability to revert if critical issues discovered
4. **Testing:** Comprehensive test coverage for both association types

---

## **6. Implementation Priority**

### **Phase 1: Foundation (HIGH PRIORITY)**
1. Database schema changes
2. Migration script
3. Basic API endpoints

### **Phase 2: Core Functionality (HIGH PRIORITY)**
1. UI component redesign
2. Integration testing
3. Documentation updates

### **Phase 3: Epic Impact (MEDIUM PRIORITY)**
1. Review and update Epic 3-5 stories
2. Update PRD sections
3. Architecture documentation

### **Phase 4: Enhancement (LOW PRIORITY)**
1. Additional reporting capabilities
2. Advanced search filters
3. Performance optimizations

---

**Conclusion:** Este cambio es fundamental para corregir un defecto en el modelo de negocio actual. La separación clara entre asociación técnica y gestión de stock alineará el sistema con las necesidades reales de los técnicos de mantenimiento.

**Next Steps:** Awaiting approval to proceed with Phase 1 implementation.