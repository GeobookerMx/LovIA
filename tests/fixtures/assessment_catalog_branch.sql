-- Test fixture for an empty, data-free Supabase branch only.
-- It reproduces the two catalog tables' pre-migration permissions.
CREATE TABLE public.assessment_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL
);
CREATE TABLE public.assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.assessment_modules(id),
  text text NOT NULL
);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.assessment_modules, public.assessment_questions
  FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.assessment_modules, public.assessment_questions
  TO anon, authenticated;

INSERT INTO public.assessment_modules (id, name)
VALUES ('11111111-1111-4111-8111-111111111111', 'Módulo ficticio');
INSERT INTO public.assessment_questions (id, module_id, text)
VALUES (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  'Pregunta ficticia'
);
