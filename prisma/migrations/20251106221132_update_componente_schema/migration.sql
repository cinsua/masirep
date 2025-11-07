/*
  Warnings:

  - You are about to drop the column `codigo` on the `componentes` table. All the data in the column will be lost.
  - You are about to drop the column `encapsulado` on the `componentes` table. All the data in the column will be lost.
  - You are about to drop the column `marca` on the `componentes` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `componentes` table. All the data in the column will be lost.
  - You are about to drop the column `stockActual` on the `componentes` table. All the data in the column will be lost.
  - You are about to drop the column `valor` on the `componentes` table. All the data in the column will be lost.
  - Added the required column `valorUnidad` to the `componentes` table without a default value. This is not possible if the table is not empty.
  - Made the column `descripcion` on table `componentes` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_componentes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoria" TEXT NOT NULL DEFAULT 'OTROS',
    "descripcion" TEXT NOT NULL,
    "valorUnidad" JSONB NOT NULL,
    "stockMinimo" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_componentes" ("categoria", "createdAt", "descripcion", "id", "isActive", "stockMinimo", "updatedAt") SELECT coalesce("categoria", 'OTROS') AS "categoria", "createdAt", "descripcion", "id", "isActive", "stockMinimo", "updatedAt" FROM "componentes";
DROP TABLE "componentes";
ALTER TABLE "new_componentes" RENAME TO "componentes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
