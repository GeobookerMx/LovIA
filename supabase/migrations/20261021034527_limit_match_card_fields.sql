-- A match may reveal a small card, never an entire profiles row. The previous
-- matched-profile SELECT policy was removed because it exposed email, precise
-- coordinates and emergency contacts. This function restores only card data.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

CREATE OR REPLACE FUNCTION public.lovia_match_cards_v1(p_match_id uuid DEFAULT NULL)
RETURNS TABLE (
  match_id uuid,
  target_user_id uuid,
  alias text,
  age integer,
  city text,
  avatar_url text,
  visibility_mode text,
  current_level integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT m.id,
         other_profile.id,
         COALESCE(NULLIF(other_profile.alias, ''), 'Persona de LovIA'),
         other_profile.age,
         NULLIF(other_profile.city, ''),
         CASE
           WHEN m.current_level >= 3 OR other_profile.visibility_mode = 'classic'
             THEN other_profile.avatar_url
           ELSE NULL
         END,
         COALESCE(other_profile.visibility_mode, 'gradual'),
         m.current_level
  FROM public.matches AS m
  JOIN public.profiles AS own_profile ON own_profile.id = (SELECT auth.uid())
  JOIN public.profiles AS other_profile
    ON other_profile.id = CASE
      WHEN m.user_a_id = (SELECT auth.uid()) THEN m.user_b_id
      ELSE m.user_a_id
    END
  WHERE (SELECT auth.uid()) IS NOT NULL
    AND (m.user_a_id = (SELECT auth.uid()) OR m.user_b_id = (SELECT auth.uid()))
    AND (p_match_id IS NULL OR m.id = p_match_id)
    AND m.status = 'active'
    AND own_profile.status = 'active'
    AND other_profile.status = 'active'
    AND own_profile.age >= 18
    AND other_profile.age >= 18
    AND own_profile.onboarding_completed IS TRUE
    AND other_profile.onboarding_completed IS TRUE
    AND NOT EXISTS (
      SELECT 1 FROM public.blocks AS b
      WHERE (b.blocker_id = own_profile.id AND b.blocked_id = other_profile.id)
         OR (b.blocker_id = other_profile.id AND b.blocked_id = own_profile.id)
    )
  ORDER BY m.created_at DESC
  LIMIT 200;
$function$;

REVOKE ALL ON FUNCTION public.lovia_match_cards_v1(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lovia_match_cards_v1(uuid) TO authenticated;
