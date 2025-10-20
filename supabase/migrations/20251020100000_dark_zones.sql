-- Create DarkZones table to store polygon overlays for map
-- Idempotent: use IF NOT EXISTS guards

create table if not exists public."DarkZones" (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Dark Zone',
  active boolean not null default true,
  -- Store simple polygon coordinates as GeoJSON-like array [[lng,lat], ...]
  -- JSONB chosen for flexibility; client validates structure
  coordinates jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

-- Basic RLS: allow read to authenticated users; write to admins
alter table public."DarkZones" enable row level security;

create policy if not exists "dz_read_auth" on public."DarkZones"
  for select to authenticated using (true);

create policy if not exists "dz_insert_admin" on public."DarkZones"
  for insert to authenticated with check (exists (
    select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('Administrator','Super Administrator')
  ));

create policy if not exists "dz_update_admin" on public."DarkZones"
  for update to authenticated using (exists (
    select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('Administrator','Super Administrator')
  ));

create policy if not exists "dz_delete_admin" on public."DarkZones"
  for delete to authenticated using (exists (
    select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('Administrator','Super Administrator')
  ));
