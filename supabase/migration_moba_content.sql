-- ─── migration_moba_content.sql ─────────────────────────────────────────────
-- MOBA Marketing Survey — editable survey copy (admin CMS).
--
-- WHY A SINGLE-ROW OVERRIDES TABLE:
--   The survey STRUCTURE (6 dimensions × 3 questions, question codes, option
--   values 1–5, priority keys, open-question keys) is fixed in code because the
--   scoring engine and aggregation depend on it. Only the COPY is editable:
--   question text, option labels, priority labels, open-question text and the
--   segmentation labels. So we store a sparse JSON override, keyed by the code
--   defaults, in one row. Reads merge this over the code defaults — any field
--   that is not overridden keeps following the code default.
--
--   Same posture as the other MOBA tables: RLS on, no anon policies, only the
--   service-role client (used by our admin routes) can read/write.
--
-- Run in Supabase SQL Editor AFTER migration_moba.sql.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists moba_survey_content (
  -- Singleton: there is exactly one content row for the survey.
  id         smallint primary key default 1 check (id = 1),
  -- Sparse override map. Shape (all keys optional):
  --   {
  --     "questions":       { "MP1": { "text": "…", "options": { "1": "…", … } }, … },
  --     "priorityOptions": { "moba_positioning": "…", … },
  --     "openQuestions":   { "q20": "…", … },
  --     "segment":         { "text": "…", "minLabel": "…", "maxLabel": "…" }
  --   }
  content    jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

comment on table moba_survey_content is 'MOBA marketing survey — editable copy overrides (single row, service-role only)';

-- ── Row Level Security ────────────────────────────────────────────────────────
-- No permissive policies: anon/public denied, service-role bypasses RLS.
alter table moba_survey_content enable row level security;
