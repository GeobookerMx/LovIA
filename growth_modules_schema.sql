-- =========================================================================
-- MIGRACIÓN DE MÓDULOS DE CRECIMIENTO DINÁMICOS
-- =========================================================================
-- Esta migración crea las tablas de módulos de crecimiento, lecciones y progreso,
-- y las rellena con el contenido científico de los 5 módulos principales.
-- =========================================================================

-- 1. Tabla de Módulos
CREATE TABLE IF NOT EXISTS public.growth_modules (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  subtitle       TEXT,
  icon_name      TEXT DEFAULT 'book-open',
  color          TEXT DEFAULT 'var(--love-rose)',
  author         TEXT,
  duration       TEXT,
  benefit        TEXT,
  science_basis  TEXT,
  key_research   TEXT,
  required_tier  TEXT DEFAULT 'free',
  order_index    INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Lecciones
CREATE TABLE IF NOT EXISTS public.growth_module_lessons (
  id             TEXT PRIMARY KEY,
  module_id      TEXT REFERENCES public.growth_modules(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  duration       TEXT DEFAULT '15 min',
  type           TEXT DEFAULT 'theory', -- theory | exercise | reflection
  content_type   TEXT DEFAULT 'article', -- video | article | audio | reflection
  content_url    TEXT, -- YouTube/Vimeo/CDN link
  description    TEXT,
  rich_content   TEXT, -- Contenido enriquecido para artículos o prompts de reflexión
  order_index    INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Progreso del Usuario
CREATE TABLE IF NOT EXISTS public.growth_progress (
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id         TEXT REFERENCES public.growth_module_lessons(id) ON DELETE CASCADE,
  completed         BOOLEAN DEFAULT true,
  reflection_answer TEXT, -- Guarda las respuestas a las lecciones de reflexión
  completed_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);

-- Habilitar RLS
ALTER TABLE public.growth_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_module_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_progress ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Lectura publica de growth_modules" ON public.growth_modules;
CREATE POLICY "Lectura publica de growth_modules" ON public.growth_modules
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura publica de growth_module_lessons" ON public.growth_module_lessons;
CREATE POLICY "Lectura publica de growth_module_lessons" ON public.growth_module_lessons
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Progreso visible por el propio usuario" ON public.growth_progress;
CREATE POLICY "Progreso visible por el propio usuario" ON public.growth_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuario puede modificar su propio progreso" ON public.growth_progress;
CREATE POLICY "Usuario puede modificar su propio progreso" ON public.growth_progress
  USING (auth.uid() = user_id);


-- 4. Inserción de Módulos (growth_modules)
INSERT INTO public.growth_modules (id, title, subtitle, icon_name, color, author, duration, benefit, science_basis, key_research, required_tier, order_index) VALUES
(
  'ie',
  'Inteligencia Emocional',
  'Reconoce, comprende y gestiona tus emociones',
  'brain',
  'var(--line-love)',
  'Salovey & Mayer (1990)',
  '3 semanas',
  '+36% satisfacción relacional (Brackett et al., 2005)',
  'La inteligencia emocional es la capacidad de percibir, comprender, manejar y utilizar las emociones de manera efectiva. Las personas con alta IE tienen relaciones más satisfactorias (Brackett et al., 2005) y mayor bienestar psicológico (Mayer et al., 2008).',
  'Las parejas donde ambos miembros tienen alta IE reportan un 36% más de satisfacción relacional y un 40% menos de conflictos destructivos.',
  'free',
  1
),
(
  'cnv',
  'Comunicación No Violenta',
  'Expresa necesidades sin atacar ni retraerte',
  'message-circle',
  'var(--line-sex)',
  'Rosenberg (2015) + Gottman (1999)',
  '4 semanas',
  'Reduce 94% de los patrones que predicen ruptura',
  'La CNV es un modelo de comunicación que separa observaciones de juicios, identifica sentimientos y necesidades, y formula peticiones claras. Gottman identificó los "4 Jinetes" (crítica, desdén, defensividad, evasión) como predictores del 94% de los divorcios.',
  'Parejas que practican CNV reducen los conflictos destructivos en un 67% y reportan mayor intimidad emocional (Wacker & Dziobek, 2009).',
  'free',
  2
),
(
  'regulation',
  'Regulación Emocional',
  'Estrategias para manejar emociones intensas',
  'shield',
  'var(--line-realization)',
  'Gross & John (2003)',
  '2 semanas',
  'Las personas con alta RE tienen relaciones 40% más estables',
  'El modelo de proceso de Gross distingue entre estrategias de regulación emocional adaptativas (reappraisal) y desadaptativas (supresión). Las personas que usan predominantemente reappraisal tienen mejor bienestar y relaciones más satisfactorias.',
  'La supresión emocional reduce la satisfacción relacional en un 25% y aumenta los síntomas depresivos (Gross & John, 2003).',
  'free',
  3
),
(
  'attachment',
  'Estilos de Apego',
  'Comprende tu patrón de vinculación',
  'heart',
  'var(--love-warm)',
  'Bowlby (1969) + Hazan & Shaver (1987)',
  '3 semanas',
  'El apego seguro predice 50% más estabilidad (Mikulincer, 2003)',
  'La teoría del apego describe cómo nuestros vínculos tempranos con cuidadores moldean nuestros patrones relacionales adultos. Existen 4 estilos: seguro, ansioso, evitativo, y desorganizado. El apego seguro se puede desarrollar a cualquier edad.',
  'Las parejas con apego seguro reportan 50% más estabilidad relacional y menor incidencia de ruptura (Mikulincer & Shaver, 2003).',
  'free',
  4
),
(
  'sexuality',
  'Sexualidad Consciente',
  'Intimidad, deseo y comunicación sexual',
  'flame',
  'var(--love-coral)',
  'Perel (2006) + Masters & Johnson',
  '3 semanas',
  'Parejas que hablan de deseo reportan 60% más satisfacción',
  'La intimidad sexual es una dimensión fundamental de las relaciones adultas. Perel distingue entre el deseo de seguridad y el de aventura, ambos necesarios. La comunicación abierta sobre sexualidad predice mayor satisfacción relacional.',
  'Las parejas que hablan abiertamente de su sexualidad reportan un 60% más de satisfacción tanto sexual como relacional (Frederick et al., 2017).',
  'free',
  5
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  icon_name = EXCLUDED.icon_name,
  color = EXCLUDED.color,
  author = EXCLUDED.author,
  duration = EXCLUDED.duration,
  benefit = EXCLUDED.benefit,
  science_basis = EXCLUDED.science_basis,
  key_research = EXCLUDED.key_research,
  order_index = EXCLUDED.order_index;


-- 5. Inserción de Lecciones (growth_module_lessons)
-- Inteligencia Emocional (ie)
INSERT INTO public.growth_module_lessons (id, module_id, title, duration, type, content_type, content_url, description, rich_content, order_index) VALUES
('ie-1', 'ie', 'Reconocimiento emocional', '15 min', 'theory', 'article', NULL, 'Identifica las 6 emociones básicas (Ekman, 1992) y cómo se manifiestan en tu cuerpo.', 'Las emociones básicas según Paul Ekman son: alegría, tristeza, ira, asco, sorpresa y miedo. Cada una de ellas produce una respuesta fisiológica clara y facialmente identificable. Aprender a nombrarlas en lugar de catalogarlas genéricamente como "sentirse mal" es el primer paso de la Inteligencia Emocional.', 1),
('ie-2', 'ie', 'Ejercicio: Diario emocional', '10 min', 'exercise', 'reflection', NULL, 'Registra tus emociones durante el día y detecta patrones relacionales.', 'Escribe detalladamente las emociones que has experimentado en las últimas 12 horas. ¿Qué estímulos las detonaron y cómo respondiste físicamente?', 2),
('ie-3', 'ie', 'Empatía y perspectiva', '20 min', 'theory', 'video', 'https://www.youtube.com/embed/1Evwgu369Jw', 'Desarrolla la capacidad de "ponerse en los zapatos del otro" y comprender su vivencia interna.', 'La empatía cognitiva (comprender el punto de vista del otro) y la empatía afectiva (conectar con su sentir) son complementarias. Este video explica cómo modular ambas para evitar la sobrecarga empática en parejas.', 3),
('ie-4', 'ie', 'Reflexión: Mi patrón empático', '10 min', 'reflection', 'reflection', NULL, 'Analiza tu respuesta empática ante las crisis de personas que quieres.', '¿Tiendes a buscar soluciones inmediatas (empatía cognitiva pura) o te abrumas emocionalmente junto con tu pareja? Escribe tu reflexión.', 4),
('ie-5', 'ie', 'Gestión de emociones intensas', '20 min', 'theory', 'article', NULL, 'Técnicas de regulación: respiración 4-7-8 y reevaluación cognitiva (Gross, 2002).', 'La reevaluación cognitiva (cognitive reappraisal) consiste en cambiar la interpretación de un evento estresante para alterar su impacto emocional. Es la herramienta de mayor éxito a largo plazo según los estudios de James Gross.', 5)
ON CONFLICT (id) DO NOTHING;

-- Comunicación No Violenta (cnv)
INSERT INTO public.growth_module_lessons (id, module_id, title, duration, type, content_type, content_url, description, rich_content, order_index) VALUES
('cnv-1', 'cnv', 'Los 4 Jinetes del Apocalipsis', '20 min', 'theory', 'article', NULL, 'Identifica los 4 patrones comunicativos tóxicos que predicen rupturas (Gottman, 1999).', 'Los 4 jinetes son: la crítica destructiva, la actitud defensiva, el desprecio (el predictor #1 de ruptura) y la evasión (stonewalling). Identificar cuándo entran en juego es vital para sustituirlos por sus antídotos.', 1),
('cnv-2', 'cnv', 'Observar sin juzgar', '15 min', 'theory', 'video', 'https://www.youtube.com/embed/8F20G6D00pU', 'Aprende a describir situaciones de forma neutra y objetiva sin interpretaciones subjetivas.', 'Marshall Rosenberg postula que observar sin evaluar es la forma más alta de inteligencia humana. Este video enseña la diferencia entre "llegaste tarde de nuevo" y "habíamos acordado a las 8 y llegaste a las 8:30".', 2),
('cnv-3', 'cnv', 'Reflexión: Mis Jinetes habituales', '10 min', 'reflection', 'reflection', NULL, 'Identifica cuál de los 4 jinetes usas con mayor frecuencia cuando te sientes atacado/a.', 'Escribe una situación reciente donde usaste crítica, desprecio, defensividad o evasión, y cómo podrías haber aplicado el antídoto.', 3)
ON CONFLICT (id) DO NOTHING;

-- Regulación Emocional (regulation)
INSERT INTO public.growth_module_lessons (id, module_id, title, duration, type, content_type, content_url, description, rich_content, order_index) VALUES
('reg-1', 'regulation', 'El modelo de proceso emocional', '20 min', 'theory', 'article', NULL, 'Comprende cómo se generan las emociones y en qué fase puedes regularlas (Gross, 1998).', 'El modelo de Gross explica que la emoción inicia con una situación, seguida de la atención focalizada, la interpretación cognitiva y finalmente la respuesta. Intervenir tempranamente (reevaluando) es mejor que reprimir la respuesta.', 1),
('reg-2', 'regulation', 'Reappraisal vs. Supresión', '15 min', 'theory', 'video', 'https://www.youtube.com/embed/jC81j33pG1M', 'Dos estrategias opuestas con impactos radicalmente distintos en tu salud relacional.', 'Veremos la neurobiología de reevaluar una situación versus suprimir la expresión de una emoción, y por qué la supresión eleva la presión arterial en ambos miembros de la pareja.', 2),
('reg-3', 'regulation', 'Ejercicio: Mi plan de regulación', '12 min', 'reflection', 'reflection', NULL, 'Diseña un plan de acción para la próxima vez que sientas un desbordamiento emocional.', 'Escribe 3 pasos concretos (ej: distanciamiento de 20 minutos, respiración diafragmática, etiquetado verbal) que usarás ante el enojo.', 3)
ON CONFLICT (id) DO NOTHING;
