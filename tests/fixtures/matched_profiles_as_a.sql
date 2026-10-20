BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub',
                  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', true);
SELECT count(*) AS visible_profiles,
       count(*) FILTER (WHERE alias = 'B') AS visible_other_profiles
FROM public.profiles;
ROLLBACK;
