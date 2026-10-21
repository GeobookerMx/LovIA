-- RLS does not govern TRUNCATE, TRIGGER or REFERENCES. None of these operations
-- belongs to a browser/mobile API role. Preserve service_role and the table
-- owners' permissions for server-side maintenance.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

DO $migration$
DECLARE
  target record;
BEGIN
  FOR target IN
    SELECT n.nspname AS schema_name, c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
  LOOP
    EXECUTE format(
      'REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLE %I.%I FROM anon, authenticated',
      target.schema_name, target.table_name
    );
  END LOOP;

  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
      AND (
        has_table_privilege('anon', c.oid, 'TRUNCATE')
        OR has_table_privilege('authenticated', c.oid, 'TRUNCATE')
        OR has_table_privilege('anon', c.oid, 'TRIGGER')
        OR has_table_privilege('authenticated', c.oid, 'TRIGGER')
        OR has_table_privilege('anon', c.oid, 'REFERENCES')
        OR has_table_privilege('authenticated', c.oid, 'REFERENCES')
      )
  ) THEN
    RAISE EXCEPTION 'Client roles retain a table administration privilege';
  END IF;

  IF NOT has_table_privilege('service_role', 'public.profiles', 'TRUNCATE') THEN
    RAISE EXCEPTION 'Server maintenance privilege changed unexpectedly';
  END IF;
END;
$migration$;
