-- ══════════════════════════════════════════════════════════════════════════
-- LOVIA v2 — Esquema Completo de Base de Datos
-- Basado en el libro 'Evolución de las Relaciones de Pareja' - Juan Pablo Peña
-- Ejecutar en: Supabase → SQL Editor
-- ══════════════════════════════════════════════════════════════════════════

-- ── EXTENSIONES ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ══════════════════════════════════════════════════════════════════════════
-- 1. COLUMNAS NUEVAS EN PROFILES (si no existen)
-- ══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS alias              text,
  ADD COLUMN IF NOT EXISTS age               integer,
  ADD COLUMN IF NOT EXISTS city              text,
  ADD COLUMN IF NOT EXISTS country           text DEFAULT 'MX',
  ADD COLUMN IF NOT EXISTS intent            text, -- relacion_seria | conocer | amistad
  ADD COLUMN IF NOT EXISTS orientation       text,
  ADD COLUMN IF NOT EXISTS life_stage        text, -- exploracion | construccion | consolidacion | reinvencion
  ADD COLUMN IF NOT EXISTS verified_selfie   boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS attachment_style  text CHECK (attachment_style IN ('secure','anxious','avoidant','disorganized')),
  ADD COLUMN IF NOT EXISTS ocean_scores      jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS core_values       text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS assessments_done  text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS readiness_score   integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS readiness_band    text DEFAULT 'en_proceso',
  ADD COLUMN IF NOT EXISTS frequency         integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS frequency_level   text DEFAULT 'Despertar',
  ADD COLUMN IF NOT EXISTS discovery_state   text DEFAULT 'locked'
    CHECK (discovery_state IN ('locked','preview','open','match_enabled')),
  ADD COLUMN IF NOT EXISTS profile_pct       integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS spark_streak      integer DEFAULT 0;

-- ══════════════════════════════════════════════════════════════════════════
-- 2. MÁQUINA DE ESTADOS DEL USUARIO
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_states (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_state text NOT NULL DEFAULT 'registered',
  previous_state text,
  updated_at   timestamptz DEFAULT now(),
  metadata     jsonb DEFAULT '{}'
);

-- Estados válidos:
-- registered → consent_completed → profile_incomplete → profile_complete
-- → assessment_started → assessment_partial → assessment_complete
-- → readiness_generated → discovery_locked | discovery_preview | discovery_open
-- → match_enabled → chat_enabled → date_ready

ALTER TABLE public.user_states ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_states: own" ON public.user_states;
CREATE POLICY "user_states: own"
  ON public.user_states FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_states_user ON public.user_states(user_id);

-- ══════════════════════════════════════════════════════════════════════════
-- 3. MÓDULOS DE EVALUACIÓN (4 EJES DEL LIBRO)
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.assessment_modules (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name         text NOT NULL,
  axis         text NOT NULL, -- amor | intimidad | realizacion | seguridad
  description  text,
  order_index  integer DEFAULT 0,
  unlock_level integer DEFAULT 0,
  icon         text DEFAULT '❤️',
  created_at   timestamptz DEFAULT now()
);

-- Insertar los 4 módulos base del libro
INSERT INTO public.assessment_modules (name, axis, description, order_index, icon) VALUES
  ('Amor y Vinculación',       'amor',       'Tu estilo de vinculación emocional, historial afectivo y definición personal del amor.', 1, '💞'),
  ('Intimidad y Sexualidad',   'intimidad',  'Límites, expectativas de intimidad, importancia y compatibilidad de deseos.', 2, '🔥'),
  ('Realización y Momento',    'realizacion','Metas actuales, etapa de vida, disponibilidad real y proyectos personales.', 3, '🌟'),
  ('Seguridad y Autorregulación','seguridad', 'Patrones de conducta, señales de riesgo, autocrítica y tolerancia al conflicto.', 4, '🛡️')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════
-- 4. PREGUNTAS POR EJE
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id  uuid REFERENCES public.assessment_modules(id),
  text       text NOT NULL,
  type       text DEFAULT 'scale', -- scale | multiple | open
  options    jsonb DEFAULT '[]',
  weight     numeric DEFAULT 1.0,
  order_index integer DEFAULT 0
);

-- ── Eje 1: Amor y Vinculación ─────────────────────────────────────────────
WITH mod AS (SELECT id FROM public.assessment_modules WHERE axis = 'amor' LIMIT 1)
INSERT INTO public.assessment_questions (module_id, text, type, weight, order_index)
SELECT mod.id, q.text, q.type, q.weight, q.ord FROM mod, (VALUES
  ('¿Con qué facilidad te abres emocionalmente con una pareja?', 'scale', 1.2, 1),
  ('¿Cuánto tiempo necesitas antes de confiar plenamente en alguien?', 'scale', 1.0, 2),
  ('Cuando alguien que te importa se aleja, ¿cómo reaccionas habitualmente?', 'multiple', 1.3, 3),
  ('¿Qué importancia tiene para ti el contacto físico no sexual en una relación?', 'scale', 0.9, 4),
  ('¿Cómo defines el amor en este momento de tu vida?', 'open', 1.1, 5),
  ('¿Has podido cerrar ciclos emocionales de relaciones pasadas?', 'scale', 1.4, 6)
) AS q(text, type, weight, ord)
ON CONFLICT DO NOTHING;

-- ── Eje 2: Intimidad y Sexualidad ────────────────────────────────────────
WITH mod AS (SELECT id FROM public.assessment_modules WHERE axis = 'intimidad' LIMIT 1)
INSERT INTO public.assessment_questions (module_id, text, type, weight, order_index)
SELECT mod.id, q.text, q.type, q.weight, q.ord FROM mod, (VALUES
  ('¿Qué tan importante es la compatibilidad sexual para ti en una relación?', 'scale', 1.2, 1),
  ('¿Te sientes cómodo/a hablando de límites y expectativas de intimidad con tu pareja?', 'scale', 1.3, 2),
  ('¿Has podido comunicar claramente tus necesidades íntimas en relaciones pasadas?', 'scale', 1.0, 3),
  ('¿Con qué frecuencia quisieras tener contacto íntimo en una relación estable?', 'multiple', 0.8, 4),
  ('¿Qué tan alineados están tus deseos de intimidad con tu estado emocional actual?', 'scale', 1.1, 5)
) AS q(text, type, weight, ord)
ON CONFLICT DO NOTHING;

-- ── Eje 3: Realización y Momento de Vida ─────────────────────────────────
WITH mod AS (SELECT id FROM public.assessment_modules WHERE axis = 'realizacion' LIMIT 1)
INSERT INTO public.assessment_questions (module_id, text, type, weight, order_index)
SELECT mod.id, q.text, q.type, q.weight, q.ord FROM mod, (VALUES
  ('¿En qué etapa de vida te encuentras ahora mismo?', 'multiple', 1.4, 1),
  ('¿Cuánta energía emocional tienes disponible para una relación hoy?', 'scale', 1.5, 2),
  ('¿Tus metas personales y profesionales dejan espacio real para una pareja?', 'scale', 1.3, 3),
  ('¿Qué tan claro tienes lo que quieres en una relación en los próximos 2 años?', 'scale', 1.2, 4),
  ('¿Tienes proyectos de vida que te gustaría construir con alguien?', 'open', 1.0, 5),
  ('¿Tu estilo de vida actual es compatible con comprometerte emocionalmente?', 'scale', 1.4, 6)
) AS q(text, type, weight, ord)
ON CONFLICT DO NOTHING;

-- ── Eje 4: Seguridad y Autorregulación ───────────────────────────────────
WITH mod AS (SELECT id FROM public.assessment_modules WHERE axis = 'seguridad' LIMIT 1)
INSERT INTO public.assessment_questions (module_id, text, type, weight, order_index)
SELECT mod.id, q.text, q.type, q.weight, q.ord FROM mod, (VALUES
  ('¿Con qué frecuencia te haces autocrítica constructiva en tus relaciones?', 'scale', 1.3, 1),
  ('¿Cómo manejas el conflicto en una relación cercana?', 'multiple', 1.4, 2),
  ('¿Reconoces patrones repetitivos en tus relaciones pasadas?', 'scale', 1.5, 3),
  ('¿Qué tan bien toleras la frustración cuando algo no sale como esperabas?', 'scale', 1.2, 4),
  ('¿Tienes estrategias para regular tus emociones en momentos de tensión?', 'scale', 1.3, 5),
  ('¿Qué tan consciente eres de tus señales de riesgo emocional?', 'open', 1.1, 6)
) AS q(text, type, weight, ord)
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════
-- 5. RESPUESTAS DE ASSESSMENT (DATOS SENSIBLES)
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.assessment_answers (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id uuid REFERENCES public.assessment_questions(id),
  module_id   uuid REFERENCES public.assessment_modules(id),
  value       text NOT NULL, -- número (1-5) o texto para open
  answered_at timestamptz DEFAULT now()
);
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "assessment_answers: own" ON public.assessment_answers;
CREATE POLICY "assessment_answers: own"
  ON public.assessment_answers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_answers_user ON public.assessment_answers(user_id, module_id);

-- ══════════════════════════════════════════════════════════════════════════
-- 6. READINESS SCORE
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.readiness_scores (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score           integer NOT NULL DEFAULT 0,
  band            text NOT NULL DEFAULT 'en_proceso',
  axis_breakdown  jsonb DEFAULT '{}', -- {amor: 60, intimidad: 40, ...}
  calculated_at   timestamptz DEFAULT now()
);
ALTER TABLE public.readiness_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "readiness: own" ON public.readiness_scores;
CREATE POLICY "readiness: own"
  ON public.readiness_scores FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════════════════
-- 7. FRECUENCIA DE RELACIÓN (MOTOR PRINCIPAL)
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.relationship_frequency_scores (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  freq_score        integer DEFAULT 0,
  positive_factors  jsonb DEFAULT '[]',
  negative_factors  jsonb DEFAULT '[]',
  life_stage        text,
  axis_amor         integer DEFAULT 0,
  axis_intimidad    integer DEFAULT 0,
  axis_realizacion  integer DEFAULT 0,
  axis_seguridad    integer DEFAULT 0,
  updated_at        timestamptz DEFAULT now()
);
ALTER TABLE public.relationship_frequency_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "freq_scores: own" ON public.relationship_frequency_scores;
CREATE POLICY "freq_scores: own"
  ON public.relationship_frequency_scores FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════════════════
-- 8. TRUST & SAFETY
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.blocks (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id  uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blocked_id  uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blocked_at  timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "blocks: own" ON public.blocks;
CREATE POLICY "blocks: own"
  ON public.blocks FOR ALL
  USING (auth.uid() = blocker_id)
  WITH CHECK (auth.uid() = blocker_id);

CREATE TABLE IF NOT EXISTS public.reports (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_id  uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason       text NOT NULL, -- fake_profile | abusive | spam | fraud | other
  description  text,
  status       text DEFAULT 'pending', -- pending | reviewed | resolved | dismissed
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reports: insert" ON public.reports;
DROP POLICY IF EXISTS "reports: own select" ON public.reports;
CREATE POLICY "reports: insert"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports: own select"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE TABLE IF NOT EXISTS public.trust_flags (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  flag_type  text NOT NULL,
  severity   text DEFAULT 'low', -- low | medium | high
  source     text,
  flagged_at timestamptz DEFAULT now()
);
ALTER TABLE public.trust_flags ENABLE ROW LEVEL SECURITY;
-- Solo admin puede ver trust_flags
DROP POLICY IF EXISTS "trust_flags: admin only" ON public.trust_flags;
CREATE POLICY "trust_flags: admin only"
  ON public.trust_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ══════════════════════════════════════════════════════════════════════════
-- 9. CONSENT LOGS (cumplimiento legal)
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.consent_logs (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  version      text NOT NULL DEFAULT '1.0',
  accepted_at  timestamptz DEFAULT now(),
  data_types   text[] DEFAULT ARRAY['profile','assessments','sparks']
);
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "consent_logs: own" ON public.consent_logs;
CREATE POLICY "consent_logs: own"
  ON public.consent_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════════════════
-- 10. Verificar resultados
-- ══════════════════════════════════════════════════════════════════════════
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'user_states','assessment_modules','assessment_questions',
    'assessment_answers','readiness_scores','relationship_frequency_scores',
    'blocks','reports','trust_flags','consent_logs'
  )
ORDER BY table_name;

SELECT name, axis, icon FROM public.assessment_modules ORDER BY order_index;
