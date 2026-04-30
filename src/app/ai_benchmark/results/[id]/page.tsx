// FILE: src/app/ai_benchmark/results/[id]/page.tsx
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { getContent, getQuestions, pickLang, type Lang, type Role, type Question } from '@/products/ai_benchmark/data'
import {
  computeAggregates, mockAggregates, userSelectedIds, type QuestionAggregate,
  computeSkillCurve, mockSkillCurve, userSkillShift, SKILL_LEVELS,
  distinctiveInsights, gapInsights, type Insight,
} from '@/products/ai_benchmark/aggregates'
import { SkillCurve }     from '@/components/ai_benchmark/SkillCurve'
import { InsightStrip }   from '@/components/ai_benchmark/InsightStrip'
import { LiveCounter }    from '@/components/ai_benchmark/LiveCounter'
import { ShareCard }      from '@/components/ai_benchmark/ShareCard'
import { MarketOverview } from '@/components/ai_benchmark/MarketOverview'
import { Tracker }        from '@/components/ai_benchmark/Tracker'
import {
  computePublicDashboard, mockPublicDashboard, type DashboardData,
} from '@/products/ai_benchmark/public_dashboard'

export const dynamic = 'force-dynamic'

function getBaseUrl(): string {
  try {
    const h = headers()
    const host = h.get('host')
    const proto = h.get('x-forwarded-proto') || 'https'
    if (host) return `${proto}://${host}`
  } catch { /* headers() unavailable in some build contexts */ }
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://markdekock.com'
}

// Per-result metadata so social shares pull the dynamic archetype card.
// Page itself is noindex (set in /ai_benchmark/results/layout.tsx); this
// only ensures share scrapers see the right preview.
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const BASE = getBaseUrl()
  const ogUrl = `${BASE}/api/ai_benchmark/og?id=${params.id}`
  return {
    openGraph: {
      title:       'Mijn AI-benchmark resultaat',
      description: 'Mijn archetype + score in de AI-benchmark voor marketing & sales.',
      url:         `${BASE}/ai_benchmark/results/${params.id}`,
      type:        'article',
      images: [{ url: ogUrl, width: 1200, height: 630, alt: 'AI-benchmark resultaat' }],
    },
    twitter: {
      card:  'summary_large_image',
      title: 'Mijn AI-benchmark resultaat',
      description: 'Mijn archetype + score in de AI-benchmark voor marketing & sales.',
      images: [ogUrl],
    },
  }
}

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
// Single point of truth for the acquisition-funnel destination. When markdekock.com
// gains a real #contact anchor or contact form, swap this to that URL.
const CONTACT_HREF = CALENDLY_INTAKE
const THECREW_HREF = 'https://markdekock.com/thecrew/nl'

// Score band cutoffs (0-100). Tweak here if the field saturates higher.
function getScoreTier(score: number): 'low' | 'mid' | 'high' {
  if (score < 40) return 'low'
  if (score < 70) return 'mid'
  return 'high'
}

// ── Acquisition copy (per locale; FR/DE fall back to NL) ────────────────────
type AcqCopy = {
  // Tiered primary CTA (one of three based on score)
  tier: Record<'low' | 'mid' | 'high', { eyebrow: string; headline: string; sub: string; button: string }>
  // The Crew teaser
  crewLabel:    string
  crewBody:     string
  crewLink:     string
  // Three entry-point cards
  threeWaysLabel:    string
  threeWaysHeadline: string
  cards: Array<{ title: string; body: string; cta: string }>
  // Reframed share section
  shareEyebrow: string
  shareHeading: string
  shareBody:    string
}

const ACQUISITION_COPY_NL: AcqCopy = {
  tier: {
    low: {
      eyebrow:  'Volgende stap',
      headline: 'Je organisatie staat aan het begin. Dat is een kans.',
      sub:      '45 minuten. We laten zien waar de snelste winst zit voor jouw situatie.',
      button:   'Plan een AI-quickscan sessie →',
    },
    mid: {
      eyebrow:  'Volgende stap',
      headline: 'Je hebt de basis. Nu wordt het interessant.',
      sub:      'Eén team, één campagne, meetbare resultaten. Zie wat AI oplevert voordat je opschaalt.',
      button:   'Start een 4-weken pilot →',
    },
    high: {
      eyebrow:  'Volgende stap',
      headline: 'Je bent verder dan de meeste. Tijd om te versnellen.',
      sub:      'The Crew structureel ingebed in je workflow. Op maat ingericht voor jouw operatie.',
      button:   'Bespreek volledige AI-implementatie →',
    },
  },
  crewLabel: 'Wat als',
  crewBody:  'Wat als je deze score structureel kon verbeteren? The Crew is een AI-marketing systeem van 10 agents die dagelijks je marketing versterken.',
  crewLink:  'Bekijk hoe The Crew werkt →',
  threeWaysLabel:    'Drie manieren om te starten',
  threeWaysHeadline: 'Kies de instap die past bij waar je nu staat.',
  cards: [
    {
      title: 'AI-scan → ontdek je kansen',
      body:  'Je hebt ’m net gedaan. Deel je resultaten en krijg een persoonlijke analyse.',
      cta:   'Bespreek mijn resultaat →',
    },
    {
      title: 'Pilot-project → bewijs in 4 weken',
      body:  'Eén campagne, één team, meetbare resultaten.',
      cta:   'Start een pilot →',
    },
    {
      title: 'Volledige implementatie → AI in je operatie',
      body:  'The Crew structureel ingebed in je marketing- of bureauworkflow.',
      cta:   'Plan een implementatiegesprek →',
    },
  ],
  shareEyebrow: 'Deel met je team',
  shareHeading: 'Laat je team ook de scan doen.',
  shareBody:    'Zo weet je waar jullie als organisatie staan voordat je aan een AI-project begint. Eén beeld, gedeelde prioriteiten.',
}

const ACQUISITION_COPY_EN: AcqCopy = {
  tier: {
    low: {
      eyebrow:  'Next step',
      headline: 'Your organisation is at the start. That is an opportunity.',
      sub:      '45 minutes. We show you where the fastest win is for your situation.',
      button:   'Book an AI quick-scan session →',
    },
    mid: {
      eyebrow:  'Next step',
      headline: 'You have the basics. Now it gets interesting.',
      sub:      'One team, one campaign, measurable results. See what AI delivers before you scale.',
      button:   'Start a 4-week pilot →',
    },
    high: {
      eyebrow:  'Next step',
      headline: "You're ahead of most. Time to accelerate.",
      sub:      'The Crew embedded in your workflow. Tailored to your operation.',
      button:   'Discuss full AI implementation →',
    },
  },
  crewLabel: 'What if',
  crewBody:  'What if you could improve this score structurally? The Crew is an AI marketing system of 10 agents that strengthen your marketing daily.',
  crewLink:  'See how The Crew works →',
  threeWaysLabel:    'Three ways to start',
  threeWaysHeadline: 'Pick the entry point that fits where you are.',
  cards: [
    {
      title: 'AI-scan → discover your opportunities',
      body:  'You just did it. Share your results and get a personal analysis.',
      cta:   'Discuss my result →',
    },
    {
      title: 'Pilot project → proof in 4 weeks',
      body:  'One campaign, one team, measurable results.',
      cta:   'Start a pilot →',
    },
    {
      title: 'Full implementation → AI in your operation',
      body:  'The Crew embedded in your marketing or agency workflow.',
      cta:   'Plan an implementation call →',
    },
  ],
  shareEyebrow: 'Share with your team',
  shareHeading: 'Let your team take the scan too.',
  shareBody:    'So you know where you stand as an organisation before starting an AI project. One picture, shared priorities.',
}

function getAcqCopy(lang: Lang): AcqCopy {
  return lang === 'en' ? ACQUISITION_COPY_EN : ACQUISITION_COPY_NL
}

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
  industry:         string | null
  company_size:     string | null
  region:           string | null
  archetype:        string
  total_score:      number
  dimension_scores: Record<string, number>
  answers:          Record<string, unknown>
  created_at:       string
}

const COMPARISON_THRESHOLD = 30

type Segment = 'all' | 'role' | 'industry' | 'size' | 'region'

// Segment labels are now pulled from the lang content per request render.

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params:        { id: string }
  searchParams: { lang?: string; preview?: string; segment?: string }
}) {
  const lang    = pickLang(searchParams.lang)
  const t       = getContent(lang)
  const preview = searchParams.preview === '1'
  const segment = (['all', 'role', 'industry', 'size', 'region'].includes(searchParams.segment || '')
    ? searchParams.segment
    : 'all') as Segment

  const { data, error } = await supabase
    .from('ai_benchmark_responses')
    .select('id, name, email, lang, role, industry, company_size, region, archetype, total_score, dimension_scores, answers, created_at')
    .eq('id', params.id)
    .single() as { data: ResultRow | null; error: unknown }

  if (error || !data) return notFound()

  // ── Peer aggregates: real (filtered by segment) or mocked when ?preview=1 ─
  const allQuestions   = getQuestions(data.role as Role, lang)
  const compareableQs  = allQuestions.filter(q => q.type !== 'matrix')

  let aggregates: Record<string, QuestionAggregate>
  let segmentN  = 0
  let usingMock = false

  if (preview) {
    aggregates = mockAggregates(compareableQs, /*seed*/ 42, /*N*/ 247)
    segmentN   = 247
    usingMock  = true
  } else {
    let q = supabase
      .from('ai_benchmark_responses')
      .select('role, answers, industry, company_size, region')
      .neq('id', data.id) // exclude the respondent themselves
      .limit(2000)

    if (segment === 'role'     && data.role)         q = q.eq('role',         data.role)
    if (segment === 'industry' && data.industry)     q = q.eq('industry',     data.industry)
    if (segment === 'size'     && data.company_size) q = q.eq('company_size', data.company_size)
    if (segment === 'region'   && data.region)       q = q.eq('region',       data.region)

    const { data: rows } = await q as unknown as { data: { role: string; answers: Record<string, unknown> }[] | null }
    segmentN   = rows?.length ?? 0
    aggregates = computeAggregates(rows ?? [], compareableQs)
  }

  const showComparison = preview || segmentN >= COMPARISON_THRESHOLD

  // ── Skill curve + public market overview (full-field aggregates) ────────
  let skillCurve = preview ? mockSkillCurve() : undefined
  let marketData: DashboardData
  if (preview) {
    marketData = mockPublicDashboard()
  } else {
    const { data: allRows } = await supabase
      .from('ai_benchmark_responses')
      .select('role, archetype, dimension_scores, answers, created_at')
      .limit(5000) as unknown as { data: { role: string; archetype: string; dimension_scores: Record<string, number> | null; answers: Record<string, unknown> | null; created_at: string }[] | null }
    const rows = allRows ?? []
    skillCurve = computeSkillCurve(rows.map(r => ({ answers: r.answers || {} })))
    marketData = computePublicDashboard(rows)
    // If real N is too small to be meaningful, fall back to mock so the embed isn't an empty grid
    if (marketData.totalRespondents < COMPARISON_THRESHOLD) {
      marketData = { ...mockPublicDashboard(), usingMock: true }
    }
  }
  const userTrajectory = (() => {
    const a = data.answers?.q10
    if (!Array.isArray(a) || a.length < 3) return null
    return a.slice(0, 3).map(v => SKILL_LEVELS.indexOf(v as typeof SKILL_LEVELS[number]))
  })()
  const userShift = userSkillShift(data.answers?.q10)

  // ── Sub-insights (auto-picked from aggregates) ───────────────────────────
  const insights: Insight[] = []
  if (showComparison) {
    // Most-distinctive picks across Q1, Q2 (tools/stack)
    for (const qid of ['q2', 'q1', 'q15m', 'q14s', 'q14h']) {
      const q   = compareableQs.find(qq => qq.id === qid)
      const agg = aggregates[qid]
      if (!q || !agg) continue
      const userIds = userSelectedIds(data.answers?.[qid])
      const labelOf = (id: string) => q.options.find(o => o.id === id)?.label ?? id
      insights.push(...distinctiveInsights(qid, agg, userIds, labelOf, 1, lang))
    }
    // Top gap (most-adopted tool user doesn't use)
    {
      const q   = compareableQs.find(qq => qq.id === 'q2')
      const agg = aggregates['q2']
      if (q && agg) {
        const userIds = userSelectedIds(data.answers?.q2)
        const labelOf = (id: string) => q.options.find(o => o.id === id)?.label ?? id
        insights.push(...gapInsights(agg, userIds, labelOf, 1, lang))
      }
    }
    // Tribe size (peer archetype share — preview only for now)
    if (usingMock) {
      insights.push({
        kind: 'tribe', emoji: '🧭',
        title: t.insightTribeTitle,
        body:  t.insightTribeBody,
      })
    }
    // Time-saved
    {
      const q   = compareableQs.find(qq => qq.id === 'q6')
      const agg = aggregates['q6']
      if (q && agg) {
        const userIds = userSelectedIds(data.answers?.q6)
        const userId  = userIds[0]
        const peerLeader = Object.entries(agg.optionPct).sort((a, b) => b[1] - a[1])[0]
        if (userId && peerLeader) {
          const userLabel = q.options.find(o => o.id === userId)?.label
          const peerLabel = q.options.find(o => o.id === peerLeader[0])?.label
          if (userLabel && peerLabel) {
            insights.push({
              kind: 'time', emoji: '⏱️',
              title: t.insightTimeTitle.replace('{label}', userLabel),
              body:  t.insightTimeBody.replace('{pct}', String(peerLeader[1])).replace('{label}', peerLabel),
            })
          }
        }
      }
    }
    // Shift index (motion in the field)
    if (skillCurve && skillCurve.fieldShift > 0) {
      const sign = userShift !== null && userShift > 0 ? '+' : ''
      const levelsWord = userShift !== null && Math.abs(userShift) === 1 ? t.resultsLevelSing : t.resultsLevelPlur
      insights.push({
        kind:  'mover', emoji: '📈',
        title: t.insightMoverTitle.replace('{n}', skillCurve.fieldShift.toFixed(1)),
        body:  userShift !== null
          ? t.insightMoverBodyUserPos.replace('{sign}', sign).replace('{n}', String(userShift)).replace('{levels}', levelsWord)
          : t.insightMoverBodyAgg,
        delta: `+${skillCurve.fieldShift.toFixed(1)}`,
        trend: 'up',
      })
    }
    // Top blocker (Q17)
    {
      const q   = compareableQs.find(qq => qq.id === 'q17')
      const agg = aggregates['q17']
      if (q && agg) {
        const top = Object.entries(agg.optionPct).filter(([id]) => id !== 'none').sort((a, b) => b[1] - a[1])[0]
        if (top) {
          const label = q.options.find(o => o.id === top[0])?.label ?? top[0]
          insights.push({
            kind: 'blocker', emoji: '🚧',
            title: t.insightBlockerTitle.replace('{label}', label),
            body:  t.insightBlockerBody.replace('{pct}', String(top[1])),
          })
        }
      }
    }
  }
  const insightTrim = insights.slice(0, 6)

  const archetype = t.ARCHETYPES.find(a => a.id === data.archetype) || t.ARCHETYPES[0]

  // ── Share punchline + URLs ───────────────────────────────────────────────
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://markdekock.com'
  const shareUrl = `${baseUrl}/ai_benchmark?lang=${lang}&utm_source=share&utm_medium=results&utm_campaign=ai_benchmark`
  const ogUrl    = `${baseUrl}/api/ai_benchmark/og?id=${data.id}`
  const punchline = userShift !== null && userShift > 0
    ? `Ik ging ${userShift} skill-niveau${Math.abs(userShift) === 1 ? '' : 's'} omhoog in 12 maanden.`
    : 'Doe de benchmark en zie waar jij staat.'

  const dims = t.DIMENSIONS.map(d => ({
    ...d,
    score: data.dimension_scores?.[d.id] ?? 0,
  }))

  const greetingName = data.name?.trim() || ''

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: INK, fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>
      <Tracker event="results_viewed" role={data.role} meta={{ archetype: data.archetype, score: data.total_score }} />

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
      <section style={{ background: LIGHT, padding: '48px 24px 56px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: WARM, background: WARM_LIGHT,
              padding: '5px 14px', borderRadius: 100,
            }}>
              {t.resultsBadge}
            </span>
            {(skillCurve?.totalRespondents ?? 0) > 0 && (
              <LiveCounter total={skillCurve!.totalRespondents} lastWeek={usingMock ? 38 : undefined} />
            )}
          </div>

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

      {/* ── Sub-insights strip ── */}
      {insightTrim.length > 0 && (
        <section style={{ background: '#fff', padding: '40px 24px 32px', borderTop: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 880, margin: '0 auto' }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: ACCENT, marginBottom: 6 }}>
              {t.resultsWatOpvalt}
            </h2>
            <p style={{ fontSize: 22, fontWeight: 800, color: INK, marginBottom: 18, letterSpacing: '-0.01em' }}>
              {greetingName ? `${greetingName}, ` : ''}{t.resultsWatOpvaltHeadlineSuffix}
            </p>
            <InsightStrip insights={insightTrim} />
          </div>
        </section>
      )}

      {/* ── Skill curve of the field (Q10 trajectory) ── */}
      {skillCurve && skillCurve.totalRespondents > 0 && (
        <section style={{ background: LIGHT, padding: '48px 24px', borderTop: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 880, margin: '0 auto' }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: ACCENT, marginBottom: 6 }}>
              {t.resultsBeweging}
            </h2>
            <p style={{ fontSize: 22, fontWeight: 800, color: INK, marginBottom: 6, letterSpacing: '-0.01em' }}>
              {t.resultsBewegingHeadline}
            </p>
            <p style={{ fontSize: 14, color: BODY, lineHeight: 1.6, marginBottom: 22, maxWidth: 620 }}>
              {t.resultsBewegingPart1.replace('{n}', skillCurve.totalRespondents.toLocaleString())} {t.resultsBewegingPart2}
              {' '}<strong style={{ color: INK }}>{skillCurve.fieldShift > 0 ? '+' : ''}{skillCurve.fieldShift.toFixed(1)} {t.resultsLevelPlur}</strong> {t.resultsBewegingIn12}
              {userShift !== null && (
                <> {t.resultsYourShift} <strong style={{ color: ACCENT }}>{userShift > 0 ? '+' : ''}{userShift} {Math.abs(userShift) === 1 ? t.resultsLevelSing : t.resultsLevelPlur}</strong>
                  {userShift > skillCurve.fieldShift && '.' + t.resultsFasterMarket}
                  {userShift < skillCurve.fieldShift && '.' + t.resultsSlowerMarket}
                </>
              )}
            </p>
            <SkillCurve curve={skillCurve} userTrajectory={userTrajectory} lang={lang} />
          </div>
        </section>
      )}

      {/* ── Dimension breakdown ── */}
      <section style={{ background: '#fff', padding: '56px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: ACCENT, marginBottom: 6 }}>
            {t.resultsDimsTitle}
          </h2>
          <p style={{ fontSize: 22, fontWeight: 800, color: INK, marginBottom: 24, letterSpacing: '-0.01em' }}>
            {t.resultsDimsHeadline}
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

      {/* ── Market overview (compact embed of the public dashboard) ── */}
      {marketData.totalRespondents > 0 && (
        <section style={{ background: LIGHT, padding: '48px 24px', borderTop: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: ACCENT, marginBottom: 6 }}>
              {t.resultsMarket}
            </h2>
            <p style={{ fontSize: 22, fontWeight: 800, color: INK, marginBottom: 6, letterSpacing: '-0.01em' }}>
              {t.resultsMarketHeadline}
            </p>
            <p style={{ fontSize: 13, color: BODY, marginBottom: 20, lineHeight: 1.6, maxWidth: 720 }}>
              {t.resultsMarketBodyA}{' '}
              <Link href={`/ai_benchmark/dashboard${preview ? '?preview=1' : ''}`} style={{ color: ACCENT, fontWeight: 700 }}>{t.resultsMarketBodyB}</Link>
              {' '}{t.resultsMarketBodyC.replace('{n}', marketData.totalRespondents.toLocaleString())}
              {' '}{t.resultsMarketBodyD}
            </p>
            <MarketOverview data={marketData} lang={lang} />
          </div>
        </section>
      )}

      {/* ── Comparison ── */}
      {showComparison ? (
        <section style={{ background: LIGHT, padding: '56px 24px', borderTop: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 880, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 6 }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: ACCENT }}>
                {t.resultsCompareTtl}
              </h2>
              <span style={{ fontSize: 12, color: MUTED }}>
                {t.resultsBasedOn.replace('{n}', segmentN.toLocaleString())}
                {usingMock && <span style={{ marginLeft: 6, color: WARM, fontWeight: 700 }}>· {t.resultsPreviewTag}</span>}
              </span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: INK, marginBottom: 20, letterSpacing: '-0.01em' }}>
              {t.resultsCompareHeadline}
            </p>

            {/* Segment filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 28, fontSize: 13 }}>
              <span style={{ color: MUTED }}>{t.resultsCompareWith}</span>
              {(['all', 'role', 'industry', 'size', 'region'] as Segment[]).map(seg => {
                const active = seg === segment
                const href = `/ai_benchmark/results/${data.id}?lang=${lang}${preview ? '&preview=1' : ''}${seg === 'all' ? '' : `&segment=${seg}`}`
                const segLabel: Record<Segment, string> = {
                  all: t.segmentEveryone, role: t.segmentMyRole, industry: t.segmentMyIndustry,
                  size: t.segmentMySize, region: t.segmentMyRegion,
                }
                return (
                  <Link
                    key={seg}
                    href={href}
                    style={{
                      padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                      border: `1.5px solid ${active ? ACCENT : BORDER}`,
                      background: active ? `${ACCENT}0d` : '#fff',
                      color: active ? ACCENT : BODY,
                      textDecoration: 'none',
                    }}
                  >
                    {segLabel[seg]}
                  </Link>
                )
              })}
            </div>

            {/* Per-question comparison cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {compareableQs.map(q => {
                const agg = aggregates[q.id]
                if (!agg || agg.totalRespondents === 0) return null
                const userIds = userSelectedIds(data.answers?.[q.id])

                return (
                  <ComparisonCard
                    key={q.id}
                    label={q.id.toUpperCase()}
                    q={q}
                    agg={agg}
                    userIds={userIds}
                    noAnswerText={t.resultsNoAnswerForQ}
                  />
                )
              })}
            </div>
          </div>
        </section>
      ) : (
        <section style={{ background: WARM_LIGHT, padding: '48px 24px', borderTop: `1px solid ${WARM}33` }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: WARM, marginBottom: 6 }}>
              {t.resultsCompareTtl}
            </h2>
            <p style={{ fontSize: 18, color: INK, lineHeight: 1.6, fontWeight: 600, marginBottom: 8 }}>
              {t.resultsCompareBody}
            </p>
            <p style={{ fontSize: 13, color: BODY, marginTop: 12 }}>
              {t.resultsLockedThreshold
                .replace('{n}', String(segmentN))
                .replace('{threshold}', String(COMPARISON_THRESHOLD))}
            </p>
          </div>
        </section>
      )}

      {/* ── Tiered acquisition CTA (score-aware) ──────────────────────────── */}
      {(() => {
        const acq  = getAcqCopy(lang)
        const tier = getScoreTier(data.total_score)
        const tc   = acq.tier[tier]
        return (
          <section style={{ background: '#fff', padding: '64px 24px', borderTop: `1px solid ${BORDER}` }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <div style={{
                background: WARM_LIGHT, border: `1px solid ${WARM}55`, borderRadius: 14,
                padding: '32px 32px',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: WARM }}>
                    {tc.eyebrow}
                  </span>
                </div>
                <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 900, color: INK, lineHeight: 1.2, letterSpacing: '-0.015em', marginBottom: 14 }}>
                  {tc.headline}
                </h2>
                <p style={{ fontSize: 16, color: BODY, lineHeight: 1.65, marginBottom: 22 }}>
                  {tc.sub}
                </p>
                <a
                  href={CONTACT_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    background: ACCENT, color: '#fff', fontWeight: 700, fontSize: 15,
                    padding: '13px 26px', borderRadius: 8, textDecoration: 'none',
                    boxShadow: `0 4px 20px ${ACCENT}33`,
                  }}
                >
                  {tc.button}
                </a>
              </div>
            </div>
          </section>
        )
      })()}

      {/* ── The Crew teaser (brief, links to detail page) ─────────────────── */}
      {(() => {
        const acq = getAcqCopy(lang)
        return (
          <section style={{ background: LIGHT, padding: '40px 24px', borderTop: `1px solid ${BORDER}` }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: ACCENT, marginBottom: 8 }}>
                {acq.crewLabel}
              </p>
              <p style={{ fontSize: 17, color: INK, lineHeight: 1.6, fontWeight: 500, marginBottom: 12 }}>
                {acq.crewBody}
              </p>
              <a
                href={THECREW_HREF}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: ACCENT, fontWeight: 700, fontSize: 14, textDecoration: 'none', borderBottom: `2px solid ${ACCENT}55` }}
              >
                {acq.crewLink}
              </a>
            </div>
          </section>
        )
      })()}

      {/* ── Drie manieren om te starten (three entry-point cards) ─────────── */}
      {(() => {
        const acq = getAcqCopy(lang)
        return (
          <section style={{ background: '#fff', padding: '56px 24px', borderTop: `1px solid ${BORDER}` }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: ACCENT, marginBottom: 6 }}>
                {acq.threeWaysLabel}
              </p>
              <p style={{ fontSize: 22, fontWeight: 800, color: INK, marginBottom: 24, letterSpacing: '-0.01em' }}>
                {acq.threeWaysHeadline}
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 16,
              }}>
                {acq.cards.map((card, i) => (
                  <div key={i} style={{
                    background: LIGHT, border: `1px solid ${BORDER}`, borderRadius: 12,
                    padding: '22px 22px',
                    display: 'flex', flexDirection: 'column', gap: 10,
                  }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: INK, lineHeight: 1.35, letterSpacing: '-0.01em' }}>
                      {card.title}
                    </p>
                    <p style={{ fontSize: 13, color: BODY, lineHeight: 1.6, flex: 1 }}>
                      {card.body}
                    </p>
                    <a
                      href={CONTACT_HREF}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        marginTop: 6, color: ACCENT, fontWeight: 700, fontSize: 13,
                        textDecoration: 'none', borderBottom: `2px solid ${ACCENT}55`,
                        alignSelf: 'flex-start',
                      }}
                    >
                      {card.cta}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      })()}

      {/* ── Share with team (reframed: project-oriented) ──────────────────── */}
      {(() => {
        const acq = getAcqCopy(lang)
        return (
          <section style={{ background: INK, padding: '56px 24px', color: '#fff' }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: WARM, marginBottom: 8 }}>
                {acq.shareEyebrow}
              </h2>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.3, marginBottom: 10, letterSpacing: '-0.01em' }}>
                {acq.shareHeading}
              </p>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, marginBottom: 24 }}>
                {acq.shareBody}
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <ShareCard
                  resultId={data.id}
                  archetypeName={archetype.name}
                  archetypeEmoji={archetype.emoji}
                  totalScore={data.total_score}
                  punchline={punchline}
                  shareUrl={shareUrl}
                  ogUrl={ogUrl}
                  lang={lang}
                />
                <Link
                  href={`/ai_benchmark?lang=${lang}`}
                  style={{
                    color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 13,
                    padding: '12px 0', textDecoration: 'none',
                    marginLeft: 'auto',
                  }}
                >
                  {t.backToBenchmark}
                </Link>
              </div>
            </div>
          </section>
        )
      })()}

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

// ── Per-question comparison card ─────────────────────────────────────────────
function ComparisonCard({ label, q, agg, userIds, noAnswerText }: {
  label:   string
  q:       Question
  agg:     QuestionAggregate
  userIds: string[]
  noAnswerText: string
}) {
  // Sort options by adoption % descending so the headline reads top-down
  const sortedOptions = [...q.options].sort((a, b) =>
    (agg.optionPct[b.id] ?? 0) - (agg.optionPct[a.id] ?? 0)
  )
  const userPicked = (id: string) => userIds.includes(id)

  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: ACCENT, letterSpacing: '0.06em' }}>
          {label}
        </span>
        <span style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {q.dimension}
        </span>
      </div>

      <p style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 14, lineHeight: 1.4 }}>
        {q.text}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sortedOptions.map(opt => {
          const pct      = agg.optionPct[opt.id] ?? 0
          const selected = userPicked(opt.id)
          const barColor = selected ? ACCENT : '#CBD5E1'
          const labelCol = selected ? INK    : BODY
          return (
            <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 18, height: 18, flexShrink: 0,
                borderRadius: 4,
                border: `2px solid ${selected ? ACCENT : BORDER}`,
                background: selected ? ACCENT : '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {selected && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1, fontWeight: 800 }}>✓</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4, gap: 8 }}>
                  <span style={{ fontSize: 13, color: labelCol, fontWeight: selected ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {opt.label}
                  </span>
                  <span style={{ fontSize: 13, color: selected ? ACCENT : MUTED, fontWeight: 800, flexShrink: 0 }}>
                    {pct}%
                  </span>
                </div>
                <div style={{ height: 6, background: '#F1F5F9', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: 6, width: `${pct}%`, background: barColor, borderRadius: 100, transition: 'width 0.5s ease-out' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {userIds.length === 0 && (
        <p style={{ marginTop: 10, fontSize: 11, color: MUTED, fontStyle: 'italic' }}>
          {noAnswerText}
        </p>
      )}
    </div>
  )
}
