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
  /** Full product name — e.g. "People Readiness Check" — replaces hardcoded heading */
  productName?: string
  /** Pre-filled lead data (company quiz — captured on landing page) */
  initialLead?: Partial<LeadFormData>
  /** Question codes to skip (full quiz only) */
  excludedCodes?: string[]
  /** Company accent colour for CTA buttons */
  accentColor?: string
  /** Product key for multi-product scoring — forwarded to /api/submit */
  productKey?: string
  /** Cohort ID — links this submission to a cohort wave */
  cohortId?: string
  /** Wave ID — links this submission to a specific wave */
  waveId?: string
  /** Override the default question set — when provided, used instead of LITE_QUESTIONS/QUESTIONS */
  questions?: Question[]
  /** 'full' = all lead fields (default); 'minimal' = name + email only */
  leadCaptureMode?: 'full' | 'minimal'
  showCallbackOption?: boolean
  hideMarketingConsent?: boolean
  /**
   * Pre-filled answers — used by the Lite→Full continuation flow.
   * Questions whose code is already in this map are skipped from the rendered
   * question list, and the answers are merged into the submission payload.
   */
  initialAnswers?: AnswerMap
  /**
   * If set, the submission is linked back to a parent (Lite) response via
   * `parent_response_id` — used for the Lite→Full continuation flow.
   */
  parentResponseId?: string
}

export function QuizEngine({
  version,
  leadCapture,
  companySlug,
  companyName,
  productName,
  initialLead,
  excludedCodes = [],
  accentColor,
  productKey,
  cohortId,
  waveId,
  questions: questionsProp,
  leadCaptureMode = 'full',
  showCallbackOption,
  hideMarketingConsent,
  initialAnswers,
  parentResponseId,
}: QuizEngineProps) {
  const t = useTranslations('quiz.engine')
  const locale = useLocale()

  // Resolve default: company full quiz → pre; lite + extended public → post
  const captureMode = leadCapture ?? (version === 'full' && companySlug ? 'pre' : 'post')

  const router = useRouter()
  const baseQuestions: Question[] = questionsProp ?? (version === 'lite' ? LITE_QUESTIONS : QUESTIONS)
  const initialAnswerCodes = initialAnswers ? new Set(Object.keys(initialAnswers)) : null
  const questions: Question[] = baseQuestions.filter((q) => {
    if (excludedCodes.includes(q.code)) return false
    // Continuation flow: skip questions already answered in the parent response
    if (initialAnswerCodes && initialAnswerCodes.has(q.code)) return false
    return true
  })

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

    // ── Read mentor attribution from sessionStorage (set by /mentor page) ──
    let attribution: { ref: string; utm_source: string; utm_medium: string; utm_campaign: string } | null = null
    try {
      const raw = typeof window !== 'undefined' ? sessionStorage.getItem('mentor_attribution') : null
      if (raw) attribution = JSON.parse(raw)
    } catch { /* ignore */ }

    try {
      // Continuation flow: merge in the parent (lite) answers so the full
      // scoring engine sees all 26 question codes, not just the 19 extras.
      const mergedAnswers: AnswerMap = initialAnswers
        ? { ...initialAnswers, ...answers }
        : answers

      const payload: SubmitQuizPayload = {
        version,
        answers: mergedAnswers,
        lead,
        companySlug,
        cohortId,
        waveId,
        locale,
        productKey,
        ...(parentResponseId ? { parentResponseId } : {}),
        ...(attribution ? {
          refSource:   attribution.ref,
          utmSource:   attribution.utm_source   || undefined,
          utmMedium:   attribution.utm_medium   || undefined,
          utmCampaign: attribution.utm_campaign || undefined,
        } : {}),
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
      // For pre-capture (company) quiz, return to the lead form at the start.
      // For post-capture quiz, return to the post-quiz lead form.
      setPhase(captureMode === 'pre' ? 'lead_pre' : 'lead_post')
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
            {productName ?? 'AI Maturity Assessment'}
          </h1>
          <p className="text-gray-500 text-base">
            Complete your details to begin the assessment.
          </p>
        </div>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}
        <LeadCaptureForm
          variant="pre"
          initialValues={preLead ?? initialLead}
          onSubmit={handlePreLeadSubmit}
          mode={leadCaptureMode}
          companyName={companyName}
          showCallbackOption={showCallbackOption}
          hideMarketingConsent={hideMarketingConsent}
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
          mode={leadCaptureMode}
          companyName={companyName}
          showCallbackOption={showCallbackOption}
          hideMarketingConsent={hideMarketingConsent}
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
