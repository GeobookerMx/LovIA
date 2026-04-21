-- ═══════════════════════════════════════════════════════════════
-- FIX 2: Remove trigger completely so signup works
-- The app will handle profile creation instead
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Remove ALL triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Make sure profiles table allows inserts from authenticated users
-- (the app will create the profile after signup)
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
