-- ═══════════════════════════════════════════════════════════════════════
-- LovIA! — FIX VISTAS DEL PERFIL
-- NOTA: Si al iniciar sesión tu perfil no carga correctamente, es porque
-- faltan las vistas public_profiles y private_profiles.
-- Ejecuta esto en Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════

-- Agregar campos faltantes a la tabla profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alias TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_children BOOLEAN;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lives_with_dependents BOOLEAN;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_distance_km INTEGER DEFAULT 50;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accepts_children BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS visibility_mode TEXT DEFAULT 'classic';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_1_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_1_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_2_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_2_phone TEXT;

-- Crear vista public_profiles (lo que ven otros usuarios y el cliente frontend de auth)
CREATE OR REPLACE VIEW public_profiles AS
SELECT 
  id, 
  COALESCE(alias, name) as alias, 
  avatar_url, 
  age, 
  gender, 
  seeking, 
  city, 
  relationship_intent, 
  trust_level, 
  tier, 
  visibility_mode, 
  onboarding_completed, 
  created_at, 
  updated_at
FROM profiles;

-- Crear vista private_profiles (configuraciones internas que usa la Edge Function)
CREATE OR REPLACE VIEW private_profiles AS
SELECT 
  id, 
  COALESCE(full_name, name) as full_name, 
  has_children, 
  lives_with_dependents, 
  willing_to_relocate, 
  max_distance_km, 
  accepts_children, 
  lat, 
  lng, 
  verified_email, 
  verified_ine, 
  verified_selfie, 
  account_status, 
  emergency_contact_1_name, 
  emergency_contact_1_phone, 
  emergency_contact_2_name, 
  emergency_contact_2_phone, 
  created_at, 
  updated_at
FROM profiles;
