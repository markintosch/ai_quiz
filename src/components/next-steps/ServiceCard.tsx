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

const SERVICE_ICONS: Record<ServiceKey, string> = {
  intro_session:   '💬',
  intro_training:  '🎓',
  ai_coding:       '⌨️',
  clevel_training: '🎯',
  custom_project:  '🔧',
}

export function ServiceCard({ service, responseId, locale, recommended = false }: ServiceCardProps) {
  const icon = SERVICE_ICONS[service.key]

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
        <span className="text-2xl mt-0.5 select-none">{icon}</span>
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
