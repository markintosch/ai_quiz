// FILE: src/app/perimenopause-compass/assess/CompassAssessClient.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Client component — runs the question stepper.
//
// State machine:
//   1. Stage selection (Q0)            → bepaalt skip-logic voor de rest
//   2. Loop door visible questions (één-voor-één, met progress bar)
//   3. Lead-capture page (e-mail + AVG checkbox)
//   4. Submit → Claude doet zijn werk → redirect naar /results/[id]
//
// Persists to sessionStorage zodat een refresh niet alle antwoorden wist.
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ALL_QUESTIONS,
  STAGE_QUESTION,
  questionsForStage,
  type CompassQuestion,
  type Stage,
} from '@/lib/perimenopause-compass/questions'
import type { ResponseValue } from '@/lib/perimenopause-compass/scoring'

const STORAGE_KEY = 'pmcompass:v1'

type ResponseMap = Record<string, ResponseValue>

interface PersistShape {
  stage:     Stage | null
  responses: ResponseMap
  step:      number                    // index in questions
  email:     string
  consent:   boolean
}

const CONSENT_TEXT = 'Ik ga akkoord met het privacybeleid en het ontvangen van mijn Compass-resultaten per e-mail.'

export default function CompassAssessClient() {
  const router = useRouter()
  const [stage,     setStage]     = useState<Stage | null>(null)
  const [responses, setResponses] = useState<ResponseMap>({})
  const [step,      setStep]      = useState(0)
  const [phase,     setPhase]     = useState<'stage' | 'questions' | 'lead' | 'submitting'>('stage')
  const [email,     setEmail]     = useState('')
  const [consent,   setConsent]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [hydrated,  setHydrated]  = useState(false)

  // ── Hydrate from sessionStorage ───────────────────────────────────────
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const p: PersistShape = JSON.parse(raw)
        if (p.stage) setStage(p.stage)
        setResponses(p.responses ?? {})
        setStep(p.step ?? 0)
        setEmail(p.email ?? '')
        setConsent(!!p.consent)
        if (p.stage) setPhase(p.step >= 999 ? 'lead' : 'questions')
      }
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])

  // Persist
  useEffect(() => {
    if (!hydrated) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        stage, responses, step, email, consent,
      } as PersistShape))
    } catch { /* ignore */ }
  }, [stage, responses, step, email, consent, hydrated])

  // ── Visible questions na stage-keuze (excl. STAGE_QUESTION zelf) ─────
  const visibleQuestions = useMemo(() => {
    if (!stage) return [] as CompassQuestion[]
    return questionsForStage(stage).filter((q) => q.code !== STAGE_QUESTION.code)
  }, [stage])

  const currentQ: CompassQuestion | undefined = visibleQuestions[step]
  const totalQ = visibleQuestions.length
  const progress = totalQ === 0 ? 0 : Math.round(((step + 1) / totalQ) * 100)

  // ── Stage selection ───────────────────────────────────────────────────
  function selectStage(s: Stage) {
    setStage(s)
    // Save stage as response too — server gebruikt zowel het 'stage' field
    // als de aparte responses[stage] niet, dus deze is alleen ter informatie.
    setResponses((r) => ({ ...r, stage: { kind: 'single', value: s } }))
    setPhase('questions')
    setStep(0)
  }

  function setResponse(code: string, val: ResponseValue) {
    setResponses((r) => ({ ...r, [code]: val }))
  }

  function next() {
    setError(null)
    // Validate required
    if (currentQ?.required) {
      const r = responses[currentQ.code]
      if (!r || (r.kind === 'multi' && r.value.length === 0) ||
          (r.kind === 'text'  && r.value.trim() === '')) {
        setError('Deze vraag is verplicht. Selecteer of vul iets in.')
        return
      }
    }
    if (step + 1 >= totalQ) {
      setPhase('lead')
    } else {
      setStep(step + 1)
    }
  }

  function back() {
    setError(null)
    if (phase === 'lead') {
      setPhase('questions')
      return
    }
    if (step === 0) {
      setPhase('stage')
      setStage(null)
      return
    }
    setStep(step - 1)
  }

  async function submit() {
    setError(null)
    if (!stage) return
    if (email && !consent) {
      setError('Vink het AVG-vakje aan om je resultaten per mail te ontvangen.')
      return
    }
    setPhase('submitting')
    try {
      const r = await fetch('/api/perimenopause-compass/submit', {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({
          stage,
          responses,
          email:       email.trim() || undefined,
          consent:     email ? consent : false,
          consentText: email ? CONSENT_TEXT : undefined,
        }),
      })
      const text = await r.text()
      let j: { id?: string; error?: string }
      try { j = JSON.parse(text) } catch { j = { error: text || `HTTP ${r.status}` } }
      if (!r.ok || !j.id) {
        setError(j.error ?? `Er ging iets mis (HTTP ${r.status})`)
        setPhase('lead')
        return
      }
      // Clear storage en redirect
      try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
      router.push(`/perimenopause-compass/results/${j.id}`)
    } catch (err) {
      setError(`Netwerkfout: ${err instanceof Error ? err.message : 'onbekend'}`)
      setPhase('lead')
    }
  }

  if (!hydrated) {
    return <div className="mx-auto max-w-2xl px-6 py-24 text-center text-gray-600">Laden…</div>
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-6 py-10">
        {/* Top progress + back */}
        <div className="mb-6 flex items-center justify-between text-sm">
          {phase !== 'stage' && (
            <button
              type="button"
              onClick={back}
              className="text-gray-600 hover:text-brand"
            >
              ← Vorige
            </button>
          )}
          {phase === 'questions' && (
            <span className="font-mono text-xs text-gray-600">
              {step + 1} / {totalQ}
            </span>
          )}
        </div>
        {phase === 'questions' && (
          <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full bg-brand-accent transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {phase === 'stage' && (
            <StageStep onSelect={selectStage} />
          )}

          {phase === 'questions' && currentQ && (
            <QuestionStep
              q={currentQ}
              value={responses[currentQ.code]}
              onChange={(v) => setResponse(currentQ.code, v)}
            />
          )}

          {phase === 'lead' && (
            <LeadCaptureStep
              email={email}
              setEmail={setEmail}
              consent={consent}
              setConsent={setConsent}
              consentText={CONSENT_TEXT}
            />
          )}

          {phase === 'submitting' && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-brand-accent/20 border-t-brand-accent" />
              <p className="mb-2 text-lg font-semibold text-brand">Even geduld…</p>
              <p className="text-sm text-gray-700">
                Je resultaat wordt berekend en Claude formuleert je hypothesen. Dit kan 30-60 seconden duren.
              </p>
            </div>
          )}

          {error && phase !== 'submitting' && (
            <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {phase === 'questions' && currentQ && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={next}
              className="rounded-md bg-brand-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-accent/90"
            >
              {step + 1 === totalQ ? 'Naar resultaten →' : 'Volgende →'}
            </button>
          </div>
        )}
        {phase === 'lead' && (
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => { setEmail(''); setConsent(false); submit() }}
              className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Sla over (anoniem afronden)
            </button>
            <button
              type="button"
              onClick={submit}
              className="rounded-md bg-brand-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-accent/90"
            >
              Mijn resultaten →
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

// ── Stage step ─────────────────────────────────────────────────────────────
function StageStep({ onSelect }: { onSelect: (s: Stage) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-accent">
        Eerste vraag
      </p>
      <h2 className="mb-3 text-2xl font-bold text-brand">{STAGE_QUESTION.prompt}</h2>
      {STAGE_QUESTION.help && <p className="mb-6 text-sm text-gray-600">{STAGE_QUESTION.help}</p>}
      <div className="space-y-2">
        {STAGE_QUESTION.options?.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onSelect(o.value as Stage)}
            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-left text-sm text-gray-800 transition-colors hover:border-brand-accent hover:bg-brand-accent/5"
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Question step ──────────────────────────────────────────────────────────
function QuestionStep({
  q, value, onChange,
}: {
  q:        CompassQuestion
  value:    ResponseValue | undefined
  onChange: (v: ResponseValue) => void
}) {
  return (
    <div>
      <h2 className="mb-3 text-xl font-bold text-brand">{q.prompt}</h2>
      {q.help && <p className="mb-5 text-sm text-gray-600">{q.help}</p>}
      {q.kind === 'single' && (
        <div className="space-y-2">
          {q.options?.map((o) => {
            const selected = value?.kind === 'single' && value.value === o.value
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onChange({ kind: 'single', value: o.value })}
                className={
                  'block w-full rounded-md border px-4 py-3 text-left text-sm transition-colors ' +
                  (selected
                    ? 'border-brand-accent bg-brand-accent/10 text-brand'
                    : 'border-gray-300 bg-white text-gray-800 hover:border-brand-accent hover:bg-brand-accent/5')
                }
              >
                {o.label}
              </button>
            )
          })}
        </div>
      )}
      {q.kind === 'multi' && (
        <div className="grid gap-2 sm:grid-cols-2">
          {q.options?.map((o) => {
            const arr = value?.kind === 'multi' ? value.value : []
            const checked = arr.includes(o.value)
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  const next = checked
                    ? arr.filter((v) => v !== o.value)
                    : [...arr, o.value]
                  onChange({ kind: 'multi', value: next })
                }}
                className={
                  'flex items-start gap-2 rounded-md border px-3 py-2.5 text-left text-sm transition-colors ' +
                  (checked
                    ? 'border-brand-accent bg-brand-accent/10 text-brand'
                    : 'border-gray-300 bg-white text-gray-800 hover:border-brand-accent hover:bg-brand-accent/5')
                }
              >
                <span className={
                  'mt-0.5 inline-block h-4 w-4 flex-shrink-0 rounded border ' +
                  (checked ? 'border-brand-accent bg-brand-accent' : 'border-gray-400 bg-white')
                }>
                  {checked && (
                    <svg viewBox="0 0 16 16" className="h-full w-full text-white">
                      <path fill="currentColor" d="M6.5 11.5L3 8l1.4-1.4L6.5 8.7l5.1-5.1L13 5z" />
                    </svg>
                  )}
                </span>
                <span>{o.label}</span>
              </button>
            )
          })}
        </div>
      )}
      {q.kind === 'likert' && (
        <LikertScale
          scale={q.scale ?? 5}
          value={value?.kind === 'likert' ? value.value : undefined}
          onChange={(v) => onChange({ kind: 'likert', value: v })}
        />
      )}
      {q.kind === 'text' && (
        <textarea
          value={value?.kind === 'text' ? value.value : ''}
          onChange={(e) => onChange({ kind: 'text', value: e.target.value })}
          rows={4}
          maxLength={600}
          placeholder="Vrij tekstveld…"
          className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
        />
      )}
    </div>
  )
}

function LikertScale({
  scale, value, onChange,
}: {
  scale:   number
  value:   number | undefined
  onChange:(n: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between gap-2">
        {Array.from({ length: scale }, (_, i) => i + 1).map((n) => {
          const selected = value === n
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={
                'flex-1 rounded-md border py-3 text-base font-semibold transition-colors ' +
                (selected
                  ? 'border-brand-accent bg-brand-accent text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-brand-accent')
              }
            >
              {n}
            </button>
          )
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-gray-600">
        <span>1</span>
        <span>{scale}</span>
      </div>
    </div>
  )
}

// ── Lead capture ──────────────────────────────────────────────────────────
function LeadCaptureStep({
  email, setEmail, consent, setConsent, consentText,
}: {
  email:       string
  setEmail:    (s: string) => void
  consent:     boolean
  setConsent:  (b: boolean) => void
  consentText: string
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-accent">
        Bijna klaar
      </p>
      <h2 className="mb-3 text-2xl font-bold text-brand">Waar mogen we je resultaten heen sturen?</h2>
      <p className="mb-6 text-sm leading-relaxed text-gray-700">
        Vul je e-mail in om een samenvatting te ontvangen en de Cycle app te kunnen gebruiken voor dagelijkse tracking.
        Sla over voor anoniem afronden — je krijgt je resultaat dan alleen op het scherm.
      </p>

      <label className="mb-3 block">
        <span className="mb-1 block text-sm font-medium text-gray-700">E-mail (optioneel)</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="naam@bedrijf.nl"
          className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
        />
      </label>

      {email && (
        <label className="flex items-start gap-2 text-xs text-gray-700">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 cursor-pointer accent-brand-accent"
          />
          <span className="leading-relaxed">{consentText}</span>
        </label>
      )}
    </div>
  )
}
