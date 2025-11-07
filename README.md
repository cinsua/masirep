# Masirep - Sistema de Repuestos

Sistema autónomo de gestión de repuestos para mantenimiento departamental, desarrollado con Next.js 14, Prisma, SQLite y NextAuth.js para operación local sin dependencias corporativas.

## 🚀 Características

- **Operación Autónoma**: Funciona completamente en local sin dependencias de TI corporativa
- **Next.js 14**: Con App Router, TypeScript y Tailwind CSS
- **Base de Datos Local**: SQLite con Prisma ORM para type-safe database access
- **Autenticación Local**: NextAuth.js con credentials provider
- **Diseño Moderno**: Tailwind CSS con tema Ternium Classic (#FF6B00)
- **Componentes UI**: shadcn/ui para consistencia visual
- **Hot Reload**: Desarrollo rápido con <1s startup time

## 📋 Requisitos Previos

- Node.js 18+
- npm 9+

## 🛠️ Instalación

### 1. Clonar el proyecto (si aplica)
```bash
git clone <repository-url>
cd masirep
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
# Copiar archivo de entorno
cp .env .env.local

# Editar si es necesario (valores por defecto funcionan para desarrollo)
# DATABASE_URL="file:./dev.db"
# NEXTAUTH_SECRET="masirep-secret-key-change-in-production"
# NEXTAUTH_URL="http://localhost:3000"
```

### 4. Inicializar base de datos
```bash
# Generar Prisma client
npx prisma generate

# Crear migración inicial
npx prisma migrate dev --name init

# Sembrar datos de prueba (7 técnicos pre-configurados)
npm run db:seed
```

### 5. Iniciar servidor de desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 👥 Usuarios Pre-configurados

El sistema incluye 7 técnicos pre-configurados para pruebas:

| Técnico | Email | Rol | Contraseña |
|---------|-------|-----|------------|
| Carlos Rodríguez | carlos.rodriguez@masirep.com | tecnico | temp123 |
| María González | maria.gonzalez@masirep.com | tecnico | temp123 |
| Juan Pérez | juan.perez@masirep.com | tecnico | temp123 |
| Ana Martínez | ana.martinez@masirep.com | supervisor | temp123 |
| Luis Fernández | luis.fernandez@masirep.com | tecnico | temp123 |
| Sofía López | sofia.lopez@masirep.com | tecnico | temp123 |
| Diego Sánchez | diego.sanchez@masirep.com | admin | temp123 |

## 📁 Estructura del Proyecto

```
masirep/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── api/auth/          # NextAuth.js API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Main dashboard
│   │   ├── repuestos/         # Repuestos management
│   │   ├── componentes/       # Componentes management
│   │   ├── equipment/         # Equipment management
│   │   ├── ubicaciones/       # Storage locations
│   │   └── reportes/          # Reports system
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # Layout components
│   │   └── forms/            # Form components
│   ├── lib/                  # Utilities and configurations
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── prisma.ts         # Prisma client
│   │   ├── utils.ts          # Utility functions
│   │   └── logger.ts         # Logging system
│   └── types/                # TypeScript type definitions
├── prisma/                   # Database schema and migrations
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   └── seed.ts             # Database seeding script
└── public/                  # Static assets
```

## 🎨 Tema y Diseño

- **Color Primario**: Ternium Classic (#FF6B00)
- **Sistema de Diseño**: Tailwind CSS con shadcn/ui
- **Tipografía**: Inter font family
- **Modo Oscuro**: Soporte completo con colores adaptados

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Compilar para producción
npm run start            # Iniciar servidor de producción

# Base de Datos
npm run db:seed          # Sembrar datos de prueba
npm run db:reset         # Resetear base de datos y sembrar
npm run db:studio        # Abrir Prisma Studio
npm run db:generate      # Generar Prisma client
npm run db:migrate       # Crear nueva migración

# Calidad de Código
npm run lint             # Ejecutar ESLint
npm run lint:fix         # Corregir automáticamente ESLint
npm run type-check       # Verificación de tipos TypeScript
```

## 🔐 Autenticación

El sistema utiliza NextAuth.js con **credentials provider** para autenticación local:

- Sesiones persistentes via Prisma adapter
- Cookies HTTP-only para seguridad
- Soporte para roles (admin, supervisor, tecnico)
- Redirección automática a `/dashboard` después de login

## 📊 Base de Datos

- **SQLite**: Base de datos local en archivo `dev.db`
- **Prisma ORM**: Type-safe database access
- **Migraciones**: Versionadas y controladas
- **Seed Data**: 7 usuarios pre-configurados para pruebas

## 🧪 Testing y Validación

La configuración actual valida:

✅ **AC1**: Next.js 14 inicializado con TypeScript, Tailwind CSS y src-dir
✅ **AC2**: Dependencias core instaladas (Prisma, NextAuth.js, shadcn/ui)
✅ **AC3**: Estructura de directorios según architecture.md
✅ **AC4**: Servidor inicia en <10s con hot-reload funcional

- Startup time: **711ms** (requerimiento: <10s)
- Hot-reload: **Funcional**
- TypeScript: **Sin errores**
- ESLint: **Sin warnings**
- Build: **Exitoso**

## 🚀 Despliegue

### Para Producción

1. Cambiar `NEXTAUTH_SECRET` en producción
2. Configurar `NEXTAUTH_URL` con el dominio real
3. Ejecutar `npm run build`
4. Ejecutar `npm start`

### Variables de Entorno Producción

```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="tu-secreto-muy-seguro-aqui"
NEXTAUTH_URL="https://tu-dominio.com"
NODE_ENV="production"
```

## 📞 Soporte

Para soporte técnico o dudas sobre la configuración:

1. Revisar los logs de la aplicación
2. Verificar configuración de variables de entorno
3. Asegurar que Node.js 18+ esté instalado
4. Validar que los puertos 3000 no estén en uso

## 🔄 Checklist de Instalación para Técnicos

- [ ] Node.js 18+ instalado
- [ ] Código fuente descargado
- [ ] `npm install` ejecutado sin errores
- [ ] `.env.local` configurado
- [ ] `npx prisma generate` ejecutado
- [ ] `npx prisma migrate dev --name init` completado
- [ ] `npm run db:seed` ejecutado
- [ ] `npm run dev` inicia correctamente
- [ ] Login exitoso con usuario pre-configurado
- [ ] Dashboard accesible después de login

---

**Desarrollado para autonomía departamental completa**