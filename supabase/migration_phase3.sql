-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 3 migration — CRM layer: event participation + email log
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Safe to run multiple times (uses IF NOT EXISTS / CREATE TABLE IF NOT EXISTS)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. event_participations ───────────────────────────────────────────────────
-- Tracks which training events a respondent attended or pre-registered for.
-- event_slug is a stable identifier (e.g. 'marketeers-june-2025') that maps
-- to a Calendly/Tally event — no events table needed in Phase 3.

CREATE TABLE IF NOT EXISTS event_participations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  respondent_id       UUID NOT NULL REFERENCES respondents(id) ON DELETE CASCADE,
  event_slug          TEXT NOT NULL,   -- stable id, e.g. 'marketeers-june-2025'
  event_name          TEXT NOT NULL,   -- human label, e.g. 'AI voor Marketeers — Juni 2025'
  event_date          DATE,            -- null = date not yet confirmed (pre-registration)
  participation_type  TEXT NOT NULL DEFAULT 'attendee',
                                       -- 'attendee' | 'pre_registered' | 'no_show'
  notes               TEXT,            -- optional trainer note per participant
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT event_participations_type_check
    CHECK (participation_type IN ('attendee', 'pre_registered', 'no_show'))
);

CREATE INDEX IF NOT EXISTS event_participations_respondent_idx
  ON event_participations (respondent_id);

CREATE INDEX IF NOT EXISTS event_participations_event_slug_idx
  ON event_participations (event_slug);

-- ── 2. email_log ──────────────────────────────────────────────────────────────
-- Append-only log of every email sent to a respondent.
-- Written automatically by sender.ts after every successful Resend call.
-- Gives full visibility per contact: what they received and when.

CREATE TABLE IF NOT EXISTS email_log (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  respondent_id  UUID REFERENCES respondents(id) ON DELETE SET NULL,
                 -- nullable: admin emails have no respondent_id
  email_type     TEXT NOT NULL,
                 -- 'quiz_summary' | 'admin_notification' | 'referral_invite'
                 -- | 'company_report' | 'training_confirmation'
                 -- | 'training_reminder' | 'training_followup'
  subject        TEXT,
  to_email       TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'sent',
                 -- 'sent' | 'failed' | 'bounced'
  error_message  TEXT,            -- populated on failure
  sent_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT email_log_status_check
    CHECK (status IN ('sent', 'failed', 'bounced'))
);

CREATE INDEX IF NOT EXISTS email_log_respondent_idx
  ON email_log (respondent_id);

CREATE INDEX IF NOT EXISTS email_log_sent_at_idx
  ON email_log (sent_at DESC);

CREATE INDEX IF NOT EXISTS email_log_email_type_idx
  ON email_log (email_type);

-- ── 3. RLS policies ───────────────────────────────────────────────────────────
-- Both tables: service role can read/write; anon role has no access.

ALTER TABLE event_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log             ENABLE ROW LEVEL SECURITY;

-- Service role bypass (used by API routes via createServiceClient)
-- DROP first so this script is safe to re-run
DROP POLICY IF EXISTS "service role full access — event_participations" ON event_participations;
CREATE POLICY "service role full access — event_participations"
  ON event_participations FOR ALL
  TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service role full access — email_log" ON email_log;
CREATE POLICY "service role full access — email_log"
  ON email_log FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- ── Done ──────────────────────────────────────────────────────────────────────
-- After running:
--   1. Verify both tables appear in Table Editor
--   2. Deploy updated sender.ts which writes to email_log after every send
--   3. Use Supabase dashboard to manually insert event_participations records
--      when attendees are confirmed for a training event
