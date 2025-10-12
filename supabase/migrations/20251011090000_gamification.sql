-- Gamification core tables (idempotent)
create extension if not exists pgcrypto;

create table if not exists public.game_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  created_at timestamptz not null default now(),
  idempotency_key text unique,
  device_id text,
  lat double precision,
  lng double precision,
  metadata jsonb
);

create table if not exists public.game_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  points integer not null default 0,
  xp integer not null default 0,
  level integer not null default 1,
  streak_current integer not null default 0,
  streak_longest integer not null default 0,
  last_event_date date,
  updated_at timestamptz not null default now()
);

create table if not exists public.game_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_code text not null,
  title text,
  description text,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_code)
);

create table if not exists public.game_quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_code text not null,
  status text not null default 'active',
  progress jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, quest_code)
);

create table if not exists public.game_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_code text not null,
  metadata jsonb,
  redeemed_at timestamptz not null default now()
);

-- RLS
alter table public.game_events enable row level security;
alter table public.game_profiles enable row level security;
alter table public.game_badges enable row level security;
alter table public.game_quests enable row level security;
alter table public.game_redemptions enable row level security;

-- Policies (user can manage own records)
create policy if not exists "game_events_select_own" on public.game_events
  for select using (auth.uid() = user_id);
create policy if not exists "game_events_insert_own" on public.game_events
  for insert with check (auth.uid() = user_id);

create policy if not exists "game_profiles_select_own" on public.game_profiles
  for select using (auth.uid() = user_id);
create policy if not exists "game_profiles_upsert_own" on public.game_profiles
  for insert with check (auth.uid() = user_id);
create policy if not exists "game_profiles_update_own" on public.game_profiles
  for update using (auth.uid() = user_id);

create policy if not exists "game_badges_select_own" on public.game_badges
  for select using (auth.uid() = user_id);
create policy if not exists "game_badges_insert_own" on public.game_badges
  for insert with check (auth.uid() = user_id);

create policy if not exists "game_quests_select_own" on public.game_quests
  for select using (auth.uid() = user_id);
create policy if not exists "game_quests_insert_own" on public.game_quests
  for insert with check (auth.uid() = user_id);
create policy if not exists "game_quests_update_own" on public.game_quests
  for update using (auth.uid() = user_id);

create policy if not exists "game_redemptions_select_own" on public.game_redemptions
  for select using (auth.uid() = user_id);
create policy if not exists "game_redemptions_insert_own" on public.game_redemptions
  for insert with check (auth.uid() = user_id);

-- Helpful index
create index if not exists idx_game_events_user_created on public.game_events (user_id, created_at desc);

-- Leaderboard view and policy
create or replace view public.game_leaderboard as
  select user_id, points, xp, level, streak_current, streak_longest, updated_at
  from public.game_profiles;

grant select on public.game_leaderboard to anon, authenticated; -- view is derived and safe
