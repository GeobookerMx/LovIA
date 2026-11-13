-- PROPUESTA NO DESPLEGADA. No ejecutar durante la publicación inicial.
-- La revisión automática rechazó activarla con 0 aceptaciones y PWA antigua.
-- Antes: publicar el cliente nuevo, comprobar adopción/consentimientos y decidir
-- una transición para versiones antiguas. Requiere revisión de impacto y aprobación.
DO $$
DECLARE v_table text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY['finance_answers','evaluations','journal_entries',
    'assessments_raw','assessment_answers','emotional_logs'] LOOP
    EXECUTE format('CREATE POLICY "Consentimiento: nuevas respuestas" ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK ((SELECT public.has_sensitive_data_consent()))', v_table);
    EXECUTE format('CREATE POLICY "Consentimiento: actualizar respuestas" ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING ((SELECT public.has_sensitive_data_consent())) WITH CHECK ((SELECT public.has_sensitive_data_consent()))', v_table);
  END LOOP;
END;
$$;
