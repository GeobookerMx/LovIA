-- Aplicada por MCP el 13-11-2026. Versión local alineada con el historial remoto.
-- Contención sin modificar ni borrar respuestas, cuentas o coordenadas existentes.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- Restringe nuevas cargas. No cambia la visibilidad ni elimina objetos previos.
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'avatars';

DROP POLICY IF EXISTS "Finanzas: admin lee conteos" ON public.finance_answers;
REVOKE ALL ON public.finance_answers_admin_summary FROM PUBLIC, anon, authenticated;
ALTER VIEW public.finance_answers_admin_summary SET (security_invoker = true);
COMMENT ON VIEW public.finance_answers_admin_summary IS
  'Vista interna sin acceso de clientes. No concede acceso administrativo a respuestas.';

-- Un punto medio exacto permite reconstruir la ubicación de la otra persona.
-- No se entrega ninguna ubicación derivada hasta disponer de un catálogo real.
CREATE OR REPLACE FUNCTION public.suggest_safe_venue(p_match_id uuid)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT NULL::jsonb;
$$;
REVOKE ALL ON FUNCTION public.suggest_safe_venue(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.suggest_safe_venue(uuid) TO authenticated;

-- Inicio de baja dentro de la app. Registrar una solicitud no elimina la cuenta.
-- La ejecución requiere el procedimiento de Storage, referencias y Apple.
CREATE TABLE public.account_deletion_requests (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing'))
);
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.account_deletion_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.account_deletion_requests TO authenticated;
CREATE POLICY "Baja: leer solicitud propia o admin" ON public.account_deletion_requests
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

-- La operación privilegiada reside en un esquema no expuesto por la Data API.
CREATE SCHEMA IF NOT EXISTS lovia_private;
REVOKE ALL ON SCHEMA lovia_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA lovia_private TO authenticated;
CREATE OR REPLACE FUNCTION lovia_private.request_account_deletion(p_confirmation text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_request public.account_deletion_requests%ROWTYPE;
BEGIN
  IF v_user_id IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF p_confirmation IS DISTINCT FROM 'ELIMINAR' THEN
    RAISE EXCEPTION 'Explicit confirmation required' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.account_deletion_requests (user_id)
  VALUES (v_user_id) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO STRICT v_request FROM public.account_deletion_requests WHERE user_id = v_user_id;
  RETURN jsonb_build_object('status', v_request.status, 'requested_at', v_request.requested_at);
END;
$$;
REVOKE ALL ON FUNCTION lovia_private.request_account_deletion(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION lovia_private.request_account_deletion(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.request_account_deletion(p_confirmation text)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path = ''
AS $$ SELECT lovia_private.request_account_deletion(p_confirmation); $$;
REVOKE ALL ON FUNCTION public.request_account_deletion(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_account_deletion(text) TO authenticated;
