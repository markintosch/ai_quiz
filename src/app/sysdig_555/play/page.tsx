'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  buildGame,
  getPhase,
  scoreQuestion,
  formatTime,
  computeTotalMs,
  TIME_PER_Q_MS,
  type GameQuestion,
  type QuestionResult,
} from '@/products/sysdig_555/data'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const DARK   = '#0B0F1A'
const CARD   = '#161D2E'
const BORDER = '#1E2D40'
const TEAL   = '#00C58E'
const RED    = '#EF4444'
const AMBER  = '#F59E0B'
const WHITE  = '#FFFFFF'
const MUTED  = '#8B9EB0'
const BODY   = '#C8D6E5'
const GREEN  = '#00C58E'

type Phase = 'countdown' | 'playing' | 'feedback' | 'done'

// ── Countdown ─────────────────────────────────────────────────────────────────
function CountdownScreen({ onGo }: { onGo: () => void }) {
  const [count, setCount] = useState<number | 'GO'>(3)

  useEffect(() => {
    const sequence = [3, 2, 1, 'GO' as const]
    let i = 0
    const tick = () => {
      i++
      if (i < sequence.length) {
        setCount(sequence[i])
        setTimeout(tick, i === sequence.length - 1 ? 600 : 800)
      } else {
        onGo()
      }
    }
    const t = setTimeout(tick, 800)
    return () => clearTimeout(t)
  }, [onGo])

  const isGo = count === 'GO'
  return (
    <div style={{
      minHeight: '100vh', background: DARK,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: MUTED, letterSpacing: '0.15em', marginBottom: 24 }}>
        INCIDENT INCOMING…
      </div>
      <div style={{
        fontSize: 'clamp(100px, 20vw, 180px)',
        fontWeight: 900,
        color: isGo ? GREEN : RED,
        letterSpacing: '-0.05em',
        lineHeight: 1,
        transition: 'color 0.15s',
      }}>
        {count}
      </div>
      <div style={{ marginTop: 24, fontSize: 13, color: MUTED }}>Respond fast — every second counts</div>
    </div>
  )
}

// ── Feedback overlay ──────────────────────────────────────────────────────────
function FeedbackOverlay({
  correct, timedOut, timeTaken, penalty, correctLabel, explanation, onNext,
}: {
  correct: boolean
  timedOut: boolean
  timeTaken: number
  penalty: number
  correctLabel: string
  explanation: string
  onNext: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onNext, 2200)
    return () => clearTimeout(t)
  }, [onNext])

  const colour = correct ? TEAL : RED
  const icon   = timedOut ? '⏱' : correct ? '✓' : '✗'
  const label  = timedOut ? 'Alert missed — timed out' : correct ? 'Threat detected' : 'Wrong — missed it'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: `${colour}18`,
      backdropFilter: 'blur(4px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: CARD, border: `2px solid ${colour}60`,
        borderRadius: 20, padding: '36px 32px',
        maxWidth: 520, width: '100%', textAlign: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{ fontSize: 56, fontWeight: 900, color: colour, marginBottom: 8 }}>{icon}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: colour, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 14, color: MUTED, marginBottom: 20 }}>
          {(timeTaken / 1000).toFixed(2)}s
          {penalty > 0 && <span style={{ color: RED }}> +{penalty / 1000}s penalty</span>}
        </div>
        {!correct && (
          <div style={{ background: DARK, borderRadius: 10, padding: '12px 16px', marginBottom: 16, textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Correct answer</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: TEAL }}>{correctLabel}</div>
          </div>
        )}
        <p style={{ fontSize: 13, color: BODY, lineHeight: 1.6, margin: '0 0 16px', textAlign: 'left' }}>{explanation}</p>
        <div style={{ fontSize: 12, color: MUTED }}>Continuing in a moment…</div>
      </div>
    </div>
  )
}

// ── Main game component ───────────────────────────────────────────────────────
function GameInner() {
  const router = useRouter()

  const [phase,     setPhase]     = useState<Phase>('countdown')
  const [questions, setQuestions] = useState<GameQuestion[]>([])
  const [qIndex,    setQIndex]    = useState(0)
  const [results,   setResults]   = useState<QuestionResult[]>([])
  const [timeLeft,  setTimeLeft]  = useState(TIME_PER_Q_MS)
  const [selected,  setSelected]  = useState<string | null>(null)
  const [showFB,    setShowFB]    = useState(false)
  const [fbData,    setFbData]    = useState<{ correct: boolean; timedOut: boolean; timeMsRaw: number; timeMsTotal: number; correctLabel: string; explanation: string } | null>(null)

  const startRef = useRef<number>(0)
  const tickRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  // Build questions once on mount
  useEffect(() => {
    setQuestions(buildGame())
  }, [])

  const q = questions[qIndex]

  function clearTick() {
    if (tickRef.current) clearInterval(tickRef.current)
  }

  function startTimer() {
    startRef.current = Date.now()
    setTimeLeft(TIME_PER_Q_MS)
    tickRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      const remaining = Math.max(0, TIME_PER_Q_MS - elapsed)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearTick()
        handleAnswer(null, true)
      }
    }, 50)
  }

  const handleGo = useCallback(() => {
    setPhase('playing')
    startTimer()
  }, [questions]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleAnswer(value: string | null, timedOut = false) {
    if (phase !== 'playing') return
    clearTick()

    const timeMsRaw  = Math.min(Date.now() - startRef.current, TIME_PER_Q_MS)
    const correct    = !timedOut && value === q.correct
    const timeMsTotal = scoreQuestion(timeMsRaw, correct, timedOut)

    const result: QuestionResult = {
      questionId: q.id,
      timeMsRaw,
      timeMsTotal,
      correct,
      timedOut,
      answer: value,
    }

    const correctOption = q.options.find(o => o.value === q.correct)

    setSelected(value)
    setFbData({
      correct,
      timedOut,
      timeMsRaw,
      timeMsTotal,
      correctLabel: correctOption?.label ?? '',
      explanation: q.explanation,
    })
    setPhase('feedback')
    setShowFB(true)

    const newResults = [...results, result]
    setResults(newResults)

    if (qIndex + 1 >= questions.length) {
      // Last question — route to results after feedback
      setTimeout(() => {
        const totalMs = computeTotalMs(newResults)
        const payload = { questions: newResults, totalMs, timeStr: formatTime(totalMs) }
        router.push(`/sysdig_555/results?d=${btoa(JSON.stringify(payload))}`)
      }, 2400)
    }
  }

  function nextQuestion() {
    setShowFB(false)
    setSelected(null)
    const next = qIndex + 1
    if (next < questions.length) {
      setQIndex(next)
      setPhase('playing')
      startTimer()
    }
  }

  if (phase === 'countdown' || questions.length === 0) {
    return <CountdownScreen onGo={handleGo} />
  }

  if (!q) return null

  const phaseNum   = getPhase(qIndex)
  const phaseLabel = phaseNum === 1 ? 'Fundamentals' : phaseNum === 2 ? 'Analyst' : 'Expert'
  const pct        = (timeLeft / TIME_PER_Q_MS) * 100
  const timerColour = pct > 50 ? TEAL : pct > 25 ? AMBER : RED

  return (
    <div style={{ minHeight: '100vh', background: DARK, fontFamily: 'Inter, system-ui, sans-serif', color: WHITE }}>
      {showFB && fbData && (
        <FeedbackOverlay
          correct={fbData.correct}
          timedOut={fbData.timedOut}
          timeTaken={fbData.timeMsRaw}
          penalty={fbData.timeMsTotal - Math.min(fbData.timeMsRaw, TIME_PER_Q_MS)}
          correctLabel={fbData.correctLabel}
          explanation={fbData.explanation}
          onNext={nextQuestion}
        />
      )}

      {/* Header */}
      <div style={{ padding: '0 24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 720, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', align: 'center', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: DARK }}>S</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: MUTED }}>555 Time Trial</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: timerColour, fontFamily: 'monospace' }}>
            {(timeLeft / 1000).toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div style={{ height: 3, background: BORDER }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: timerColour,
          transition: 'width 0.05s linear, background 0.3s',
        }} />
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

        {/* Phase + progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <span style={{
              fontSize: 11, fontWeight: 700, color: TEAL,
              background: `${TEAL}18`, border: `1px solid ${TEAL}30`,
              borderRadius: 100, padding: '4px 12px', letterSpacing: '0.05em',
            }}>
              Phase {phaseNum} · {phaseLabel}
            </span>
          </div>
          <span style={{ fontSize: 13, color: MUTED, fontFamily: 'monospace' }}>
            {qIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
          {questions.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i < qIndex
                ? (results[i]?.correct ? TEAL : RED)
                : i === qIndex
                ? WHITE
                : BORDER,
            }} />
          ))}
        </div>

        {/* Question */}
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`,
          borderRadius: 16, padding: '28px 24px', marginBottom: 24,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            {q.topic}
          </div>
          <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 700, color: WHITE, lineHeight: 1.5, margin: 0 }}>
            {q.text}
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {q.options.map(opt => {
            const isSelected = selected === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => phase === 'playing' && handleAnswer(opt.value)}
                disabled={phase !== 'playing'}
                style={{
                  background: isSelected ? `${TEAL}22` : CARD,
                  border: `2px solid ${isSelected ? TEAL : BORDER}`,
                  borderRadius: 12, padding: '16px 18px',
                  fontSize: 14, fontWeight: 600, color: isSelected ? TEAL : BODY,
                  textAlign: 'left', cursor: phase === 'playing' ? 'pointer' : 'default',
                  transition: 'all 0.1s',
                  lineHeight: 1.4,
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 800, color: MUTED, marginRight: 8, textTransform: 'uppercase' }}>
                  {opt.value.toUpperCase()}
                </span>
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Running total */}
        {results.length > 0 && (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: MUTED }}>
              Response time so far:{' '}
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: BODY }}>
                {formatTime(computeTotalMs(results))}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SysdigPlayPage() {
  return <GameInner />
}
