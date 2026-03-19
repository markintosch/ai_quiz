'use client'

import { useEffect, useRef } from 'react'
import { motion, type Variants } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { trackEvent } from '@/lib/analytics'
import { RadarChart } from '@/components/results/RadarChart'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import type { DimensionScore } from '@/types'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
}

const SAMPLE_SCORES: DimensionScore[] = [
  { dimension: 'strategy_vision',       label: 'Strategy',    raw: 3, max: 5, normalized: 60 },
  { dimension: 'current_usage',         label: 'Usage',       raw: 4, max: 5, normalized: 72 },
  { dimension: 'data_readiness',        label: 'Data',        raw: 2, max: 5, normalized: 35 },
  { dimension: 'talent_culture',        label: 'Talent',      raw: 3, max: 5, normalized: 55 },
  { dimension: 'governance_risk',       label: 'Governance',  raw: 1, max: 5, normalized: 28 },
  { dimension: 'opportunity_awareness', label: 'Opportunity', raw: 4, max: 5, normalized: 68 },
]

export default function LandingPage() {
  const t = useTranslations('landing')

  const dimensionItems = t.raw('dimensions.items') as Array<{ icon: string; label: string; desc: string }>
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
    <div className="min-h-screen bg-brand text-white">

      {/* ── Nav ── */}
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-brand-accent text-xs font-bold tracking-widest uppercase">Brand PWRD Media</p>
            <p className="text-white text-sm font-semibold leading-tight">AI Maturity Assessment</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href="/quiz"
              onClick={() => trackEvent('nav_cta_clicked')}
              className="px-5 py-2 bg-brand-accent hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors"
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
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-brand-accent text-xs font-semibold tracking-widest uppercase mb-6 border border-white/10">
              {t('hero.badge')}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-6xl font-black leading-tight mb-6 tracking-tight"
          >
            {t('hero.heading1')}{' '}
            <span className="text-brand-accent">{t('hero.heading2')}</span>
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
              href="/quiz"
              onClick={() => trackEvent('hero_cta_short_clicked')}
              className="inline-flex flex-col items-center px-10 py-5 bg-brand-accent hover:bg-orange-700 text-white font-bold rounded-2xl transition-colors shadow-xl shadow-orange-900/30"
            >
              <span className="text-xl">{t('hero.ctaMain')}</span>
              <span className="text-xs font-normal text-white/70 mt-1">{t('hero.ctaSub')}</span>
            </Link>
          </motion.div>

          {/* ── Secondary link ── */}
          <motion.p variants={fadeUp} className="mt-5 text-sm text-gray-400">
            {t('hero.ctaFullPre')}{' '}
            <Link
              href="/quiz/extended"
              onClick={() => trackEvent('hero_cta_full_clicked')}
              className="text-white underline underline-offset-2 hover:text-brand-accent transition-colors"
            >
              {t('hero.ctaFull')}
            </Link>
          </motion.p>

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
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-2 text-center">
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
                  <p className="text-4xl font-black text-brand-accent/30 mb-3">{s.n}</p>
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
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-2 text-center">
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
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-2 text-center">
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
      <section className="border-t border-white/10 bg-white/5">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-2 text-center">
              {t('practitioners.label')}
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center mb-3">
              {t('practitioners.heading')}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
              {t('practitioners.sub')}
            </motion.p>

            <motion.div variants={stagger} className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">

              {/* Mark */}
              <motion.div variants={fadeUp} className="bg-brand-light border border-white/15 rounded-2xl p-7 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 ring-2 ring-brand-accent/60 bg-brand flex items-center justify-center flex-shrink-0">
                  <img
                    src="/mark-de-kock.jpg"
                    alt="Mark de Kock"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const tgt = e.currentTarget
                      tgt.style.display = 'none'
                      if (tgt.parentElement) tgt.parentElement.innerHTML = '<span style="color:white;font-weight:700;font-size:1.25rem">MdK</span>'
                    }}
                  />
                </div>
                <h3 className="text-white font-bold text-lg mb-0.5">Mark de Kock</h3>
                <p className="text-brand-accent text-xs font-semibold mb-4">{t('practitioners.mark.role')}</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {t('practitioners.mark.bio')}
                </p>
              </motion.div>

              {/* Frank */}
              <motion.div variants={fadeUp} className="bg-brand-light border border-white/15 rounded-2xl p-7 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 ring-2 ring-brand-accent/60 bg-brand flex items-center justify-center flex-shrink-0">
                  <img
                    src="/frank-meeuwsen.jpg"
                    alt="Frank Meeuwsen"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const tgt = e.currentTarget
                      tgt.style.display = 'none'
                      if (tgt.parentElement) tgt.parentElement.innerHTML = '<span style="color:white;font-weight:700;font-size:1.25rem">FM</span>'
                    }}
                  />
                </div>
                <h3 className="text-white font-bold text-lg mb-0.5">Frank Meeuwsen</h3>
                <p className="text-brand-accent text-xs font-semibold mb-4">{t('practitioners.frank.role')}</p>
                <p className="text-white text-sm leading-relaxed italic mb-2">
                  {t('practitioners.frank.quote')}
                </p>
                <p className="text-gray-400 text-xs">{t('practitioners.frank.translation')}</p>
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
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-4">
            {t('finalCta.heading')}
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
            {t('finalCta.sub')}
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href="/quiz"
              onClick={() => trackEvent('final_cta_short_clicked')}
              className="inline-flex flex-col items-center px-12 py-5 bg-brand-accent hover:bg-orange-700 text-white font-bold rounded-2xl transition-colors shadow-xl shadow-orange-900/30"
            >
              <span className="text-xl">{t('finalCta.button')}</span>
              <span className="text-xs font-normal text-white/70 mt-1">{t('finalCta.buttonSub')}</span>
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} className="mt-6 text-sm text-gray-500">
            {t('finalCta.fullPre')}{' '}
            <Link
              href="/quiz/extended"
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
          <p>© {new Date().getFullYear()} Brand PWRD Media. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">{t('footer.privacy')}</Link>
            <a href="mailto:mark@brandpwrdmedia.com" className="hover:text-gray-300 transition-colors">{t('footer.contact')}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
