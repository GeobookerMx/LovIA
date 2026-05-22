-- ══════════════════════════════════════════════════════════════════════
-- LOVIA — Auditoría y Setup Completo de Supabase Storage Buckets
-- Ejecutar en: Supabase → SQL Editor (proyecto nbpidjpkanwynlhdxowx)
-- ══════════════════════════════════════════════════════════════════════

-- ── 1. BUCKET: avatars (fotos de perfil de usuarios) ─────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

-- Políticas para avatars
DROP POLICY IF EXISTS "avatars: public read"     ON storage.objects;
DROP POLICY IF EXISTS "avatars: owner upload"    ON storage.objects;
DROP POLICY IF EXISTS "avatars: owner delete"    ON storage.objects;

CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars: owner upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars: owner delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── 2. BUCKET: books (PDF del libro gratuito del autor) ──────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'books', 'books', true,
  52428800, -- 50 MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Books es solo lectura pública (el admin sube manualmente)
DROP POLICY IF EXISTS "books: public read" ON storage.objects;
CREATE POLICY "books: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'books');

-- ── 3. Verificar todos los buckets creados ────────────────────────────
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- ══════════════════════════════════════════════════════════════════════
-- NOTAS IMPORTANTES:
-- • Selfie de verificación: NO se almacena (privacy by design)
--   Solo se actualiza profiles.verified_selfie = true
-- • Contactos de emergencia: van en columnas de profiles table (no bucket)
-- • Diario emocional: va en tabla journal_entries (no bucket)  
-- • OCEAN / Apego / Valores: van en columnas de profiles table (no bucket)
-- ══════════════════════════════════════════════════════════════════════
