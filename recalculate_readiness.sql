-- =========================================================================
-- TRIGGER DE POSTGRESQL PARA EL AUTO-CÁLCULO DE READINESS SCORE EN PROFILES
-- =========================================================================
-- Este trigger automatiza el cálculo de profiles.readiness_score en Supabase,
-- asegurando que cuando el usuario termine onboarding o juegue los tests
-- cognitivos, el Radar se desbloquee automáticamente (sin depender del cliente).
-- =========================================================================

CREATE OR REPLACE FUNCTION public.calculate_readiness_score()
RETURNS TRIGGER AS $$
DECLARE
  v_eval_count INTEGER := 0;
  v_psych_score INTEGER := 0;
  v_cog_score INTEGER := 0;
  v_streak_score INTEGER := 0;
  v_profile_score INTEGER := 0;
  v_modules_score INTEGER := 0;
  v_axes_done INTEGER := 0;
  v_profile_pct INTEGER := 0;
  v_assessments_done TEXT[] := '{}';
  v_spark_streak INTEGER := 0;
BEGIN
  -- 1. Obtener valores seguros
  v_profile_pct := COALESCE(NEW.profile_pct, 0);
  v_assessments_done := COALESCE(NEW.assessments_done, '{}');
  v_spark_streak := COALESCE(NEW.spark_streak, 0);

  -- 2. Completitud del perfil (Aporta hasta 25 pts)
  v_profile_score := COALESCE(ROUND((v_profile_pct / 100.0) * 25), 0);

  -- 3. Cuestionarios Psicológicos (Aporta hasta 30 pts — 10 por cada test)
  IF 'attachment' = ANY(v_assessments_done) THEN
    v_psych_score := v_psych_score + 10;
  END IF;
  IF 'bigfive' = ANY(v_assessments_done) THEN
    v_psych_score := v_psych_score + 10;
  END IF;
  IF 'values' = ANY(v_assessments_done) THEN
    v_psych_score := v_psych_score + 10;
  END IF;

  -- 4. Evaluaciones Cognitivas desde la tabla public.evaluations (Aporta hasta 20 pts)
  -- Buscamos cuántas evaluaciones cognitivas tiene aprobadas (passed = true)
  SELECT COUNT(DISTINCT test_type) INTO v_eval_count
  FROM public.evaluations
  WHERE user_id = NEW.id 
    AND test_type IN ('stroop', 'digit_span', 'frustration_tolerance', 'emotional_regulation') 
    AND passed = true;
  
  v_cog_score := COALESCE(ROUND((v_eval_count / 4.0) * 20), 0);

  -- 5. Racha de Chispas del Día (Aporta hasta 15 pts — 3 pts por día, máx 5 días)
  v_streak_score := LEAST(v_spark_streak * 3, 15);

  -- 6. Módulos de Introspección (Aporta hasta 10 pts — 2.5 por eje)
  IF 'amor' = ANY(v_assessments_done) THEN
    v_axes_done := v_axes_done + 1;
  END IF;
  IF 'intimidad' = ANY(v_assessments_done) THEN
    v_axes_done := v_axes_done + 1;
  END IF;
  IF 'realizacion' = ANY(v_assessments_done) THEN
    v_axes_done := v_axes_done + 1;
  END IF;
  IF 'seguridad' = ANY(v_assessments_done) THEN
    v_axes_done := v_axes_done + 1;
  END IF;
  
  v_modules_score := COALESCE(ROUND((v_axes_done / 4.0) * 10), 0);

  -- Suma final con tope de 100
  NEW.readiness_score := LEAST(v_profile_score + v_psych_score + v_cog_score + v_streak_score + v_modules_score, 100);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sobre la tabla profiles
DROP TRIGGER IF EXISTS trigger_recalculate_readiness ON public.profiles;
CREATE TRIGGER trigger_recalculate_readiness
BEFORE INSERT OR UPDATE OF assessments_done, profile_pct, spark_streak ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.calculate_readiness_score();


-- Trigger secundario para evaluations: cuando se completa un juego cognitivo,
-- actualiza profiles.updated_at para gatillar el recalculador de arriba.
CREATE OR REPLACE FUNCTION public.trigger_evaluations_recalc()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET updated_at = NOW()
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_eval_recalculate_profile_readiness ON public.evaluations;
CREATE TRIGGER trigger_eval_recalculate_profile_readiness
AFTER INSERT OR UPDATE OR DELETE ON public.evaluations
FOR EACH ROW
EXECUTE FUNCTION public.trigger_evaluations_recalc();

-- Actualización masiva de perfiles existentes para aplicar cálculos actuales
UPDATE public.profiles SET updated_at = NOW();
