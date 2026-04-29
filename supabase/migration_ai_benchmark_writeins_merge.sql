-- Adds a merge_target column so admin "Merge into existing option"
-- can record which canonical Q2 option the write-in was merged into.

ALTER TABLE ai_benchmark_writeins
  ADD COLUMN IF NOT EXISTS merge_target TEXT;

CREATE INDEX IF NOT EXISTS ai_benchmark_writeins_merge_target_idx
  ON ai_benchmark_writeins (merge_target);
