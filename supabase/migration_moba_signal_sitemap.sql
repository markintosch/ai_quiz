-- FILE: supabase/migration_moba_signal_sitemap.sql
-- ─── Moba Signal — sitemap scanning per source ────────────────────────────────
-- Each collection run also checks the source's sitemap file and records every
-- URL it lists. The diff against the previous run is the signal: a new URL in
-- a competitor's sitemap is often the earliest public trace of a launch page,
-- a case story or a new market page, before it reaches the newsroom listing.
-- The first check per source is a baseline: recorded, never treated as "new".
-- Run in the Supabase SQL editor. Idempotent.

-- Per-source configuration and rollup counters.
-- sitemap_url: null = auto-discover (robots.txt, then /sitemap.xml),
--              'off' = skip the check, anything else = explicit sitemap URL.
alter table moba_signal_sources add column if not exists sitemap_url text;
alter table moba_signal_sources add column if not exists sitemap_checked_at timestamptz;
alter table moba_signal_sources add column if not exists sitemap_page_count int;

-- The seen-URL memory: one row per (source, url), first_seen is the diff key.
create table if not exists moba_signal_sitemap_urls (
  source_id  text not null references moba_signal_sources(id) on delete cascade,
  url        text not null,
  lastmod    text,                                  -- as published, not parsed
  first_seen timestamptz not null default now(),
  primary key (source_id, url)
);
create index if not exists moba_signal_sitemap_urls_seen
  on moba_signal_sitemap_urls(source_id, first_seen desc);

alter table moba_signal_sitemap_urls enable row level security;

-- Run log counters, so the health panel can show what the check found.
alter table moba_signal_runs add column if not exists sitemap_urls int not null default 0;
alter table moba_signal_runs add column if not exists sitemap_new  int not null default 0;

-- Sources where a sitemap check is meaningless or unreachable:
-- social platforms, aggregator feeds, and wayback-ingested sites whose live
-- origin blocks plain fetches anyway.
update moba_signal_sources set sitemap_url = 'off'
  where sitemap_url is null
    and (source_class = 'social'
      or ingest = 'wayback'
      or url like '%news.google.com%'
      or url like '%linkedin.com%');
