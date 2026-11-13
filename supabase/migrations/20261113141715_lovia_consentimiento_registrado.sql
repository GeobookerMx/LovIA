-- Versión alineada con la aplicación remota por MCP del 13-11-2026.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- Evidencia del servidor; no se importan consentimientos desde metadata editable.
CREATE TABLE public.legal_acceptances (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  legal_version text NOT NULL,
  age_confirmed_18 boolean NOT NULL CHECK (age_confirmed_18),
  sensitive_data_consent boolean NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.legal_acceptances FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.legal_acceptances TO authenticated;
CREATE POLICY "Consentimiento: leer estado propio" ON public.legal_acceptances
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

-- Una tabla nueva conserva evidencia no editable. No modifica permisos ni
-- escrituras de clientes antiguos sobre tablas existentes.
CREATE TABLE public.legal_acceptance_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type text NOT NULL CHECK (consent_type IN ('terms_v1','privacy_v1','sensitive_data_v1')),
  accepted_at timestamptz NOT NULL DEFAULT now(),
  legal_version text NOT NULL,
  granted boolean NOT NULL
);
ALTER TABLE public.legal_acceptance_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.legal_acceptance_events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.legal_acceptance_events TO authenticated;
CREATE POLICY "Consentimiento: leer evidencia propia" ON public.legal_acceptance_events
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE FUNCTION lovia_private.record_legal_acceptance(
  p_version text, p_terms_accepted boolean, p_age_confirmed boolean, p_sensitive_data boolean
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_id uuid := auth.uid();
  v_state public.legal_acceptances%ROWTYPE;
BEGIN
  IF v_id IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_id) THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF p_version IS DISTINCT FROM '2026-11-13' OR p_terms_accepted IS DISTINCT FROM true
    OR p_age_confirmed IS DISTINCT FROM true OR p_sensitive_data IS NULL THEN
    RAISE EXCEPTION 'Explicit current acceptance required' USING ERRCODE = '22023';
  END IF;
  -- Serializar las solicitudes de una misma cuenta para evitar eventos duplicados.
  PERFORM 1 FROM auth.users WHERE id = v_id FOR UPDATE;
  SELECT * INTO v_state FROM public.legal_acceptances WHERE user_id = v_id;
  IF FOUND AND v_state.legal_version = p_version AND v_state.sensitive_data_consent = p_sensitive_data THEN
    RETURN to_jsonb(v_state) - 'user_id';
  END IF;
  INSERT INTO public.legal_acceptances(user_id, legal_version, age_confirmed_18, sensitive_data_consent)
  VALUES(v_id, p_version, true, p_sensitive_data)
  ON CONFLICT (user_id) DO UPDATE SET legal_version = EXCLUDED.legal_version,
    age_confirmed_18 = true, sensitive_data_consent = EXCLUDED.sensitive_data_consent, recorded_at = now()
  RETURNING * INTO v_state;
  INSERT INTO public.legal_acceptance_events(user_id, consent_type, accepted_at, legal_version, granted)
  VALUES (v_id, 'terms_v1', now(), p_version, true), (v_id, 'privacy_v1', now(), p_version, true),
    (v_id, 'sensitive_data_v1', now(), p_version, p_sensitive_data);
  RETURN to_jsonb(v_state) - 'user_id';
END;
$$;
REVOKE ALL ON FUNCTION lovia_private.record_legal_acceptance(text,boolean,boolean,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION lovia_private.record_legal_acceptance(text,boolean,boolean,boolean) TO authenticated;

CREATE FUNCTION public.record_legal_acceptance(
  p_version text, p_terms_accepted boolean, p_age_confirmed boolean, p_sensitive_data boolean
) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path = ''
AS $$ SELECT lovia_private.record_legal_acceptance(p_version,p_terms_accepted,p_age_confirmed,p_sensitive_data); $$;
REVOKE ALL ON FUNCTION public.record_legal_acceptance(text,boolean,boolean,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_legal_acceptance(text,boolean,boolean,boolean) TO authenticated;

CREATE FUNCTION public.has_sensitive_data_consent()
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = ''
AS $$ SELECT EXISTS (SELECT 1 FROM public.legal_acceptances
  WHERE user_id = auth.uid() AND legal_version = '2026-11-13' AND sensitive_data_consent); $$;
REVOKE ALL ON FUNCTION public.has_sensitive_data_consent() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_sensitive_data_consent() TO authenticated;

-- Revocar la elección opcional no obliga a aceptar de nuevo términos ni mayoría de edad.
CREATE FUNCTION lovia_private.set_sensitive_data_consent(p_allowed boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_id uuid := auth.uid(); v_state public.legal_acceptances%ROWTYPE;
BEGIN
  IF v_id IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id=v_id) THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501';
  END IF;
  IF p_allowed IS NULL THEN RAISE EXCEPTION 'Explicit choice required' USING ERRCODE='22023'; END IF;
  PERFORM 1 FROM auth.users WHERE id=v_id FOR UPDATE;
  SELECT * INTO v_state FROM public.legal_acceptances WHERE user_id=v_id;
  IF NOT FOUND OR (p_allowed AND v_state.legal_version <> '2026-11-13') THEN
    RAISE EXCEPTION 'Current acceptance required' USING ERRCODE='22023';
  END IF;
  IF v_state.sensitive_data_consent IS DISTINCT FROM p_allowed THEN
    UPDATE public.legal_acceptances SET sensitive_data_consent=p_allowed, recorded_at=now()
    WHERE user_id=v_id RETURNING * INTO v_state;
    INSERT INTO public.legal_acceptance_events(user_id,consent_type,accepted_at,legal_version,granted)
    VALUES(v_id,'sensitive_data_v1',now(),v_state.legal_version,p_allowed);
  END IF;
  RETURN to_jsonb(v_state)-'user_id';
END;
$$;
REVOKE ALL ON FUNCTION lovia_private.set_sensitive_data_consent(boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION lovia_private.set_sensitive_data_consent(boolean) TO authenticated;
CREATE FUNCTION public.set_sensitive_data_consent(p_allowed boolean)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=''
AS $$ SELECT lovia_private.set_sensitive_data_consent(p_allowed); $$;
REVOKE ALL ON FUNCTION public.set_sensitive_data_consent(boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.set_sensitive_data_consent(boolean) TO authenticated;

-- Las políticas restrictivas de tablas existentes se activarán por separado,
-- después de comprobar la distribución de los clientes nuevos.
