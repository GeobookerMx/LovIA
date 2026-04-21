-- ═══════════════════════════════════════════════════════════════
-- LovIA! — Database Schema (Phase 6)
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ── Enable required extensions ──
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════
-- 1. PROFILES — User profiles and frequency data
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  age INTEGER,
  gender TEXT DEFAULT '',
  seeking TEXT[] DEFAULT '{}',
  city TEXT DEFAULT '',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  willing_to_relocate BOOLEAN DEFAULT false,
  relationship_intent TEXT DEFAULT 'long_term'
    CHECK (relationship_intent IN ('long_term', 'casual', 'friendship', 'self')),

  -- Frequency & Scoring
  frequency INTEGER DEFAULT 0 CHECK (frequency >= 0 AND frequency <= 100),
  frequency_level TEXT DEFAULT 'Despertar',
  love_score INTEGER DEFAULT 0,
  sexual_score INTEGER DEFAULT 0,
  realization_score INTEGER DEFAULT 0,
  stress_level INTEGER DEFAULT 0,
  factors JSONB DEFAULT '{}',
  negative_factors JSONB DEFAULT '{}',

  -- Trust & Verification
  trust_level TEXT DEFAULT 'bronze'
    CHECK (trust_level IN ('bronze', 'silver', 'gold', 'diamond')),
  verified_email BOOLEAN DEFAULT false,
  verified_selfie BOOLEAN DEFAULT false,
  verified_ine BOOLEAN DEFAULT false,
  verified_video BOOLEAN DEFAULT false,

  -- Subscription
  tier TEXT DEFAULT 'free'
    CHECK (tier IN ('free', 'arquitecto', 'ingeniero', 'diamante')),

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_answers JSONB DEFAULT '{}',
  pss4_answers JSONB DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- 2. EVALUATIONS — Cognitive test & psychological eval results
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL
    CHECK (test_type IN ('stroop', 'digit_span', 'frustration_tolerance', 'emotional_regulation')),
  score NUMERIC NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  details JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ DEFAULT now(),

  -- Each user can have multiple attempts, most recent matters
  UNIQUE(user_id, test_type)
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_evaluations_user ON evaluations(user_id);

-- ═══════════════════════════════════════════════════════════════
-- 3. MATCHES — Active matches between users
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_level INTEGER DEFAULT 1 CHECK (current_level BETWEEN 1 AND 5),
  user_a_accepted BOOLEAN DEFAULT false,
  user_b_accepted BOOLEAN DEFAULT false,
  compatibility_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'archived', 'completed', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  last_activity TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),

  -- Prevent duplicate matches between same pair
  CONSTRAINT unique_match_pair CHECK (user_a_id < user_b_id),
  UNIQUE(user_a_id, user_b_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_user_a ON matches(user_a_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_b ON matches(user_b_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- ═══════════════════════════════════════════════════════════════
-- 4. SUBSCRIPTIONS — Payment & tier tracking
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free'
    CHECK (tier IN ('free', 'arquitecto', 'ingeniero', 'diamante')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- 5. VERIFICATION_STEPS — Progressive verification tracking
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS verification_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  step_type TEXT NOT NULL
    CHECK (step_type IN ('email', 'selfie', 'ine', 'video')),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
  document_url TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, step_type)
);

-- ═══════════════════════════════════════════════════════════════
-- 6. REPORTS — Safety reports and moderation
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id),
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- ═══════════════════════════════════════════════════════════════
-- 7. ENCOUNTER_REVIEWS — Post-encounter feedback
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS encounter_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  felt_safe BOOLEAN DEFAULT true,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(match_id, reviewer_id)
);

-- ═══════════════════════════════════════════════════════════════
-- 8. AUDIT_LOG — Security event tracking
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- ═══════════════════════════════════════════════════════════════
-- TRIGGER: Auto-create profile on user signup
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, avatar_url, verified_email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END
  );

  -- Also create subscription record (free tier)
  INSERT INTO subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- TRIGGER: Sync tier between subscriptions and profiles
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION sync_tier_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET tier = NEW.tier WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION sync_tier_to_profile();
