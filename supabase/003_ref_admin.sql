-- Fixproof migration 003: creator ref tracking + admin stats views.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

-- ---------- Attribution: which link brought each user (first touch, set once) ----------
create table if not exists public.attributions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ref text not null default 'direct',
  created_at timestamptz not null default now()
);
create index if not exists attributions_ref_idx on public.attributions(ref, created_at desc);

alter table public.attributions enable row level security;
drop policy if exists "insert own attribution" on public.attributions;
create policy "insert own attribution" on public.attributions
  for insert with check (auth.uid() = user_id);
drop policy if exists "read own attribution" on public.attributions;
create policy "read own attribution" on public.attributions
  for select using (auth.uid() = user_id);
-- No update/delete policy: first touch can't be overwritten.

-- Use the real account creation time, not the client's clock.
create or replace function public.attribution_time() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  select coalesce(u.created_at, now()) into new.created_at from auth.users u where u.id = new.user_id;
  new.ref := lower(left(regexp_replace(coalesce(new.ref, 'direct'), '[^a-zA-Z0-9_-]', '', 'g'), 40));
  if new.ref = '' then new.ref := 'direct'; end if;
  return new;
end $$;
drop trigger if exists attributions_time on public.attributions;
create trigger attributions_time before insert on public.attributions
  for each row execute function public.attribution_time();

-- ---------- Admin views (service role only) ----------
create or replace view public.admin_ref_funnel with (security_invoker = true) as
select
  a.ref,
  count(*)::int as signups,
  count(*) filter (where a.created_at > now() - interval '1 day')::int as signups_24h,
  count(*) filter (where a.created_at > now() - interval '7 days')::int as signups_7d,
  count(*) filter (where exists (select 1 from public.issues i where i.user_id = a.user_id))::int as logged_issue,
  count(*) filter (where exists (
    select 1 from public.issues i where i.user_id = a.user_id and i.landlord_notified_at is not null
  ))::int as sent_letter
from public.attributions a
group by a.ref
order by signups desc;

create or replace view public.admin_daily with (security_invoker = true) as
select
  d::date as day,
  (select count(*) from public.attributions a where a.created_at::date = d::date)::int as signups,
  (select count(*) from public.issues i where i.created_at::date = d::date)::int as issues,
  (select count(*) from public.issue_events e where e.kind = 'letter_sent' and e.created_at::date = d::date)::int as letters,
  (select count(*) from public.ai_usage u where u.created_at::date = d::date)::int as ai_checks
from generate_series(current_date - 13, current_date, interval '1 day') d
order by day;

-- Lock the views away from the public API. Only the service role (server-side /admin) reads them.
revoke all on public.admin_ref_funnel from anon, authenticated;
revoke all on public.admin_daily from anon, authenticated;
