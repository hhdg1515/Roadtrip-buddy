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
