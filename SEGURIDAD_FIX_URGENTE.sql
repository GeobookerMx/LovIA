-- ═══════════════════════════════════════════════════════════════════════
-- LovIA! — FIXES DE SEGURIDAD URGENTES
-- INSTRUCCIÓN: Copia y pega TODO esto en Supabase → SQL Editor → Run
-- Fecha: Abril 2026
-- ═══════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- FIX #1: is_admin() — Eliminar user_metadata (INSEGURO)
-- El usuario puede modificar su propio user_metadata desde el cliente.
-- Solo app_metadata es inmutable (solo el service_role puede editarlo).
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verifica que funcionó:
-- SELECT is_admin(); -- debe retornar false si no eres admin


-- ─────────────────────────────────────────────────────────────
-- FIX #2: moderation_reports — USING (true) es una brecha CRÍTICA
-- Cualquier usuario autenticado podía ver y editar TODOS los reportes.
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view all reports" ON public.moderation_reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.moderation_reports;

-- Solo los admins (app_metadata.role = 'admin') pueden ver todos los reportes
CREATE POLICY "Admins can view all reports"
ON public.moderation_reports FOR SELECT
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Solo los admins pueden actualizar el estado de los reportes
CREATE POLICY "Admins can update reports"
ON public.moderation_reports FOR UPDATE
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);


-- ─────────────────────────────────────────────────────────────
-- FIX #3: Escalación de privilegios — Proteger app_metadata
-- Ningún usuario debe poder modificar su propio app_metadata via trigger.
-- Este bloque crea una función de helper para asignar roles de admin
-- de forma segura (solo ejecutar manualmente por ti en SQL Editor).
-- ─────────────────────────────────────────────────────────────

-- Función para promover a un usuario como admin (EJECUTAR SOLO TÚ MANUALMENTE):
-- NUNCA expongas esta función al cliente.
CREATE OR REPLACE FUNCTION set_admin_role(target_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Para promoverte a ti mismo como admin, encuentra tu UUID en:
-- Supabase → Authentication → Users → copia tu UUID
-- Luego ejecuta en SQL Editor:
-- SELECT set_admin_role('TU-UUID-AQUI');


-- ─────────────────────────────────────────────────────────────
-- FIX #4: specialists — Owner NO puede editar perfil verificado
-- El check actual (verified = FALSE) es correcto, pero falta proteger
-- que un usuario no pueda cambiar su propio user_id o verified=true.
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Owner update own pending profile" ON specialists;

CREATE POLICY "Owner update own pending profile"
ON specialists FOR UPDATE
USING (
  auth.uid() = user_id
  AND verified = FALSE
  AND status = 'pending'
)
WITH CHECK (
  auth.uid() = user_id
  AND verified = FALSE  -- no se puede auto-verificar
  AND status = 'pending'
);


-- ─────────────────────────────────────────────────────────────
-- FIX #5: Agregar protección en specialists para que nadie
-- pueda insertar con verified=true o status='active' directamente
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Insert own specialist registration" ON specialists;

CREATE POLICY "Insert own specialist registration"
ON specialists FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND verified = FALSE      -- siempre inicia como no verificado
  AND status = 'pending'    -- siempre inicia como pendiente
);


-- ─────────────────────────────────────────────────────────────
-- FIX #6: Rate limiting en check-ins — evitar spam de requests
-- Limitar a máx 1 check-in cada 10 minutos por usuario
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_checkin_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  last_checkin TIMESTAMPTZ;
BEGIN
  SELECT MAX(checked_in_at) INTO last_checkin
  FROM emotional_checkins
  WHERE user_id = NEW.user_id;
  
  IF last_checkin IS NOT NULL AND (NOW() - last_checkin) < INTERVAL '10 minutes' THEN
    RAISE EXCEPTION 'Rate limit: espera 10 minutos entre check-ins';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger solo si la tabla existe:
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'emotional_checkins'
  ) THEN
    DROP TRIGGER IF EXISTS enforce_checkin_rate_limit ON emotional_checkins;
    CREATE TRIGGER enforce_checkin_rate_limit
      BEFORE INSERT ON emotional_checkins
      FOR EACH ROW EXECUTE FUNCTION check_checkin_rate_limit();
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────
-- VERIFICACIÓN FINAL — Ejecuta esto para confirmar que los fixes aplicaron
-- ─────────────────────────────────────────────────────────────
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('moderation_reports', 'specialists')
ORDER BY tablename, policyname;

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ LISTO. Todos los fixes de seguridad aplicados.
-- Próximo paso: Ejecutar MERCADO_PAGO_SETUP.sql para pasarela de pagos.
-- ═══════════════════════════════════════════════════════════════════════
