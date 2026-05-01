-- ═══════════════════════════════════════════════════════════════════════
-- LovIA! — RLS FIX: trusted_contacts, date_plans, sparks
-- INSTRUCCIÓN: Copia y pega TODO en Supabase → SQL Editor → Run
-- Fecha: Abril 2026
-- Advisor: 3 issues CRITICAL — RLS Disabled in Public
-- ═══════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────
-- TABLA 1: trusted_contacts
-- Propósito: Contactos de emergencia privados del usuario (SOS en citas)
-- Regla: solo el dueño puede ver, crear, editar y borrar sus contactos
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas anteriores si las hubiera
DROP POLICY IF EXISTS "Owner select trusted_contacts"   ON public.trusted_contacts;
DROP POLICY IF EXISTS "Owner insert trusted_contacts"   ON public.trusted_contacts;
DROP POLICY IF EXISTS "Owner update trusted_contacts"   ON public.trusted_contacts;
DROP POLICY IF EXISTS "Owner delete trusted_contacts"   ON public.trusted_contacts;

-- SELECT: solo ves tus propios contactos
CREATE POLICY "Owner select trusted_contacts"
ON public.trusted_contacts FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: solo puedes insertar contactos a tu propio user_id
CREATE POLICY "Owner insert trusted_contacts"
ON public.trusted_contacts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: solo puedes editar tus propios contactos
CREATE POLICY "Owner update trusted_contacts"
ON public.trusted_contacts FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: solo puedes eliminar tus propios contactos
CREATE POLICY "Owner delete trusted_contacts"
ON public.trusted_contacts FOR DELETE
USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────
-- TABLA 2: date_plans
-- Propósito: Planes de encuentro entre dos personas en un match
-- Regla: solo los dos participantes del match pueden ver/editar el plan
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.date_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Match participants select date_plans"  ON public.date_plans;
DROP POLICY IF EXISTS "Match participants insert date_plans"  ON public.date_plans;
DROP POLICY IF EXISTS "Match participants update date_plans"  ON public.date_plans;
DROP POLICY IF EXISTS "Match participants delete date_plans"  ON public.date_plans;

-- SELECT: solo si eres user_a o user_b del match asociado
CREATE POLICY "Match participants select date_plans"
ON public.date_plans FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.id = date_plans.match_id
      AND (m.user_a_id = auth.uid() OR m.user_b_id = auth.uid())
  )
);

-- INSERT: solo puedes crear planes para matches donde participas
CREATE POLICY "Match participants insert date_plans"
ON public.date_plans FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.id = date_plans.match_id
      AND (m.user_a_id = auth.uid() OR m.user_b_id = auth.uid())
  )
);

-- UPDATE: solo si participas en el match del plan
CREATE POLICY "Match participants update date_plans"
ON public.date_plans FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.id = date_plans.match_id
      AND (m.user_a_id = auth.uid() OR m.user_b_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.id = date_plans.match_id
      AND (m.user_a_id = auth.uid() OR m.user_b_id = auth.uid())
  )
);

-- DELETE: solo si participas en el match del plan
CREATE POLICY "Match participants delete date_plans"
ON public.date_plans FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.id = date_plans.match_id
      AND (m.user_a_id = auth.uid() OR m.user_b_id = auth.uid())
  )
);


-- ─────────────────────────────────────────────────────────────────────
-- TABLA 3: sparks
-- Propósito: Chispa del día — contenido editorial, igual para todos
-- Regla:
--   - SELECT: todos los autenticados pueden leer (es contenido público)
--   - INSERT/UPDATE/DELETE: solo admins (app_metadata.role = 'admin')
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.sparks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users read sparks"   ON public.sparks;
DROP POLICY IF EXISTS "Admins manage sparks"              ON public.sparks;
DROP POLICY IF EXISTS "Admins insert sparks"              ON public.sparks;
DROP POLICY IF EXISTS "Admins update sparks"              ON public.sparks;
DROP POLICY IF EXISTS "Admins delete sparks"              ON public.sparks;

-- SELECT: cualquier usuario autenticado puede ver las sparks del día
CREATE POLICY "Authenticated users read sparks"
ON public.sparks FOR SELECT
USING (auth.role() = 'authenticated');

-- INSERT: solo admins pueden crear sparks (vía panel admin)
CREATE POLICY "Admins insert sparks"
ON public.sparks FOR INSERT
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- UPDATE: solo admins pueden editar sparks
CREATE POLICY "Admins update sparks"
ON public.sparks FOR UPDATE
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- DELETE: solo admins pueden eliminar sparks
CREATE POLICY "Admins delete sparks"
ON public.sparks FOR DELETE
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);


-- ═══════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN — Ejecuta esto para confirmar que los fixes aplicaron
-- ═══════════════════════════════════════════════════════════════════════
SELECT
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('trusted_contacts', 'date_plans', 'sparks')
ORDER BY tablename, cmd;

-- También puedes verificar que RLS quedó activo:
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('trusted_contacts', 'date_plans', 'sparks');
-- rowsecurity debe ser TRUE en las 3 tablas

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ LISTO. Los 3 warnings críticos de Advisor deben desaparecer.
-- ═══════════════════════════════════════════════════════════════════════
