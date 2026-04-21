-- ═══════════════════════════════════════════════════════════════
-- FIX 3: Add missing INSERT policies
-- Run this in Supabase SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════

-- Allow authenticated users to INSERT their own subscription
DROP POLICY IF EXISTS "Users insert own subscription" ON subscriptions;
CREATE POLICY "Users insert own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Ensure profiles INSERT policy exists
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
