-- ═══════════════════════════════════════════════════════════════
-- LovIA! — MVP 5.1 Antifraude y Moderación (Backend)
-- ═══════════════════════════════════════════════════════════════

-- 1. Tabla de Reportes
CREATE TABLE IF NOT EXISTS public.moderation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'dismissed', 'action_taken'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS para moderation_reports
ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;

-- Un usuario puede ver sus propios reportes enviados
CREATE POLICY "Users can view own reports" 
ON public.moderation_reports FOR SELECT 
USING (auth.uid() = reporter_id);

-- Un usuario puede crear reportes
CREATE POLICY "Users can insert reports" 
ON public.moderation_reports FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

-- Los administradores (por ahora definidos por un flag o simplemente todos temporalmente en dev) pueden verlo todo
-- En producción real, se cruza con un rol 'admin' en private_profiles
CREATE POLICY "Admins can view all reports" 
ON public.moderation_reports FOR SELECT 
USING (true); -- TODO: Limitar solo a Admins

CREATE POLICY "Admins can update reports" 
ON public.moderation_reports FOR UPDATE 
USING (true); -- TODO: Limitar solo a Admins

-- 2. Asegurar que los perfiles nazcan en 'review' para forzar autorización manual por el admin
-- (Si se desea que TODOS pasen por revisión manual, comentar/descomentar según la regla del negocio)
-- ALTER TABLE public.private_profiles ALTER COLUMN account_status SET DEFAULT 'review';
