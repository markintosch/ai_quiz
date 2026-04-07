'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  formatTime,
  getTier,
  getPhase,
  PHASE_LABELS,
  PENALTY_MS,
  type QuestionResult,
} from '@/products/sysdig_555/data'

// ── Brand tokens ───────────────────────────────────────────────────────────────
const DARK   = '#0B0F1A'
const CARD   = '#161D2E'
const BORDER = '#1E2D40'
const TEAL   = '#00C58E'
const RED    = '#EF4444'
const AMBER  = '#F59E0B'
const WHITE  = '#FFFFFF'
const MUTED  = '#8B9EB0'
const BODY   = '#C8D6E5'
const BLUE   = '#3B82F6'

interface GamePayload {
  questions: QuestionResult[]
  totalMs:   number
  timeStr:   string
}

function phaseMs(questions: QuestionResult[], from: number, to: number) {
  return questions.slice(from, to).reduce((s, q) => s + q.timeMsTotal, 0)
}

// ── Inner component (needs useSearchParams) ────────────────────────────────────
function ResultsInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [run,    setRun]    = useState<GamePayload | null>(null)
  const [name,   setName]   = useState('')
  const [email,  setEmail]  = useState('')
  const [step,   setStep]   = useState<'form' | 'submitting' | 'done'>('form')
  const [rank,   setRank]   = useState<number | null>(null)
  const [topTime, setTopTime] = useState<number | null>(null)
  const [error,  setError]  = useState('')

  useEffect(() => {
    const d = searchParams.get('d')
    if (!d) { router.replace('/sysdig_555'); return }
    try {
      const payload = JSON.parse(atob(d)) as GamePayload
      setRun(payload)
    } catch {
      router.replace('/sysdig_555')
    }
  }, [searchParams, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!run) return
    const n  = name.trim()
    const em = email.trim()
    if (!n)                    { setError('Please enter your name.'); return }
    if (!em || !em.includes('@')) { setError('Please enter a valid email.'); return }

    setStep('submitting')
    setError('')

    try {
      const res  = await fetch('/api/sysdig_555/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: n, email: em,
          totalMs: run.totalMs, timeStr: run.timeStr,
          questions: run.questions,
        }),
      })
      const json = await res.json()
      if (json.rank)    setRank(json.rank)
      if (json.topTime) setTopTime(json.topTime)
      setStep('done')
    } catch {
      setError('Something went wrong. Your time was still recorded.')
      setStep('done')
    }
  }

  if (!run) {
    return (
      <div style={{ minHeight: '100vh', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: MUTED }}>Loading…</p>
      </div>
    )
  }

  const { questions, totalMs, timeStr } = run
  const tier         = getTier(totalMs)
  const correctCount = questions.filter(q => q.correct).length
  const penalties    = questions.filter(q => !q.correct || q.timedOut).length
  const accuracy     = Math.round((correctCount / questions.length) * 100)

  const p1Ms = phaseMs(questions, 0, 3)
  const p2Ms = phaseMs(questions, 3, 7)
  const p3Ms = phaseMs(questions, 7, 10)

  const isTopTime = topTime !== null && totalMs <= topTime

  function phaseColour(ms: number): string {
    if (ms < 20_000) return TEAL
    if (ms < 45_000) return BLUE
    if (ms < 70_000) return AMBER
    return RED
  }

  return (
    <div style={{
      minHeight: '100vh', background: DARK,
      fontFamily: 'Inter, system-ui, sans-serif', color: WHITE,
    }}>

      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '0 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/sysdig_555" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: DARK }}>S</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: MUTED }}>555 Time Trial</span>
          </Link>
          <span style={{ fontSize: 12, fontWeight: 700, color: TEAL, letterSpacing: '0.08em' }}>✓ RUN COMPLETE</span>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Big time */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: MUTED, letterSpacing: '0.15em', marginBottom: 12 }}>
            YOUR RESPONSE TIME
          </div>
          <div style={{
            fontSize: 'clamp(56px, 10vw, 96px)',
            fontWeight: 900, fontFamily: 'monospace',
            letterSpacing: '-0.03em', lineHeight: 1,
            color: tier.colour,
          }}>
            {timeStr}
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            marginTop: 16, padding: '8px 20px',
            background: `${tier.colour}18`, border: `1px solid ${tier.colour}40`,
            borderRadius: 100,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: tier.colour }} />
            <span style={{ fontSize: 14, fontWeight: 800, color: tier.colour }}>{tier.label}</span>
          </div>
          {isTopTime && (
            <div style={{ fontSize: 14, color: TEAL, fontWeight: 800, marginTop: 12 }}>
              🏆 New leaderboard record!
            </div>
          )}
        </div>

        {/* Phase breakdown */}
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`,
          borderRadius: 16, overflow: 'hidden', marginBottom: 28,
        }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${TEAL}, ${BLUE}, ${AMBER})` }} />
          <div style={{ padding: '20px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, margin: '0 0 16px' }}>
              Phase breakdown
            </p>
            <div style={{ display: 'flex', gap: 1 }}>
              {[
                { label: 'PHASE 1', qs: 'Q1–Q3', level: 'Fundamentals', ms: p1Ms },
                { label: 'PHASE 2', qs: 'Q4–Q7', level: 'Analyst',      ms: p2Ms },
                { label: 'PHASE 3', qs: 'Q8–Q10', level: 'Expert',      ms: p3Ms },
              ].map((p, i) => (
                <div key={p.label} style={{
                  flex: 1, background: DARK,
                  borderRadius: i === 0 ? '8px 0 0 8px' : i === 2 ? '0 8px 8px 0' : 0,
                  padding: '14px 12px',
                  borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: '0.08em', marginBottom: 4 }}>{p.label}</div>
                  <div style={{ fontSize: 10, color: MUTED, marginBottom: 8 }}>{p.qs} · {p.level}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: phaseColour(p.ms), fontFamily: 'monospace' }}>
                    {formatTime(p.ms)}
                  </div>
                </div>
              ))}
              <div style={{ width: 1, background: BORDER }} />
              <div style={{ background: DARK, borderRadius: '0 8px 8px 0', padding: '14px 12px', minWidth: 90 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: '0.08em', marginBottom: 4 }}>TOTAL</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: tier.colour, fontFamily: 'monospace' }}>
                  {timeStr}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Correct',   value: `${correctCount}/10`, color: correctCount >= 8 ? TEAL : correctCount >= 5 ? AMBER : RED },
            { label: 'Penalties', value: penalties > 0 ? `${penalties}× +10s` : 'None',     color: penalties > 0 ? RED : TEAL },
            { label: 'Accuracy',  value: `${accuracy}%`,       color: accuracy >= 80 ? TEAL : accuracy >= 50 ? AMBER : RED },
          ].map(stat => (
            <div key={stat.label} style={{
              background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: 12, padding: '16px 12px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: stat.color, marginBottom: 4, fontFamily: 'monospace' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: MUTED }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Q-by-Q breakdown */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px', marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, margin: '0 0 14px' }}>
            Question by question
          </p>
          {questions.map((q, i) => {
            const phase = getPhase(i)
            const phaseLabel = PHASE_LABELS[phase].split(' — ')[0]
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '8px 0', borderBottom: i < questions.length - 1 ? `1px solid ${BORDER}` : 'none',
              }}>
                <span style={{ width: 20, fontSize: 12, fontWeight: 700, color: MUTED, textAlign: 'right', flexShrink: 0 }}>
                  Q{i + 1}
                </span>
                <span style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                  background: q.correct ? TEAL + '22' : RED + '22',
                  border: `1px solid ${q.correct ? TEAL + '44' : RED + '44'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: q.correct ? TEAL : RED, fontWeight: 900,
                }}>
                  {q.timedOut ? '⏱' : q.correct ? '✓' : '✗'}
                </span>
                <span style={{ fontSize: 11, color: MUTED, flexShrink: 0 }}>{phaseLabel}</span>
                <span style={{ flex: 1, fontSize: 12, color: BODY }}>
                  {q.correct ? 'Correct' : q.timedOut ? 'Timed out' : 'Wrong answer'}
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, color: q.correct ? TEAL : RED, fontFamily: 'monospace' }}>
                  {formatTime(q.timeMsTotal)}
                </span>
                {!q.correct && (
                  <span style={{ fontSize: 10, color: RED }}>+{PENALTY_MS / 1000}s</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Rank submission */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${TEAL}, ${BLUE})` }} />
          <div style={{ padding: '24px' }}>
            {step === 'done' ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: WHITE, marginBottom: 8 }}>
                  Time saved!
                </h3>
                {rank && (
                  <p style={{ fontSize: 16, color: BODY, marginBottom: 4 }}>
                    You're <span style={{ color: rank <= 3 ? TEAL : AMBER, fontWeight: 900 }}>#{rank}</span> on the leaderboard.
                  </p>
                )}
                {rank === 1 && <p style={{ color: TEAL, fontWeight: 800 }}>🏆 New leaderboard record!</p>}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
                  <Link href="/sysdig_555/play" style={{
                    background: TEAL, color: DARK,
                    fontSize: 15, fontWeight: 900,
                    padding: '14px 32px', borderRadius: 10, textDecoration: 'none',
                  }}>
                    Run again →
                  </Link>
                  <Link href="/sysdig_555" style={{
                    background: CARD, color: WHITE, border: `1px solid ${BORDER}`,
                    fontSize: 14, fontWeight: 700,
                    padding: '14px 24px', borderRadius: 10, textDecoration: 'none',
                  }}>
                    Leaderboard
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: WHITE, marginBottom: 6 }}>
                  📊 Post your time to the leaderboard
                </h3>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>
                  Enter your details to claim your spot on the 555 Time Trial board.
                </p>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input
                      value={name}
                      onChange={e => { setName(e.target.value); setError('') }}
                      placeholder="Your name or alias"
                      maxLength={30}
                      style={{
                        background: DARK, border: `1px solid ${BORDER}`,
                        borderRadius: 8, padding: '12px 16px',
                        fontSize: 15, fontWeight: 700, color: WHITE, outline: 'none',
                        fontFamily: 'Inter, system-ui, sans-serif',
                      }}
                    />
                    <input
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
                      placeholder="Email (not shown publicly)"
                      type="email"
                      style={{
                        background: DARK, border: `1px solid ${BORDER}`,
                        borderRadius: 8, padding: '12px 16px',
                        fontSize: 14, color: WHITE, outline: 'none',
                        fontFamily: 'Inter, system-ui, sans-serif',
                      }}
                    />
                    {error && <p style={{ fontSize: 13, color: RED, margin: 0 }}>{error}</p>}
                    <button
                      type="submit"
                      disabled={step === 'submitting'}
                      style={{
                        background: TEAL, color: DARK,
                        fontSize: 15, fontWeight: 900,
                        padding: '14px', borderRadius: 10, border: 'none',
                        cursor: step === 'submitting' ? 'default' : 'pointer',
                        opacity: step === 'submitting' ? 0.7 : 1,
                      }}
                    >
                      {step === 'submitting' ? 'Saving…' : 'Post my time →'}
                    </button>
                  </div>
                </form>
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Link href="/sysdig_555/play" style={{
                    fontSize: 13, color: MUTED, textDecoration: 'underline', textDecorationColor: BORDER,
                  }}>
                    Skip — run again without saving
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Sysdig555ResultsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0B0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#8B9EB0' }}>Loading results…</p>
      </div>
    }>
      <ResultsInner />
    </Suspense>
  )
}
