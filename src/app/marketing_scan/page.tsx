'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getScanContent, scoreColour } from '@/products/marketing_scan/data'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const ACCENT  = '#F55200'
const DARK    = '#0A0A0A'
const PRIMARY = '#111111'
const MUTED   = '#6B7280'
const BORDER  = '#E5E7EB'
const BG_GRAY = '#F7F7F7'
const FONT    = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

type Lang = 'en' | 'nl' | 'de' | 'de-ch'

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  en: {
    badge:        'Marketing Organisation Scan',
    heroH1a:      'How AI-ready is your',
    heroH1b:      'marketing organisation?',
    heroSub:      '8 performance pillars. 24 questions. Actionable results.',
    ctaPrimary:   'Start the scan →',
    ctaSecondary: 'See sample results',
    trustLine:    '24 questions · ~8 minutes · Free · Results by email',
    pillarsTitle: '8 Performance Pillars',
    levelsTitle:  '4 Maturity Levels',
    footerPowered:'Powered by Wouter Blok',
  },
  nl: {
    badge:        'Marketing Organisatie Scan',
    heroH1a:      'Hoe AI-klaar is jouw',
    heroH1b:      'marketingorganisatie?',
    heroSub:      '8 performance pillars. 24 vragen. Bruikbare inzichten.',
    ctaPrimary:   'Start de scan →',
    ctaSecondary: 'Bekijk voorbeeldresultaten',
    trustLine:    '24 vragen · ~8 minuten · Gratis · Resultaten per e-mail',
    pillarsTitle: '8 Performance Pillars',
    levelsTitle:  '4 Volwassenheidsniveaus',
    footerPowered:'Mogelijk gemaakt door Wouter Blok',
  },
  de: {
    badge:        'Marketing-Organisations-Scan',
    heroH1a:      'Wie KI-bereit ist deine',
    heroH1b:      'Marketingorganisation?',
    heroSub:      '8 Performance-Pillars. 24 Fragen. Konkrete Erkenntnisse.',
    ctaPrimary:   'Scan starten →',
    ctaSecondary: 'Beispielergebnisse ansehen',
    trustLine:    '24 Fragen · ~8 Minuten · Kostenlos · Ergebnisse per E-Mail',
    pillarsTitle: '8 Performance-Pillars',
    levelsTitle:  '4 Reifegrade',
    footerPowered:'Bereitgestellt von Wouter Blok',
  },
  'de-ch': {
    badge:        'Marketing-Organisations-Scan',
    heroH1a:      'Wie KI-bereit ist deine',
    heroH1b:      'Marketingorganisation?',
    heroSub:      '8 Performance-Pillars. 24 Fragen. Konkrete Erkenntnisse.',
    ctaPrimary:   'Scan starten →',
    ctaSecondary: 'Beispielergebnisse ansehen',
    trustLine:    '24 Fragen · ~8 Minuten · Kostenlos · Ergebnisse per E-Mail',
    pillarsTitle: '8 Performance-Pillars',
    levelsTitle:  '4 Reifegrade',
    footerPowered:'Bereitgestellt von Wouter Blok',
  },
}

const LANG_LABELS: { key: Lang; label: string }[] = [
  { key: 'en',    label: 'EN'    },
  { key: 'nl',    label: 'NL'    },
  { key: 'de',    label: 'DE'    },
  { key: 'de-ch', label: 'DE-CH' },
]

const MATURITY_SCORES = [3.8, 2.8, 1.8, 1.0] as const

// ── Inner component ────────────────────────────────────────────────────────────
function MarketingScanLandingInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const rawLang      = searchParams.get('lang') || 'en'
  const lang         = (['en', 'nl', 'de', 'de-ch'].includes(rawLang) ? rawLang : 'en') as Lang

  const switchLang = (key: Lang) => router.replace(`/marketing_scan?lang=${key}`)

  const t        = T[lang]
  const { PILLARS } = getScanContent(lang)
  const assessHref  = `/marketing_scan/assess?lang=${lang}`

  const maturityLevels = MATURITY_SCORES.map(score => {
    const col = scoreColour(score)
    return {
      label:  lang === 'nl' ? col.labelNl : lang === 'de' || lang === 'de-ch' ? col.labelDe : col.label,
      desc:   lang === 'nl' ? col.descriptionNl : lang === 'de' || lang === 'de-ch' ? col.descriptionDe : col.description,
      score,
      bg:     col.pastelBg,
      colour: col.bg,
    }
  })

  const scoreRanges = ['3.5 – 4.0', '2.5 – 3.4', '1.5 – 2.4', '1.0 – 1.4']

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: PRIMARY, fontFamily: FONT }}>

      {/* ── Nav ── */}
      <nav style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Wordmark */}
          <span style={{ color: 'rgba(0,0,0,0.9)', fontWeight: 800, fontSize: 15, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            MARKENZUKUNFT
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Language pills */}
            <div style={{ display: 'flex', gap: 4 }}>
              {LANG_LABELS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => switchLang(key)}
                  style={{
                    padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                    border: `1px solid ${lang === key ? ACCENT : BORDER}`,
                    background: 'transparent',
                    color: lang === key ? ACCENT : MUTED,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Nav CTA — outlined */}
            <Link
              href={assessHref}
              style={{
                background: 'transparent', color: ACCENT, fontSize: 13, fontWeight: 700,
                padding: '7px 18px', borderRadius: 6, textDecoration: 'none',
                border: `2px solid ${ACCENT}`,
                letterSpacing: '0.01em',
              }}
            >
              {t.ctaPrimary}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: '#fff', padding: '80px 24px 88px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: ACCENT, border: `1px solid ${ACCENT}44`,
            padding: '4px 14px', borderRadius: 4, marginBottom: 28,
          }}>
            {t.badge}
          </span>

          <h1 style={{ fontSize: 'clamp(34px, 5.5vw, 60px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, color: '#111111', letterSpacing: '-0.02em' }}>
            {t.heroH1a}<br />{t.heroH1b}
          </h1>

          <p style={{ fontSize: 18, color: MUTED, lineHeight: 1.6, marginBottom: 36, maxWidth: 520 }}>
            {t.heroSub}
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
            {/* Hero primary CTA — filled (sole exception) */}
            <Link
              href={assessHref}
              style={{
                background: ACCENT, color: '#fff', fontWeight: 700, fontSize: 16,
                padding: '14px 32px', borderRadius: 6, textDecoration: 'none',
                border: 'none',
                boxShadow: '0 4px 20px rgba(245,82,0,0.22)',
              }}
            >
              {t.ctaPrimary}
            </Link>
            <Link
              href={`/marketing_scan/results?d=${encodeURIComponent(btoa(JSON.stringify({ targets: 2.7, audiences: 1.8, investment: 3.1, creative: 2.4, experience: 1.5, data: 2.9, experimentation: 1.2, automation: 2.2 })))}&role=cmo&lang=${lang}`}
              style={{
                color: PRIMARY, fontWeight: 600, fontSize: 15,
                padding: '14px 24px', borderRadius: 6, textDecoration: 'none',
                border: `1px solid ${BORDER}`,
              }}
            >
              {t.ctaSecondary}
            </Link>
          </div>

          <p style={{ fontSize: 13, color: MUTED }}>{t.trustLine}</p>
        </div>
      </section>

      {/* ── Pillars grid ── */}
      <section style={{ background: BG_GRAY, padding: '72px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: MUTED, marginBottom: 10 }}>
            {t.pillarsTitle}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginTop: 24 }}>
            {PILLARS.map(p => (
              <div
                key={p.id}
                style={{
                  background: '#fff', borderRadius: 10, padding: '24px 22px',
                  border: `1px solid ${BORDER}`,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FFF3EE')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{p.icon}</div>
                <p style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, marginBottom: 6 }}>{p.name}</p>
                <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.65 }}>{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Maturity levels ── */}
      <section style={{ background: '#fff', padding: '72px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: MUTED, marginBottom: 28 }}>
            {t.levelsTitle}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 10, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
            {maturityLevels.map((level, i) => (
              <div
                key={level.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 20, padding: '20px 28px',
                  background: level.bg,
                  borderBottom: i < maturityLevels.length - 1 ? `1px solid ${BORDER}` : 'none',
                }}
              >
                <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 80 }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: level.colour }}>{scoreRanges[i]}</span>
                </div>
                <div style={{ width: 1, height: 36, background: BORDER, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: level.colour, marginBottom: 3 }}>{level.label}</p>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.55 }}>{level.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: DARK, padding: '32px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            MARKENZUKUNFT
          </span>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            {t.footerPowered}
          </p>
        </div>
      </footer>

    </div>
  )
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function MarketingScanLandingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${ACCENT}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <MarketingScanLandingInner />
    </Suspense>
  )
}
