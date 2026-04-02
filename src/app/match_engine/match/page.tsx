'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getProfileContent } from '@/products/energy_profile/data'

type Lang = 'nl' | 'en'

const BRAND = '#0F7B55'
const BRAND_LIGHT = '#E6F4EF'

function matchColour(pct: number): { bg: string; text: string; label: string; labelNl: string } {
  if (pct >= 85) return { bg: '#DCFCE7', text: '#166534', label: 'Excellent', labelNl: 'Uitstekend' }
  if (pct >= 70) return { bg: '#D1FAE5', text: '#065F46', label: 'Strong', labelNl: 'Sterk' }
  if (pct >= 55) return { bg: '#FEF9C3', text: '#854D0E', label: 'Moderate', labelNl: 'Gemiddeld' }
  if (pct >= 40) return { bg: '#FEE2E2', text: '#991B1B', label: 'Gap', labelNl: 'Verschil' }
  return { bg: '#FCE7F3', text: '#9D174D', label: 'Mismatch', labelNl: 'Mismatch' }
}

function overallColour(pct: number) {
  if (pct >= 85) return { ring: '#22C55E', bg: BRAND, label: 'Uitstekende match', labelEn: 'Excellent match', desc: 'Kandidaat en vacature sluiten sterk op elkaar aan in alle dimensies.', descEn: 'Candidate and vacancy align strongly across all dimensions.' }
  if (pct >= 70) return { ring: '#4ADE80', bg: '#059669', label: 'Sterke match', labelEn: 'Strong match', desc: 'Er is een goede match. Kleine aandachtspunten zijn bespreekbaar.', descEn: 'Good match overall. Minor points worth discussing.' }
  if (pct >= 55) return { ring: '#FACC15', bg: '#D97706', label: 'Gemiddelde match', labelEn: 'Moderate match', desc: 'Potentieel aanwezig maar duidelijke bespreekpunten per dimensie.', descEn: 'Potential present but clear discussion points per dimension.' }
  if (pct >= 40) return { ring: '#F97316', bg: '#EA580C', label: 'Aandacht nodig', labelEn: 'Needs attention', desc: 'Significante verschillen — goed gesprekspunt voor de intake.', descEn: 'Significant gaps — valuable starting point for the intake.' }
  return { ring: '#EF4444', bg: '#DC2626', label: 'Grote mismatch', labelEn: 'Major mismatch', desc: 'Profiel wijkt sterk af. Bespreek of de rol echt bij de kandidaat past.', descEn: 'Profiles diverge significantly. Discuss whether the role truly fits.' }
}

const T = {
  nl: {
    backLink: '← Opnieuw', subTitle: 'Match Engine · e-people',
    resultTitle: 'Match Resultaat', overallLabel: 'Totale match',
    dimsTitle: 'Match per dimensie',
    candidateLabel: 'Kandidaat', jobLabel: 'Gewenst profiel',
    deltaLabel: 'Verschil', matchLabel: 'Match',
    insightTitle: 'Gesprekspunten',
    insight: (low: Array<{ name: string; pct: number }>) => {
      if (low.length === 0) return 'Alle dimensies liggen dicht bij elkaar. Goed startpunt voor de intake.'
      return `Let extra op: ${low.map(l => l.name).join(', ')}. Dit zijn de dimensies met het grootste verschil.`
    },
    tryAgain: 'Nieuwe match →', startNew: 'Nieuwe Energy Scan →',
  },
  en: {
    backLink: '← Redo', subTitle: 'Match Engine · e-people',
    resultTitle: 'Match Result', overallLabel: 'Overall match',
    dimsTitle: 'Match per dimension',
    candidateLabel: 'Candidate', jobLabel: 'Desired profile',
    deltaLabel: 'Gap', matchLabel: 'Match',
    insightTitle: 'Talking points',
    insight: (low: Array<{ name: string; pct: number }>) => {
      if (low.length === 0) return 'All dimensions are close. Good starting point for the intake.'
      return `Pay extra attention to: ${low.map(l => l.name).join(', ')}. These dimensions show the largest gap.`
    },
    tryAgain: 'New match →', startNew: 'New Energy Scan →',
  },
}

function MatchResultsInner() {
  const searchParams = useSearchParams()
  const rawLang = searchParams.get('lang') ?? 'nl'
  const lang = (['nl', 'en'].includes(rawLang) ? rawLang : 'nl') as Lang
  const candidateParam = searchParams.get('candidate') ?? ''
  const jobParam = searchParams.get('job') ?? ''
  const titleParam = decodeURIComponent(searchParams.get('title') ?? '')
  const t = T[lang]
  const { DIMENSIONS } = getProfileContent(lang)

  // Decode
  let candidateScores: Record<string, number> = {}
  let jobScores: Record<string, number> = {}
  let ok = false
  try {
    candidateScores = JSON.parse(atob(decodeURIComponent(candidateParam))) as Record<string, number>
    jobScores = JSON.parse(atob(decodeURIComponent(jobParam))) as Record<string, number>
    ok = true
  } catch { /* fall through */ }

  if (!ok) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, padding: 24, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
        <p style={{ fontSize: 16, color: '#0F172A' }}>Geen matchdata gevonden.</p>
        <Link href="/bas_energy" style={{ padding: '12px 24px', borderRadius: 8, background: BRAND, color: '#fff', fontWeight: 700, textDecoration: 'none' }}>Start opnieuw →</Link>
      </div>
    )
  }

  // Calculate match per dimension
  // Match% = 100 - (|candidateScore - jobScore| / 3) * 100
  const dimMatches = DIMENSIONS.map(dim => {
    const c = candidateScores[dim.id] ?? 1
    const j = jobScores[dim.id] ?? 1
    const delta = Math.abs(c - j)
    const pct = Math.round(100 - (delta / 3) * 100)
    return { dim, candidateScore: c, jobScore: j, delta, pct }
  })

  const overallPct = Math.round(dimMatches.reduce((sum, m) => sum + m.pct, 0) / dimMatches.length)
  const overallC = overallColour(overallPct)
  const lowMatches = dimMatches.filter(m => m.pct < 65).sort((a, b) => a.pct - b.pct).slice(0, 3).map(m => ({ name: m.dim.name, pct: m.pct }))

  const insightText = t.insight(lowMatches)

  return (
    <div style={{ minHeight: '100vh', background: '#F7FAFC', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', height: 60, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/match_engine" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 900 }}>BW</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', lineHeight: 1.2, margin: 0 }}>Bas Westland</p>
              <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.2, margin: 0 }}>{t.subTitle}</p>
            </div>
          </Link>
          <Link href="/match_engine/start" style={{ fontSize: 13, color: '#64748B', textDecoration: 'none', fontWeight: 500 }}>{t.backLink}</Link>
        </div>
      </nav>

      {/* Hero with overall score */}
      <section style={{ background: overallC.bg, padding: '56px 24px 64px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', margin: '0 0 16px' }}>{t.resultTitle}{titleParam ? ` — ${titleParam}` : ''}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
            {/* Score circle */}
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: `4px solid ${overallC.ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{overallPct}%</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{t.overallLabel}</div>
              </div>
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: 900, color: '#fff', margin: '0 0 8px', lineHeight: 1.2 }}>{lang === 'nl' ? overallC.label : overallC.labelEn}</h1>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: 1.65, maxWidth: 440, margin: 0 }}>{lang === 'nl' ? overallC.desc : overallC.descEn}</p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Dimension breakdown */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '28px', border: '1px solid #E2E8F0', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 24px' }}>{t.dimsTitle}</h2>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: BRAND }} />
              <span style={{ fontSize: 12, color: '#64748B' }}>{t.candidateLabel}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: '#CBD5E0' }} />
              <span style={{ fontSize: 12, color: '#64748B' }}>{t.jobLabel}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {dimMatches.map(({ dim, candidateScore, jobScore, delta, pct }) => {
              const mc = matchColour(pct)
              const cPct = ((candidateScore - 1) / 3) * 100
              const jPct = ((jobScore - 1) / 3) * 100
              return (
                <div key={dim.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{dim.icon} {dim.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: mc.text, background: mc.bg, padding: '2px 10px', borderRadius: 100 }}>{lang === 'nl' ? mc.labelNl : mc.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{pct}%</span>
                    </div>
                  </div>

                  {/* Double bar: candidate + job */}
                  <div style={{ position: 'relative', marginBottom: 10 }}>
                    {/* Candidate bar */}
                    <div style={{ height: 10, background: '#F0FDF4', borderRadius: 100, marginBottom: 5, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ height: 10, borderRadius: 100, background: BRAND, width: `${cPct}%`, transition: 'width 0.6s ease' }} />
                      <div style={{ position: 'absolute', top: '50%', left: `${cPct}%`, transform: 'translate(-50%,-50%)', width: 14, height: 14, borderRadius: '50%', background: BRAND, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
                    </div>
                    {/* Job bar */}
                    <div style={{ height: 10, background: '#F8FAFC', borderRadius: 100, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ height: 10, borderRadius: 100, background: '#94A3B8', width: `${jPct}%`, transition: 'width 0.6s ease' }} />
                      <div style={{ position: 'absolute', top: '50%', left: `${jPct}%`, transform: 'translate(-50%,-50%)', width: 14, height: 14, borderRadius: '50%', background: '#64748B', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B' }}>
                    <span style={{ color: BRAND, fontWeight: 600 }}>K: {candidateScore.toFixed(1)}</span>
                    <span style={{ color: '#64748B' }}>{t.deltaLabel}: {delta.toFixed(1)}</span>
                    <span style={{ color: '#64748B', fontWeight: 600 }}>J: {jobScore.toFixed(1)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                    <span>{dim.lowLabel}</span>
                    <span>{dim.highLabel}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Talking points */}
        <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '24px 28px', border: '1px solid #E2E8F0', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: BRAND_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>💬</div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>{t.insightTitle}</p>
              <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.65, margin: 0 }}>{insightText}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href={`/match_engine/start?candidate=${candidateParam}&lang=${lang}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', borderRadius: 100, background: BRAND, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            {t.tryAgain}
          </Link>
          <Link href={`/bas_energy?lang=${lang}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', borderRadius: 100, background: 'transparent', color: '#0F172A', fontWeight: 600, fontSize: 14, textDecoration: 'none', border: '1.5px solid #E2E8F0' }}>
            {t.startNew}
          </Link>
        </div>

      </div>
    </div>
  )
}

export default function MatchResultsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F7FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${BRAND}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} /></div>}>
      <MatchResultsInner />
    </Suspense>
  )
}
