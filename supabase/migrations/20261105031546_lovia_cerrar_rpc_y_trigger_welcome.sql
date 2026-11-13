-- LovIA: contención de dos RPC privilegiadas y del trigger de bienvenida.
-- Requiere prueba con anon, usuario A, usuario B y admin antes de producción.
-- No borra usuarios, respuestas ni archivos.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

DO $guard$
BEGIN
  IF to_regprocedure('public.update_user_streak(uuid)') IS NULL
     OR to_regprocedure('public.has_role(uuid,text)') IS NULL
     OR to_regprocedure('public.trigger_welcome_email()') IS NULL
     OR to_regclass('public.user_streaks') IS NULL
  THEN
    RAISE EXCEPTION 'Esquema LovIA inesperado; revisar antes de aplicar';
  END IF;
END;
$guard$;

-- El trigger existente intentaba enviar por HTTP el registro completo de
-- auth.users a una dirección de ejemplo. El correo de confirmación de Supabase
-- es independiente de este trigger.
DROP TRIGGER IF EXISTS on_auth_user_welcome ON auth.users;
REVOKE ALL ON FUNCTION public.trigger_welcome_email() FROM PUBLIC, anon, authenticated;

-- Mantener la firma usada por SparkPage, pero impedir cambios en la racha
-- de otra persona. La función opera con privilegios elevados por RLS.
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF (SELECT auth.uid()) IS NULL OR p_user_id IS DISTINCT FROM (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'No autorizado para actualizar esta racha' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.user_streaks (user_id, current_streak, last_response_date)
  VALUES (p_user_id, 1, CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak = CASE
      WHEN public.user_streaks.last_response_date = CURRENT_DATE - 1
        THEN public.user_streaks.current_streak + 1
      WHEN public.user_streaks.last_response_date = CURRENT_DATE
        THEN public.user_streaks.current_streak
      ELSE 1
    END,
    last_response_date = CURRENT_DATE;
END;
$function$;

REVOKE ALL ON FUNCTION public.update_user_streak(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_user_streak(uuid) TO authenticated;

-- Las políticas existentes consultan has_role(auth.uid(), 'admin').
-- No necesitan consultar los roles de un ID arbitrario.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT _user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id AND role::text = _role
    );
$function$;

REVOKE ALL ON FUNCTION public.has_role(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid,text) TO authenticated;
