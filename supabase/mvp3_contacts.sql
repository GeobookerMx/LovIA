-- ═══════════════════════════════════════════════════════════════
-- LovIA! — MVP 3.4 Contactos de Confianza (Seguridad Física)
-- ═══════════════════════════════════════════════════════════════

-- Añadir columnas seguras a private_profiles
ALTER TABLE public.private_profiles 
ADD COLUMN IF NOT EXISTS emergency_contact_1_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_1_phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_2_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_2_phone TEXT;

-- Comentarios explicativos críticos para auditorías de seguridad
COMMENT ON COLUMN public.private_profiles.emergency_contact_1_name IS 'Nombre del primer contacto de emergencia a notificar si se activa SOS';
COMMENT ON COLUMN public.private_profiles.emergency_contact_1_phone IS 'Teléfono del primer contacto de emergencia. Datos encriptados/protegidos por RLS';
