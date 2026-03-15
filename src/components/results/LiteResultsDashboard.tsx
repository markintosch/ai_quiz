'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import type { QuizScore } from '@/types'
import type { Recommendation } from '@/lib/scoring/recommendations'
import { RadarChart } from './RadarChart'
import { ShadowAIFlag } from './ShadowAIFlag'
import { RecommendationCard } from './RecommendationCard'
import { ReferralSection } from './ReferralSection'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
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
const MATURITY_COLORS: Record<string, { color: string; bg: string; ring: string }> = {
  Unaware:      { color: 'text-red-500',    bg: 'bg-red-50',    ring: 'ring-red-200'    },
  Exploring:    { color: 'text-orange-500', bg: 'bg-orange-50', ring: 'ring-orange-200' },
  Experimenting:{ color: 'text-yellow-600', bg: 'bg-yellow-50', ring: 'ring-yellow-200' },
  Scaling:      { color: 'text-teal-600',   bg: 'bg-teal-50',   ring: 'ring-teal-200'   },
  Leading:      { color: 'text-green-600',  bg: 'bg-green-50',  ring: 'ring-green-200'  },
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
  const t = useTranslations('results')
  const firstName  = respondentName?.trim().split(/\s+/)[0] || 'there'
  const config     = MATURITY_COLORS[score.maturityLevel] ?? MATURITY_COLORS.Exploring
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

  const delta = score.overall - 47

  return (
    <motion.div
      className="max-w-2xl mx-auto space-y-6 pb-20"
      variants={stagger}
      initial="hidden"
      animate="show"
    >

      {/* Language switcher */}
      <div className="flex justify-end mb-2">
        <LanguageSwitcher />
      </div>

      {/* ═══ 1. TOP SUMMARY ═══════════════════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="bg-[#354E5E] rounded-2xl px-8 pt-8 pb-6 text-white text-center"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">
          {t('scoreLabel')}
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
          {t('greeting', { firstName })}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mt-4 inline-flex items-center gap-3 bg-white/10 border border-white/10 rounded-xl px-4 py-2"
        >
          <span className="text-xs text-gray-400">{t('avgLabel')} <strong className="text-white">47</strong></span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            score.overall >= 47
              ? 'bg-green-500/20 text-green-300'
              : 'bg-red-500/20 text-red-300'
          }`}>
            {delta >= 0
              ? t('vsAvgPos', { delta })
              : t('vsAvgNeg', { delta })}
          </span>
        </motion.div>
      </motion.div>

      {/* ═══ 2. RADAR CHART ════════════════════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
      >
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5 text-center">
          {t('dimensionProfile')}
        </h3>

        <div className="flex justify-center">
          <RadarChart dimensionScores={score.dimensionScores} size={300} />
        </div>

        {/* Dimension mini-list under chart */}
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2">
          {score.dimensionScores.map(ds => (
            <div key={ds.dimension} className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-600 truncate">
                {t(`dimensionLabels.${ds.dimension}` as Parameters<typeof t>[0]) || ds.label}
              </span>
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
          {t('insightLabel')}
        </p>
        <p className="text-gray-800 text-sm leading-relaxed mb-3">
          {t(`maturityLevels.${score.maturityLevel}.insight` as Parameters<typeof t>[0])}
        </p>
        <p className="text-xs font-semibold text-gray-500 italic">
          {t(`maturityLevels.${score.maturityLevel}.urgency` as Parameters<typeof t>[0])}
        </p>
      </motion.div>

      {/* ═══ 5. PRIMARY RECOMMENDATIONS ═════════════════════════ */}
      {primaryRecs.length > 0 && (
        <motion.div variants={fadeUp}>
          {/* Org-level framing — shifts reader from "my score" to "my company's agenda" */}
          <p className="text-sm text-gray-500 italic mb-4 px-1">
            {t('orgPrioritiesIntro')}
          </p>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 px-1">
            {t('priorityActions')}
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
                <RecommendationCard recommendation={rec} softCta={true} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ 6. SUPPORTING RECOMMENDATIONS ══════════════════════ */}
      {supportingRecs.length > 0 && (
        <motion.div variants={fadeUp}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 px-1">
            {t('alsoWorth')}
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
                <RecommendationCard recommendation={rec} softCta={true} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ 7. BOOK A CALL — PRIMARY CTA ════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="bg-[#354E5E] rounded-2xl p-7 text-white"
      >
        {/* Person intro */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-[#E8611A]/50 flex-shrink-0 bg-[#2a3e4b] flex items-center justify-center">
            <img src="/mark-de-kock.jpg" alt="Mark de Kock" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Mark de Kock</p>
            <p className="text-[#E8611A] text-xs font-semibold">{t('bookReview.title')}</p>
            <p className="text-gray-400 text-xs">{t('bookReview.company')}</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs bg-white/10 border border-white/10 rounded-full px-3 py-1 text-gray-300">
              {t('bookReview.badge')}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-2">
          {t('bookReview.heading')}
        </h3>
        <p className="text-gray-300 text-sm mb-6 leading-relaxed">
          {t('bookReview.body')}
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
          className="inline-block w-full text-center px-8 py-3.5 bg-[#E8611A] hover:bg-orange-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-orange-900/30"
        >
          {t('bookReview.cta')}
        </a>

        {/* Training reference — one line, ambient, no hard sell */}
        <p className="text-center mt-4 text-xs text-gray-400">
          {t('bookReview.trainingRef')}{' '}
          <a
            href="https://handsonai.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#E8611A] hover:underline font-medium"
            onClick={() => trackEvent('training_ref_clicked', {
              maturity_level: score.maturityLevel,
              source: 'lite_results',
            })}
          >
            {t('bookReview.trainingRefLink')}
          </a>
        </p>
      </motion.div>

      {/* ═══ 8. FULL ASSESSMENT CTA (secondary) ═════════════════ */}
      <motion.div
        variants={fadeUp}
        className="border border-gray-200 rounded-2xl p-6 text-center bg-white"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          {t('fullAssessment.label')}
        </p>
        <h3 className="text-base font-bold text-gray-900 mb-2">
          {t('fullAssessment.heading')}
        </h3>
        <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
          {t('fullAssessment.body')}
        </p>
        <a
          href="/quiz/extended"
          onClick={() => trackEvent('full_assessment_clicked', {
            source:         'lite_results',
            maturity_level: score.maturityLevel,
          })}
          className="inline-block px-6 py-2.5 bg-[#354E5E] hover:bg-[#2a3e4b] text-white font-semibold rounded-xl text-sm transition-colors"
        >
          {t('fullAssessment.cta')}
        </a>
        <p className="text-xs text-gray-400 mt-3">{t('fullAssessment.free')}</p>
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
              <p className="text-sm font-semibold text-gray-800">{t('referral.heading')}</p>
              <p className="text-xs text-gray-400">{t('referral.sub')}</p>
            </div>
          </div>
          <span className="text-gray-400 text-sm font-medium">
            {referralOpen ? t('referral.hide') : t('referral.show')}
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
