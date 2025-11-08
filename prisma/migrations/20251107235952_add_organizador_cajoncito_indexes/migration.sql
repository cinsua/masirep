-- CreateIndex
CREATE INDEX "cajoncitos_organizadorId_idx" ON "cajoncitos"("organizadorId");

-- CreateIndex
CREATE INDEX "cajoncitos_createdAt_idx" ON "cajoncitos"("createdAt");

-- CreateIndex
CREATE INDEX "organizadores_estanteriaId_idx" ON "organizadores"("estanteriaId");

-- CreateIndex
CREATE INDEX "organizadores_armarioId_idx" ON "organizadores"("armarioId");

-- CreateIndex
CREATE INDEX "organizadores_createdAt_idx" ON "organizadores"("createdAt");
