-- ═══════════════════════════════════════════════════════════════
-- LovIA! — MVP 3.2 Geobooker Safe Venues
-- ═══════════════════════════════════════════════════════════════

-- Función RPC para sugerir un punto de encuentro seguro (Punto Medio)
-- Se ejecuta con SECURITY DEFINER para poder leer `private_profiles`
-- sin exponer las coordenadas exactas de la otra persona al cliente.

CREATE OR REPLACE FUNCTION suggest_safe_venue(p_match_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_lat_a FLOAT;
    v_lng_a FLOAT;
    v_lat_b FLOAT;
    v_lng_b FLOAT;
    v_mid_lat FLOAT;
    v_mid_lng FLOAT;
    v_user_a UUID;
    v_user_b UUID;
    v_venue_type TEXT;
BEGIN
    -- Verify match exists, is active, and current user is part of it
    SELECT user_a_id, user_b_id INTO v_user_a, v_user_b 
    FROM public.matches 
    WHERE id = p_match_id AND (user_a_id = auth.uid() OR user_b_id = auth.uid()) AND status = 'active';

    IF v_user_a IS NULL THEN
        RAISE EXCEPTION 'Not authorized or match not found/active';
    END IF;

    -- Obtener ubicaciones privadas saltando temporalmente RLS (por SECURITY DEFINER)
    SELECT lat, lng INTO v_lat_a, v_lng_a FROM public.private_profiles WHERE id = v_user_a;
    SELECT lat, lng INTO v_lat_b, v_lng_b FROM public.private_profiles WHERE id = v_user_b;

    -- Calcular el punto medio geográfico aproximado
    IF v_lat_a IS NOT NULL AND v_lat_b IS NOT NULL AND v_lng_a IS NOT NULL AND v_lng_b IS NOT NULL THEN
        v_mid_lat := (v_lat_a + v_lat_b) / 2.0;
        v_mid_lng := (v_lng_a + v_lng_b) / 2.0;
    ELSE
        -- Default (Centro de la ciudad o nulo si no hay datos)
        v_mid_lat := 19.4326; -- CDMX Centro
        v_mid_lng := -99.1332;
    END IF;

    -- Mock de integración con negocios verificados de Geobooker
    v_venue_type := 'Cafetería de Especialidad (Red Geobooker Segura)';

    RETURN jsonb_build_object(
        'place_type', v_venue_type,
        'lat', v_mid_lat,
        'lng', v_mid_lng,
        'why', 'Punto medio geográfico exacto entre ambos. Entorno certificado como público, iluminado y seguro por Geobooker.',
        'safety_rating', 5,
        'suggested_duration', '60-90 minutos'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
