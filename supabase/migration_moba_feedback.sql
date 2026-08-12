-- ─── migration_moba_feedback.sql ─────────────────────────────────────────────
-- Durable storage for MOBA survey evaluation feedback.
--
-- WHY: feedback was email-only, with no fallback. If a send ever fails (or the
-- field is reached in an odd state), the reaction is lost. This table is the
-- vangnet: the route writes here FIRST, then emails best-effort. No PII.
--
-- Run in Supabase SQL Editor AFTER migration_moba.sql.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

create table if not exists moba_feedback (
  id         uuid primary key default uuid_generate_v4(),
  -- Null for the public demo; set for a specific team run when applicable.
  team_id    uuid references moba_teams(id) on delete set null,
  message    text not null,
  -- Where it came from, e.g. 'demo'.
  context    text,
  created_at timestamptz not null default now()
);

comment on table moba_feedback is 'MOBA survey evaluation feedback (durable fallback next to email)';
create index if not exists moba_feedback_created_at_idx on moba_feedback(created_at desc);

-- RLS on, no anon policies: only the service-role key (server routes) has access.
alter table moba_feedback enable row level security;
