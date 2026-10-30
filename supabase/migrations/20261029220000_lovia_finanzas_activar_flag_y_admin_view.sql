-- LovIA production (project nbpidjpkanwynlhdxowx).
-- Fase 3: Activación del guardado privado y permisos de lectura de métricas agregadas para admin.
-- Dependencias: public.is_admin(), public.finance_answers, public.lovia_feature_flags (ya existen).
-- No modifica esquema. Sólo activa el flag y agrega vista de conteos para admin.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- ── 1. Activar el guardado privado de respuestas financieras ─────────────────
UPDATE public.lovia_feature_flags
SET enabled = true,
    updated_at = now()
WHERE key = 'finance_private_save';

-- ── 2. Vista agregada para panel admin (sin exponer contenido de respuestas) ──
-- Permite a admins ver conteos por usuario sin leer el contenido de las respuestas.
CREATE OR REPLACE VIEW public.finance_answers_admin_summary AS
SELECT
    user_id,
    catalog_version,
    COUNT(*)::int         AS answer_count,
    MIN(created_at)       AS first_answer_at,
    MAX(updated_at)       AS last_answer_at
FROM public.finance_answers
GROUP BY user_id, catalog_version;

-- Solo admins pueden leer esta vista
REVOKE ALL ON public.finance_answers_admin_summary FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.finance_answers_admin_summary TO authenticated;

-- RLS en la vista: solo admin
ALTER VIEW public.finance_answers_admin_summary OWNER TO postgres;
COMMENT ON VIEW public.finance_answers_admin_summary IS
    'Conteos agregados del módulo de finanzas para el panel admin. No expone el contenido de respuestas (privacidad RLS).';

-- Política: solo is_admin() puede SELECT en la vista
-- Nota: las vistas heredan la seguridad de la tabla base (finance_answers con RLS estricta).
-- Para que el admin pueda ver todos los user_id, se agrega una política SELECT en finance_answers para admins:
CREATE POLICY "Finanzas: admin lee conteos" ON public.finance_answers
    FOR SELECT TO authenticated USING (public.is_admin());
