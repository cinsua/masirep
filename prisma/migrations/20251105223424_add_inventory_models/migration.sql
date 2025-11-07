-- CreateTable
CREATE TABLE "ubicaciones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "estanterias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "ubicacionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "estanterias_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "ubicaciones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "armarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "ubicacionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "armarios_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "ubicaciones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cajones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estanteriaId" TEXT,
    "armarioId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cajones_estanteriaId_fkey" FOREIGN KEY ("estanteriaId") REFERENCES "estanterias" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cajones_armarioId_fkey" FOREIGN KEY ("armarioId") REFERENCES "armarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "estantes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estanteriaId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "estantes_estanteriaId_fkey" FOREIGN KEY ("estanteriaId") REFERENCES "estanterias" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "divisiones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cajonId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "divisiones_cajonId_fkey" FOREIGN KEY ("cajonId") REFERENCES "cajones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "organizadores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estanteriaId" TEXT,
    "armarioId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "organizadores_estanteriaId_fkey" FOREIGN KEY ("estanteriaId") REFERENCES "estanterias" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "organizadores_armarioId_fkey" FOREIGN KEY ("armarioId") REFERENCES "armarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cajoncitos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "organizadorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cajoncitos_organizadorId_fkey" FOREIGN KEY ("organizadorId") REFERENCES "organizadores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "equipos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "sap" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "marca" TEXT,
    "modelo" TEXT,
    "numeroSerie" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "repuestos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "marca" TEXT,
    "modelo" TEXT,
    "numeroParte" TEXT,
    "stockMinimo" INTEGER NOT NULL DEFAULT 0,
    "stockActual" INTEGER NOT NULL DEFAULT 0,
    "categoria" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "componentes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "valor" TEXT,
    "marca" TEXT,
    "encapsulado" TEXT,
    "stockMinimo" INTEGER NOT NULL DEFAULT 0,
    "stockActual" INTEGER NOT NULL DEFAULT 0,
    "categoria" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "repuesto_equipo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repuestoId" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "repuesto_equipo_repuestoId_fkey" FOREIGN KEY ("repuestoId") REFERENCES "repuestos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "repuesto_equipo_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "repuesto_ubicacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repuestoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "armarioId" TEXT,
    "estanteriaId" TEXT,
    "estanteId" TEXT,
    "cajonId" TEXT,
    "divisionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "repuesto_ubicacion_repuestoId_fkey" FOREIGN KEY ("repuestoId") REFERENCES "repuestos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "repuesto_ubicacion_armarioId_fkey" FOREIGN KEY ("armarioId") REFERENCES "armarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "repuesto_ubicacion_estanteriaId_fkey" FOREIGN KEY ("estanteriaId") REFERENCES "estanterias" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "repuesto_ubicacion_estanteId_fkey" FOREIGN KEY ("estanteId") REFERENCES "estantes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "repuesto_ubicacion_cajonId_fkey" FOREIGN KEY ("cajonId") REFERENCES "cajones" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "repuesto_ubicacion_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "divisiones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "componente_ubicacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "componenteId" TEXT NOT NULL,
    "cajoncitoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "componente_ubicacion_componenteId_fkey" FOREIGN KEY ("componenteId") REFERENCES "componentes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "componente_ubicacion_cajoncitoId_fkey" FOREIGN KEY ("cajoncitoId") REFERENCES "cajoncitos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transacciones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "stockAnterior" INTEGER NOT NULL,
    "stockNuevo" INTEGER NOT NULL,
    "motivo" TEXT,
    "referencia" TEXT,
    "origenTipo" TEXT,
    "origenId" TEXT,
    "destinoTipo" TEXT,
    "destinoId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "transacciones_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ubicaciones_codigo_key" ON "ubicaciones"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "estanterias_codigo_key" ON "estanterias"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "armarios_codigo_key" ON "armarios"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "cajones_codigo_key" ON "cajones"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "estantes_codigo_key" ON "estantes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "divisiones_codigo_key" ON "divisiones"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "organizadores_codigo_key" ON "organizadores"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "cajoncitos_codigo_key" ON "cajoncitos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "equipos_codigo_key" ON "equipos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "equipos_sap_key" ON "equipos"("sap");

-- CreateIndex
CREATE UNIQUE INDEX "repuestos_codigo_key" ON "repuestos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "componentes_codigo_key" ON "componentes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "repuesto_equipo_repuestoId_equipoId_key" ON "repuesto_equipo"("repuestoId", "equipoId");

-- CreateIndex
CREATE UNIQUE INDEX "componente_ubicacion_componenteId_cajoncitoId_key" ON "componente_ubicacion"("componenteId", "cajoncitoId");

-- CreateIndex
CREATE UNIQUE INDEX "transacciones_codigo_key" ON "transacciones"("codigo");
