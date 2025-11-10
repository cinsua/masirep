# MEMORIA DEL AGENTE DEVOPS (MONOREPO)
# Patrones de Implementación de Infraestructura y Deploy

## 1. Stack de DevOps Monorepo
- **Orquestación:** Turborepo (coordinación de builds y dependencias)
- **CI/CD:** GitHub Actions (automatización de pipelines)
- **Containerización:** Docker + Docker Compose (desarrollo local)
- **Deploy:** 
  - API (FastAPI): Railway/Render
  - Web (Vite): Vercel/Netlify
  - Packages: npm registry
- **Monitoreo:** Logs y métricas básicas

## 2. Estructura de Configuración
```
masirep-v2/
├── .github/
│   └── workflows/           # GitHub Actions
│       ├── ci.yml          # Build y test del monorepo
│       ├── deploy-api.yml   # Deploy de API
│       └── deploy-web.yml   # Deploy de Web
├── docker-compose.yml        # Desarrollo local
├── Dockerfile.api          # Imagen de API
├── Dockerfile.web          # Imagen de Web (opcional)
├── turbo.json             # Configuración Turborepo
└── package.json           # Workspaces y scripts
```

## 3. Patrones de Turborepo

### Configuración Principal
```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

### Scripts del Monorepo
```json
// package.json (root)
{
  "name": "masirep-v2",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean",
    "build:api": "turbo run build --filter=api",
    "build:web": "turbo run build --filter=web",
    "dev:api": "turbo run dev --filter=api",
    "dev:web": "turbo run dev --filter=web",
    "test:api": "turbo run test --filter=api",
    "test:web": "turbo run test --filter=web",
    "version:patch": "lerna version patch --yes",
    "version:minor": "lerna version minor --yes",
    "version:major": "lerna version major --yes",
    "publish:packages": "lerna publish from-package --yes"
  },
  "devDependencies": {
    "turbo": "^1.10.0",
    "lerna": "^7.0.0"
  }
}
```

## 4. Patrones de CI/CD

### Pipeline Principal (GitHub Actions)
```yaml
// .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build monorepo
        run: npm run build
      
      - name: Run tests
        run: npm run test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Deploy de API
```yaml
// .github/workflows/deploy-api.yml
name: Deploy API

on:
  push:
    paths:
      - 'apps/api/**'
      - 'packages/database/**'
      - 'packages/types/**'
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        uses: railway-app/railway-action@v1
        with:
          api-token: ${{ secrets.RAILWAY_TOKEN }}
          service: ${{ secrets.RAILWAY_SERVICE_ID }}
```

### Deploy de Web
```yaml
// .github/workflows/deploy-web.yml
name: Deploy Web

on:
  push:
    paths:
      - 'apps/web/**'
      - 'packages/ui/**'
      - 'packages/types/**'
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build web app
        run: npm run build:web
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./apps/web
```

## 5. Patrones de Docker

### Docker Compose (Desarrollo)
```yaml
// docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///app/dev.db
      - SECRET_KEY=dev-secret-key
    volumes:
      - ./packages/database:/app/packages/database
    depends_on:
      - db

  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8000
    depends_on:
      - api

  db:
    image: sqlite:latest
    volumes:
      - sqlite_data:/data

volumes:
  sqlite_data:
```

### Dockerfile API
```dockerfile
# Dockerfile.api
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar package.json para instalar dependencias
COPY package*.json ./
COPY apps/api/ ./apps/api/
COPY packages/ ./packages/

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r apps/api/requirements.txt

# Generar cliente Prisma
RUN cd packages/database && npx prisma generate

# Exponer puerto
EXPOSE 8000

# Comando de inicio
CMD ["uvicorn", "apps.api.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Dockerfile Web
```dockerfile
# Dockerfile.web
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY apps/web/ ./apps/web/
COPY packages/ ./packages/

# Instalar dependencias y build
RUN npm ci
RUN npm run build:web

# Imagen de producción
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 6. Variables de Entorno

### Desarrollo Local
```bash
# .env.local
DATABASE_URL="sqlite:./packages/database/dev.db"
SECRET_KEY="development-secret-key"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend
VITE_API_URL="http://localhost:8000"
```

### Producción
```bash
# Railway (API)
DATABASE_URL=${{ secrets.DATABASE_URL }}
SECRET_KEY=${{ secrets.SECRET_KEY }}
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Vercel (Web)
VITE_API_URL="https://masirep-api.railway.app"
```

## 7. Monitoreo y Logging

### Logs de API
```python
# apps/api/app/logging.py
import logging
import sys
from pythonjsonlogger import jsonlogger

def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    handler = logging.StreamHandler(sys.stdout)
    formatter = jsonlogger.JsonFormatter()
    handler.setFormatter(formatter)
    
    logger.addHandler(handler)
    return logger
```

### Métricas Básicas
```yaml
# health endpoints
# GET /health (API)
{
  "status": "healthy",
  "timestamp": "2025-11-09T10:00:00Z",
  "version": "2.0.0",
  "database": "connected"
}

# GET /api/health (Web)
{
  "status": "healthy",
  "timestamp": "2025-11-09T10:00:00Z",
  "version": "2.0.0"
}
```

## 8. Optimización de Builds

### Cache de Turborepo
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "cache": true
    }
  },
  "globalCache": true,
  "cacheDir": ".turbo"
}
```

### Estrategias de Optimización
```bash
# 1. Builds paralelos
npm run build  # Turborepo ejecuta en paralelo

# 2. Cache inteligente
turbo prune  # Limpiar cache obsoleto

# 3. Builds incrementales
npm run build --filter=api  # Solo API afectada

# 4. Análisis de dependencias
npm ls --depth=0  # Ver dependencias directas
```

## 9. Seguridad

### Secrets Management
```yaml
# GitHub Secrets
RAILWAY_TOKEN: ghp_xxxxxxxxxxxx
VERCEL_TOKEN: vpt_xxxxxxxxxxxx
DATABASE_URL: postgresql://...
SECRET_KEY: super-secret-key
```

### Security Headers
```python
# apps/api/app/middleware.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://masirep.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 10. Backups y Recuperación

### Database Backups
```bash
# Script de backup
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
sqlite3 packages/database/dev.db ".backup backup_${DATE}.db"

# Upload a S3 (opcional)
aws s3 cp backup_${DATE}.db s3://masirep-backups/
```

### Disaster Recovery
```yaml
# Plan de recuperación
1. Identificar punto de falla
2. Restaurar último backup funcional
3. Ejecutar migraciones pendientes
4. Validar integridad de datos
5. Comunicar a usuarios
```

## COORDINACIÓN CON OTROS AGENTES

### Con ARQUITECTO
- Implementar estructura del monorepo según especificaciones
- Configurar Turborepo para builds óptimos
- Establecer pipelines de CI/CD
- Proveer infraestructura para contratos API

### Con BACK (FastAPI)
- Configurar variables de entorno para API
- Optimizar build y deploy de backend
- Monitorear performance y logs
- Gestionar base de datos compartida

### Con FRONT (Vite)
- Configurar build optimizado para producción
- Establecer variables de entorno de frontend
- Optimizar assets y bundle size
- Configurar CDN si es necesario

### Con REVIEW
- Implementar checks de calidad en CI/CD
- Configurar reporting de errores
- Monitorear performance y seguridad
- Validar cumplimiento de estándares

### Con GITHUB
- Automatizar versionado y releases
- Configurar tags y changelog
- Gestionar dependencias del monorepo
- Coordinar estrategia de deploy

## COMANDOS ESENCIALES

### Desarrollo
```bash
# Iniciar todo el monorepo
npm run dev

# Iniciar apps específicas
npm run dev:api
npm run dev:web

# Limpiar builds
npm run clean
```

### Build y Deploy
```bash
# Build completo
npm run build

# Build específico
npm run build:api
npm run build:web

# Versionar packages
npm run version:patch
npm run publish:packages
```

### Mantenimiento
```bash
# Actualizar dependencias
npm update

# Limpiar cache
turbo prune

# Analizar bundles
npm run analyze
```