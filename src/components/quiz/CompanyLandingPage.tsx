'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { QuizEngine } from './QuizEngine'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

// ── Dimension icons ───────────────────────────────────────────
function CompassIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  )
}
function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
    </svg>
  )
}
function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M3 5v14a9 3 0 0 0 18 0V5"/>
      <path d="M3 12a9 3 0 0 0 18 0"/>
    </svg>
  )
}
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    </svg>
  )
}
function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

const DIMENSION_ICONS = [CompassIcon, ZapIcon, DatabaseIcon, UsersIcon, ShieldIcon, EyeIcon]

// ── Access code gate ──────────────────────────────────────────
function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

interface AccessCodeGateProps {
  accessCode: string
  slug: string
  accentColor: string
  displayName: string
  logoUrl: string | null
  onUnlock: () => void
}

function AccessCodeGate({ accessCode, slug, accentColor, displayName, logoUrl, onUnlock }: AccessCodeGateProps) {
  const [value, setValue] = useState('')
  const [wrong, setWrong] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (value.trim() === accessCode.trim()) {
      try { localStorage.setItem(`kb_access_${slug}`, '1') } catch { /* ignore */ }
      onUnlock()
    } else {
      setWrong(true)
      setShakeKey((k) => k + 1)
      setValue('')
    }
  }

  return (
    <div className="min-h-screen bg-brand flex flex-col items-center justify-center px-6">
      <motion.div
        key={shakeKey}
        animate={wrong ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        onAnimationComplete={() => setWrong(false)}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={displayName} className="h-10 object-contain mx-auto mb-4" />
          ) : (
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: accentColor }}>
              {displayName}
            </p>
          )}
          <div className="flex justify-center mb-4">
            <LockIcon className="w-8 h-8 text-white/40" />
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">Access required</h1>
          <p className="text-white/60 text-sm">Enter the access code to start the assessment</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setWrong(false) }}
            placeholder="Access code"
            autoFocus
            autoComplete="off"
            className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white placeholder-white/40 text-center text-base tracking-widest focus:outline-none focus:ring-2 transition-colors ${
              wrong ? 'border-red-400 focus:ring-red-400/50' : 'border-white/20 focus:ring-white/30'
            }`}
          />
          {wrong && (
            <p className="text-red-400 text-sm text-center">Incorrect access code. Try again.</p>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            Continue →
          </button>
        </form>

        <p className="text-white/30 text-xs text-center mt-6">
          Contact your project lead if you need the access code.
        </p>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────

interface CompanyLandingPageProps {
  name: string
  slug: string
  logoUrl: string | null
  accentColor: string
  welcomeMessage: string | null
  excludedCodes: string[]
  questionCount: number
  /** Product key forwarded to QuizEngine for multi-product routing */
  productKey?: string
  /** Optional access code — if set, a gate is shown before the landing page */
  accessCode?: string | null
}

export function CompanyLandingPage({
  name,
  slug,
  logoUrl,
  accentColor,
  welcomeMessage,
  excludedCodes,
  questionCount,
  productKey,
  accessCode,
}: CompanyLandingPageProps) {
  const [started, setStarted] = useState(false)
  // Gate: false = locked, true = unlocked. If no code required, start unlocked.
  const [unlocked, setUnlocked] = useState(!accessCode)

  // On mount: check localStorage — skip the gate if already unlocked in this browser
  useEffect(() => {
    try {
      if (localStorage.getItem(`kb_access_${slug}`) === '1') setUnlocked(true)
    } catch { /* ignore */ }
  }, [slug])

  const t = useTranslations('company')

  // Display name: replace underscores with spaces for readability
  const displayName = name.replace(/_/g, ' ')

  // Dimension labels from translations
  const dimensionLabels = t.raw('dimensions') as string[]
  const dimensions = DIMENSION_ICONS.map((Icon, i) => ({
    Icon,
    label: dimensionLabels[i] ?? '',
  }))

  const ctaLabel = displayName
    ? t('cta', { name: displayName })
    : t('ctaFallback')

  const headingMiddle = displayName ? (
    <>
      {t('heading1')}{' '}
      <span style={{ color: accentColor }}>{displayName}</span>
      {' '}{t('heading2')}
    </>
  ) : (
    <>{t('headingFallback')}</>
  )

  // Show access gate before landing page if code is required and not yet unlocked
  if (!unlocked) {
    return (
      <AccessCodeGate
        accessCode={accessCode!}
        slug={slug}
        accentColor={accentColor}
        displayName={displayName}
        logoUrl={logoUrl}
        onUnlock={() => setUnlocked(true)}
      />
    )
  }

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
              <div className="flex items-center gap-4">
                <LanguageSwitcher variant="dark" />
                <p className="text-xs text-white/60 font-medium">{t('poweredBy')}</p>
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="max-w-3xl mx-auto px-6 pt-20 pb-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              {/* 1. Eyebrow badge */}
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border"
                style={{ color: accentColor, borderColor: `${accentColor}40`, backgroundColor: `${accentColor}15` }}
              >
                {displayName ? `${displayName} · ${t('badge')}` : t('badge')}
              </span>

              {/* 2. Headline */}
              <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                {headingMiddle}
              </h1>

              {/* 3. Intro paragraph */}
              <p className="text-white/80 text-lg max-w-xl mx-auto mb-5 leading-relaxed">
                {welcomeMessage ?? t('defaultWelcome', { name: displayName })}
              </p>

              {/* 4. Proof line — prominent */}
              <p
                className="text-sm font-semibold mb-8 tracking-wide"
                style={{ color: accentColor }}
              >
                {t('meta', { count: questionCount })}
              </p>

              {/* 5. CTA button */}
              <motion.button
                onClick={() => setStarted(true)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 text-white font-bold text-lg rounded-xl shadow-xl transition-colors"
                style={{ backgroundColor: accentColor }}
              >
                {ctaLabel}
              </motion.button>

              {/* 6. Confidentiality note */}
              <p className="text-xs text-white/60 mt-4">
                {t('confidentiality')}
              </p>

              {/* 7. Value line */}
              <p className="text-white/70 text-sm mt-3 max-w-md mx-auto leading-relaxed">
                {t('valueLine')}
              </p>
            </motion.div>
          </div>

          {/* 8. What we assess tiles */}
          <div className="max-w-3xl mx-auto px-6 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <p className="text-center text-xs font-bold uppercase tracking-widest text-white/60 mb-6">
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
                    <d.Icon className="w-5 h-5 flex-shrink-0 text-white/70" />
                    <span className="text-sm font-medium text-white/80">{d.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Trust footer */}
          <div className="border-t border-white/10 px-6 py-6 text-center">
            <p className="text-xs text-white/60">
              {t('gdpr')}{' '}
              <a href="/privacy" className="underline hover:text-white">{t('privacyLink')}</a>
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
              <div className="flex items-center gap-3">
                <LanguageSwitcher variant="light" />
                <p className="text-xs text-gray-600">{t('quizHeader')}</p>
              </div>
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
              productKey={productKey}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
