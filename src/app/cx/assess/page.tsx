'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  DIMENSIONS, QUESTIONS, ROLES,
  scoreColour, overallScore,
  type CxDimScores,
} from '@/products/cx/data'
import CxRadarChart from '@/components/cx/RadarChart'

// ── Brand tokens ─────────────────────────────────────────────────────────────
const BLUE       = '#4B9FD6'
const PINK       = '#D4607A'
const DARK       = '#1E293B'
const BODY       = '#475569'
const MUTED      = '#94A3B8'
const BLUE_LIGHT = '#EBF5FB'
const PINK_LIGHT = '#FDF0F3'

type Step = 'select' | 'assess' | 'results'

export default function CxAssessPage() {
  const [step, setStep]         = useState<Step>('select')
  const [roleId, setRoleId]     = useState('')
  const [answers, setAnswers]   = useState<Record<string, number>>({})
  const [activeDim, setActiveDim] = useState(0)

  // ── Step 1: role selection ───────────────────────────────────────────────
  if (step === 'select') {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFBFD', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <AssessHeader />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '48px 24px' }}>
          <div style={{ width: '100%', maxWidth: 520 }}>

            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: BLUE, background: BLUE_LIGHT,
              padding: '3px 12px', borderRadius: 100, marginBottom: 20,
            }}>
              Step 1 of 3
            </span>

            <h1 style={{ fontSize: 28, fontWeight: 900, color: DARK, marginBottom: 8, lineHeight: 1.2 }}>
              What is your role?
            </h1>
            <p style={{ fontSize: 15, color: BODY, lineHeight: 1.65, marginBottom: 32 }}>
              Different roles see different facets of CX maturity. Your context shapes the picture.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRoleId(r.id)}
                  style={{
                    textAlign: 'left', padding: '16px 18px', borderRadius: 16,
                    border: `2px solid ${roleId === r.id ? BLUE : '#E2E8F0'}`,
                    background: roleId === r.id ? BLUE_LIGHT : '#fff',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <p style={{ fontSize: 14, fontWeight: 700, color: roleId === r.id ? BLUE : DARK, marginBottom: 4 }}>
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
                background: roleId ? `linear-gradient(135deg, ${BLUE}, #6BB5E0)` : '#E2E8F0',
                color: roleId ? '#fff' : MUTED,
                fontWeight: 700, fontSize: 15, border: 'none', cursor: roleId ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
            >
              Start the 24 questions →
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
    const isPink = activeDim % 2 === 1

    return (
      <div style={{ minHeight: '100vh', background: '#FAFBFD', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <AssessHeader />

        {/* Progress bar */}
        <div style={{ height: 3, background: '#EEF2F7' }}>
          <div style={{
            height: 3, transition: 'width 0.4s ease',
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${BLUE}, ${PINK})`,
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
                    borderColor: activeDim === i ? BLUE : done ? '#10B98133' : '#E2E8F0',
                    background: activeDim === i ? BLUE : done ? '#F0FDF9' : '#fff',
                    color: activeDim === i ? '#fff' : done ? '#059669' : MUTED,
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
              textTransform: 'uppercase',
              color: isPink ? PINK : BLUE,
              background: isPink ? PINK_LIGHT : BLUE_LIGHT,
              padding: '3px 12px', borderRadius: 100, marginBottom: 10,
            }}>
              Dimension {activeDim + 1} of {DIMENSIONS.length}
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
                      const accentColor = v <= 2 ? PINK : BLUE
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
                    <span>Not at all</span>
                    <span>Somewhat</span>
                    <span>Often</span>
                    <span>Fully</span>
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
                ← Previous
              </button>
            )}
            {activeDim < DIMENSIONS.length - 1 ? (
              <button
                disabled={!dimAnswered}
                onClick={() => setActiveDim(a => a + 1)}
                style={{
                  flex: 1, padding: '13px 24px', borderRadius: 100,
                  background: dimAnswered ? BLUE : '#E2E8F0',
                  color: dimAnswered ? '#fff' : MUTED,
                  fontWeight: 700, fontSize: 14, border: 'none',
                  cursor: dimAnswered ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
                }}
              >
                Next dimension →
              </button>
            ) : (
              <button
                disabled={totalAnswered < QUESTIONS.length}
                onClick={() => setStep('results')}
                style={{
                  flex: 1, padding: '13px 24px', borderRadius: 100,
                  background: totalAnswered >= QUESTIONS.length
                    ? `linear-gradient(135deg, ${PINK}, #E8607A)`
                    : '#E2E8F0',
                  color: totalAnswered >= QUESTIONS.length ? '#fff' : MUTED,
                  fontWeight: 700, fontSize: 14, border: 'none',
                  cursor: totalAnswered >= QUESTIONS.length ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                }}
              >
                {totalAnswered < QUESTIONS.length
                  ? `${QUESTIONS.length - totalAnswered} questions remaining`
                  : 'See my results →'}
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
  const mailtoHref = `mailto:marije@marijegast.nl?subject=CX%20Maturity%20Assessment%20%E2%80%94%20I%27d%20like%20to%20talk&body=Hi%20Marije%2C%0A%0AI%20just%20completed%20the%20CX%20Maturity%20Assessment%20and%20scored%20${avg.toFixed(1)}%20(${encodeURIComponent(overallCol.label)}).%0A%0AI%27d%20love%20to%20discuss%20what%20this%20means%20for%20my%20organisation.%0A%0AKind%20regards%2C`

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
      <AssessHeader />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Results header */}
        <div style={{ marginBottom: 32 }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: PINK, background: PINK_LIGHT,
            padding: '3px 12px', borderRadius: 100, marginBottom: 16,
          }}>
            Your Results
          </span>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: DARK, marginBottom: 8, lineHeight: 1.2 }}>
            Your CX Maturity Picture
          </h1>
          <p style={{ fontSize: 15, color: BODY }}>
            Assessed as: <strong>{role.label}</strong>
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
            <p style={{ fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 16 }}>CX Maturity Radar</p>
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
                <p style={{ fontSize: 12, color: MUTED, marginBottom: 2 }}>Overall score</p>
                <p style={{ fontSize: 18, fontWeight: 900, color: overallCol.bg }}>{overallCol.label}</p>
              </div>
            </div>

            {/* Dimension bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {DIMENSIONS.map(d => {
                const s = dimScores[d.id] ?? 1
                const col = scoreColour(s)
                const bar = ((s - 1) / 3) * 100
                return (
                  <div key={d.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: DARK }}>
                        {d.icon} {d.name}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: col.bg }}>
                        {s.toFixed(1)} · {col.label}
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
            Your 3 biggest opportunities
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {gaps.map(({ dim, score }, i) => {
              const col = scoreColour(score)
              return (
                <div
                  key={dim.id}
                  style={{
                    borderRadius: 18, padding: '20px 18px',
                    background: col.pastelBg,
                    border: `1px solid ${col.bg}33`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: col.bg, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 900, flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: DARK }}>{dim.name}</span>
                  </div>
                  <p style={{ fontSize: 12, color: BODY, lineHeight: 1.6, marginBottom: 10 }}>
                    {dim.description}
                  </p>
                  <p style={{ fontSize: 22, fontWeight: 900, color: col.bg }}>{score.toFixed(1)}</p>
                  <p style={{ fontSize: 11, color: col.bg, fontWeight: 600 }}>{col.label}</p>
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
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: BLUE_LIGHT,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>
              ✨
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: DARK, marginBottom: 8 }}>Where you&apos;re already strong</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {strengths.map(({ dim, score }) => {
                const col = scoreColour(score)
                return (
                  <span
                    key={dim.id}
                    style={{
                      fontSize: 13, fontWeight: 600,
                      padding: '5px 14px', borderRadius: 100,
                      background: col.pastelBg, color: col.bg,
                      border: `1px solid ${col.bg}33`,
                    }}
                  >
                    {dim.icon} {dim.name} · {score.toFixed(1)}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        {/* CTA — contact Marije */}
        <div style={{
          background: `linear-gradient(135deg, ${BLUE_LIGHT}, ${PINK_LIGHT})`,
          borderRadius: 28, padding: '40px 36px',
          border: '1px solid rgba(75,159,214,0.15)',
          textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: `linear-gradient(135deg, ${BLUE_LIGHT}, ${PINK_LIGHT})`,
            border: `3px solid ${BLUE}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: BLUE,
            margin: '0 auto 20px',
          }}>
            MG
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: DARK, marginBottom: 10, lineHeight: 1.3 }}>
            Want to turn this into action?
          </h2>
          <p style={{ fontSize: 15, color: BODY, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 28px' }}>
            These results are a starting point — not a verdict. Book a no-obligation conversation with Marije Gast to explore what the gaps mean for your organisation.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={mailtoHref}
              style={{
                display: 'inline-block',
                background: `linear-gradient(135deg, ${BLUE}, #6BB5E0)`,
                color: '#fff', fontWeight: 700, fontSize: 15,
                padding: '14px 32px', borderRadius: 100, textDecoration: 'none',
              }}
            >
              Book a conversation with Marije →
            </a>
            <button
              onClick={() => { setStep('select'); setAnswers({}); setActiveDim(0); setRoleId('') }}
              style={{
                padding: '14px 28px', borderRadius: 100,
                border: `2px solid ${BLUE}44`, background: 'transparent',
                fontWeight: 600, fontSize: 14, color: BLUE, cursor: 'pointer',
              }}
            >
              Retake assessment
            </button>
          </div>
          <p style={{ fontSize: 12, color: MUTED, marginTop: 16 }}>
            No sales pitch. Just a useful conversation.
          </p>
        </div>

      </div>
    </div>
  )
}

function AssessHeader() {
  return (
    <nav style={{
      background: '#fff', borderBottom: '1px solid #EEF2F7',
      height: 64, display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        maxWidth: 900, margin: '0 auto', width: '100%',
        padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/cx" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: `linear-gradient(135deg, ${BLUE_LIGHT}, ${PINK_LIGHT})`,
            border: `2px solid ${BLUE}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: BLUE,
          }}>
            MG
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: DARK, lineHeight: 1.2 }}>Marije Gast</p>
            <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.2 }}>CX Maturity Assessment</p>
          </div>
        </Link>
        <Link
          href="/cx"
          style={{ fontSize: 13, color: MUTED, textDecoration: 'none', fontWeight: 500 }}
        >
          ← Back to overview
        </Link>
      </div>
    </nav>
  )
}
