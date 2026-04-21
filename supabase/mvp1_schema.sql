-- ═══════════════════════════════════════════════════════════════
-- LovIA! — MVP 1.1 Database Restructuring (Privacy by Design)
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ── 1. IDENTITY & PROFILE (Separación Pública vs Privada) ──

-- Perfil Público: Lo único que otros usuarios pueden ver
CREATE TABLE IF NOT EXISTS public_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  alias TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  age INTEGER,
  gender TEXT DEFAULT '',
  seeking TEXT[] DEFAULT '{}',
  city TEXT DEFAULT '',
  relationship_intent TEXT DEFAULT 'long_term'
    CHECK (relationship_intent IN ('long_term', 'casual', 'friendship', 'explore')),
  trust_level TEXT DEFAULT 'bronze'
    CHECK (trust_level IN ('bronze', 'silver', 'gold', 'diamond')),
  tier TEXT DEFAULT 'free'
    CHECK (tier IN ('free', 'arquitecto', 'ingeniero', 'diamante')),
  visibility_mode TEXT DEFAULT 'classic'
    CHECK (visibility_mode IN ('classic', 'gradual', 'essence')),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Perfil Privado: Datos logísticos, contacto y flags internos (No publicable)
CREATE TABLE IF NOT EXISTS private_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT DEFAULT '',
  has_children BOOLEAN,
  lives_with_dependents BOOLEAN,
  willing_to_relocate BOOLEAN DEFAULT false,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  verified_email BOOLEAN DEFAULT false,
  verified_ine BOOLEAN DEFAULT false,
  verified_selfie BOOLEAN DEFAULT false,
  account_status TEXT DEFAULT 'active'
    CHECK (account_status IN ('active', 'paused', 'review', 'banned')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Registros de Consentimiento (Obligaciones legales LFPDPPP, GDPR, Stores)
CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL
    CHECK (consent_type IN ('terms_v1', 'privacy_v1', 'sensitive_data_v1', 'ephemeral_location')),
  ip_address INET,
  accepted_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. EVALUATIONS & MATCHING (Readiness, Compatibility, Risk) ──

-- Raw Answers: Respuestas literales a los tests (NUNCA VISTAS POR OTROS)
CREATE TABLE IF NOT EXISTS assessments_raw (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL 
    CHECK (test_type IN ('momento_vida', 'vinculo', 'compatibilidad_profunda', 'stroop', 'digit_span')),
  answers JSONB NOT NULL DEFAULT '{}',
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Internal Scores: Resultados procesados para el motor (No visibles textualmente al público)
CREATE TABLE IF NOT EXISTS assessment_scores (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  readiness_score INTEGER DEFAULT 0 CHECK (readiness_score BETWEEN 0 AND 100),
  compatibility_factors JSONB DEFAULT '{}',
  risk_flags JSONB DEFAULT '[]',
  needs_support BOOLEAN DEFAULT false,    -- Si es true, se sugiere Red de Apoyo Geobooker
  last_calculated_at TIMESTAMPTZ DEFAULT now()
);

-- Matches Base (Sin cambios mayores, pero condicionado por Readiness y Safety)
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a_id UUID NOT NULL REFERENCES public_profiles(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES public_profiles(id) ON DELETE CASCADE,
  current_level INTEGER DEFAULT 1 CHECK (current_level BETWEEN 1 AND 5),
  compatibility_score INTEGER DEFAULT 0,
  user_a_accepted BOOLEAN DEFAULT false,
  user_b_accepted BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'archived', 'completed', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  last_activity TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  CONSTRAINT unique_match_pair CHECK (user_a_id < user_b_id),
  UNIQUE(user_a_id, user_b_id)
);

-- ── 3. SAFETY & GEOBOOKER INTEGRATION (Modo Cita Segura) ──

-- Trusted Contacts
CREATE TABLE IF NOT EXISTS trusted_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  relationship TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Date Plans & Check-ins (Modo Cita Segura y Geobooker Venues)
CREATE TABLE IF NOT EXISTS date_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  venue_geobooker_id TEXT,    -- Si usaron recomendación de Geobooker
  venue_name TEXT,
  scheduled_time TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 60,
  user_a_checkin TIMESTAMPTZ,
  user_b_checkin TIMESTAMPTZ,
  user_a_checkout TIMESTAMPTZ,
  user_b_checkout TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'ongoing', 'completed', 'incident')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 4. POLÍTICAS DE SEGURIDAD (Row Level Security) ──

-- Activar RLS en todas las tablas sensibles
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura/escritura (Ejemplos básicos: el usuario solo lee y edita su propio dato)
CREATE POLICY "Public profiles are visible to all authenticated users"
  ON public_profiles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users edit own public profile"
  ON public_profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users read/write entirely own private profile"
  ON private_profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users read/write own raw assessments"
  ON assessments_raw FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users read own assessment scores"
  ON assessment_scores FOR SELECT USING (auth.uid() = id);

-- ── 5. TRIGGERS: AUTO-CREACIÓN DE PERFILES AL REGISTRO ──
CREATE OR REPLACE FUNCTION handle_new_user_v2()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear perfil público vacío
  INSERT INTO public_profiles (id, alias, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'alias', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  
  -- Crear perfil privado base
  INSERT INTO private_profiles (id, full_name, verified_email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END
  );

  -- Crear entrada de scores vacía
  INSERT INTO assessment_scores (id) VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reemplazar el trigger viejo `on_auth_user_created` por el v2
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created_v2
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_v2();
