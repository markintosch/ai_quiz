'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { QuizEngine } from './QuizEngine'

const DIMENSION_ICONS = ['🧭', '⚡', '🗄️', '🧑‍💻', '🛡️', '🔍']

interface CompanyLandingPageProps {
  name: string
  slug: string
  logoUrl: string | null
  accentColor: string
  welcomeMessage: string | null
  excludedCodes: string[]
  questionCount: number
}

export function CompanyLandingPage({
  name,
  slug,
  logoUrl,
  accentColor,
  welcomeMessage,
  excludedCodes,
  questionCount,
}: CompanyLandingPageProps) {
  const [started, setStarted] = useState(false)
  const t = useTranslations('company')

  // Display name: replace underscores with spaces for readability
  const displayName = name.replace(/_/g, ' ')

  // Dimension labels from translations
  const dimensionLabels = t.raw('dimensions') as string[]
  const dimensions = DIMENSION_ICONS.map((icon, i) => ({
    icon,
    label: dimensionLabels[i] ?? '',
  }))

  return (
    <AnimatePresence mode="wait">
      {!started ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35 }}
          className="min-h-screen bg-brand text-white"
        >
          {/* Header bar */}
          <div className="border-b border-white/10 px-6 py-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={displayName} className="h-8 object-contain" />
              ) : (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>{displayName}</p>
                </div>
              )}
              <p className="text-xs text-gray-500 font-medium">{t('poweredBy')}</p>
            </div>
          </div>

          {/* Hero */}
          <div className="max-w-3xl mx-auto px-6 pt-20 pb-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border"
                style={{ color: accentColor, borderColor: `${accentColor}40`, backgroundColor: `${accentColor}15` }}
              >
                {displayName} · {t('badge')}
              </span>

              <h1 className="text-4xl md:text-5xl font-black mb-5 leading-tight">
                {t('heading1')}{' '}
                <span style={{ color: accentColor }}>{displayName}</span>
                {' '}{t('heading2')}
              </h1>

              <p className="text-gray-300 text-lg max-w-xl mx-auto mb-4 leading-relaxed">
                {welcomeMessage ?? t('defaultWelcome', { name: displayName })}
              </p>

              <p className="text-gray-500 text-sm mb-10">
                {t('meta', { count: questionCount })}
              </p>

              <motion.button
                onClick={() => setStarted(true)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 text-white font-bold text-lg rounded-xl shadow-xl transition-colors"
                style={{ backgroundColor: accentColor }}
              >
                {t('cta')}
              </motion.button>
            </motion.div>
          </div>

          {/* What we measure */}
          <div className="max-w-3xl mx-auto px-6 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
                {t('whatWeMeasure')}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {dimensions.map((d, i) => (
                  <motion.div
                    key={d.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.06 }}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  >
                    <span className="text-xl">{d.icon}</span>
                    <span className="text-sm font-medium text-gray-300">{d.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Trust footer */}
          <div className="border-t border-white/10 px-6 py-6 text-center">
            <p className="text-xs text-gray-600">
              {t('gdpr')}{' '}
              <a href="/privacy" className="underline hover:text-gray-400">{t('privacyLink')}</a>
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="quiz"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen bg-gray-50"
        >
          {/* Slim branded header */}
          <div className="border-b border-gray-100 bg-white px-6 py-3">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={displayName} className="h-6 object-contain" />
              ) : (
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>{displayName}</p>
              )}
              <p className="text-xs text-gray-400">{t('quizHeader')}</p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto px-4 py-10">
            <QuizEngine
              version="full"
              leadCapture="pre"
              companySlug={slug}
              companyName={name}
              excludedCodes={excludedCodes}
              accentColor={accentColor}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
