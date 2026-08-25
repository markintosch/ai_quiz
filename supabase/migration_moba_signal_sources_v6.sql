-- FILE: supabase/migration_moba_signal_sources_v6.sql
-- ─── Moba Signal — add Rabobank RaboResearch as a research source ─────────────
-- Rabobank's RaboResearch Food & Agribusiness team publishes macro and
-- sector research on animal protein, including eggs and layers. Classed as
-- trade-press. The public site is a JavaScript app and full reports often sit
-- behind registration, so a plain scrape may return only listing text; the
-- reliable route for a specific report is the console upload (kind = research).

insert into moba_signal_sources (id, name, url, ingest, source_class, language, active, status) values
  ('rabobank-far', 'Rabobank RaboResearch (Food & Agribusiness)',
   'https://research.rabobank.com/far/en/sectors/animal-protein.html',
   'scrape', 'trade-press', 'en', true, 'stale')
on conflict (id) do update set
  name = excluded.name, url = excluded.url, ingest = excluded.ingest,
  source_class = excluded.source_class, language = excluded.language;
