'use client'

import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QUESTIONS, DIMENSIONS } from '@/products/sysdig_scan/data'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const DARK   = '#0B0F1A'
const NAVY   = '#111827'
const CARD   = '#161D2E'
const BORDER = '#1E2D40'
const TEAL   = '#00C58E'
const WHITE  = '#FFFFFF'
const MUTED  = '#8B9EB0'
const BODY   = '#C8D6E5'
const ERROR  = '#EF4444'

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = 'gate' | 'questions'

interface Gate {
  name:  string
  email: string
}

// ── Main component ────────────────────────────────────────────────────────────
function AssessInner() {
  const router = useRouter()

  const [step, setStep]       = useState<Step>('gate')
  const [gate, setGate]       = useState<Gate>({ name: '', email: '' })
  const [gateError, setGateError]   = useState('')
  const [qIndex, setQIndex]         = useState(0)
  const [answers, setAnswers]       = useState<Record<string, number>>({})
  const [selected, setSelected]     = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const totalQ    = QUESTIONS.length
  const currentQ  = QUESTIONS[qIndex]
  const currentDim = DIMENSIONS.find(d => d.id === currentQ?.dimension)
  const dimProgress = QUESTIONS.slice(0, qIndex).filter(q => q.dimension === currentQ?.dimension).length
  const dimTotal    = QUESTIONS.filter(q => q.dimension === currentQ?.dimension).length

  // ── Gate submit ──────────────────────────────────────────────────────────
  function handleGateSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!gate.name.trim()) { setGateError('Please enter your name.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gate.email)) { setGateError('Please enter a valid email address.'); return }
    setGateError('')
    setStep('questions')
  }

  // ── Answer selection ─────────────────────────────────────────────────────
  function handleAnswer(score: number) { setSelected(score) }

  function handleNext() {
    if (selected === null) return
    const newAnswers = { ...answers, [currentQ.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    if (qIndex + 1 < totalQ) {
      setQIndex(qIndex + 1)
    } else {
      handleSubmit(newAnswers)
    }
  }

  // ── Final submit ──────────────────────────────────────────────────────────
  async function handleSubmit(finalAnswers: Record<string, number>) {
    setSubmitting(true)
    try {
      await fetch('/api/sysdig_scan/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: gate.name, email: gate.email, answers: finalAnswers }),
      })
    } catch {
      // fire-and-forget
    }
    const encoded = btoa(JSON.stringify(finalAnswers))
    router.push(
      `/sysdig_scan/results?d=${encoded}&name=${encodeURIComponent(gate.name)}&email=${encodeURIComponent(gate.email)}`
    )
  }

  // ── Gate screen ───────────────────────────────────────────────────────────
  if (step === 'gate') {
    return (
      <div style={{ minHeight: '100vh', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, justifyContent: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: DARK }}>S</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: WHITE }}>Sysdig</span>
            <span style={{ fontSize: 13, color: MUTED, marginLeft: 4 }}>· 555 Assessment</span>
          </div>

          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '40px 36px' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: WHITE, marginBottom: 8, letterSpacing: '-0.02em' }}>
              Start your assessment
            </h1>
            <p style={{ fontSize: 14, color: BODY, marginBottom: 32, lineHeight: 1.6 }}>
              20 questions · 5 minutes · Instant personalised results.
            </p>

            <form onSubmit={handleGateSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: BODY, marginBottom: 6 }}>Full name</label>
                <input
                  type="text"
                  value={gate.name}
                  onChange={e => setGate(g => ({ ...g, name: e.target.value }))}
                  placeholder="Jane Smith"
                  style={{ width: '100%', boxSizing: 'border-box', background: NAVY, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '12px 14px', fontSize: 15, color: WHITE, outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: BODY, marginBottom: 6 }}>Work email</label>
                <input
                  type="email"
                  value={gate.email}
                  onChange={e => setGate(g => ({ ...g, email: e.target.value }))}
                  placeholder="jane@company.com"
                  style={{ width: '100%', boxSizing: 'border-box', background: NAVY, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '12px 14px', fontSize: 15, color: WHITE, outline: 'none' }}
                />
              </div>

              {gateError && <p style={{ fontSize: 13, color: ERROR, marginBottom: 16 }}>{gateError}</p>}

              <button
                type="submit"
                style={{ width: '100%', background: TEAL, color: DARK, fontSize: 15, fontWeight: 800, padding: '14px', borderRadius: 10, border: 'none', cursor: 'pointer' }}
              >
                Start assessment →
              </button>

              <p style={{ fontSize: 11, color: MUTED, textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
                Your results and optional follow-up are waiting at the end.
              </p>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── Submitting ────────────────────────────────────────────────────────────
  if (submitting) {
    return (
      <div style={{ minHeight: '100vh', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
          <p style={{ color: BODY, fontSize: 16 }}>Calculating your 555 Readiness Score…</p>
        </div>
      </div>
    )
  }

  // ── Questions screen ──────────────────────────────────────────────────────
  const progress = Math.round((qIndex / totalQ) * 100)

  return (
    <div style={{ minHeight: '100vh', background: DARK, fontFamily: 'Inter, system-ui, sans-serif', color: WHITE }}>
      {/* Progress bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: DARK, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ height: 3, background: BORDER }}>
          <div style={{ height: '100%', background: TEAL, width: `${progress}%`, transition: 'width 0.3s ease' }} />
        </div>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: DARK }}>S</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: MUTED }}>
              {currentDim?.label} · {dimProgress + 1}/{dimTotal}
            </span>
          </div>
          <span style={{ fontSize: 13, color: MUTED }}>{qIndex + 1} / {totalQ}</span>
        </div>
      </div>

      {/* Question */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${TEAL}15`, border: `1px solid ${TEAL}30`, borderRadius: 100, padding: '5px 14px', marginBottom: 28 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{currentDim?.label}</span>
        </div>

        <h2 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 800, color: WHITE, lineHeight: 1.4, marginBottom: 32, letterSpacing: '-0.01em' }}>
          {currentQ.text}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {currentQ.options.map(opt => {
            const isSelected = selected === opt.score
            return (
              <button
                key={opt.score}
                onClick={() => handleAnswer(opt.score)}
                style={{
                  background: isSelected ? `${TEAL}18` : CARD,
                  border: `2px solid ${isSelected ? TEAL : BORDER}`,
                  borderRadius: 12, padding: '16px 20px',
                  textAlign: 'left', cursor: 'pointer', color: WHITE,
                  fontSize: 15, lineHeight: 1.5, transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${isSelected ? TEAL : BORDER}`,
                  background: isSelected ? TEAL : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSelected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: DARK, display: 'block' }} />}
                </div>
                <span style={{ color: isSelected ? WHITE : BODY }}>{opt.label}</span>
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: 32 }}>
          <button
            onClick={handleNext}
            disabled={selected === null}
            style={{
              background: selected !== null ? TEAL : BORDER,
              color: selected !== null ? DARK : MUTED,
              fontSize: 15, fontWeight: 800, padding: '14px 36px',
              borderRadius: 10, border: 'none',
              cursor: selected !== null ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
            }}
          >
            {qIndex + 1 === totalQ ? 'See my results →' : 'Next question →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AssessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0B0F1A' }} />}>
      <AssessInner />
    </Suspense>
  )
}
