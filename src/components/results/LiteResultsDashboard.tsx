'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { QuizScore } from '@/types'
import type { Recommendation } from '@/lib/scoring/recommendations'
import { RadarChart } from './RadarChart'
import { ShadowAIFlag } from './ShadowAIFlag'
import { RecommendationCard } from './RecommendationCard'
import { ReferralSection } from './ReferralSection'
import { trackEvent } from '@/lib/analytics'

// ── Types ──────────────────────────────────────────────────────
interface LiteResultsDashboardProps {
  score: QuizScore
  recommendations: Recommendation[]
  respondentName: string
  respondentEmail: string
  respondentCompany?: string
}

// ── Config ────────────────────────────────────────────────────
const MATURITY_CONFIG: Record<string, {
  color: string
  bg: string
  ring: string
  insight: string
  urgency: string
}> = {
  Unaware: {
    color:   'text-red-500',
    bg:      'bg-red-50',
    ring:    'ring-red-200',
    insight: 'Your organisation is at a critical inflection point. AI is no longer a future consideration — it is reshaping markets now. The good news: starting from awareness means every move you make compounds quickly.',
    urgency: 'Act now — competitors are already widening the gap.',
  },
  Exploring: {
    color:   'text-orange-500',
    bg:      'bg-orange-50',
    ring:    'ring-orange-200',
    insight: 'You are beginning to see the opportunity — but exploration without direction leads to wasted investment. A clear strategy will help you convert curiosity into competitive advantage faster than you think.',
    urgency: 'Structured action in the next 90 days can accelerate you by 12+ months.',
  },
  Experimenting: {
    color:   'text-yellow-600',
    bg:      'bg-yellow-50',
    ring:    'ring-yellow-200',
    insight: 'You have real AI activity underway, which puts you ahead of most. The challenge now is moving from scattered pilots to a coherent capability that scales and creates lasting differentiation.',
    urgency: 'Scaling what works — and stopping what doesn\'t — is the highest-leverage move right now.',
  },
  Scaling: {
    color:   'text-teal-600',
    bg:      'bg-teal-50',
    ring:    'ring-teal-200',
    insight: 'AI is embedded in how you operate — a genuine advantage. The leaders who stay ahead are those who lock in governance, culture and compounding capability before the next wave hits.',
    urgency: 'Protecting and extending your lead requires deliberate focus on the dimensions lagging behind.',
  },
  Leading: {
    color:   'text-green-600',
    bg:      'bg-green-50',
    ring:    'ring-green-200',
    insight: 'You are operating at the frontier of AI adoption. The risk at this stage is complacency — the landscape shifts fast and staying ahead requires continuous investment in capability, talent and governance.',
    urgency: 'Sustaining leadership means building the next advantage before you need it.',
  },
}

// ── Animated count-up ─────────────────────────────────────────
function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0)
  const raf   = useRef<number | null>(null)
  const start = useRef<number | null>(null)
  useEffect(() => {
    start.current = null
    function step(ts: number) {
      if (!start.current) start.current = ts
      const p = Math.min((ts - start.current) / duration, 1)
      setValue(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration])
  return value
}

// ── Animation variants ────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

// ── Component ─────────────────────────────────────────────────
export function LiteResultsDashboard({
  score,
  recommendations,
  respondentName,
  respondentEmail,
  respondentCompany = '',
}: LiteResultsDashboardProps) {
  const firstName  = respondentName?.trim().split(/\s+/)[0] || 'there'
  const config     = MATURITY_CONFIG[score.maturityLevel] ?? MATURITY_CONFIG.Exploring
  const displayScore = useCountUp(score.overall)

  // Split recommendations into primary and supporting
  const primaryRecs    = recommendations.filter(r => r.priority === 'primary')
  const supportingRecs = recommendations.filter(r => r.priority === 'supporting')

  // Collapsible referral
  const [referralOpen, setReferralOpen] = useState(false)

  // Fire results_viewed once on mount
  useEffect(() => {
    trackEvent('results_viewed', {
      quiz_variant:   'lite',
      maturity_level: score.maturityLevel,
      overall_score:  score.overall,
    })
  }, [score.maturityLevel, score.overall])

  return (
    <motion.div
      className="max-w-2xl mx-auto space-y-6 pb-20"
      variants={stagger}
      initial="hidden"
      animate="show"
    >

      {/* ═══ 1. TOP SUMMARY ═══════════════════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="bg-[#354E5E] rounded-2xl px-8 pt-8 pb-6 text-white text-center"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">
          Your AI Maturity Score
        </p>

        {/* Score circle */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.1 }}
          className={`inline-flex items-center justify-center w-28 h-28 rounded-full ring-4 ${config.bg} ${config.ring} mb-4`}
        >
          <span className={`text-4xl font-black ${config.color}`}>{displayScore}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className={`text-2xl font-bold mb-1 ${config.color}`}
        >
          {score.maturityLevel}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-300 text-sm max-w-sm mx-auto"
        >
          Hi {firstName} — this is a directional snapshot across 6 AI dimensions.
        </motion.p>
      </motion.div>

      {/* ═══ 2. RADAR CHART ════════════════════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
      >
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5 text-center">
          Your dimension profile
        </h3>

        <div className="flex justify-center">
          <RadarChart dimensionScores={score.dimensionScores} size={300} />
        </div>

        {/* Dimension mini-list under chart */}
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2">
          {score.dimensionScores.map(ds => (
            <div key={ds.dimension} className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-600 truncate">{ds.label}</span>
              <span
                className="text-xs font-bold tabular-nums"
                style={{ color: ds.normalized >= 60 ? '#059669' : ds.normalized >= 40 ? '#d97706' : '#dc2626' }}
              >
                {ds.normalized}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══ 3. SHADOW AI FLAG ════════════════════════════════════ */}
      {score.shadowAI.triggered && (
        <motion.div variants={fadeUp}>
          <ShadowAIFlag shadowAI={score.shadowAI} />
        </motion.div>
      )}

      {/* ═══ 4. INSIGHT BLOCK ════════════════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="bg-white border-l-4 border-[#E8611A] rounded-r-2xl rounded-tl-2xl rounded-bl-none px-6 py-5 shadow-sm"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-[#E8611A] mb-2">
          What your score is telling you
        </p>
        <p className="text-gray-800 text-sm leading-relaxed mb-3">
          {config.insight}
        </p>
        <p className="text-xs font-semibold text-gray-500 italic">
          {config.urgency}
        </p>
      </motion.div>

      {/* ═══ 5. BOOK A CALL — PRIMARY CTA ════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="bg-[#354E5E] rounded-2xl p-7 text-white text-center"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Free · 20 minutes · No obligation
        </p>
        <h3 className="text-xl font-bold mb-2">
          Want to know what to do about it?
        </h3>
        <p className="text-gray-300 text-sm max-w-sm mx-auto mb-6">
          Book a free result review with an AI specialist. We walk through your
          radar, identify your biggest lever, and give you a clear first step.
        </p>
        <a
          href="https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('book_review_clicked', {
            quiz_variant:   'lite',
            maturity_level: score.maturityLevel,
            overall_score:  score.overall,
          })}
          className="inline-block px-8 py-3.5 bg-[#E8611A] hover:bg-orange-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-orange-900/30"
        >
          Book my free result review →
        </a>
        <p className="text-xs text-gray-500 mt-3">
          With Mark de Kock — AI Transformation Lead, Kirk &amp; Blackbeard
        </p>
      </motion.div>

      {/* ═══ 6. PRIMARY RECOMMENDATIONS ═════════════════════════ */}
      {primaryRecs.length > 0 && (
        <motion.div variants={fadeUp}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 px-1">
            Your priority actions
          </h3>
          <div className="space-y-3">
            {primaryRecs.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                onClick={() => trackEvent('recommendation_cta_clicked', {
                  dimension: rec.dimension,
                  priority:  rec.priority,
                })}
              >
                <RecommendationCard recommendation={rec} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ 7. SUPPORTING RECOMMENDATIONS ══════════════════════ */}
      {supportingRecs.length > 0 && (
        <motion.div variants={fadeUp}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 px-1">
            Also worth addressing
          </h3>
          <div className="space-y-3">
            {supportingRecs.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                onClick={() => trackEvent('recommendation_cta_clicked', {
                  dimension: rec.dimension,
                  priority:  rec.priority,
                })}
              >
                <RecommendationCard recommendation={rec} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ 8. FULL ASSESSMENT CTA (secondary) ═════════════════ */}
      <motion.div
        variants={fadeUp}
        className="border border-gray-200 rounded-2xl p-6 text-center bg-white"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Want your full picture?
        </p>
        <h3 className="text-base font-bold text-gray-900 mb-2">
          Take the 25-question full assessment
        </h3>
        <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
          Deeper scoring, a complete dimension breakdown and tailored recommendations
          across all 6 AI maturity areas — in about 15 minutes.
        </p>
        <a
          href="/quiz/extended"
          onClick={() => trackEvent('full_assessment_clicked', {
            source:         'lite_results',
            maturity_level: score.maturityLevel,
          })}
          className="inline-block px-6 py-2.5 bg-[#354E5E] hover:bg-[#2a3e4b] text-white font-semibold rounded-xl text-sm transition-colors"
        >
          Start the full assessment →
        </a>
        <p className="text-xs text-gray-400 mt-3">Free · No extra charge</p>
      </motion.div>

      {/* ═══ 9. REFERRAL (collapsible) ═══════════════════════════ */}
      <motion.div variants={fadeUp}>
        <button
          onClick={() => {
            const next = !referralOpen
            setReferralOpen(next)
            if (next) trackEvent('referral_form_started', { quiz_variant: 'lite' })
          }}
          className="w-full flex items-center justify-between text-left px-5 py-4 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">🤝</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">Know someone who should take this?</p>
              <p className="text-xs text-gray-400">Invite a colleague — takes 10 seconds</p>
            </div>
          </div>
          <span className="text-gray-400 text-sm font-medium">
            {referralOpen ? '↑ Hide' : '↓ Show'}
          </span>
        </button>

        {referralOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-2xl border border-gray-200 bg-white p-5">
              <ReferralSection
                referrerName={respondentName}
                referrerCompany={respondentCompany}
                referrerScore={score.overall}
                referrerLevel={score.maturityLevel}
              />
            </div>
          </motion.div>
        )}
      </motion.div>

    </motion.div>
  )
}
