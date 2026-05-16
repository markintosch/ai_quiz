'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  buildLap,
  getSector,
  scoreSector,
  formatLapTime,
  computeLapMs,
  TIME_PER_Q_MS,
  PENALTY_MS,
  QUESTIONS_PER_LAP,
  QUESTIONS_PER_SECTOR,
  SECTOR_NAMES,
  FREE_ATTEMPTS,
  FREE_STORAGE_KEY,
  type LapQuestion,
  type SectorResult,
} from '@/products/nordschleife/data'

// ── Brand tokens ───────────────────────────────────────────────────────────────
const BG      = '#0B1A0E'
const DARK    = '#0F2113'
const CARD    = '#142318'
const BORDER  = '#1E3320'
const GREEN   = '#45A85F'
const DEEP    = '#2D7A3E'
const RED     = '#C8102E'
const WHITE   = '#FFFFFF'
const MUTED   = '#7A8E7E'
const BODY    = '#C5D5C8'
const GOLD    = '#F5C518'
const PURPLE  = '#B026FF'

type Phase = 'gate' | 'countdown' | 'racing' | 'feedback' | 'done'

// ── Countdown screen ──────────────────────────────────────────────────────────
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
      minHeight: '100vh', background: BG,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: MUTED, letterSpacing: '0.15em', marginBottom: 32 }}>
        ROLLING OUT OF THE PITS…
      </div>
      <div style={{
        fontSize: 'clamp(100px, 20vw, 180px)',
        fontWeight: 900,
        color: isGo ? GREEN : RED,
        letterSpacing: '-0.05em', lineHeight: 1,
        transition: 'color 0.15s',
      }}>
        {count}
      </div>
      <div style={{ marginTop: 32, fontSize: 13, color: MUTED }}>Get ready — the timing loop starts now</div>
    </div>
  )
}

// ── Locked / paywall gate ─────────────────────────────────────────────────────
function GateScreen({ freeUsed, paidLeft }: { freeUsed: number; paidLeft: number }) {
  return (
    <div style={{
      minHeight: '100vh', background: BG, color: WHITE,
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{
        background: CARD, border: `1px solid ${BORDER}`,
        borderRadius: 18, padding: '40px 32px', maxWidth: 440, width: '100%',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>🌲</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 10 }}>
          You&apos;ve used your <span style={{ color: GREEN }}>{FREE_ATTEMPTS}</span> free laps
        </h1>
        <p style={{ fontSize: 14, color: BODY, lineHeight: 1.6, marginBottom: 24 }}>
          {paidLeft > 0
            ? `You still have ${paidLeft} paid lap${paidLeft === 1 ? '' : 's'} on this device — start a new lap to use one.`
            : 'The Eifel is unforgiving. Grab 5 more for €2 and keep chasing the track record.'}
        </p>
        {paidLeft <= 0 && (
          <Link href="/nordschleife/buy" style={{
            display: 'block', background: `linear-gradient(135deg, ${GREEN}, ${DEEP})`, color: WHITE,
            fontSize: 16, fontWeight: 900, padding: '16px', borderRadius: 10, textDecoration: 'none',
            marginBottom: 14,
          }}>
            Get 5 more laps · €2 →
          </Link>
        )}
        <Link href="/nordschleife" style={{
          display: 'block', background: BG, border: `1px solid ${BORDER}`, color: WHITE,
          fontSize: 14, fontWeight: 700, padding: '12px', borderRadius: 10, textDecoration: 'none',
        }}>
          Back to landing
        </Link>
        <p style={{ fontSize: 11, color: MUTED, marginTop: 18 }}>
          {freeUsed}/{FREE_ATTEMPTS} free attempts used on this device.
        </p>
      </div>
    </div>
  )
}

// ── Feedback overlay ──────────────────────────────────────────────────────────
function FeedbackOverlay({
  correct, timedOut, timeTaken, correctLabel,
}: {
  correct: boolean; timedOut: boolean; timeTaken: number; correctLabel: string
}) {
  const icon    = timedOut ? '⏱' : correct ? '✓' : '✗'
  const colour  = timedOut ? GOLD : correct ? GREEN : RED
  const message = timedOut
    ? `Time's up! +${PENALTY_MS / 1000}s penalty`
    : correct
    ? `Correct! ${(timeTaken / 1000).toFixed(1)}s`
    : `Wrong — +${PENALTY_MS / 1000}s penalty`

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        background: CARD, border: `2px solid ${colour}`,
        borderRadius: 20, padding: '40px 56px', textAlign: 'center', maxWidth: 380,
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{icon}</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: colour, marginBottom: 10 }}>{message}</div>
        {(!correct || timedOut) && (
          <div style={{ fontSize: 13, color: MUTED, marginTop: 8 }}>
            Correct: <span style={{ color: WHITE, fontWeight: 700 }}>{correctLabel}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function NordschleifePlayPage() {
  const router = useRouter()

  // ── Attempt gating: read localStorage + paid credits cookie ──
  const [phase, setPhase]   = useState<Phase>('gate')
  const [freeUsed, setFreeUsed] = useState(0)
  const [paidLeft, setPaidLeft] = useState(0)
  const [usedPaidLap, setUsedPaidLap] = useState(false)

  const [questions, setQuestions] = useState<LapQuestion[]>([])
  const [qIndex, setQIndex] = useState(0)
  const [sectors, setSectors] = useState<SectorResult[]>([])

  // Timer state
  const [msLeft, setMsLeft]    = useState(TIME_PER_Q_MS)
  const startTimeRef           = useRef<number>(0)
  const timerRef               = useRef<ReturnType<typeof setInterval> | null>(null)

  // Feedback state
  const [feedbackData, setFeedbackData] = useState<{
    correct: boolean; timedOut: boolean; timeTaken: number; correctLabel: string
  } | null>(null)

  // ── Initial gating check ──
  useEffect(() => {
    let usedFree = 0
    try {
      usedFree = parseInt(localStorage.getItem(FREE_STORAGE_KEY) ?? '0', 10) || 0
    } catch {}
    setFreeUsed(usedFree)

    fetch('/api/nordschleife/credits')
      .then(r => r.json())
      .then(d => {
        const credits = d.credits ?? 0
        setPaidLeft(credits)
        const freeAvailable = Math.max(0, FREE_ATTEMPTS - usedFree)
        if (freeAvailable > 0) {
          // burn a free attempt
          try { localStorage.setItem(FREE_STORAGE_KEY, String(usedFree + 1)) } catch {}
          setFreeUsed(usedFree + 1)
          setUsedPaidLap(false)
          setQuestions(buildLap())
          setPhase('countdown')
        } else if (credits > 0) {
          // burn a paid attempt
          fetch('/api/nordschleife/credits', { method: 'POST' })
            .then(r => r.json())
            .then(d => {
              setPaidLeft(d.credits ?? 0)
              setUsedPaidLap(true)
              setQuestions(buildLap())
              setPhase('countdown')
            })
            .catch(() => setPhase('gate'))
        } else {
          setPhase('gate')
        }
      })
      .catch(() => {
        const freeAvailable = Math.max(0, FREE_ATTEMPTS - usedFree)
        if (freeAvailable > 0) {
          try { localStorage.setItem(FREE_STORAGE_KEY, String(usedFree + 1)) } catch {}
          setFreeUsed(usedFree + 1)
          setQuestions(buildLap())
          setPhase('countdown')
        } else {
          setPhase('gate')
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    setFeedbackData({ correct, timedOut, timeTaken: timeMsRaw, correctLabel })
    setPhase('feedback')

    setTimeout(() => {
      setFeedbackData(null)
      if (qIndex + 1 >= questions.length) {
        const totalMs = computeLapMs(newSectors)
        const lapTime = formatLapTime(totalMs)
        const payload = { sectors: newSectors, totalMs, lapTime, paid: usedPaidLap }
        const encoded = btoa(JSON.stringify(payload))
        router.push(`/nordschleife/results?d=${encoded}`)
      } else {
        setQIndex(qi => qi + 1)
        setPhase('racing')
      }
    }, 1100)
  }, [phase, qIndex, questions, sectors, router, usedPaidLap])

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

  // ── early gate state ──
  if (phase === 'gate') {
    return <GateScreen freeUsed={freeUsed} paidLeft={paidLeft} />
  }
  if (phase === 'countdown') {
    return <CountdownScreen onGo={() => setPhase('racing')} />
  }
  if (!currentQ) {
    return (
      <div style={{ minHeight: '100vh', background: BG, color: MUTED, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading…
      </div>
    )
  }

  // ── sector summary for display ──
  const s1ms = sectors.slice(0, QUESTIONS_PER_SECTOR).reduce((s, r) => s + r.timeMsTotal, 0)
  const s2ms = sectors.slice(QUESTIONS_PER_SECTOR, QUESTIONS_PER_SECTOR * 2).reduce((s, r) => s + r.timeMsTotal, 0)
  const s3ms = sectors.slice(QUESTIONS_PER_SECTOR * 2, QUESTIONS_PER_LAP).reduce((s, r) => s + r.timeMsTotal, 0)

  const progressPct = (msLeft / TIME_PER_Q_MS) * 100
  const timerColor  = msLeft > 8000 ? GREEN : msLeft > 4000 ? GOLD : RED

  const diffColor = currentQ.difficulty === 'easy' ? GREEN
                  : currentQ.difficulty === 'medium' ? GOLD
                  : RED

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Inter, system-ui, sans-serif', color: WHITE }}>
      {feedbackData && <FeedbackOverlay {...feedbackData} />}

      {/* Top status bar */}
      <div style={{ background: DARK, borderBottom: `1px solid ${BORDER}`, padding: '0 20px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: GREEN, letterSpacing: '0.05em' }}>
            🌲 NORDSCHLEIFE
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
                  background: isActive ? GREEN : isDone ? '#1A3320' : CARD,
                  border: `1px solid ${isActive ? GREEN : isDone ? '#2A4A30' : BORDER}`,
                  fontSize: 11, fontWeight: 800,
                  color: isActive ? WHITE : isDone ? GREEN : MUTED,
                  fontFamily: 'monospace',
                }}>
                  S{s}{isDone && ms > 0 ? ` ${formatLapTime(ms)}` : ''}
                </div>
              )
            })}
          </div>

          <span style={{ fontSize: 12, color: MUTED, fontWeight: 700 }}>
            Q{qIndex + 1}<span style={{ color: BORDER }}>/{QUESTIONS_PER_LAP}</span>
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div style={{ height: 4, background: BORDER, position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${progressPct}%`, background: timerColor,
          transition: 'width 0.05s linear, background 0.3s',
        }} />
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px 80px' }}>
        {/* Timer */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontSize: 56, fontWeight: 900, fontFamily: 'monospace',
            color: timerColor, letterSpacing: '-0.03em', lineHeight: 1,
            transition: 'color 0.3s',
          }}>
            {(msLeft / 1000).toFixed(1)}
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 6, letterSpacing: '0.12em' }}>SECONDS REMAINING</div>
        </div>

        {/* Sector + difficulty pill */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <span style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: 100,
            fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
            background: `${diffColor}18`, color: diffColor, border: `1px solid ${diffColor}44`,
          }}>
            Sector {sector} · {SECTOR_NAMES[sector]} · {currentQ.difficulty}
          </span>
        </div>

        {/* Question card */}
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`,
          borderRadius: 16, padding: '28px 28px 24px', marginBottom: 20,
        }}>
          <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 700, color: WHITE, lineHeight: 1.5, margin: 0 }}>
            {currentQ.text}
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {currentQ.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => phase === 'racing' && handleAnswer(opt.value)}
              disabled={phase !== 'racing'}
              style={{
                background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: 12, padding: '16px 18px',
                cursor: phase === 'racing' ? 'pointer' : 'default',
                textAlign: 'left', transition: 'border-color 0.15s, background 0.15s',
                outline: 'none', color: WHITE,
                display: 'flex', alignItems: 'center', gap: 12,
              }}
              onMouseEnter={e => {
                if (phase === 'racing') {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = GREEN
                  ;(e.currentTarget as HTMLButtonElement).style.background = '#1A2E1F'
                }
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = BORDER
                ;(e.currentTarget as HTMLButtonElement).style.background = CARD
              }}
            >
              <span style={{
                width: 24, height: 24, borderRadius: 6, background: BORDER,
                fontSize: 11, fontWeight: 800, color: MUTED,
                textAlign: 'center', lineHeight: '24px', flexShrink: 0,
              }}>
                {opt.value.toUpperCase()}
              </span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Lap progress */}
        <div style={{ marginTop: 32, display: 'flex', gap: 2 }}>
          {questions.map((_, i) => {
            const done    = i < sectors.length
            const active  = i === qIndex
            const correct = done ? sectors[i].correct : false
            const color   = active ? GREEN : done ? (correct ? GREEN : '#7A1A26') : BORDER
            return (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: color, transition: 'background 0.3s' }} />
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: MUTED }}>
          <span>S1 Hatzenbach</span>
          <span>S2 Karussell</span>
          <span>S3 Döttinger Höhe</span>
        </div>
      </div>
    </div>
  )
}
