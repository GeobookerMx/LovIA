-- Tabla para guardar el historial del "Termómetro Emocional" / Check-in
create table if not exists public.emotional_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood text not null, -- ('😢', '😕', '😐', '😊', '🤩', etc)
  score integer not null check (score >= 1 and score <= 10),
  context text default 'weekly', -- ('pre_match', 'weekly', etc)
  notes text,
  created_at timestamptz not null default now()
);

-- Seguridad (Row Level Security)
alter table public.emotional_logs enable row level security;

-- Política de lectura: los dueños y administradores pueden ver los registros
create policy "emotional_logs_select"
on public.emotional_logs
for select
to authenticated
using (
  auth.uid() = user_id
  or public.has_role(auth.uid(), 'admin')
);

-- Política de insertado: los usuarios solo pueden insertar registros propios
create policy "emotional_logs_insert"
on public.emotional_logs
for insert
to authenticated
with check (
  auth.uid() = user_id
);

-- Política de borrado: solo el usuario dueño (si decides dar la opción de borrar su historial)
create policy "emotional_logs_delete"
on public.emotional_logs
for delete
to authenticated
using (
  auth.uid() = user_id
);
