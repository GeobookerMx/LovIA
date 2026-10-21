SELECT EXISTS (SELECT 1 FROM supabase_migrations.schema_migrations WHERE version='20261021034527') AS migration_recorded,
       has_function_privilege('authenticated','public.lovia_match_cards_v1(uuid)','EXECUTE') AS auth_can_execute,
       has_function_privilege('anon','public.lovia_match_cards_v1(uuid)','EXECUTE') AS anon_can_execute,
       (SELECT prosecdef FROM pg_proc WHERE oid='public.lovia_match_cards_v1(uuid)'::regprocedure) AS security_definer;
