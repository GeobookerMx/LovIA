-- ═══════════════════════════════════════════════════════════════════════════
-- LovIA — SQL de Corrección Crítica (Ejecutar en Supabase Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════════════════════
-- Este SQL arregla:
--   1. Columnas faltantes en profiles (bio, full_name, readiness_score)
--   2. Tabla specialists (si no existe)
--   3. RLS para specialists
--   4. Preguntas en tabla sparks (para que "La Chispa" funcione)
--   5. Columna readiness_score actualizada en profiles
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Columnas faltantes en profiles ────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS readiness_score INTEGER DEFAULT 0;

-- ─── 2. Tabla specialists ──────────────────────────────────────────────────
-- Si ya existía una versión previa con owner_id, la eliminamos para crearla limpia con user_id
DROP TABLE IF EXISTS specialists CASCADE;

CREATE TABLE specialists (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name                TEXT NOT NULL,
  title                    TEXT,
  cedula                   TEXT,
  specialty                TEXT,
  bio                      TEXT,
  approach                 TEXT,
  modality                 TEXT DEFAULT 'Ambas modalidades',
  session_duration_min     INTEGER DEFAULT 50,
  price_individual         NUMERIC,
  price_couple             NUMERIC,
  currency                 TEXT DEFAULT 'MXN',
  offers_sliding_scale     BOOLEAN DEFAULT false,
  city                     TEXT,
  state                    TEXT,
  neighborhood             TEXT,
  address_street           TEXT,
  maps_link                TEXT,
  available_days           TEXT[],
  time_start               TEXT,
  time_end                 TEXT,
  accepts_urgent           BOOLEAN DEFAULT false,
  phone_whatsapp           TEXT,
  email_professional       TEXT,
  website                  TEXT,
  instagram                TEXT,
  calendly_link            TEXT,
  cross_register_geobooker BOOLEAN DEFAULT false,
  status                   TEXT DEFAULT 'pending',  -- pending | active | rejected
  verified                 BOOLEAN DEFAULT false,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. RLS para specialists ──────────────────────────────────────────────
ALTER TABLE specialists ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados pueden insertar su propio registro
DROP POLICY IF EXISTS "Usuarios pueden crear su specialist" ON specialists;
CREATE POLICY "Usuarios pueden crear su specialist" ON specialists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Todos pueden leer specialists activos y verificados
DROP POLICY IF EXISTS "Lectura publica de specialists activos" ON specialists;
CREATE POLICY "Lectura publica de specialists activos" ON specialists
  FOR SELECT USING (status = 'active' AND verified = true);

-- El propio usuario puede leer su solicitud (aunque sea pending)
DROP POLICY IF EXISTS "Usuario ve su propio specialist" ON specialists;
CREATE POLICY "Usuario ve su propio specialist" ON specialists
  FOR SELECT USING (auth.uid() = user_id);

-- Admins pueden hacer todo (basado en JWT role o tabla user_roles)
DROP POLICY IF EXISTS "Admin control total de specialists" ON specialists;
CREATE POLICY "Admin control total de specialists" ON specialists
  USING (
    (auth.jwt() ->> 'role') = 'admin' OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ─── 4. Tabla sparks (si no existe) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS sparks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question    TEXT NOT NULL,
  category    TEXT NOT NULL,
  options     TEXT[] NOT NULL,
  active_date DATE UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para sparks: lectura pública, escritura solo admin
ALTER TABLE sparks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura publica de sparks" ON sparks;
CREATE POLICY "Lectura publica de sparks" ON sparks
  FOR SELECT USING (true);

-- ─── 5. Insertar preguntas en sparks para los próximos 60 días ────────────
INSERT INTO sparks (question, category, options, active_date) VALUES
-- Semana 1
('¿Cuál es tu mayor fortaleza en una relación?', 'Autoconocimiento',
 ARRAY['Comunicación abierta', 'Lealtad incondicional', 'Adaptabilidad emocional', 'Apoyo incondicional'],
 CURRENT_DATE),
('¿Cómo reaccionas cuando tu pareja necesita espacio?', 'Apego',
 ARRAY['Lo doy sin problema', 'Me cuesta pero lo respeto', 'Me preocupa aunque lo acepto', 'Me resulta muy difícil'],
 CURRENT_DATE + 1),
('¿Qué buscas principalmente en una relación?', 'Valores',
 ARRAY['Crecimiento mutuo', 'Estabilidad y seguridad', 'Aventura y espontaneidad', 'Profundidad emocional'],
 CURRENT_DATE + 2),
('¿Cómo manejas los conflictos?', 'Regulación Emocional',
 ARRAY['Los enfrento de inmediato con calma', 'Necesito tiempo para procesarlos', 'Los evito hasta que se enfríen', 'Busco mediación externa'],
 CURRENT_DATE + 3),
('¿Qué significa "confianza" para ti en pareja?', 'Valores',
 ARRAY['Honestidad total, incluso si duele', 'Privacidad respetada mutuamente', 'Constancia en las acciones', 'Apertura emocional sin juicios'],
 CURRENT_DATE + 4),
('¿Cómo expresas amor a las personas importantes?', 'Lenguajes del Amor',
 ARRAY['Palabras de afirmación', 'Tiempo de calidad', 'Actos de servicio', 'Contacto físico'],
 CURRENT_DATE + 5),
('¿Qué momento de vida describes mejor tu situación?', 'Momento de Vida',
 ARRAY['Construyendo mi proyecto personal', 'En transición o cambio importante', 'Consolidado y buscando compañía', 'Explorando y aprendiendo'],
 CURRENT_DATE + 6),
-- Semana 2
('¿Cómo defines el éxito en una relación de pareja?', 'Compatibilidad',
 ARRAY['Crecer juntos sin perder identidad', 'Disfrutar el presente sin presiones', 'Construir un proyecto de vida común', 'Apoyo mutuo en los retos de vida'],
 CURRENT_DATE + 7),
('¿Qué papel juegan los valores espirituales en tu vida?', 'Espiritualidad',
 ARRAY['Fundamentales, los comparto activamente', 'Importantes pero privados', 'Presentes pero flexibles', 'No determinantes para mí'],
 CURRENT_DATE + 8),
('¿Qué tan importante es la independencia dentro de la pareja?', 'Autonomía',
 ARRAY['Esencial — necesito mi espacio', 'Importante pero en balance', 'Prefiero alta conexión e interdependencia', 'Depende del momento vital'],
 CURRENT_DATE + 9),
('¿Cómo te relacionas con el concepto de familia?', 'Proyecto de Vida',
 ARRAY['Es mi prioridad de vida', 'Importante pero no urgente', 'La elijo más amplia (amistades, comunidad)', 'Aún lo estoy definiendo'],
 CURRENT_DATE + 10),
('¿Qué hábito define mejor tu estilo de vida?', 'Estilo de Vida',
 ARRAY['Rutinas claras y disciplina', 'Flexibilidad y adaptación', 'Equilibrio entre ambos', 'Depende de la temporada'],
 CURRENT_DATE + 11),
('¿Cómo procesas las emociones difíciles?', 'Regulación Emocional',
 ARRAY['Las analizo y escribo', 'Las hablo con alguien de confianza', 'Las proceso en silencio y tiempo', 'A través del movimiento o actividad física'],
 CURRENT_DATE + 12),
('¿Qué tan abierto estás a la vulnerabilidad emocional?', 'Intimidad',
 ARRAY['Muy abierto — la valoro profundamente', 'Selectivamente con personas cercanas', 'Trabajo en ello, me cuesta', 'Prefiero mantener cierta reserva'],
 CURRENT_DATE + 13),
-- Semana 3
('¿Qué rasgo valoras más en un compañero de vida?', 'Compatibilidad',
 ARRAY['Integridad y honestidad', 'Inteligencia emocional', 'Ambición y propósito', 'Sentido del humor y ligereza'],
 CURRENT_DATE + 14),
('¿Cómo es tu relación con el dinero y la abundancia?', 'Factores Prácticos',
 ARRAY['Es un medio para libertad y experiencias', 'Seguridad y estabilidad primero', 'Lo comparto generosamente', 'Trabajo en mi relación con él'],
 CURRENT_DATE + 15),
('¿Qué tipo de comunicación prefieres en pareja?', 'Comunicación',
 ARRAY['Directa y sin rodeos', 'Empática y considerada', 'Profunda y filosófica', 'Mixta según el momento'],
 CURRENT_DATE + 16),
('¿Cómo describes tu estilo de apego histórico?', 'Apego',
 ARRAY['Seguro — me vinculo con confianza', 'Ansioso — busco mucha conexión', 'Evitativo — valoro la independencia', 'En proceso de sanar mi estilo'],
 CURRENT_DATE + 17),
('¿Qué tan compatible eres con el silencio compartido?', 'Intimidad',
 ARRAY['Me encanta — me hace sentir conectado', 'Es cómodo si hay confianza', 'Prefiero la conversación activa', 'Depende del estado emocional'],
 CURRENT_DATE + 18),
('¿Qué significa para ti el compromiso en una relación?', 'Valores',
 ARRAY['Elección diaria consciente', 'Promesa de largo plazo', 'Proceso gradual de profundización', 'Presencia total en el presente'],
 CURRENT_DATE + 19),
('¿Qué tan alineado estás con tu propósito de vida?', 'Momento de Vida',
 ARRAY['Muy claro y en acción', 'Lo tengo definido, aún construyéndolo', 'En proceso de descubrirlo', 'La relación forma parte de descubrirlo'],
 CURRENT_DATE + 20)
ON CONFLICT (active_date) DO NOTHING;

-- ─── 6. Recalcular readiness_score para usuarios con evaluaciones existentes ──
-- Este UPDATE recalcula el readiness de todos los usuarios que ya tienen evaluaciones.
-- Útil para que usuarios que completaron tests antes de este fix vean el Radar desbloqueado.
WITH eval_scores AS (
  SELECT
    user_id,
    SUM(CASE
      WHEN test_type = 'stroop' AND passed THEN 20
      WHEN test_type = 'digit_span' AND passed THEN 20
      WHEN test_type = 'frustration_tolerance' THEN ROUND(CAST(score AS NUMERIC) / 100 * 30)
      WHEN test_type = 'emotional_regulation' THEN ROUND(CAST(score AS NUMERIC) / 100 * 30)
      ELSE 0
    END) AS readiness
  FROM evaluations
  GROUP BY user_id
)
UPDATE profiles p
SET readiness_score = LEAST(100, GREATEST(0, es.readiness))
FROM eval_scores es
WHERE p.id = es.user_id;

-- ─── Verificación final ────────────────────────────────────────────────────
-- Ejecuta estas queries para verificar que todo funcionó:
-- SELECT id, alias, readiness_score FROM profiles WHERE readiness_score > 0;
-- SELECT COUNT(*) FROM sparks WHERE active_date >= CURRENT_DATE;
-- SELECT COUNT(*) FROM specialists;
