// FILE: src/app/maritime_scan/results/[id]/page.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Maritime Compliance Readiness Scan — results page (server component).
// Pulls the row from maritime_scan_responses, renders score + posture +
// dimension breakdown + tier-aware acquisition CTA.

import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { getContent, pickLang, type Lang } from '@/products/maritime_scan/data'

export const dynamic = 'force-dynamic'

// Brand tokens
const NAVY        = '#0A2540'
const NAVY_DEEP   = '#061A30'
const SEA         = '#0EA5E9'
const SEA_LIGHT   = '#E0F2FE'
const AMBER       = '#F59E0B'
const AMBER_LIGHT = '#FEF3C7'
const INK         = '#0F172A'
const BODY        = '#475569'
const MUTED       = '#94A3B8'
const BORDER      = '#E2E8F0'
const LIGHT       = '#F8FAFC'
const FONT        = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

// Acquisition target (single point of truth — swap when a real form lands)
const CONTACT_HREF = 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ResultRow {
  id:               string
  name:             string | null
  email:            string
  lang:             string
  role:             string
  vessel_type:      string | null
  fleet_size:       string | null
  region:           string | null
  flag_count:       string | null
  posture:          string
  total_score:      number
  dimension_scores: { id: string; label: string; icon: string; raw: number; count: number }[]
  created_at:       string
}

function getBaseUrl(): string {
  try {
    const h = headers()
    const host = h.get('host')
    const proto = h.get('x-forwarded-proto') || 'https'
    if (host) return `${proto}://${host}`
  } catch { /* */ }
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://aiquiz.brandpwrdmedia.nl'
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const BASE = getBaseUrl()
  return {
    title: 'Maritime Compliance Scan — resultaat',
    robots: { index: false, follow: false },
    openGraph: {
      title:       'Mijn Maritime Compliance score',
      description: 'Onafhankelijke scan voor shipping companies — PSC-readiness, multi-flag, data-protection, cycle-time.',
      url:         `${BASE}/maritime_scan/results/${params.id}`,
      type:        'article',
    },
  }
}

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params:        { id: string }
  searchParams: { lang?: string }
}) {
  const lang = pickLang(searchParams.lang)
  const t    = getContent(lang)

  const { data, error } = await supabase
    .from('maritime_scan_responses')
    .select('id, name, email, lang, role, vessel_type, fleet_size, region, flag_count, posture, total_score, dimension_scores, created_at')
    .eq('id', params.id)
    .single() as { data: ResultRow | null; error: unknown }

  if (error || !data) return notFound()

  const greetingName = data.name?.trim() || ''
  const posture = t.POSTURES.find(p => p.id === data.posture) ?? t.POSTURES[0]

  // Score-tier for acquisition CTA: low (<40) / mid (40-69) / high (70+)
  const tier: 'low' | 'mid' | 'high' = data.total_score < 40 ? 'low' : data.total_score < 70 ? 'mid' : 'high'
  const tierCopy = tier === 'low'
    ? { eyebrow: t.resultsCtaLowEyebrow,  heading: t.resultsCtaLowHeading,  body: t.resultsCtaLowBody,  button: t.resultsCtaLowButton  }
    : tier === 'mid'
    ? { eyebrow: t.resultsCtaMidEyebrow,  heading: t.resultsCtaMidHeading,  body: t.resultsCtaMidBody,  button: t.resultsCtaMidButton  }
    : { eyebrow: t.resultsCtaHighEyebrow, heading: t.resultsCtaHighHeading, body: t.resultsCtaHighBody, button: t.resultsCtaHighButton }

  // Find the role label (translated) for the result-header context
  const roleDef = t.ROLES.find(r => r.id === data.role)

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: INK, fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>

      {/* ── Nav ── */}
      <nav style={{ background: '#fff', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={`/maritime_scan?lang=${lang}`} style={{ display: 'flex', alignItems: 'baseline', gap: 8, textDecoration: 'none' }}>
            <span style={{ color: NAVY, fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }}>{t.navName}</span>
            <span style={{ color: MUTED, fontSize: 13, fontWeight: 500 }}>{t.navTagline}</span>
          </Link>
        </div>
      </nav>

      {/* ── Hero / score ── */}
      <section style={{ background: LIGHT, padding: '48px 24px 56px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 800,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: AMBER, background: AMBER_LIGHT,
            padding: '5px 14px', borderRadius: 100, marginBottom: 18,
          }}>
            {t.resultsBadge}
            {roleDef && <span style={{ color: MUTED, fontWeight: 700 }}> · {roleDef.name}</span>}
          </span>

          <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 12, color: NAVY, letterSpacing: '-0.025em' }}>
            {greetingName ? `${greetingName}, ` : ''}{posture.headline}
          </h1>
          <p style={{ fontSize: 16, color: BODY, lineHeight: 1.7, marginBottom: 28, maxWidth: 640 }}>
            {posture.body}
          </p>

          <div style={{
            background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14,
            padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
          }}>
            <div style={{ flex: '0 0 auto' }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: MUTED, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 4 }}>
                {t.resultsScoreLbl}
              </p>
              <p style={{ fontSize: 56, fontWeight: 900, color: SEA, lineHeight: 1, letterSpacing: '-0.03em' }}>
                {data.total_score}<span style={{ fontSize: 22, color: MUTED, fontWeight: 700 }}>/100</span>
              </p>
            </div>
            <div style={{ flex: '1 1 220px', minWidth: 220 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: MUTED, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 4 }}>
                {t.resultsPostureLbl}
              </p>
              <p style={{ fontSize: 22, fontWeight: 900, color: NAVY, letterSpacing: '-0.01em' }}>{posture.name}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dimension breakdown ── */}
      <section style={{ background: '#fff', padding: '56px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: SEA, marginBottom: 6 }}>
            {t.resultsDimsTitle}
          </p>
          <p style={{ fontSize: 22, fontWeight: 800, color: NAVY, marginBottom: 24, letterSpacing: '-0.01em' }}>
            {t.resultsDimsHeadline}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.dimension_scores
              .slice()
              .sort((a, b) => a.raw - b.raw)  // weakest first — directs attention
              .map(d => (
                <div key={d.id} style={{ background: LIGHT, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{d.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{d.label}</span>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 900, color: d.raw < 40 ? AMBER : d.raw < 70 ? SEA : '#10B981' }}>
                      {d.raw}<span style={{ color: MUTED, fontSize: 11, fontWeight: 700 }}>/100</span>
                    </span>
                  </div>
                  <div style={{ height: 8, background: BORDER, borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{
                      height: 8, width: `${d.raw}%`,
                      background: d.raw < 40 ? AMBER : d.raw < 70 ? SEA : '#10B981',
                      borderRadius: 100, transition: 'width 0.6s ease-out',
                    }} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ── Tiered acquisition CTA ── */}
      <section style={{ background: NAVY_DEEP, color: '#fff', padding: '64px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: SEA_LIGHT, marginBottom: 12 }}>
            {tierCopy.eyebrow}
          </p>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.015em' }}>
            {tierCopy.heading}
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, marginBottom: 24 }}>
            {tierCopy.body}
          </p>
          <a
            href={CONTACT_HREF}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: SEA, color: '#fff', fontWeight: 700, fontSize: 15,
              padding: '13px 26px', borderRadius: 8, textDecoration: 'none',
              boxShadow: `0 8px 24px ${SEA}55`,
            }}
          >
            {tierCopy.button}
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: NAVY, padding: '24px', marginTop: 'auto' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <Link href={`/maritime_scan?lang=${lang}`} style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
            {t.resultsBackLink}
          </Link>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0 }}>{t.reportLine}</p>
        </div>
      </footer>
    </div>
  )
}
