-- ═══════════════════════════════════════════════════════════════
-- LovIA! — MVP 2.1 Global Scalability Prep
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- Añadir zonas horarias y configuración regional para soporte global
ALTER TABLE private_profiles 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Mexico_City',
ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'es-MX';

-- Añadir campos culturales y religiosos a los perfiles públicos para filtros
ALTER TABLE public_profiles 
ADD COLUMN IF NOT EXISTS religion TEXT,
ADD COLUMN IF NOT EXISTS cultural_background TEXT[],
ADD COLUMN IF NOT EXISTS languages_spoken TEXT[] DEFAULT '{"es"}';

-- (Opcional) Guardar si la distancia se prefiere medir en KMS o MILLAS
ALTER TABLE private_profiles
ADD COLUMN IF NOT EXISTS distance_unit TEXT DEFAULT 'km' 
CHECK (distance_unit IN ('km', 'mi'));
