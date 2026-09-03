-- ─── migration_moba_role.sql ─────────────────────────────────────────────────
-- MOBA Marketing Survey — "rol van marketing" vraag.
--
-- Adds one column to moba_submissions for the multi-select + free-text answer:
--   role_answers = { "selected": ["partner","brand"], "other": "..." }
-- Idempotent. Run AFTER migration_moba.sql.
-- ─────────────────────────────────────────────────────────────────────────────

alter table moba_submissions
  add column if not exists role_answers jsonb not null default '{}';
