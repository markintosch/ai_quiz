'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getContent, getQuestions, type Lang, type Role, type Question,
} from '@/products/ai_benchmark/data'
import { trackBenchEvent } from '@/components/ai_benchmark/Tracker'

// ── Mentor brand tokens ──────────────────────────────────────────────────────
const INK        = '#0F172A'
const ACCENT     = '#1D4ED8'
const WARM       = '#D97706'
const WARM_LIGHT = '#FEF3C7'
const BODY       = '#374151'
const MUTED      = '#94A3B8'
const BORDER     = '#E2E8F0'
const LIGHT      = '#F8FAFC'
const FONT       = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

const LANG_LABELS: { key: Lang; label: string }[] = [
  { key: 'nl', label: 'NL' },
  { key: 'en', label: 'EN' },
  { key: 'fr', label: 'FR' },
  { key: 'de', label: 'DE' },
]

type Step = 'intro' | 'questions'

type Answers = Record<string, string | string[] | undefined>

// ── Inner ────────────────────────────────────────────────────────────────────
function StartInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const rawLang      = searchParams.get('lang') || 'nl'
  const lang         = (['nl', 'en', 'fr', 'de'].includes(rawLang) ? rawLang : 'nl') as Lang

  const t = getContent(lang)

  // Intro form
  const [name,        setName]         = useState('')
  const [email,       setEmail]        = useState('')
  const [role,        setRole]         = useState<Role | ''>('')
  const [seniority,   setSeniority]    = useState('')
  const [industry,    setIndustry]     = useState('')
  const [companySize, setCompanySize]  = useState('')
  const [region,      setRegion]       = useState('')
  const [consent,     setConsent]      = useState(false)

  const [step,        setStep]         = useState<Step>('intro')
  const [answers,     setAnswers]      = useState<Answers>({})
  const [submitting,  setSubmitting]   = useState(false)
  const [error,       setError]        = useState<string | null>(null)

  // Funnel tracking
  const introMounted = useRef(false)
  useEffect(() => {
    if (introMounted.current) return
    introMounted.current = true
    trackBenchEvent('intro_started')
  }, [])
  const trackedQs = useRef<Set<string>>(new Set())
  useEffect(() => {
    if (step !== 'questions') return
    for (const [qid, val] of Object.entries(answers)) {
      const filled = Array.isArray(val) ? val.length > 0 : !!val
      if (filled && !trackedQs.current.has(qid)) {
        trackedQs.current.add(qid)
        trackBenchEvent('question_answered', { question_id: qid, role: role || undefined })
      }
    }
  }, [answers, step, role])

  const switchLang = (key: Lang) => router.replace(`/ai_benchmark/start?lang=${key}`)

  const questions = useMemo<Question[]>(() => role ? getQuestions(role) : [], [role])

  const introValid = !!(role && email.includes('@') && name.trim() && seniority && industry && companySize && region)

  const allAnswered = questions.every(q => {
    const a = answers[q.id]
    if (a === undefined) return false
    if (q.type === 'matrix') {
      const rowCount = q.rows?.length ?? 0
      if (!Array.isArray(a)) return false
      const filled = a.filter(x => typeof x === 'string' && x.length > 0).length
      return filled >= rowCount && rowCount > 0
    }
    if (Array.isArray(a)) return a.length > 0
    return typeof a === 'string' && a.length > 0
  })

  // ── Multiselect answer toggle (with "none" exclusivity) ───────────────────
  function toggleMulti(qId: string, optId: string) {
    setAnswers(prev => {
      const cur = Array.isArray(prev[qId]) ? prev[qId] as string[] : []
      let next: string[]
      if (optId === 'none') {
        next = cur.includes('none') ? [] : ['none']
      } else {
        const without = cur.filter(x => x !== 'none')
        next = without.includes(optId)
          ? without.filter(x => x !== optId)
          : [...without, optId]
      }
      return { ...prev, [qId]: next }
    })
  }

  function setOtherDetail(qId: string, value: string) {
    setAnswers(prev => {
      const cur = Array.isArray(prev[qId]) ? prev[qId] as string[] : []
      const without = cur.filter(x => !x.startsWith('other_detail:'))
      const next = value.trim() ? [...without, `other_detail:${value.trim()}`] : without
      return { ...prev, [qId]: next }
    })
  }

  function getOtherDetail(qId: string): string {
    const cur = Array.isArray(answers[qId]) ? answers[qId] as string[] : []
    const found = cur.find(x => x.startsWith('other_detail:'))
    return found ? found.slice('other_detail:'.length) : ''
  }

  function setSingle(qId: string, optId: string) {
    setAnswers(prev => ({ ...prev, [qId]: optId }))
  }

  function setMatrix(qId: string, rowIndex: number, optId: string, totalRows: number) {
    setAnswers(prev => {
      const cur = Array.isArray(prev[qId]) ? [...(prev[qId] as string[])] : []
      while (cur.length < totalRows) cur.push('')
      cur[rowIndex] = optId
      return { ...prev, [qId]: cur }
    })
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (submitting) return
    setSubmitting(true); setError(null)
    trackBenchEvent('submit_attempt', { role: role || undefined })
    try {
      const res = await fetch('/api/ai_benchmark/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name, email, lang, role, seniority, industry, companySize, region,
          marketingConsent: consent, answers,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json?.id) throw new Error(json?.error || 'Submit failed')
      trackBenchEvent('submit_success', { role: role || undefined, meta: { archetype: json.archetype, score: json.totalScore } })
      router.push(`/ai_benchmark/results/${json.id}?lang=${lang}`)
    } catch (e) {
      trackBenchEvent('submit_error')
      setError(e instanceof Error ? e.message : 'Submit failed')
      setSubmitting(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  const introContent = (
    <>
      <span style={{
        display: 'inline-block', fontSize: 11, fontWeight: 700,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        color: WARM, background: WARM_LIGHT,
        padding: '5px 14px', borderRadius: 100, marginBottom: 18,
      }}>
        {t.startBadge}
      </span>

        <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 42px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 16, color: INK, letterSpacing: '-0.02em' }}>
          {t.startH1}
        </h1>
        <p style={{ fontSize: 16, color: BODY, lineHeight: 1.65, marginBottom: 32 }}>
          {t.startBody}
        </p>

        <form
          onSubmit={e => {
            e.preventDefault()
            if (introValid) {
              trackBenchEvent('intro_completed', { role: role || undefined })
              setStep('questions')
            }
          }}
          style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '24px 24px' }}
        >
          {/* Role pills */}
          <div style={{ marginBottom: 18 }}>
            <Label>{t.startRoleLabel}</Label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {t.ROLES.map(r => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  style={{
                    flex: '1 1 180px', minWidth: 180,
                    padding: '14px 16px', borderRadius: 10, textAlign: 'left',
                    border: `2px solid ${role === r.id ? ACCENT : BORDER}`,
                    background: role === r.id ? `${ACCENT}0d` : '#fff',
                    cursor: 'pointer', fontFamily: FONT,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 800, color: INK, marginBottom: 3 }}>{r.label}</div>
                  <div style={{ fontSize: 12, color: BODY, lineHeight: 1.5 }}>{r.description}</div>
                </button>
              ))}
            </div>
          </div>

          <Row>
            <Field label={t.startSeniorityLbl}>
              <Select value={seniority} onChange={setSeniority} options={t.SENIORITIES} />
            </Field>
            <Field label={t.startRegionLbl}>
              <Select value={region} onChange={setRegion} options={t.REGIONS} />
            </Field>
          </Row>

          <Row>
            <Field label={t.startIndustryLbl}>
              <Select value={industry} onChange={setIndustry} options={t.INDUSTRIES} />
            </Field>
            <Field label={t.startCompanySize}>
              <Select value={companySize} onChange={setCompanySize} options={t.COMPANY_SIZES} />
            </Field>
          </Row>

          <Row>
            <Field label={t.startNameLbl}>
              <Input type="text" value={name} onChange={setName} placeholder="Voornaam" />
            </Field>
            <Field label={t.startEmailLbl}>
              <Input type="email" value={email} onChange={setEmail} placeholder="jij@bedrijf.nl" />
            </Field>
          </Row>

          <div style={{ marginTop: 6, padding: '14px 16px', background: LIGHT, borderRadius: 8, border: `1px solid ${BORDER}` }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                style={{ marginTop: 3, flexShrink: 0 }}
              />
              <span style={{ fontSize: 13, color: BODY, lineHeight: 1.55 }}>
                {t.startConsentLbl}
              </span>
            </label>
            <p style={{ fontSize: 11, color: MUTED, marginTop: 10, lineHeight: 1.55 }}>
              Je e-mailadres is verplicht omdat we je dashboard via een unieke link delen.
              Het wordt nooit verkocht of gedeeld met derden. Je kunt op elk moment je gegevens
              laten verwijderen via{' '}
              <a href="mailto:mark@brandpwrdmedia.com" style={{ color: ACCENT, textDecoration: 'underline' }}>
                mark@brandpwrdmedia.com
              </a>
              . Lees ook ons{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: ACCENT, textDecoration: 'underline' }}>
                privacybeleid
              </a>.
            </p>
          </div>

          <button
            type="submit"
            disabled={!introValid}
            style={{
              marginTop: 22, width: '100%', padding: '14px 16px', fontSize: 15, fontWeight: 700,
              background: introValid ? ACCENT : '#CBD5E1', color: '#fff',
              border: 'none', borderRadius: 8,
              cursor: introValid ? 'pointer' : 'not-allowed',
              fontFamily: FONT,
              boxShadow: introValid ? `0 4px 20px ${ACCENT}33` : 'none',
            }}
          >
            {t.startSubmit}
          </button>

      {!introValid && (
        <p style={{ marginTop: 10, fontSize: 12, color: MUTED }}>
          {t.startError}
        </p>
      )}
    </form>
    </>
  )

  const questionsContent = (
    <>
      <span style={{
        display: 'inline-block', fontSize: 11, fontWeight: 700,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        color: WARM, background: WARM_LIGHT,
        padding: '5px 14px', borderRadius: 100, marginBottom: 18,
      }}>
        Stap 2 van 2 · {questions.length} vragen
      </span>

      <h1 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 28, color: INK, letterSpacing: '-0.02em' }}>
        Beantwoord wat klopt voor jou.
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            q={q}
            index={i + 1}
            answer={answers[q.id]}
            onToggleMulti={toggleMulti}
            onSetSingle={setSingle}
            onSetMatrix={setMatrix}
            onSetOtherDetail={setOtherDetail}
            getOtherDetail={getOtherDetail}
            otherLabel={t.qOtherLabel}
          />
        ))}
      </div>

      {error && (
        <p style={{ marginTop: 16, fontSize: 13, color: '#B91C1C' }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => setStep('intro')}
          disabled={submitting}
          style={{
            padding: '12px 18px', fontSize: 14, fontWeight: 600,
            background: '#fff', color: INK, border: `1px solid ${BORDER}`,
            borderRadius: 8, cursor: 'pointer', fontFamily: FONT,
          }}
        >
          {t.qBack}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          style={{
            flex: 1, padding: '14px 18px', fontSize: 15, fontWeight: 700,
            background: allAnswered ? ACCENT : '#CBD5E1', color: '#fff',
            border: 'none', borderRadius: 8,
            cursor: allAnswered && !submitting ? 'pointer' : 'not-allowed',
            fontFamily: FONT,
            boxShadow: allAnswered ? `0 4px 20px ${ACCENT}33` : 'none',
          }}
        >
          {submitting ? t.qSubmitting : t.qSubmit}
        </button>
      </div>
      {!allAnswered && (
        <p style={{ marginTop: 10, fontSize: 12, color: MUTED }}>
          Beantwoord alle vragen om je dashboard op te halen.
        </p>
      )}
    </>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: INK, fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={`/ai_benchmark?lang=${lang}`} style={{ display: 'flex', alignItems: 'baseline', gap: 8, textDecoration: 'none' }}>
            <span style={{ color: INK, fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }}>
              {t.navName}
            </span>
            <span style={{ color: MUTED, fontSize: 13, fontWeight: 500 }}>
              {t.navTagline}
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {LANG_LABELS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => switchLang(key)}
                  style={{
                    padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                    border: `1px solid ${lang === key ? ACCENT : BORDER}`,
                    background: 'transparent',
                    color: lang === key ? ACCENT : MUTED,
                    cursor: 'pointer', fontFamily: FONT,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '56px 24px 64px', background: LIGHT }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {step === 'intro' ? introContent : questionsContent}
        </div>
      </main>

      <footer style={{ background: INK, padding: '28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '-0.01em' }}>
            {t.footerLine}
          </span>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            {t.reportLine}
          </p>
        </div>
      </footer>
    </div>
  )
}

// ── Small UI primitives ──────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: INK, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{children}</span>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ flex: '1 1 240px', minWidth: 220, marginBottom: 14 }}>
      <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: INK, marginBottom: 6 }}>
        {label}
      </span>
      {children}
    </label>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>{children}</div>
}

function Input({ type, value, onChange, placeholder }: { type: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required
      style={{
        width: '100%', padding: '11px 14px', fontSize: 15,
        border: `1px solid ${BORDER}`, borderRadius: 8,
        fontFamily: FONT, color: INK, background: '#fff',
        boxSizing: 'border-box',
      }}
    />
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { id: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      required
      style={{
        width: '100%', padding: '11px 14px', fontSize: 15,
        border: `1px solid ${BORDER}`, borderRadius: 8,
        fontFamily: FONT, color: value ? INK : MUTED, background: '#fff',
        boxSizing: 'border-box', appearance: 'none',
      }}
    >
      <option value="">Kies...</option>
      {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  )
}

// ── Question card ────────────────────────────────────────────────────────────
type QCardProps = {
  q:               Question
  index:           number
  answer:          string | string[] | undefined
  onToggleMulti:   (qId: string, optId: string) => void
  onSetSingle:     (qId: string, optId: string) => void
  onSetMatrix:     (qId: string, rowIndex: number, optId: string, totalRows: number) => void
  onSetOtherDetail:(qId: string, value: string) => void
  getOtherDetail:  (qId: string) => string
  otherLabel:      string
}

function QuestionCard({ q, index, answer, onToggleMulti, onSetSingle, onSetMatrix, onSetOtherDetail, getOtherDetail, otherLabel }: QCardProps) {
  const isMulti  = q.type === 'multiselect'
  const isMatrix = q.type === 'matrix'
  const arr      = Array.isArray(answer) ? answer : []
  const isSelectedMulti = (id: string) => arr.includes(id)
  const isSelectedSingle = (id: string) => answer === id

  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: ACCENT, letterSpacing: '0.06em' }}>
          Q{index}
        </span>
        <span style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {q.dimension}
        </span>
      </div>

      <p style={{ fontSize: 16, fontWeight: 700, color: INK, marginBottom: q.hint ? 4 : 12, lineHeight: 1.4 }}>
        {q.text}
      </p>
      {q.hint && (
        <p style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>{q.hint}</p>
      )}

      {/* Matrix: per-row option pills */}
      {isMatrix && q.rows && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {q.rows.map((row, rowIdx) => {
            const selectedId = arr[rowIdx]
            return (
              <div key={row.id}>
                <p style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 6 }}>
                  {row.label}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {q.options.map(opt => {
                    const selected = selectedId === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onSetMatrix(q.id, rowIdx, opt.id, q.rows!.length)}
                        style={{
                          padding: '8px 14px', borderRadius: 100, fontSize: 13,
                          border: `1.5px solid ${selected ? ACCENT : BORDER}`,
                          background: selected ? `${ACCENT}0d` : '#fff',
                          color: selected ? ACCENT : INK,
                          fontWeight: selected ? 700 : 500,
                          cursor: 'pointer', fontFamily: FONT,
                          transition: 'border-color 0.12s, background 0.12s',
                        }}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Standard single/multi: flat option list */}
      {!isMatrix && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {q.options.map(opt => {
          const selected = isMulti ? isSelectedMulti(opt.id) : isSelectedSingle(opt.id)
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => isMulti ? onToggleMulti(q.id, opt.id) : onSetSingle(q.id, opt.id)}
              style={{
                textAlign: 'left', padding: '10px 14px', borderRadius: 8,
                border: `1.5px solid ${selected ? ACCENT : BORDER}`,
                background: selected ? `${ACCENT}0d` : '#fff',
                cursor: 'pointer', fontFamily: FONT,
                fontSize: 14, color: INK, fontWeight: selected ? 600 : 500,
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'border-color 0.12s, background 0.12s',
              }}
            >
              <span style={{
                width: isMulti ? 16 : 14, height: isMulti ? 16 : 14,
                borderRadius: isMulti ? 4 : 100,
                border: `2px solid ${selected ? ACCENT : BORDER}`,
                background: selected ? ACCENT : '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {selected && (
                  <span style={{ color: '#fff', fontSize: 10, lineHeight: 1, fontWeight: 800 }}>✓</span>
                )}
              </span>
              <span>{opt.label}</span>
            </button>
          )
        })}

        {isMulti && q.hasOther && (
          <input
            type="text"
            value={getOtherDetail(q.id)}
            onChange={e => onSetOtherDetail(q.id, e.target.value)}
            placeholder={otherLabel}
            style={{
              padding: '10px 14px', fontSize: 14, marginTop: 4,
              border: `1px dashed ${BORDER}`, borderRadius: 8,
              fontFamily: FONT, color: INK, background: LIGHT,
              boxSizing: 'border-box',
            }}
          />
        )}
      </div>
      )}
    </div>
  )
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function AiBenchmarkStartPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${ACCENT}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <StartInner />
    </Suspense>
  )
}
