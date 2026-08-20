-- ─── Moba Signal: Sanovo newsroom via the Internet Archive ────────────────────
-- The live page 403s plain fetches even at the correct URL, so the block is
-- real. The Internet Archive crawls it anyway: ingest the latest public
-- snapshot instead. Days of lag, acceptable for a newsroom; the Google News
-- feed stays the fast lane. Run in the Supabase SQL editor. Idempotent.

update moba_signal_sources set
  ingest = 'wayback',
  active = true,
  status = 'ok',
  failure_reason = null
  where id = 'sanovo-news';

update moba_signal_sources set
  name = 'Sanovo newsroom (via Internet Archive)'
  where id = 'sanovo-news';
