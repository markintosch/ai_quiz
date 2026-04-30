// FILE: src/app/ai_benchmark/dashboard/page.tsx
// Public weekly-updated overview of the AI-benchmark research data.
// Indexable. Intended as a shareable / linkable artifact that funnels new
// respondents into /ai_benchmark/start.

import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import {
  computePublicDashboard, mockPublicDashboard, type DashboardData,
} from '@/products/ai_benchmark/public_dashboard'
import { getContent, pickLang, type Lang } from '@/products/ai_benchmark/data'
import { SkillCurve }     from '@/components/ai_benchmark/SkillCurve'
import { MarketOverview } from '@/components/ai_benchmark/MarketOverview'
import { LiveCounter }    from '@/components/ai_benchmark/LiveCounter'
import { LangPills }      from '@/components/ai_benchmark/LangPills'
import { Tracker }        from '@/components/ai_benchmark/Tracker'
import type { Metadata } from 'next'
import { headers } from 'next/headers'

// Dashboard reads ?lang=, can't be statically cached per request.
export const dynamic = 'force-dynamic'

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

// Map our internal lang code → Intl.DateTimeFormat locale tag
const DATE_LOCALE: Record<Lang, string> = {
  nl: 'nl-NL', en: 'en-GB', fr: 'fr-FR', de: 'de-DE',
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getBaseUrl(): string {
  try {
    const h = headers()
    const host = h.get('host')
    const proto = h.get('x-forwarded-proto') || 'https'
    if (host) return `${proto}://${host}`
  } catch { /* headers() unavailable in some build contexts */ }
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://markdekock.com'
}

export async function generateMetadata({ searchParams }: { searchParams: { lang?: string } }): Promise<Metadata> {
  const BASE = getBaseUrl()
  const lang = pickLang(searchParams.lang)
  const ogUrl = `${BASE}/api/ai_benchmark/og?type=dashboard`
  const titles: Record<Lang, { title: string; desc: string; ogTitle: string; twTitle: string; twDesc: string }> = {
    nl: {
      title:   'State of AI in Marketing & Sales · research dashboard | Mark de Kock',
      desc:    'Wekelijks geüpdatet onderzoeksdashboard. Hoe marketing- en sales-professionals AI gebruiken, welke tools, welke tijdwinst, welke blokkades. Gratis te bekijken. Doe zelf de benchmark in 6 minuten.',
      ogTitle: 'State of AI in Marketing & Sales, wekelijks geüpdatet',
      twTitle: 'State of AI in Marketing & Sales',
      twDesc:  'Onafhankelijk onderzoek door Mark de Kock. Wekelijks geüpdatet.',
    },
    en: {
      title:   'State of AI in Marketing & Sales · research dashboard | Mark de Kock',
      desc:    'Weekly-updated research dashboard. How marketing & sales professionals actually use AI — tools, time saved, blockers, archetypes. Free to view. Take the benchmark in 6 minutes.',
      ogTitle: 'State of AI in Marketing & Sales — updated weekly',
      twTitle: 'State of AI in Marketing & Sales',
      twDesc:  'Independent research by Mark de Kock. Updated weekly.',
    },
    fr: {
      title:   "State of AI in Marketing & Sales · tableau de bord d'étude | Mark de Kock",
      desc:    "Tableau de bord d'étude mis à jour chaque semaine. Comment les pros marketing & vente utilisent vraiment l'IA — outils, gain de temps, freins, archétypes. Libre d'accès. Fais le benchmark en 6 minutes.",
      ogTitle: 'State of AI in Marketing & Sales — mis à jour chaque semaine',
      twTitle: 'State of AI in Marketing & Sales',
      twDesc:  'Étude indépendante par Mark de Kock. Mise à jour hebdomadaire.',
    },
    de: {
      title:   'State of AI in Marketing & Sales · Forschungs-Dashboard | Mark de Kock',
      desc:    'Wöchentlich aktualisiertes Forschungs-Dashboard. Wie Marketing- & Sales-Profis KI wirklich nutzen — Tools, Zeitersparnis, Blocker, Archetypen. Kostenlos einsehbar. Mach den Benchmark in 6 Minuten.',
      ogTitle: 'State of AI in Marketing & Sales — wöchentlich aktualisiert',
      twTitle: 'State of AI in Marketing & Sales',
      twDesc:  'Unabhängige Studie von Mark de Kock. Wöchentlich aktualisiert.',
    },
  }
  const m = titles[lang]
  return {
    title:       m.title,
    description: m.desc,
    alternates:  { canonical: `${BASE}/ai_benchmark/dashboard` },
    openGraph: {
      title:       m.ogTitle,
      description: m.desc,
      url:         `${BASE}/ai_benchmark/dashboard`,
      type:        'website',
      images: [{ url: ogUrl, width: 1200, height: 630, alt: 'State of AI in Marketing & Sales — public research dashboard' }],
    },
    twitter: {
      card:  'summary_large_image',
      title: m.twTitle,
      description: m.twDesc,
      images: [ogUrl],
    },
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { preview?: string; lang?: string }
}) {
  const preview = searchParams.preview === '1'
  const lang = pickLang(searchParams.lang)
  const t = getContent(lang)

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

  const updatedFmt = data.lastUpdated.toLocaleDateString(DATE_LOCALE[lang], { day: 'numeric', month: 'long', year: 'numeric' })
  const startHref = `/ai_benchmark/start?lang=${lang}`

  // Replace simple {n} templates
  const dashSkillHeadline = t.dashSkillHeadline.replace(
    '{n}',
    `${data.skillCurve.fieldShift > 0 ? '+' : ''}${data.skillCurve.fieldShift.toFixed(1)}`,
  )
  const dashCtaHeadline = data.usingMock
    ? t.dashCtaHeadlineVague
    : t.dashCtaHeadline.replace('{n}', data.totalRespondents.toLocaleString(DATE_LOCALE[lang]))
  const dashPreviewTag = t.dashPreviewTag.replace('{n}', String(COMPARISON_THRESHOLD))

  return (
    <div style={{ minHeight: '100vh', background: LIGHT, color: INK, fontFamily: FONT }}>
      <Tracker event="dashboard_viewed" />

      {/* ── Nav ── */}
      <nav style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={`/ai_benchmark?lang=${lang}`} style={{ display: 'flex', alignItems: 'baseline', gap: 8, textDecoration: 'none' }}>
            <span style={{ color: INK, fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }}>{t.navName}</span>
            <span style={{ color: MUTED, fontSize: 13, fontWeight: 500 }}>{t.dashTagline}</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <LangPills lang={lang} basePath="/ai_benchmark/dashboard" />
            <Link
              href={startHref}
              style={{
                background: ACCENT, color: '#fff', fontWeight: 700, fontSize: 13,
                padding: '8px 16px', borderRadius: 6, textDecoration: 'none',
              }}
            >
              {t.navCta}
            </Link>
          </div>
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
              {t.dashHeroBadge}
            </span>
            <LiveCounter total={data.totalRespondents} lang={lang} vague={data.usingMock} />
          </div>

          <h1 style={{ fontSize: 'clamp(30px, 4.8vw, 50px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16, color: INK, letterSpacing: '-0.025em', maxWidth: 880 }}>
            {t.dashHeroH1a} <span style={{ color: ACCENT }}>{t.dashHeroH1b}</span>
          </h1>
          <p style={{ fontSize: 17, color: BODY, lineHeight: 1.65, maxWidth: 720, marginBottom: 14 }}>
            {t.dashHeroBody}
            <Link href={startHref} style={{ color: ACCENT, fontWeight: 700, marginLeft: 6 }}>{t.dashHeroCta}</Link>
          </p>
          <p style={{ fontSize: 13, color: MUTED }}>
            {t.dashLastUpdated} <strong style={{ color: INK }}>{updatedFmt}</strong>
            {data.usingMock && <span style={{ marginLeft: 8, color: WARM, fontWeight: 700 }}>· {dashPreviewTag}</span>}
          </p>
        </div>
      </section>

      {/* ── Skill curve ── */}
      <section style={{ background: '#fff', padding: '40px 24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: ACCENT, marginBottom: 4 }}>
            {t.dashSkillLabel}
          </p>
          <p style={{ fontSize: 22, fontWeight: 800, color: INK, marginBottom: 6, letterSpacing: '-0.01em' }}>
            {dashSkillHeadline.split(' ').map((word, i, arr) => {
              // Highlight the leading numeric token (e.g., "+1.3" or "+1,3") in ACCENT
              const isNumber = /^[+\-±]?\d/.test(word)
              return (
                <span key={i} style={isNumber ? { color: ACCENT } : undefined}>
                  {word}{i < arr.length - 1 ? ' ' : ''}
                </span>
              )
            })}
          </p>
          <p style={{ fontSize: 13, color: BODY, marginBottom: 22, lineHeight: 1.6, maxWidth: 720 }}>
            {t.dashSkillBody}
          </p>
          <SkillCurve curve={data.skillCurve} lang={lang} />
        </div>
      </section>

      {/* ── Market overview ── */}
      <section style={{ padding: '40px 24px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <MarketOverview data={data} lang={lang} />
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: INK, color: '#fff', padding: '52px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: WARM, marginBottom: 12 }}>
            {t.dashCtaLabel}
          </p>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, lineHeight: 1.2, marginBottom: 14, letterSpacing: '-0.02em' }}>
            {dashCtaHeadline}
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, maxWidth: 600, margin: '0 auto 28px' }}>
            {t.dashCtaBody}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href={startHref}
              style={{
                display: 'inline-block',
                background: ACCENT, color: '#fff', fontWeight: 700, fontSize: 16,
                padding: '14px 32px', borderRadius: 8, textDecoration: 'none',
                boxShadow: `0 4px 20px ${ACCENT}55`,
              }}
            >
              {t.dashCtaButton}
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
              {t.dashCtaProjectButton}
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
