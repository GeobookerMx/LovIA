-- ═══════════════════════════════════════════════════════════════
-- LovIA! — Sparks, Streaks & CheckIns Schema
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ── 1. SPARKS — Daily questions ────────────────────────────────
CREATE TABLE IF NOT EXISTS sparks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  options TEXT[] NOT NULL DEFAULT '{}',
  active_date DATE UNIQUE,         -- null = not scheduled yet
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. SPARK_RESPONSES — User answers ──────────────────────────
CREATE TABLE IF NOT EXISTS spark_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  spark_id UUID NOT NULL REFERENCES sparks(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL,
  responded_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, spark_id)
);

CREATE INDEX IF NOT EXISTS idx_spark_responses_user ON spark_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_spark_responses_date ON spark_responses(responded_date);

-- ── 3. USER_STREAKS — Consecutive activity days ────────────────
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 4. EMOTIONAL_CHECKINS — Mood history ───────────────────────
CREATE TABLE IF NOT EXISTS emotional_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 10),
  context TEXT NOT NULL DEFAULT 'weekly',
  checked_in_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checkins_user ON emotional_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_date  ON emotional_checkins(checked_in_at);

-- ── RLS Policies ────────────────────────────────────────────────
ALTER TABLE sparks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE spark_responses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_checkins ENABLE ROW LEVEL SECURITY;

-- Sparks: anyone can read
CREATE POLICY "sparks_read_all" ON sparks
  FOR SELECT USING (true);

-- Spark responses: own rows only
CREATE POLICY "spark_responses_own" ON spark_responses
  FOR ALL USING (auth.uid() = user_id);

-- Streaks: own rows only
CREATE POLICY "streaks_own" ON user_streaks
  FOR ALL USING (auth.uid() = user_id);

-- Check-ins: own rows only
CREATE POLICY "checkins_own" ON emotional_checkins
  FOR ALL USING (auth.uid() = user_id);

-- ── Seed data — first 10 sparks ────────────────────────────────
INSERT INTO sparks (question, category, options, active_date) VALUES
('¿Qué cualidad admiras más en la persona que amas?',
 'Valores y Creencias',
 ARRAY['Su honestidad','Su empatía','Su ambición','Su sentido del humor'],
 CURRENT_DATE),

('¿Cómo prefieres resolver un conflicto de pareja?',
 'Comunicación',
 ARRAY['Hablando de inmediato','Dándome tiempo','Escribiéndolo','Con un abrazo primero'],
 CURRENT_DATE + 1),

('¿Qué te hace sentir más amado/a?',
 'Lenguajes del Amor',
 ARRAY['Palabras de afirmación','Tiempo de calidad','Actos de servicio','Contacto físico'],
 CURRENT_DATE + 2),

('¿Cuándo te resulta más fácil abrirte emocionalmente?',
 'Inteligencia Emocional',
 ARRAY['Cuando me siento seguro/a','Cuando hay silencio','Caminando','Nunca es fácil'],
 CURRENT_DATE + 3),

('¿Qué hábito quieres fortalecer en tu próxima relación?',
 'Crecimiento Personal',
 ARRAY['Escucha activa','Expresar mis necesidades','Dar más espacio','Ser más espontáneo/a'],
 CURRENT_DATE + 4),

('¿Qué define para ti una relación sana?',
 'Valores y Creencias',
 ARRAY['Respeto mutuo','Libertad individual','Apoyo incondicional','Comunicación profunda'],
 CURRENT_DATE + 5),

('¿Cómo reaccionas ante los celos?',
 'Inteligencia Emocional',
 ARRAY['Los expreso abiertamente','Los proceso internamente','Los ignoro','Busco diálogo'],
 CURRENT_DATE + 6),

('¿Qué tan importante es la independencia en una relación?',
 'Autonomía',
 ARRAY['Fundamental','Importante','Secundaria','Depende de la etapa'],
 CURRENT_DATE + 7),

('¿Cuál es tu mayor fortaleza como pareja?',
 'Autoconocimiento',
 ARRAY['Mi lealtad','Mi empatía','Mi humor','Mi estabilidad'],
 CURRENT_DATE + 8),

('¿Qué aprendiste de tu última relación?',
 'Crecimiento Personal',
 ARRAY['A comunicarme mejor','A respetar mis límites','A elegir con más consciencia','A amarme primero'],
 CURRENT_DATE + 9)

ON CONFLICT (active_date) DO NOTHING;

-- ── Function: update streak after spark response ────────────────
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last_date DATE;
  v_current   INTEGER;
  v_longest   INTEGER;
BEGIN
  SELECT last_activity_date, current_streak, longest_streak
  INTO v_last_date, v_current, v_longest
  FROM user_streaks WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, 1, 1, CURRENT_DATE);
    RETURN;
  END IF;

  IF v_last_date = CURRENT_DATE THEN
    RETURN; -- already counted today
  ELSIF v_last_date = CURRENT_DATE - 1 THEN
    v_current := v_current + 1;
  ELSE
    v_current := 1; -- streak broken
  END IF;

  v_longest := GREATEST(v_longest, v_current);

  UPDATE user_streaks
  SET current_streak = v_current,
      longest_streak = v_longest,
      last_activity_date = CURRENT_DATE,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
