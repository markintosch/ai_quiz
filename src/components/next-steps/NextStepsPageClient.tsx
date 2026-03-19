'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import type { ServiceDefinition, ServiceKey, ScoreBand } from '@/lib/next-steps/recommend'
import { getScoreBand, getRecommendationWhy } from '@/lib/next-steps/recommend'

interface NextStepsPageClientProps {
  responseId: string | null
  firstName: string | null
  score: number | null
  maturityLevel: string | null
  recommendedKey: ServiceKey
  secondaryKey: ServiceKey
  services: ServiceDefinition[]
  locale: string
}

const MATURITY_COLOUR: Record<string, string> = {
  Unaware:       'bg-red-100 text-red-600',
  Exploring:     'bg-orange-100 text-orange-600',
  Experimenting: 'bg-yellow-100 text-yellow-700',
  Scaling:       'bg-teal-100 text-teal-700',
  Leading:       'bg-green-100 text-green-700',
}

const SCORE_BAND_HEADING: Record<ScoreBand, string> = {
  low:  'Your AI journey is just beginning — here is the smartest first step.',
  mid:  'You have real AI activity underway — here is how to accelerate it.',
  high: 'You are ahead of most organisations — here is how to stay that way.',
}

// ── Check icon ───────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── CTA builder ───────────────────────────────────────────────────────────────
function buildHref(service: ServiceDefinition, responseId: string | null, locale: string): string {
  if (service.destinationType === 'calendly') return service.destination
  const r = responseId ? `?r=${responseId}` : ''
  return `/${locale}${service.destination}${r}`
}

// ── Hero recommendation card ──────────────────────────────────────────────────
function HeroCard({
  service,
  why,
  responseId,
  locale,
}: {
  service: ServiceDefinition
  why: string
  responseId: string | null
  locale: string
}) {
  const href = buildHref(service, responseId, locale)
  const isExternal = service.destinationType === 'calendly'

  return (
    <div className="bg-white rounded-2xl border-2 border-brand-accent shadow-xl overflow-hidden">
      {/* Accent top bar */}
      <div className="h-1.5 bg-brand-gradient" />

      <div className="p-6 sm:p-8 space-y-5">
        {/* Label */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-accent/10 text-brand-accent text-xs font-bold rounded-full uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
            Recommended next step
          </span>
        </div>

        {/* Title + why */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{service.title}</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{why}</p>
        </div>

        {/* Benefits */}
        <ul className="space-y-2">
          {service.benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckIcon />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {/* CTA + trust */}
        <div className="space-y-2 pt-1">
          {isExternal ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-6 py-3.5 bg-brand-accent hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-orange-900/20"
            >
              {service.ctaLabel}
            </a>
          ) : (
            <Link
              href={href}
              className="block w-full text-center px-6 py-3.5 bg-brand-accent hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-orange-900/20"
            >
              {service.ctaLabel}
            </Link>
          )}
          <p className="text-center text-xs text-gray-400">{service.trustCopy}</p>
        </div>
      </div>
    </div>
  )
}

// ── Compact secondary card ────────────────────────────────────────────────────
function CompactCard({
  service,
  responseId,
  locale,
}: {
  service: ServiceDefinition
  responseId: string | null
  locale: string
}) {
  const href = buildHref(service, responseId, locale)
  const isExternal = service.destinationType === 'calendly'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 hover:border-brand/40 hover:shadow-sm transition-all">
      <div>
        <h3 className="font-bold text-gray-900 text-sm mb-0.5">{service.title}</h3>
        <p className="text-gray-500 text-xs leading-relaxed">{service.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
        <span><span className="font-medium text-gray-600">For:</span> {service.audience}</span>
        <span><span className="font-medium text-gray-600">Format:</span> {service.format}</span>
        <span className="col-span-2"><span className="font-medium text-gray-600">Best for:</span> {service.bestFor}</span>
      </div>

      {isExternal ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto block w-full text-center px-4 py-2.5 bg-brand hover:bg-brand-dark text-white font-medium rounded-lg text-xs transition-colors"
        >
          {service.ctaLabel}
        </a>
      ) : (
        <Link
          href={href}
          className="mt-auto block w-full text-center px-4 py-2.5 bg-brand hover:bg-brand-dark text-white font-medium rounded-lg text-xs transition-colors"
        >
          {service.ctaLabel}
        </Link>
      )}
    </div>
  )
}

// ── Not ready fallback ────────────────────────────────────────────────────────
function NotReadySection({ locale }: { locale: string }) {
  const [email, setEmail]     = useState('')
  const [name, setName]       = useState('')
  const [submitted, setSubmit] = useState(false)
  const [loading, setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // Submit to existing interest API
    try {
      await fetch(`/${locale}/api/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
    } catch { /* ignore */ }
    setLoading(false)
    setSubmit(true)
  }

  if (submitted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
        <p className="text-gray-700 font-medium text-sm mb-1">Got it — we'll be in touch.</p>
        <p className="text-gray-500 text-xs">No spam. Just relevant updates when the timing makes sense.</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
      <p className="text-sm font-semibold text-gray-700 mb-1">Not ready for a call yet?</p>
      <p className="text-xs text-gray-500 mb-4">Leave your details and we'll reach out when the timing is right for you.</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          placeholder="Your name"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors whitespace-nowrap disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Stay in touch'}
        </button>
      </form>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function NextStepsPageClient({
  responseId,
  firstName,
  score,
  maturityLevel,
  recommendedKey,
  secondaryKey,
  services,
  locale,
}: NextStepsPageClientProps) {
  const band: ScoreBand = score !== null ? getScoreBand(score) : 'low'
  const recommended = services.find(s => s.key === recommendedKey)!
  const secondary   = services.find(s => s.key === secondaryKey)!
  const why = getRecommendationWhy(recommendedKey, band)
  const maturityClass = maturityLevel ? (MATURITY_COLOUR[maturityLevel] ?? 'bg-gray-100 text-gray-600') : 'bg-gray-100 text-gray-600'

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Section 1: Result summary ─────────────────────────────── */}
      <div className="bg-brand text-white py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">
              Your result
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              {score !== null && (
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center ring-2 ring-white/20">
                    <span className="text-xl font-black tabular-nums">{score}</span>
                  </div>
                  <div>
                    <p className="text-xs text-white/60">out of 100</p>
                    {maturityLevel && (
                      <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${maturityClass}`}>
                        {maturityLevel}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold leading-snug mb-1">
              {firstName ? `${firstName}, ` : ''}{score !== null ? SCORE_BAND_HEADING[band] : 'Here are your options.'}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* ── Section 2: Hero recommendation ──────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <HeroCard
            service={recommended}
            why={why}
            responseId={responseId}
            locale={locale}
          />
        </motion.div>

        {/* ── Section 3: Other relevant options ───────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Other relevant options
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CompactCard service={secondary} responseId={responseId} locale={locale} />
            {/* Fallback third card — the intro session unless it's already primary/secondary */}
            {recommendedKey !== 'intro_session' && secondaryKey !== 'intro_session' && (() => {
              const fallback = services.find(s => s.key === 'intro_session')
              return fallback ? <CompactCard service={fallback} responseId={responseId} locale={locale} /> : null
            })()}
          </div>
        </motion.div>

        {/* ── Section 4: Not ready yet ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.35 }}
        >
          <NotReadySection locale={locale} />
        </motion.div>

      </div>
    </div>
  )
}
