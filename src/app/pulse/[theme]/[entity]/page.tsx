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
        style={{ color: WHITE, fontWeight: 700, fontSize: '16px', letterSpacing: '0.02em', textDecoration: 'none' }}
      >
        DE MACHINE PULSE
      </Link>
      <span style={{ color: MID_GREY, fontSize: '12px' }}>Een initiatief van 3voor12</span>
    </nav>
  )
}

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

  useEffect(() => {
    async function load() {
      try {
        // Get themes list
        const themesRes = await fetch('/api/pulse/themes')
        if (!themesRes.ok) throw new Error('Kan thema niet laden.')
        const themesJson = (await themesRes.json()) as { themes: PulseTheme[] }
        const foundTheme = themesJson.themes.find((t) => t.slug === themeSlug)
        if (!foundTheme) throw new Error('Thema niet gevonden.')
        setTheme(foundTheme)

        // Get entities + dimensions (public routes — no auth required)
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

        // Init scores
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

      // Fetch collective averages
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

  if (loading) {
    return (
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: WHITE }}>
        <PulseNav />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <p style={{ color: MID_GREY }}>Laden...</p>
        </div>
      </div>
    )
  }

  if (loadError || !entity || !theme) {
    return (
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: WHITE }}>
        <PulseNav />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
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
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: WHITE }}>
        <PulseNav />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px' }}>
          <p style={{ color: SUBTLE, fontSize: '13px', marginBottom: '24px' }}>
            <Link href={`/pulse/${themeSlug}`} style={{ color: OLIVE, textDecoration: 'none' }}>
              ← {theme.title}
            </Link>
          </p>

          <h1 style={{ fontWeight: 700, fontSize: '28px', lineHeight: '1.2', color: NEAR_BLACK, marginBottom: '8px' }}>
            Jij beoordeelt:
          </h1>
          <h2 style={{ fontWeight: 700, fontSize: '36px', color: NEAR_BLACK, marginBottom: '16px', margin: '0 0 16px' }}>
            {entity.label}
          </h2>
          {entity.subtitle && (
            <p style={{ color: SUBTLE, fontSize: '16px', marginBottom: '24px' }}>{entity.subtitle}</p>
          )}
          {entity.description_short && (
            <p style={{ color: NEAR_BLACK, fontSize: '15px', lineHeight: '1.6', marginBottom: '32px', maxWidth: '560px' }}>
              {entity.description_short}
            </p>
          )}

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
            {entity.location_text && (
              <span style={{ color: MID_GREY, fontSize: '13px' }}>📍 {entity.location_text}</span>
            )}
            {entity.edition_label && (
              <span style={{ color: MID_GREY, fontSize: '13px' }}>🗓 {entity.edition_label}</span>
            )}
          </div>

          <button
            onClick={() => setStep('questions')}
            style={{ background: YELLOW, color: NEAR_BLACK, border: `1px solid ${YELLOW}`, borderRadius: 0, padding: '14px 32px', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}
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
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: WHITE }}>
        <PulseNav />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px' }}>
          {/* Progress bar */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: SUBTLE, fontWeight: 600 }}>
                {answeredCount} van {total} beantwoord
              </span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: NEAR_BLACK }}>
                {entity.label}
              </span>
            </div>
            <div style={{ height: '4px', background: LIGHT_GREY, width: '100%' }}>
              <div
                style={{ height: '4px', background: YELLOW, width: `${progressPct}%`, transition: 'width 0.3s ease' }}
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
    const formattedOthers = Math.max(0, results.totalResponses - 1).toLocaleString('nl-NL')

    return (
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: WHITE }}>
        <PulseNav />

        {/* Participant banner */}
        <div style={{ background: BLACK, padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ color: MID_GREY, fontSize: '11px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
            DEELNEMER
          </p>
          <p style={{ color: YELLOW, fontSize: '56px', fontWeight: 700, lineHeight: '1', margin: '0 0 8px', fontVariantNumeric: 'tabular-nums' }}>
            #{formattedNum}
          </p>
          <p style={{ color: MID_GREY, fontSize: '14px', margin: '0 0 16px' }}>
            van {formattedOthers} andere beoordelaars
          </p>
          <span
            style={{
              background: 'transparent',
              border: '1px solid #424242',
              color: MID_GREY,
              fontSize: '11px',
              padding: '4px 12px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {results.confidenceLabel}
          </span>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
          {/* Subject header */}
          <h2 style={{ fontWeight: 700, fontSize: '28px', lineHeight: '1.2', color: NEAR_BLACK, marginBottom: '8px' }}>
            {entity.label}
          </h2>
          <p style={{ color: SUBTLE, fontSize: '15px', marginBottom: '48px' }}>
            Jouw beoordeling vs. gemiddelde van alle deelnemers
          </p>

          {/* Dual radar */}
          <div
            style={{
              background: BLACK,
              padding: '40px 24px',
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '48px',
            }}
          >
            <RadarDual
              yours={validScores}
              collective={results.averages}
              dimensions={dimensions.map((d) => ({ slug: d.slug, label: d.label, anchorLow: d.anchor_low, anchorHigh: d.anchor_high }))}
              size={340}
            />
          </div>

          {/* Dimension breakdown table */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '18px', color: NEAR_BLACK, marginBottom: '16px' }}>
              Per dimensie
            </h3>
            <div style={{ border: '1px solid #e2e2e2' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 160px', padding: '10px 16px', background: LIGHT_GREY, borderBottom: '1px solid #e2e2e2' }}>
                {['Dimensie', 'Jij', 'Gem.', 'Vergelijking'].map((h) => (
                  <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: SUBTLE, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {h}
                  </span>
                ))}
              </div>
              {dimensions.map((dim, i) => {
                const myScore = validScores[dim.slug] ?? 3
                const avgScore = results.averages[dim.slug] ?? 0
                const diff = myScore - avgScore

                let comparison = ''
                if (avgScore > 0) {
                  const pct = Math.abs(diff / avgScore) * 100
                  if (pct > 10) {
                    comparison = diff > 0
                      ? `Jij bent ${pct.toFixed(0)}% strenger`
                      : `Jij bent ${pct.toFixed(0)}% milder`
                  } else {
                    comparison = 'Vergelijkbaar met gemiddelde'
                  }
                }

                const diffColor = diff > 0.5 ? OLIVE : diff < -0.5 ? '#c0392b' : SUBTLE

                return (
                  <div
                    key={dim.slug}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 80px 80px 160px',
                      padding: '12px 16px',
                      borderBottom: i < dimensions.length - 1 ? '1px solid #e2e2e2' : 'none',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '14px', color: NEAR_BLACK }}>{dim.label}</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: YELLOW, fontVariantNumeric: 'tabular-nums' }}>
                      {myScore}
                    </span>
                    <span style={{ fontSize: '14px', color: MID_GREY }}>
                      {avgScore > 0 ? avgScore.toFixed(1) : '—'}
                    </span>
                    <span style={{ fontSize: '12px', color: diffColor }}>{comparison}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Countdown */}
          {theme.closes_at && (
            <div style={{ background: BLACK, padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginBottom: '48px' }}>
              <Countdown targetDate={new Date(theme.closes_at)} label="Meting sluit over" />
              <p style={{ color: '#aaaaaa', fontSize: '13px', margin: 0, letterSpacing: '0.02em' }}>
                Definitieve uitslag:{' '}
                <strong style={{ color: WHITE }}>
                  {new Date(theme.closes_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </strong>
              </p>
            </div>
          )}

          {/* Share block */}
          <div style={{ marginBottom: '48px' }}>
            <ShareBlock
              respondentNum={results.respondentNum}
              total={results.totalResponses}
              subjectLabel={entity.label}
              themeTitle={theme.title}
              url={currentUrl}
            />
          </div>

          {/* Email capture */}
          {!emailSubmitted ? (
            <div style={{ background: LIGHT_GREY, padding: '32px', borderLeft: `4px solid ${YELLOW}`, marginBottom: '48px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '18px', color: NEAR_BLACK, margin: '0 0 8px' }}>
                Ontvang de definitieve uitslag per e-mail
              </h3>
              <p style={{ color: SUBTLE, fontSize: '14px', marginBottom: '20px' }}>
                We sturen je de eindresultaten zodra de meting sluit.
              </p>
              <form onSubmit={(e) => void handleEmailCapture(e)} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <input
                  type="email"
                  placeholder="jouw@email.nl"
                  value={resultEmail}
                  onChange={(e) => setResultEmail(e.target.value)}
                  required
                  style={{ padding: '10px 12px', border: '1px solid #424242', borderRadius: 0, fontSize: '15px', fontFamily: "'Inter', system-ui, sans-serif", outline: 'none', minWidth: '240px', flex: 1 }}
                />
                <button
                  type="submit"
                  disabled={emailSubmitting}
                  style={{ background: YELLOW, color: NEAR_BLACK, border: `1px solid ${YELLOW}`, borderRadius: 0, padding: '10px 24px', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: '15px', cursor: emailSubmitting ? 'not-allowed' : 'pointer', flexShrink: 0 }}
                >
                  {emailSubmitting ? '...' : 'Aanmelden →'}
                </button>
              </form>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '13px', color: SUBTLE, lineHeight: '1.5', marginTop: '12px' }}>
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
            <div style={{ background: LIGHT_GREY, padding: '24px', borderLeft: `4px solid ${YELLOW}`, marginBottom: '48px' }}>
              <p style={{ fontWeight: 700, color: NEAR_BLACK, margin: 0 }}>
                Aangemeld. We sturen je de uitslag zodra die beschikbaar is.
              </p>
            </div>
          )}

          {/* Other festivals CTA */}
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
                        transition: 'border-color 0.15s',
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
                      <span style={{ color: OLIVE, fontSize: '18px', flexShrink: 0 }}>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Link href={`/pulse/${themeSlug}`} style={{ color: OLIVE, fontSize: '14px', textDecoration: 'underline', fontFamily: "'Inter', system-ui, sans-serif" }}>
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
