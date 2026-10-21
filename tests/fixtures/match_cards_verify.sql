DO $check$
BEGIN
  IF has_function_privilege('anon', 'public.lovia_match_cards_v1(uuid)', 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'public.lovia_match_cards_v1(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'RPC execution grants are wrong';
  END IF;
END;
$check$;

BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', true);
DO $check$
BEGIN
  IF (SELECT count(*) FROM public.lovia_match_cards_v1()) <> 2
     OR (SELECT avatar_url FROM public.lovia_match_cards_v1('11111111-1111-4111-8111-111111111111')) IS NOT NULL
     OR (SELECT avatar_url FROM public.lovia_match_cards_v1('22222222-2222-4222-8222-222222222222')) <> 'c.jpg'
     OR EXISTS (SELECT 1 FROM public.lovia_match_cards_v1('33333333-3333-4333-8333-333333333333')) THEN
    RAISE EXCEPTION 'Participant, age or visibility rule failed';
  END IF;
END;
$check$;
ROLLBACK;

BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', true);
DO $check$
BEGIN
  IF EXISTS (SELECT 1 FROM public.lovia_match_cards_v1()) THEN
    RAISE EXCEPTION 'A non-participant saw a match card';
  END IF;
END;
$check$;
ROLLBACK;

INSERT INTO public.blocks VALUES ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', true);
DO $check$
BEGIN
  IF (SELECT count(*) FROM public.lovia_match_cards_v1()) <> 1 THEN
    RAISE EXCEPTION 'Blocked user remained visible';
  END IF;
END;
$check$;
ROLLBACK;
