-- ══════════════════════════════════════════════════════════════════════
-- LOVIA — Mi Diario Emocional (journal_entries table)
-- Ejecutar en Supabase → SQL Editor
-- ══════════════════════════════════════════════════════════════════════

-- 1. Crear tabla journal_entries
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content     text NOT NULL,
    mood_tags   text[] DEFAULT '{}',
    created_at  timestamptz DEFAULT now()
);

-- 2. Habilitar RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS (usuario solo accede a SUS entradas)
CREATE POLICY "journal: select own"
    ON public.journal_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "journal: insert own"
    ON public.journal_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "journal: update own"
    ON public.journal_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "journal: delete own"
    ON public.journal_entries FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Índice para queries por usuario + fecha
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date
    ON public.journal_entries (user_id, created_at DESC);

-- ══════════════════════════════════════════════════════════════════════
-- Verificar que se creó correctamente
-- ══════════════════════════════════════════════════════════════════════
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'journal_entries';
