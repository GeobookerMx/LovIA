-- LovIA production only: nbpidjpkanwynlhdxowx.
-- Tabla histórica de respaldo: conserva todas sus filas y acceso de mantenimiento.
-- Estado verificado 2026-10-28: RLS desactivada; anon y authenticated tienen ALL.
-- Recuperación: sólo un administrador de base puede restaurar grants/policies
-- tras una revisión de la finalidad del respaldo. No borrar este respaldo.
DO $guard$
BEGIN
  IF to_regclass('public.backup_onboarding_20261020') IS NULL THEN
    RAISE EXCEPTION 'No existe el respaldo esperado en LovIA';
  END IF;
END;
$guard$;

ALTER TABLE public.backup_onboarding_20261020 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.backup_onboarding_20261020 FROM PUBLIC, anon, authenticated;
