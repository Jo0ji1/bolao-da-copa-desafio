-- Sistema de Bolao da Copa - Schema completo (Supabase/Postgres)

create extension if not exists pgcrypto;

create type match_status as enum ('scheduled', 'finished');
create type winner_type as enum ('home', 'away', 'draw');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Participante',
  is_admin boolean not null default false,
  expo_push_token text,
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  home_team text not null,
  away_team text not null,
  kickoff_at timestamptz not null,
  stage text not null,
  status match_status not null default 'scheduled',
  home_score int,
  away_score int,
  created_at timestamptz not null default now(),
  constraint matches_score_check check (
    (status = 'scheduled' and home_score is null and away_score is null)
    or
    (status = 'finished' and home_score is not null and away_score is not null)
  )
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  predicted_home_score int,
  predicted_away_score int,
  predicted_winner winner_type,
  points_awarded int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id),
  constraint predictions_payload_check check (
    (predicted_home_score is not null and predicted_away_score is not null)
    or
    predicted_winner is not null
  )
);

create table if not exists public.pools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  is_private boolean not null default true,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.pool_members (
  pool_id uuid not null references public.pools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (pool_id, user_id)
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists predictions_touch_updated_at on public.predictions;
create trigger predictions_touch_updated_at
before update on public.predictions
for each row execute procedure public.touch_updated_at();

create or replace function public.compute_prediction_points(
  p_match_id uuid,
  p_home int,
  p_away int,
  p_winner winner_type
)
returns int
language plpgsql
as $$
declare
  m record;
  actual_winner winner_type;
  points int := 0;
begin
  select home_score, away_score, status
  into m
  from public.matches
  where id = p_match_id;

  if not found or m.status <> 'finished' then
    return 0;
  end if;

  if m.home_score > m.away_score then
    actual_winner := 'home';
  elsif m.home_score < m.away_score then
    actual_winner := 'away';
  else
    actual_winner := 'draw';
  end if;

  if p_home is not null and p_away is not null and p_home = m.home_score and p_away = m.away_score then
    return 5;
  end if;

  if p_winner is not null and p_winner = actual_winner then
    points := greatest(points, 3);
  end if;

  if p_home is not null and p_away is not null then
    if (p_home > p_away and actual_winner = 'home')
      or (p_home < p_away and actual_winner = 'away')
      or (p_home = p_away and actual_winner = 'draw') then
      points := greatest(points, 3);
    end if;
  end if;

  return points;
end;
$$;

create or replace function public.refresh_points_for_match(p_match_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.predictions p
  set points_awarded = public.compute_prediction_points(
    p.match_id,
    p.predicted_home_score,
    p.predicted_away_score,
    p.predicted_winner
  )
  where p.match_id = p_match_id;
end;
$$;

create or replace function public.on_prediction_change()
returns trigger
language plpgsql
as $$
begin
  new.points_awarded := public.compute_prediction_points(
    new.match_id,
    new.predicted_home_score,
    new.predicted_away_score,
    new.predicted_winner
  );
  return new;
end;
$$;

drop trigger if exists prediction_points_trigger on public.predictions;
create trigger prediction_points_trigger
before insert or update on public.predictions
for each row execute procedure public.on_prediction_change();

create or replace function public.on_match_result_change()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'finished' then
    perform public.refresh_points_for_match(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists match_result_trigger on public.matches;
create trigger match_result_trigger
after update of home_score, away_score, status on public.matches
for each row execute procedure public.on_match_result_change();

create or replace view public.leaderboard_overall as
select
  p.user_id,
  pr.display_name,
  coalesce(sum(p.points_awarded), 0) as total_points,
  coalesce(sum(case when p.points_awarded = 5 then 1 else 0 end), 0) as exact_hits,
  coalesce(sum(case when p.points_awarded >= 3 then 1 else 0 end), 0) as winner_hits
from public.predictions p
join public.profiles pr on pr.id = p.user_id
group by p.user_id, pr.display_name
order by total_points desc, exact_hits desc, winner_hits desc;

create or replace view public.leaderboard_by_pool as
select
  pm.pool_id,
  p.user_id,
  pr.display_name,
  coalesce(sum(p.points_awarded), 0) as total_points,
  coalesce(sum(case when p.points_awarded = 5 then 1 else 0 end), 0) as exact_hits,
  coalesce(sum(case when p.points_awarded >= 3 then 1 else 0 end), 0) as winner_hits
from public.pool_members pm
join public.predictions p on p.user_id = pm.user_id
join public.profiles pr on pr.id = p.user_id
group by pm.pool_id, p.user_id, pr.display_name
order by total_points desc, exact_hits desc, winner_hits desc;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
alter table public.pools enable row level security;
alter table public.pool_members enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
for select
using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "matches_read_all" on public.matches;
create policy "matches_read_all" on public.matches
for select
using (true);

drop policy if exists "matches_admin_write" on public.matches;
create policy "matches_admin_write" on public.matches
for all
using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.is_admin = true)
)
with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.is_admin = true)
);

drop policy if exists "predictions_select_own" on public.predictions;
create policy "predictions_select_own" on public.predictions
for select
using (auth.uid() = user_id);

drop policy if exists "predictions_insert_own" on public.predictions;
create policy "predictions_insert_own" on public.predictions
for insert
with check (auth.uid() = user_id);

drop policy if exists "predictions_update_own" on public.predictions;
create policy "predictions_update_own" on public.predictions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "pools_select_member_or_public" on public.pools;
create policy "pools_select_member_or_public" on public.pools
for select
using (
  is_private = false
  or exists (
    select 1 from public.pool_members pm
    where pm.pool_id = pools.id and pm.user_id = auth.uid()
  )
  or created_by = auth.uid()
);

drop policy if exists "pools_insert_owner" on public.pools;
create policy "pools_insert_owner" on public.pools
for insert
with check (created_by = auth.uid());

drop policy if exists "pool_members_select_own" on public.pool_members;
create policy "pool_members_select_own" on public.pool_members
for select
using (auth.uid() = user_id);

drop policy if exists "pool_members_insert_self_or_owner" on public.pool_members;
create policy "pool_members_insert_self_or_owner" on public.pool_members
for insert
with check (
  auth.uid() = user_id
  or exists (
    select 1 from public.pools p
    where p.id = pool_id and p.created_by = auth.uid()
  )
);

grant select on public.leaderboard_overall to authenticated;
grant select on public.leaderboard_by_pool to authenticated;

insert into public.matches (home_team, away_team, kickoff_at, stage, status)
values
  ('Brasil', 'Servia', now() + interval '1 day', 'Fase de grupos', 'scheduled'),
  ('Argentina', 'Franca', now() + interval '2 day', 'Fase de grupos', 'scheduled'),
  ('Alemanha', 'Espanha', now() + interval '3 day', 'Fase de grupos', 'scheduled')
on conflict do nothing;
