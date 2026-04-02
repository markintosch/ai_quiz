'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  buildLap,
  getSector,
  scoreSector,
  formatLapTime,
  computeLapMs,
  TIME_PER_Q_MS,
  type LapQuestion,
  type SectorResult,
} from '@/products/hot_lap/data'

// ── Brand tokens ───────────────────────────────────────────────────────────────
const BLACK  = '#0D0D0D'
const DARK   = '#111118'
const CARD   = '#1A1A26'
const BORDER = '#2A2A3A'
const RED    = '#E10600'
const WHITE  = '#FFFFFF'
const MUTED  = '#888899'
const BODY   = '#C0C0D0'
const AMBER  = '#FFD700'
const PURPLE = '#9B00FF'
const GREEN  = '#00C853'

type Phase = 'countdown' | 'racing' | 'feedback' | 'done'

// ── Countdown before the lap starts ───────────────────────────────────────────
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
      minHeight: '100vh', background: BLACK,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: MUTED, letterSpacing: '0.15em', marginBottom: 32 }}>
        LIGHTS OUT IN…
      </div>
      <div style={{
        fontSize: 'clamp(100px, 20vw, 180px)',
        fontWeight: 900,
        fontStyle: 'italic',
        color: isGo ? GREEN : RED,
        letterSpacing: '-0.05em',
        lineHeight: 1,
        transition: 'color 0.15s',
      }}>
        {count}
      </div>
      <div style={{ marginTop: 32, fontSize: 13, color: MUTED }}>Get ready — the clock starts now</div>
    </div>
  )
}

// ── Feedback overlay after answering ──────────────────────────────────────────
function FeedbackOverlay({
  correct, timedOut, timeTaken, penalty, correctLabel
}: {
  correct: boolean; timedOut: boolean; timeTaken: number; penalty: number; correctLabel: string
}) {
  const icon    = timedOut ? '⏱' : correct ? '✓' : '✗'
  const colour  = timedOut ? AMBER : correct ? GREEN : RED
  const message = timedOut
    ? `Time's up! +${penalty / 1000}s penalty`
    : correct
    ? `Correct! ${(timeTaken / 1000).toFixed(1)}s`
    : `Wrong — +${penalty / 1000}s penalty`

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        background: CARD, border: `2px solid ${colour}`,
        borderRadius: 20, padding: '40px 56px', textAlign: 'center',
        maxWidth: 360,
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{icon}</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: colour, marginBottom: 10 }}>{message}</div>
        {!correct && !timedOut && (
          <div style={{ fontSize: 13, color: MUTED, marginTop: 8 }}>
            Correct: <span style={{ color: WHITE, fontWeight: 700 }}>{correctLabel}</span>
          </div>
        )}
        {timedOut && (
          <div style={{ fontSize: 13, color: MUTED, marginTop: 8 }}>
            Correct: <span style={{ color: WHITE, fontWeight: 700 }}>{correctLabel}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main play page ─────────────────────────────────────────────────────────────
export default function HotLapPlayPage() {
  const router = useRouter()

  const [questions]   = useState<LapQuestion[]>(() => buildLap())
  const [phase, setPhase]   = useState<Phase>('countdown')
  const [qIndex, setQIndex] = useState(0)
  const [sectors, setSectors] = useState<SectorResult[]>([])

  // Timer state
  const [msLeft, setMsLeft]    = useState(TIME_PER_Q_MS)
  const startTimeRef           = useRef<number>(0)
  const timerRef               = useRef<ReturnType<typeof setInterval> | null>(null)

  // Feedback state
  const [feedbackData, setFeedbackData] = useState<{
    correct: boolean; timedOut: boolean; timeTaken: number; penalty: number; correctLabel: string
  } | null>(null)

  const currentQ = questions[qIndex]
  const sector   = currentQ ? getSector(qIndex) : 1

  // ── start timer for current question ──
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now()
    setMsLeft(TIME_PER_Q_MS)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const left    = Math.max(0, TIME_PER_Q_MS - elapsed)
      setMsLeft(left)
    }, 50)
  }, [])

  // ── handle answer (or timeout) ──
  const handleAnswer = useCallback((answer: string | null, timedOut = false) => {
    if (phase !== 'racing') return
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }

    const elapsed   = Date.now() - startTimeRef.current
    const timeMsRaw = Math.min(elapsed, TIME_PER_Q_MS)
    const q         = questions[qIndex]
    const correct   = !timedOut && answer === q.correct
    const penalty   = (!correct || timedOut) ? 5000 : 0
    const timeMsTotal = scoreSector(timeMsRaw, correct, timedOut)

    const result: SectorResult = {
      questionId: q.id,
      timeMsRaw,
      timeMsTotal,
      correct,
      timedOut,
      answer,
    }

    const newSectors = [...sectors, result]
    setSectors(newSectors)

    const correctLabel = q.options.find(o => o.value === q.correct)?.label ?? ''
    setFeedbackData({ correct, timedOut, timeTaken: timeMsRaw, penalty, correctLabel })
    setPhase('feedback')

    // Show feedback for 1.2s then advance
    setTimeout(() => {
      setFeedbackData(null)
      if (qIndex + 1 >= questions.length) {
        // Lap done — encode and redirect
        const totalMs = computeLapMs(newSectors)
        const lapTime = formatLapTime(totalMs)
        const payload = { sectors: newSectors, totalMs, lapTime }
        const encoded = btoa(JSON.stringify(payload))
        router.push(`/hot_lap/results?d=${encoded}`)
      } else {
        setQIndex(qi => qi + 1)
        setPhase('racing')
      }
    }, 1200)
  }, [phase, qIndex, questions, sectors, router])

  // ── timeout handler ──
  useEffect(() => {
    if (phase === 'racing' && msLeft === 0) {
      handleAnswer(null, true)
    }
  }, [msLeft, phase, handleAnswer])

  // ── start timer when phase becomes racing ──
  useEffect(() => {
    if (phase === 'racing') {
      startTimer()
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase, qIndex, startTimer])

  // ── sector summary for display ──
  const s1ms = sectors.slice(0, 3).reduce((s, r) => s + r.timeMsTotal, 0)
  const s2ms = sectors.slice(3, 7).reduce((s, r) => s + r.timeMsTotal, 0)
  const s3ms = sectors.slice(7, 10).reduce((s, r) => s + r.timeMsTotal, 0)

  const sectorColor = (ms: number) => ms === 0 ? MUTED : ms < TIME_PER_Q_MS * (sector === 1 ? 3 : sector === 2 ? 4 : 3) * 0.5 ? GREEN : AMBER

  const progressPct = (msLeft / TIME_PER_Q_MS) * 100
  const timerColor  = msLeft > 10000 ? GREEN : msLeft > 5000 ? AMBER : RED

  if (phase === 'countdown') {
    return <CountdownScreen onGo={() => setPhase('racing')} />
  }

  return (
    <div style={{
      minHeight: '100vh', background: BLACK,
      fontFamily: 'Inter, system-ui, sans-serif', color: WHITE,
    }}>
      {/* Feedback overlay */}
      {feedbackData && <FeedbackOverlay {...feedbackData} />}

      {/* Top status bar */}
      <div style={{
        background: DARK, borderBottom: `1px solid ${BORDER}`,
        padding: '0 20px',
      }}>
        <div style={{
          maxWidth: 720, margin: '0 auto',
          height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: RED, fontStyle: 'italic', letterSpacing: '0.05em' }}>
            🏁 HOT LAP
          </span>

          {/* Sector indicators */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {[1, 2, 3].map(s => {
              const isActive = s === sector
              const isDone   = s < sector
              const ms       = s === 1 ? s1ms : s === 2 ? s2ms : s3ms
              return (
                <div key={s} style={{
                  padding: '3px 10px', borderRadius: 6,
                  background: isActive ? RED : isDone ? '#1A2A1A' : CARD,
                  border: `1px solid ${isActive ? RED : isDone ? '#2A4A2A' : BORDER}`,
                  fontSize: 11, fontWeight: 800,
                  color: isActive ? WHITE : isDone ? GREEN : MUTED,
                  fontFamily: 'monospace',
                }}>
                  S{s}{isDone && ms > 0 ? ` ${formatLapTime(ms)}` : ''}
                </div>
              )
            })}
          </div>

          {/* Q counter */}
          <span style={{ fontSize: 12, color: MUTED, fontWeight: 700 }}>
            Q{qIndex + 1}<span style={{ color: BORDER }}>/10</span>
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div style={{ height: 4, background: BORDER, position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${progressPct}%`,
          background: timerColor,
          transition: 'width 0.05s linear, background 0.3s',
        }} />
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Timer display */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontSize: 56, fontWeight: 900, fontFamily: 'monospace',
            color: timerColor, letterSpacing: '-0.03em', lineHeight: 1,
            transition: 'color 0.3s',
          }}>
            {(msLeft / 1000).toFixed(1)}
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 6, letterSpacing: '0.12em' }}>SECONDS REMAINING</div>
        </div>

        {/* Difficulty badge */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{
            display: 'inline-block',
            padding: '3px 12px', borderRadius: 100,
            fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
            background: currentQ.difficulty === 'easy' ? '#9B00FF22' : currentQ.difficulty === 'medium' ? '#FFD70022' : '#E1060022',
            color: currentQ.difficulty === 'easy' ? PURPLE : currentQ.difficulty === 'medium' ? AMBER : RED,
            border: `1px solid ${currentQ.difficulty === 'easy' ? PURPLE + '44' : currentQ.difficulty === 'medium' ? AMBER + '44' : RED + '44'}`,
          }}>
            Sector {sector} · {currentQ.difficulty}
          </span>
        </div>

        {/* Question */}
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`,
          borderRadius: 16, padding: '28px 28px 24px',
          marginBottom: 20,
        }}>
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 700,
            color: WHITE, lineHeight: 1.5, margin: 0,
          }}>
            {currentQ.text}
          </p>
        </div>

        {/* Answer options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {currentQ.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => phase === 'racing' && handleAnswer(opt.value)}
              disabled={phase !== 'racing'}
              style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: '16px 18px',
                cursor: phase === 'racing' ? 'pointer' : 'default',
                textAlign: 'left',
                transition: 'border-color 0.15s, background 0.15s',
                outline: 'none',
              }}
              onMouseEnter={e => {
                if (phase === 'racing') {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = RED
                  ;(e.currentTarget as HTMLButtonElement).style.background = '#2A1A1A'
                }
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = BORDER
                ;(e.currentTarget as HTMLButtonElement).style.background = CARD
              }}
            >
              <span style={{
                display: 'inline-block', width: 24, height: 24,
                borderRadius: 6, background: BORDER,
                fontSize: 11, fontWeight: 800, color: MUTED,
                textAlign: 'center', lineHeight: '24px',
                marginRight: 12, flexShrink: 0,
              }}>
                {opt.value.toUpperCase()}
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, color: WHITE }}>{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Lap progress */}
        <div style={{ marginTop: 32, display: 'flex', gap: 4 }}>
          {questions.map((_, i) => {
            const done     = i < sectors.length
            const active   = i === qIndex
            const correct  = done ? sectors[i].correct : false
            const color    = active ? RED : done ? (correct ? GREEN : '#CC2222') : BORDER
            return (
              <div key={i} style={{
                flex: 1, height: 4, borderRadius: 2, background: color,
                transition: 'background 0.3s',
              }} />
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 10, color: MUTED }}>S1</span>
          <span style={{ fontSize: 10, color: MUTED, marginLeft: '30%' }}>S2</span>
          <span style={{ fontSize: 10, color: MUTED }}>S3</span>
        </div>
      </div>
    </div>
  )
}
