-- Branch-only fictitious users A, B, C and an underage D. No real data.
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY, alias text, age integer, city text, avatar_url text,
  visibility_mode text, status text, onboarding_completed boolean
);
CREATE TABLE public.matches (
  id uuid PRIMARY KEY, user_a_id uuid, user_b_id uuid,
  status text, current_level integer, created_at timestamptz DEFAULT now()
);
CREATE TABLE public.blocks (blocker_id uuid, blocked_id uuid);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profiles, public.matches, public.blocks FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.profiles, public.matches TO authenticated;
CREATE POLICY own_profile ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY own_match ON public.matches FOR SELECT TO authenticated
  USING (auth.uid() IN (user_a_id, user_b_id));

INSERT INTO public.profiles VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','A',30,'CDMX','a.jpg','classic','active',true),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','B',31,'Puebla','b.jpg','gradual','active',true),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','C',25,'Toluca','c.jpg','classic','active',true),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','D',17,'Morelia','d.jpg','classic','active',true);
INSERT INTO public.matches (id,user_a_id,user_b_id,status,current_level) VALUES
  ('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','active',2),
  ('22222222-2222-4222-8222-222222222222','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','cccccccc-cccc-4ccc-8ccc-cccccccccccc','active',3),
  ('33333333-3333-4333-8333-333333333333','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','dddddddd-dddd-4ddd-8ddd-dddddddddddd','active',3);
