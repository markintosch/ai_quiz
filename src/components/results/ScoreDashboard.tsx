'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import type { QuizScore } from '@/types'
import { getNextStepsCopy, type Recommendation } from '@/lib/scoring/recommendations'
import type { ProductUIConfig } from '@/products/types'
import { resolveCalendlyUrl } from '@/products/types'
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
  Experimenting: { color: 'text-yellow-600', bg: 'bg-yellow-50', ring: 'ring-yellow-200' },
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

// ── Share results bar (extended public only) ───────────────────────────────
function ShareResultsBar({ score, maturityLevel, responseId, locale, assessmentName }: {
  score: number
  maturityLevel: string
  responseId?: string
  locale: string
  assessmentName?: string
}) {
  const [copied, setCopied] = useState(false)
  const resultsPath = responseId ? `/${locale}/results/${responseId}` : `/${locale}`
  const resultsUrl = typeof window !== 'undefined' ? `${window.location.origin}${resultsPath}` : ''
  const name = assessmentName ?? 'AI Maturity Assessment'

  // Locale-aware share copy
  const SHARE_HEADING = locale === 'nl' ? 'Deel je resultaat'
                      : locale === 'fr' ? 'Partagez votre résultat'
                      : 'Share your results'
  const COPY_LABEL    = locale === 'nl' ? 'Kopieer link naar resultaat'
                      : locale === 'fr' ? 'Copier le lien des résultats'
                      : 'Copy results link'
  const COPIED_LABEL  = locale === 'nl' ? 'Link gekopieerd!'
                      : locale === 'fr' ? 'Lien copié !'
                      : 'Link copied!'
  const LINKEDIN_LABEL = locale === 'nl' ? 'Deel op LinkedIn'
                       : locale === 'fr' ? 'Partager sur LinkedIn'
                       : 'Share on LinkedIn'
  const LINKEDIN_TEXT  = locale === 'nl'
    ? `Ik scoorde ${score}/100 op de ${name} — niveau ${maturityLevel}. Benieuwd waar jouw organisatie staat?`
    : locale === 'fr'
    ? `J'ai obtenu ${score}/100 à l'${name} — niveau ${maturityLevel}. Curieux de savoir où se situe votre organisation ?`
    : `I scored ${score}/100 on the ${name} — ${maturityLevel} level. Curious where your organisation stands?`

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(resultsUrl)}&summary=${encodeURIComponent(LINKEDIN_TEXT)}`

  function handleCopy() {
    navigator.clipboard.writeText(resultsUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
      <p className="text-sm font-semibold text-gray-700 mb-3">{SHARE_HEADING}</p>
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? COPIED_LABEL : COPY_LABEL}
        </button>
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#0A66C2]/30 text-sm font-medium text-[#0A66C2] hover:bg-[#0A66C2]/5 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          {LINKEDIN_LABEL}
        </a>
      </div>
    </div>
  )
}

const CALENDLY_DISCOVERY = process.env.NEXT_PUBLIC_CALENDLY_DISCOVERY_URL ?? 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'
const CALENDLY_STRATEGY  = process.env.NEXT_PUBLIC_CALENDLY_STRATEGY_URL  ?? 'https://calendly.com/markiesbpm/ai-strategy-session'

function getCalendlyHref(overall: number) {
  return overall < 50 ? CALENDLY_DISCOVERY : CALENDLY_STRATEGY
}

interface ScoreDashboardProps {
  score: QuizScore
  recommendations: Recommendation[]
  /** 'lite' | 'extended' → next-steps CTA; 'company' → inline CalendlyEmbed */
  quizVariant?: 'lite' | 'extended' | 'company'
  companySlug?: string
  respondentName: string
  respondentEmail: string
  respondentCompany?: string
  benchmarkData?: BenchmarkData
  /** Serializable product config — drives maturity colours, descriptions, Calendly routing */
  productUI?: ProductUIConfig
  responseId?: string
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
  productUI,
  responseId,
}: ScoreDashboardProps) {
  const isLite    = quizVariant === 'lite'
  const isCompany = quizVariant === 'company'
  const locale    = useLocale()
  const t         = useTranslations('results')

  // "Wat jouw score je vertelt" — relevant for every variant, not just lite
  const insightTitle = locale === 'nl'
    ? 'Wat jouw score je vertelt'
    : locale === 'fr'
    ? 'Ce que votre score vous dit'
    : 'What your score tells you'

  // Locale-aware confidentiality block
  const confidentialityTitle = locale === 'nl'
    ? 'Uw antwoorden zijn vertrouwelijk'
    : locale === 'fr'
    ? 'Vos réponses sont confidentielles'
    : 'Your responses are confidential'
  const confidentialityBody = locale === 'nl'
    ? 'Individuele antwoorden worden nooit gedeeld met uw werkgever. Uw input draagt bij aan een geanonimiseerd teambeeld dat gezamenlijke prioriteiten zichtbaar maakt.'
    : locale === 'fr'
    ? 'Les réponses individuelles ne sont jamais partagées avec votre employeur. Votre contribution crée une image collective anonymisée qui révèle les priorités communes.'
    : 'Individual answers are never shared with your employer. Your input contributes to an anonymised team picture that helps identify collective priorities.'

  // Resolve maturity colours — from product config when available, else hardcoded defaults
  const threshold = productUI?.maturityThresholds.find(t => t.level === score.maturityLevel)
  const config = threshold
    ? { color: threshold.colorClass, bg: threshold.bgClass, ring: threshold.ringClass }
    : (MATURITY_CONFIG[score.maturityLevel as keyof typeof MATURITY_CONFIG] ?? MATURITY_CONFIG.Exploring)

  // Resolve description and Calendly URL from product config when available
  const description = productUI
    ? (productUI.maturityDescriptions[score.maturityLevel] ?? '')
    : maturityDescription(score.maturityLevel)

  const calendlyHref = productUI
    ? resolveCalendlyUrl(score.overall, productUI.calendlyRules)
    : getCalendlyHref(score.overall)

  const displayScore = useCountUp(score.overall)

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
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-4">
          {productUI?.name ?? 'AI Maturity Score'}
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
          className="text-white/80 text-sm max-w-sm mx-auto"
        >
          {description}
        </motion.p>

        {isLite && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-5 p-3 bg-white bg-opacity-10 rounded-xl text-sm text-white/80"
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
          <p className="text-sm font-semibold text-brand mb-1">{confidentialityTitle}</p>
          <p className="text-sm text-gray-600">{confidentialityBody}</p>
        </motion.div>
      )}

      {/* ── "Wat jouw score je vertelt" — every variant ── */}
      <motion.div
        variants={fadeUp}
        className="bg-amber-50 rounded-2xl p-5 border-l-4 border-brand-accent"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-2">
          {insightTitle}
        </p>
        <p className="text-gray-800 text-sm leading-relaxed mb-3">
          {t(`maturityLevels.${score.maturityLevel}.insight` as Parameters<typeof t>[0])}
        </p>
        <p className="text-xs font-semibold text-gray-500 italic">
          {t(`maturityLevels.${score.maturityLevel}.urgency` as Parameters<typeof t>[0])}
        </p>
      </motion.div>

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
            {locale === 'nl' ? 'Aanbevelingen voor u' : locale === 'fr' ? 'Recommandations pour vous' : 'Recommendations for you'}
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
                  ctaHref={rec.ctaHref ?? calendlyHref}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Calendly embed (company quiz only) ── */}
      {isCompany && (
        <motion.div variants={fadeUp} className="space-y-4">
          <CalendlyEmbed
            overallScore={score.overall}
            name={respondentName}
            email={respondentEmail}
            calendlyUrl={productUI?.key !== 'ai_maturity' ? calendlyHref : undefined}
          />
          {/* Secondary next-steps link — AI maturity only (Brand PWRD Media page) */}
          {productUI?.key === 'ai_maturity' && (
            <p className="text-center text-sm text-gray-500">
              Prefer to explore options at your own pace?{' '}
              <a
                href={`/${locale}/next-steps${responseId ? `?r=${responseId}` : ''}`}
                className="text-brand font-medium hover:underline"
              >
                See all ways to work with us →
              </a>
            </p>
          )}
        </motion.div>
      )}

      {/* ── Next-steps CTA (extended public only) — maturity-band aware ── */}
      {!isCompany && !isLite && (() => {
        const ns = getNextStepsCopy(score.maturityLevel, locale)
        return (
          <motion.div
            variants={fadeUp}
            className="bg-brand rounded-2xl p-6 text-white text-center"
          >
            <h3 className="text-lg font-bold mb-2">{ns.heading}</h3>
            <p className="text-sm text-white/80 mb-5">{ns.body}</p>
            <a
              href={`/${locale}/next-steps${responseId ? `?r=${responseId}` : ''}`}
              className="inline-block px-6 py-2.5 bg-brand-accent hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              {ns.cta}
            </a>
            <p className="text-xs text-white/60 mt-3">{ns.trust}</p>
          </motion.div>
        )
      })()}

      {/* ── Share results (extended public only) ── */}
      {!isCompany && !isLite && (
        <motion.div variants={fadeUp}>
          <ShareResultsBar
            score={score.overall}
            maturityLevel={score.maturityLevel}
            responseId={responseId}
            locale={locale}
            assessmentName={productUI?.name}
          />
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
