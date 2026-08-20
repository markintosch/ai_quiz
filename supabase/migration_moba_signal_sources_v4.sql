-- ─── Moba Signal: Sanovo direct newsroom, corrected URL ───────────────────────
-- The real Sanovo news page (found manually). The earlier /news/ path may
-- have been a wrong guess rather than a block: reactivate the direct source
-- with the correct URL and let the run log show the truth. Idempotent.

update moba_signal_sources set
  url = 'https://www.sanovogroup.com/nl/about-us/what-is-happening-in-sanovo/',
  ingest = 'scrape',
  active = true,
  status = 'ok',
  failure_reason = null
  where id = 'sanovo-news';
