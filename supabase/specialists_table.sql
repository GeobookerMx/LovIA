-- ═══════════════════════════════════════════════════════
-- LovIA! — SQL Migration: specialists table
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS specialists (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Professional identity
    full_name       TEXT NOT NULL,
    title           TEXT,           -- Lic., Dr., Dra., Mtro.
    cedula          TEXT NOT NULL,  -- Cédula profesional SEP
    specialty       TEXT NOT NULL,
    bio             TEXT,
    approach        TEXT,           -- Marco teórico: Gottman, EFT, TCC...
    
    -- Service config
    modality        TEXT DEFAULT 'Ambas modalidades',   -- Presencial | En línea | Ambas
    session_duration_min  INT DEFAULT 50,
    price_individual      NUMERIC(10,2),
    price_couple          NUMERIC(10,2),
    currency              TEXT DEFAULT 'MXN',
    offers_sliding_scale  BOOLEAN DEFAULT FALSE,
    
    -- Location
    city            TEXT NOT NULL,
    state           TEXT,
    neighborhood    TEXT,
    address_street  TEXT,
    maps_link       TEXT,
    
    -- Schedule
    available_days  TEXT[],         -- ['Lunes', 'Miércoles', 'Viernes']
    time_start      TEXT DEFAULT '09:00',
    time_end        TEXT DEFAULT '19:00',
    accepts_urgent  BOOLEAN DEFAULT FALSE,
    
    -- Contact
    phone_whatsapp      TEXT,
    email_professional  TEXT,
    website             TEXT,
    instagram           TEXT,
    calendly_link       TEXT,
    
    -- Status & verification
    status          TEXT DEFAULT 'pending',  -- pending | active | suspended
    verified        BOOLEAN DEFAULT FALSE,
    admin_notes     TEXT,
    rating          NUMERIC(2,1),
    total_sessions  INT DEFAULT 0,
    
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Enable Row Level Security ──
ALTER TABLE specialists ENABLE ROW LEVEL SECURITY;

-- Anyone can READ active+verified specialists (public directory)
CREATE POLICY "Public read active specialists"
    ON specialists FOR SELECT
    USING (status = 'active' AND verified = TRUE);

-- Owners can read their own pending profile
CREATE POLICY "Owner read own specialist profile"
    ON specialists FOR SELECT
    USING (auth.uid() = user_id);

-- Users can submit one registration form
CREATE POLICY "Insert own specialist registration"
    ON specialists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Owners can update their own (non-verified) profile
CREATE POLICY "Owner update own pending profile"
    ON specialists FOR UPDATE
    USING (auth.uid() = user_id AND verified = FALSE);

-- Admins can do everything (uses service role or admin check)
-- Note: connect this to your admin user ID or use service_role key in Edge Functions

-- ── Index for common queries ──
CREATE INDEX idx_specialists_city ON specialists(city);
CREATE INDEX idx_specialists_specialty ON specialists(specialty);
CREATE INDEX idx_specialists_status ON specialists(status);

-- ── Trigger: auto-update updated_at ──
CREATE OR REPLACE FUNCTION update_specialists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER specialists_updated_at
    BEFORE UPDATE ON specialists
    FOR EACH ROW EXECUTE FUNCTION update_specialists_updated_at();
