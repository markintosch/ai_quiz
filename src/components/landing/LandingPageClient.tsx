'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { trackEvent } from '@/lib/analytics'
import { RadarChart } from '@/components/results/RadarChart'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import type { DimensionScore } from '@/types'

function CopyLinkButton() {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      trackEvent('share_link_copied', { source: 'landing_hero' })
    })
  }
  return (
    <button
      onClick={handleCopy}
      className="text-xs text-white/50 hover:text-white/80 transition-colors flex items-center gap-1.5 mx-auto"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
      </svg>
      {copied ? 'Link copied!' : 'Share with a colleague'}
    </button>
  )
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
}

interface ProductCopyOverride {
  badge?: string
  scoreLabel?: string
  heroHeading?: string
  heroCta?: string
  heading1?: string
  headingExternalAccent?: string
  heading2?: string
  ctaExternal?: string
  meta?: string
}

interface Props {
  productName: string
  productShortName: string
  dimensions: Array<{ key: string; icon: string; label: string; desc: string }>
  productKey: string
  copy?: ProductCopyOverride
}

export default function LandingPageClient({ productName, productShortName, dimensions, productKey, copy = {} }: Props) {
  const t = useTranslations('landing')

  const SAMPLE_SCORES: DimensionScore[] = dimensions.slice(0, 6).map((d, i) => ({
    dimension: d.key as DimensionScore['dimension'],
    label: d.label,
    raw: [3, 4, 2, 3, 1, 4][i] ?? 3,
    max: 5,
    normalized: [60, 72, 35, 55, 28, 68][i] ?? 50,
  }))

  const dimensionItems = dimensions
  const steps = t.raw('howItWorks.steps') as Array<{ n: string; title: string; desc: string }>
  const trustItems = t.raw('trust') as string[]

  // ── Scroll depth tracking ──────────────────────────────────
  const fired50  = useRef(false)
  const fired75  = useRef(false)

  useEffect(() => {
    trackEvent('landing_viewed')

    function onScroll() {
      const scrolled = window.scrollY + window.innerHeight
      const total    = document.body.scrollHeight
      const pct      = scrolled / total

      if (!fired50.current && pct >= 0.5) {
        fired50.current = true
        trackEvent('scroll_50')
      }
      if (!fired75.current && pct >= 0.75) {
        fired75.current = true
        trackEvent('scroll_75')
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen text-white" style={{ background: '#0F172A' }}>

      {/* ── Nav ── */}
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm text-white" style={{ background: '#1D4ED8' }}>M</div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">{productName}</p>
              <a href="/mentor" className="text-xs transition-colors" style={{ color: '#D97706' }}>markdekock.com/mentor →</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href="/a"
              onClick={() => trackEvent('nav_cta_clicked')}
              className="px-5 py-2 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
              style={{ background: '#1D4ED8' }}
            >
              {t('hero.ctaMain')}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div variants={stagger} initial="hidden" animate="show">

          <motion.div variants={fadeUp}>
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-semibold tracking-widest uppercase mb-6 border border-white/10" style={{ color: '#D97706' }}>
              {copy.badge ?? t('hero.badge')}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-6xl font-black leading-tight mb-6 tracking-tight"
          >
            {copy.heroHeading
              ? <span>{copy.heroHeading}</span>
              : <>{t('hero.heading1')}{' '}<span style={{ color: '#D97706' }}>{t('hero.heading2')}</span></>
            }
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-gray-300 text-xl max-w-2xl mx-auto mb-3 leading-relaxed"
          >
            {t('hero.sub')}
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="text-gray-400 text-sm max-w-xl mx-auto mb-10"
          >
            {t('hero.authors')}
          </motion.p>

          {/* ── Primary CTA ── */}
          <motion.div variants={fadeUp}>
            <Link
              href="/a"
              onClick={() => trackEvent('hero_cta_short_clicked')}
              className="inline-flex flex-col items-center px-10 py-5 text-white font-bold rounded-2xl transition-colors shadow-xl hover:bg-blue-700"
              style={{ background: '#1D4ED8', boxShadow: '0 20px 40px rgba(29,78,216,0.3)' }}
            >
              <span className="text-xl">{copy.heroCta ?? t('hero.ctaMain')}</span>
              <span className="text-xs font-normal text-white/70 mt-1">{t('hero.ctaSub')}</span>
            </Link>
          </motion.div>

          {/* ── Secondary link ── */}
          <motion.p variants={fadeUp} className="mt-5 text-sm text-gray-400">
            {t('hero.ctaFullPre')}{' '}
            <Link
              href="/a/extended"
              onClick={() => trackEvent('hero_cta_full_clicked')}
              className="text-white underline underline-offset-2 hover:text-brand-accent transition-colors"
            >
              {t('hero.ctaFull')}
            </Link>
          </motion.p>

          {/* ── Share with a colleague ── */}
          <motion.div variants={fadeUp} className="mt-4">
            <CopyLinkButton />
          </motion.div>

          {/* ── Trust strip ── */}
          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-wrap justify-center gap-6 text-xs text-white/70 border-t border-white/10 pt-10"
          >
            {trustItems.map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="text-green-400">✓</span> {item}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── How it works ── */}
      <section className="border-t border-white/10 bg-white/5">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.05 }}
          >
            <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-widest mb-2 text-center" style={{ color: '#D97706' }}>
              {t('howItWorks.label')}
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center mb-12">
              {t('howItWorks.heading')}
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((s) => (
                <motion.div
                  key={s.n}
                  variants={fadeUp}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                  <p className="text-4xl font-black text-amber-500/30 mb-3">{s.n}</p>
                  <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Results preview ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
        >
          <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-widest mb-2 text-center" style={{ color: '#D97706' }}>
            {t('preview.label')}
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center mb-3">
            {t('preview.heading')}
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-center mb-10 max-w-xl mx-auto">
            {t('preview.sub')}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="max-w-sm mx-auto bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            {/* Sample score header */}
            <div className="text-center mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">{t('preview.exampleLabel')}</p>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full ring-4 bg-yellow-50 ring-yellow-200 mb-2">
                <span className="text-2xl font-black text-yellow-600">53</span>
              </div>
              <p className="text-white font-bold text-lg">{t('preview.exampleLevel')}</p>
              <div className="mt-2 inline-flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1">
                <span className="text-xs text-gray-400">Average: <strong className="text-white">47</strong></span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-300">+6 vs avg</span>
              </div>
            </div>

            <div className="flex justify-center">
              <RadarChart dimensionScores={SAMPLE_SCORES} size={260} animate={false} dark={true} />
            </div>

            <p className="text-center text-xs text-gray-500 mt-4 italic">
              {t('preview.sampleCaption')}
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── What you get ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
        >
          <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-widest mb-2 text-center" style={{ color: '#D97706' }}>
            {t('dimensions.label')}
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center mb-3">
            {t('dimensions.heading')}
          </motion.h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-12">
            {dimensionItems.map((d) => (
              <motion.div
                key={d.label}
                variants={fadeUp}
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors"
              >
                <div className="text-2xl mb-3">{d.icon}</div>
                <h3 className="text-sm font-bold text-white mb-1">{d.label}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{d.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Built by ── */}
      <section className="border-t border-white/10" style={{ background: '#1E3A5F' }}>
        <div className="max-w-5xl mx-auto px-6 py-20">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.05 }}
          >
            <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-widest mb-2 text-center" style={{ color: '#D97706' }}>
              {t('practitioners.label')}
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center mb-3">
              {t('practitioners.heading')}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
              {t('practitioners.sub')}
            </motion.p>

            <motion.div variants={stagger} className="max-w-lg mx-auto">
              <motion.div variants={fadeUp} className="rounded-2xl p-7 flex flex-col items-center text-center border border-white/15" style={{ background: 'rgba(30,58,95,0.6)' }}>
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-[#1E3A5F] flex items-center justify-center flex-shrink-0 ring-2 ring-blue-500/40">
                  <img
                    src="/mark-de-kock.jpg"
                    alt="Mark de Kock"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const tgt = e.currentTarget
                      tgt.style.display = 'none'
                      if (tgt.parentElement) tgt.parentElement.innerHTML = '<span style="color:white;font-weight:700;font-size:1.25rem">M</span>'
                    }}
                  />
                </div>
                <h3 className="text-white font-bold text-lg mb-0.5">Mark de Kock</h3>
                <p className="text-xs font-semibold mb-4" style={{ color: '#D97706' }}>{t('practitioners.mark.role')}</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {t('practitioners.mark.bio')}
                </p>
                <a
                  href="/mentor"
                  className="mt-5 text-sm font-semibold transition-colors hover:underline"
                  style={{ color: '#D97706' }}
                >
                  Over de AI Mentor begeleiding →
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
        >
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-4">
            {t('finalCta.heading')}
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
            {t('finalCta.sub')}
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href="/a"
              onClick={() => trackEvent('final_cta_short_clicked')}
              className="inline-flex flex-col items-center px-12 py-5 text-white font-bold rounded-2xl transition-colors shadow-xl hover:bg-blue-700"
              style={{ background: '#1D4ED8', boxShadow: '0 20px 40px rgba(29,78,216,0.3)' }}
            >
              <span className="text-xl">{t('finalCta.button')}</span>
              <span className="text-xs font-normal text-white/70 mt-1">{t('finalCta.buttonSub')}</span>
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} className="mt-6 text-sm text-gray-500">
            {t('finalCta.fullPre')}{' '}
            <Link
              href="/a/extended"
              className="text-gray-400 underline underline-offset-2 hover:text-white transition-colors"
            >
              {t('finalCta.fullLink')}
            </Link>
          </motion.p>
          <motion.p variants={fadeUp} className="mt-2 text-xs text-gray-600">
            {t('finalCta.fullNote')}
          </motion.p>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Mark de Kock · <a href="/mentor" className="hover:text-gray-300 transition-colors">markdekock.com/mentor</a></p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">{t('footer.privacy')}</Link>
            <a href="mailto:mark@dekock.com" className="hover:text-gray-300 transition-colors">{t('footer.contact')}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
