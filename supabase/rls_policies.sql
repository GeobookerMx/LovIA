-- ═══════════════════════════════════════════════════════════════
-- LovIA! — Row Level Security (RLS) Policies
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── Helper function: Check if user is admin ──
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can read basic info of matched users (for match cards)
CREATE POLICY "Users read matched profiles"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT user_a_id FROM matches WHERE user_b_id = auth.uid() AND status = 'active'
      UNION
      SELECT user_b_id FROM matches WHERE user_a_id = auth.uid() AND status = 'active'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profile auto-created by trigger (SECURITY DEFINER), no INSERT policy needed for users

-- Admin can read all profiles
CREATE POLICY "Admin reads all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- Admin can update any profile
CREATE POLICY "Admin updates any profile"
  ON profiles FOR UPDATE
  USING (is_admin());

-- ═══════════════════════════════════════════════════════════════
-- EVALUATIONS
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Users can read their own evaluations
CREATE POLICY "Users read own evaluations"
  ON evaluations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own evaluations
CREATE POLICY "Users insert own evaluations"
  ON evaluations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own evaluations (retake tests)
CREATE POLICY "Users update own evaluations"
  ON evaluations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin reads all
CREATE POLICY "Admin reads all evaluations"
  ON evaluations FOR SELECT
  USING (is_admin());

-- ═══════════════════════════════════════════════════════════════
-- MATCHES
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Users can read their own matches
CREATE POLICY "Users read own matches"
  ON matches FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Users can update their own matches (accept/decline)
CREATE POLICY "Users update own matches"
  ON matches FOR UPDATE
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Match creation is server-side only (Edge Function or admin)
-- No INSERT policy for regular users

-- Admin reads all
CREATE POLICY "Admin manages all matches"
  ON matches FOR ALL
  USING (is_admin());

-- ═══════════════════════════════════════════════════════════════
-- SUBSCRIPTIONS
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "Users read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- No user INSERT/UPDATE — managed by Stripe webhooks (server-side)

-- Admin reads all
CREATE POLICY "Admin manages all subscriptions"
  ON subscriptions FOR ALL
  USING (is_admin());

-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION_STEPS
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE verification_steps ENABLE ROW LEVEL SECURITY;

-- Users can read their own verification steps
CREATE POLICY "Users read own verifications"
  ON verification_steps FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own verification requests
CREATE POLICY "Users insert own verifications"
  ON verification_steps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin manages all (approve/reject)
CREATE POLICY "Admin manages all verifications"
  ON verification_steps FOR ALL
  USING (is_admin());

-- ═══════════════════════════════════════════════════════════════
-- REPORTS
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Users can read their own reports
CREATE POLICY "Users read own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "Users create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Admin manages all
CREATE POLICY "Admin manages all reports"
  ON reports FOR ALL
  USING (is_admin());

-- ═══════════════════════════════════════════════════════════════
-- ENCOUNTER_REVIEWS
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE encounter_reviews ENABLE ROW LEVEL SECURITY;

-- Users can read reviews for their matches
CREATE POLICY "Users read own encounter reviews"
  ON encounter_reviews FOR SELECT
  USING (auth.uid() = reviewer_id);

-- Users can create reviews
CREATE POLICY "Users create encounter reviews"
  ON encounter_reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Admin reads all
CREATE POLICY "Admin reads all reviews"
  ON encounter_reviews FOR ALL
  USING (is_admin());

-- ═══════════════════════════════════════════════════════════════
-- AUDIT_LOG
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admin can read audit logs
CREATE POLICY "Admin reads audit log"
  ON audit_log FOR SELECT
  USING (is_admin());

-- Server-side INSERT only (SECURITY DEFINER functions)
-- No user INSERT policy
