-- ─── migration_moba.sql ──────────────────────────────────────────────────────
-- MOBA Marketing Survey — anonymous team assessment (jaarplan 2027).
--
-- WHY SEPARATE TABLES (not respondents/responses):
--   The standard pipeline requires a respondent WITH an email and carries
--   marketing_consent / unsubscribed. This survey is strictly anonymous
--   (§11 of the brief): no name, no email, no person-level tracking. Storing
--   it in `respondents` would pollute the lead table and break anonymity by
--   design. So MOBA gets its own two tables, with no PII and no IP.
--
--   All reads/writes go through server routes using the Supabase SERVICE-ROLE
--   client (which bypasses RLS). We ENABLE RLS with NO anon policies →
--   the public anon key is fully denied; only the service role can touch these.
--
-- Run in Supabase SQL Editor AFTER all previous migrations.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ── moba_teams ────────────────────────────────────────────────────────────────
-- One row per "afname" (team survey run). Carries the two shared links:
--   submit_token  → the fill-in link that goes to the team
--   results_token → the separate group-report link shown in the meeting
create table if not exists moba_teams (
  id                    uuid primary key default uuid_generate_v4(),
  name                  text not null,
  submit_token          text not null unique,
  results_token         text not null unique,
  -- Segmentation (§6): techniek- vs marktgedreven. Off for small teams.
  segmentation_enabled  boolean not null default true,
  -- Group report stays hidden until at least this many submissions (§11).
  min_responses         integer not null default 4,
  -- Minimum submissions inside a single segment before that segment is shown
  -- separately in the report (keeps segments non-identifying).
  segment_min_responses integer not null default 3,
  active                boolean not null default true,
  created_at            timestamptz not null default now()
);

comment on table moba_teams is 'MOBA marketing survey — one row per anonymous team run (afname)';
create index if not exists moba_teams_submit_token_idx  on moba_teams(submit_token);
create index if not exists moba_teams_results_token_idx on moba_teams(results_token);

-- ── moba_submissions ──────────────────────────────────────────────────────────
-- One row per anonymous submission. No respondent, no email, no IP.
create table if not exists moba_submissions (
  id               uuid primary key default uuid_generate_v4(),
  team_id          uuid not null references moba_teams(id) on delete cascade,
  -- Layer 1 — the 18 maturity (likert) answers: { "MP1": 4, "GC2": 2, ... }
  answers          jsonb not null default '{}',
  -- Per-dimension normalised scores (0–100), computed server-side at submit
  -- so the group report can aggregate without re-scoring: { "moba_positioning": 60, ... }
  dimension_scores jsonb not null default '{}',
  -- Layer 2 — priority allocation (10 points over 6 dimensions):
  --   { "moba_positioning": 3, "moba_channel_strategy": 2, ... }
  priorities       jsonb not null default '{}',
  -- Layer 3 — the three open questions: { "q20": "...", "q21": "...", "q22": "..." }
  open_answers     jsonb not null default '{}',
  -- Optional segmentation answer (§6): 1 = techniek-/productgedreven … 5 = markt-/klantgedreven
  segment          smallint check (segment between 1 and 5),
  created_at       timestamptz not null default now()
);

comment on table moba_submissions is 'MOBA marketing survey — anonymous per-person submission (no PII)';
create index if not exists moba_submissions_team_id_idx on moba_submissions(team_id);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Enable RLS with no permissive policies: anon/public is fully denied, the
-- service-role key (used by our server routes) bypasses RLS and has full access.
alter table moba_teams        enable row level security;
alter table moba_submissions  enable row level security;

-- ── Register the product (cosmetic — config lives in code, not the DB) ────────
INSERT INTO quiz_products (key, name, subdomain, description, active)
VALUES (
  'moba_marketing',
  'MOBA Marketing Survey',
  'moba',
  'Anonymous team survey on marketing maturity and market approach, ahead of the 2027 annual plan. Group report emphasises spread/divergence, not individual scores.',
  true
)
ON CONFLICT (key) DO UPDATE
  SET name        = EXCLUDED.name,
      subdomain   = EXCLUDED.subdomain,
      description = EXCLUDED.description,
      active      = EXCLUDED.active;
