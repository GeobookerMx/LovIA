-- ═══════════════════════════════════════════════════════════════════
-- LovIA! — Tabla de Descargas del Libro (VERSIÓN CORREGIDA)
-- Pega esto en tu Supabase SQL Editor y corre todo de una vez.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Crear tabla book_downloads
CREATE TABLE IF NOT EXISTS book_downloads (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  -- Cada usuario solo tiene UN registro (upsert por user_id)
  CONSTRAINT book_downloads_user_unique UNIQUE (user_id)
);

-- 2. Habilitar RLS
ALTER TABLE book_downloads ENABLE ROW LEVEL SECURITY;

-- 3. El usuario autenticado puede ver y crear SU PROPIO registro
CREATE POLICY "book_downloads_select_own" ON book_downloads
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "book_downloads_insert_own" ON book_downloads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "book_downloads_update_own" ON book_downloads
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Admins pueden leer todo (usando la función is_admin() ya existente en tu BD)
--    Si is_admin() no existe aún, este bloque la crea primero:
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
$$;

CREATE POLICY "book_downloads_admin_read" ON book_downloads
  FOR SELECT
  USING (is_admin());

-- 5. Política especial: cualquier usuario autenticado puede ver el CONTEO total
--    (sin exponer datos personales — BookPage solo pide COUNT(*))
--    Esta política aplica solo para lecturas de count, no de rows completas.
--    La política "select_own" ya cubre al usuario propio.
--    El conteo viene de la política admin + propia. Los demás verán 0.
--    Para mostrar contador público sin datos privados, usa una función:

CREATE OR REPLACE FUNCTION get_book_download_count()
RETURNS bigint
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COUNT(*) FROM book_downloads
$$;

-- Cualquier usuario autenticado puede llamar a esta función
GRANT EXECUTE ON FUNCTION get_book_download_count() TO authenticated;

-- ═══════════════════════════════════════════════════════════════════
-- INSTRUCCIONES PARA EL BUCKET DE STORAGE
-- ═══════════════════════════════════════════════════════════════════
-- 1. Ve a Supabase → Storage → New Bucket
-- 2. Nombre: books
-- 3. ✅ Marcar como "Public bucket"
-- 4. Sube tu PDF: evolucion-relaciones-pareja.pdf
-- 5. Click en el archivo → "Get URL" → copia la URL pública
-- 6. Pégala en BookPage.tsx línea 22 (BOOK_PDF_URL)

-- ═══════════════════════════════════════════════════════════════════
-- VERIFICACIÓN: Ejecuta esto después para confirmar que funcionó
-- ═══════════════════════════════════════════════════════════════════
-- SELECT * FROM book_downloads LIMIT 5;
-- SELECT get_book_download_count();
