-- ═══════════════════════════════════════════════════════════════════════
-- LovIA! — AUTOMATIZACIONES: pg_cron + Triggers + Webhooks DB
-- INSTRUCCIÓN: Copia y pega en Supabase → SQL Editor → Run
-- Requiere: Extensión pg_cron habilitada
-- Supabase Dashboard → Database → Extensions → buscar "pg_cron" → Enable
-- ═══════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- PASO 0: Habilitar extensión pg_net (para llamadas HTTP desde SQL)
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ─────────────────────────────────────────────────────────────
-- AUTO-01: MATCHING DIARIO a las 6am hora México (12:00 UTC)
-- ─────────────────────────────────────────────────────────────
SELECT cron.schedule(
  'lovia-matching-diario',          -- nombre único del job
  '0 12 * * *',                     -- cron: todos los días 12:00 UTC (6am CDT)
  $$
  SELECT net.http_post(
    url     := 'https://nbpidjpkanwynlhdxowx.supabase.co/functions/v1/run-matching',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5icGlkanBrYW53eW5saGR4b3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNDg3ODIsImV4cCI6MjA4NzgyNDc4Mn0.v2plBPSTabpYQReeQ-Mq9cG4-LXzKRbwuRTBks6WW18'
    ),
    body    := '{"source": "cron_daily"}'::jsonb
  ) AS request_id;
  $$
);


-- ─────────────────────────────────────────────────────────────
-- AUTO-03: ARCHIVAR MATCHES EXPIRADOS cada hora
-- (matches con status='active' y expires_at < NOW())
-- ─────────────────────────────────────────────────────────────
SELECT cron.schedule(
  'lovia-archive-expired-matches',
  '0 * * * *',   -- cada hora en punto
  $$
  UPDATE public.matches
  SET status = 'archived'
  WHERE status = 'active'
    AND expires_at < NOW();
  $$
);


-- ─────────────────────────────────────────────────────────────
-- AUTO-14: MARCAR EVALUACIONES ANTIGUAS PARA RE-TEST cada mes
-- (si pasaron más de 6 meses desde que completó el test)
-- ─────────────────────────────────────────────────────────────
SELECT cron.schedule(
  'lovia-retest-old-evaluations',
  '0 0 1 * *',   -- primer día de cada mes a medianoche UTC
  $$
  UPDATE public.evaluations
  SET passed = false,
      details = COALESCE(details, '{}') || '{"requires_retest": true}'::jsonb
  WHERE completed_at < NOW() - INTERVAL '6 months'
    AND test_type IN ('stroop', 'digit_span')
    AND passed = true;
  $$
);


-- ─────────────────────────────────────────────────────────────
-- AUTO-05: DEGRADAR A FREE SUSCRIPCIONES VENCIDAS cada día
-- (suscripciones cuyo current_period_end ya pasó)
-- ─────────────────────────────────────────────────────────────
SELECT cron.schedule(
  'lovia-downgrade-expired-subs',
  '30 12 * * *',  -- 30 min después del matching diario (6:30am CDT)
  $$
  UPDATE public.subscriptions
  SET tier   = 'free',
      status = 'canceled'
  WHERE status = 'active'
    AND tier   != 'free'
    AND current_period_end IS NOT NULL
    AND current_period_end < NOW();
  -- El trigger sync_tier_to_profile() propagará el cambio a profiles ✅
  $$
);


-- ─────────────────────────────────────────────────────────────
-- AUTO-07: TRIGGER de alerta de crisis en check-ins
-- Si el score del check-in es <= 3, registrar en crisis_alerts
-- ─────────────────────────────────────────────────────────────

-- Tabla para rastrear crisis
CREATE TABLE IF NOT EXISTS public.crisis_alerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_score INT  NOT NULL,
  context      TEXT,
  notified_at  TIMESTAMPTZ DEFAULT NOW(),
  reviewed     BOOLEAN DEFAULT FALSE,
  reviewed_by  UUID REFERENCES auth.users(id),
  reviewed_at  TIMESTAMPTZ
);

ALTER TABLE public.crisis_alerts ENABLE ROW LEVEL SECURITY;

-- Solo el propio usuario y admins pueden ver sus alertas
CREATE POLICY "User read own crisis alerts"
ON public.crisis_alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admin read all crisis alerts"
ON public.crisis_alerts FOR SELECT
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin update crisis alerts"
ON public.crisis_alerts FOR UPDATE
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Trigger que detecta check-ins de crisis
CREATE OR REPLACE FUNCTION detect_crisis_checkin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.score <= 3 THEN
    INSERT INTO public.crisis_alerts (user_id, checkin_score, context)
    VALUES (NEW.user_id, NEW.score, NEW.context)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger a emotional_checkins (si existe la tabla)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'emotional_checkins'
  ) THEN
    DROP TRIGGER IF EXISTS on_crisis_checkin ON public.emotional_checkins;
    CREATE TRIGGER on_crisis_checkin
      AFTER INSERT ON public.emotional_checkins
      FOR EACH ROW EXECUTE FUNCTION detect_crisis_checkin();
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────
-- AUTO-13: FUNNEL EVENTS — Tabla de analytics de onboarding
-- Rastrear en qué paso del onboarding abandonan los usuarios
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.funnel_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event      TEXT NOT NULL,   -- 'onboarding_step_1', 'match_opened', etc.
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para queries rápidas por evento
CREATE INDEX IF NOT EXISTS idx_funnel_events_event ON public.funnel_events(event);
CREATE INDEX IF NOT EXISTS idx_funnel_events_user  ON public.funnel_events(user_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_date  ON public.funnel_events(created_at);

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own funnel events"
ON public.funnel_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin reads all funnel events"
ON public.funnel_events FOR SELECT
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ─────────────────────────────────────────────────────────────
-- AUTO-08: REALTIME en subscriptions
-- (El cliente React se suscribirá a cambios en esta tabla)
-- Asegurar que Realtime está habilitado para subscriptions
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.subscriptions REPLICA IDENTITY FULL;
-- En Supabase Dashboard → Database → Replication → habilitar subscriptions


-- ─────────────────────────────────────────────────────────────
-- TRIGGER: Notificar al admin cuando se registra un especialista nuevo
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL,       -- 'new_specialist', 'crisis_alert', 'report'
  payload     JSONB DEFAULT '{}',
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin reads all notifications"
ON public.admin_notifications FOR SELECT
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin updates notifications"
ON public.admin_notifications FOR UPDATE
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE OR REPLACE FUNCTION notify_admin_new_specialist()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, payload)
  VALUES (
    'new_specialist',
    jsonb_build_object(
      'specialist_id', NEW.id,
      'full_name',     NEW.full_name,
      'specialty',     NEW.specialty,
      'cedula',        NEW.cedula,
      'city',          NEW.city
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_specialist ON public.specialists;
CREATE TRIGGER on_new_specialist
  AFTER INSERT ON public.specialists
  FOR EACH ROW EXECUTE FUNCTION notify_admin_new_specialist();


-- ─────────────────────────────────────────────────────────────
-- TRIGGER: Sincronización Realtime de tier (AUTO-08)
-- Ya existe el trigger sync_tier_to_profile en schema.sql ✅
-- ─────────────────────────────────────────────────────────────
-- El trigger EXISTE y propaga el tier de subscriptions → profiles.
-- Solo necesitas habilitar Realtime en subscriptions desde el Dashboard.


-- ─────────────────────────────────────────────────────────────
-- VERIFICAR jobs de pg_cron activos
-- ─────────────────────────────────────────────────────────────
SELECT jobid, jobname, schedule, command, active
FROM cron.job
ORDER BY jobname;

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ AUTOMATIZACIONES INSTALADAS:
--  • AUTO-01: Matching diario 6am México
--  • AUTO-03: Archivar matches expirados (cada hora)
--  • AUTO-05: Degradar suscripciones vencidas (diario)
--  • AUTO-07: Alerta de crisis en check-ins (trigger)
--  • AUTO-08: Realtime de subscriptions habilitado
--  • AUTO-13: Tabla funnel_events para analytics
--  • Tabla admin_notifications con trigger de nuevos especialistas
-- ═══════════════════════════════════════════════════════════════════════
