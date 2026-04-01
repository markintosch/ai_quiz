'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProfileContent, type DimensionId } from '@/products/energy_profile/data'

// Colours: coral=#2C2447 navy=#2C2447 (all inlined)
type Lang = 'nl' | 'en'
type Step = 'role' | 'scan'

const T = {
  nl: {
    stepBadge: 'Stap 1 van 3', selectTitle: 'Wat is jouw situatie?',
    selectBody: 'Kies de optie die het best bij jouw huidige werkervaring past.',
    selectCta: 'Start de 15 vragen →',
    dimOf: (a: number, b: number) => `Dimensie ${a} van ${b}`,
    scaleLabels: ['Helemaal niet', 'Soms', 'Vaak', 'Volledig'] as const,
    prevBtn: '← Vorige', nextBtn: 'Volgende dimensie →',
    seeResultsBtn: 'Bekijk mijn profiel →',
    remainingBtn: (n: number) => `Nog ${n} vra${n !== 1 ? 'gen' : 'ag'}`,
    backLink: '← Terug', subTitle: 'Energy Profile · Hire.nl',
    progressLabel: (n: number, total: number) => `${n}/${total} beantwoord`,
  },
  en: {
    stepBadge: 'Step 1 of 3', selectTitle: 'What is your situation?',
    selectBody: 'Choose the option that best matches your current work experience.',
    selectCta: 'Start the 15 questions →',
    dimOf: (a: number, b: number) => `Dimension ${a} of ${b}`,
    scaleLabels: ['Not at all', 'Somewhat', 'Often', 'Fully'] as const,
    prevBtn: '← Previous', nextBtn: 'Next dimension →',
    seeResultsBtn: 'See my profile →',
    remainingBtn: (n: number) => `${n} question${n !== 1 ? 's' : ''} remaining`,
    backLink: '← Back', subTitle: 'Energy Profile · Hire.nl',
    progressLabel: (n: number, total: number) => `${n}/${total} answered`,
  },
}

function AssessHeader({ backHref, backLabel, subTitle }: { backHref: string; backLabel: string; subTitle: string }) {
  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', height: 60, display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/energy_profile" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2C2447', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 900 }}>LD</span>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#2C2447', lineHeight: 1.2, margin: 0 }}>Laura Dijcks</p>
            <p style={{ fontSize: 11, color: '#696284', lineHeight: 1.2, margin: 0 }}>{subTitle}</p>
          </div>
        </Link>
        <Link href={backHref} style={{ fontSize: 13, color: '#696284', textDecoration: 'none', fontWeight: 500 }}>{backLabel}</Link>
      </div>
    </nav>
  )
}

function EnergyProfileAssessInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const rawLang = searchParams.get('lang') ?? 'nl'
  const lang = (['nl', 'en'].includes(rawLang) ? rawLang : 'nl') as Lang
  const t = T[lang]
  const backHref = `/energy_profile?lang=${lang}`
  const { DIMENSIONS, QUESTIONS, ROLES } = getProfileContent(lang)

  const [step, setStep] = useState<Step>('role')
  const [roleId, setRoleId] = useState('')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [activeDimension, setActiveDimension] = useState(0)

  const goToResults = () => {
    const dimScores: Record<string, number> = {}
    DIMENSIONS.forEach(dim => {
      const qs = QUESTIONS.filter(q => q.dimensionId === (dim.id as DimensionId))
      const vals = qs.map(q => answers[q.id] ?? 0).filter(Boolean)
      dimScores[dim.id] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 1
    })
    const encoded = encodeURIComponent(btoa(JSON.stringify(dimScores)))
    router.push(`/energy_profile/results?d=${encoded}&role=${roleId}&lang=${lang}`)
  }

  if (step === 'role') {
    return (
      <div style={{ minHeight: '100vh', background: '#F7FAFC', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
        <AssessHeader backHref={backHref} backLabel={t.backLink} subTitle={t.subTitle} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)', padding: '48px 24px' }}>
          <div style={{ width: '100%', maxWidth: 540 }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2C2447', border: '1px solid rgba(232,73,26,0.25)', padding: '3px 12px', borderRadius: 4, marginBottom: 20 }}>{t.stepBadge}</span>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#2C2447', marginBottom: 8, lineHeight: 1.2 }}>{t.selectTitle}</h1>
            <p style={{ fontSize: 15, color: '#696284', lineHeight: 1.65, marginBottom: 32 }}>{t.selectBody}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
              {ROLES.map(r => (
                <button key={r.id} onClick={() => setRoleId(r.id)} style={{ textAlign: 'left', padding: '16px 18px', borderRadius: 10, border: `2px solid ${roleId === r.id ? '#2C2447' : '#E2E8F0'}`, background: roleId === r.id ? '#FFF3EE' : '#fff', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: roleId === r.id ? '#2C2447' : '#2C2447', margin: '0 0 4px' }}>{r.label}</p>
                  <p style={{ fontSize: 12, color: '#696284', lineHeight: 1.5, margin: 0 }}>{r.description}</p>
                </button>
              ))}
            </div>
            <button disabled={!roleId} onClick={() => setStep('scan')} style={{ width: '100%', padding: '14px 24px', borderRadius: 8, background: roleId ? '#2C2447' : '#E2E8F0', color: roleId ? '#fff' : '#696284', fontWeight: 700, fontSize: 15, border: 'none', cursor: roleId ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
              {t.selectCta}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const dimension = DIMENSIONS[activeDimension]
  const dimQs = QUESTIONS.filter(q => q.dimensionId === (dimension.id as DimensionId))
  const dimAnswered = dimQs.every(q => answers[q.id] !== undefined)
  const totalAnswered = Object.keys(answers).length
  const progress = Math.round((totalAnswered / QUESTIONS.length) * 100)

  return (
    <div style={{ minHeight: '100vh', background: '#F7FAFC', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <AssessHeader backHref={backHref} backLabel={t.backLink} subTitle={t.subTitle} />
      <div style={{ height: 3, background: '#E2E8F0' }}>
        <div style={{ height: 3, transition: 'width 0.4s ease', width: `${progress}%`, background: '#2C2447' }} />
      </div>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 24px 72px' }}>
        <p style={{ fontSize: 12, color: '#696284', textAlign: 'right', marginBottom: 12 }}>{t.progressLabel(totalAnswered, QUESTIONS.length)}</p>
        <div style={{ display: 'flex', gap: 6, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
          {DIMENSIONS.map((dim, i) => {
            const dQs = QUESTIONS.filter(q => q.dimensionId === dim.id)
            const done = dQs.every(q => answers[q.id] !== undefined)
            const isActive = activeDimension === i
            return (
              <button key={dim.id} onClick={() => setActiveDimension(i)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, border: `1.5px solid ${isActive ? '#2C2447' : done ? 'rgba(232,73,26,0.35)' : '#E2E8F0'}`, background: isActive ? '#2C2447' : done ? '#FFF3EE' : '#fff', color: isActive ? '#fff' : done ? '#2C2447' : '#696284', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                {done && !isActive ? '✓ ' : ''}{dim.icon} {dim.name}
              </button>
            )
          })}
        </div>
        <div style={{ marginBottom: 24 }}>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2C2447', border: '1px solid rgba(232,73,26,0.25)', padding: '3px 12px', borderRadius: 4, marginBottom: 12 }}>
            {t.dimOf(activeDimension + 1, DIMENSIONS.length)}
          </span>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#2C2447', marginBottom: 6, letterSpacing: '-0.01em' }}>{dimension.icon} {dimension.name}</h2>
          <p style={{ fontSize: 14, color: '#696284', lineHeight: 1.65, maxWidth: 600 }}>{dimension.description}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {dimQs.map(q => {
            const selected = answers[q.id]
            return (
              <div key={q.id} style={{ background: '#fff', borderRadius: 12, padding: '24px 22px', border: '1px solid #E2E8F0' }}>
                <p style={{ fontSize: 15, fontWeight: 500, color: '#2C2447', marginBottom: 18, lineHeight: 1.65 }}>{q.text}</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  {([1, 2, 3, 4] as const).map(v => (
                    <button key={v} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: v }))} style={{ flex: 1, padding: '11px 0', borderRadius: 8, fontWeight: 700, fontSize: 16, border: `2px solid ${selected === v ? '#2C2447' : '#E2E8F0'}`, background: selected === v ? '#2C2447' : '#F7FAFC', color: selected === v ? '#fff' : '#CBD5E0', cursor: 'pointer', transition: 'all 0.15s' }}>
                      {v}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#CBD5E0', marginBottom: 12 }}>
                  {t.scaleLabels.map(label => <span key={label}>{label}</span>)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#696284' }}>
                  <span style={{ maxWidth: '45%' }}>{q.lowAnchor}</span>
                  <span style={{ textAlign: 'right', maxWidth: '45%' }}>{q.highAnchor}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          {activeDimension > 0 && (
            <button onClick={() => setActiveDimension(a => a - 1)} style={{ flex: 1, padding: '13px 24px', borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#fff', fontWeight: 600, fontSize: 14, color: '#2C2447', cursor: 'pointer' }}>
              {t.prevBtn}
            </button>
          )}
          {activeDimension < DIMENSIONS.length - 1 ? (
            <button disabled={!dimAnswered} onClick={() => setActiveDimension(a => a + 1)} style={{ flex: 1, padding: '13px 24px', borderRadius: 8, background: 'transparent', color: dimAnswered ? '#2C2447' : '#696284', border: dimAnswered ? '2px solid #2C2447' : '2px solid #E2E8F0', fontWeight: 700, fontSize: 14, cursor: dimAnswered ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
              {t.nextBtn}
            </button>
          ) : (
            <button disabled={totalAnswered < QUESTIONS.length} onClick={goToResults} style={{ flex: 1, padding: '13px 24px', borderRadius: 8, background: totalAnswered >= QUESTIONS.length ? '#2C2447' : '#E2E8F0', color: totalAnswered >= QUESTIONS.length ? '#fff' : '#696284', border: 'none', fontWeight: 700, fontSize: 14, cursor: totalAnswered >= QUESTIONS.length ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
              {totalAnswered < QUESTIONS.length ? t.remainingBtn(QUESTIONS.length - totalAnswered) : t.seeResultsBtn}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EnergyProfileAssessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F7FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #2C2447', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} /></div>}>
      <EnergyProfileAssessInner />
    </Suspense>
  )
}
