-- ═══════════════════════════════════════════════════════════════════════
-- LovIA! — ÍNDICES DE PERFORMANCE
-- Ejecutar en Supabase → SQL Editor → Run
-- Fecha: Mayo 2026
-- ═══════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────
-- PROFILES — tabla más consultada
-- ─────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_user_id
  ON public.profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_profiles_gender_age
  ON public.profiles(gender, birth_date);

CREATE INDEX IF NOT EXISTS idx_profiles_is_active
  ON public.profiles(is_active)
  WHERE is_active = true;

-- ─────────────────────────────────────────────────────────────────────
-- MATCHES — queries críticas con user_a_id y user_b_id
-- ─────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_matches_user_a
  ON public.matches(user_a_id);

CREATE INDEX IF NOT EXISTS idx_matches_user_b
  ON public.matches(user_b_id);

CREATE INDEX IF NOT EXISTS idx_matches_status
  ON public.matches(status);

-- Índice compuesto para "mis matches activos"
CREATE INDEX IF NOT EXISTS idx_matches_users_status
  ON public.matches(user_a_id, user_b_id, status);

-- ─────────────────────────────────────────────────────────────────────
-- DATE_PLANS — siempre se consultan por match_id
-- ─────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_date_plans_match_id
  ON public.date_plans(match_id);

-- ─────────────────────────────────────────────────────────────────────
-- TRUSTED_CONTACTS — siempre por user_id
-- ─────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_user_id
  ON public.trusted_contacts(user_id);

-- ─────────────────────────────────────────────────────────────────────
-- SPARKS — siempre se busca la del día activo
-- ─────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sparks_active_date
  ON public.sparks(active_date DESC)
  WHERE is_active = true;

-- ─────────────────────────────────────────────────────────────────────
-- USER_ROLES — crítico para AdminGuard (se consulta en cada auth check)
-- ─────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id
  ON public.user_roles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_role
  ON public.user_roles(role);

-- ─────────────────────────────────────────────────────────────────────
-- JOURNAL / DIARIO — por user_id y fecha
-- ─────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_journal_user_id
  ON public.journal_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_journal_created_at
  ON public.journal_entries(user_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────
-- CHECK-INS EMOCIONALES
-- ─────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_checkins_user_id
  ON public.emotional_checkins(user_id);

CREATE INDEX IF NOT EXISTS idx_checkins_date
  ON public.emotional_checkins(user_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN — confirma que los índices existen
-- ─────────────────────────────────────────────────────────────────────
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
-- ═══════════════════════════════════════════════════════════════════════
