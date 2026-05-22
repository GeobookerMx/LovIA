-- ══════════════════════════════════════════════════════════════════════
-- LOVIA — Schema para nuevos frameworks psicológicos
-- Ejecutar en: Supabase → SQL Editor
-- ══════════════════════════════════════════════════════════════════════

-- 1. Columnas nuevas en profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS attachment_style   text CHECK (attachment_style IN ('secure','anxious','avoidant','disorganized')),
  ADD COLUMN IF NOT EXISTS ocean_scores       jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS core_values        text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS assessments_done   text[] DEFAULT '{}';

-- 2. Tabla journal_entries (Diario Emocional)
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content     text NOT NULL,
    mood_tags   text[] DEFAULT '{}',
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "journal: select own" ON public.journal_entries;
DROP POLICY IF EXISTS "journal: insert own" ON public.journal_entries;
CREATE POLICY "journal: select own" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "journal: insert own" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journal: delete own" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_journal_user ON public.journal_entries(user_id, created_at DESC);

-- 3. Verificar
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('attachment_style','ocean_scores','core_values','assessments_done');
