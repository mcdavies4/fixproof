-- Fixproof schema. Run once in Supabase: SQL Editor -> New query -> paste -> Run.

-- ---------- Tenant profile (one per user) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  property_address text,
  landlord_name text,
  landlord_email text,
  landlord_address text,
  tenancy_start date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Issues (one per repair problem) ----------
create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null,          -- damp_mould | heating_hot_water | water_leak | electrical | gas | fire_safety | structural | pests | windows_doors | sanitation | other
  severity text not null,          -- emergency | urgent | routine | cosmetic
  location_in_home text,
  first_noticed date,
  tenant_notes text,
  ai_observations text,
  ai_likely_cause text,
  ai_hazards text[] not null default '{}',
  ai_safety_tips text[] not null default '{}',
  legal_refs text[] not null default '{}',
  photo_paths text[] not null default '{}',
  status text not null default 'draft', -- draft | reported | in_progress | resolved | escalated
  response_days int not null default 14,
  landlord_notified_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists issues_user_idx on public.issues(user_id, created_at desc);

-- ---------- Timeline (append-only evidence log) ----------
create table if not exists public.issue_events (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,              -- created | photo_added | letter_sent | chase_sent | landlord_response | note | escalated | resolved
  note text,
  photo_paths text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists issue_events_issue_idx on public.issue_events(issue_id, created_at);

-- ---------- Row level security ----------
alter table public.profiles enable row level security;
alter table public.issues enable row level security;
alter table public.issue_events enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own issues" on public.issues;
create policy "own issues" on public.issues
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Evidence log is append-only for tenants: read + insert, no update/delete.
-- That's what makes the timestamps trustworthy as evidence.
drop policy if exists "read own events" on public.issue_events;
create policy "read own events" on public.issue_events
  for select using (auth.uid() = user_id);
drop policy if exists "insert own events" on public.issue_events;
create policy "insert own events" on public.issue_events
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.issues i where i.id = issue_id and i.user_id = auth.uid())
  );

-- Server-set timestamps: clients can't backdate events.
create or replace function public.force_event_time() returns trigger
language plpgsql as $$
begin
  new.created_at := now();
  return new;
end $$;
drop trigger if exists issue_events_time on public.issue_events;
create trigger issue_events_time before insert on public.issue_events
  for each row execute function public.force_event_time();

create or replace function public.force_issue_created_time() returns trigger
language plpgsql as $$
begin
  new.created_at := now();
  return new;
end $$;
drop trigger if exists issues_created_time on public.issues;
create trigger issues_created_time before insert on public.issues
  for each row execute function public.force_issue_created_time();

-- ---------- Private photo storage ----------
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', false)
on conflict (id) do nothing;

-- Files live at evidence/<user_id>/<issue_id>/<file>.jpg
drop policy if exists "evidence read own" on storage.objects;
create policy "evidence read own" on storage.objects
  for select using (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "evidence insert own" on storage.objects;
create policy "evidence insert own" on storage.objects
  for insert with check (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);
