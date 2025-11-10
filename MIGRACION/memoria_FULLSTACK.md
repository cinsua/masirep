# MEMORIA DEL AGENTE BACKEND (MONOREPO)
# Patrones de Implementación de API FastAPI y Lógica de Negocio

## 1. Stack de Backend Monorepo
- **Runtime:** FastAPI con Python 3.11+ (ubicado en `apps/api/`)
- **ORM:** Prisma ORM 6.19.0 (compartido en `packages/database/`)
- **Base de Datos:** SQLite (local, compartido via packages)
- **Auth:** FastAPI OAuth2 con JWT (sin NextAuth)
- **Validación:** Pydantic v2 (mandatorio para todos los endpoints)

## 2. Patrones de API FastAPI
- **Formato de Respuesta:** `{ data?, error?, success: boolean }`. Esta es la firma de respuesta estándar.
- **Validación:** Pydantic es mandatorio para CADA endpoint. Validar el `body` o `params` con Pydantic models.
- **Métodos:** Usar verbos HTTP estándar (GET, POST, PUT, DELETE).
- **Ubicación:** `apps/api/app/api/[entidad]/[id].py`.

## 3. Patrones de Base de Datos (Compartidos)
- **Acceso:** ÚNICAMENTE a través del cliente Prisma en `packages/database/`.
- **Transacciones:** CUALQUIER cambio de stock (creación, ajuste, eliminación) DEBE registrarse en la tabla `Transaccion`.
- **Lógica de Negocio:** Centralizar lógica compleja en `apps/api/app/services/` (ej: `stock_calculator.py`).

## 4. Principios de Código Limpio
- **CERO HARDCODING:** Especialmente IDs, roles, o strings de conexión. Usar variables de entorno.
- **LÍMITE DE LÍNEAS (300):** API endpoints deben ser cortos. Si la lógica es compleja, moverla a `apps/api/app/services/`.
- **NO REINVENTAR:** No escribir SQL manual si Prisma puede hacerlo. No implementar lógica de auth si FastAPI la provee.

## 5. Contratos API con Pydantic
- **Models:** Definir en `apps/api/app/models/` usando Pydantic v2
- **Sincronización:** Generar tipos TypeScript automáticamente en `packages/types/`
- **Validación:** Usar Field validators para reglas de negocio
- **Documentación:** FastAPI genera Swagger automáticamente desde Pydantic

## PATRONES DE PRISMA (COMPARTIDO)

### Query Optimization Pattern
```python
# ❌ Evitar N+1
malos = await prisma.repuesto.find_many()
for r in malos:
    equipos = await prisma.equipo.find_many(where={'repuestoId': r.id})

# ✅ Usar include/select
buenos = await prisma.repuesto.find_many(
    include={'equipos': {'select': {'id': True, 'nombre': True}}}
)
```

### Transaction Pattern
```python
# Para operaciones múltiples que deben ser atómicas
async with prisma.transaction() as tx:
    repuesto = await tx.repuesto.update(...)
    await tx.transaccion.create(...)
    await tx.repuesto_ubicacion.update_many(...)
```

### Error Handling Pattern
```python
try:
    # operación Prisma
except PrismaKnownRequestError as error:
    if error.code == 'P2002':  # Unique constraint violation
        return {'error': 'El registro ya existe'}
    raise error  # Re-throw unknown errors
```

## PATRONES FASTAPI

### Endpoint Pattern
```python
# apps/api/app/api/repuestos.py
from fastapi import APIRouter, Depends, HTTPException
from app.models.repuesto import RepuestoCreate, RepuestoResponse
from app.services.auth import get_current_user
from packages.database.prisma import prisma

router = APIRouter(prefix="/api/repuestos", tags=["repuestos"])

@router.post("/", response_model=RepuestoResponse)
async def create_repuesto(
    repuesto: RepuestoCreate,
    current_user = Depends(get_current_user)
):
    # Validación Pydantic automática
    # Lógica de negocio
    # Respuesta estandarizada
    pass
```

### Pydantic Model Pattern
```python
# apps/api/app/models/repuesto.py
from pydantic import BaseModel, Field
from typing import Optional

class RepuestoBase(BaseModel):
    codigo: str = Field(..., min_length=1, max_length=50)
    nombre: str = Field(..., min_length=1, max_length=200)
    descripcion: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    numero_parte: Optional[str] = None
    stock_minimo: int = Field(0, ge=0)
    categoria: Optional[str] = None

class RepuestoCreate(RepuestoBase):
    pass

class RepuestoUpdate(BaseModel):
    codigo: Optional[str] = Field(None, min_length=1, max_length=50)
    nombre: Optional[str] = Field(None, min_length=1, max_length=200)
    # ... otros campos opcionales

class RepuestoResponse(RepuestoBase):
    id: int
    stock_actual: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

### Authentication Pattern
```python
# apps/api/app/services/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from jose import JWTError, jwt
from packages.database.prisma import prisma

security = HTTPBearer()

async def get_current_user(token: str = Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await prisma.user.find_unique(where={"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
```

### Service Layer Pattern
```python
# apps/api/app/services/stock_calculator.py
from packages.database.prisma import prisma
from typing import List

class StockCalculator:
    @staticmethod
    async def calculate_stock(repuesto_id: int) -> int:
        """Calcular stock actual desde ubicaciones"""
        result = await prisma.repuesto_ubicacion.aggregate(
            where={"repuesto_id": repuesto_id},
            _sum={"cantidad": True}
        )
        return result._sum["cantidad"] or 0
    
    @staticmethod
    async def check_low_stock(repuesto_id: int) -> bool:
        """Verificar si está por debajo del mínimo"""
        repuesto = await prisma.repuesto.find_unique(
            where={"id": repuesto_id}
        )
        if not repuesto:
            return False
        
        current_stock = await StockCalculator.calculate_stock(repuesto_id)
        return current_stock < repuesto.stock_minimo
```

## INTEGRACIÓN CON MONOREPO

### Dependencias entre Packages
```python
# apps/api/pyproject.toml
dependencies = [
    "fastapi",
    "pydantic",
    "prisma",
    "packages-database",  # Dependencia del package compartido
    "packages-types",     # Para tipos compartidos si aplica
]
```

### Comandos de Desarrollo
```bash
# Desde root del monorepo
cd apps/api
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Generar cliente Prisma (desde packages/database)
cd packages/database && npx prisma generate

# Tests de API
pytest apps/api/tests/
```

### Variables de Entorno
```bash
# apps/api/.env
DATABASE_URL="file:../../../packages/database/dev.db"
SECRET_KEY="your-secret-key"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## COORDINACIÓN CON OTROS AGENTES

### Con ARQUITECTO
- Implementar contratos Pydantic según especificaciones
- Validar estructura de endpoints según plan
- Reportar problemas de integración con packages

### Con FRONT
- Proveer endpoints documentados con Swagger
- Mantener contratos sincronizados con TypeScript
- Coordinar cambios en modelos de datos

### Con DEVOPS
- Especificar requerimientos de variables de entorno
- Coordinar configuración de base de datos compartida
- Validar configuración de CI/CD para API

### Con REVIEW
- Implementar seguridad y validación según estándares
- Optimizar queries y performance
- Documentar patrones y decisiones técnicas