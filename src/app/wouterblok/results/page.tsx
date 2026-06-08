'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  getContent, computeResult, reasoningFor, narrativeFor, moveFor,
  strongestPillarOf, bookingHref, normaliseLocale,
  type RoleId, type StageId, type PillarId, type Locale,
} from '@/products/wouterblok/data'
import { WouterRadar, type RadarAxis } from '@/components/wouterblok/WouterRadar'

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
    pillarsTitle: 'Your 8 pillar scores', weakest: 'Weakest pillar', strongest: 'Strongest pillar',
    recTitle: 'Recommended next step', firstMove: 'Your first move', retake: 'Retake the scan',
    noResults: 'No result found.', start: 'Start the scan →', loading: 'Loading your result…',
    you: 'You', peers: 'Peers', peersAvg: (n: number) => `average across ${n} scans`,
    emailed: 'A copy of your result is on its way to your inbox.',
    shapeTitle: 'Your flywheel shape',
  },
  nl: {
    sub: 'Growth Flywheel Scan', back: '← Terug naar scan',
    resultsLabel: 'Jouw resultaat', overall: 'Totale volwassenheid',
    pillarsTitle: 'Jouw 8 pijlerscores', weakest: 'Zwakste pijler', strongest: 'Sterkste pijler',
    recTitle: 'Aanbevolen volgende stap', firstMove: 'Je eerste stap', retake: 'Doe de scan opnieuw',
    noResults: 'Geen resultaat gevonden.', start: 'Start de scan →', loading: 'Je resultaat laden…',
    you: 'Jij', peers: 'Branche', peersAvg: (n: number) => `gemiddelde over ${n} scans`,
    emailed: 'Een kopie van je resultaat is onderweg naar je inbox.',
    shapeTitle: 'De vorm van je flywheel',
  },
  de: {
    sub: 'Growth Flywheel Scan', back: '← Zurück zum Scan',
    resultsLabel: 'Dein Ergebnis', overall: 'Gesamtreife',
    pillarsTitle: 'Deine 8 Säulen-Scores', weakest: 'Schwächste Säule', strongest: 'Stärkste Säule',
    recTitle: 'Empfohlener nächster Schritt', firstMove: 'Dein erster Schritt', retake: 'Scan wiederholen',
    noResults: 'Kein Ergebnis gefunden.', start: 'Scan starten →', loading: 'Dein Ergebnis wird geladen…',
    you: 'Du', peers: 'Branche', peersAvg: (n: number) => `Durchschnitt über ${n} Scans`,
    emailed: 'Eine Kopie deines Ergebnisses ist auf dem Weg in dein Postfach.',
    shapeTitle: 'Die Form deines Flywheels',
  },
}

interface Decoded { a: Record<string, number>; r: RoleId; s: StageId }
interface Loaded extends Decoded { firstName?: string; benchmark?: { avg: number; count: number } | null; emailed?: boolean }

function decode(d: string | null): Decoded | null {
  if (!d) return null
  try {
    const obj = JSON.parse(atob(decodeURIComponent(d)))
    if (obj && obj.a && obj.r && obj.s) return obj as Decoded
    return null
  } catch { return null }
}

function NoResult({ lang, t }: { lang: Locale; t: typeof T['en'] }) {
  return (
    <div style={{ minHeight: '100vh', background: BG_GRAY, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 16, color: MUTED, marginBottom: 18 }}>{t.noResults}</p>
        <Link href={`/wouterblok?lang=${lang}`} style={{ color: '#fff', background: ACCENT, fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 6, textDecoration: 'none' }}>{t.start}</Link>
      </div>
    </div>
  )
}

function ResultsInner() {
  const searchParams = useSearchParams()
  const lang = normaliseLocale(searchParams.get('lang'))
  const t    = T[lang]
  const id   = searchParams.get('id')
  const dRaw = searchParams.get('d')

  const [loaded, setLoaded]   = useState<Loaded | null>(() => (id ? null : decode(dRaw)))
  const [loading, setLoading] = useState<boolean>(Boolean(id))
  const [failed, setFailed]   = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/wouterblok/result/${id}`)
        if (!res.ok) { if (!cancelled) { setFailed(true); setLoading(false) } ; return }
        const data = await res.json()
        if (!cancelled) {
          setLoaded({ a: data.answers, r: data.role, s: data.stage, firstName: data.firstName, benchmark: data.benchmark, emailed: true })
          setLoading(false)
        }
      } catch {
        if (!cancelled) { setFailed(true); setLoading(false) }
      }
    })()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: BG_GRAY, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${ACCENT}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
          <p style={{ fontSize: 14, color: MUTED }}>{t.loading}</p>
        </div>
      </div>
    )
  }

  if (failed || !loaded) return <NoResult lang={lang} t={t} />

  const { pillars, tiers, services } = getContent(lang)
  const result    = computeResult(loaded.a, loaded.r, loaded.s)
  const reasoning  = reasoningFor(lang, result, loaded.r, loaded.s)
  const narrative  = narrativeFor(lang, result)
  const move       = moveFor(lang, result.weakestPillar)
  const tierDef    = tiers.find(x => x.key === result.tier)!
  const service    = services.find(x => x.key === result.service)!
  const strongest  = strongestPillarOf(result.pillarPct)
  const pillarOf   = (id: PillarId) => pillars.find(p => p.id === id)!

  const axes: RadarAxis[] = pillars.map(p => ({
    label: p.name, value: result.pillarPct[p.id], weak: p.id === result.weakestPillar,
  }))

  const bench = loaded.benchmark

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
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, marginTop: 10, maxWidth: 540 }}>{narrative}</p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t.overall}</p>
              <p style={{ fontSize: 48, fontWeight: 900, color: GOLD, lineHeight: 1 }}>{result.pct}<span style={{ fontSize: 22 }}>%</span></p>
              {bench && (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>
                  {t.peers} {bench.avg}% · {t.peersAvg(bench.count)}
                </p>
              )}
            </div>
          </div>
          {loaded.emailed && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 22, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.12)' }}>✓ {t.emailed}</p>
          )}
        </div>

        {/* Radar + pillar bars */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 26px', border: `1px solid ${BORDER}`, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) 1fr', gap: 32, alignItems: 'start' }} className="wb-results-grid">
            {/* Radar */}
            <div>
              <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, marginBottom: 14 }}>{t.shapeTitle}</h2>
              <div style={{ marginTop: 8 }}><WouterRadar axes={axes} /></div>
            </div>
            {/* Bars */}
            <div>
              <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, marginBottom: 18 }}>{t.pillarsTitle}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {pillars.map(p => {
                  const pct = result.pillarPct[p.id]
                  const isWeak = p.id === result.weakestPillar
                  return (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 150, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                        <span style={{ fontSize: 14, flexShrink: 0 }}>{p.icon}</span>
                        <span style={{ fontSize: 12.5, fontWeight: isWeak ? 800 : 600, color: isWeak ? GOLD : PRIMARY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                      </div>
                      <div style={{ flex: 1, height: 9, background: BG_GRAY, borderRadius: 100, overflow: 'hidden', minWidth: 40 }}>
                        <div style={{ height: 9, width: `${pct}%`, background: isWeak ? GOLD : ACCENT, borderRadius: 100, transition: 'width 0.5s ease' }} />
                      </div>
                      <span style={{ width: 38, textAlign: 'right', fontSize: 12.5, fontWeight: 700, color: isWeak ? GOLD : NAVY, flexShrink: 0 }}>{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Strongest / weakest read */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 24, paddingTop: 22, borderTop: `1px solid ${BORDER}` }} className="wb-readout-grid">
            <div style={{ background: '#F0F7F3', borderRadius: 10, padding: '14px 16px', borderLeft: `3px solid ${ACCENT}` }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: ACCENT_DEEP, marginBottom: 6 }}>{t.strongest}</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: NAVY, marginBottom: 5 }}>{pillarOf(strongest).icon} {pillarOf(strongest).name}</p>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.55 }}>{pillarOf(strongest).blurb}</p>
            </div>
            <div style={{ background: '#FCF6EC', borderRadius: 10, padding: '14px 16px', borderLeft: `3px solid ${GOLD}` }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0710A', marginBottom: 6 }}>{t.weakest}</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: NAVY, marginBottom: 5 }}>{pillarOf(result.weakestPillar).icon} {pillarOf(result.weakestPillar).name}</p>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.55 }}>{pillarOf(result.weakestPillar).blurb}</p>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 26px', border: `2px solid ${ACCENT}`, marginBottom: 28 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT_DEEP, marginBottom: 10 }}>{t.recTitle}</h2>
          <p style={{ fontSize: 20, fontWeight: 900, color: NAVY, marginBottom: 10 }}>{service.name}</p>
          <p style={{ fontSize: 15, color: PRIMARY, lineHeight: 1.65, marginBottom: 18 }}>{reasoning}</p>

          {/* First move */}
          <div style={{ background: BG_GRAY, borderLeft: `3px solid ${ACCENT}`, borderRadius: 8, padding: '14px 16px', marginBottom: 22 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: ACCENT_DEEP, marginBottom: 6 }}>{t.firstMove}</p>
            <p style={{ fontSize: 14.5, color: PRIMARY, lineHeight: 1.6 }}>{move}</p>
          </div>

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

      <style>{`
        @media (max-width: 640px) {
          .wb-results-grid { grid-template-columns: 1fr !important; }
          .wb-readout-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
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
