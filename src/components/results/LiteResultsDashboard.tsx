'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
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
  responseId: string
  productKey?: string
  productName?: string
  scoreLabelOverride?: string
}

// ── Config ────────────────────────────────────────────────────
const MATURITY_COLORS: Record<string, { color: string; bg: string; ring: string }> = {
  // AI Maturity levels
  Unaware:      { color: 'text-red-500',    bg: 'bg-red-50',    ring: 'ring-red-200'    },
  Exploring:    { color: 'text-orange-500', bg: 'bg-orange-50', ring: 'ring-orange-200' },
  Experimenting:{ color: 'text-yellow-600', bg: 'bg-yellow-50', ring: 'ring-yellow-200' },
  Scaling:      { color: 'text-teal-600',   bg: 'bg-teal-50',   ring: 'ring-teal-200'   },
  Leading:      { color: 'text-green-600',  bg: 'bg-green-50',  ring: 'ring-green-200'  },
  // Fitness Readiness levels
  Startend:     { color: 'text-red-500',    bg: 'bg-red-50',    ring: 'ring-red-200'    },
  Opbouwend:    { color: 'text-orange-500', bg: 'bg-orange-50', ring: 'ring-orange-200' },
  Actief:       { color: 'text-yellow-600', bg: 'bg-yellow-50', ring: 'ring-yellow-200' },
  Gevorderd:    { color: 'text-teal-600',   bg: 'bg-teal-50',   ring: 'ring-teal-200'   },
  Performance:  { color: 'text-green-600',  bg: 'bg-green-50',  ring: 'ring-green-200'  },
  // PR Maturity levels (also shared with HR Readiness: Reactief, Bewust, Strategisch)
  Reactief:     { color: 'text-red-500',    bg: 'bg-red-50',    ring: 'ring-red-200'    },
  Bewust:       { color: 'text-orange-500', bg: 'bg-orange-50', ring: 'ring-orange-200' },
  Gepland:      { color: 'text-yellow-600', bg: 'bg-yellow-50', ring: 'ring-yellow-200' },
  Strategisch:  { color: 'text-teal-600',   bg: 'bg-teal-50',   ring: 'ring-teal-200'   },
  Leidend:      { color: 'text-green-600',  bg: 'bg-green-50',  ring: 'ring-green-200'  },
  // HR Readiness additional levels
  Structureel:  { color: 'text-yellow-500', bg: 'bg-yellow-50', ring: 'ring-yellow-200' },
  Proactief:    { color: 'text-teal-500',   bg: 'bg-teal-50',   ring: 'ring-teal-200'   },
  // UtrechtZorg / Zorgmarkt levels
  'Onder druk':             { color: 'text-red-500',    bg: 'bg-red-50',    ring: 'ring-red-200'    },
  'Kwetsbaar in transitie': { color: 'text-orange-500', bg: 'bg-orange-50', ring: 'ring-orange-200' },
  'In ontwikkeling':        { color: 'text-yellow-600', bg: 'bg-yellow-50', ring: 'ring-yellow-200' },
  'Toekomstbestendig':      { color: 'text-green-600',  bg: 'bg-green-50',  ring: 'ring-green-200'  },
  // Cloud Readiness levels
  'Ad Hoc':    { color: 'text-red-500',    bg: 'bg-red-50',    ring: 'ring-red-200'    },
  Developing:  { color: 'text-orange-500', bg: 'bg-orange-50', ring: 'ring-orange-200' },
  Defined:     { color: 'text-yellow-500', bg: 'bg-yellow-50', ring: 'ring-yellow-200' },
  Managed:     { color: 'text-teal-500',   bg: 'bg-teal-50',   ring: 'ring-teal-200'   },
  Optimising:  { color: 'text-green-500',  bg: 'bg-green-50',  ring: 'ring-green-200'  },
  // AI & M&A Readiness levels
  'At Risk':    { color: 'text-red-600',    bg: 'bg-red-50',    ring: 'ring-red-200'    },
  'Pre-Mature': { color: 'text-orange-500', bg: 'bg-orange-50', ring: 'ring-orange-200' },
  Emerging:     { color: 'text-yellow-600', bg: 'bg-yellow-50', ring: 'ring-yellow-200' },
  'Deal-Ready': { color: 'text-teal-600',   bg: 'bg-teal-50',   ring: 'ring-teal-200'   },
  Premium:      { color: 'text-green-600',  bg: 'bg-green-50',  ring: 'ring-green-200'  },
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

// ── Icons ─────────────────────────────────────────────────────
function Share2Icon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
    </svg>
  )
}

// ── Animation variants ────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

// ── Share results bar ─────────────────────────────────────────
function ShareResultsBar({ score, maturityLevel, responseId, locale, assessmentName }: { score: number; maturityLevel: string; responseId: string; locale: string; assessmentName?: string }) {
  const [copied, setCopied] = useState(false)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const resultsUrl = `${baseUrl}/${locale}/results/${responseId}`
  const name = assessmentName ?? 'AI Maturity Assessment'
  const linkedInText = encodeURIComponent(`I scored ${score}/100 on the ${name} — ${maturityLevel} level. Curious where your organisation stands?`)
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(resultsUrl)}&summary=${linkedInText}`

  function handleCopy() {
    navigator.clipboard.writeText(resultsUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Share your results</p>
      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Share2Icon className="w-4 h-4" />
          {copied ? 'Copied!' : 'Copy results link'}
        </button>
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('results_shared', { channel: 'linkedin', quiz_variant: 'lite' })}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0A66C2] text-white rounded-xl text-sm font-medium hover:bg-[#0958a8] transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Share on LinkedIn
        </a>
      </div>
    </div>
  )
}

// ── Dimension score colour ────────────────────────────────────
function dimColor(n: number) {
  if (n >= 60) return 'text-emerald-600'
  if (n >= 40) return 'text-amber-600'
  return 'text-red-600'
}

// ── Component ─────────────────────────────────────────────────
export function LiteResultsDashboard({
  score,
  recommendations,
  respondentName,
  respondentEmail,
  respondentCompany = '',
  responseId,
  productKey,
  productName,
  scoreLabelOverride,
}: LiteResultsDashboardProps) {
  const t = useTranslations('results')
  const locale = useLocale()
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
        className="bg-brand rounded-2xl px-8 pt-8 pb-6 text-white text-center"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-5">
          {scoreLabelOverride ?? t('scoreLabel')}
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
          className="text-white/80 text-sm max-w-sm mx-auto"
        >
          {t('greeting', { firstName })}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mt-4 inline-flex items-center gap-3 bg-white/10 border border-white/10 rounded-xl px-4 py-2"
        >
          <span className="text-xs text-white/60">{t('avgLabel')} <strong className="text-white">47</strong></span>
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
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-widest mb-5 text-center">
          {t('dimensionProfile')}
        </h3>

        <div className="flex justify-center">
          <RadarChart dimensionScores={score.dimensionScores} size={300} />
        </div>

        {/* Dimension animated bars */}
        <div className="mt-5 space-y-3">
          {score.dimensionScores.map((ds, i) => (
            <motion.div
              key={ds.dimension}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">
                  {t(`dimensionLabels.${ds.dimension}` as Parameters<typeof t>[0]) || ds.label}
                </span>
                <span className={`text-xs font-bold tabular-nums ${dimColor(ds.normalized)}`}>
                  {ds.normalized}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    ds.normalized >= 60 ? 'bg-emerald-500' :
                    ds.normalized >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${ds.normalized}%` }}
                  transition={{ delay: i * 0.08 + 0.2, duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
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
        className="bg-white border-l-4 border-brand-accent rounded-r-2xl rounded-tl-2xl rounded-bl-none px-6 py-5 shadow-sm"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">
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
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-3 px-1">
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
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-3 px-1">
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

      {/* ═══ 7. NEXT STEPS CTA — PRIMARY ═══════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="bg-brand rounded-2xl p-7 text-white text-center"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3">
          Your recommended next step
        </p>
        <h3 className="text-xl font-bold mb-2">
          Ready to see where to go from here?
        </h3>
        <p className="text-white/80 text-sm mb-6 leading-relaxed">
          Based on your score and profile, we&apos;ve put together a set of tailored options —
          from a quick orientation call to hands-on programmes and implementation support.
        </p>
        <a
          href={`/${locale}/next-steps?r=${responseId}`}
          onClick={() => trackEvent('next_steps_clicked', {
            quiz_variant:   'lite',
            maturity_level: score.maturityLevel,
            overall_score:  score.overall,
          })}
          className="inline-block w-full text-center px-8 py-3.5 bg-brand-accent hover:bg-orange-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-orange-900/30"
        >
          See your recommended next steps →
        </a>
        <p className="text-center mt-3 text-xs text-white/50">
          Free · No obligation · Takes 2 minutes to explore
        </p>
      </motion.div>

      {/* ═══ 8. FULL ASSESSMENT CTA (secondary) ═════════════════ */}
      {productKey !== 'fitness_readiness' && productKey !== 'pr_maturity' && (
        <motion.div
          variants={fadeUp}
          className="border border-gray-200 rounded-2xl p-6 text-center bg-white"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">
            {t('fullAssessment.label')}
          </p>
          <h3 className="text-base font-bold text-gray-900 mb-2">
            {t('fullAssessment.heading')}
          </h3>
          <p className="text-sm text-gray-600 mb-5 max-w-sm mx-auto">
            {t('fullAssessment.body')}
          </p>
          <a
            href="/a/extended"
            onClick={() => trackEvent('full_assessment_clicked', {
              source:         'lite_results',
              maturity_level: score.maturityLevel,
            })}
            className="inline-block px-6 py-2.5 bg-brand hover:bg-brand-light text-white font-semibold rounded-xl text-sm transition-colors"
          >
            {t('fullAssessment.cta')}
          </a>
          <p className="text-xs text-gray-500 mt-3">{t('fullAssessment.free')}</p>
        </motion.div>
      )}

      {/* ═══ 9. SHARE RESULTS ════════════════════════════════════ */}
      <motion.div variants={fadeUp}>
        <ShareResultsBar score={score.overall} maturityLevel={score.maturityLevel} responseId={responseId} locale={locale} assessmentName={productName} />
      </motion.div>

      {/* ═══ 10. REFERRAL (collapsible) ══════════════════════════ */}
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
            <Share2Icon className="w-5 h-5 flex-shrink-0 text-gray-500" />
            <div>
              <p className="text-sm font-semibold text-gray-800">{t('referral.heading')}</p>
              <p className="text-xs text-gray-500">{t('referral.sub')}</p>
            </div>
          </div>
          <span className="text-gray-500 text-sm font-medium">
            {referralOpen ? t('referral.hide') : t('referral.show')}
          </span>
        </button>

        <AnimatePresence>
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
        </AnimatePresence>
      </motion.div>

    </motion.div>
  )
}
