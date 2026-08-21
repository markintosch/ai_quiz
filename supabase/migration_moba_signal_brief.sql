-- ─── Moba Signal: weekly competitive brief and decision labels ────────────────
-- The Editor agent drafts a brief every Monday from the week's approved
-- items; nothing renders until the analyst approves it (the agent drafts,
-- humans declare). Decision labels turn approved items into decisions:
-- threat/opportunity/watch plus a recommended action.
-- Run in the Supabase SQL editor. Idempotent.

create table if not exists moba_signal_briefs (
  id            uuid primary key default gen_random_uuid(),
  week_start    date not null unique,        -- the Monday
  status        text not null default 'draft' check (status in ('draft','approved','rejected')),
  temperature   text check (temperature in ('elevated','normal','quiet')),
  headline      text,
  what_happened text,
  key_development text,
  why_it_matters  text,
  moba_advantage  text,
  marketing_response text,
  sales_response  text,
  watch_next    text,
  changes       jsonb not null default '[]'::jsonb,   -- [{entity, change}]
  drafted_by    text not null default 'editor',
  approved_by   text,
  approved_at   timestamptz,
  created_at    timestamptz not null default now()
);
alter table moba_signal_briefs enable row level security;

-- Decision labels, set by the analyst at approval time
alter table moba_signal_items add column if not exists disposition text
  check (disposition in ('threat','opportunity','watch','neutral'));
alter table moba_signal_items add column if not exists recommended_action text
  check (recommended_action in ('ignore','monitor','investigate','respond'));
