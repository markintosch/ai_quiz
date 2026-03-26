'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FESTIVALS_THEME } from '@/products/demachine/theme'
import type { Subject } from '@/products/demachine/theme'
import SubjectCard from '@/components/pulse/SubjectCard'
import BipolairLikert from '@/components/pulse/BipolairLikert'
import RadarDual from '@/components/pulse/RadarDual'
import Countdown from '@/components/pulse/Countdown'
import ShareBlock from '@/components/pulse/ShareBlock'

// ── Design tokens ─────────────────────────────────────────────────────────────
const BLACK = '#000000'
const WHITE = '#ffffff'
const NEAR_BLACK = '#121212'
const LIGHT_GREY = '#f4f4f4'
const YELLOW = '#e3ef38'
const OLIVE = '#6f751a'
const SUBTLE = '#616162'
const MID_GREY = '#828282'

type Step = 'select' | 'questions' | 'results'

interface ResultsData {
  respondentNum: number
  totalResponses: number
  averages: Record<string, number>
}

function PulseNav() {
  return (
    <nav
      style={{
        background: BLACK,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: '56px',
      }}
    >
      <Link
        href="/pulse"
        style={{
          color: WHITE,
          fontWeight: 700,
          fontSize: '16px',
          letterSpacing: '0.02em',
          textDecoration: 'none',
        }}
      >
        DE MACHINE PULSE
      </Link>
      <span style={{ color: MID_GREY, fontSize: '12px' }}>Een initiatief van 3voor12</span>
    </nav>
  )
}

function BeoordelenContent() {
  const searchParams = useSearchParams()
  const subjectParam = searchParams.get('subject')

  const initialSubject =
    FESTIVALS_THEME.subjects.find((s) => s.slug === subjectParam) ?? null

  const [step, setStep] = useState<Step>(initialSubject ? 'questions' : 'select')
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(initialSubject)
  const [scores, setScores] = useState<Record<string, number | null>>(() => {
    const init: Record<string, number | null> = {}
    for (const d of FESTIVALS_THEME.dimensions) init[d.slug] = null
    return init
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [results, setResults] = useState<ResultsData | null>(null)

  // Email capture after results
  const [resultEmail, setResultEmail] = useState('')
  const [resultEmailConsent, setResultEmailConsent] = useState(false)
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [emailSubmitted, setEmailSubmitted] = useState(false)

  const allAnswered = FESTIVALS_THEME.dimensions.every((d) => scores[d.slug] !== null)

  const handleSubmit = async () => {
    if (!selectedSubject || !allAnswered) return
    setSubmitting(true)
    setSubmitError('')

    const validScores: Record<string, number> = {}
    for (const d of FESTIVALS_THEME.dimensions) {
      validScores[d.slug] = scores[d.slug] as number
    }

    try {
      const res = await fetch('/api/pulse/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: FESTIVALS_THEME.id,
          subjectSlug: selectedSubject.slug,
          scores: validScores,
        }),
      })
      const submitData = (await res.json()) as {
        respondentNum?: number
        totalResponses?: number
        error?: string
      }
      if (!res.ok) {
        setSubmitError(submitData.error ?? 'Er ging iets mis. Probeer het opnieuw.')
        setSubmitting(false)
        return
      }

      // Fetch collective averages
      const avgRes = await fetch(
        `/api/pulse/results?themeId=${encodeURIComponent(FESTIVALS_THEME.id)}&subjectSlug=${encodeURIComponent(selectedSubject.slug)}`,
      )
      const avgData = (await avgRes.json()) as {
        averages?: Record<string, number>
        total?: number
        error?: string
      }

      setResults({
        respondentNum: submitData.respondentNum ?? 1,
        totalResponses: submitData.totalResponses ?? 1,
        averages: avgData.averages ?? {},
      })
      setStep('results')
    } catch {
      setSubmitError('Er ging iets mis. Probeer het opnieuw.')
    }
    setSubmitting(false)
  }

  const handleEmailCapture = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resultEmail.trim() || !selectedSubject || !results) return
    setEmailSubmitting(true)
    try {
      // Re-submit with email — fire and forget, no critical path
      await fetch('/api/pulse/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: FESTIVALS_THEME.id,
          subjectSlug: selectedSubject.slug,
          scores: Object.fromEntries(
            FESTIVALS_THEME.dimensions.map((d) => [d.slug, scores[d.slug] ?? 3]),
          ),
          email: resultEmail.trim(),
          marketingConsent: resultEmailConsent,
        }),
      })
    } catch {
      // best effort
    }
    setEmailSubmitted(true)
    setEmailSubmitting(false)
  }

  const baseUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/pulse/beoordelen${selectedSubject ? `?subject=${selectedSubject.slug}` : ''}`
      : '/pulse/beoordelen'

  const validScores: Record<string, number> = {}
  for (const d of FESTIVALS_THEME.dimensions) {
    validScores[d.slug] = (scores[d.slug] as number) ?? 3
  }

  // ── Step: Select ────────────────────────────────────────────────────────────
  if (step === 'select') {
    return (
      <div
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          minHeight: '100vh',
          background: WHITE,
        }}
      >
        <PulseNav />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' }}>
          <h1
            style={{
              fontWeight: 700,
              fontSize: '32px',
              lineHeight: '1.2',
              color: NEAR_BLACK,
              marginBottom: '40px',
            }}
          >
            Welk festival ga jij beoordelen?
          </h1>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '16px',
              marginBottom: '40px',
            }}
          >
            {FESTIVALS_THEME.subjects.map((subject) => (
              <SubjectCard
                key={subject.slug}
                subject={subject}
                selected={selectedSubject?.slug === subject.slug}
                onClick={() => setSelectedSubject(subject)}
              />
            ))}
          </div>
          <button
            disabled={!selectedSubject}
            onClick={() => setStep('questions')}
            style={{
              background: selectedSubject ? YELLOW : LIGHT_GREY,
              color: selectedSubject ? NEAR_BLACK : MID_GREY,
              border: `1px solid ${selectedSubject ? YELLOW : '#e2e2e2'}`,
              borderRadius: 0,
              padding: '14px 32px',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: '16px',
              cursor: selectedSubject ? 'pointer' : 'not-allowed',
            }}
          >
            Volgende →
          </button>
        </div>
      </div>
    )
  }

  // ── Step: Questions ─────────────────────────────────────────────────────────
  if (step === 'questions') {
    const answeredCount = FESTIVALS_THEME.dimensions.filter((d) => scores[d.slug] !== null).length
    const total = FESTIVALS_THEME.dimensions.length
    const progressPct = Math.round((answeredCount / total) * 100)

    return (
      <div
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          minHeight: '100vh',
          background: WHITE,
        }}
      >
        <PulseNav />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px' }}>
          {/* Progress */}
          <div style={{ marginBottom: '40px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '13px', color: SUBTLE, fontWeight: 600 }}>
                {answeredCount} van {total} beantwoord
              </span>
              {selectedSubject && (
                <span style={{ fontSize: '18px' }}>
                  {selectedSubject.emoji} {selectedSubject.label}
                </span>
              )}
            </div>
            <div
              style={{
                height: '4px',
                background: LIGHT_GREY,
                width: '100%',
              }}
            >
              <div
                style={{
                  height: '4px',
                  background: YELLOW,
                  width: `${progressPct}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          <h1
            style={{
              fontWeight: 700,
              fontSize: '24px',
              lineHeight: '1.2',
              color: NEAR_BLACK,
              marginBottom: '40px',
            }}
          >
            Beoordeel {selectedSubject?.label ?? 'dit festival'} op 5 dimensies
          </h1>

          {FESTIVALS_THEME.dimensions.map((dim) => (
            <BipolairLikert
              key={dim.slug}
              dimension={{ slug: dim.slug, label: dim.label, anchorLow: dim.anchorLow, anchorHigh: dim.anchorHigh }}
              value={scores[dim.slug]}
              onChange={(v) =>
                setScores((prev) => ({ ...prev, [dim.slug]: v }))
              }
            />
          ))}

          {submitError && (
            <p style={{ color: '#c0392b', fontSize: '14px', marginBottom: '16px' }}>{submitError}</p>
          )}

          <button
            disabled={!allAnswered || submitting}
            onClick={handleSubmit}
            style={{
              background: allAnswered && !submitting ? YELLOW : LIGHT_GREY,
              color: allAnswered && !submitting ? NEAR_BLACK : MID_GREY,
              border: `1px solid ${allAnswered && !submitting ? YELLOW : '#e2e2e2'}`,
              borderRadius: 0,
              padding: '14px 32px',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: '16px',
              cursor: allAnswered && !submitting ? 'pointer' : 'not-allowed',
            }}
          >
            {submitting ? 'Even geduld...' : 'Bekijk mijn score →'}
          </button>
        </div>
      </div>
    )
  }

  // ── Step: Results ────────────────────────────────────────────────────────────
  if (step === 'results' && results) {
    const formattedNum = results.respondentNum.toLocaleString('nl-NL')
    const formattedTotal = (results.totalResponses - 1).toLocaleString('nl-NL')

    return (
      <div
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          minHeight: '100vh',
          background: WHITE,
        }}
      >
        <PulseNav />

        {/* Participant number banner */}
        <div
          style={{
            background: BLACK,
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              color: MID_GREY,
              fontSize: '12px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: '0 0 8px',
            }}
          >
            DEELNEMER
          </p>
          <p
            style={{
              color: YELLOW,
              fontSize: '56px',
              fontWeight: 700,
              lineHeight: '1',
              margin: '0 0 8px',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            #{formattedNum}
          </p>
          <p
            style={{
              color: MID_GREY,
              fontSize: '14px',
              margin: 0,
            }}
          >
            van {formattedTotal} andere beoordelaars
          </p>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
          {/* Subject header */}
          <h2
            style={{
              fontWeight: 700,
              fontSize: '28px',
              lineHeight: '1.2',
              color: NEAR_BLACK,
              marginBottom: '8px',
            }}
          >
            {selectedSubject?.emoji} {selectedSubject?.label}
          </h2>
          <p style={{ color: SUBTLE, fontSize: '15px', marginBottom: '48px' }}>
            Jouw beoordeling vs. gemiddelde van alle deelnemers
          </p>

          {/* Radar chart */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '48px',
            }}
          >
            <RadarDual
              yours={validScores}
              collective={results.averages}
              dimensions={FESTIVALS_THEME.dimensions}
              size={340}
            />
          </div>

          {/* Dimension breakdown table */}
          <div style={{ marginBottom: '48px' }}>
            <h3
              style={{
                fontWeight: 700,
                fontSize: '18px',
                color: NEAR_BLACK,
                marginBottom: '16px',
              }}
            >
              Per dimensie
            </h3>
            <div
              style={{
                border: '1px solid #e2e2e2',
              }}
            >
              {/* Table header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 80px 80px 120px',
                  padding: '10px 16px',
                  background: LIGHT_GREY,
                  borderBottom: '1px solid #e2e2e2',
                }}
              >
                {['Dimensie', 'Jij', 'Gem.', ''].map((h) => (
                  <span
                    key={h}
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: SUBTLE,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {FESTIVALS_THEME.dimensions.map((dim, i) => {
                const myScore = validScores[dim.slug] ?? 3
                const avgScore = results.averages[dim.slug] ?? 0
                const diff = myScore - avgScore
                const diffStr = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)
                const diffColor = diff > 0.5 ? OLIVE : diff < -0.5 ? '#c0392b' : SUBTLE

                return (
                  <div
                    key={dim.slug}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 80px 80px 120px',
                      padding: '12px 16px',
                      borderBottom: i < FESTIVALS_THEME.dimensions.length - 1 ? '1px solid #e2e2e2' : 'none',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '14px', color: NEAR_BLACK }}>
                      {dim.label}
                    </span>
                    <span
                      style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: YELLOW,
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}
                    >
                      {myScore}
                    </span>
                    <span style={{ fontSize: '14px', color: MID_GREY }}>
                      {avgScore > 0 ? avgScore.toFixed(1) : '—'}
                    </span>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: diffColor,
                      }}
                    >
                      {avgScore > 0 ? diffStr : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Second countdown */}
          <div
            style={{
              background: BLACK,
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '48px',
            }}
          >
            <Countdown
              targetDate={FESTIVALS_THEME.assessmentCloseAt}
              label="Meting sluit over"
            />
            <p style={{ color: MID_GREY, fontSize: '13px', margin: 0 }}>
              Definitieve uitslag:{' '}
              {FESTIVALS_THEME.assessmentCloseAt.toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Share block */}
          <div style={{ marginBottom: '48px' }}>
            <ShareBlock
              respondentNum={results.respondentNum}
              total={results.totalResponses}
              subjectLabel={selectedSubject?.label ?? ''}
              themeTitle={FESTIVALS_THEME.title}
              url={baseUrl}
            />
          </div>

          {/* Optional email capture */}
          {!emailSubmitted && (
            <div
              style={{
                background: LIGHT_GREY,
                padding: '32px',
                borderLeft: `4px solid ${YELLOW}`,
                marginBottom: '48px',
              }}
            >
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: '18px',
                  color: NEAR_BLACK,
                  marginBottom: '8px',
                  margin: '0 0 8px',
                }}
              >
                Ontvang de definitieve uitslag per e-mail
              </h3>
              <p style={{ color: SUBTLE, fontSize: '14px', marginBottom: '20px' }}>
                We sturen je de eindresultaten zodra de meting sluit.
              </p>
              <form
                onSubmit={handleEmailCapture}
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                }}
              >
                <input
                  type="email"
                  placeholder="jouw@email.nl"
                  value={resultEmail}
                  onChange={(e) => setResultEmail(e.target.value)}
                  required
                  style={{
                    padding: '10px 12px',
                    border: '1px solid #424242',
                    borderRadius: 0,
                    fontSize: '15px',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    outline: 'none',
                    minWidth: '240px',
                    flex: 1,
                  }}
                />
                <button
                  type="submit"
                  disabled={emailSubmitting}
                  style={{
                    background: YELLOW,
                    color: NEAR_BLACK,
                    border: `1px solid ${YELLOW}`,
                    borderRadius: 0,
                    padding: '10px 24px',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: emailSubmitting ? 'not-allowed' : 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {emailSubmitting ? '...' : 'Aanmelden →'}
                </button>
              </form>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: SUBTLE,
                  lineHeight: '1.5',
                  marginTop: '12px',
                }}
              >
                <input
                  type="checkbox"
                  checked={resultEmailConsent}
                  onChange={(e) => setResultEmailConsent(e.target.checked)}
                  style={{ marginTop: '2px', flexShrink: 0 }}
                />
                Ik wil ook op de hoogte blijven van andere De Machine metingen
              </label>
            </div>
          )}
          {emailSubmitted && (
            <div
              style={{
                background: LIGHT_GREY,
                padding: '24px',
                borderLeft: `4px solid ${YELLOW}`,
                marginBottom: '48px',
              }}
            >
              <p style={{ fontWeight: 700, color: NEAR_BLACK, margin: 0 }}>
                Aangemeld. We sturen je de uitslag zodra die beschikbaar is.
              </p>
            </div>
          )}

          {/* Back link */}
          <Link
            href="/pulse"
            style={{
              color: OLIVE,
              fontSize: '14px',
              textDecoration: 'underline',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            ← Terug naar de overzichtspagina
          </Link>
        </div>
      </div>
    )
  }

  // Loading / fallback
  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        minHeight: '100vh',
        background: WHITE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <PulseNav />
      <p style={{ color: MID_GREY }}>Laden...</p>
    </div>
  )
}

export default function BeoordelenPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            minHeight: '100vh',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p style={{ color: '#828282' }}>Laden...</p>
        </div>
      }
    >
      <BeoordelenContent />
    </Suspense>
  )
}
