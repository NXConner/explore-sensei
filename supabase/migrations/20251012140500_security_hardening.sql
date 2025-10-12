-- Security hardening: edge function usage, rate limiting support, and safe search_path
create extension if not exists pgcrypto;

-- Aggregate usage by hour per user per function
create table if not exists public.edge_function_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  function_name text not null,
  period_start timestamptz not null,
  count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, function_name, period_start)
);

create index if not exists idx_edge_usage_user_fn on public.edge_function_usage(user_id, function_name);

alter table public.edge_function_usage enable row level security;

-- Users can manage their own usage rows; admins manage all
create policy if not exists "edge_usage_select_own_or_admin" on public.edge_function_usage
  for select to authenticated using (
    user_id = auth.uid() or public.is_admin(auth.uid())
  );
create policy if not exists "edge_usage_upsert_own_or_admin" on public.edge_function_usage
  for insert to authenticated with check (
    user_id = auth.uid() or public.is_admin(auth.uid())
  );
create policy if not exists "edge_usage_update_own_or_admin" on public.edge_function_usage
  for update to authenticated using (
    user_id = auth.uid() or public.is_admin(auth.uid())
  );

-- Ensure SECURITY DEFINER functions use fixed, safe search_path
-- 1) generate_daily_summary
create or replace function public.generate_daily_summary(
  p_employee_id uuid,
  p_date date
) returns void as $$
declare
  v_total_distance numeric := 0;
  v_prev_lat numeric;
  v_prev_lon numeric;
  v_prev_time timestamptz;
  v_locations_count integer;
  v_first_time timestamptz;
  v_last_time timestamptz;
  v_total_minutes integer;
  loc record;
begin
  -- Get all locations for the day
  for loc in 
    select latitude, longitude, timestamp
    from public.employee_locations
    where employee_id = p_employee_id
      and date(timestamp) = p_date
    order by timestamp asc
  loop
    if v_prev_lat is not null then
      v_total_distance := v_total_distance + 
        calculate_distance(v_prev_lat, v_prev_lon, loc.latitude, loc.longitude);
    else
      v_first_time := loc.timestamp;
    end if;
    v_prev_lat := loc.latitude;
    v_prev_lon := loc.longitude;
    v_prev_time := loc.timestamp;
    v_last_time := loc.timestamp;
  end loop;

  -- Get location count
  select count(*) into v_locations_count
  from public.employee_locations
  where employee_id = p_employee_id
    and date(timestamp) = p_date;

  -- Calculate total time
  v_total_minutes := extract(epoch from (v_last_time - v_first_time)) / 60;

  -- Insert or update summary
  insert into public.daily_activity_summary (
    employee_id, date, total_distance_km, total_time_minutes,
    first_location_time, last_location_time, locations_count
  ) values (
    p_employee_id, p_date, v_total_distance, v_total_minutes,
    v_first_time, v_last_time, v_locations_count
  )
  on conflict (employee_id, date) 
  do update set
    total_distance_km = excluded.total_distance_km,
    total_time_minutes = excluded.total_time_minutes,
    first_location_time = excluded.first_location_time,
    last_location_time = excluded.last_location_time,
    locations_count = excluded.locations_count;
end;
$$ language plpgsql security definer set search_path = public;

-- 2) is_admin_user
create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_profiles 
    where id = auth.uid() 
      and (is_admin = true or role in ('super_admin', 'admin'))
  );
$$;

-- 3) check_user_role
create or replace function public.check_user_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid()
      and (is_admin = true or role = any(allowed_roles))
  );
$$;
