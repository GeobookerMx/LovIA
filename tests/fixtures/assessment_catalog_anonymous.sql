BEGIN;
SET LOCAL ROLE anon;
SELECT count(*) AS visible_modules FROM public.assessment_modules;
ROLLBACK;
