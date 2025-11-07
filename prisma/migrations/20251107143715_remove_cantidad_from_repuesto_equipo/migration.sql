-- Remove campo 'cantidad' del modelo RepuestoEquipo para separar asociación técnica de gestión de stock

-- Eliminar la columna cantidad de la tabla repuesto_equipo
-- Esto convierte la relación de "asignación de stock" a "asociación técnica"
ALTER TABLE "repuesto_equipo" DROP COLUMN "cantidad";