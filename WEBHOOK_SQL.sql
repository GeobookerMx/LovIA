-- ═══════════════════════════════════════════════════════════════════════
-- LovIA! — SQL PARA CREAR LA TABLA DE CORREOS Y LOS WEBHOOKS
-- Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Crear tabla para Correos Programados
CREATE TABLE IF NOT EXISTS public.scheduled_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  send_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS solo para admin (El API de Node.js usa service_role y bypassea RLS)
ALTER TABLE public.scheduled_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin controla correos" 
ON public.scheduled_emails FOR ALL 
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 2. Crear Trigger para llamar al VPS (Contabo) usando pg_net
-- (Asume que tu VPS tiene la IP configurada. O puedes usar un dominio ej: api.lovia.app)

CREATE OR REPLACE FUNCTION trigger_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Llama a la IP o dominio de TU SERVIDOR CONTABO por el puerto 3002
  -- EJEMPLO: Reemplaza 'http://IP_DE_CONTABO:3002' con tu IP real
  PERFORM net.http_post(
    url := 'http://TU_IP_DE_CONTABO:3002/webhooks/on-user-registered',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object('record', row_to_json(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparar siempre que haya un nuevo registro en auth.users
DROP TRIGGER IF EXISTS on_auth_user_welcome ON auth.users;
CREATE TRIGGER on_auth_user_welcome
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION trigger_welcome_email();

-- 3. Crear cron job para que dispare el chequeo de "Correos Programados" cada hora
SELECT cron.schedule(
  'trigger_scheduled_emails',
  '0 * * * *', -- Cada hora
  $$
  SELECT net.http_post(
    url := 'http://TU_IP_DE_CONTABO:3002/cron/send-scheduled',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);
