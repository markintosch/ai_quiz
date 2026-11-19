-- FILE: supabase/migration_moba_signal_owned_social_v2.sql
-- ─── Moba Signal: accept every Meta Business Suite metric ────────────────────
-- The first owned-social migration allowed six metric keys, so any other
-- Business Suite export (likes, shares, saves, reel views, total followers,
-- or a title Meta introduces later) could not be stored. The parser now maps
-- known titles to fixed keys and stores anything else as "other:<slug>".
-- This replaces the fixed list with a format check. Run in the Supabase SQL
-- editor. Idempotent, and safe on a database where the first migration has
-- not run (it creates the table in that case).

create table if not exists moba_signal_owned_daily (
  platform     text not null check (platform in ('facebook', 'instagram', 'meta')),
  metric       text not null,
  day          date not null,
  value        int  not null,
  source_title text,
  filename     text,
  uploaded_at  timestamptz not null default now(),
  primary key (platform, metric, day)
);

create index if not exists moba_signal_owned_daily_day_idx on moba_signal_owned_daily (day);
alter table moba_signal_owned_daily enable row level security;

-- Drop the fixed metric list from the first migration
alter table moba_signal_owned_daily drop constraint if exists moba_signal_owned_daily_metric_check;

-- Lower-case keys only: a known key such as "views", or "other:<slug>"
do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'moba_signal_owned_daily_metric_format'
       and conrelid = 'moba_signal_owned_daily'::regclass
  ) then
    alter table moba_signal_owned_daily
      add constraint moba_signal_owned_daily_metric_format
      check (metric ~ '^(other:)?[a-z0-9_]{1,60}$');
  end if;
end $$;
