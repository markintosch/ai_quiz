'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { ServiceDefinition, ServiceKey } from '@/lib/next-steps/recommend'

interface ServiceCardProps {
  service: ServiceDefinition
  responseId: string | null
  locale: string
  recommended?: boolean
}

// ── Icons ─────────────────────────────────────────────────────
function MessageCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
    </svg>
  )
}
function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}
function Code2Icon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m18 16 4-4-4-4"/>
      <path d="m6 8-4 4 4 4"/>
      <path d="m14.5 4-5 16"/>
    </svg>
  )
}
function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  )
}
function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  )
}

const SERVICE_ICONS = {
  intro_session:   MessageCircleIcon,
  intro_training:  BookOpenIcon,
  ai_coding:       Code2Icon,
  clevel_training: TargetIcon,
  custom_project:  WrenchIcon,
} as const

export function ServiceCard({ service, responseId, locale, recommended = false }: ServiceCardProps) {
  const Icon = SERVICE_ICONS[service.key]

  // Build the CTA element based on destination type
  function buildHref(): string {
    if (service.destinationType === 'calendly') {
      return service.destination
    }
    const r = responseId ? `?r=${responseId}` : ''
    return `/${locale}${service.destination}${r}`
  }

  const href = buildHref()
  const isExternal = service.destinationType === 'calendly'

  const ctaClasses = recommended
    ? 'inline-block w-full text-center px-5 py-3 bg-brand-accent hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-orange-900/20'
    : 'inline-block w-full text-center px-5 py-2.5 bg-brand hover:bg-brand-dark text-white font-medium rounded-xl text-sm transition-colors'

  const cardClasses = recommended
    ? 'bg-white rounded-2xl border-2 border-brand-accent shadow-lg p-6 flex flex-col gap-4'
    : 'bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4 hover:border-brand/40 transition-colors'

  return (
    <div className={cardClasses}>
      {recommended && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-accent/10 text-brand-accent text-xs font-semibold rounded-full uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
            Recommended for you
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0 text-brand-accent" />
        <div>
          <h3 className={`font-bold leading-snug ${recommended ? 'text-lg text-gray-900' : 'text-base text-gray-900'}`}>
            {service.title}
          </h3>
          <p className="text-xs text-brand-accent font-medium mt-0.5">{service.audience}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed flex-1">
        {service.description}
      </p>

      {isExternal ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={ctaClasses}
        >
          {service.ctaLabel}
        </a>
      ) : (
        <Link href={href} className={ctaClasses}>
          {service.ctaLabel}
        </Link>
      )}
    </div>
  )
}

// Animated wrapper used in the page client
export function AnimatedServiceCard({
  service,
  responseId,
  locale,
  recommended,
  delay = 0,
}: ServiceCardProps & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
    >
      <ServiceCard
        service={service}
        responseId={responseId}
        locale={locale}
        recommended={recommended}
      />
    </motion.div>
  )
}
