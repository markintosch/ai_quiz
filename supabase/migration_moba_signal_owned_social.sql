-- FILE: supabase/migration_moba_signal_owned_social.sql
-- ─── Moba Signal: Moba's own Meta (Facebook / Instagram) daily insights ──────
-- Daily series from the Meta Business Suite exports for the pages Moba
-- manages. Owned-channel context for the dashboard: how Moba's own audience
-- responds, next to the competitor picture. Numbers, not items: never enters
-- the signal feed or scoring. One row per platform, metric and day, so a
-- re-upload of an overlapping period updates values instead of duplicating.
-- Run in the Supabase SQL editor. Idempotent and safe on a fresh database.

create table if not exists moba_signal_owned_daily (
  platform     text not null check (platform in ('facebook', 'instagram', 'meta')),
  metric       text not null check (metric in ('views', 'interactions', 'visits', 'link_clicks', 'follows', 'reach')),
  day          date not null,
  value        int  not null,
  source_title text,                                -- the metric title exactly as exported
  filename     text,
  uploaded_at  timestamptz not null default now(),
  primary key (platform, metric, day)
);

create index if not exists moba_signal_owned_daily_day_idx on moba_signal_owned_daily (day);

alter table moba_signal_owned_daily enable row level security;
