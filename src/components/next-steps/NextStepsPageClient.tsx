'use client'

import { motion } from 'framer-motion'
import { AnimatedServiceCard } from './ServiceCard'
import type { ServiceDefinition, ServiceKey } from '@/lib/next-steps/recommend'

interface NextStepsPageClientProps {
  responseId: string | null
  firstName: string | null
  score: number | null
  maturityLevel: string | null
  recommendedKey: ServiceKey
  services: ServiceDefinition[]
  locale: string
}

export function NextStepsPageClient({
  responseId,
  firstName,
  score,
  maturityLevel,
  recommendedKey,
  services,
  locale,
}: NextStepsPageClientProps) {
  const isPersonalised = !!firstName

  const recommended = services.find(s => s.key === recommendedKey)!
  const others = services.filter(s => s.key !== recommendedKey)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header band ─────────────────────────────────────────── */}
      <div className="bg-brand text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {isPersonalised ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">
                  Your next step
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-2">
                  Hi {firstName}, here&apos;s what we recommend based on your result
                </h1>
                {score !== null && maturityLevel && (
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium">
                      Score: {score}/100
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium capitalize">
                      {maturityLevel.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">
                  Work with us
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-2">
                  Explore how to work with us
                </h1>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">

        {/* Intro copy */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-2"
        >
          <h2 className="text-lg font-semibold text-gray-900">
            Turn your AI maturity insight into meaningful next steps
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Your assessment result is a strong starting point. The next step depends on what you want to achieve.
            Whether you want to better understand your outcome, build practical AI capability, align leadership,
            or move towards implementation — we offer follow-up sessions and tailored support to help you move forward.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Together with Ben, Frank, Mark and our wider network, we support individuals, teams and organisations
            with practical guidance, training and implementation support — from first orientation to strategic execution.
          </p>
        </motion.div>

        {/* ── Recommended service ─────────────────────────────────── */}
        <div>
          <AnimatedServiceCard
            service={recommended}
            responseId={responseId}
            locale={locale}
            recommended
            delay={0.15}
          />
        </div>

        {/* ── Divider ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="flex items-center gap-3"
        >
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Other ways we can help
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </motion.div>

        {/* ── Other services grid ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {others.map((service, i) => (
            <AnimatedServiceCard
              key={service.key}
              service={service}
              responseId={responseId}
              locale={locale}
              delay={0.3 + i * 0.07}
            />
          ))}
        </div>

        {/* ── Reassurance footer ───────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="text-center text-sm text-gray-500 pb-4"
        >
          Not every next step needs to be big — but it should be relevant.{' '}
          {recommendedKey !== 'intro_session' && (
            <>
              Not sure where to start?{' '}
              <a
                href={services.find(s => s.key === 'intro_session')?.destination}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand font-medium hover:underline"
              >
                Book a free introduction session →
              </a>
            </>
          )}
        </motion.p>
      </div>
    </div>
  )
}
