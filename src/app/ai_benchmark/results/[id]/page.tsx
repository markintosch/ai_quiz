// FILE: src/app/ai_benchmark/results/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { getContent, type Lang } from '@/products/ai_benchmark/data'

export const dynamic = 'force-dynamic'

// ── Mentor brand tokens ──────────────────────────────────────────────────────
const INK        = '#0F172A'
const ACCENT     = '#1D4ED8'
const WARM       = '#D97706'
const WARM_LIGHT = '#FEF3C7'
const BODY       = '#374151'
const MUTED      = '#94A3B8'
const BORDER     = '#E2E8F0'
const LIGHT      = '#F8FAFC'
const FONT       = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

const CALENDLY_INTAKE = 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'

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
  archetype:        string
  total_score:      number
  dimension_scores: Record<string, number>
  created_at:       string
}

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params:        { id: string }
  searchParams: { lang?: string }
}) {
  const lang = (['nl', 'en', 'fr', 'de'].includes(searchParams.lang || '') ? searchParams.lang : 'nl') as Lang
  const t    = getContent(lang)

  const { data, error } = await supabase
    .from('ai_benchmark_responses')
    .select('id, name, email, lang, role, archetype, total_score, dimension_scores, created_at')
    .eq('id', params.id)
    .single() as { data: ResultRow | null; error: unknown }

  if (error || !data) return notFound()

  const archetype = t.ARCHETYPES.find(a => a.id === data.archetype) || t.ARCHETYPES[0]

  const dims = t.DIMENSIONS.map(d => ({
    ...d,
    score: data.dimension_scores?.[d.id] ?? 0,
  }))

  const greetingName = data.name?.trim() || ''

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: INK, fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>

      {/* ── Nav ── */}
      <nav style={{ background: '#fff', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={`/ai_benchmark?lang=${lang}`} style={{ display: 'flex', alignItems: 'baseline', gap: 8, textDecoration: 'none' }}>
            <span style={{ color: INK, fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }}>
              {t.navName}
            </span>
            <span style={{ color: MUTED, fontSize: 13, fontWeight: 500 }}>
              {t.navTagline}
            </span>
          </Link>
        </div>
      </nav>

      {/* ── Hero / score ── */}
      <section style={{ background: LIGHT, padding: '64px 24px 56px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: WARM, background: WARM_LIGHT,
            padding: '5px 14px', borderRadius: 100, marginBottom: 22,
          }}>
            {t.resultsBadge}
          </span>

          <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 8, color: INK, letterSpacing: '-0.025em' }}>
            {greetingName ? `${greetingName}, ` : ''}je bent een <span style={{ color: ACCENT }}>{archetype.name}</span>.
          </h1>
          <p style={{ fontSize: 17, color: BODY, lineHeight: 1.6, marginBottom: 28, maxWidth: 600 }}>
            {archetype.identity} {t.resultsArchBody}
          </p>

          <div style={{
            background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14,
            padding: '28px 28px', display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
          }}>
            <div style={{ flex: '0 0 auto' }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: MUTED, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 4 }}>
                {t.resultsScoreLbl}
              </p>
              <p style={{ fontSize: 64, fontWeight: 900, color: ACCENT, lineHeight: 1, letterSpacing: '-0.03em' }}>
                {data.total_score}
                <span style={{ fontSize: 24, color: MUTED, fontWeight: 700 }}>/100</span>
              </p>
            </div>

            <div style={{ flex: '0 0 auto', fontSize: 56 }}>
              {archetype.emoji}
            </div>

            <div style={{ flex: '1 1 220px', minWidth: 220 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: MUTED, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 4 }}>
                {t.resultsArchTitle}
              </p>
              <p style={{ fontSize: 22, fontWeight: 900, color: INK, letterSpacing: '-0.01em' }}>
                {archetype.name}
              </p>
              <p style={{ fontSize: 13, color: BODY, marginTop: 4, lineHeight: 1.55 }}>
                {archetype.identity}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dimension breakdown ── */}
      <section style={{ background: '#fff', padding: '56px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: ACCENT, marginBottom: 6 }}>
            {t.resultsDimsTitle}
          </h2>
          <p style={{ fontSize: 22, fontWeight: 800, color: INK, marginBottom: 24, letterSpacing: '-0.01em' }}>
            6 dimensies, 0–100.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {dims.map(d => (
              <div key={d.id} style={{ background: LIGHT, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{d.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 900, color: ACCENT }}>{d.score}<span style={{ color: MUTED, fontSize: 11, fontWeight: 700 }}>/100</span></span>
                </div>
                <div style={{ height: 8, background: BORDER, borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: 8, width: `${d.score}%`, background: ACCENT, borderRadius: 100, transition: 'width 0.6s ease-out' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison placeholder ── */}
      <section style={{ background: WARM_LIGHT, padding: '48px 24px', borderTop: `1px solid ${WARM}33` }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: WARM, marginBottom: 6 }}>
            {t.resultsCompareTtl}
          </h2>
          <p style={{ fontSize: 18, color: INK, lineHeight: 1.6, fontWeight: 600, marginBottom: 0 }}>
            {t.resultsCompareBody}
          </p>
        </div>
      </section>

      {/* ── Share + Calendly ── */}
      <section style={{ background: INK, padding: '56px 24px', color: '#fff' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: WARM, marginBottom: 8 }}>
            {t.resultsShareTitle}
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: 24 }}>
            {t.resultsShareBody}
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              href={`/ai_benchmark?lang=${lang}`}
              style={{
                background: '#fff', color: INK, fontWeight: 700, fontSize: 14,
                padding: '12px 22px', borderRadius: 6, textDecoration: 'none',
              }}
            >
              ← Terug naar de benchmark
            </Link>
            <a
              href={CALENDLY_INTAKE}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'transparent', color: '#fff', fontWeight: 700, fontSize: 14,
                padding: '12px 22px', borderRadius: 6, textDecoration: 'none',
                border: `1.5px solid ${WARM}`,
              }}
            >
              {t.resultsCtaCalendly} →
            </a>
          </div>
        </div>
      </section>

      <footer style={{ background: '#000', padding: '24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '-0.01em' }}>
            {t.footerLine}
          </span>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            {t.reportLine}
          </p>
        </div>
      </footer>
    </div>
  )
}
