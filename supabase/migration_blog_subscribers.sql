-- ─────────────────────────────────────────────────────────────────────────────
-- migration_blog_subscribers.sql
-- Blog newsletter subscribers — double opt-in (AVG/GDPR compliant).
--
-- Flow:
-- 1. Bezoeker vult e-mail in op /blog form, vinkt AVG-vakje aan, submit.
-- 2. /api/blog/subscribe maakt rij aan met confirmed=false + random confirm_token.
-- 3. Resend stuurt bevestigingsmail met /api/blog/confirm?token=...
-- 4. Klik → confirmed=true + confirm_token gewist (one-time).
-- 5. Iedere mail bevat ?token=<unsubscribe_token> link → /api/blog/unsubscribe.
-- 6. Klik → unsubscribed_at gevuld (we BEHOUDEN de rij voor audit, maar
--    sturen geen mails meer; suppression-list is gewoon "WHERE unsubscribed_at IS NULL").
--
-- AVG-bookkeeping per rij:
--   - consent_at        : timestamp van het AVG-vinkje aanvinken
--   - consent_text_hash : SHA-256 van de exact getoonde consent-tekst
--                         (zodat we later kunnen aantonen WAT iemand heeft aangevinkt)
--   - source_ip         : voor anti-abuse audit
--
-- Toegang:
--   - RLS on. Geen anon SELECT/INSERT — alle schrijfacties via service-role
--     in /api/blog/* routes (anders kan iemand de mailing-lijst dumpen).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS blog_subscribers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT NOT NULL,
  -- Locale die de bezoeker had toen ze opgaven (voor toekomstige per-taal mailings).
  locale              TEXT NOT NULL DEFAULT 'nl' CHECK (locale IN ('nl','en','de')),
  -- Double opt-in
  confirmed           BOOLEAN NOT NULL DEFAULT FALSE,
  confirm_token       TEXT,                            -- random hex; NULL na bevestiging
  confirmed_at        TIMESTAMPTZ,
  -- Permanent unsubscribe-token (in iedere mailing-link). Wordt nooit hergebruikt.
  unsubscribe_token   TEXT NOT NULL,
  unsubscribed_at     TIMESTAMPTZ,
  -- Consent-bewijslast (we slaan de letterlijke getoonde AVG-tekst op
  -- zodat we later precies kunnen reproduceren waarmee iemand akkoord ging)
  consent_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consent_text        TEXT,
  source_ip           TEXT,
  -- Optioneel: welke post triggerde de signup?
  source_post_id      UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
  source_path         TEXT,                            -- '/blog' of '/blog/<slug>'
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Een e-mailadres mag maar één rij hebben (case-insensitive via LOWER index hieronder).
  -- We zetten geen UNIQUE op `email` direct: dan kan iemand "MARK@..." en "mark@..."
  -- als twee rijen registreren. We doen het via een functional unique index.
  CHECK (position('@' in email) > 1)
);

-- Case-insensitive uniek e-mailadres
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_subscribers_email_lower
  ON blog_subscribers (LOWER(email));

-- Token-lookups moeten razendsnel zijn (worden gebruikt in confirm + unsubscribe).
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_confirm_token
  ON blog_subscribers (confirm_token) WHERE confirm_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_unsubscribe_token
  ON blog_subscribers (unsubscribe_token);

-- Voor admin-pagina sortering
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_created_at
  ON blog_subscribers (created_at DESC);

-- updated_at trigger (zelfde patroon als blog_posts)
CREATE OR REPLACE FUNCTION blog_subscribers_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_blog_subscribers_updated_at ON blog_subscribers;
CREATE TRIGGER trg_blog_subscribers_updated_at
  BEFORE UPDATE ON blog_subscribers
  FOR EACH ROW EXECUTE FUNCTION blog_subscribers_set_updated_at();

ALTER TABLE blog_subscribers ENABLE ROW LEVEL SECURITY;

-- ── RLS: geen publieke toegang ──────────────────────────────────────────────
-- Anon role mag NIETS. Alle reads/writes via service-role in /api/blog/* routes.
-- (Dit voorkomt dat iemand met de anon key de mailing-lijst kan exporten.)
-- Geen policies aanmaken = anon krijgt 0 rijen / kan niets schrijven.

-- ── Verify ────────────────────────────────────────────────────────────────
-- SELECT rowsecurity FROM pg_tables WHERE tablename = 'blog_subscribers';
-- → moet true zijn.
