-- LovIA production only (project nbpidjpkanwynlhdxowx).
-- Dependencias: user_roles, profiles, private_profiles, moderation_reports.
-- No modifica filas existentes. Conservar el despliegue y una copia del esquema
-- anterior antes de aplicar. Recuperación: restaurar las funciones/políticas
-- anteriores desde el respaldo; no borrar datos de usuario.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

DO $guard$
BEGIN
  IF to_regclass('public.user_roles') IS NULL
     OR to_regclass('public.profiles') IS NULL
     OR to_regclass('public.private_profiles') IS NULL
     OR to_regclass('public.moderation_reports') IS NULL
     OR to_regprocedure('public.is_admin()') IS NULL
  THEN
    RAISE EXCEPTION 'Esquema LovIA inesperado; revisar antes de aplicar';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role::text = 'admin'
  ) THEN
    RAISE EXCEPTION 'No hay roles admin vigentes; revisar antes de cambiar autorización';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'moderation_reports'
      AND policyname = 'Admins can view all reports'
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'moderation_reports'
      AND policyname = 'Admins can update reports'
  ) THEN
    RAISE EXCEPTION 'Las políticas de moderación cambiaron; revisar antes de aplicar';
  END IF;
END;
$guard$;

-- El rol vigente de la tabla protegida es la fuente de verdad. Un JWT antiguo
-- deja de autorizar en cuanto se revoca la fila en user_roles.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles AS r
    WHERE r.user_id = (SELECT auth.uid())
      AND r.role::text = 'admin'
  );
$function$;

DROP POLICY "Admins can view all reports" ON public.moderation_reports;
CREATE POLICY "Admins can view all reports" ON public.moderation_reports
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY "Admins can update reports" ON public.moderation_reports;
CREATE POLICY "Admins can update reports" ON public.moderation_reports
  FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- El resto del acceso administrativo tampoco debe depender de un JWT que
-- pueda seguir vigente tras revocar el rol. Conservar las políticas propias
-- de usuario de crisis_alerts y funnel_events.
DROP POLICY "Admin reads all notifications" ON public.admin_notifications;
CREATE POLICY "Admin reads all notifications" ON public.admin_notifications
  FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY "Admin updates notifications" ON public.admin_notifications;
CREATE POLICY "Admin updates notifications" ON public.admin_notifications
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY "Admin read all crisis alerts" ON public.crisis_alerts;
CREATE POLICY "Admin read all crisis alerts" ON public.crisis_alerts
  FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY "Admin update crisis alerts" ON public.crisis_alerts;
CREATE POLICY "Admin update crisis alerts" ON public.crisis_alerts
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY "Admin reads all funnel events" ON public.funnel_events;
CREATE POLICY "Admin reads all funnel events" ON public.funnel_events
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY "Admin controla correos" ON public.scheduled_emails;
CREATE POLICY "Admin controla correos" ON public.scheduled_emails
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY "Admins delete sparks" ON public.sparks;
CREATE POLICY "Admins delete sparks" ON public.sparks
  FOR DELETE TO authenticated USING (public.is_admin());
DROP POLICY "Admins insert sparks" ON public.sparks;
CREATE POLICY "Admins insert sparks" ON public.sparks
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY "Admins update sparks" ON public.sparks;
CREATE POLICY "Admins update sparks" ON public.sparks
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- La excepción antigua basada en direcciones de correo personales se elimina:
-- sólo una fila de rol vigente en user_roles autoriza trust_flags.
DROP POLICY "trust_flags: admin only" ON public.trust_flags;
CREATE POLICY "trust_flags: admin only" ON public.trust_flags
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- RLS limita la fila, pero no evita que su propietario cambie columnas como
-- status, tier o verificaciones. Esta guarda aplica a INSERT y UPDATE desde
-- los roles de la API; service_role y mantenimiento interno conservan acceso.
CREATE FUNCTION public.lovia_guard_profile_privileges_v1()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  IF current_user NOT IN ('anon', 'authenticated') OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.status IS DISTINCT FROM 'active'
       OR NEW.tier IS DISTINCT FROM 'free'
       OR NEW.trust_level IS DISTINCT FROM 'bronze'
       OR NEW.verified_email IS DISTINCT FROM false
       OR NEW.verified_selfie IS DISTINCT FROM false
       OR NEW.verified_ine IS DISTINCT FROM false
       OR NEW.verified_video IS DISTINCT FROM false
    THEN
      RAISE EXCEPTION 'Campos de estado, derechos y verificación administrados por el servidor'
        USING ERRCODE = '42501';
    END IF;
  ELSIF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.tier IS DISTINCT FROM OLD.tier
     OR NEW.trust_level IS DISTINCT FROM OLD.trust_level
     OR NEW.verified_email IS DISTINCT FROM OLD.verified_email
     OR NEW.verified_selfie IS DISTINCT FROM OLD.verified_selfie
     OR NEW.verified_ine IS DISTINCT FROM OLD.verified_ine
     OR NEW.verified_video IS DISTINCT FROM OLD.verified_video
  THEN
    RAISE EXCEPTION 'Campos de estado, derechos y verificación administrados por el servidor'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER zz_lovia_guard_profile_privileges_v1
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.lovia_guard_profile_privileges_v1();

CREATE FUNCTION public.lovia_guard_private_profile_privileges_v1()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  IF current_user NOT IN ('anon', 'authenticated') OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.account_status IS DISTINCT FROM 'active'
       OR NEW.verified_email IS DISTINCT FROM false
       OR NEW.verified_ine IS DISTINCT FROM false
       OR NEW.verified_selfie IS DISTINCT FROM false
    THEN
      RAISE EXCEPTION 'Campos de sanción y verificación administrados por el servidor'
        USING ERRCODE = '42501';
    END IF;
  ELSIF NEW.account_status IS DISTINCT FROM OLD.account_status
     OR NEW.verified_email IS DISTINCT FROM OLD.verified_email
     OR NEW.verified_ine IS DISTINCT FROM OLD.verified_ine
     OR NEW.verified_selfie IS DISTINCT FROM OLD.verified_selfie
  THEN
    RAISE EXCEPTION 'Campos de sanción y verificación administrados por el servidor'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER zz_lovia_guard_private_profile_privileges_v1
  BEFORE INSERT OR UPDATE ON public.private_profiles
  FOR EACH ROW EXECUTE FUNCTION public.lovia_guard_private_profile_privileges_v1();
