create extension if not exists postgis;
create extension if not exists pgcrypto;

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  region text not null,
  state text not null default 'CA',
  destination_type text not null,
  summary text not null,
  latitude double precision,
  longitude double precision,
  geom geography(point, 4326),
  best_months int[] not null default '{}',
  avoid_months int[] not null default '{}',
  base_towns text[] not null default '{}',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.destination_areas (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations(id) on delete cascade,
  name text not null,
  area_type text not null,
  latitude double precision,
  longitude double precision,
  elevation_ft integer,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.seasonal_rules (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations(id) on delete cascade,
  month integer not null check (month between 1 and 12),
  activity_type text not null,
  score integer not null check (score between 0 and 100),
  explanation text not null,
  risk_notes text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations(id) on delete cascade,
  source text not null,
  source_id text,
  alert_type text not null,
  severity text not null,
  title text not null,
  description text,
  effective_date timestamptz,
  expiration_date timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.weather_snapshots (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations(id) on delete cascade,
  area_id uuid references public.destination_areas(id) on delete set null,
  snapshot_date date not null,
  high_temp integer,
  low_temp integer,
  precipitation_probability integer,
  wind_speed integer,
  snow_risk integer,
  heat_risk integer,
  created_at timestamptz not null default now(),
  unique (destination_id, area_id, snapshot_date)
);

create table if not exists public.trip_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  destination_id uuid references public.destinations(id) on delete set null,
  title text not null,
  user_origin text not null,
  start_date date,
  end_date date,
  group_type text,
  preferences jsonb not null default '{}'::jsonb,
  generated_plan jsonb not null default '{}'::jsonb,
  plan_b jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  origin_city text,
  driving_tolerance text,
  favorite_activities text[] not null default '{}',
  group_default text,
  lodging_preference text,
  avoidances text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.destinations enable row level security;
alter table public.destination_areas enable row level security;
alter table public.seasonal_rules enable row level security;
alter table public.alerts enable row level security;
alter table public.weather_snapshots enable row level security;
alter table public.trip_plans enable row level security;
alter table public.user_preferences enable row level security;

drop policy if exists "Public can read destinations" on public.destinations;
create policy "Public can read destinations"
on public.destinations
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read destination areas" on public.destination_areas;
create policy "Public can read destination areas"
on public.destination_areas
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read seasonal rules" on public.seasonal_rules;
create policy "Public can read seasonal rules"
on public.seasonal_rules
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read alerts" on public.alerts;
create policy "Public can read alerts"
on public.alerts
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read weather snapshots" on public.weather_snapshots;
create policy "Public can read weather snapshots"
on public.weather_snapshots
for select
to anon, authenticated
using (true);

drop policy if exists "Users can manage their own trip plans" on public.trip_plans;
create policy "Users can manage their own trip plans"
on public.trip_plans
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own preferences" on public.user_preferences;
create policy "Users can manage their own preferences"
on public.user_preferences
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.destination_content_snapshots (
  destination_id uuid primary key references public.destinations(id) on delete cascade,
  current_verdict text not null,
  why_now text not null,
  main_warning text not null,
  best_activity text not null,
  seasonal_window text not null,
  palette text[] not null default '{}',
  drive_hours jsonb not null default '{}'::jsonb,
  ideal_trip_lengths text[] not null default '{}',
  collections text[] not null default '{}',
  risk_badges text[] not null default '{}',
  score_breakdown jsonb not null default '{}'::jsonb,
  activities jsonb not null default '[]'::jsonb,
  avoid_items text[] not null default '{}',
  suggested_stops text[] not null default '{}',
  food_support jsonb not null default '{}'::jsonb,
  lodging jsonb not null default '{}'::jsonb,
  plan_b jsonb not null default '{}'::jsonb,
  itinerary jsonb not null default '[]'::jsonb,
  current_fit_score integer not null check (current_fit_score between 0 and 100),
  current_fit_label text not null,
  updated_at timestamptz not null default now()
);

alter table public.destination_content_snapshots enable row level security;

drop policy if exists "Public can read destination content snapshots"
on public.destination_content_snapshots;
create policy "Public can read destination content snapshots"
on public.destination_content_snapshots
for select
to anon, authenticated
using (true);
