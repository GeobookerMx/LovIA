-- LovIA: contención de permisos del módulo financiero.
-- Verificado en producción el 30-10-2026: 0 respuestas y 0 enlaces compartidos.
-- El historial remoto aún no registra las migraciones financieras previas, aunque
-- sus objetos existen. Esta migración queda después de ellas para que una futura
-- conciliación no vuelva a abrir el acceso.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- La política anterior daba al rol Admin lectura de respuestas completas.
DROP POLICY IF EXISTS "Finanzas: admin lee conteos" ON public.finance_answers;

-- La vista es security-definer (propietario postgres), por lo que su GRANT SELECT
-- a authenticated permitía ver conteos por usuario sin comprobar is_admin().
REVOKE ALL ON public.finance_answers_admin_summary FROM PUBLIC, anon, authenticated;

-- Compartir queda cerrado hasta verificar relación elegible, bloqueos, permiso
-- mutuo y revocación en el servidor. No borra ninguna fila ni tabla.
DROP POLICY IF EXISTS "Finanzas: leer respuestas compartidas de pareja" ON public.finance_answers;
REVOKE ALL ON public.finance_share_links FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.finance_accept_invite(text) FROM PUBLIC, anon, authenticated;

-- Guardado nuevo desactivado hasta probar RLS con A, B, anónimo y Admin.
UPDATE public.lovia_feature_flags
SET enabled = false, updated_at = now()
WHERE key = 'finance_private_save';
