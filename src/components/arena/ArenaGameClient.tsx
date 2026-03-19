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
      <div className="text-white text-center">
        <p className="text-xl font-bold mb-4">Game over!</p>
        <a href={`/arena/${joinCode}/results?pid=${participantId}`} className="bg-brand-accent text-white font-bold px-6 py-3 rounded-xl">
          See results →
        </a>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="text-white text-center">
        <p>Loading…</p>
      </div>
    )
  }

  const progressPct = ((qIndex) / questions.length) * 100
  const timerPct = (timeLeft / timePerQ) * 100
  const timerColor = timerPct > 50 ? 'bg-green-400' : timerPct > 25 ? 'bg-yellow-400' : 'bg-red-400'

  const optionStyle = (opt: ArenaOption) => {
    if (!result) {
      return selectedValue === opt.value
        ? 'border-white/60 bg-white/20 text-white'
        : 'border-white/20 bg-white/5 text-white/90 hover:bg-white/10 hover:border-white/40 cursor-pointer'
    }
    if (opt.value === question.correct_value) return 'border-green-400 bg-green-400/20 text-white'
    if (opt.value === selectedValue && !result.is_correct) return 'border-red-400 bg-red-400/20 text-white'
    return 'border-white/10 bg-white/5 text-white/40'
  }

  return (
    <div className="w-full max-w-xl space-y-4">
      {/* Progress + score */}
      <div className="flex items-center justify-between text-white/70 text-xs">
        <span>{qIndex + 1} / {questions.length}</span>
        <span className="font-bold text-white">{totalScore} pts</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1">
        <div className="bg-white/40 h-1 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Timer */}
      {!result && (
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${timerColor}`}
            style={{ width: `${timerPct}%` }}
          />
        </div>
      )}

      {/* Question */}
      <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-white/50 uppercase tracking-wide">{question.topic ?? 'Cloud'}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            question.difficulty === 'hard' ? 'bg-red-400/20 text-red-300' :
            question.difficulty === 'medium' ? 'bg-yellow-400/20 text-yellow-300' :
            'bg-green-400/20 text-green-300'
          }`}>
            {question.difficulty}
          </span>
        </div>
        <p className="text-white font-semibold text-base leading-snug">{question.question_text}</p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {(question.options as ArenaOption[]).map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            disabled={!!result || submitting}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${optionStyle(opt)}`}
          >
            <span className="font-bold mr-2 opacity-60">{opt.label}</span>
            {opt.text}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {result && (
        <div className={`rounded-xl p-4 text-sm ${result.is_correct ? 'bg-green-400/20 text-green-200' : 'bg-red-400/20 text-red-200'}`}>
          <p className="font-bold mb-1">
            {result.is_correct ? `Correct! +${result.points} points` : 'Incorrect'}
          </p>
          {result.explanation && <p className="text-xs opacity-80">{result.explanation}</p>}
        </div>
      )}

      {result && (
        <button
          onClick={handleNext}
          className="w-full bg-brand-accent hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {qIndex + 1 >= questions.length ? 'See Results →' : 'Next Question →'}
        </button>
      )}

      {/* Timed out */}
      {!result && timeLeft === 0 && (
        <div className="bg-white/10 rounded-xl p-4 text-white/60 text-sm text-center">
          Time&apos;s up!
        </div>
      )}
    </div>
  )
}
