create type public.app_role as enum ('user', 'admin', 'editor', 'specialist');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.specialists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  specialty text,
  city text,
  country text default 'México',
  verified boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Si las tablas ya existían de un intento anterior, forzamos la corrección de estructura:
DO $$ 
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_schema='public' AND table_name='specialists' AND column_name='user_id') THEN
      ALTER TABLE public.specialists RENAME COLUMN user_id TO owner_id;
  END IF;
END $$;

alter table public.specialists add column if not exists is_active boolean not null default true;
alter table public.specialists add column if not exists verified boolean not null default false;
alter table public.profiles add column if not exists onboarding_completed boolean not null default false;
alter table public.profiles add column if not exists avatar_url text;


alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.specialists enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

-- PROFILES
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or public.has_role(auth.uid(), 'admin')
);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (
  auth.uid() = id
  or public.has_role(auth.uid(), 'admin')
)
with check (
  auth.uid() = id
  or public.has_role(auth.uid(), 'admin')
);

-- USER ROLES
create policy "roles_select_own_or_admin"
on public.user_roles
for select
to authenticated
using (
  auth.uid() = user_id
  or public.has_role(auth.uid(), 'admin')
);

-- SPECIALISTS
create policy "specialists_public_read_active"
on public.specialists
for select
to authenticated
using (is_active = true);

create policy "specialists_insert_owner"
on public.specialists
for insert
to authenticated
with check (
  auth.uid() = owner_id
  or public.has_role(auth.uid(), 'admin')
);

create policy "specialists_update_owner_or_admin"
on public.specialists
for update
to authenticated
using (
  auth.uid() = owner_id
  or public.has_role(auth.uid(), 'admin')
)
with check (
  auth.uid() = owner_id
  or public.has_role(auth.uid(), 'admin')
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
