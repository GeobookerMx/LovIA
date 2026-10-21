DO $check$
BEGIN
  IF has_table_privilege('anon', 'public.profiles', 'TRUNCATE')
     OR has_table_privilege('authenticated', 'public.profiles', 'TRUNCATE')
     OR has_table_privilege('anon', 'public.matches', 'TRIGGER')
     OR has_table_privilege('authenticated', 'public.matches', 'REFERENCES') THEN
    RAISE EXCEPTION 'Client administrative privileges remain';
  END IF;
  IF NOT has_table_privilege('authenticated', 'public.profiles', 'SELECT')
     OR NOT has_table_privilege('authenticated', 'public.matches', 'UPDATE')
     OR NOT has_table_privilege('service_role', 'public.profiles', 'TRUNCATE') THEN
    RAISE EXCEPTION 'An expected application or service privilege was removed';
  END IF;
END;
$check$;
