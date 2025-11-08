-- CreateIndex
CREATE INDEX "cajones_estanteriaId_idx" ON "cajones"("estanteriaId");

-- CreateIndex
CREATE INDEX "cajones_armarioId_idx" ON "cajones"("armarioId");

-- CreateIndex
CREATE INDEX "cajones_createdAt_idx" ON "cajones"("createdAt");

-- CreateIndex
CREATE INDEX "divisiones_cajonId_idx" ON "divisiones"("cajonId");

-- CreateIndex
CREATE INDEX "divisiones_createdAt_idx" ON "divisiones"("createdAt");
