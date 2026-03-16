'use client'

import { useTranslations } from 'next-intl'
import type { Recommendation } from '@/lib/scoring/recommendations'

interface RecommendationCardProps {
  recommendation: Recommendation
  softCta?: boolean
  ctaHref?: string
}

export function RecommendationCard({ recommendation, softCta, ctaHref }: RecommendationCardProps) {
  const t = useTranslations('results')
  const isPrimary = recommendation.priority === 'primary'

  return (
    <div
      className={`rounded-2xl border p-6 ${
        isPrimary
          ? 'bg-brand text-white border-brand'
          : 'bg-white text-gray-900 border-gray-100 shadow-sm'
      }`}
    >
      {isPrimary && (
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">
          {t('primaryRec')}
        </span>
      )}
      <h4
        className={`text-base font-bold mb-2 ${
          isPrimary ? 'text-white' : 'text-gray-900'
        }`}
      >
        {recommendation.heading}
      </h4>
      <p
        className={`text-sm leading-relaxed mb-4 ${
          isPrimary ? 'text-white/80' : 'text-gray-600'
        }`}
      >
        {recommendation.body}
      </p>
      {ctaHref ? (
        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-block text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
            isPrimary
              ? 'bg-brand-accent text-white hover:bg-orange-700'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {softCta ? t('discussWithUs') : recommendation.cta}
        </a>
      ) : (
        <span
          className={`inline-block text-xs font-semibold px-4 py-2 rounded-lg ${
            isPrimary
              ? 'bg-brand-accent text-white'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {softCta ? t('discussWithUs') : recommendation.cta}
        </span>
      )}
    </div>
  )
}
