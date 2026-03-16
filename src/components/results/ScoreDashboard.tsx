'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { QuizScore } from '@/types'
import type { Recommendation } from '@/lib/scoring/recommendations'
import { DimensionBreakdown } from './DimensionBreakdown'
import { RadarChart } from './RadarChart'
import { ShadowAIFlag } from './ShadowAIFlag'
import { RecommendationCard } from './RecommendationCard'
import { CalendlyEmbed } from './CalendlyEmbed'
import { ReferralSection } from './ReferralSection'
import { BenchmarkComparison, type BenchmarkData } from './BenchmarkComparison'

const MATURITY_CONFIG = {
  Unaware:       { color: 'text-red-500',    bg: 'bg-red-50',    ring: 'ring-red-200'    },
  Exploring:     { color: 'text-orange-500', bg: 'bg-orange-50', ring: 'ring-orange-200' },
  Experimenting: { color: 'text-yellow-500', bg: 'bg-yellow-50', ring: 'ring-yellow-200' },
  Scaling:       { color: 'text-teal-500',   bg: 'bg-teal-50',   ring: 'ring-teal-200'   },
  Leading:       { color: 'text-green-500',  bg: 'bg-green-50',  ring: 'ring-green-200'  },
}

// Animated count-up hook
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0)
  const raf = useRef<number | null>(null)
  const start = useRef<number | null>(null)

  useEffect(() => {
    start.current = null
    function step(ts: number) {
      if (!start.current) start.current = ts
      const progress = Math.min((ts - start.current) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration])

  return value
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
}

const CALENDLY_DISCOVERY = process.env.NEXT_PUBLIC_CALENDLY_DISCOVERY_URL ?? 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'
const CALENDLY_STRATEGY  = process.env.NEXT_PUBLIC_CALENDLY_STRATEGY_URL  ?? 'https://calendly.com/markiesbpm/ai-strategy-session'

function getCalendlyHref(overall: number) {
  return overall < 50 ? CALENDLY_DISCOVERY : CALENDLY_STRATEGY
}

interface ScoreDashboardProps {
  score: QuizScore
  recommendations: Recommendation[]
  /** 'lite' | 'extended' → Calendly button CTA; 'company' → inline CalendlyEmbed */
  quizVariant?: 'lite' | 'extended' | 'company'
  companySlug?: string
  respondentName: string
  respondentEmail: string
  respondentCompany?: string
  benchmarkData?: BenchmarkData
}

export function ScoreDashboard({
  score,
  recommendations,
  quizVariant = 'lite',
  companySlug,
  respondentName,
  respondentEmail,
  respondentCompany = '',
  benchmarkData,
}: ScoreDashboardProps) {
  const isLite    = quizVariant === 'lite'
  const isCompany = quizVariant === 'company'
  const config = MATURITY_CONFIG[score.maturityLevel]
  const displayScore = useCountUp(score.overall)
  const calendlyHref = getCalendlyHref(score.overall)

  return (
    <motion.div
      className="max-w-2xl mx-auto space-y-6 pb-16"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* ── Score hero ── */}
      <motion.div
        variants={fadeUp}
        className="bg-brand rounded-2xl p-8 text-center text-white"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Your AI Maturity Score
        </p>

        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
          className={`inline-flex items-center justify-center w-32 h-32 rounded-full ring-4 ${config.bg} ${config.ring} mb-4`}
        >
          <span className={`text-4xl font-black ${config.color}`}>{displayScore}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`text-2xl font-bold mb-1 ${config.color}`}
        >
          {score.maturityLevel}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-gray-300 text-sm max-w-sm mx-auto"
        >
          {maturityDescription(score.maturityLevel)}
        </motion.p>

        {isLite && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-5 p-3 bg-white bg-opacity-10 rounded-xl text-sm text-gray-300"
          >
            This is a directional score based on the Lite assessment.{' '}
            <strong className="text-white">
              Take the Full assessment for your canonical score and complete breakdown.
            </strong>
          </motion.div>
        )}
      </motion.div>

      {/* ── Cohort confidentiality block (company only) ── */}
      {isCompany && (
        <motion.div
          variants={fadeUp}
          className="bg-brand/5 border border-brand/20 rounded-2xl p-5"
        >
          <p className="text-sm font-semibold text-brand mb-1">Your responses are confidential</p>
          <p className="text-sm text-gray-600">
            Individual answers are never shared with your employer. Your input contributes to
            an anonymised team picture that helps identify collective priorities.
          </p>
        </motion.div>
      )}

      {/* ── Radar chart ── */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
        <RadarChart dimensionScores={score.dimensionScores} size={280} />
      </motion.div>

      {/* ── Shadow AI flag ── */}
      {score.shadowAI.triggered && (
        <motion.div variants={fadeUp}>
          <ShadowAIFlag shadowAI={score.shadowAI} />
        </motion.div>
      )}

      {/* ── Dimension breakdown ── */}
      <motion.div variants={fadeUp}>
        <DimensionBreakdown scores={score.dimensionScores} />
      </motion.div>

      {/* ── Benchmark ── */}
      {benchmarkData && (
        <motion.div variants={fadeUp}>
          <BenchmarkComparison yourScore={score.overall} benchmark={benchmarkData} />
        </motion.div>
      )}

      {/* ── Recommendations ── */}
      {recommendations.length > 0 && (
        <motion.div variants={fadeUp}>
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Recommendations for you
          </h3>
          <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <RecommendationCard
                  recommendation={rec}
                  ctaHref={calendlyHref}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Calendly embed (company quiz only) ── */}
      {isCompany && (
        <motion.div variants={fadeUp}>
          <CalendlyEmbed
            overallScore={score.overall}
            name={respondentName}
            email={respondentEmail}
          />
        </motion.div>
      )}

      {/* ── CTA block (extended public only) ── */}
      {!isCompany && !isLite && (
        <motion.div
          variants={fadeUp}
          className="bg-brand rounded-2xl p-6 text-white text-center"
        >
          <h3 className="text-lg font-bold mb-2">Ready to talk through your results?</h3>
          <p className="text-sm text-gray-300 mb-5">
            Book a free call with us to discuss your score, what it means
            for your organisation, and the clearest next steps.
          </p>
          <a
            href={calendlyHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2.5 bg-brand-accent hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Book your free call →
          </a>
          <p className="text-xs text-gray-400 mt-3">Free · No obligation · 20 minutes</p>
        </motion.div>
      )}

      {/* ── Referral ── */}
      <motion.div variants={fadeUp}>
        <ReferralSection
          referrerName={respondentName}
          referrerCompany={respondentCompany}
          referrerScore={score.overall}
          referrerLevel={score.maturityLevel}
          quizVariant={quizVariant}
          companySlug={companySlug}
        />
      </motion.div>
    </motion.div>
  )
}

function maturityDescription(level: string): string {
  const map: Record<string, string> = {
    Unaware:
      'AI is not yet on your radar. There are significant quick-win opportunities waiting to be unlocked.',
    Exploring:
      'You are beginning to explore AI. A clear strategy will help you move faster.',
    Experimenting:
      'You have some AI activity underway. The challenge now is scaling what works.',
    Scaling:
      'AI is embedded in key processes. Focus on governance, culture and compounding your advantage.',
    Leading:
      'AI is central to how you operate and compete. Keep investing in capability and staying ahead.',
  }
  return map[level] ?? ''
}
