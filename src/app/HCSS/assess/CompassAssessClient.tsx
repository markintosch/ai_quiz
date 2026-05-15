// FILE: src/app/HCSS/assess/CompassAssessClient.tsx
// Client stepper voor HCSS Cyber Compass.

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  questionsForStage, stageQuestion,
  type LocalizedQuestion, type Stage,
} from '@/lib/cyber-compass/questions'
import type { ResponseValue } from '@/lib/cyber-compass/scoring'
import { STEPPER, type Lang } from '@/lib/cyber-compass/i18n'

const STORAGE_KEY = 'cybercompass:v1'

type ResponseMap = Record<string, ResponseValue>

interface PersistShape {
  stage:            Stage | null
  responses:        ResponseMap
  step:             number
  email:            string
  consent:          boolean
  organisationName: string
}

interface Props {
  lang:           Lang
  prefilledEmail: string
}

type StepperT = typeof STEPPER['nl']

export default function CompassAssessClient({ lang, prefilledEmail }: Props) {
  const router = useRouter()
  const t: StepperT = STEPPER[lang]
  const [stage,     setStage]     = useState<Stage | null>(null)
  const [responses, setResponses] = useState<ResponseMap>({})
  const [step,      setStep]      = useState(0)
  const [phase,     setPhase]     = useState<'stage' | 'questions' | 'lead' | 'submitting'>('stage')
  const [email,     setEmail]     = useState(prefilledEmail)
  const [orgName,   setOrgName]   = useState('')
  const [consent,   setConsent]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [hydrated,  setHydrated]  = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const p: PersistShape = JSON.parse(raw)
        if (p.stage) setStage(p.stage)
        setResponses(p.responses ?? {})
        setStep(p.step ?? 0)
        if (p.email)            setEmail(p.email)
        if (p.organisationName) setOrgName(p.organisationName)
        setConsent(!!p.consent)
        if (p.stage) setPhase('questions')
      }
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        stage, responses, step, email, consent, organisationName: orgName,
      } as PersistShape))
    } catch { /* ignore */ }
  }, [stage, responses, step, email, consent, orgName, hydrated])

  const visibleQuestions = useMemo(() => {
    if (!stage) return [] as LocalizedQuestion[]
    return questionsForStage(stage, lang).filter((q) => q.code !== 'organisation_size')
  }, [stage, lang])

  const sq         = useMemo(() => stageQuestion(lang), [lang])
  const currentQ: LocalizedQuestion | undefined = visibleQuestions[step]
  const totalQ     = visibleQuestions.length
  const progress   = totalQ === 0 ? 0 : Math.round(((step + 1) / totalQ) * 100)

  function selectStage(s: Stage) {
    setStage(s)
    setResponses((r) => ({ ...r, organisation_size: { kind: 'single', value: s } }))
    setPhase('questions'); setStep(0)
  }

  function setResponse(code: string, val: ResponseValue) {
    setResponses((r) => ({ ...r, [code]: val }))
  }

  function next() {
    setError(null)
    if (currentQ?.required) {
      const r = responses[currentQ.code]
      if (!r || (r.kind === 'multi' && r.value.length === 0) ||
          (r.kind === 'text'  && r.value.trim() === '')) {
        setError(t.errRequired); return
      }
    }
    if (step + 1 >= totalQ) setPhase('lead')
    else                     setStep(step + 1)
  }

  function back() {
    setError(null)
    if (phase === 'lead') { setPhase('questions'); return }
    if (step === 0) { setPhase('stage'); setStage(null); return }
    setStep(step - 1)
  }

  async function submit() {
    setError(null)
    if (!stage) return
    if (email && !consent) { setError(t.errConsent); return }
    setPhase('submitting')
    try {
      const r = await fetch('/api/cyber-compass/submit', {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({
          stage, responses,
          language:         lang,
          email:            email.trim() || undefined,
          organisationName: orgName.trim() || undefined,
          consent:          email ? consent : false,
          consentText:      email ? t.consentText : undefined,
        }),
      })
      const text = await r.text()
      let j: { id?: string; error?: string }
      try { j = JSON.parse(text) } catch { j = { error: text || `HTTP ${r.status}` } }
      if (!r.ok || !j.id) {
        setError(j.error ?? t.errNetwork); setPhase('lead'); return
      }
      try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
      router.push(`/HCSS/results/${j.id}${lang === 'nl' ? '' : '?lang=' + lang}`)
    } catch {
      setError(t.errNetwork); setPhase('lead')
    }
  }

  if (!hydrated) {
    return <div className="mx-auto max-w-2xl px-6 py-24 text-center text-gray-600">{t.loading}</div>
  }

  return (
    <main className="min-h-screen" style={{ background: '#f4f6f8' }}>
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between text-sm">
          {phase !== 'stage' && (
            <button type="button" onClick={back} className="text-gray-600 hover:text-gray-900">{t.back}</button>
          )}
          {phase === 'questions' && (
            <span className="font-mono text-xs text-gray-600">{step + 1} / {totalQ}</span>
          )}
        </div>
        {phase === 'questions' && (
          <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full transition-all" style={{ width: `${progress}%`, background: '#E8611A' }} />
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {phase === 'stage' && <StageStep onSelect={selectStage} q={sq} firstLabel={t.firstQuestion} />}
          {phase === 'questions' && currentQ && (
            <QuestionStep q={currentQ} value={responses[currentQ.code]} onChange={(v) => setResponse(currentQ.code, v)} />
          )}
          {phase === 'lead' && (
            <LeadCaptureStep
              t={t} email={email} setEmail={setEmail}
              orgName={orgName} setOrgName={setOrgName}
              consent={consent} setConsent={setConsent}
            />
          )}
          {phase === 'submitting' && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4" style={{ borderColor: '#E8611A33', borderTopColor: '#E8611A' }} />
              <p className="mb-2 text-lg font-semibold" style={{ color: '#1f3a4a' }}>{t.submitting1}</p>
              <p className="text-sm text-gray-700">{t.submitting2}</p>
            </div>
          )}
          {error && phase !== 'submitting' && (
            <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</div>
          )}
        </div>

        {phase === 'questions' && currentQ && (
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={next}
              className="rounded-md px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              style={{ background: '#E8611A' }}>
              {step + 1 === totalQ ? t.toResults : t.nextDefault}
            </button>
          </div>
        )}
        {phase === 'lead' && (
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button"
              onClick={() => { setEmail(''); setConsent(false); submit() }}
              className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm text-gray-700 hover:bg-gray-50">
              {t.skip}
            </button>
            <button type="button" onClick={submit}
              className="rounded-md px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              style={{ background: '#E8611A' }}>
              {t.myResults}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

function StageStep({ onSelect, q, firstLabel }: { onSelect: (s: Stage) => void; q: LocalizedQuestion; firstLabel: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#E8611A' }}>{firstLabel}</p>
      <h2 className="mb-3 text-2xl font-bold" style={{ color: '#1f3a4a' }}>{q.prompt}</h2>
      {q.help && <p className="mb-6 text-sm text-gray-600">{q.help}</p>}
      <div className="space-y-2">
        {q.options?.map((o) => (
          <button key={o.value} type="button" onClick={() => onSelect(o.value as Stage)}
            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-left text-sm text-gray-800 hover:border-orange-400 hover:bg-orange-50">
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function QuestionStep({ q, value, onChange }: {
  q: LocalizedQuestion; value: ResponseValue | undefined; onChange: (v: ResponseValue) => void
}) {
  return (
    <div>
      <h2 className="mb-3 text-xl font-bold" style={{ color: '#1f3a4a' }}>{q.prompt}</h2>
      {q.help && <p className="mb-5 text-sm text-gray-600">{q.help}</p>}
      {q.kind === 'single' && (
        <div className="space-y-2">
          {q.options?.map((o) => {
            const selected = value?.kind === 'single' && value.value === o.value
            return (
              <button key={o.value} type="button"
                onClick={() => onChange({ kind: 'single', value: o.value })}
                className={'block w-full rounded-md border px-4 py-3 text-left text-sm transition-colors ' +
                  (selected ? 'text-gray-900' : 'border-gray-300 bg-white text-gray-800 hover:border-orange-400 hover:bg-orange-50')}
                style={selected ? { borderColor: '#E8611A', background: '#FFF6F1' } : undefined}>
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
              <button key={o.value} type="button"
                onClick={() => {
                  const next = checked ? arr.filter((v) => v !== o.value) : [...arr, o.value]
                  onChange({ kind: 'multi', value: next })
                }}
                className={'flex items-start gap-2 rounded-md border px-3 py-2.5 text-left text-sm ' +
                  (checked ? 'text-gray-900' : 'border-gray-300 bg-white text-gray-800 hover:border-orange-400 hover:bg-orange-50')}
                style={checked ? { borderColor: '#E8611A', background: '#FFF6F1' } : undefined}>
                <span className="mt-0.5 inline-block h-4 w-4 flex-shrink-0 rounded border"
                  style={checked ? { background: '#E8611A', borderColor: '#E8611A' } : { borderColor: '#9ca3af', background: '#fff' }}>
                  {checked && <svg viewBox="0 0 16 16" className="h-full w-full text-white"><path fill="currentColor" d="M6.5 11.5L3 8l1.4-1.4L6.5 8.7l5.1-5.1L13 5z"/></svg>}
                </span>
                <span>{o.label}</span>
              </button>
            )
          })}
        </div>
      )}
      {q.kind === 'likert' && (
        <LikertScale scale={q.scale ?? 5}
          value={value?.kind === 'likert' ? value.value : undefined}
          onChange={(v) => onChange({ kind: 'likert', value: v })} />
      )}
      {q.kind === 'text' && (
        <textarea
          value={value?.kind === 'text' ? value.value : ''}
          onChange={(e) => onChange({ kind: 'text', value: e.target.value })}
          rows={4} maxLength={600}
          className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200" />
      )}
    </div>
  )
}

function LikertScale({ scale, value, onChange }: { scale: number; value: number | undefined; onChange: (n: number) => void }) {
  return (
    <div>
      <div className="flex justify-between gap-2">
        {Array.from({ length: scale }, (_, i) => i + 1).map((n) => {
          const selected = value === n
          return (
            <button key={n} type="button" onClick={() => onChange(n)}
              className={'flex-1 rounded-md border py-3 text-base font-semibold transition-colors ' +
                (selected ? 'text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-orange-400')}
              style={selected ? { borderColor: '#E8611A', background: '#E8611A' } : undefined}>
              {n}
            </button>
          )
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-gray-600">
        <span>1</span><span>{scale}</span>
      </div>
    </div>
  )
}

function LeadCaptureStep({
  t, email, setEmail, orgName, setOrgName, consent, setConsent,
}: {
  t: StepperT; email: string; setEmail: (s: string) => void
  orgName: string; setOrgName: (s: string) => void
  consent: boolean; setConsent: (b: boolean) => void
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#E8611A' }}>{t.almostDone}</p>
      <h2 className="mb-3 text-2xl font-bold" style={{ color: '#1f3a4a' }}>{t.leadHeading}</h2>
      <p className="mb-6 text-sm leading-relaxed text-gray-700">{t.leadIntro}</p>

      <label className="mb-3 block">
        <span className="mb-1 block text-sm font-medium text-gray-700">{t.orgNameLabel}</span>
        <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)}
          placeholder={t.orgNamePlaceholder}
          className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200" />
      </label>

      <label className="mb-3 block">
        <span className="mb-1 block text-sm font-medium text-gray-700">{t.emailLabel}</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          autoComplete="email" placeholder={t.emailPlaceholder}
          className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200" />
      </label>

      {email && (
        <label className="flex items-start gap-2 text-xs text-gray-700">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 cursor-pointer" style={{ accentColor: '#E8611A' }} />
          <span className="leading-relaxed">{t.consentText}</span>
        </label>
      )}
    </div>
  )
}
