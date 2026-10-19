-- Draft for a NEW, isolated LovIA test project only. Do not run in production.
-- If an analytics_events table already exists, obtain its schema and policies
-- and write a separate upgrade migration; this file deliberately stops.
BEGIN;
DO $$
BEGIN
  IF to_regclass('public.analytics_events') IS NOT NULL THEN
    RAISE EXCEPTION 'analytics_events already exists: inspect and reconcile before changing it';
  END IF;
END
$$;

CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'signup_completed', 'profile_saved', 'doctor_application_submitted',
    'selfie_started', 'selfie_uploaded', 'test_completed',
    'readiness_generated', 'radar_unlocked', 'module_started',
    'module_completed', 'improvement_plan_opened', 'chat_opened',
    'error_submit', 'error_camera', 'error_profile_save'
  )),
  properties jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (properties = '{}'::jsonb),
  timestamp timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.analytics_events FROM PUBLIC, anon, authenticated;
GRANT INSERT (user_id, event_type, properties) ON public.analytics_events TO authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;

CREATE POLICY analytics_insert_self ON public.analytics_events
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY analytics_admin_read ON public.analytics_events
  FOR SELECT TO authenticated USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
COMMIT;
