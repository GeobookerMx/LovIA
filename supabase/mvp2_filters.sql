-- ═══════════════════════════════════════════════════════════════
-- LovIA! — MVP 2.5 Filtros Avanzados
-- ═══════════════════════════════════════════════════════════════

-- Añadir columnas de preferencias de filtro avanzado a private_profiles
ALTER TABLE public.private_profiles 
ADD COLUMN IF NOT EXISTS max_distance_km INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS accepts_children BOOLEAN DEFAULT true;

-- Asegurar validación en max_distance
ALTER TABLE public.private_profiles
ADD CONSTRAINT check_max_distance CHECK (max_distance_km >= 5 AND max_distance_km <= 500);

-- Comentario para registro
COMMENT ON COLUMN public.private_profiles.max_distance_km IS 'Distancia máxima que el usuario está dispuesto a tolerar para un match';
COMMENT ON COLUMN public.private_profiles.accepts_children IS 'Si es false, rechaza matches que ya tengan hijos';
