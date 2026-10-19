-- Fixproof migration 002: per-user daily cap on AI photo diagnoses.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'diagnose',
  created_at timestamptz not null default now()
);
create index if not exists ai_usage_user_time_idx on public.ai_usage(user_id, created_at desc);

alter table public.ai_usage enable row level security;

-- Users can read and add their own usage rows, but never delete or edit them,
-- so the limit can't be reset from the client.
drop policy if exists "read own usage" on public.ai_usage;
create policy "read own usage" on public.ai_usage for select using (auth.uid() = user_id);
drop policy if exists "insert own usage" on public.ai_usage;
create policy "insert own usage" on public.ai_usage for insert with check (auth.uid() = user_id);

create or replace function public.force_usage_time() returns trigger
language plpgsql as $$
begin
  new.created_at := now();
  return new;
end $$;
drop trigger if exists ai_usage_time on public.ai_usage;
create trigger ai_usage_time before insert on public.ai_usage
  for each row execute function public.force_usage_time();
