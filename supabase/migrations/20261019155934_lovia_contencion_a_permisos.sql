SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

DO $guard$
DECLARE
  v_function oid := to_regprocedure('public.set_admin_role(uuid)');
BEGIN
  IF v_function IS NULL THEN
    RAISE EXCEPTION 'No se encontró la función esperada; detener revisión';
  END IF;
  IF md5(pg_get_functiondef(v_function)) <>
     'ef018958e90aa9579b8010f02a8b96ec' THEN
    RAISE EXCEPTION 'La definición cambió; repetir auditoría';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'moderation_reports'
      AND policyname = 'Admins read reports'
      AND permissive = 'PERMISSIVE' AND cmd = 'SELECT'
      AND roles = ARRAY['public']::name[] AND qual = 'true'
      AND with_check IS NULL
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'moderation_reports'
      AND policyname = 'Admins update reports'
      AND permissive = 'PERMISSIVE' AND cmd = 'UPDATE'
      AND roles = ARRAY['public']::name[] AND qual = 'true'
      AND with_check IS NULL
  ) THEN
    RAISE EXCEPTION 'Las políticas abiertas cambiaron; repetir auditoría';
  END IF;

  IF (
    SELECT count(*) FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN ('assessment_modules', 'assessment_questions')
      AND c.relkind = 'r' AND NOT c.relrowsecurity
  ) <> 2 THEN
    RAISE EXCEPTION 'Cambió el estado de las tablas; repetir auditoría';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class
    WHERE oid = 'public.moderation_reports'::regclass
      AND relrowsecurity
  ) THEN
    RAISE EXCEPTION 'Moderación debe conservar RLS activo';
  END IF;
END;
$guard$;

REVOKE EXECUTE ON FUNCTION public.set_admin_role(uuid)
  FROM PUBLIC, anon, authenticated;

DROP POLICY "Admins read reports" ON public.moderation_reports;
DROP POLICY "Admins update reports" ON public.moderation_reports;

REVOKE ALL PRIVILEGES ON TABLE
  public.assessment_modules, public.assessment_questions
  FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE
  public.assessment_modules, public.assessment_questions
  TO anon, authenticated;

DO $verify$
DECLARE
  v_role text;
  v_table text;
  v_privilege text;
BEGIN
  FOREACH v_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF has_function_privilege(
      v_role, 'public.set_admin_role(uuid)', 'EXECUTE'
    ) THEN
      RAISE EXCEPTION 'La función sigue ejecutable por %', v_role;
    END IF;

    FOREACH v_table IN ARRAY ARRAY[
      'public.assessment_modules', 'public.assessment_questions'
    ] LOOP
      IF NOT has_table_privilege(v_role, v_table, 'SELECT') THEN
        RAISE EXCEPTION 'Se perdió lectura de % para %', v_table, v_role;
      END IF;
      FOREACH v_privilege IN ARRAY ARRAY[
        'INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'
      ] LOOP
        IF has_table_privilege(v_role, v_table, v_privilege) THEN
          RAISE EXCEPTION 'Persiste % sobre % para %',
            v_privilege, v_table, v_role;
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'moderation_reports'
      AND policyname IN ('Admins read reports', 'Admins update reports')
  ) THEN
    RAISE EXCEPTION 'Persisten políticas abiertas';
  END IF;

  IF NOT has_function_privilege(
    'service_role', 'public.set_admin_role(uuid)', 'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'Cambió inesperadamente el permiso de servidor';
  END IF;
END;
$verify$;
