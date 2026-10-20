-- A row in profiles contains private fields (email, emergency contacts and
-- precise coordinates). A match must not grant SELECT on the whole row.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

DO $guard$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND policyname = 'Users read matched profiles'
      AND cmd = 'SELECT' AND roles = ARRAY['public']::name[]
  ) THEN
    RAISE EXCEPTION 'Matched-profile policy changed; inspect before applying';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND policyname = 'Users read own profile' AND cmd = 'SELECT'
  ) THEN
    RAISE EXCEPTION 'Own-profile policy missing; inspect before applying';
  END IF;
END;
$guard$;

DROP POLICY "Users read matched profiles" ON public.profiles;

DO $verify$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND policyname = 'Users read matched profiles'
  ) THEN
    RAISE EXCEPTION 'Matched-profile policy remains';
  END IF;
END;
$verify$;
