'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { PulseTheme, PulseEntity, PulseDimension } from '@/types/pulse'
import Countdown from '@/components/pulse/Countdown'
import BipolairLikert from '@/components/pulse/BipolairLikert'
import RadarDual from '@/components/pulse/RadarDual'
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

type Step = 'confirm' | 'questions' | 'results'

interface ResultsData {
  respondentNum: number
  totalResponses: number
  averages: Record<string, number>
  confidenceLabel: string
}

// ── Verdict computation ────────────────────────────────────────────────────────
function computeVerdict(
  dims: PulseDimension[],
  scores: Record<string, number>,
  averages: Record<string, number>
): string {
  if (Object.keys(averages).length === 0) return 'Jouw oordeel is geregistreerd.'
  let maxAbsDiff = 0
  let maxDim: PulseDimension | null = null
  let maxDiff = 0
  for (const d of dims) {
    const diff = (scores[d.slug] ?? 3) - (averages[d.slug] ?? 3)
    if (Math.abs(diff) > maxAbsDiff) {
      maxAbsDiff = Math.abs(diff)
      maxDim = d
      maxDiff = diff
    }
  }
  if (!maxDim || maxAbsDiff < 0.3) return 'Jouw oordeel zit dicht bij het collectieve gemiddelde.'
  if (maxDiff > 0) return `Je bent kritischer dan gemiddeld op ${maxDim.label.toLowerCase()}.`
  return `Je bent positiever dan gemiddeld op ${maxDim.label.toLowerCase()}.`
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function PulseNav() {
  return (
    <nav
      style={{
        background: BLACK,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: '56px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Link
        href="/pulse"
        style={{ color: WHITE, fontWeight: 700, fontSize: '15px', letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none' }}
      >
        De Machine Pulse
      </Link>
      <span style={{ color: MID_GREY, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        3voor12 · VPRO
      </span>
    </nav>
  )
}

// ── Entity assessment ─────────────────────────────────────────────────────────
function EntityAssessmentContent() {
  const params = useParams()
  const themeSlug = params.theme as string
  const entitySlug = params.entity as string

  const [theme, setTheme] = useState<PulseTheme | null>(null)
  const [entity, setEntity] = useState<PulseEntity | null>(null)
  const [otherEntities, setOtherEntities] = useState<PulseEntity[]>([])
  const [dimensions, setDimensions] = useState<PulseDimension[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [step, setStep] = useState<Step>('confirm')
  const [scores, setScores] = useState<Record<string, number | null>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [results, setResults] = useState<ResultsData | null>(null)

  // Email capture
  const [resultEmail, setResultEmail] = useState('')
  const [resultEmailConsent, setResultEmailConsent] = useState(false)
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [emailSubmitted, setEmailSubmitted] = useState(false)

  const ff = "'Inter', system-ui, sans-serif"

  useEffect(() => {
    async function load() {
      try {
        const themesRes = await fetch('/api/pulse/themes')
        if (!themesRes.ok) throw new Error('Kan thema niet laden.')
        const themesJson = (await themesRes.json()) as { themes: PulseTheme[] }
        const foundTheme = themesJson.themes.find((t) => t.slug === themeSlug)
        if (!foundTheme) throw new Error('Thema niet gevonden.')
        setTheme(foundTheme)

        const [entRes, dimRes] = await Promise.all([
          fetch(`/api/pulse/entities?themeId=${foundTheme.id}`),
          fetch(`/api/pulse/dimensions?themeId=${foundTheme.id}`),
        ])

        const entJson = entRes.ok ? (await entRes.json() as { entities: PulseEntity[] }) : { entities: [] }
        const dimJson = dimRes.ok ? (await dimRes.json() as { dimensions: PulseDimension[] }) : { dimensions: [] }

        const foundEntity = entJson.entities.find((e) => e.slug === entitySlug)
        if (!foundEntity) throw new Error('Festival niet gevonden.')
        setEntity(foundEntity)
        setOtherEntities(entJson.entities.filter((e) => e.slug !== entitySlug))
        setDimensions(dimJson.dimensions ?? [])

        const initScores: Record<string, number | null> = {}
        for (const d of (dimJson.dimensions ?? [])) {
          initScores[d.slug] = null
        }
        setScores(initScores)
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : 'Er ging iets mis.')
      }
      setLoading(false)
    }
    void load()
  }, [themeSlug, entitySlug])

  const allAnswered = dimensions.length > 0 && dimensions.every((d) => scores[d.slug] !== null)

  const handleSubmit = async () => {
    if (!entity || !theme || !allAnswered) return
    setSubmitting(true)
    setSubmitError('')

    const validScores: Record<string, number> = {}
    for (const d of dimensions) {
      validScores[d.slug] = scores[d.slug] as number
    }

    try {
      const res = await fetch('/api/pulse/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: theme.id,
          entityId: entity.id,
          scores: validScores,
        }),
      })
      const submitData = (await res.json()) as {
        respondentNum?: number
        totalResponses?: number
        error?: string
      }
      if (!res.ok) {
        setSubmitError(submitData.error ?? 'Er ging iets mis.')
        setSubmitting(false)
        return
      }

      const avgRes = await fetch(
        `/api/pulse/results?themeId=${encodeURIComponent(theme.id)}&entityId=${encodeURIComponent(entity.id)}`,
      )
      const avgData = (await avgRes.json()) as {
        averages?: Record<string, number>
        total?: number
        confidenceLabel?: string
      }

      setResults({
        respondentNum: submitData.respondentNum ?? 1,
        totalResponses: submitData.totalResponses ?? 1,
        averages: avgData.averages ?? {},
        confidenceLabel: avgData.confidenceLabel ?? 'Vroege signalen',
      })
      setStep('results')
    } catch {
      setSubmitError('Er ging iets mis. Probeer het opnieuw.')
    }
    setSubmitting(false)
  }

  const handleEmailCapture = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resultEmail.trim() || !entity || !theme || !results) return
    setEmailSubmitting(true)
    const validScores: Record<string, number> = {}
    for (const d of dimensions) {
      validScores[d.slug] = scores[d.slug] as number ?? 3
    }
    try {
      await fetch('/api/pulse/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: theme.id,
          entityId: entity.id,
          scores: validScores,
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

  const currentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/pulse/${themeSlug}/${entitySlug}`
      : `/pulse/${themeSlug}/${entitySlug}`

  const validScores: Record<string, number> = {}
  for (const d of dimensions) {
    validScores[d.slug] = (scores[d.slug] as number) ?? 3
  }

  // ── Loading / error ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ fontFamily: ff, minHeight: '100vh', background: WHITE }}>
        <PulseNav />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 24px' }}>
          <p style={{ color: MID_GREY }}>Laden...</p>
        </div>
      </div>
    )
  }

  if (loadError || !entity || !theme) {
    return (
      <div style={{ fontFamily: ff, minHeight: '100vh', background: WHITE }}>
        <PulseNav />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 24px' }}>
          <p style={{ color: '#c0392b' }}>{loadError || 'Niet gevonden.'}</p>
          <Link href={`/pulse/${themeSlug}`} style={{ color: OLIVE, textDecoration: 'underline', marginTop: '16px', display: 'inline-block' }}>
            ← Terug
          </Link>
        </div>
      </div>
    )
  }

  // ── Step: Confirm ────────────────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <div style={{ fontFamily: ff, minHeight: '100vh', background: WHITE }}>
        <PulseNav />
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px' }}>

          {/* Back link */}
          <Link
            href={`/pulse/${themeSlug}`}
            style={{
              display: 'inline-block',
              color: SUBTLE,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textDecoration: 'none',
              marginBottom: '40px',
            }}
          >
            ← {theme.title}
          </Link>

          {/* Entity type badge */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{
              background: YELLOW,
              color: BLACK,
              fontSize: '9px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '4px 10px',
            }}>
              {entity.entity_type}
            </span>
          </div>

          {/* Big entity label */}
          <h1 style={{
            fontWeight: 700,
            fontSize: 'clamp(32px, 5vw, 56px)',
            lineHeight: 1.05,
            color: NEAR_BLACK,
            margin: '0 0 12px',
            letterSpacing: '-0.01em',
          }}>
            {entity.label}
          </h1>

          {entity.subtitle && (
            <p style={{ color: SUBTLE, fontSize: '16px', margin: '0 0 20px', lineHeight: 1.5 }}>
              {entity.subtitle}
            </p>
          )}

          {entity.description_short && (
            <p style={{ color: NEAR_BLACK, fontSize: '16px', lineHeight: 1.65, margin: '0 0 32px', maxWidth: '560px' }}>
              {entity.description_short}
            </p>
          )}

          {/* Meta row */}
          {(entity.location_text || entity.edition_label) && (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
              {entity.location_text && (
                <span style={{ color: MID_GREY, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  📍 {entity.location_text}
                </span>
              )}
              {entity.edition_label && (
                <span style={{ color: MID_GREY, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  🗓 {entity.edition_label}
                </span>
              )}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={() => setStep('questions')}
            style={{
              background: YELLOW,
              color: NEAR_BLACK,
              border: 'none',
              padding: '15px 36px',
              fontFamily: ff,
              fontWeight: 700,
              fontSize: '16px',
              cursor: 'pointer',
              letterSpacing: '0.01em',
              display: 'block',
              width: '100%',
              textAlign: 'center',
            }}
          >
            Begin beoordeling →
          </button>
        </div>
      </div>
    )
  }

  // ── Step: Questions ─────────────────────────────────────────────────────────
  if (step === 'questions') {
    const answeredCount = dimensions.filter((d) => scores[d.slug] !== null).length
    const total = dimensions.length
    const progressPct = total > 0 ? Math.round((answeredCount / total) * 100) : 0

    return (
      <div style={{ fontFamily: ff, minHeight: '100vh', background: WHITE }}>
        <PulseNav />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px' }}>
          {/* Progress bar */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: SUBTLE, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {answeredCount} van {total} beantwoord
              </span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: NEAR_BLACK }}>
                {entity.label}
              </span>
            </div>
            <div style={{ height: '3px', background: LIGHT_GREY, width: '100%' }}>
              <div
                style={{ height: '3px', background: YELLOW, width: `${progressPct}%`, transition: 'width 0.3s ease' }}
              />
            </div>
          </div>

          {entity.subtitle && (
            <p style={{ color: SUBTLE, fontSize: '14px', marginBottom: '32px' }}>{entity.subtitle}</p>
          )}

          {dimensions.map((dim) => (
            <BipolairLikert
              key={dim.slug}
              dimension={{ slug: dim.slug, label: dim.label, anchorLow: dim.anchor_low, anchorHigh: dim.anchor_high }}
              value={scores[dim.slug] ?? null}
              onChange={(v) => setScores((prev) => ({ ...prev, [dim.slug]: v }))}
            />
          ))}

          {submitError && (
            <p style={{ color: '#c0392b', fontSize: '14px', marginBottom: '16px' }}>{submitError}</p>
          )}

          <button
            disabled={!allAnswered || submitting}
            onClick={() => void handleSubmit()}
            style={{
              background: allAnswered && !submitting ? YELLOW : LIGHT_GREY,
              color: allAnswered && !submitting ? NEAR_BLACK : MID_GREY,
              border: 'none',
              padding: '14px 32px',
              fontFamily: ff,
              fontWeight: 700,
              fontSize: '16px',
              cursor: allAnswered && !submitting ? 'pointer' : 'not-allowed',
              letterSpacing: '0.01em',
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
    const verdict = computeVerdict(dimensions, validScores, results.averages)

    return (
      <div style={{ fontFamily: ff, minHeight: '100vh', background: WHITE }}>
        <PulseNav />

        {/* ── TOP REVEAL — black section ────────────────────────────────── */}
        <div style={{ background: BLACK, padding: '64px 24px', textAlign: 'center' }}>
          <p style={{
            color: MID_GREY,
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            margin: '0 0 12px',
          }}>
            DEELNEMER
          </p>
          <p style={{
            color: YELLOW,
            fontSize: 'clamp(56px, 8vw, 96px)',
            fontWeight: 700,
            lineHeight: 1,
            margin: '0 0 16px',
            fontVariantNumeric: 'tabular-nums',
          }}>
            #{formattedNum}
          </p>

          {/* Response status badge */}
          <div style={{ marginBottom: '28px' }}>
            <span style={{
              background: 'transparent',
              border: '1px solid #424242',
              color: MID_GREY,
              fontSize: '10px',
              fontWeight: 600,
              padding: '4px 12px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              {results.confidenceLabel}
            </span>
          </div>

          {/* Verdict line */}
          <p style={{
            color: WHITE,
            fontSize: 'clamp(18px, 2.5vw, 28px)',
            fontWeight: 500,
            lineHeight: 1.4,
            maxWidth: '560px',
            margin: '0 auto',
          }}>
            {verdict}
          </p>
        </div>

        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '60px 24px' }}>

          {/* ── Entity header ────────────────────────────────────────────── */}
          <h2 style={{ fontWeight: 700, fontSize: '28px', lineHeight: 1.2, color: NEAR_BLACK, margin: '0 0 4px' }}>
            {entity.label}
          </h2>
          <p style={{ color: SUBTLE, fontSize: '15px', margin: '0 0 48px' }}>
            Jouw beoordeling vs. gemiddelde van alle deelnemers
          </p>

          {/* ── Radar chart ──────────────────────────────────────────────── */}
          <div style={{
            background: BLACK,
            padding: '48px 24px 36px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '48px',
          }}>
            <RadarDual
              yours={validScores}
              collective={results.averages}
              dimensions={dimensions.map((d) => ({ slug: d.slug, label: d.label, anchorLow: d.anchor_low, anchorHigh: d.anchor_high }))}
              size={400}
            />
            {/* Legend */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <span style={{ color: YELLOW, fontSize: '13px', fontWeight: 600 }}>— Jij</span>
              <span style={{ color: '#cccccc', fontSize: '13px', fontWeight: 600 }}>— Collectief</span>
            </div>
          </div>

          {/* ── Dimension breakdown — editorial rows ─────────────────────── */}
          <div style={{ marginBottom: '56px', borderTop: '1px solid #e2e2e2' }}>
            {dimensions.map((dim) => {
              const myScore = validScores[dim.slug] ?? 3
              const avgScore = results.averages[dim.slug] ?? 0

              let comparisonText = ''
              if (avgScore > 0) {
                const diff = myScore - avgScore
                const pct = Math.abs(diff / avgScore) * 100
                if (pct > 10) {
                  comparisonText = diff > 0
                    ? `Jij bent ${pct.toFixed(0)}% strenger`
                    : `Jij bent ${pct.toFixed(0)}% milder`
                } else {
                  comparisonText = 'Vergelijkbaar met gemiddelde'
                }
              }

              return (
                <div
                  key={dim.slug}
                  style={{ padding: '20px 0', borderBottom: '1px solid #e2e2e2' }}
                >
                  {/* Label */}
                  <p style={{
                    color: SUBTLE,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    margin: '0 0 8px',
                    fontWeight: 600,
                  }}>
                    {dim.label}
                  </p>

                  {/* Score comparison */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '12px' }}>
                    <span style={{
                      color: YELLOW,
                      fontSize: '40px',
                      fontWeight: 700,
                      lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {myScore}
                    </span>
                    {avgScore > 0 && (
                      <span style={{ color: '#aaaaaa', fontSize: '16px' }}>
                        vs. collectief {avgScore.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: '3px', background: '#e2e2e2', position: 'relative', marginBottom: '8px' }}>
                    {/* Your fill */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '3px',
                      background: YELLOW,
                      width: `${(myScore / 5) * 100}%`,
                      transition: 'width 0.4s ease',
                    }} />
                    {/* Collective marker */}
                    {avgScore > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '-3px',
                        width: '2px',
                        height: '9px',
                        background: '#aaaaaa',
                        left: `${(avgScore / 5) * 100}%`,
                      }} />
                    )}
                  </div>

                  {/* Comparison sentence */}
                  {comparisonText && (
                    <p style={{ color: SUBTLE, fontSize: '13px', margin: 0 }}>
                      {comparisonText}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* ── Countdown ────────────────────────────────────────────────── */}
          {theme.closes_at && (
            <div style={{ background: BLACK, padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginBottom: '56px' }}>
              <Countdown targetDate={new Date(theme.closes_at)} label="Meting sluit over" />
              <p style={{ color: '#aaaaaa', fontSize: '13px', margin: 0, letterSpacing: '0.02em' }}>
                Definitieve uitslag:{' '}
                <strong style={{ color: WHITE }}>
                  {new Date(theme.closes_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </strong>
              </p>
            </div>
          )}

          {/* ── Share block ───────────────────────────────────────────────── */}
          <div style={{ marginBottom: '56px' }}>
            <ShareBlock
              respondentNum={results.respondentNum}
              total={results.totalResponses}
              subjectLabel={entity.label}
              themeTitle={theme.title}
              url={currentUrl}
            />
          </div>

          {/* ── Email signup — typographic, not widget ────────────────────── */}
          {!emailSubmitted ? (
            <div style={{ borderLeft: `3px solid ${YELLOW}`, paddingLeft: '24px', marginBottom: '56px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '20px', color: NEAR_BLACK, margin: '0 0 8px' }}>
                Ontvang de uitslag.
              </h3>
              <p style={{ color: SUBTLE, fontSize: '14px', margin: '0 0 20px', lineHeight: 1.6 }}>
                We sturen je de eindresultaten zodra de meting sluit.
              </p>
              <form
                onSubmit={(e) => void handleEmailCapture(e)}
                style={{ display: 'flex', gap: '0', flexWrap: 'wrap', alignItems: 'stretch', maxWidth: '480px' }}
              >
                <input
                  type="email"
                  placeholder="jouw@email.nl"
                  value={resultEmail}
                  onChange={(e) => setResultEmail(e.target.value)}
                  required
                  style={{
                    padding: '11px 14px',
                    border: '1px solid #424242',
                    borderRight: 'none',
                    borderRadius: 0,
                    fontSize: '15px',
                    fontFamily: ff,
                    outline: 'none',
                    flex: 1,
                    minWidth: '180px',
                    background: LIGHT_GREY,
                  }}
                />
                <button
                  type="submit"
                  disabled={emailSubmitting}
                  style={{
                    background: YELLOW,
                    color: NEAR_BLACK,
                    border: 'none',
                    padding: '11px 20px',
                    fontFamily: ff,
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: emailSubmitting ? 'not-allowed' : 'pointer',
                    flexShrink: 0,
                    letterSpacing: '0.01em',
                  }}
                >
                  {emailSubmitting ? '...' : 'Aanmelden →'}
                </button>
              </form>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                color: SUBTLE,
                lineHeight: 1.5,
                marginTop: '12px',
                maxWidth: '480px',
              }}>
                <input
                  type="checkbox"
                  checked={resultEmailConsent}
                  onChange={(e) => setResultEmailConsent(e.target.checked)}
                  style={{ marginTop: '2px', flexShrink: 0 }}
                />
                Ik wil ook op de hoogte blijven van andere De Machine metingen
              </label>
            </div>
          ) : (
            <div style={{ borderLeft: `3px solid ${YELLOW}`, paddingLeft: '24px', marginBottom: '56px' }}>
              <p style={{ fontWeight: 700, color: NEAR_BLACK, margin: 0, fontSize: '16px' }}>
                Aangemeld. We sturen je de uitslag zodra die beschikbaar is.
              </p>
            </div>
          )}

          {/* ── Other festivals ───────────────────────────────────────────── */}
          {otherEntities.length > 0 && (
            <div style={{ marginBottom: '48px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '20px', color: NEAR_BLACK, margin: '0 0 6px' }}>
                Beoordeel ook de andere festivals
              </h3>
              <p style={{ color: SUBTLE, fontSize: '14px', margin: '0 0 24px' }}>
                Elke beoordeling geeft een vollediger beeld van de festivalscene.
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '2px',
                }}
              >
                {otherEntities.map((other) => (
                  <Link
                    key={other.id}
                    href={`/pulse/${themeSlug}/${other.slug}`}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <div
                      style={{
                        background: LIGHT_GREY,
                        padding: '20px',
                        borderBottom: '2px solid transparent',
                        transition: 'border-color 0.12s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderBottomColor = YELLOW }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderBottomColor = 'transparent' }}
                    >
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '15px', color: NEAR_BLACK, margin: '0 0 2px' }}>{other.label}</p>
                        {other.location_text && (
                          <p style={{ fontSize: '12px', color: MID_GREY, margin: 0 }}>{other.location_text}</p>
                        )}
                      </div>
                      <span style={{ color: NEAR_BLACK, fontSize: '18px', flexShrink: 0, fontWeight: 700 }}>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Link
            href={`/pulse/${themeSlug}`}
            style={{
              color: SUBTLE,
              fontSize: '12px',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontFamily: ff,
            }}
          >
            ← Terug naar {theme.title}
          </Link>
        </div>

        <footer style={{ background: BLACK, padding: '32px 24px', textAlign: 'center' }}>
          <p style={{ color: MID_GREY, fontSize: '13px', margin: 0 }}>
            De Machine Pulse wordt mogelijk gemaakt door VPRO 3voor12
          </p>
        </footer>
      </div>
    )
  }

  return null
}

export default function EntityAssessmentPage() {
  return (
    <Suspense
      fallback={
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#828282' }}>Laden...</p>
        </div>
      }
    >
      <EntityAssessmentContent />
    </Suspense>
  )
}
