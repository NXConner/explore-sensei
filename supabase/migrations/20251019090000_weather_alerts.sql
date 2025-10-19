-- Weather alerts storage with RLS (idempotent)

create extension if not exists "pgcrypto";

-- Table
create table if not exists public.weather_alerts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('storm','rain','wind','tornado','severe','warning','watch','advisory')),
  severity text not null check (severity in ('low','medium','high','critical','extreme')),
  title text,
  message text not null,
  location jsonb not null,
  radius numeric not null default 10, -- miles
  start_time timestamptz not null default now(),
  end_time timestamptz not null default (now() + interval '6 hours'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_weather_alerts_time on public.weather_alerts(end_time);
create index if not exists idx_weather_alerts_severity on public.weather_alerts(severity);

-- Enable RLS and policies
alter table public.weather_alerts enable row level security;

-- Allow authenticated users to read active alerts
create policy if not exists weather_alerts_read on public.weather_alerts
for select to authenticated
using (end_time >= now());

-- Allow authenticated users to insert alerts
create policy if not exists weather_alerts_insert on public.weather_alerts
for insert to authenticated
with check (true);

-- Allow creator to update/delete
create policy if not exists weather_alerts_modify_own on public.weather_alerts
for all to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

-- Optional: allow anon read for public dashboards
create policy if not exists weather_alerts_read_anon on public.weather_alerts
for select to anon
using (end_time >= now());