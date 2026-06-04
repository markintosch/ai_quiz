'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  getContent, computeResult, reasoningFor, bookingHref, normaliseLocale,
  type RoleId, type StageId, type PillarId,
} from '@/products/wouterblok/data'

// ── Brand tokens (emerald / navy) ────────────────────────────────────────────
const ACCENT      = '#0E9F6E'
const ACCENT_DEEP = '#076B46'
const NAVY        = '#0C2B3A'
const PRIMARY     = '#111827'
const MUTED       = '#6B7280'
const BORDER      = '#E5E7EB'
const BG_GRAY     = '#F5F8F6'
const GOLD        = '#E8920A'
const FONT        = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

const T = {
  en: {
    sub: 'Growth Flywheel Scan', back: '← Back to scan',
    resultsLabel: 'Your result', overall: 'Overall maturity',
    pillarsTitle: 'Your 8 pillar scores', weakest: 'Weakest pillar',
    recTitle: 'Recommended next step', retake: 'Retake the scan',
    noResults: 'No result found.', start: 'Start the scan →',
  },
  nl: {
    sub: 'Growth Flywheel Scan', back: '← Terug naar scan',
    resultsLabel: 'Jouw resultaat', overall: 'Totale volwassenheid',
    pillarsTitle: 'Jouw 8 pijlerscores', weakest: 'Zwakste pijler',
    recTitle: 'Aanbevolen volgende stap', retake: 'Doe de scan opnieuw',
    noResults: 'Geen resultaat gevonden.', start: 'Start de scan →',
  },
  de: {
    sub: 'Growth Flywheel Scan', back: '← Zurück zum Scan',
    resultsLabel: 'Dein Ergebnis', overall: 'Gesamtreife',
    pillarsTitle: 'Deine 8 Säulen-Scores', weakest: 'Schwächste Säule',
    recTitle: 'Empfohlener nächster Schritt', retake: 'Scan wiederholen',
    noResults: 'Kein Ergebnis gefunden.', start: 'Scan starten →',
  },
}

interface Decoded { a: Record<string, number>; r: RoleId; s: StageId }

function decode(d: string | null): Decoded | null {
  if (!d) return null
  try {
    const obj = JSON.parse(atob(decodeURIComponent(d)))
    if (obj && obj.a && obj.r && obj.s) return obj as Decoded
    return null
  } catch { return null }
}

function ResultsInner() {
  const searchParams = useSearchParams()
  const lang = normaliseLocale(searchParams.get('lang'))
  const t    = T[lang]
  const { pillars, tiers, services, labels } = getContent(lang)
  const decoded = decode(searchParams.get('d'))

  if (!decoded) {
    return (
      <div style={{ minHeight: '100vh', background: BG_GRAY, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: MUTED, marginBottom: 18 }}>{t.noResults}</p>
          <Link href={`/wouterblok?lang=${lang}`} style={{ color: '#fff', background: ACCENT, fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 6, textDecoration: 'none' }}>{t.start}</Link>
        </div>
      </div>
    )
  }

  const result    = computeResult(decoded.a, decoded.r, decoded.s)
  const reasoning  = reasoningFor(lang, result, decoded.r, decoded.s)
  const tierDef    = tiers.find(x => x.key === result.tier)!
  const service    = services.find(x => x.key === result.service)!
  const pillarName = (id: PillarId) => pillars.find(p => p.id === id)!.name
  const pillarIcon = (id: PillarId) => pillars.find(p => p.id === id)!.icon

  return (
    <div style={{ minHeight: '100vh', background: BG_GRAY, fontFamily: FONT }}>
      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, height: 60, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: NAVY, lineHeight: 1.2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>WOUTER BLOK</p>
            <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.2 }}>{t.sub}</p>
          </div>
          <Link href={`/wouterblok?lang=${lang}`} style={{ fontSize: 13, color: MUTED, textDecoration: 'none', fontWeight: 500 }}>{t.back}</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 72px' }}>

        {/* Tier hero */}
        <div style={{ background: NAVY, borderRadius: 16, padding: '40px 32px', color: '#fff', marginBottom: 24 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{t.resultsLabel}</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginTop: 14, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, lineHeight: 1.1, textTransform: 'capitalize' }}>{tierDef.label}</p>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginTop: 8, maxWidth: 520 }}>{tierDef.read}</p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t.overall}</p>
              <p style={{ fontSize: 48, fontWeight: 900, color: GOLD, lineHeight: 1 }}>{result.pct}<span style={{ fontSize: 22 }}>%</span></p>
            </div>
          </div>
        </div>

        {/* Pillar bars */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 26px', border: `1px solid ${BORDER}`, marginBottom: 24 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, marginBottom: 20 }}>{t.pillarsTitle}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {pillars.map(p => {
              const pct = result.pillarPct[p.id]
              const isWeak = p.id === result.weakestPillar
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 168, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15 }}>{p.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: isWeak ? 800 : 600, color: isWeak ? GOLD : PRIMARY }}>{p.name}</span>
                  </div>
                  <div style={{ flex: 1, height: 10, background: BG_GRAY, borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: 10, width: `${pct}%`, background: isWeak ? GOLD : ACCENT, borderRadius: 100, transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ width: 42, textAlign: 'right', fontSize: 13, fontWeight: 700, color: isWeak ? GOLD : NAVY }}>{pct}%</span>
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: 13, color: MUTED, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
            <span style={{ fontWeight: 700, color: GOLD }}>{t.weakest}:</span>{' '}
            {pillarIcon(result.weakestPillar)} {pillarName(result.weakestPillar)}
          </p>
        </div>

        {/* Recommendation */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 26px', border: `2px solid ${ACCENT}`, marginBottom: 28 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT_DEEP, marginBottom: 10 }}>{t.recTitle}</h2>
          <p style={{ fontSize: 20, fontWeight: 900, color: NAVY, marginBottom: 10 }}>{service.name}</p>
          <p style={{ fontSize: 15, color: PRIMARY, lineHeight: 1.65, marginBottom: 22 }}>{reasoning}</p>
          <a href={bookingHref(result.service, lang)} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-block', background: ACCENT, color: '#fff', fontWeight: 700, fontSize: 15,
            padding: '13px 28px', borderRadius: 6, textDecoration: 'none', boxShadow: '0 4px 18px rgba(14,159,110,0.25)',
          }}>{service.cta} →</a>
        </div>

        {/* Retake */}
        <div style={{ textAlign: 'center' }}>
          <Link href={`/wouterblok/assess?lang=${lang}`} style={{ fontSize: 13, color: MUTED, textDecoration: 'underline', fontWeight: 500 }}>{t.retake}</Link>
        </div>
      </div>
    </div>
  )
}

export default function WouterblokResultsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: BG_GRAY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${ACCENT}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <ResultsInner />
    </Suspense>
  )
}
