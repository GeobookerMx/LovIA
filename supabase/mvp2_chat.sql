-- ═══════════════════════════════════════════════════════════════
-- LovIA! — MVP 2.3 Chat Condicionado
-- ═══════════════════════════════════════════════════════════════

-- Crear tabla de mensajes para el chat condicionado
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- Un usuario puede leer los mensajes de un match SOLO si es parte de ese match
CREATE POLICY "Users can read their own match messages"
    ON public.messages
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.matches 
            WHERE id = messages.match_id 
            AND (user_a_id = auth.uid() OR user_b_id = auth.uid())
        )
    );

-- Un usuario puede insertar mensajes SOLO si es parte del match y el match está ACTIVO
CREATE POLICY "Users can send messages to their active matches"
    ON public.messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.matches 
            WHERE id = messages.match_id 
            AND status = 'active'
            AND current_level >= 2 -- Gate del chat (solo nivel 2 o superior)
            AND (user_a_id = auth.uid() OR user_b_id = auth.uid())
        )
    );

-- Un usuario puede actualizar read_at de los mensajes que RECIBE
CREATE POLICY "Users can mark received messages as read"
    ON public.messages
    FOR UPDATE
    TO authenticated
    USING (
        sender_id != auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.matches 
            WHERE id = messages.match_id 
            AND (user_a_id = auth.uid() OR user_b_id = auth.uid())
        )
    )
    WITH CHECK (
        sender_id != auth.uid()
    );

-- Habilitar Supabase Realtime para la tabla messages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
END $$;
