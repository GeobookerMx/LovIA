-- Isolated branch fixture. No production rows or user data.
CREATE TABLE IF NOT EXISTS public.profiles (id uuid PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.matches (id uuid PRIMARY KEY);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.profiles, public.matches TO anon, authenticated, service_role;

DO $check$
BEGIN
  IF NOT has_table_privilege('anon', 'public.profiles', 'TRUNCATE')
     OR NOT has_table_privilege('authenticated', 'public.matches', 'TRIGGER') THEN
    RAISE EXCEPTION 'Fixture did not reproduce the excessive grants';
  END IF;
END;
$check$;
