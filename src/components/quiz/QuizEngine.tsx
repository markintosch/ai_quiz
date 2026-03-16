'use client'

import { useState, useCallback } from 'react'
import { useRouter, usePathname } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { QUESTIONS, LITE_QUESTIONS, type Question } from '@/data/questions'
import type { AnswerMap, LeadFormData, QuizVersion, SubmitQuizPayload } from '@/types'
import { ProgressBar } from './ProgressBar'
import { QuestionCard } from './QuestionCard'
import { LeadCaptureForm } from './LeadCaptureForm'

interface QuizEngineProps {
  version: QuizVersion
  /**
   * 'pre'  → lead form shown before questions (company quiz)
   * 'post' → lead form shown after questions (lite + extended public)
   * Defaults to 'pre' for full, 'post' for lite
   */
  leadCapture?: 'pre' | 'post'
  /** Provided for Full quiz — company slug from URL */
  companySlug?: string
  /** Provided for Full quiz — pre-fetched company name for display */
  companyName?: string
  /** Pre-filled lead data (company quiz — captured on landing page) */
  initialLead?: Partial<LeadFormData>
  /** Question codes to skip (full quiz only) */
  excludedCodes?: string[]
  /** Company accent colour for CTA buttons */
  accentColor?: string
}

export function QuizEngine({
  version,
  leadCapture,
  companySlug,
  companyName,
  initialLead,
  excludedCodes = [],
  accentColor,
}: QuizEngineProps) {
  const t = useTranslations('quiz.engine')
  const locale = useLocale()

  // Resolve default: company full quiz → pre; lite + extended public → post
  const captureMode = leadCapture ?? (version === 'full' && companySlug ? 'pre' : 'post')

  const router = useRouter()
  const baseQuestions: Question[] = version === 'lite' ? LITE_QUESTIONS : QUESTIONS
  const questions: Question[] = excludedCodes.length > 0
    ? baseQuestions.filter((q) => !excludedCodes.includes(q.code))
    : baseQuestions

  // ── State ──────────────────────────────────────────────────
  const [phase, setPhase] = useState<'lead_pre' | 'questions' | 'lead_post' | 'submitting'>(
    captureMode === 'pre' ? 'lead_pre' : 'questions'
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [preLead, _setPreLead] = useState<LeadFormData | null>(
    initialLead as LeadFormData | null ?? null
  )

  const currentQuestion = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const answered = answers[currentQuestion?.code]
  const canAdvance =
    answered !== undefined &&
    (Array.isArray(answered) ? answered.length > 0 : true)

  // ── Handlers ───────────────────────────────────────────────
  const handleAnswer = useCallback(
    (value: number | string[]) => {
      setAnswers(prev => ({ ...prev, [currentQuestion.code]: value }))
    },
    [currentQuestion]
  )

  function handleNext() {
    if (!canAdvance) return
    if (isLast) {
      setPhase('lead_post')
    } else {
      setDirection(1)
      setCurrentIndex(i => i + 1)
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex(i => i - 1)
    }
  }

  async function handleSubmit(lead: LeadFormData) {
    setSubmitting(true)
    setError(null)
    setPhase('submitting')

    try {
      const payload: SubmitQuizPayload = {
        version,
        answers,
        lead,
        companySlug,
        locale,
      }

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Server error ${res.status}`)
      }

      const { responseId } = await res.json()
      // Use locale-aware router — automatically prepends /en or /nl
      router.push(`/results/${responseId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
      setPhase('lead_post')
    }
  }

  // Pre-lead submitted → move to questions
  function handlePreLeadSubmit(lead: LeadFormData) {
    _setPreLead(lead)
    setPhase('questions')
  }

  // Last question done on pre-capture mode → submit directly with stored lead
  function handleFullFinish() {
    if (!preLead) return
    handleSubmit(preLead)
  }

  // ── Render phases ──────────────────────────────────────────
  if (phase === 'lead_pre') {
    return (
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          {companyName && (
            <p className="text-sm font-semibold text-brand-accent uppercase tracking-widest mb-2">
              {companyName}
            </p>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            AI Maturity Assessment
          </h1>
          <p className="text-gray-500 text-base">
            Complete your details to begin the assessment.
          </p>
        </div>
        <LeadCaptureForm
          variant="pre"
          initialValues={initialLead}
          onSubmit={handlePreLeadSubmit}
        />
      </div>
    )
  }

  if (phase === 'submitting') {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="inline-block w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-gray-600 font-medium">{t('submitting')}</p>
      </div>
    )
  }

  if (phase === 'lead_post') {
    return (
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {version === 'full' ? t('postHeadingFull') : t('postHeadingLite')}
          </h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            {version === 'full' ? t('postSubFull') : t('postSubLite')}
          </p>
        </div>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}
        <LeadCaptureForm
          variant="post"
          onSubmit={handleSubmit}
          loading={submitting}
        />
      </div>
    )
  }

  // ── Questions phase ────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <ProgressBar current={currentIndex + 1} total={questions.length} />
      </div>

      <div className="overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <QuestionCard
            key={currentQuestion.code}
            question={currentQuestion}
            answer={answers[currentQuestion.code]}
            onAnswer={handleAnswer}
            direction={direction}
          />
        </AnimatePresence>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-between items-center">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentIndex === 0}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:invisible transition-colors"
        >
          {t('back')}
        </button>

        {captureMode === 'pre' && isLast ? (
          // Company quiz: lead already captured, submit directly
          <button
            type="button"
            onClick={handleFullFinish}
            disabled={!canAdvance || submitting || !preLead}
            className="px-8 py-3 text-white font-semibold rounded-xl disabled:opacity-40 transition-all"
            style={{ backgroundColor: accentColor ?? '#E8611A' }}
          >
            {submitting ? t('seeResultsLoading') : t('seeResults')}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance}
            className="px-8 py-3 bg-brand-accent text-white font-semibold rounded-xl disabled:opacity-40 hover:bg-orange-700 transition-all"
          >
            {isLast ? t('seeResults') : t('next')}
          </button>
        )}
      </div>
    </div>
  )
}
