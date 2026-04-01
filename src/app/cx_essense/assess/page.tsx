'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  getCxContent,
  scoreColour, overallScore,
  type CxDimScores,
} from '@/products/cx_essense/data'
import CxRadarChart from '@/components/cx/RadarChart'

// ── Brand tokens (Essense) ────────────────────────────────────────────────────
const GREEN       = '#24CF7A'
const GREEN_DARK  = '#044524'
const GREEN_LIGHT = '#EAF5F2'
const GREEN_MID   = '#D2F5E8'
const DARK        = '#1A1A2E'
const BODY        = '#374151'
const MUTED       = '#94A3B8'

type Step = 'select' | 'assess' | 'results'

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  en: {
    stepBadge:       (n: number) => `Step ${n} of 3`,
    selectTitle:     'What is your role?',
    selectBody:      'Different roles see different facets of CX maturity. Your context shapes the picture.',
    selectCta:       'Start the 24 questions →',
    dimOf:           (a: number, b: number) => `Dimension ${a} of ${b}`,
    scaleLabels:     ['Not at all', 'Somewhat', 'Often', 'Fully'],
    prevBtn:         '← Previous',
    nextBtn:         'Next dimension →',
    remainingBtn:    (n: number) => `${n} question${n !== 1 ? 's' : ''} remaining`,
    seeResultsBtn:   'See my results →',
    resultsLabel:    'Your Results',
    resultsTitle:    'Your CX Maturity Picture',
    assessedAs:      'Assessed as:',
    radarLabel:      'CX Maturity Radar',
    overallLabel:    'Overall score',
    gapsTitle:       'Your 3 biggest opportunities',
    strengthsTitle:  'Where you\'re already strong',
    ctaTitle:        'Want to turn this into action?',
    ctaBody:         'These results are a starting point — not a verdict. Book a conversation with Essense to explore what the gaps mean for your organisation and what a practical next step looks like.',
    ctaBtn:          'Talk to Essense →',
    retakeBtn:       'Retake assessment',
    ctaCaption:      'No sales pitch. Just a useful, practical conversation.',
    backLink:        '← Back to overview',
    subTitle:        'CX Maturity Assessment',
  },
  nl: {
    stepBadge:       (n: number) => `Stap ${n} van 3`,
    selectTitle:     'Wat is jouw rol?',
    selectBody:      'Verschillende rollen zien verschillende facetten van CX-volwassenheid. Jouw context bepaalt het beeld.',
    selectCta:       'Start de 24 vragen →',
    dimOf:           (a: number, b: number) => `Dimensie ${a} van ${b}`,
    scaleLabels:     ['Helemaal niet', 'Soms', 'Vaak', 'Volledig'],
    prevBtn:         '← Vorige',
    nextBtn:         'Volgende dimensie →',
    remainingBtn:    (n: number) => `Nog ${n} vra${n !== 1 ? 'gen' : 'ag'}`,
    seeResultsBtn:   'Bekijk mijn resultaten →',
    resultsLabel:    'Jouw Resultaten',
    resultsTitle:    'Jouw CX Volwassenheidsprofiel',
    assessedAs:      'Beoordeeld als:',
    radarLabel:      'CX Volwassenheidsradar',
    overallLabel:    'Totaalscore',
    gapsTitle:       'Jouw 3 grootste kansen',
    strengthsTitle:  'Waar je al sterk in bent',
    ctaTitle:        'Wil je dit omzetten in actie?',
    ctaBody:         'Deze resultaten zijn een startpunt — geen eindoordeel. Plan een gesprek met Essense om te verkennen wat de verbeterpunten betekenen voor jouw organisatie en hoe een praktische volgende stap eruitziet.',
    ctaBtn:          'Praat met Essense →',
    retakeBtn:       'Assessment opnieuw doen',
    ctaCaption:      'Geen verkooppraatje. Gewoon een nuttig, praktisch gesprek.',
    backLink:        '← Terug naar overzicht',
    subTitle:        'CX Volwassenheidsassessment',
  },
}

// ── Inner component ────────────────────────────────────────────────────────────
function CxEssenseAssessInner() {
  const searchParams = useSearchParams()
  const lang = (searchParams.get('lang') === 'nl' ? 'nl' : 'en') as 'en' | 'nl'
  const t = T[lang]
  const { DIMENSIONS, QUESTIONS, ROLES } = getCxContent(lang)
  const backHref = lang === 'nl' ? '/cx_essense?lang=nl' : '/cx_essense'

  const [step, setStep]           = useState<Step>('select')
  const [roleId, setRoleId]       = useState('')
  const [answers, setAnswers]     = useState<Record<string, number>>({})
  const [activeDim, setActiveDim] = useState(0)

  // ── Step 1: role selection ───────────────────────────────────────────────
  if (step === 'select') {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFBFD', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <AssessHeader backHref={backHref} backLabel={t.backLink} subTitle={t.subTitle} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '48px 24px' }}>
          <div style={{ width: '100%', maxWidth: 520 }}>

            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: GREEN_DARK, background: GREEN_LIGHT,
              padding: '3px 12px', borderRadius: 100, marginBottom: 20,
            }}>
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
                  <p style={{ fontSize: 14, fontWeight: 700, color: roleId === r.id ? GREEN_DARK : DARK, marginBottom: 4 }}>
                    {r.label}
                  </p>
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
                fontWeight: 700, fontSize: 15, border: 'none', cursor: roleId ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
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
  if (step === 'assess') {
    const dim = DIMENSIONS[activeDim]
    const dimQuestions = QUESTIONS.filter(q => q.dimensionId === dim.id)
    const dimAnswered = dimQuestions.every(q => answers[q.id] !== undefined)
    const totalAnswered = Object.keys(answers).length
    const progress = Math.round((totalAnswered / QUESTIONS.length) * 100)

    return (
      <div style={{ minHeight: '100vh', background: '#FAFBFD', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <AssessHeader backHref={backHref} backLabel={t.backLink} subTitle={t.subTitle} />

        {/* Progress bar */}
        <div style={{ height: 3, background: '#EEF2F7' }}>
          <div style={{
            height: 3, transition: 'width 0.4s ease',
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${GREEN_DARK}, ${GREEN})`,
          }} />
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 64px' }}>

          {/* Dimension tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
            {DIMENSIONS.map((d, i) => {
              const dimQs = QUESTIONS.filter(q => q.dimensionId === d.id)
              const done = dimQs.every(q => answers[q.id] !== undefined)
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
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: GREEN_DARK, background: GREEN_LIGHT,
              padding: '3px 12px', borderRadius: 100, marginBottom: 10,
            }}>
              {t.dimOf(activeDim + 1, DIMENSIONS.length)}
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: DARK, marginBottom: 4 }}>
              {dim.icon} {dim.name}
            </h2>
            <p style={{ fontSize: 14, color: BODY, lineHeight: 1.65 }}>{dim.description}</p>
          </div>

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {dimQuestions.map((q) => {
              const selected = answers[q.id]
              return (
                <div
                  key={q.id}
                  style={{
                    background: '#fff', borderRadius: 20, padding: '24px 22px',
                    border: '1px solid #EEF2F7',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  }}
                >
                  <p style={{ fontSize: 15, fontWeight: 600, color: DARK, marginBottom: 12, lineHeight: 1.55 }}>
                    {q.text}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: MUTED, marginBottom: 10 }}>
                    <span>{q.lowAnchor}</span>
                    <span style={{ textAlign: 'right' }}>{q.highAnchor}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1, 2, 3, 4].map(v => {
                      const isSelected = selected === v
                      const accentColor = v <= 2 ? '#F59E0B' : GREEN
                      return (
                        <button
                          key={v}
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: v }))}
                          style={{
                            flex: 1, padding: '10px 0', borderRadius: 12,
                            fontWeight: 700, fontSize: 16,
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
                    {t.scaleLabels.map(label => (
                      <span key={label}>{label}</span>
                    ))}
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
                style={{
                  flex: 1, padding: '13px 24px', borderRadius: 100,
                  border: '2px solid #E2E8F0', background: '#fff',
                  fontWeight: 600, fontSize: 14, color: BODY, cursor: 'pointer',
                }}
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
                onClick={() => setStep('results')}
                style={{
                  flex: 1, padding: '13px 24px', borderRadius: 100,
                  background: totalAnswered >= QUESTIONS.length
                    ? `linear-gradient(135deg, ${GREEN}, #1DB865)`
                    : '#E2E8F0',
                  color: totalAnswered >= QUESTIONS.length ? '#fff' : MUTED,
                  fontWeight: 700, fontSize: 14, border: 'none',
                  cursor: totalAnswered >= QUESTIONS.length ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
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

  // ── Step 3: results ───────────────────────────────────────────────────────
  const dimScores: CxDimScores = {} as CxDimScores
  DIMENSIONS.forEach(d => {
    const qs = QUESTIONS.filter(q => q.dimensionId === d.id)
    const vals = qs.map(q => answers[q.id] ?? 0).filter(Boolean)
    dimScores[d.id] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 1
  })

  const avg = overallScore(dimScores)
  const overallCol = scoreColour(avg)
  const role = ROLES.find(r => r.id === roleId)!
  const scoreLabel = lang === 'nl' ? overallCol.labelNl : overallCol.label
  const mailtoSubject = lang === 'nl'
    ? 'CX%20Volwassenheidsassessment%20%E2%80%94%20Gesprek%20aanvragen'
    : 'CX%20Maturity%20Assessment%20%E2%80%94%20Let%27s%20talk'
  const mailtoBody = lang === 'nl'
    ? `Hallo%20Essense%2C%0A%0AIk%20heb%20zojuist%20het%20CX%20Volwassenheidsassessment%20ingevuld%20en%20scoorde%20${avg.toFixed(1)}%20(${encodeURIComponent(scoreLabel)}).%0A%0AIk%20wil%20graag%20bespreken%20wat%20dit%20betekent%20voor%20mijn%20organisatie.%0A%0AMet%20vriendelijke%20groet%2C`
    : `Hello%20Essense%2C%0A%0AI%20just%20completed%20the%20CX%20Maturity%20Assessment%20and%20scored%20${avg.toFixed(1)}%20(${encodeURIComponent(scoreLabel)}).%0A%0AI%27d%20love%20to%20discuss%20what%20this%20means%20for%20my%20organisation.%0A%0AKind%20regards%2C`
  const mailtoHref = `mailto:hello@essense.eu?subject=${mailtoSubject}&body=${mailtoBody}`

  const gaps = DIMENSIONS
    .map(d => ({ dim: d, score: dimScores[d.id] ?? 1 }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)

  const strengths = DIMENSIONS
    .map(d => ({ dim: d, score: dimScores[d.id] ?? 1 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)

  return (
    <div style={{ minHeight: '100vh', background: '#FAFBFD', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <AssessHeader backHref={backHref} backLabel={t.backLink} subTitle={t.subTitle} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Results header */}
        <div style={{ marginBottom: 32 }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: GREEN_DARK, background: GREEN_LIGHT,
            padding: '3px 12px', borderRadius: 100, marginBottom: 16,
          }}>
            {t.resultsLabel}
          </span>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: DARK, marginBottom: 8, lineHeight: 1.2 }}>
            {t.resultsTitle}
          </h1>
          <p style={{ fontSize: 15, color: BODY }}>
            {t.assessedAs} <strong>{role.label}</strong>
          </p>
        </div>

        {/* Overall score + radar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, marginBottom: 24, alignItems: 'start' }}>

          {/* Radar */}
          <div style={{
            background: '#fff', borderRadius: 24, padding: '28px 24px',
            border: '1px solid #EEF2F7', boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 16 }}>{t.radarLabel}</p>
            <CxRadarChart scores={dimScores} size={260} primaryColor={overallCol.bg} />
          </div>

          {/* Score + dimension bars */}
          <div style={{
            background: '#fff', borderRadius: 24, padding: '28px 24px',
            border: '1px solid #EEF2F7', boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
          }}>
            {/* Overall score badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              background: overallCol.pastelBg,
              borderRadius: 16, padding: '14px 20px', marginBottom: 24,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: overallCol.bg, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 900,
              }}>
                {avg.toFixed(1)}
              </div>
              <div>
                <p style={{ fontSize: 12, color: MUTED, marginBottom: 2 }}>{t.overallLabel}</p>
                <p style={{ fontSize: 18, fontWeight: 900, color: overallCol.bg }}>{scoreLabel}</p>
              </div>
            </div>

            {/* Dimension bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {DIMENSIONS.map(d => {
                const s = dimScores[d.id] ?? 1
                const col = scoreColour(s)
                const dimLabel = lang === 'nl' ? col.labelNl : col.label
                const bar = ((s - 1) / 3) * 100
                return (
                  <div key={d.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: DARK }}>
                        {d.icon} {d.name}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: col.bg }}>
                        {s.toFixed(1)} · {dimLabel}
                      </span>
                    </div>
                    <div style={{ height: 8, background: '#F1F5F9', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{
                        height: 8, borderRadius: 100, transition: 'width 0.6s ease',
                        width: `${bar}%`, background: col.bg,
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top 3 gaps */}
        <div style={{
          background: '#fff', borderRadius: 24, padding: '28px 24px',
          border: '1px solid #EEF2F7', boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
          marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: DARK, marginBottom: 20 }}>
            {t.gapsTitle}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {gaps.map(({ dim, score }, i) => {
              const col = scoreColour(score)
              const gapLabel = lang === 'nl' ? col.labelNl : col.label
              return (
                <div
                  key={dim.id}
                  style={{ borderRadius: 18, padding: '20px 18px', background: col.pastelBg, border: `1px solid ${col.bg}33` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: col.bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: DARK }}>{dim.name}</span>
                  </div>
                  <p style={{ fontSize: 12, color: BODY, lineHeight: 1.6, marginBottom: 10 }}>{dim.description}</p>
                  <p style={{ fontSize: 22, fontWeight: 900, color: col.bg }}>{score.toFixed(1)}</p>
                  <p style={{ fontSize: 11, color: col.bg, fontWeight: 600 }}>{gapLabel}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Strengths strip */}
        <div style={{
          background: '#fff', borderRadius: 24, padding: '22px 24px',
          border: '1px solid #EEF2F7', boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
          marginBottom: 32, display: 'flex', gap: 16, alignItems: 'flex-start',
        }}>
          <div style={{ flexShrink: 0, marginTop: 2 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: GREEN_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✨</div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: DARK, marginBottom: 8 }}>{t.strengthsTitle}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {strengths.map(({ dim, score }) => {
                const col = scoreColour(score)
                return (
                  <span key={dim.id} style={{ fontSize: 13, fontWeight: 600, padding: '5px 14px', borderRadius: 100, background: col.pastelBg, color: col.bg, border: `1px solid ${col.bg}33` }}>
                    {dim.icon} {dim.name} · {score.toFixed(1)}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        {/* CTA — contact Essense */}
        <div style={{
          background: GREEN_DARK,
          borderRadius: 28, padding: '40px 36px',
          textAlign: 'center',
        }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: GREEN, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: GREEN_DARK, fontSize: 36, fontWeight: 900 }}>e</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 10, lineHeight: 1.3 }}>
            {t.ctaTitle}
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: 440, margin: '0 auto 28px' }}>
            {t.ctaBody}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={mailtoHref}
              style={{
                display: 'inline-block',
                background: `linear-gradient(135deg, ${GREEN}, #1DB865)`,
                color: '#fff', fontWeight: 700, fontSize: 15,
                padding: '14px 32px', borderRadius: 100, textDecoration: 'none',
              }}
            >
              {t.ctaBtn}
            </a>
            <button
              onClick={() => { setStep('select'); setAnswers({}); setActiveDim(0); setRoleId('') }}
              style={{
                padding: '14px 28px', borderRadius: 100,
                border: `2px solid ${GREEN}44`, background: 'transparent',
                fontWeight: 600, fontSize: 14, color: GREEN, cursor: 'pointer',
              }}
            >
              {t.retakeBtn}
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 16 }}>
            {t.ctaCaption}
          </p>
        </div>

      </div>
    </div>
  )
}

// ── Shared header ─────────────────────────────────────────────────────────────
function AssessHeader({ backHref, backLabel, subTitle }: { backHref: string; backLabel: string; subTitle: string }) {
  const GREEN      = '#24CF7A'
  const GREEN_DARK = '#044524'
  const DARK       = '#1A1A2E'
  const MUTED      = '#94A3B8'
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

// ── Page export with Suspense boundary ────────────────────────────────────────
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
