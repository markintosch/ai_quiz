-- FILE: supabase/migration_moba_signal_context_frame.sql
-- ─── Moba Signal — publishable market frames ─────────────────────────────────
-- Context holds two different things: inputs the scoring needs (the strategic
-- account list, analyst-only) and standing interpretations of where the market
-- is going, which belong on the board because they change how every other card
-- reads. Only the second kind may be published, so publication is opt-in per
-- row and everything existing stays exactly where it is.
--
-- Run in the Supabase SQL editor. Idempotent.

alter table moba_signal_context
  add column if not exists is_frame boolean not null default false;

comment on column moba_signal_context.is_frame is
  'Publish this row on the dashboard as a market frame. Default false: context also holds analyst-only material.';
