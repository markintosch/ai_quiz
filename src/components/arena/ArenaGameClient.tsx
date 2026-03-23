'use client'

// FILE: src/components/arena/ArenaGameClient.tsx
// The timed question loop — runs entirely client-side with a countdown timer
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { ArenaQuestion, ArenaOption } from '@/products/cloud_arena/types'

interface Props {
  joinCode: string
  participantId: string
  questions: ArenaQuestion[]
  timePerQ: number
  sessionStatus: string
}

interface AnswerResult {
  is_correct: boolean
  points: number
  explanation: string | null
}

export default function ArenaGameClient({ joinCode, participantId, questions, timePerQ, sessionStatus }: Props) {
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
    const body = {
      participant_id: participantId,
      question_index: qIndex,
      answer_value:   value ?? '__timeout__',
      time_taken_ms:  timeTakenMs,
    }

    try {
      const res = await fetch(`/api/arena/sessions/${joinCode}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const json = await res.json() as AnswerResult
        setResult(json)
        if (json.is_correct) setTotalScore(s => s + json.points)
      }
    } catch { /* ignore — carry on */ }

    setSubmitting(false)
  }, [joinCode, participantId, qIndex, submitting])

  // Countdown timer
  useEffect(() => {
    if (result || done) return
    startRef.current = Date.now()
    setTimeLeft(timePerQ)

    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval)
          void submitAnswer(null) // timed out
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
      // All done — call finish endpoint
      try {
        await fetch(`/api/arena/sessions/${joinCode}/finish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participant_id: participantId }),
        })
      } catch { /* ignore */ }
      router.push(`/arena/${joinCode}/results?pid=${participantId}`)
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

  if (done) {
    return (
      <div className="text-center space-y-4">
        <p
          className="tracking-widest mb-4"
          style={{ fontFamily: 'var(--font-press-start)', fontSize: '13px', color: '#00E5FF', textShadow: '0 0 15px rgba(0,229,255,0.7)' }}
        >
          GAME OVER
        </p>
        <a
          href={`/arena/${joinCode}/results?pid=${participantId}`}
          className="inline-block text-black font-black px-8 py-4 tracking-widest transition-all hover:opacity-90"
          style={{
            fontFamily: 'var(--font-press-start)',
            fontSize: '10px',
            background: 'linear-gradient(135deg, #C1440E 0%, #FF6B1A 100%)',
            boxShadow: '0 0 20px rgba(193,68,14,0.5)',
          }}
        >
          SEE RESULTS →
        </a>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="text-center">
        <p className="text-cyan-400/60 text-2xl tracking-widest" style={{ fontFamily: 'var(--font-vt323)' }}>
          LOADING…
        </p>
      </div>
    )
  }

  const progressPct = ((qIndex) / questions.length) * 100
  const timerPct = (timeLeft / timePerQ) * 100
  const timerColor = timerPct > 50 ? '#00E5FF' : timerPct > 25 ? '#F5A820' : '#FF3B3B'

  const optionStyle = (opt: ArenaOption) => {
    if (!result) {
      return selectedValue === opt.value
        ? 'border-cyan-400 bg-cyan-400/10 text-white'
        : 'border-cyan-400/20 bg-black/20 text-white/80 hover:bg-cyan-400/5 hover:border-cyan-400/40 cursor-pointer'
    }
    if (opt.value === question.correct_value) return 'border-green-400 bg-green-400/15 text-green-200'
    if (opt.value === selectedValue && !result.is_correct) return 'border-red-400 bg-red-400/15 text-red-200'
    return 'border-white/10 bg-black/20 text-white/30'
  }

  return (
    <div className="w-full max-w-xl space-y-3">
      {/* Progress + score header */}
      <div className="flex items-center justify-between">
        <span className="text-cyan-400/60 text-xl tracking-widest">
          Q{qIndex + 1}/{questions.length}
        </span>
        <span
          className="tabular-nums"
          style={{ fontFamily: 'var(--font-press-start)', fontSize: '11px', color: '#F5A820', textShadow: '0 0 8px rgba(245,168,32,0.6)' }}
        >
          {totalScore.toString().padStart(6, '0')}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1" style={{ background: 'rgba(0,229,255,0.1)' }}>
        <div className="h-1 transition-all" style={{ width: `${progressPct}%`, background: 'rgba(0,229,255,0.4)' }} />
      </div>

      {/* Timer bar */}
      {!result && (
        <div className="w-full h-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-2 transition-all duration-1000"
            style={{ width: `${timerPct}%`, background: timerColor, boxShadow: `0 0 8px ${timerColor}80` }}
          />
        </div>
      )}

      {/* Question card */}
      <div
        className="p-5"
        style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,229,255,0.2)', boxShadow: '0 0 20px rgba(0,229,255,0.05)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-cyan-400/50 text-lg tracking-widest uppercase">{question.topic ?? 'Cloud'}</span>
          <span className={`text-base px-2 py-0.5 tracking-widest ${
            question.difficulty === 'hard' ? 'text-red-400 border border-red-400/30' :
            question.difficulty === 'medium' ? 'text-yellow-400 border border-yellow-400/30' :
            'text-green-400 border border-green-400/30'
          }`}
            style={{ fontFamily: 'var(--font-press-start)', fontSize: '7px' }}
          >
            {question.difficulty?.toUpperCase()}
          </span>
        </div>
        <p className="text-white text-xl leading-snug tracking-wide">{question.question_text}</p>
      </div>

      {/* Answer options */}
      <div className="space-y-2">
        {(question.options as ArenaOption[]).map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            disabled={!!result || submitting}
            className={`w-full text-left px-4 py-3 border transition-all text-xl tracking-wide ${optionStyle(opt)}`}
          >
            <span className="mr-3 text-cyan-400/50" style={{ fontFamily: 'var(--font-press-start)', fontSize: '9px' }}>{opt.label}</span>
            {opt.text}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {result && (
        <div
          className={`p-4 text-xl tracking-wide ${result.is_correct ? 'text-green-300' : 'text-red-300'}`}
          style={{
            border: result.is_correct ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(248,113,113,0.4)',
            background: result.is_correct ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
          }}
        >
          <p className="mb-1 tracking-widest" style={{ fontFamily: 'var(--font-press-start)', fontSize: '9px' }}>
            {result.is_correct ? `+${result.points} PTS` : 'WRONG'}
          </p>
          {result.explanation && <p className="text-base opacity-70 mt-1">{result.explanation}</p>}
        </div>
      )}

      {result && (
        <button
          onClick={handleNext}
          className="w-full text-black font-black py-4 tracking-widest transition-all hover:opacity-90"
          style={{
            fontFamily: 'var(--font-press-start)',
            fontSize: '10px',
            background: 'linear-gradient(135deg, #C1440E 0%, #FF6B1A 100%)',
            boxShadow: '0 0 20px rgba(193,68,14,0.4)',
          }}
        >
          {qIndex + 1 >= questions.length ? 'SEE RESULTS →' : 'NEXT →'}
        </button>
      )}

      {/* Timed out message */}
      {!result && timeLeft === 0 && (
        <div className="p-4 text-center text-xl tracking-[0.3em]" style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
          TIME&apos;S UP
        </div>
      )}
    </div>
  )
}
