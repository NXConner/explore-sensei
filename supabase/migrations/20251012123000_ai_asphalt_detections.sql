-- AI Asphalt Detections table and policies (idempotent)
create extension if not exists pgcrypto;

create table if not exists public.ai_asphalt_detections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  job_site_id uuid references public.job_sites(id) on delete set null,
  source text not null check (source in ('upload','map_view')),
  image_width integer,
  image_height integer,
  map_lat double precision,
  map_lng double precision,
  map_zoom integer,
  roi jsonb,
  condition text,
  confidence_score integer check (confidence_score between 0 and 100),
  area_sqft numeric,
  area_sqm numeric,
  estimated_crack_length_ft numeric,
  priority text,
  estimated_repair_cost text,
  ai_notes text,
  analysis jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_ai_det_user_created on public.ai_asphalt_detections (user_id, created_at desc);
create index if not exists idx_ai_det_job_created on public.ai_asphalt_detections (job_site_id, created_at desc);

-- RLS
alter table public.ai_asphalt_detections enable row level security;

-- Policies: users can manage their own records; admins can manage all
create policy if not exists "ai_det_select_own_or_admin" on public.ai_asphalt_detections
  for select to authenticated using (
    user_id = auth.uid() or public.is_admin(auth.uid())
  );

create policy if not exists "ai_det_insert_own_or_admin" on public.ai_asphalt_detections
  for insert to authenticated with check (
    user_id = auth.uid() or public.is_admin(auth.uid())
  );

create policy if not exists "ai_det_update_own_or_admin" on public.ai_asphalt_detections
  for update to authenticated using (
    user_id = auth.uid() or public.is_admin(auth.uid())
  );

create policy if not exists "ai_det_delete_admin_only" on public.ai_asphalt_detections
  for delete to authenticated using (
    public.is_admin(auth.uid())
  );
