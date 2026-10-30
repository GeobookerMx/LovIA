-- LovIA production only (project nbpidjpkanwynlhdxowx).
-- Módulo «Dinero y proyecto de vida», fase 2: respuestas PRIVADAS del recorrido personal.
-- Dependencias: public.is_admin() (ya existente). No toca tablas existentes.
-- Alcance: respuestas propias + interruptor de activación. NO incluye conversaciones
-- compartidas, presupuesto ni Admin editorial (fases posteriores).
-- Privacidad: cada fila pertenece a un usuario. Nadie más puede leerla, ni siquiera
-- un administrador (no hay política de lectura para admin). Se borra al eliminar la cuenta.
-- Reversión (sólo si se decide retirar el módulo; BORRA las respuestas guardadas):
--   DROP TABLE public.finance_answers;
--   DROP TABLE public.lovia_feature_flags;
--   DROP FUNCTION public.finance_touch_updated_at();
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

DO $guard$
BEGIN
  IF to_regprocedure('public.is_admin()') IS NULL THEN
    RAISE EXCEPTION 'Falta public.is_admin(); revisar antes de aplicar';
  END IF;
  IF to_regclass('public.finance_answers') IS NOT NULL
     OR to_regclass('public.lovia_feature_flags') IS NOT NULL THEN
    RAISE EXCEPTION 'Ya existe una tabla del módulo; revisar antes de aplicar';
  END IF;
END;
$guard$;

-- ── Interruptor de activación ────────────────────────────────────────────────
CREATE TABLE public.lovia_feature_flags (
  key        text PRIMARY KEY CHECK (key ~ '^[a-z0-9_]{3,60}$'),
  enabled    boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lovia_feature_flags ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.lovia_feature_flags FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.lovia_feature_flags TO authenticated;
GRANT UPDATE ON TABLE public.lovia_feature_flags TO authenticated;

CREATE POLICY "Flags: lectura autenticada" ON public.lovia_feature_flags
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Flags: sólo admin actualiza" ON public.lovia_feature_flags
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Apagado por defecto: se activa sólo después de verificar permisos y persistencia.
INSERT INTO public.lovia_feature_flags (key, enabled) VALUES ('finance_private_save', false);

-- ── Respuestas privadas ──────────────────────────────────────────────────────
CREATE TABLE public.finance_answers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  catalog_version text NOT NULL CHECK (catalog_version ~ '^[a-z0-9._-]{1,30}$'),
  question_key    text NOT NULL CHECK (question_key ~ '^[a-z0-9_]{1,40}$'),
  status          text NOT NULL CHECK (status IN ('answered', 'unsure', 'skipped')),
  selected        jsonb NOT NULL DEFAULT '[]'::jsonb
                  CHECK (jsonb_typeof(selected) = 'array' AND jsonb_array_length(selected) <= 10),
  free_text       text CHECK (free_text IS NULL OR char_length(free_text) <= 1000),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  -- Idempotencia: un doble toque actualiza la misma fila, no crea duplicados.
  CONSTRAINT finance_answers_unique UNIQUE (user_id, catalog_version, question_key)
);

CREATE FUNCTION public.finance_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $f$
BEGIN
  NEW.updated_at := now();
  NEW.user_id := OLD.user_id;      -- el propietario no puede cambiar
  RETURN NEW;
END;
$f$;
CREATE TRIGGER finance_answers_touch BEFORE UPDATE ON public.finance_answers
  FOR EACH ROW EXECUTE FUNCTION public.finance_touch_updated_at();

ALTER TABLE public.finance_answers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.finance_answers FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.finance_answers TO authenticated;

CREATE POLICY "Finanzas: leer lo propio" ON public.finance_answers
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Finanzas: insertar lo propio" ON public.finance_answers
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Finanzas: actualizar lo propio" ON public.finance_answers
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Finanzas: borrar lo propio" ON public.finance_answers
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));
