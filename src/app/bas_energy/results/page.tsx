'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  getProfileContent,
  getDimensionProfile,
  profileColour,
  type DimensionId,
} from '@/products/energy_profile/data'

type Lang = 'nl' | 'en'

const BRAND = '#0F7B55'
const BRAND_LIGHT = '#E6F4EF'

const T = {
  nl: {
    backLink: '← Terug', subTitle: 'Energy Profile · e-people',
    heroTitle: 'Jouw Energy Profile', scoreLabel: 'Gemiddelde score',
    dimsTitle: 'Jouw 5 dimensies', insightTitle: 'Wat dit over jou zegt',
    insightCards: (highDim: string, lowDim: string) => ([
      { title: `Jouw kracht: ${highDim}`, body: 'Dit is jouw sterkste dimensie. Hier ben jij op je best en haal jij de meeste energie uit. Leg dit bewust in gesprekken.' },
      { title: `Jouw balanszone: ${lowDim}`, body: 'Hier ligt jouw intern geankerde stijl. Dat is geen zwakte — het betekent dat je rust en diepgang waardeert in dit domein.' },
      { title: 'Volgende stap', body: 'Gebruik dit profiel als basis voor de Match Engine. Zo zie je direct hoe jij past bij een specifieke vacature of team.' },
    ]),
    matchTitle: 'Klaar voor de match?',
    matchBody: 'Deel jouw profiel met de recruiter. De Match Engine vergelijkt jouw werkstijl met het gewenste profiel van de vacature.',
    matchBtn: 'Start Match Engine →',
    noResults: 'Geen resultaten gevonden.', startScan: 'Start de scan →',
  },
  en: {
    backLink: '← Back', subTitle: 'Energy Profile · e-people',
    heroTitle: 'Your Energy Profile', scoreLabel: 'Average score',
    dimsTitle: 'Your 5 dimensions', insightTitle: 'What this says about you',
    insightCards: (highDim: string, lowDim: string) => ([
      { title: `Your strength: ${highDim}`, body: 'This is your strongest dimension. You are at your best here and draw the most energy from it. Bring this up in conversations.' },
      { title: `Your balance zone: ${lowDim}`, body: 'This is where your internally anchored style lives. That is not a weakness — it means you value calm and depth in this area.' },
      { title: 'Next step', body: 'Use this profile as the basis for the Match Engine. See directly how you fit a specific vacancy or team.' },
    ]),
    matchTitle: 'Ready for the match?',
    matchBody: 'Share your profile with the recruiter. The Match Engine compares your work style with the desired profile of the vacancy.',
    matchBtn: 'Start Match Engine →',
    noResults: 'No results found.', startScan: 'Start the scan →',
  },
}

function BasEnergyResultsInner() {
  const searchParams = useSearchParams()
  const rawLang = searchParams.get('lang') ?? 'nl'
  const lang = (['nl', 'en'].includes(rawLang) ? rawLang : 'nl') as Lang
  const roleId = searchParams.get('role') ?? ''
  const encoded = searchParams.get('d') ?? ''
  const t = T[lang]
  const { DIMENSIONS, ROLES } = getProfileContent(lang)
  const backHref = `/bas_energy?lang=${lang}`
  const assessHref = `/bas_energy/assess?lang=${lang}`

  let dimScores: Record<string, number> = {}
  let decodeOk = false
  try { dimScores = JSON.parse(atob(decodeURIComponent(encoded))) as Record<string, number>; decodeOk = true } catch { /* show error */ }

  if (!encoded || !decodeOk) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, padding: 24, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
        <p style={{ fontSize: 16, color: '#0F172A' }}>{t.noResults}</p>
        <Link href={assessHref} style={{ padding: '12px 24px', borderRadius: 8, background: BRAND, color: '#fff', fontWeight: 700, textDecoration: 'none' }}>{t.startScan}</Link>
      </div>
    )
  }

  const scores = Object.values(dimScores)
  const avgScore = scores.length ? (scores as number[]).reduce((a, b) => a + b, 0) / scores.length : 1
  const colour = profileColour(avgScore)
  const label = lang === 'nl' ? colour.label : colour.labelEn
  const desc = lang === 'nl' ? colour.description : colour.descriptionEn
  const role = ROLES.find(r => r.id === roleId)
  const ranked = DIMENSIONS.map(dim => ({ dim, score: dimScores[dim.id] ?? 1 })).sort((a, b) => b.score - a.score)
  const highDim = ranked[0]?.dim.name ?? ''
  const lowDim = ranked[ranked.length - 1]?.dim.name ?? ''
  const insightCards = t.insightCards(highDim, lowDim)

  // Build the candidate param for the Match Engine
  const candidateParam = encodeURIComponent(btoa(JSON.stringify(dimScores)))
  const matchHref = `/match_engine/start?candidate=${candidateParam}&lang=${lang}`

  return (
    <div style={{ minHeight: '100vh', background: '#F7FAFC', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', height: 60, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/bas_energy" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 900 }}>BW</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', lineHeight: 1.2, margin: 0 }}>Bas Westland</p>
              <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.2, margin: 0 }}>{t.subTitle}</p>
            </div>
          </Link>
          <Link href={backHref} style={{ fontSize: 13, color: '#64748B', textDecoration: 'none', fontWeight: 500 }}>{t.backLink}</Link>
        </div>
      </nav>

      <section style={{ background: BRAND, padding: '56px 24px 64px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff', background: 'rgba(255,255,255,0.18)', padding: '5px 16px', borderRadius: 100, marginBottom: 20 }}>{label}</span>
          <h1 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 900, color: '#fff', margin: '0 0 20px', lineHeight: 1.2 }}>{t.heroTitle}</h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 20, background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '20px 28px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#fff', flexShrink: 0, border: '2px solid rgba(255,255,255,0.35)' }}>{avgScore.toFixed(1)}</div>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>{t.scoreLabel}</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>{label}</p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', maxWidth: 440, lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          </div>
          {role && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 16 }}>{role.label}</p>}
        </div>
      </section>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Dimension bars */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '28px', border: '1px solid #E2E8F0', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 24px' }}>{t.dimsTitle}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {DIMENSIONS.map(dim => {
              const score = dimScores[dim.id as DimensionId] ?? 1
              const profLabel = getDimensionProfile(score, dim.id as DimensionId, lang)
              const pct = ((score - 1) / 3) * 100
              return (
                <div key={dim.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{dim.icon} {dim.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: BRAND, background: BRAND_LIGHT, padding: '2px 10px', borderRadius: 100 }}>{profLabel}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>{score.toFixed(1)}/4</span>
                    </div>
                  </div>
                  <div style={{ position: 'relative', height: 8, background: '#EEF2F7', borderRadius: 100, overflow: 'visible', marginBottom: 6 }}>
                    <div style={{ height: 8, borderRadius: 100, background: `linear-gradient(90deg, rgba(15,123,85,0.15) 0%, ${BRAND} 100%)`, width: `${pct}%` }} />
                    <div style={{ position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%,-50%)', width: 16, height: 16, borderRadius: '50%', background: BRAND, border: '2px solid #fff', boxShadow: '0 2px 6px rgba(15,123,85,0.4)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B' }}>
                    <span>{dim.lowLabel}</span>
                    <span style={{ textAlign: 'right', maxWidth: '45%' }}>{dim.highLabel}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Insight cards */}
        <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '28px', border: '1px solid #E2E8F0', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 20px' }}>{t.insightTitle}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
            {insightCards.map((card, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '20px', border: '1px solid #E2E8F0' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: BRAND_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 12 }}>
                  {i === 0 ? '⚡' : i === 1 ? '🧘' : '🎯'}
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>{card.title}</p>
                <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.65, margin: 0 }}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Match Engine CTA */}
        <div style={{ background: BRAND, borderRadius: 16, padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔗</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 10px', lineHeight: 1.3 }}>{t.matchTitle}</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, maxWidth: 440, margin: '0 auto 28px' }}>{t.matchBody}</p>
          <Link href={matchHref} style={{ display: 'inline-block', background: '#fff', color: BRAND, fontWeight: 800, fontSize: 16, padding: '14px 36px', borderRadius: 100, textDecoration: 'none', boxShadow: '0 6px 20px rgba(0,0,0,0.15)' }}>{t.matchBtn}</Link>
        </div>

      </div>
    </div>
  )
}

export default function BasEnergyResultsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F7FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${BRAND}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} /></div>}>
      <BasEnergyResultsInner />
    </Suspense>
  )
}
