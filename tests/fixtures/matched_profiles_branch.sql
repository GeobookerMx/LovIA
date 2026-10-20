-- Data-free branch fixture. Every identifier and email below is fictitious.
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text,
  alias text
);
CREATE TABLE public.matches (
  id uuid PRIMARY KEY,
  user_a_id uuid NOT NULL REFERENCES public.profiles(id),
  user_b_id uuid NOT NULL REFERENCES public.profiles(id),
  status text NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profiles, public.matches FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.profiles, public.matches TO authenticated;

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users read matched profiles" ON public.profiles FOR SELECT
  TO PUBLIC USING (
    id IN (
      SELECT user_a_id FROM public.matches
      WHERE user_b_id = auth.uid() AND status = 'active'
      UNION
      SELECT user_b_id FROM public.matches
      WHERE user_a_id = auth.uid() AND status = 'active'
    )
  );
CREATE POLICY "Users read own matches" ON public.matches FOR SELECT
  TO authenticated USING (auth.uid() IN (user_a_id, user_b_id));

INSERT INTO public.profiles (id, email, alias) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'a@example.invalid', 'A'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'b@example.invalid', 'B');
INSERT INTO public.matches (id, user_a_id, user_b_id, status) VALUES
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc',
   'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
   'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'active');
