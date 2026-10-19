-- LovIA phase 1: metadata only. Run in the authorized Supabase SQL editor.
-- Do not paste unredacted function bodies, policies with secrets, or user rows into reports.

-- All signatures and effective EXECUTE privileges of the admin helper.
SELECT n.nspname AS schema_name, p.proname AS function_name,
       pg_get_function_identity_arguments(p.oid) AS arguments,
       pg_get_userbyid(p.proowner) AS owner_name,
       p.prosecdef AS security_definer, p.proconfig AS function_settings,
       has_function_privilege('PUBLIC', p.oid, 'EXECUTE') AS public_execute,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute,
       p.proacl AS explicit_acl
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'set_admin_role'
ORDER BY n.nspname, arguments;

-- Table existence, RLS status and actual policies. Review all permissive OR paths.
SELECT n.nspname AS schema_name, c.relname AS table_name,
       c.relrowsecurity, c.relforcerowsecurity
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('profiles','private_profiles','public_profiles','user_roles',
                    'specialists','trusted_contacts','date_plans','sparks',
                    'reports','moderation_reports','matches','blocks','analytics_events')
ORDER BY c.relname;

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles','private_profiles','public_profiles','user_roles',
                    'specialists','trusted_contacts','date_plans','sparks',
                    'reports','moderation_reports','matches','blocks','analytics_events')
ORDER BY tablename, policyname;

-- Column reality, including the historical specialists.user_id / owner_id mismatch.
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('specialists','profiles','private_profiles','public_profiles','analytics_events')
ORDER BY table_name, ordinal_position;

-- Auth/webhook triggers: metadata only, never invoke them on real accounts.
SELECT n.nspname AS table_schema, c.relname AS table_name, t.tgname AS trigger_name,
       t.tgenabled, pn.nspname AS function_schema, p.proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid
JOIN pg_namespace pn ON pn.oid = p.pronamespace
WHERE NOT t.tgisinternal AND (n.nspname IN ('auth','public') OR p.proname ILIKE '%webhook%')
ORDER BY table_schema, table_name, trigger_name;

-- Role and table grants. Privileges must be assessed with policies together.
SELECT table_schema, table_name, grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('profiles','specialists','blocks','matches','analytics_events')
ORDER BY table_name, grantee, privilege_type;

-- Separately inspect cron.job in the console if pg_cron is installed. Its
-- command text may contain a URL or secret: record jobid, schedule, active,
-- and review the command privately without pasting it into a report.
