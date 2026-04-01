'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getScanContent, type PillarId } from '@/products/marketing_scan/data'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const ACCENT  = '#F55200'
const DARK    = '#0A0A0A'
const PRIMARY = '#111111'
const MUTED   = '#6B7280'
const BORDER  = '#E5E7EB'
const BG_GRAY = '#F7F7F7'
const AMBER   = '#F59E0B'
const FONT    = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

type Lang = 'en' | 'nl' | 'de' | 'de-ch'
type Step = 'role' | 'scan'

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  en: {
    stepBadge:     'Step 1 of 3',
    selectTitle:   'What is your role?',
    selectBody:    'Your role shapes how you see the organisation. Select the option that best describes your position.',
    selectCta:     'Start the 24 questions →',
    pillarOf:      (a: number, b: number) => `Pillar ${a} of ${b}`,
    scaleLabels:   ['Not at all', 'Somewhat', 'Often', 'Fully'] as const,
    prevBtn:       '← Previous',
    nextBtn:       'Next pillar →',
    seeResultsBtn: 'See my results →',
    remainingBtn:  (n: number) => `${n} question${n !== 1 ? 's' : ''} remaining`,
    backLink:      '← Back',
    subTitle:      'Marketing Organisation Scan',
  },
  nl: {
    stepBadge:     'Stap 1 van 3',
    selectTitle:   'Wat is jouw rol?',
    selectBody:    'Jouw rol bepaalt hoe je de organisatie ziet. Kies de optie die het best bij jouw positie past.',
    selectCta:     'Start de 24 vragen →',
    pillarOf:      (a: number, b: number) => `Pillar ${a} van ${b}`,
    scaleLabels:   ['Helemaal niet', 'Soms', 'Vaak', 'Volledig'] as const,
    prevBtn:       '← Vorige',
    nextBtn:       'Volgende pillar →',
    seeResultsBtn: 'Bekijk mijn resultaten →',
    remainingBtn:  (n: number) => `Nog ${n} vra${n !== 1 ? 'gen' : 'ag'}`,
    backLink:      '← Terug',
    subTitle:      'Marketing Organisatie Scan',
  },
  de: {
    stepBadge:     'Schritt 1 von 3',
    selectTitle:   'Was ist deine Funktion?',
    selectBody:    'Deine Funktion prägt, wie du die Organisation siehst. Wähle die Option, die deine Position am besten beschreibt.',
    selectCta:     'Starte die 24 Fragen →',
    pillarOf:      (a: number, b: number) => `Pillar ${a} von ${b}`,
    scaleLabels:   ['Gar nicht', 'Ansatzweise', 'Häufig', 'Vollständig'] as const,
    prevBtn:       '← Zurück',
    nextBtn:       'Nächster Pillar →',
    seeResultsBtn: 'Meine Ergebnisse ansehen →',
    remainingBtn:  (n: number) => `Noch ${n} Frage${n !== 1 ? 'n' : ''}`,
    backLink:      '← Zurück',
    subTitle:      'Marketing-Organisations-Scan',
  },
  'de-ch': {
    stepBadge:     'Schritt 1 von 3',
    selectTitle:   'Was ist deine Funktion?',
    selectBody:    'Deine Funktion prägt, wie du die Organisation siehst. Wähle die Option, die deine Position am besten beschreibt.',
    selectCta:     'Starte die 24 Fragen →',
    pillarOf:      (a: number, b: number) => `Pillar ${a} von ${b}`,
    scaleLabels:   ['Gar nicht', 'Ansatzweise', 'Häufig', 'Vollständig'] as const,
    prevBtn:       '← Zurück',
    nextBtn:       'Nächster Pillar →',
    seeResultsBtn: 'Meine Ergebnisse ansehen →',
    remainingBtn:  (n: number) => `Noch ${n} Frage${n !== 1 ? 'n' : ''}`,
    backLink:      '← Zurück',
    subTitle:      'Marketing-Organisations-Scan',
  },
}

// ── Shared nav header ─────────────────────────────────────────────────────────
function AssessHeader({ backHref, backLabel, subTitle }: { backHref: string; backLabel: string; subTitle: string }) {
  return (
    <nav style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, height: 60, display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/marketing_scan" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'rgba(0,0,0,0.9)', lineHeight: 1.2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>MARKENZUKUNFT</p>
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

// ── Inner component ────────────────────────────────────────────────────────────
function MarketingScanAssessInner() {
  const searchParams  = useSearchParams()
  const router        = useRouter()
  const rawLang       = searchParams.get('lang') ?? 'en'
  const lang          = (['en', 'nl', 'de', 'de-ch'].includes(rawLang) ? rawLang : 'en') as Lang
  const t             = T[lang]
  const backHref      = `/marketing_scan?lang=${lang}`
  const { PILLARS, QUESTIONS, ROLES } = getScanContent(lang)

  const [step,          setStep]         = useState<Step>('role')
  const [roleId,        setRoleId]       = useState('')
  const [answers,       setAnswers]      = useState<Record<string, number>>({})
  const [activePillar,  setActivePillar] = useState(0)

  // ── Navigate to results ───────────────────────────────────────────────────
  const goToResults = () => {
    const pillarScores: Record<string, number> = {}
    PILLARS.forEach(p => {
      const qs   = QUESTIONS.filter(q => q.pillarId === p.id)
      const vals = qs.map(q => answers[q.id] ?? 0).filter(Boolean)
      pillarScores[p.id] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 1
    })
    const encoded = encodeURIComponent(btoa(JSON.stringify(pillarScores)))
    router.push(`/marketing_scan/results?d=${encoded}&role=${roleId}&lang=${lang}`)
  }

  // ── Step 1: role selection ────────────────────────────────────────────────
  if (step === 'role') {
    return (
      <div style={{ minHeight: '100vh', background: BG_GRAY, fontFamily: FONT }}>
        <AssessHeader backHref={backHref} backLabel={t.backLink} subTitle={t.subTitle} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)', padding: '48px 24px' }}>
          <div style={{ width: '100%', maxWidth: 540 }}>

            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: ACCENT, border: `1px solid ${ACCENT}44`,
              padding: '3px 12px', borderRadius: 4, marginBottom: 20,
            }}>
              {t.stepBadge}
            </span>

            <h1 style={{ fontSize: 28, fontWeight: 900, color: PRIMARY, marginBottom: 8, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              {t.selectTitle}
            </h1>
            <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.65, marginBottom: 32 }}>
              {t.selectBody}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRoleId(r.id)}
                  style={{
                    textAlign: 'left', padding: '16px 18px', borderRadius: 8,
                    border: `2px solid ${roleId === r.id ? ACCENT : BORDER}`,
                    background: roleId === r.id ? '#FFF3EE' : '#fff',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 700, color: roleId === r.id ? ACCENT : PRIMARY, marginBottom: 4 }}>{r.label}</p>
                  <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{r.description}</p>
                </button>
              ))}
            </div>

            <button
              disabled={!roleId}
              onClick={() => setStep('scan')}
              style={{
                width: '100%', padding: '14px 24px', borderRadius: 6,
                background: roleId ? ACCENT : BORDER,
                color: roleId ? '#fff' : MUTED,
                fontWeight: 700, fontSize: 15, border: 'none',
                cursor: roleId ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
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
  const pillar         = PILLARS[activePillar]
  const pillarQs       = QUESTIONS.filter(q => q.pillarId === (pillar.id as PillarId))
  const pillarAnswered = pillarQs.every(q => answers[q.id] !== undefined)
  const totalAnswered  = Object.keys(answers).length
  const progress       = Math.round((totalAnswered / QUESTIONS.length) * 100)

  return (
    <div style={{ minHeight: '100vh', background: BG_GRAY, fontFamily: FONT }}>
      <AssessHeader backHref={backHref} backLabel={t.backLink} subTitle={t.subTitle} />

      {/* Progress bar */}
      <div style={{ height: 3, background: BORDER }}>
        <div style={{ height: 3, transition: 'width 0.4s ease', width: `${progress}%`, background: ACCENT }} />
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Pillar tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
          {PILLARS.map((p, i) => {
            const pQs  = QUESTIONS.filter(q => q.pillarId === p.id)
            const done = pQs.every(q => answers[q.id] !== undefined)
            return (
              <button
                key={p.id}
                onClick={() => setActivePillar(i)}
                style={{
                  flexShrink: 0, padding: '6px 14px', borderRadius: 4,
                  fontSize: 12, fontWeight: 700,
                  border: `1.5px solid ${activePillar === i ? ACCENT : done ? `${ACCENT}44` : BORDER}`,
                  background: activePillar === i ? ACCENT : done ? '#FFF3EE' : '#fff',
                  color: activePillar === i ? '#fff' : done ? ACCENT : MUTED,
                  cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
              >
                {done && activePillar !== i ? '✓ ' : ''}{p.short}
              </button>
            )
          })}
        </div>

        {/* Pillar header */}
        <div style={{ marginBottom: 24 }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: ACCENT, border: `1px solid ${ACCENT}44`,
            padding: '3px 12px', borderRadius: 4, marginBottom: 12,
          }}>
            {t.pillarOf(activePillar + 1, PILLARS.length)}
          </span>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: PRIMARY, marginBottom: 6, letterSpacing: '-0.01em' }}>
            {pillar.icon} {pillar.name}
          </h2>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, maxWidth: 600 }}>{pillar.description}</p>
        </div>

        {/* Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {pillarQs.map(q => {
            const selected = answers[q.id]
            return (
              <div key={q.id} style={{ background: '#fff', borderRadius: 10, padding: '24px 22px', border: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: 15, fontWeight: 500, color: PRIMARY, marginBottom: 14, lineHeight: 1.6 }}>{q.text}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: MUTED, marginBottom: 10 }}>
                  <span>{q.lowAnchor}</span>
                  <span style={{ textAlign: 'right' }}>{q.highAnchor}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {([1, 2, 3, 4] as const).map(v => {
                    const isSelected  = selected === v
                    const accentColor = v <= 2 ? AMBER : ACCENT
                    return (
                      <button
                        key={v}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: v }))}
                        style={{
                          flex: 1, padding: '10px 0', borderRadius: 6, fontWeight: 700, fontSize: 16,
                          border: `2px solid ${isSelected ? accentColor : BORDER}`,
                          background: isSelected ? accentColor : BG_GRAY,
                          color: isSelected ? '#fff' : '#CBD5E1',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        {v}
                      </button>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#CBD5E1', marginTop: 7 }}>
                  {t.scaleLabels.map(label => <span key={label}>{label}</span>)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          {activePillar > 0 && (
            <button
              onClick={() => setActivePillar(a => a - 1)}
              style={{
                flex: 1, padding: '13px 24px', borderRadius: 6,
                border: `1.5px solid ${BORDER}`, background: '#fff',
                fontWeight: 600, fontSize: 14, color: PRIMARY, cursor: 'pointer',
              }}
            >
              {t.prevBtn}
            </button>
          )}
          {activePillar < PILLARS.length - 1 ? (
            <button
              disabled={!pillarAnswered}
              onClick={() => setActivePillar(a => a + 1)}
              style={{
                flex: 1, padding: '13px 24px', borderRadius: 6,
                background: pillarAnswered ? 'transparent' : BORDER,
                color: pillarAnswered ? ACCENT : MUTED,
                border: pillarAnswered ? `2px solid ${ACCENT}` : `2px solid ${BORDER}`,
                fontWeight: 700, fontSize: 14,
                cursor: pillarAnswered ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
              }}
            >
              {t.nextBtn}
            </button>
          ) : (
            <button
              disabled={totalAnswered < QUESTIONS.length}
              onClick={goToResults}
              style={{
                flex: 1, padding: '13px 24px', borderRadius: 6,
                background: totalAnswered >= QUESTIONS.length ? 'transparent' : BORDER,
                color: totalAnswered >= QUESTIONS.length ? ACCENT : MUTED,
                border: totalAnswered >= QUESTIONS.length ? `2px solid ${ACCENT}` : `2px solid ${BORDER}`,
                fontWeight: 700, fontSize: 14,
                cursor: totalAnswered >= QUESTIONS.length ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
              }}
            >
              {totalAnswered < QUESTIONS.length
                ? t.remainingBtn(QUESTIONS.length - totalAnswered)
                : t.seeResultsBtn}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function MarketingScanAssessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: BG_GRAY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${ACCENT}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <MarketingScanAssessInner />
    </Suspense>
  )
}
