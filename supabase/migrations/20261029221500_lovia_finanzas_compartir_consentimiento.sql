-- LovIA production (project nbpidjpkanwynlhdxowx).
-- Módulo «Dinero y proyecto de vida» — Fase 4: Conversaciones compartidas con consentimiento.
-- Diseño de privacidad:
--   • Persona A genera un código de invitación de 8 caracteres (válido 7 días).
--   • Persona B acepta con ese código. Ambas ven SOLO las respuestas que la otra marcó
--     como "compartir" (campo share_consent en finance_answers). Por defecto: false.
--   • Cualquiera puede revocar el acceso en cualquier momento (DELETE).
--   • Las respuestas con share_consent=false nunca son visibles para nadie más.
-- Dependencias: public.finance_answers, public.is_admin() (ya existen).
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

DO $guard$
BEGIN
  IF to_regclass('public.finance_share_invites') IS NOT NULL
     OR to_regclass('public.finance_share_links') IS NOT NULL THEN
    RAISE EXCEPTION 'Ya existe una tabla de consentimiento; revisar antes de aplicar';
  END IF;
END;
$guard$;

-- ── 1. Campo de consentimiento en finance_answers ────────────────────────────
-- share_consent: true = la persona acepta que su pareja vea esta respuesta.
-- Por defecto false: privado salvo decisión explícita.
ALTER TABLE public.finance_answers
  ADD COLUMN IF NOT EXISTS share_consent boolean NOT NULL DEFAULT false;

-- ── 2. Tabla de enlaces de consentimiento ────────────────────────────────────
-- Un enlace conecta dos usuarios que AMBOS aceptaron explícitamente.
CREATE TABLE public.finance_share_links (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b       uuid          REFERENCES auth.users(id) ON DELETE SET NULL,
  invite_code  text NOT NULL UNIQUE CHECK (invite_code ~ '^[A-Z0-9]{8}$'),
  status       text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'active', 'revoked')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  accepted_at  timestamptz,
  expires_at   timestamptz NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  -- Un usuario sólo puede tener un enlace activo a la vez
  CONSTRAINT finance_share_links_user_a_active UNIQUE NULLS NOT DISTINCT (user_a, status)
);

ALTER TABLE public.finance_share_links ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.finance_share_links FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.finance_share_links TO authenticated;

-- user_a puede leer su propio enlace
CREATE POLICY "Share: user_a lee su enlace" ON public.finance_share_links
  FOR SELECT TO authenticated USING (user_a = (SELECT auth.uid()));

-- user_b puede leer el enlace que le pertenece (para aceptar)
CREATE POLICY "Share: user_b lee su enlace" ON public.finance_share_links
  FOR SELECT TO authenticated USING (user_b = (SELECT auth.uid()));

-- Cualquier usuario autenticado puede insertar (crear invitación)
CREATE POLICY "Share: crear invitación" ON public.finance_share_links
  FOR INSERT TO authenticated WITH CHECK (user_a = (SELECT auth.uid()));

-- user_a o user_b pueden revocar (DELETE)
CREATE POLICY "Share: revocar" ON public.finance_share_links
  FOR DELETE TO authenticated USING (
    user_a = (SELECT auth.uid()) OR user_b = (SELECT auth.uid())
  );

-- ── 3. Política adicional en finance_answers para lectura compartida ─────────
-- Permite leer respuestas con share_consent=true de la pareja vinculada.
CREATE POLICY "Finanzas: leer respuestas compartidas de pareja" ON public.finance_answers
  FOR SELECT TO authenticated USING (
    share_consent = true
    AND EXISTS (
      SELECT 1 FROM public.finance_share_links fsl
      WHERE fsl.status = 'active'
        AND fsl.expires_at > now()
        AND (
          (fsl.user_a = finance_answers.user_id AND fsl.user_b = (SELECT auth.uid()))
          OR
          (fsl.user_b = finance_answers.user_id AND fsl.user_a = (SELECT auth.uid()))
        )
    )
  );

-- ── 4. Función helper para aceptar una invitación ────────────────────────────
CREATE OR REPLACE FUNCTION public.finance_accept_invite(p_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_link public.finance_share_links;
  v_me   uuid := auth.uid();
BEGIN
  -- Buscar el enlace pendiente y válido
  SELECT * INTO v_link
  FROM public.finance_share_links
  WHERE invite_code = p_code
    AND status = 'pending'
    AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Código no válido, expirado o ya usado';
  END IF;

  IF v_link.user_a = v_me THEN
    RAISE EXCEPTION 'No puedes aceptar tu propia invitación';
  END IF;

  UPDATE public.finance_share_links
  SET user_b = v_me,
      status = 'active',
      accepted_at = now()
  WHERE id = v_link.id;
END;
$$;

REVOKE ALL ON FUNCTION public.finance_accept_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.finance_accept_invite(text) TO authenticated;

COMMENT ON TABLE public.finance_share_links IS
  'Enlace de consentimiento entre dos usuarios del módulo de finanzas. Ambos deben aceptar explícitamente. Expira en 7 días.';
COMMENT ON COLUMN public.finance_answers.share_consent IS
  'Si es true, la pareja vinculada puede ver esta respuesta. Defecto false (privada).';
