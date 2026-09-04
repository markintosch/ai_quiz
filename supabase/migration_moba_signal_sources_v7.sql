-- FILE: supabase/migration_moba_signal_sources_v7.sql
-- ─── Moba Signal — source expansion round 2: curator proposals ────────────────
-- Candidates chosen by business impact, not by availability. The frame: a
-- source earns its place by feeding one of the elements that move Moba money.
--
--   1. Demand creation   — flock economics, HPAI, cage-free transitions,
--                          plant construction (equipment demand runs quarters
--                          behind egg economics)
--   2. Account risk      — competitor presence at Moba accounts (revenue now)
--   3. Capability threat — patents, hiring, launches (the roadmap fight)
--   4. Channel build     — service hubs, distributors (stickiness)
--   5. Message           — claims and share of voice (win-rate influence)
--   6. Event intent      — stand bookings and session slots (budget signals)
--
-- Everything enters as a pending proposal in the curator queue: nothing
-- becomes an active source without the analyst accepting it (PRD §8.3).
-- New sources get the sitemap check automatically (migration_moba_signal_sitemap).
-- Run in the Supabase SQL editor. Idempotent via the (kind, title) unique index.

insert into moba_signal_proposals (kind, title, rationale, proposed_by, source_url) values
  ('source', 'Add source: competitor patent filings (Espacenet)',
   'Capability threat, 12-18 months early. Assignee watches on Sanovo Technology, NABEL, Kyowa Machinery, Zenyer and Vencomatic/Prinzen. A vision-grading or robotics filing precedes the launch the newsroom announces later. Monthly poll of the public search, source_class patents (unused so far).',
   'curator', 'https://worldwide.espacenet.com/'),

  ('source', 'Add sources: event exhibitor directories (IPPE, VIV, SPACE, EuroTier)',
   'Event intent. Stand bookings and floor positions publish months ahead and are budget decisions, the event radar''s stand-size deltas currently depend on manual capture. Crawling the four directories feeds T-90 monitoring with data instead of notes.',
   'curator', 'https://www.ippexpo.org/exhibitors/'),

  ('source', 'Add source: Cal-Maine Foods investor news (US demand side)',
   'Demand creation and account intelligence. The largest US egg producer is public: quarterly reports name capex, cage-free conversion rates and egg-products acquisitions. Their investment cycle is a leading indicator for Americas grading and processing demand.',
   'curator', 'https://www.calmainefoods.com/investors/'),

  ('source', 'Add source: Eurovo Group news (EU demand side)',
   'Demand creation. The largest European egg processor announces plant investments across Italy, Spain and Poland. A new Eurovo line is either a Moba win, a competitor win, or a deal still open: all three are worth knowing early.',
   'curator', 'https://www.eurovogroup.com/'),

  ('source', 'Add sources: NABEL and Zenyer careers pages',
   'Capability threat via hiring, at parity with the Sanovo and Vencomatic careers tracking that already produced the service-engineer and 47-vacancy signals. The Japanese and Chinese competitors are currently blind spots on hiring intent.',
   'curator', 'https://www.nabel.co.jp/recruit/'),

  ('source', 'Add sources: competitor distributor and service-network pages (page-diff)',
   'Channel build. Sanovo service hubs, Zenyer international distributors, NABEL overseas agents. These pages change rarely, so a page-diff ingest is cheap, and a new dot on their map is a stickiness move in a region before any win is announced.',
   'curator', 'https://www.sanovogroup.com/service/'),

  ('source', 'Add sources: newsrooms for the LinkedIn tracked set (Innovatec, Meggson, Ovoconcept)',
   'Message coherence. These entities are measured in share of voice but not collected in news, so the dashboard can see them resonate without knowing what they announced. Closes the gap between the social set and the news set.',
   'curator', null),

  ('source', 'Add source: EggTrack cage-free commitment reporting',
   'Demand creation, account-level. The annual EggTrack report names which producers and buyers committed to cage-free and how far along they are. Every conversion is a housing rebuild that drags packing and grading investment with it, with names attached.',
   'curator', 'https://www.compassioninfoodbusiness.com/our-work/cage-free-laying-hens/eggtrack/'),

  ('source', 'Add source: TED public procurement (EU tenders)',
   'Account risk and win detection. Public tenders occasionally name egg grading and packing equipment, with the buyer and eventually the winner on record. Low volume, high certainty: a lost tender is a confirmed competitor win with paperwork.',
   'curator', 'https://ted.europa.eu/')
on conflict (kind, title) do nothing;
