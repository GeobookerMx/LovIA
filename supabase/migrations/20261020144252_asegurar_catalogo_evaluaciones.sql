-- The application reads these catalog tables only after login. The previous
-- containment migration removed client writes but intentionally left RLS off.
-- Stop if production has acquired other policies since the last inspection.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

DO $guard$
DECLARE
  v_name text;
  v_table text;
BEGIN
  FOREACH v_name IN ARRAY ARRAY['assessment_modules', 'assessment_questions'] LOOP
    v_table := format('public.%I', v_name);
    IF to_regclass(v_table) IS NULL THEN
      RAISE EXCEPTION 'Missing table %; inspect schema before applying', v_table;
    END IF;
    IF EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = v_name
    ) THEN
      RAISE EXCEPTION 'Existing policies on %; inspect before applying', v_table;
    END IF;
    IF NOT has_table_privilege('authenticated', v_table, 'SELECT') THEN
      RAISE EXCEPTION 'Authenticated SELECT changed on %; inspect before applying', v_table;
    END IF;
  END LOOP;
END;
$guard$;

REVOKE ALL PRIVILEGES ON TABLE
  public.assessment_modules, public.assessment_questions
  FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE
  public.assessment_modules, public.assessment_questions
  TO authenticated;

ALTER TABLE public.assessment_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assessment_modules: authenticated read"
  ON public.assessment_modules FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "assessment_questions: authenticated read"
  ON public.assessment_questions FOR SELECT TO authenticated
  USING (true);

DO $verify$
DECLARE
  v_name text;
  v_table text;
  v_privilege text;
BEGIN
  FOREACH v_name IN ARRAY ARRAY['assessment_modules', 'assessment_questions'] LOOP
    v_table := format('public.%I', v_name);
    IF NOT (
      SELECT c.relrowsecurity
      FROM pg_class c WHERE c.oid = to_regclass(v_table)
    ) THEN
      RAISE EXCEPTION 'RLS not enabled on %', v_table;
    END IF;
    IF has_table_privilege('anon', v_table, 'SELECT') OR
       NOT has_table_privilege('authenticated', v_table, 'SELECT') THEN
      RAISE EXCEPTION 'Unexpected read grants on %', v_table;
    END IF;
    FOREACH v_privilege IN ARRAY ARRAY[
      'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER', 'MAINTAIN'
    ] LOOP
      IF has_table_privilege('anon', v_table, v_privilege) OR
         has_table_privilege('authenticated', v_table, v_privilege) THEN
        RAISE EXCEPTION 'Unexpected % grant on %', v_privilege, v_table;
      END IF;
    END LOOP;
  END LOOP;
END;
$verify$;
