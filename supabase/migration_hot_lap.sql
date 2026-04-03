-- Hot Lap — lap time leaderboard table
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS hot_lap_times (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  total_ms   INTEGER NOT NULL,
  lap_time   TEXT NOT NULL,          -- formatted "M:SS.mmm"
  sectors    JSONB NOT NULL,         -- array of SectorResult
  questions  JSONB,                  -- optional snapshot of the 10 questions played
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hot_lap_times_total_ms   ON hot_lap_times (total_ms ASC);
CREATE INDEX IF NOT EXISTS idx_hot_lap_times_email      ON hot_lap_times (email);

ALTER TABLE hot_lap_times ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role full access" ON hot_lap_times
  FOR ALL USING (auth.role() = 'service_role');
