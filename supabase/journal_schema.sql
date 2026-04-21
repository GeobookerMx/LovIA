-- ═══════════════════════════════════════════════════════════════
-- LovIA! — Journal Entries Schema
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mood_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_journal_user ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(created_at);

-- ── RLS Policies ────────────────────────────────────────────────
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Journal: own rows only
CREATE POLICY "journal_own" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);
