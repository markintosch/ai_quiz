// FILE: src/app/ai_benchmark/dashboard/page.tsx
// Public weekly-updated overview of the AI-benchmark research data.
// Indexable. Intended as a shareable / linkable artifact that funnels new
// respondents into /ai_benchmark/start.

import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import {
  computePublicDashboard, mockPublicDashboard, type DashboardData,
} from '@/products/ai_benchmark/public_dashboard'
import { SkillCurve }     from '@/components/ai_benchmark/SkillCurve'
import { MarketOverview } from '@/components/ai_benchmark/MarketOverview'
import { LiveCounter }    from '@/components/ai_benchmark/LiveCounter'
import { Tracker }        from '@/components/ai_benchmark/Tracker'

// Refresh once a day in production; mock fallback handles low-N case.
export const revalidate = 86400

const INK        = '#0F172A'
const ACCENT     = '#1D4ED8'
const WARM       = '#D97706'
const WARM_LIGHT = '#FEF3C7'
const BODY       = '#374151'
const MUTED      = '#94A3B8'
const BORDER     = '#E2E8F0'
const LIGHT      = '#F8FAFC'
const FONT       = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

const COMPARISON_THRESHOLD = 30

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const OG_BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://markdekock.com'

export const metadata = {
  title:       'State of AI in Marketing & Sales · research dashboard | Mark de Kock',
  description: 'Wekelijks geüpdatet onderzoeksdashboard. Hoe marketing- en sales-professionals AI gebruiken, welke tools, welke tijdwinst, welke blokkades. Gratis te bekijken. Doe zelf de benchmark in 6 minuten.',
  alternates:  { canonical: '/ai_benchmark/dashboard' },
  openGraph: {
    title: 'State of AI in Marketing & Sales, wekelijks geüpdatet',
    description: 'Onafhankelijk onderzoek door Mark de Kock. Heatmap, radar, archetype-verdeling, blokkades.',
    url:    `${OG_BASE}/ai_benchmark/dashboard`,
    type:   'website',
    images: [{
      url:    `${OG_BASE}/api/ai_benchmark/og?type=dashboard`,
      width:  1200,
      height: 630,
      alt:    'State of AI in Marketing & Sales — public research dashboard',
    }],
  },
  twitter: {
    card:  'summary_large_image',
    title: 'State of AI in Marketing & Sales',
    description: 'Onafhankelijk onderzoek door Mark de Kock. Wekelijks geüpdatet.',
    images: [`${OG_BASE}/api/ai_benchmark/og?type=dashboard`],
  },
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { preview?: string }
}) {
  const preview = searchParams.preview === '1'

  let data: DashboardData
  if (preview) {
    data = mockPublicDashboard()
  } else {
    const { data: rows } = await supabase
      .from('ai_benchmark_responses')
      .select('role, archetype, dimension_scores, answers, created_at')
      .order('created_at', { ascending: false })
      .limit(5000)
    const real = computePublicDashboard(rows ?? [])
    // Below threshold → fall back to mock so the public page is meaningful
    data = real.totalRespondents >= COMPARISON_THRESHOLD ? real : { ...mockPublicDashboard(), usingMock: true }
  }

  const updatedFmt = data.lastUpdated.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: LIGHT, color: INK, fontFamily: FONT }}>
      <Tracker event="dashboard_viewed" />
      {/* ── Nav ── */}
      <nav style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/ai_benchmark" style={{ display: 'flex', alignItems: 'baseline', gap: 8, textDecoration: 'none' }}>
            <span style={{ color: INK, fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }}>AI-benchmark</span>
            <span style={{ color: MUTED, fontSize: 13, fontWeight: 500 }}>· dashboard</span>
          </Link>
          <Link
            href="/ai_benchmark/start"
            style={{
              background: ACCENT, color: '#fff', fontWeight: 700, fontSize: 13,
              padding: '8px 16px', borderRadius: 6, textDecoration: 'none',
            }}
          >
            Doe de benchmark →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: '#fff', padding: '56px 24px 32px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: WARM, background: WARM_LIGHT,
              padding: '5px 14px', borderRadius: 100,
            }}>
              Wekelijks geüpdatet · onafhankelijk onderzoek
            </span>
            <LiveCounter total={data.totalRespondents} lang="nl" vague={data.usingMock} />
          </div>

          <h1 style={{ fontSize: 'clamp(30px, 4.8vw, 50px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16, color: INK, letterSpacing: '-0.025em', maxWidth: 880 }}>
            State of AI in <span style={{ color: ACCENT }}>marketing &amp; sales</span>
          </h1>
          <p style={{ fontSize: 17, color: BODY, lineHeight: 1.65, maxWidth: 720, marginBottom: 14 }}>
            Hoe marketing- en sales-professionals in BeNeLux écht met AI werken. Welke tools, welke tijdwinst, welke blokkades, welk archetype.
            Vrij in te zien, geen account nodig. Wil je weten waar je zelf staat?
            <Link href="/ai_benchmark/start" style={{ color: ACCENT, fontWeight: 700, marginLeft: 6 }}>Doe de benchmark in 6 minuten →</Link>
          </p>
          <p style={{ fontSize: 13, color: MUTED }}>
            Laatst geüpdatet: <strong style={{ color: INK }}>{updatedFmt}</strong>
            {data.usingMock && <span style={{ marginLeft: 8, color: WARM, fontWeight: 700 }}>· preview-data tot N≥{COMPARISON_THRESHOLD}</span>}
          </p>
        </div>
      </section>

      {/* ── Skill curve ── */}
      <section style={{ background: '#fff', padding: '40px 24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: ACCENT, marginBottom: 4 }}>
            De beweging in het veld
          </p>
          <p style={{ fontSize: 22, fontWeight: 800, color: INK, marginBottom: 6, letterSpacing: '-0.01em' }}>
            AI-vaardigheid steeg met <span style={{ color: ACCENT }}>{data.skillCurve.fieldShift > 0 ? '+' : ''}{data.skillCurve.fieldShift.toFixed(1)} niveaus</span> in 12 maanden.
          </p>
          <p style={{ fontSize: 13, color: BODY, marginBottom: 22, lineHeight: 1.6, maxWidth: 720 }}>
            Per moment terugkijkend (12 / 6 / 3 maanden geleden + nu), gemeten in zelf-ingeschat ervaringsniveau van Niet gebruikt tot Expert.
            De dataset is een doorsnee van marketing- en sales-professionals die de benchmark hebben ingevuld.
          </p>
          <SkillCurve curve={data.skillCurve} />
        </div>
      </section>

      {/* ── Market overview ── */}
      <section style={{ padding: '40px 24px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <MarketOverview data={data} />
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: INK, color: '#fff', padding: '52px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: WARM, marginBottom: 12 }}>
            Waar sta jij?
          </p>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, lineHeight: 1.2, marginBottom: 14, letterSpacing: '-0.02em' }}>
            Vergelijk je werkwijze met deze {data.totalRespondents.toLocaleString('nl-NL')} respondenten.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, maxWidth: 600, margin: '0 auto 28px' }}>
            6 minuten · 18 vragen · persoonlijk dashboard direct na invullen.
            Jouw antwoorden bouwen mee aan dit beeld voor de volgende lichting.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/ai_benchmark/start"
              style={{
                display: 'inline-block',
                background: ACCENT, color: '#fff', fontWeight: 700, fontSize: 16,
                padding: '14px 32px', borderRadius: 8, textDecoration: 'none',
                boxShadow: `0 4px 20px ${ACCENT}55`,
              }}
            >
              Start de benchmark →
            </Link>
            <a
              href="https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: 'transparent', color: '#fff', fontWeight: 700, fontSize: 16,
                padding: '14px 28px', borderRadius: 8, textDecoration: 'none',
                border: `1.5px solid ${WARM}`,
              }}
            >
              Of werk samen aan een AI-project →
            </a>
          </div>
        </div>
      </section>

      <footer style={{ background: '#000', padding: '24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '-0.01em' }}>
            Gehost door Mark de Kock · markdekock.com
          </span>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            Aggregaat-rapport: State of AI in Marketing &amp; Sales 2026
          </p>
        </div>
      </footer>
    </div>
  )
}
