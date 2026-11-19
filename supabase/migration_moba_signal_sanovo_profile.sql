-- FILE: supabase/migration_moba_signal_sanovo_profile.sql
-- ─── Moba Signal: inputs for the Sanovo profile tab ──────────────────────────
-- The Sanovo profile tab (/moba/signal#sanovo) lists the inputs that would
-- close its known gaps: the legal and IP file, registry filings, owned
-- channels and partner newsrooms. Each enters as a pending proposal in the
-- curator queue: nothing becomes an active source until the analyst accepts
-- it (PRD §8.3).
-- Run in the Supabase SQL editor. Idempotent by title: re-running inserts
-- nothing. Uses NOT EXISTS rather than ON CONFLICT, so it does not depend on
-- a unique index that older databases may lack.

insert into moba_signal_proposals (kind, title, rationale, proposed_by, source_url)
select v.kind, v.title, v.rationale, v.proposed_by, v.source_url
from (values
  ('source', 'Add source: European Patent Register, Sanovo opposition file',
   'Legal and IP. Sanovo Technology Netherlands opposed a Moba patent ("Method and system for processing a plurality of avian eggs", opposition dated 15 Jan 2026). The public register shows status, filings and hearing dates. Read-only tracking; interpretation stays with Moba IP counsel.',
   'curator', 'https://register.epo.org/'),

  ('source', 'Add source: EUIPO and WIPO trademark watch on Sanovo Technology A/S',
   'Capability threat. Trademark filings name products months before launch (VisionAI, Cook2Peel and GraderPro all surfaced first as names). Monthly check of TMview for new filings by Sanovo Technology A/S.',
   'curator', 'https://www.tmdn.org/tmview/'),

  ('source', 'Add source: Danish CVR annual reports (Sanovo Technology A/S, Thornico Holding A/S)',
   'Context. Free public filings: revenue, result, headcount, management outlook and group structure. Annual cadence, uploaded as a document so the existing ingest reads it.',
   'curator', 'https://datacvr.virk.dk/'),

  ('source', 'Add source: Thornico group newsroom',
   'Owner strategy. Thornico publishes Sanovo results and acquisitions (for example Sonosteam) on its own site, sometimes before Sanovo does.',
   'curator', 'https://thornico.com/'),

  ('source', 'Add source: SANOVO World hub',
   'Message. New owned hub since 28 Oct 2026 that gathers Sanovo news and innovations. Likely the front door for the IPPE 2027 in-ovo sexing launch.',
   'curator', 'https://sanovogroup.com/'),

  ('source', 'Add source: Sanovo YouTube channel feed',
   'Message and launches. YouTube publishes a public RSS feed per channel, so no scraping is needed. Machine demos carry capacity and detection claims in their own words.',
   'curator', 'https://www.youtube.com/user/SANOVOTECHGROUP'),

  ('source', 'Add sources: in-ovo sexing partner newsrooms (Canadian Egg Technologies, MatrixSpec, Egg Farmers of Canada)',
   'Capability threat. The partners announce the day-4 in-ovo sexing timeline and will publish the validation data Sanovo has not released yet. Feeds the IPPE 2027 preparation.',
   'curator', 'https://www.eggfarmers.ca/press/')
) as v(kind, title, rationale, proposed_by, source_url)
where not exists (
  select 1 from moba_signal_proposals p
   where p.kind = v.kind and p.title = v.title
);
