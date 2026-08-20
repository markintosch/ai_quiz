-- ─── Moba Signal: manual upload fallback source ───────────────────────────────
-- Catch-all attribution for uploaded documents that belong to no crawled
-- source (a random trade PDF, meeting notes). Class 'human' = credibility 1
-- by rule until corroborated. Run in the Supabase SQL editor. Idempotent.

insert into moba_signal_sources (id, name, url, source_class, ingest, active) values
  ('manual-upload', 'Manual uploads (unattributed)', 'https://markdekock.com/admin/moba-signal', 'human', 'scrape', false)
on conflict (id) do nothing;
