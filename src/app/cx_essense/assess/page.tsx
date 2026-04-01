'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCxContent } from '@/products/cx_essense/data'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const GREEN       = '#24CF7A'
const GREEN_DARK  = '#044524'
const GREEN_LIGHT = '#EAF5F2'
const DARK        = '#1A1A2E'
const BODY        = '#374151'
const MUTED       = '#94A3B8'

type Step = 'select' | 'assess'

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  en: {
    stepBadge:    (n: number) => `Step ${n} of 3`,
    selectTitle:  'What is your role?',
    selectBody:   'Different roles see different facets of CX maturity. Your context shapes the picture.',
    selectCta:    'Start the 24 questions →',
    dimOf:        (a: number, b: number) => `Dimension ${a} of ${b}`,
    scaleLabels:  ['Not at all', 'Somewhat', 'Often', 'Fully'],
    prevBtn:      '← Previous',
    nextBtn:      'Next dimension →',
    remainingBtn: (n: number) => `${n} question${n !== 1 ? 's' : ''} remaining`,
    seeResultsBtn:'See my results →',
    backLink:     '← Back to overview',
    subTitle:     'CX Maturity Assessment',
  },
  nl: {
    stepBadge:    (n: number) => `Stap ${n} van 3`,
    selectTitle:  'Wat is jouw rol?',
    selectBody:   'Verschillende rollen zien verschillende facetten van CX-volwassenheid. Jouw context bepaalt het beeld.',
    selectCta:    'Start de 24 vragen →',
    dimOf:        (a: number, b: number) => `Dimensie ${a} van ${b}`,
    scaleLabels:  ['Helemaal niet', 'Soms', 'Vaak', 'Volledig'],
    prevBtn:      '← Vorige',
    nextBtn:      'Volgende dimensie →',
    remainingBtn: (n: number) => `Nog ${n} vra${n !== 1 ? 'gen' : 'ag'}`,
    seeResultsBtn:'Bekijk mijn resultaten →',
    backLink:     '← Terug naar overzicht',
    subTitle:     'CX Volwassenheidsassessment',
  },
}

// ── Inner component ────────────────────────────────────────────────────────────
function CxEssenseAssessInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const lang         = (searchParams.get('lang') === 'nl' ? 'nl' : 'en') as 'en' | 'nl'
  const t            = T[lang]
  const { DIMENSIONS, QUESTIONS, ROLES } = getCxContent(lang)
  const backHref     = lang === 'nl' ? '/cx_essense?lang=nl' : '/cx_essense'

  const [step, setStep]           = useState<Step>('select')
  const [roleId, setRoleId]       = useState('')
  const [answers, setAnswers]     = useState<Record<string, number>>({})
  const [activeDim, setActiveDim] = useState(0)

  // ── Navigate to results page with encoded scores ──────────────────────────
  const goToResults = () => {
    const dimScores: Record<string, number> = {}
    DIMENSIONS.forEach(d => {
      const qs   = QUESTIONS.filter(q => q.dimensionId === d.id)
      const vals = qs.map(q => answers[q.id] ?? 0).filter(Boolean)
      dimScores[d.id] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 1
    })
    const encoded = encodeURIComponent(btoa(JSON.stringify(dimScores)))
    router.push(`/cx_essense/results?d=${encoded}&role=${roleId}&lang=${lang}`)
  }

  // ── Step 1: role selection ────────────────────────────────────────────────
  if (step === 'select') {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFBFD', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <AssessHeader backHref={backHref} backLabel={t.backLink} subTitle={t.subTitle} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '48px 24px' }}>
          <div style={{ width: '100%', maxWidth: 520 }}>

            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: GREEN_DARK, background: GREEN_LIGHT, padding: '3px 12px', borderRadius: 100, marginBottom: 20 }}>
              {t.stepBadge(1)}
            </span>

            <h1 style={{ fontSize: 28, fontWeight: 900, color: DARK, marginBottom: 8, lineHeight: 1.2 }}>
              {t.selectTitle}
            </h1>
            <p style={{ fontSize: 15, color: BODY, lineHeight: 1.65, marginBottom: 32 }}>
              {t.selectBody}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRoleId(r.id)}
                  style={{
                    textAlign: 'left', padding: '16px 18px', borderRadius: 16,
                    border: `2px solid ${roleId === r.id ? GREEN : '#E2E8F0'}`,
                    background: roleId === r.id ? GREEN_LIGHT : '#fff',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <p style={{ fontSize: 14, fontWeight: 700, color: roleId === r.id ? GREEN_DARK : DARK, marginBottom: 4 }}>{r.label}</p>
                  <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{r.description}</p>
                </button>
              ))}
            </div>

            <button
              disabled={!roleId}
              onClick={() => setStep('assess')}
              style={{
                width: '100%', padding: '14px 24px', borderRadius: 100,
                background: roleId ? `linear-gradient(135deg, ${GREEN}, #1DB865)` : '#E2E8F0',
                color: roleId ? '#fff' : MUTED,
                fontWeight: 700, fontSize: 15, border: 'none', cursor: roleId ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
              }}
            >
              {t.selectCta}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 2: questions ─────────────────────────────────────────────────────
  const dim          = DIMENSIONS[activeDim]
  const dimQuestions = QUESTIONS.filter(q => q.dimensionId === dim.id)
  const dimAnswered  = dimQuestions.every(q => answers[q.id] !== undefined)
  const totalAnswered = Object.keys(answers).length
  const progress     = Math.round((totalAnswered / QUESTIONS.length) * 100)

  return (
    <div style={{ minHeight: '100vh', background: '#FAFBFD', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <AssessHeader backHref={backHref} backLabel={t.backLink} subTitle={t.subTitle} />

      {/* Progress bar */}
      <div style={{ height: 3, background: '#EEF2F7' }}>
        <div style={{ height: 3, transition: 'width 0.4s ease', width: `${progress}%`, background: `linear-gradient(90deg, ${GREEN_DARK}, ${GREEN})` }} />
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Dimension tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
          {DIMENSIONS.map((d, i) => {
            const dimQs = QUESTIONS.filter(q => q.dimensionId === d.id)
            const done  = dimQs.every(q => answers[q.id] !== undefined)
            return (
              <button
                key={d.id}
                onClick={() => setActiveDim(i)}
                style={{
                  flexShrink: 0, padding: '6px 14px', borderRadius: 100,
                  fontSize: 12, fontWeight: 700, border: '2px solid',
                  borderColor: activeDim === i ? GREEN : done ? `${GREEN}44` : '#E2E8F0',
                  background: activeDim === i ? GREEN_DARK : done ? GREEN_LIGHT : '#fff',
                  color: activeDim === i ? '#fff' : done ? GREEN_DARK : MUTED,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {done && activeDim !== i ? '✓ ' : ''}{d.short}
              </button>
            )
          })}
        </div>

        {/* Dimension header */}
        <div style={{ marginBottom: 24 }}>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: GREEN_DARK, background: GREEN_LIGHT, padding: '3px 12px', borderRadius: 100, marginBottom: 10 }}>
            {t.dimOf(activeDim + 1, DIMENSIONS.length)}
          </span>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: DARK, marginBottom: 4 }}>
            {dim.icon} {dim.name}
          </h2>
          <p style={{ fontSize: 14, color: BODY, lineHeight: 1.65 }}>{dim.description}</p>
        </div>

        {/* Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {dimQuestions.map(q => {
            const selected = answers[q.id]
            return (
              <div key={q.id} style={{ background: '#fff', borderRadius: 20, padding: '24px 22px', border: '1px solid #EEF2F7', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: DARK, marginBottom: 12, lineHeight: 1.55 }}>{q.text}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: MUTED, marginBottom: 10 }}>
                  <span>{q.lowAnchor}</span>
                  <span style={{ textAlign: 'right' }}>{q.highAnchor}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4].map(v => {
                    const isSelected   = selected === v
                    const accentColor  = v <= 2 ? '#F59E0B' : GREEN
                    return (
                      <button
                        key={v}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: v }))}
                        style={{
                          flex: 1, padding: '10px 0', borderRadius: 12, fontWeight: 700, fontSize: 16,
                          border: `2px solid ${isSelected ? accentColor : '#E2E8F0'}`,
                          background: isSelected ? accentColor : '#F8FAFC',
                          color: isSelected ? '#fff' : '#CBD5E1',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        {v}
                      </button>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#CBD5E1', marginTop: 6 }}>
                  {t.scaleLabels.map(label => <span key={label}>{label}</span>)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          {activeDim > 0 && (
            <button
              onClick={() => setActiveDim(a => a - 1)}
              style={{ flex: 1, padding: '13px 24px', borderRadius: 100, border: '2px solid #E2E8F0', background: '#fff', fontWeight: 600, fontSize: 14, color: BODY, cursor: 'pointer' }}
            >
              {t.prevBtn}
            </button>
          )}
          {activeDim < DIMENSIONS.length - 1 ? (
            <button
              disabled={!dimAnswered}
              onClick={() => setActiveDim(a => a + 1)}
              style={{
                flex: 1, padding: '13px 24px', borderRadius: 100,
                background: dimAnswered ? GREEN_DARK : '#E2E8F0',
                color: dimAnswered ? '#fff' : MUTED,
                fontWeight: 700, fontSize: 14, border: 'none',
                cursor: dimAnswered ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
              }}
            >
              {t.nextBtn}
            </button>
          ) : (
            <button
              disabled={totalAnswered < QUESTIONS.length}
              onClick={goToResults}
              style={{
                flex: 1, padding: '13px 24px', borderRadius: 100,
                background: totalAnswered >= QUESTIONS.length ? `linear-gradient(135deg, ${GREEN}, #1DB865)` : '#E2E8F0',
                color: totalAnswered >= QUESTIONS.length ? '#fff' : MUTED,
                fontWeight: 700, fontSize: 14, border: 'none',
                cursor: totalAnswered >= QUESTIONS.length ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
              }}
            >
              {totalAnswered < QUESTIONS.length ? t.remainingBtn(QUESTIONS.length - totalAnswered) : t.seeResultsBtn}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Shared header ─────────────────────────────────────────────────────────────
function AssessHeader({ backHref, backLabel, subTitle }: { backHref: string; backLabel: string; subTitle: string }) {
  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #EEF2F7', height: 64, display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href={backHref} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: GREEN_DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: GREEN, fontSize: 18, fontWeight: 900 }}>e</span>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: DARK, lineHeight: 1.2 }}>Essense</p>
            <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.2 }}>{subTitle}</p>
          </div>
        </Link>
        <Link href={backHref} style={{ fontSize: 13, color: MUTED, textDecoration: 'none', fontWeight: 500 }}>
          {backLabel}
        </Link>
      </div>
    </nav>
  )
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function CxEssenseAssessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#FAFBFD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid #24CF7A`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <CxEssenseAssessInner />
    </Suspense>
  )
}
