-- ─── Moba Signal: Sanovo newsroom via the Internet Archive ────────────────────
-- The live page 403s plain fetches even at the correct URL, so the block is
-- real. The Internet Archive crawls it anyway: ingest the latest public
-- snapshot instead. Days of lag, acceptable for a newsroom; the Google News
-- feed stays the fast lane. Run in the Supabase SQL editor. Idempotent.

-- Databases created with the earlier v2 constraint need it widened first
alter table moba_signal_sources drop constraint if exists moba_signal_sources_ingest_check;
alter table moba_signal_sources add constraint moba_signal_sources_ingest_check
  check (ingest in ('rss','scrape','page-diff','newsletter','headless','wayback'));

update moba_signal_sources set
  ingest = 'wayback',
  active = true,
  status = 'ok',
  failure_reason = null
  where id = 'sanovo-news';

update moba_signal_sources set
  name = 'Sanovo newsroom (via Internet Archive)'
  where id = 'sanovo-news';
