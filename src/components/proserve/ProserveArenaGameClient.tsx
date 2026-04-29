'use client'

// Proserve-themed fork of ArenaGameClient. Same engine + API contract;
// clean enterprise styling (no Press Start, no cyan glow, no scanlines).
// Sends results redirect to /proserve/arena/[code]/results.

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { ArenaQuestion, ArenaOption } from '@/products/cloud_arena/types'

const NAVY      = '#1F0F70'
const NAVY_DARK = '#0F0840'
const BLUE      = '#1F8EFF'
const BLUE_SOFT = '#E5F2FF'
const INK       = '#1A1A2E'
const BODY      = '#4B5468'
const MUTED     = '#8C92A6'
const BORDER    = '#E5E7EE'
const LIGHT_BG  = '#F5F6F9'
const GREEN     = '#15803D'
const GREEN_SOFT= '#DCFCE7'
const RED       = '#B91C1C'
const RED_SOFT  = '#FEE2E2'
const AMBER     = '#D97706'
const FONT      = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

interface Props {
  joinCode:      string
  participantId: string
  questions:     ArenaQuestion[]
  timePerQ:      number
  sessionStatus: string
}

interface AnswerResult {
  is_correct:  boolean
  points:      number
  explanation: string | null
}

export default function ProserveArenaGameClient({
  joinCode, participantId, questions, timePerQ, sessionStatus,
}: Props) {
  const router = useRouter()
  const [qIndex, setQIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timePerQ)
  const [selectedValue, setSelectedValue] = useState<string | null>(null)
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(sessionStatus === 'completed')
  const startRef = useRef<number>(Date.now())

  const question = questions[qIndex] as ArenaQuestion | undefined

  const submitAnswer = useCallback(async (value: string | null) => {
    if (submitting) return
    setSubmitting(true)
    const timeTakenMs = Date.now() - startRef.current
    try {
      const res = await fetch(`/api/arena/sessions/${joinCode}/answer`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          participant_id: participantId,
          question_index: qIndex,
          answer_value:   value ?? '__timeout__',
          time_taken_ms:  timeTakenMs,
        }),
      })
      if (res.ok) {
        const json = await res.json() as AnswerResult
        setResult(json)
        if (json.is_correct) setTotalScore(s => s + json.points)
      }
    } catch { /* ignore */ }
    setSubmitting(false)
  }, [joinCode, participantId, qIndex, submitting])

  // Countdown
  useEffect(() => {
    if (result || done) return
    startRef.current = Date.now()
    setTimeLeft(timePerQ)
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval)
          void submitAnswer(null)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, timePerQ])

  async function handleNext() {
    const next = qIndex + 1
    if (next >= questions.length) {
      try {
        await fetch(`/api/arena/sessions/${joinCode}/finish`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ participant_id: participantId }),
        })
      } catch { /* ignore */ }
      setDone(true)
      router.push(`/proserve/arena/${joinCode}/results?pid=${participantId}`)
    } else {
      setQIndex(next)
      setSelectedValue(null)
      setResult(null)
    }
  }

  function handleSelect(value: string) {
    if (result || submitting) return
    setSelectedValue(value)
    void submitAnswer(value)
  }

  // ── End screen ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, padding: '40px 32px', textAlign: 'center', maxWidth: 520, margin: '0 auto', fontFamily: FONT }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: BLUE, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
          Klaar
        </p>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginBottom: 12 }}>
          Bedankt voor het spelen.
        </h2>
        <p style={{ fontSize: 14, color: BODY, lineHeight: 1.6, marginBottom: 22 }}>
          Je eindscore is opgeslagen. Bekijk hoe je je verhoudt tot de andere spelers.
        </p>
        <a
          href={`/proserve/arena/${joinCode}/results?pid=${participantId}`}
          style={{
            display: 'inline-block',
            background: BLUE, color: '#fff', fontWeight: 700, fontSize: 15,
            padding: '13px 30px', borderRadius: 100, textDecoration: 'none',
          }}
        >
          Bekijk de eindstand →
        </a>
      </div>
    )
  }

  if (!question) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: BODY, fontFamily: FONT }}>
        <p style={{ fontSize: 14, color: MUTED }}>Laden…</p>
      </div>
    )
  }

  // ── Live game ──────────────────────────────────────────────────────────
  const progressPct = ((qIndex) / questions.length) * 100
  const timerPct    = (timeLeft / timePerQ) * 100
  const timerColor  = timerPct > 50 ? BLUE : timerPct > 25 ? AMBER : RED

  function optionStyle(opt: ArenaOption): React.CSSProperties {
    if (!result) {
      const selected = selectedValue === opt.value
      return {
        background: selected ? `${BLUE}0d` : '#fff',
        border:     `1.5px solid ${selected ? BLUE : BORDER}`,
        color:      INK,
      }
    }
    if (opt.value === question!.correct_value) {
      return { background: GREEN_SOFT, border: `1.5px solid ${GREEN}66`, color: '#14532D' }
    }
    if (opt.value === selectedValue && !result.is_correct) {
      return { background: RED_SOFT, border: `1.5px solid ${RED}66`, color: '#7F1D1D' }
    }
    return { background: '#fff', border: `1.5px solid ${BORDER}`, color: MUTED }
  }

  return (
    <div style={{ width: '100%', maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14, fontFamily: FONT }}>

      {/* Header: Q index + score */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Vraag {qIndex + 1} <span style={{ color: BORDER }}>/</span> {questions.length}
        </span>
        <span style={{ fontSize: 18, fontWeight: 900, color: NAVY, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
          {totalScore.toLocaleString('nl-NL')} <span style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>punten</span>
        </span>
      </div>

      {/* Progress bar (questions) */}
      <div style={{ height: 4, background: BLUE_SOFT, borderRadius: 100, overflow: 'hidden' }}>
        <div style={{ height: 4, width: `${progressPct}%`, background: BLUE, borderRadius: 100, transition: 'width 0.4s ease-out' }} />
      </div>

      {/* Timer bar (countdown) */}
      {!result && (
        <div style={{ height: 6, background: '#F1F5F9', borderRadius: 100, overflow: 'hidden' }}>
          <div
            style={{
              height: 6, width: `${timerPct}%`, background: timerColor, borderRadius: 100,
              transition: 'width 1s linear, background 0.3s ease',
            }}
          />
        </div>
      )}

      {/* Question card */}
      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '24px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {question.topic ?? 'Cloud'}
          </span>
          {question.difficulty && (
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: 100,
              background:
                question.difficulty === 'hard'   ? '#FEE2E2' :
                question.difficulty === 'medium' ? '#FEF3C7' : '#DCFCE7',
              color:
                question.difficulty === 'hard'   ? '#991B1B' :
                question.difficulty === 'medium' ? '#854D0E' : '#166534',
            }}>
              {question.difficulty}
            </span>
          )}
        </div>
        <p style={{ fontSize: 'clamp(18px, 2.4vw, 22px)', color: INK, fontWeight: 700, lineHeight: 1.4, margin: 0, letterSpacing: '-0.01em' }}>
          {question.question_text}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(question.options as ArenaOption[]).map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleSelect(opt.value)}
            disabled={!!result || submitting}
            style={{
              ...optionStyle(opt),
              textAlign: 'left',
              padding: '14px 18px',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              cursor: !!result || submitting ? 'default' : 'pointer',
              fontFamily: FONT,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: BLUE_SOFT,
              color: BLUE,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800,
              flexShrink: 0,
            }}>
              {opt.label}
            </span>
            <span style={{ flex: 1 }}>{opt.text}</span>
          </button>
        ))}
      </div>

      {/* Feedback */}
      {result && (
        <div style={{
          padding: '16px 20px',
          borderRadius: 12,
          background: result.is_correct ? GREEN_SOFT : RED_SOFT,
          border: `1px solid ${result.is_correct ? `${GREEN}55` : `${RED}55`}`,
        }}>
          <p style={{
            fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: result.is_correct ? GREEN : RED, marginBottom: result.explanation ? 6 : 0,
          }}>
            {result.is_correct ? `Goed · +${result.points} punten` : 'Helaas, fout'}
          </p>
          {result.explanation && (
            <p style={{ fontSize: 14, color: BODY, lineHeight: 1.55, margin: 0 }}>
              {result.explanation}
            </p>
          )}
        </div>
      )}

      {result && (
        <button
          onClick={handleNext}
          style={{
            background: BLUE, color: '#fff', fontWeight: 800, fontSize: 16,
            padding: '15px 22px', borderRadius: 100, border: 'none',
            cursor: 'pointer', fontFamily: FONT,
            boxShadow: '0 8px 24px rgba(31,142,255,0.3)',
          }}
        >
          {qIndex + 1 >= questions.length ? 'Bekijk de eindstand →' : 'Volgende vraag →'}
        </button>
      )}

      {/* Timed-out (no answer) */}
      {!result && timeLeft === 0 && (
        <div style={{
          padding: '14px 18px', borderRadius: 12,
          background: LIGHT_BG, border: `1px solid ${BORDER}`,
          textAlign: 'center', color: MUTED, fontSize: 14, fontWeight: 600,
        }}>
          Tijd voorbij. Vraag wordt verwerkt…
        </div>
      )}

      {/* Suppress unused */}
      <span style={{ display: 'none' }}>{NAVY_DARK}</span>
    </div>
  )
}
