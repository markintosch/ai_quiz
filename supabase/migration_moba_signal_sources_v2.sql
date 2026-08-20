-- ─── Moba Signal: source list v2 ──────────────────────────────────────────────
-- Integrates the "Moba Signal Sources" briefing (feed endpoints probed
-- 19 Aug 2026). Verified feeds become active RSS sources; endpoints that
-- tested as blocked keep honest failure notes; untested tier-two sources
-- enter as curator proposals for the analyst to accept, per the PRD flow.
-- Run AFTER migration_moba_signal.sql. Idempotent.

-- New columns: preferred feed endpoint and ingest method
alter table moba_signal_sources add column if not exists feed_url text;
alter table moba_signal_sources add column if not exists ingest text not null default 'scrape'
  check (ingest in ('rss','scrape','page-diff','newsletter','headless','wayback'));

-- ── Tier one and verified feeds: ingest directly ──────────────────────────────
insert into moba_signal_sources (id, name, url, feed_url, ingest, source_class, language) values
  ('poultry-site',   'The Poultry Site',            'https://www.thepoultrysite.com/',            'https://www.thepoultrysite.com/news.rss',                'rss', 'trade-press', null),
  ('poultry-network', 'Poultry Network (UK/EU)',    'https://poultry.network/',                   'https://poultry.network/feed',                           'rss', 'trade-press', null),
  ('zootecnica',     'Zootecnica International',    'https://zootecnicainternational.com/',       'https://zootecnicainternational.com/feed',               'rss', 'trade-press', 'Italian'),
  ('asian-agribiz',  'Asian Agribiz',               'https://www.asian-agribiz.com/poultry-sector/', 'https://www.asian-agribiz.com/feed',                  'rss', 'trade-press', null),
  ('poultry-news-uk','Poultry News (UK)',           'https://www.poultrynews.co.uk/',             'https://www.poultrynews.co.uk/feed',                     'rss', 'trade-press', null),
  ('meat-poultry',   'MEAT+POULTRY (processing)',   'https://www.meatpoultry.com/',               'https://www.meatpoultry.com/rss/topic/1-latest-news',    'rss', 'trade-press', null),
  ('pluimveebedrijf','Pluimveebedrijf (NL)',        'https://www.pluimveebedrijf.nl/',            'https://www.pluimveebedrijf.nl/feed',                    'rss', 'trade-press', 'Dutch'),
  ('moba-own',       'Moba newsroom (own voice)',   'https://www.moba.net/',                      'https://www.moba.net/feed',                              'rss', 'competitor-site', null),
  ('ovotrack',       'Ovotrack (competitor-adjacent)', 'https://www.ovotrack.com/',               'https://www.ovotrack.com/feed',                          'rss', 'competitor-site', null)
on conflict (id) do update set feed_url = excluded.feed_url, ingest = excluded.ingest;

-- Ovotrack context: their live-projects page is effectively a published win
-- list, and since the Sanovo alliance they sit inside the traceability layer
-- on top of Moba machines.
update moba_signal_sources
  set name = 'Ovotrack (part of Sanovo alliance)'
  where id = 'ovotrack';

-- ── Endpoints that tested as blocked: keep visible, mark honestly ─────────────
update moba_signal_sources set
  status = 'failed', active = false, ingest = 'newsletter',
  failure_reason = 'Cloudflare 403 on feed and plain fetch. Plan: newsletter-to-inbox parsing or headless fetch (next phase).'
  where id = 'watt-poultry';

update moba_signal_sources set
  url = 'https://www.foodagribusiness.world/poultry', ingest = 'scrape',
  failure_reason = 'No RSS on the poultry section since the Misset platform merge. Scraping /poultry/archive.'
  where id = 'poultry-world';

update moba_signal_sources set
  status = 'failed', active = false, ingest = 'page-diff',
  failure_reason = 'sanovogroup.com returns 403 to plain fetches. Plan: scheduled page-diff of the news section or headless fetch (next phase).'
  where id = 'sanovo-news';

-- ── Untested tier-two sources: enter as curator proposals, not active sources ─
insert into moba_signal_proposals (kind, title, rationale, proposed_by, source_url) values
  ('source', 'Add source: Egg Industry Center, Iowa State',
   'Monthly US flock trends, projections and cost studies. Half news, half data. No RSS: poll the reports index monthly.',
   'curator', 'https://www.eggindustrycenter.org/'),
  ('source', 'Add source: Feedstuffs (US policy)',
   'Strong on US cage-free mandate rollbacks, a direct headwind signal for housing-driven equipment demand. Feed untested.',
   'curator', 'https://www.feedstuffs.com/'),
  ('source', 'Add source: AviNews International (ES/PT)',
   'Main Spanish and Portuguese window on LATAM, roughly 12 percent of world egg production. Feed returns 403: needs headless fetch.',
   'curator', 'https://avinews.com/en/'),
  ('source', 'Add source: BFREPA / The Ranger',
   'Small association title, disproportionately high signal: customers explain their own capex reasoning. Ran a full feature on Moba vision grading.',
   'curator', 'https://www.bfrepa.co.uk/'),
  ('source', 'Add source: Poultry Trends (India)',
   'India is a top-three producer with a consolidating packing sector, thinly covered elsewhere. Monthly cadence.',
   'curator', 'https://poultrytrends.in/'),
  ('source', 'Add source: Thornico newsroom (Sanovo parent)',
   'Corporate moves land on the parent site first: the Ovotrack investment was announced there before the trade press had it.',
   'curator', 'https://thornico.com/'),
  ('source', 'Add source: Pluimveeweb eiermarkt (NL)',
   'Fastest read on Dutch and German supply tension, and where reputational items about a Barneveld company surface first. /rss returns HTML: needs scrape.',
   'curator', 'https://www.pluimveeweb.nl/'),
  ('source', 'Add data pipeline: leading indicators (EU egg dashboard, USDA, EIC flock, HPAI, Pluimveebeurs)',
   'Equipment demand follows egg economics by quarters. Series data needs its own numeric store with threshold alerts, not the news feed. Separate build.',
   'curator', 'https://agridata.ec.europa.eu/'),
  ('source', 'Add watchlist: LinkedIn people at Sanovo, Ovotrack, Diamond and major packers',
   'Sales and commissioning staff post installation photos weeks before press releases. People, not pages. Manual watchlist plus the contribution channel.',
   'curator', 'https://www.linkedin.com/')
on conflict (kind, title) do nothing;
