'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProfileContent, type DimensionId } from '@/products/linkedin_scan/data'

type Lang = 'nl' | 'en'
type Step = 'role' | 'scan'

const BRAND = '#0F7B55'
const BRAND_D = '#085C3E'

const T = {
  nl: {
    stepBadge: 'Stap 1 van 3', selectTitle: 'Wat is jouw rol?',
    selectBody: 'Kies de optie die het best bij jouw dagelijkse LinkedIn-gebruik past.',
    selectCta: 'Start de 15 vragen →',
    dimOf: (a: number, b: number) => `Dimensie ${a} van ${b}`,
    prevBtn: '← Vorige', nextBtn: 'Volgende dimensie →',
    seeResultsBtn: 'Bekijk mijn scorekaart →',
    remainingBtn: (n: number) => `Nog ${n} vra${n !== 1 ? 'gen' : 'ag'}`,
    backLink: '← Terug', subTitle: 'LinkedIn Recruiter Scan · e-people',
    progressLabel: (n: number, total: number) => `${n}/${total} beantwoord`,
  },
  en: {
    stepBadge: 'Step 1 of 3', selectTitle: 'What is your role?',
    selectBody: 'Choose the option that best fits your daily LinkedIn usage.',
    selectCta: 'Start the 15 questions →',
    dimOf: (a: number, b: number) => `Dimension ${a} of ${b}`,
    prevBtn: '← Previous', nextBtn: 'Next dimension →',
    seeResultsBtn: 'See my scorecard →',
    remainingBtn: (n: number) => `${n} question${n !== 1 ? 's' : ''} remaining`,
    backLink: '← Back', subTitle: 'LinkedIn Recruiter Scan · e-people',
    progressLabel: (n: number, total: number) => `${n}/${total} answered`,
  },
}

function AssessHeader({ backHref, subTitle }: { backHref: string; subTitle: string }) {
  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #D8F0E6', height: 60, display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/linkedin_scan" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>BW</span>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0D2B20', lineHeight: 1.2, margin: 0 }}>Bas Westland</p>
            <p style={{ fontSize: 11, color: '#4D7A66', lineHeight: 1.2, margin: 0 }}>{subTitle}</p>
          </div>
        </Link>
        <Link href={backHref} style={{ fontSize: 13, color: '#4D7A66', textDecoration: 'none', fontWeight: 500 }}>← Terug</Link>
      </div>
    </nav>
  )
}

function LinkedInScanAssessInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const rawLang = searchParams.get('lang') ?? 'nl'
  const lang = (['nl', 'en'].includes(rawLang) ? rawLang : 'nl') as Lang
  const t = T[lang]
  const backHref = `/linkedin_scan?lang=${lang}`
  const { DIMENSIONS, QUESTIONS, ROLES } = getProfileContent(lang)

  const [step, setStep] = useState<Step>('role')
  const [roleId, setRoleId] = useState('')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [activeDimension, setActiveDimension] = useState(0)

  const goToResults = () => {
    const dimScores: Record<string, number> = {}
    DIMENSIONS.forEach(dim => {
      const qs   = QUESTIONS.filter(q => q.dimensionId === (dim.id as DimensionId))
      const vals = qs.map(q => answers[q.id] ?? 0).filter(Boolean)
      dimScores[dim.id] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 1
    })
    const encoded = encodeURIComponent(btoa(JSON.stringify(dimScores)))
    router.push(`/linkedin_scan/results?d=${encoded}&role=${roleId}&lang=${lang}`)
  }

  if (step === 'role') {
    return (
      <div style={{ minHeight: '100vh', background: '#F2FAF6', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <AssessHeader backHref={backHref} subTitle={t.subTitle} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)', padding: '48px 24px' }}>
          <div style={{ width: '100%', maxWidth: 540 }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: BRAND, border: `1px solid ${BRAND}44`, padding: '3px 12px', borderRadius: 4, marginBottom: 20 }}>{t.stepBadge}</span>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0D2B20', marginBottom: 8, lineHeight: 1.2 }}>{t.selectTitle}</h1>
            <p style={{ fontSize: 15, color: '#4D7A66', lineHeight: 1.65, marginBottom: 32 }}>{t.selectBody}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
              {ROLES.map(r => (
                <button key={r.id} onClick={() => setRoleId(r.id)} style={{ textAlign: 'left', padding: '16px 18px', borderRadius: 10, border: `2px solid ${roleId === r.id ? BRAND : '#D8F0E6'}`, background: roleId === r.id ? '#E8F7F0' : '#fff', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0D2B20', margin: '0 0 4px' }}>{r.label}</p>
                  <p style={{ fontSize: 12, color: '#4D7A66', lineHeight: 1.5, margin: 0 }}>{r.description}</p>
                </button>
              ))}
            </div>
            <button disabled={!roleId} onClick={() => setStep('scan')} style={{ width: '100%', padding: '14px 24px', borderRadius: 8, background: roleId ? BRAND : '#D8F0E6', color: roleId ? '#fff' : '#4D7A66', fontWeight: 700, fontSize: 15, border: 'none', cursor: roleId ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
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
    <div style={{ minHeight: '100vh', background: '#F2FAF6', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <AssessHeader backHref={backHref} subTitle={t.subTitle} />

      {/* Progress bar */}
      <div style={{ height: 3, background: '#D8F0E6' }}>
        <div style={{ height: 3, transition: 'width 0.4s ease', width: `${progress}%`, background: BRAND }} />
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 24px 72px' }}>
        <p style={{ fontSize: 12, color: '#4D7A66', textAlign: 'right', marginBottom: 12 }}>{t.progressLabel(totalAnswered, QUESTIONS.length)}</p>

        {/* Dimension tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
          {DIMENSIONS.map((dim, i) => {
            const dQs    = QUESTIONS.filter(q => q.dimensionId === dim.id)
            const done   = dQs.every(q => answers[q.id] !== undefined)
            const isActive = activeDimension === i
            return (
              <button key={dim.id} onClick={() => setActiveDimension(i)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, border: `1.5px solid ${isActive ? BRAND : done ? BRAND + '55' : '#D8F0E6'}`, background: isActive ? BRAND : done ? '#E8F7F0' : '#fff', color: isActive ? '#fff' : done ? BRAND : '#4D7A66', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                {done && !isActive ? '✓ ' : ''}{dim.icon} {dim.name}
              </button>
            )
          })}
        </div>

        {/* Dimension header */}
        <div style={{ marginBottom: 24 }}>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: BRAND, border: `1px solid ${BRAND}44`, padding: '3px 12px', borderRadius: 4, marginBottom: 12 }}>
            {t.dimOf(activeDimension + 1, DIMENSIONS.length)}
          </span>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0D2B20', marginBottom: 6, letterSpacing: '-0.01em' }}>{dimension.icon} {dimension.name}</h2>
          <p style={{ fontSize: 14, color: '#4D7A66', lineHeight: 1.65, maxWidth: 600 }}>{dimension.description}</p>
        </div>

        {/* Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {dimQs.map(q => {
            const selected = answers[q.id]
            return (
              <div key={q.id} style={{ background: '#fff', borderRadius: 14, padding: '24px 22px', border: '1px solid #D8F0E6' }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#0D2B20', marginBottom: 16, lineHeight: 1.6 }}>{q.text}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {q.options.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.value }))}
                      style={{
                        textAlign: 'left', padding: '12px 16px', borderRadius: 8,
                        border: `2px solid ${selected === opt.value ? BRAND : '#D8F0E6'}`,
                        background: selected === opt.value ? '#E8F7F0' : '#FAFAFA',
                        cursor: 'pointer', transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: 12,
                      }}
                    >
                      <span style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${selected === opt.value ? BRAND : '#D8F0E6'}`, background: selected === opt.value ? BRAND : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, color: '#fff', fontWeight: 900 }}>
                        {selected === opt.value ? '✓' : opt.value}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: selected === opt.value ? 700 : 500, color: selected === opt.value ? '#0D2B20' : '#4D7A66', lineHeight: 1.5 }}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          {activeDimension > 0 && (
            <button onClick={() => setActiveDimension(a => a - 1)} style={{ flex: 1, padding: '13px 24px', borderRadius: 8, border: '1.5px solid #D8F0E6', background: '#fff', fontWeight: 600, fontSize: 14, color: '#0D2B20', cursor: 'pointer' }}>
              {t.prevBtn}
            </button>
          )}
          {activeDimension < DIMENSIONS.length - 1 ? (
            <button disabled={!dimAnswered} onClick={() => setActiveDimension(a => a + 1)} style={{ flex: 1, padding: '13px 24px', borderRadius: 8, background: 'transparent', color: dimAnswered ? BRAND : '#4D7A66', border: `2px solid ${dimAnswered ? BRAND : '#D8F0E6'}`, fontWeight: 700, fontSize: 14, cursor: dimAnswered ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
              {t.nextBtn}
            </button>
          ) : (
            <button disabled={totalAnswered < QUESTIONS.length} onClick={goToResults} style={{ flex: 1, padding: '13px 24px', borderRadius: 8, background: totalAnswered >= QUESTIONS.length ? BRAND : '#D8F0E6', color: totalAnswered >= QUESTIONS.length ? '#fff' : '#4D7A66', border: 'none', fontWeight: 700, fontSize: 14, cursor: totalAnswered >= QUESTIONS.length ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
              {totalAnswered < QUESTIONS.length ? t.remainingBtn(QUESTIONS.length - totalAnswered) : t.seeResultsBtn}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LinkedInScanAssessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F2FAF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #0F7B55', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} /></div>}>
      <LinkedInScanAssessInner />
    </Suspense>
  )
}
