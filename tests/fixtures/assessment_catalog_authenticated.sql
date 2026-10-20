BEGIN;
SET LOCAL ROLE authenticated;
SELECT count(*) AS visible_modules FROM public.assessment_modules;
ROLLBACK;
