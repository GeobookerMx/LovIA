-- LovIA production (project nbpidjpkanwynlhdxowx).
-- Panel editorial Fase 1: tabla book_cards para gestionar las tarjetas de lectura del libro.
-- Permite al admin editar, ordenar, publicar y retirar tarjetas sin tocar código.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

CREATE TABLE IF NOT EXISTS public.book_cards (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  num         text NOT NULL CHECK (num ~ '^[0-9]{1,3}$'),
  title       text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  fragment    text NOT NULL CHECK (char_length(fragment) BETWEEN 10 AND 600),
  synthesis   text NOT NULL CHECK (char_length(synthesis) BETWEEN 10 AND 400),
  question    text NOT NULL CHECK (char_length(question) BETWEEN 10 AND 300),
  reading_time text NOT NULL DEFAULT '3 min' CHECK (char_length(reading_time) <= 20),
  published   boolean NOT NULL DEFAULT true,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.book_cards_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS book_cards_touch ON public.book_cards;
CREATE TRIGGER book_cards_touch BEFORE UPDATE ON public.book_cards
  FOR EACH ROW EXECUTE FUNCTION public.book_cards_touch_updated_at();

ALTER TABLE public.book_cards ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.book_cards FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.book_cards TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.book_cards TO authenticated;

-- Políticas idempotentes
DROP POLICY IF EXISTS "BookCards: lectura pública" ON public.book_cards;
CREATE POLICY "BookCards: lectura pública" ON public.book_cards
  FOR SELECT TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "BookCards: admin lee todo" ON public.book_cards;
CREATE POLICY "BookCards: admin lee todo" ON public.book_cards
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "BookCards: admin escribe" ON public.book_cards;
CREATE POLICY "BookCards: admin escribe" ON public.book_cards
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "BookCards: admin actualiza" ON public.book_cards;
CREATE POLICY "BookCards: admin actualiza" ON public.book_cards
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "BookCards: admin borra" ON public.book_cards;
CREATE POLICY "BookCards: admin borra" ON public.book_cards
  FOR DELETE TO authenticated USING (public.is_admin());

-- ── Seed: las 6 tarjetas originales aprobadas por el autor (29 oct 2026) ──────
INSERT INTO public.book_cards (num, title, fragment, synthesis, question, reading_time, sort_order) VALUES
('01', 'Autoconocimiento',
 '«Es importante identificar, de manera individual, las características que se tienen al abordar la relación o comenzarla: cómo soy, qué necesito y qué puedo ofrecer en una relación.»',
 'Antes de conectar con alguien, conviene mirar lo propio: cómo eres, qué necesitas y qué ofreces.',
 '¿Qué necesito hoy en una relación y qué puedo ofrecer con honestidad?',
 '3 min', 1),
('02', 'Intención y Momento de Vida',
 '«Comprender las características individuales y los momentos de vida de las personas, con el objetivo de ayudar a crear relaciones de calidad.»',
 'Tu momento de vida influye en lo que buscas. Nombrarlo ayuda a conversar con claridad y sin falsas expectativas.',
 '¿Qué tipo de relación quiero construir en esta etapa de mi vida y por qué?',
 '3 min', 2),
('03', 'Metas Individuales',
 '«Es vital entender y comunicar las metas individuales; no deben ser calificadas como más o menos importantes.»',
 'Las metas de cada persona valen igual. En una relación sana se conversan y respetan, no se jerarquizan.',
 '¿Qué meta personal quiero cuidar y proteger mientras construyo un vínculo?',
 '4 min', 3),
('04', 'Límites y Cuidado',
 '«La tolerancia no es aguantar lo inaguantable, ni ceder hasta no reconocernos.»',
 'Ser flexible no significa renunciar a tu identidad. Conocer y comunicar tus límites es parte del amor propio.',
 '¿En qué aspectos puedo ser flexible y cuáles son mis límites innegociables?',
 '3 min', 4),
('05', 'Confianza Continua',
 '«La confianza debe renovarse continuamente, sin que necesariamente haya un conflicto.»',
 'La confianza no se trabaja solo tras una crisis; se alimenta día a día con comunicación clara y acuerdos cumplidos.',
 '¿Qué hábito diario o conversación pequeña puede fortalecer la confianza mutua?',
 '3 min', 5),
('06', 'Diferencias entre Relaciones',
 '«Todas las relaciones son diferentes, y en cada una existen factores y etapas de vida distintos.»',
 'No existe un molde único ni obligatorio. Puedes definir y acordar tu relación según lo que ambos necesitan y eligen.',
 '¿Qué visión de relación se adapta a mis valores reales, más allá de la presión social?',
 '4 min', 6);

COMMENT ON TABLE public.book_cards IS
  'Tarjetas editoriales del libro "Evolución de las Relaciones de Pareja". Gestionadas desde el panel admin sin tocar código.';
