'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProfileContent } from '@/products/energy_profile/data'

type Lang = 'nl' | 'en'

const BRAND = '#0F7B55'
const BRAND_LIGHT = '#E6F4EF'

const T = {
  nl: {
    backLink: '← Terug', subTitle: 'Match Engine · e-people',
    badge: 'Stap 2 — Recruiter', title: 'Wat zoek jij in deze rol?',
    body: 'Geef per dimensie aan wat de ideale werkstijl is voor deze vacature. Gebruik de schaal 1–4.',
    jobLabel: 'Functietitel (optioneel)', jobPlaceholder: 'bijv. Senior IT Recruiter',
    scaleLabels: ['1 — Laag', '2', '3', '4 — Hoog'],
    matchBtn: 'Bekijk de match →', noCandidateTitle: 'Geen kandidaatprofiel gevonden',
    noCandidateBody: 'Laat de kandidaat eerst de Energy Scan doen. Daarna wordt hij automatisch doorgestuurd naar deze pagina.',
    noCandidateBtn: 'Ga naar Energy Scan →',
    lowHigh: (low: string, high: string) => `${low} → ${high}`,
  },
  en: {
    backLink: '← Back', subTitle: 'Match Engine · e-people',
    badge: 'Step 2 — Recruiter', title: 'What are you looking for in this role?',
    body: 'Indicate per dimension what the ideal work style is for this vacancy. Use the 1–4 scale.',
    jobLabel: 'Job title (optional)', jobPlaceholder: 'e.g. Senior IT Recruiter',
    scaleLabels: ['1 — Low', '2', '3', '4 — High'],
    matchBtn: 'View the match →', noCandidateTitle: 'No candidate profile found',
    noCandidateBody: 'Have the candidate complete the Energy Scan first. They will then be automatically directed to this page.',
    noCandidateBtn: 'Go to Energy Scan →',
    lowHigh: (low: string, high: string) => `${low} → ${high}`,
  },
}

function MatchStartInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const rawLang = searchParams.get('lang') ?? 'nl'
  const lang = (['nl', 'en'].includes(rawLang) ? rawLang : 'nl') as Lang
  const candidateParam = searchParams.get('candidate') ?? ''
  const t = T[lang]
  const { DIMENSIONS } = getProfileContent(lang)

  const [jobTitle, setJobTitle] = useState('')
  const [jobScores, setJobScores] = useState<Record<string, number>>({})

  // Parse candidate scores
  let candidateScores: Record<string, number> = {}
  let hasCandidateData = false
  try {
    candidateScores = JSON.parse(atob(decodeURIComponent(candidateParam))) as Record<string, number>
    hasCandidateData = Object.keys(candidateScores).length > 0
  } catch { /* no candidate data */ }

  const allAnswered = DIMENSIONS.every(d => jobScores[d.id] !== undefined)

  const handleMatch = () => {
    const matchParam = encodeURIComponent(btoa(JSON.stringify(jobScores)))
    const titleParam = encodeURIComponent(jobTitle)
    router.push(`/match_engine/match?candidate=${candidateParam}&job=${matchParam}&title=${titleParam}&lang=${lang}`)
  }

  if (!hasCandidateData) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, padding: 24, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🔍</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>{t.noCandidateTitle}</h1>
          <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.65, marginBottom: 28 }}>{t.noCandidateBody}</p>
          <Link href={`/bas_energy?lang=${lang}`} style={{ display: 'inline-block', padding: '13px 28px', borderRadius: 100, background: BRAND, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>{t.noCandidateBtn}</Link>
        </div>
      </div>
    )
  }

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
          <Link href="/match_engine" style={{ fontSize: 13, color: '#64748B', textDecoration: 'none', fontWeight: 500 }}>{t.backLink}</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px 80px' }}>
        <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: BRAND, border: `1px solid rgba(15,123,85,0.3)`, padding: '3px 12px', borderRadius: 4, marginBottom: 20 }}>{t.badge}</span>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', marginBottom: 8, lineHeight: 1.2 }}>{t.title}</h1>
        <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.65, marginBottom: 36 }}>{t.body}</p>

        {/* Job title input */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>{t.jobLabel}</label>
          <input
            type="text"
            placeholder={t.jobPlaceholder}
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
            style={{ width: '100%', padding: '11px 16px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, color: '#0F172A', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        {/* Dimension sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {DIMENSIONS.map(dim => {
            const selected = jobScores[dim.id]
            return (
              <div key={dim.id} style={{ background: '#fff', borderRadius: 12, padding: '22px 20px', border: `1.5px solid ${selected !== undefined ? BRAND : '#E2E8F0'}`, transition: 'border-color 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 20 }}>{dim.icon}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>{dim.name}</p>
                    <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>{t.lowHigh(dim.lowLabel, dim.highLabel)}</p>
                  </div>
                  {selected !== undefined && <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: BRAND, background: BRAND_LIGHT, padding: '2px 10px', borderRadius: 100 }}>{selected}/4</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {([1, 2, 3, 4] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setJobScores(prev => ({ ...prev, [dim.id]: v }))}
                      style={{ flex: 1, padding: '11px 0', borderRadius: 8, fontWeight: 700, fontSize: 16, border: `2px solid ${selected === v ? BRAND : '#E2E8F0'}`, background: selected === v ? BRAND : '#F8FAFC', color: selected === v ? '#fff' : '#CBD5E0', cursor: 'pointer', transition: 'all 0.15s' }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8', marginTop: 8 }}>
                  {t.scaleLabels.map(l => <span key={l}>{l}</span>)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Candidate preview */}
        <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 10, background: BRAND_LIGHT, border: `1px solid rgba(15,123,85,0.2)` }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: BRAND, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Kandidaatprofiel geladen ✓</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {DIMENSIONS.map(d => (
              <span key={d.id} style={{ fontSize: 12, color: '#334155' }}>
                {d.icon} {(candidateScores[d.id] ?? 0).toFixed(1)}
              </span>
            ))}
          </div>
        </div>

        <button
          disabled={!allAnswered}
          onClick={handleMatch}
          style={{ width: '100%', marginTop: 28, padding: '15px 24px', borderRadius: 10, background: allAnswered ? BRAND : '#E2E8F0', color: allAnswered ? '#fff' : '#94A3B8', fontWeight: 800, fontSize: 16, border: 'none', cursor: allAnswered ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}
        >
          {allAnswered ? t.matchBtn : `Nog ${DIMENSIONS.filter(d => jobScores[d.id] === undefined).length} dimensie${DIMENSIONS.filter(d => jobScores[d.id] === undefined).length !== 1 ? 's' : ''} in te vullen`}
        </button>
      </div>
    </div>
  )
}

export default function MatchStartPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F7FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${BRAND}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} /></div>}>
      <MatchStartInner />
    </Suspense>
  )
}
