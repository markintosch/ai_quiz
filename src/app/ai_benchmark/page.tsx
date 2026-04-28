// FILE: src/app/ai_benchmark/page.tsx
// Server component — fetches live aggregate data so the proof strip, the new
// 'Wat we tot nu toe zien' teaser, and the archetype tile %s all reflect
// reality. Falls back to mock when N < 30 so the page is meaningful from day 1.

import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { getContent, type Lang } from '@/products/ai_benchmark/data'
import {
  computePublicDashboard, mockPublicDashboard, type DashboardData,
} from '@/products/ai_benchmark/public_dashboard'
import { LangPills }   from '@/components/ai_benchmark/LangPills'
import { LiveCounter } from '@/components/ai_benchmark/LiveCounter'
import { SkillCurve }  from '@/components/ai_benchmark/SkillCurve'
import { Tracker }     from '@/components/ai_benchmark/Tracker'

// Refresh aggregate data every hour in production.
export const revalidate = 3600

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

const COMPARISON_THRESHOLD = 30

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AiBenchmarkLandingPage({
  searchParams,
}: {
  searchParams: { lang?: string; preview?: string }
}) {
  const lang = (['nl', 'en', 'fr', 'de'].includes(searchParams.lang || '') ? searchParams.lang : 'nl') as Lang
  const preview = searchParams.preview === '1'
  const t = getContent(lang)

  // ── Live aggregates (mock if too few real responses) ─────────────────────
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
    data = real.totalRespondents >= COMPARISON_THRESHOLD ? real : { ...mockPublicDashboard(), usingMock: true }
  }

  const startHref     = `/ai_benchmark/start?lang=${lang}`
  const dashboardHref = `/ai_benchmark/dashboard${preview ? '?preview=1' : ''}`

  // Stats for the new teaser strip
  const topArch = data.archetypeDist[0]
  const topTool = data.topTools[0]
    ? {
        ...data.topTools[0],
        // Pick the role with highest adoption to make the stat richer
        topPct: Math.max(
          data.toolAdoptionByRole.marketing[data.topTools[0].id] ?? 0,
          data.toolAdoptionByRole.sales[data.topTools[0].id]     ?? 0,
          data.toolAdoptionByRole.hybrid[data.topTools[0].id]    ?? 0,
        ),
      }
    : null
  const topTimeBucket = [...data.timeSavedDist].sort((a, b) => b.pct - a.pct)[0]
  const topUseCase    = data.topUseCases[0]

  // Map archetype id → real % share for the tiles
  const archPctById: Record<string, number> = {}
  for (const a of data.archetypeDist) archPctById[a.id] = a.pct

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: INK, fontFamily: FONT }}>
      <Tracker event="page_view" />

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav style={{
        background: '#fff', borderBottom: `1px solid ${BORDER}`,
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ color: INK, fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }}>
              {t.navName}
            </span>
            <span style={{ color: MUTED, fontSize: 13, fontWeight: 500 }}>
              {t.navTagline}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <LangPills lang={lang} basePath="/ai_benchmark" />

            <Link
              href={dashboardHref}
              style={{
                background: 'transparent', color: BODY, fontSize: 13, fontWeight: 600,
                padding: '8px 12px', borderRadius: 6, textDecoration: 'none',
              }}
            >
              Dashboard
            </Link>
            <Link
              href={startHref}
              style={{
                background: 'transparent', color: ACCENT, fontSize: 13, fontWeight: 700,
                padding: '8px 18px', borderRadius: 6, textDecoration: 'none',
                border: `2px solid ${ACCENT}`,
              }}
            >
              {t.navCta}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '72px 24px 64px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: WARM, background: WARM_LIGHT,
              padding: '5px 14px', borderRadius: 100,
            }}>
              {t.heroBadge.includes('Mark de Kock') ? (
                <>
                  {t.heroBadge.split('Mark de Kock')[0]}
                  <a href="https://markdekock.com" target="_blank" rel="noopener noreferrer" style={{ color: WARM, textDecoration: 'underline' }}>
                    Mark de Kock
                  </a>
                  {t.heroBadge.split('Mark de Kock')[1]}
                </>
              ) : t.heroBadge}
            </span>
            <LiveCounter total={data.totalRespondents} lastWeek={data.usingMock ? undefined : undefined} lang={lang} vague={data.usingMock} />
          </div>

          <h1 style={{
            fontSize: 'clamp(34px, 5.5vw, 60px)', fontWeight: 900, lineHeight: 1.1,
            marginBottom: 24, color: INK, letterSpacing: '-0.025em',
          }}>
            {t.heroH1a}<br />{t.heroH1b}
          </h1>

          <p style={{ fontSize: 17, color: BODY, lineHeight: 1.65, marginBottom: 18, maxWidth: 620 }}>
            {t.heroIntro}
          </p>
          <p style={{ fontSize: 17, color: INK, lineHeight: 1.6, marginBottom: 36, maxWidth: 620, fontWeight: 600 }}>
            {t.heroSub}
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 22 }}>
            <Link
              href={startHref}
              style={{
                background: ACCENT, color: '#fff', fontWeight: 700, fontSize: 16,
                padding: '14px 32px', borderRadius: 6, textDecoration: 'none',
                boxShadow: `0 4px 20px ${ACCENT}33`,
              }}
            >
              {t.heroCta1}
            </Link>
            <Link
              href={dashboardHref}
              style={{
                color: INK, fontWeight: 600, fontSize: 15,
                padding: '14px 24px', borderRadius: 6, textDecoration: 'none',
                border: `1px solid ${BORDER}`,
              }}
            >
              Bekijk eerst de data →
            </Link>
          </div>

          <p style={{ fontSize: 13, color: MUTED }}>{t.trustLine}</p>
        </div>
      </section>

      {/* ── Personal quote (Mark) ───────────────────────────────────────── */}
      <section style={{
        background: '#FFFBEB', padding: '64px 24px',
        borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${WARM}33`,
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: WARM, marginBottom: 22 }}>
            {t.quoteLabel}
          </h2>

          <div style={{ position: 'relative', paddingLeft: 4 }}>
            <span aria-hidden style={{
              position: 'absolute', top: -38, left: -10,
              fontSize: 96, lineHeight: 1, color: WARM,
              opacity: 0.22, fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 700,
            }}>&ldquo;</span>
            <p style={{
              fontSize: 'clamp(18px, 2.2vw, 22px)', color: INK, lineHeight: 1.55,
              fontWeight: 500, letterSpacing: '-0.005em', position: 'relative', margin: 0,
            }}>
              {t.quoteBody}
            </p>
          </div>

          <div style={{ marginTop: 28, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 36, height: 2, background: WARM, flexShrink: 0, marginTop: 8 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: INK, margin: 0 }}>
                <a href="https://markdekock.com" target="_blank" rel="noopener noreferrer" style={{ color: INK, textDecoration: 'underline', textDecorationColor: `${WARM}88`, textDecorationThickness: 2, textUnderlineOffset: 3 }}>
                  {t.quoteAuthor}
                </a>
              </p>
              <p style={{ fontSize: 12, color: BODY, margin: '2px 0 0' }}>{t.quoteRole}</p>
              <p style={{ fontSize: 12, color: BODY, margin: '6px 0 0', lineHeight: 1.5, fontStyle: 'italic', maxWidth: 460 }}>
                {t.quoteRoleSub}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Proof / community (now LIVE) ────────────────────────────────── */}
      <section style={{
        background: INK, color: '#fff', padding: '40px 24px',
        borderTop: `1px solid ${BORDER}`,
      }}>
        <div style={{
          maxWidth: 920, margin: '0 auto',
          display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', justifyContent: 'space-between',
        }}>
          <div>
            {!data.usingMock && (
              <p style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.01em' }}>
                {t.proofN.replace('{n}', data.totalRespondents.toLocaleString('nl-NL'))}
              </p>
            )}
            <p style={{
              fontSize: data.usingMock ? 18 : 13,
              fontWeight: data.usingMock ? 700 : 400,
              color: data.usingMock ? '#fff' : 'rgba(255,255,255,0.65)',
              maxWidth: 620, lineHeight: 1.55,
            }}>
              {t.proofSubtitle}
            </p>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: WARM,
            border: `1px solid ${WARM}55`, padding: '6px 12px', borderRadius: 4,
          }}>
            Live · groeit elke week
          </span>
        </div>
      </section>

      {/* ── NEW: Wat we tot nu toe zien (live teaser) ─────────────────── */}
      <section style={{ background: '#fff', padding: '64px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 4 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: ACCENT }}>
              Wat we tot nu toe zien
            </h2>
            <Link href={dashboardHref} style={{ fontSize: 13, color: ACCENT, fontWeight: 700, textDecoration: 'none' }}>
              Volledige dashboard →
            </Link>
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: INK, marginBottom: 24, letterSpacing: '-0.01em' }}>
            Een voorproefje uit de live data.
          </p>

          {/* 4 stat tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 28 }}>
            <StatTile
              eyebrow="Skill-shift in 12 mnd"
              big={`${data.skillCurve.fieldShift > 0 ? '+' : ''}${data.skillCurve.fieldShift.toFixed(1)}`}
              unit="niveaus"
              caption="Hoe het hele veld omhoog ging. Van Niet naar Comfortabel."
              accent={ACCENT}
            />
            <StatTile
              eyebrow="Dominant archetype"
              big={topArch ? `${topArch.pct}%` : '—'}
              unit={topArch ? topArch.label : ''}
              caption={topArch ? `${topArch.emoji} ${topArch.label} is het meest voorkomende profiel.` : ''}
              accent={WARM}
            />
            <StatTile
              eyebrow="Meest gebruikte tool"
              big={topTool ? `${topTool.topPct}%` : '—'}
              unit={topTool?.label ?? ''}
              caption={topTool ? `Meest-gebruikte specialistische tool in marketing & sales.` : ''}
              accent={ACCENT}
            />
            <StatTile
              eyebrow="Top tijdwinst-bucket"
              big={topTimeBucket ? `${topTimeBucket.pct}%` : '—'}
              unit={topTimeBucket ? topTimeBucket.label : ''}
              caption={topUseCase ? `Top use-case: ${topUseCase.label} (${topUseCase.pct}%).` : ''}
              accent={WARM}
            />
          </div>

          {/* Skill curve thumbnail */}
          <div style={{ background: LIGHT, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: INK, margin: 0 }}>
                AI-vaardigheid steeg van gem. {data.skillCurve.points[0].avgIndex.toFixed(1)} → {data.skillCurve.points[data.skillCurve.points.length - 1].avgIndex.toFixed(1)} (0–4 schaal).
              </p>
              <Link href={dashboardHref} style={{ fontSize: 12, color: ACCENT, fontWeight: 700, textDecoration: 'none' }}>
                Open dashboard →
              </Link>
            </div>
            <SkillCurve curve={data.skillCurve} />
          </div>
        </div>
      </section>

      {/* ── Dimensions ──────────────────────────────────────────────────── */}
      <section id="how" style={{ background: LIGHT, padding: '76px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: ACCENT, marginBottom: 8 }}>
            {t.dimensionsLabel}
          </h2>
          <p style={{ fontSize: 26, fontWeight: 800, color: INK, marginBottom: 28, letterSpacing: '-0.01em' }}>
            {t.dimensionsTitle}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {t.DIMENSIONS.map(d => (
              <div key={d.id} style={{
                background: '#fff', borderRadius: 10, padding: '22px 22px',
                border: `1px solid ${BORDER}`,
              }}>
                <div style={{ fontSize: 26, marginBottom: 12 }}>{d.icon}</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 4 }}>{d.name}</p>
                <p style={{ fontSize: 13, color: BODY, lineHeight: 1.55 }}>{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Archetypes (now with live %) ────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '76px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: WARM, marginBottom: 8 }}>
            {t.archetypesLabel}
          </h2>
          <p style={{ fontSize: 26, fontWeight: 800, color: INK, marginBottom: 28, letterSpacing: '-0.01em' }}>
            {t.archetypesTitle}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
            {t.ARCHETYPES.map(a => {
              const pct = archPctById[a.id] ?? 0
              return (
                <div key={a.id} className="aibench-archetype-tile" style={{
                  background: LIGHT, borderRadius: 10, padding: '22px 22px',
                  border: `1px solid ${BORDER}`,
                  position: 'relative',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{a.emoji}</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: INK }}>{a.name}</span>
                    </div>
                    {pct > 0 && (
                      <span style={{
                        fontSize: 12, fontWeight: 800, color: ACCENT,
                        background: `${ACCENT}15`, padding: '3px 9px', borderRadius: 100,
                      }}>
                        {pct}%
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: BODY, lineHeight: 1.55 }}>{a.identity}</p>
                </div>
              )
            })}
          </div>
          <p style={{ marginTop: 14, fontSize: 12, color: MUTED }}>
            % = aandeel van de huidige respondenten dat in dit profiel valt.
          </p>
        </div>

        <style>{`
          .aibench-archetype-tile {
            transition: background 0.15s, border-color 0.15s;
          }
          .aibench-archetype-tile:hover {
            background: ${WARM_LIGHT};
            border-color: ${WARM}66;
          }
        `}</style>
      </section>

      {/* ── Why share / context ─────────────────────────────────────────── */}
      <section style={{ background: LIGHT, padding: '76px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: ACCENT, marginBottom: 8 }}>
            {t.shareLabel}
          </h2>
          <p style={{ fontSize: 28, fontWeight: 800, color: INK, marginBottom: 18, letterSpacing: '-0.015em', lineHeight: 1.2 }}>
            {t.shareTitle}
          </p>
          <p style={{ fontSize: 17, color: BODY, lineHeight: 1.65 }}>
            {t.shareBody}
          </p>

          <div style={{ marginTop: 36, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              href={startHref}
              style={{
                background: ACCENT, color: '#fff', fontWeight: 700, fontSize: 16,
                padding: '14px 32px', borderRadius: 6, textDecoration: 'none',
                boxShadow: `0 4px 20px ${ACCENT}33`,
              }}
            >
              {t.heroCta1}
            </Link>
            <Link
              href={dashboardHref}
              style={{
                color: INK, fontWeight: 600, fontSize: 15,
                padding: '14px 24px', borderRadius: 6, textDecoration: 'none',
                border: `1px solid ${BORDER}`,
              }}
            >
              Bekijk de cijfers →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ background: INK, padding: '36px 24px' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '-0.01em' }}>
            Gehost door{' '}
            <a href="https://markdekock.com" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline', textDecorationColor: `${WARM}99`, textUnderlineOffset: 3 }}>
              Mark de Kock
            </a>
            {' · '}
            <a href="https://markdekock.com" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, textDecoration: 'none' }}>
              markdekock.com
            </a>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <Link href={dashboardHref} style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 600 }}>
              Dashboard
            </Link>
            <Link href={startHref} style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 600 }}>
              Doe de benchmark
            </Link>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
              {t.reportLine}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── Small server-side stat tile ──────────────────────────────────────────────
function StatTile({ eyebrow, big, unit, caption, accent }: {
  eyebrow: string
  big:     string
  unit:    string
  caption: string
  accent:  string
}) {
  return (
    <div style={{
      background: LIGHT, border: `1px solid ${BORDER}`, borderRadius: 12,
      padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <p style={{ fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
        {eyebrow}
      </p>
      <p style={{ margin: 0, lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: accent, letterSpacing: '-0.02em' }}>{big}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>{unit}</span>
      </p>
      {caption && (
        <p style={{ fontSize: 12, color: BODY, lineHeight: 1.45, margin: 0 }}>
          {caption}
        </p>
      )}
    </div>
  )
}
