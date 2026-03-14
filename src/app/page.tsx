'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { motion, type Variants } from 'framer-motion'
import { trackEvent } from '@/lib/analytics'
import { RadarChart } from '@/components/results/RadarChart'
import type { DimensionScore } from '@/types'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
}

const DIMENSIONS = [
  { icon: '🧭', label: 'Strategy & Vision',      desc: 'Is AI central to how you compete — or still a side project?' },
  { icon: '⚡', label: 'Current Usage',           desc: 'Are AI tools genuinely embedded across your organisation?' },
  { icon: '🗄️', label: 'Data Readiness',          desc: 'Is your data architecture ready to power real AI outcomes?' },
  { icon: '🧑‍💻', label: 'Talent & Culture',        desc: 'Do your people feel equipped and motivated to work with AI?' },
  { icon: '🛡️', label: 'Governance & Risk',       desc: 'Do you have the guardrails and policies that responsible AI requires?' },
  { icon: '🔍', label: 'Opportunity Awareness',   desc: 'Does your leadership team agree on where AI creates the most value?' },
]

const SAMPLE_SCORES: DimensionScore[] = [
  { dimension: 'strategy_vision',       label: 'Strategy',    raw: 3, max: 5, normalized: 60 },
  { dimension: 'current_usage',         label: 'Usage',       raw: 4, max: 5, normalized: 72 },
  { dimension: 'data_readiness',        label: 'Data',        raw: 2, max: 5, normalized: 35 },
  { dimension: 'talent_culture',        label: 'Talent',      raw: 3, max: 5, normalized: 55 },
  { dimension: 'governance_risk',       label: 'Governance',  raw: 1, max: 5, normalized: 28 },
  { dimension: 'opportunity_awareness', label: 'Opportunity', raw: 4, max: 5, normalized: 68 },
]

const STEPS = [
  { n: '01', title: 'Answer 8 honest questions',  desc: '5 minutes · no jargon · no sign-up required upfront' },
  { n: '02', title: 'See your score instantly',   desc: 'A radar chart across all 6 AI maturity dimensions' },
  { n: '03', title: 'Know your next move',         desc: 'Prioritised actions — specific to your score, not generic advice' },
]

export default function LandingPage() {
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
    <div className="min-h-screen bg-[#354E5E] text-white">

      {/* ── Nav ── */}
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[#E8611A] text-xs font-bold tracking-widest uppercase">Kirk &amp; Blackbeard</p>
            <p className="text-white text-sm font-semibold leading-tight">AI Maturity Assessment</p>
          </div>
          <Link
            href="/quiz"
            onClick={() => trackEvent('nav_cta_clicked')}
            className="px-5 py-2 bg-[#E8611A] hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Start the scan →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div variants={stagger} initial="hidden" animate="show">

          <motion.div variants={fadeUp}>
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-[#E8611A] text-xs font-semibold tracking-widest uppercase mb-6 border border-white/10">
              Free · 5 minutes · Instant results
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-6xl font-black leading-tight mb-6 tracking-tight"
          >
            Your competitors are already using AI.{' '}
            <span className="text-[#E8611A]">Where do you actually stand?</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-gray-300 text-xl max-w-2xl mx-auto mb-3 leading-relaxed"
          >
            Our 5-minute diagnostic benchmarks your AI maturity across 6 critical
            dimensions — and tells you exactly what to prioritise next.
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="text-gray-400 text-sm max-w-xl mx-auto mb-10"
          >
            Developed by Mark de Kock &amp; Frank Meeuwsen — AI transformation specialists
            with 30+ years of combined digital experience.
          </motion.p>

          {/* ── Primary CTA ── */}
          <motion.div variants={fadeUp}>
            <Link
              href="/quiz"
              onClick={() => trackEvent('hero_cta_short_clicked')}
              className="inline-flex flex-col items-center px-10 py-5 bg-[#E8611A] hover:bg-orange-700 text-white font-bold rounded-2xl transition-colors shadow-xl shadow-orange-900/30"
            >
              <span className="text-xl">Start the 5-minute AI scan →</span>
              <span className="text-xs font-normal text-white/70 mt-1">8 questions · free · no sign-up required upfront</span>
            </Link>
          </motion.div>

          {/* ── Secondary link ── */}
          <motion.p variants={fadeUp} className="mt-5 text-sm text-gray-400">
            Want the complete picture?{' '}
            <Link
              href="/quiz/extended"
              onClick={() => trackEvent('hero_cta_full_clicked')}
              className="text-white underline underline-offset-2 hover:text-[#E8611A] transition-colors"
            >
              Take the full 25-question assessment →
            </Link>
          </motion.p>

          {/* ── Trust strip ── */}
          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-wrap justify-center gap-6 text-xs text-gray-500 border-t border-white/10 pt-10"
          >
            <span className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Used by leadership teams across Europe
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Average score: 47/100 — where do you rank?
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Results in 5 minutes, free
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-400">✓</span> No consultant pitch — just your score
            </span>
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
            <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-widest text-[#E8611A] mb-2 text-center">
              How it works
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center mb-12">
              Three steps. Zero jargon.
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8">
              {STEPS.map((s) => (
                <motion.div
                  key={s.n}
                  variants={fadeUp}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                  <p className="text-4xl font-black text-[#E8611A]/30 mb-3">{s.n}</p>
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
          <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-widest text-[#E8611A] mb-2 text-center">
            What you'll receive
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center mb-3">
            Your results look like this
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-center mb-10 max-w-xl mx-auto">
            A radar across all 6 dimensions, an overall score with benchmark context, and specific actions for your weakest areas.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="max-w-sm mx-auto bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            {/* Sample score header */}
            <div className="text-center mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Example result</p>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full ring-4 bg-yellow-50 ring-yellow-200 mb-2">
                <span className="text-2xl font-black text-yellow-600">53</span>
              </div>
              <p className="text-white font-bold text-lg">Experimenting</p>
              <div className="mt-2 inline-flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1">
                <span className="text-xs text-gray-400">Average: <strong className="text-white">47</strong></span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-300">+6 vs avg</span>
              </div>
            </div>

            <div className="flex justify-center">
              <RadarChart dimensionScores={SAMPLE_SCORES} size={260} animate={false} />
            </div>

            <p className="text-center text-xs text-gray-500 mt-4 italic">
              Sample output — your actual profile will differ
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
          <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-widest text-[#E8611A] mb-2 text-center">
            What you get
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center mb-3">
            A score across 6 dimensions that actually matter
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
            Not a generic AI report. A specific, actionable picture of where your
            organisation stands — and where to focus first.
          </motion.p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {DIMENSIONS.map((d) => (
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

      {/* ── Who it's for ── */}
      <section className="border-t border-white/10 bg-white/5">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-widest text-[#E8611A] mb-6">
              Built for leadership teams
            </motion.p>
            <motion.p variants={fadeUp} className="text-gray-300 text-sm max-w-lg mx-auto mb-8">
              This is not a tool for developers. It is a strategic diagnostic for the
              people responsible for direction, investment and transformation.
            </motion.p>
            <motion.div variants={stagger} className="flex flex-wrap justify-center gap-3">
              {[
                'CEOs & MDs',
                'Marketing Directors',
                'Operations Leaders',
                'HR & L&D Teams',
                'Digital Transformation Leads',
                'Strategy Consultants',
              ].map((role) => (
                <motion.span
                  key={role}
                  variants={fadeUp}
                  className="px-4 py-2 bg-white/10 border border-white/10 rounded-full text-sm text-gray-300"
                >
                  {role}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>
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
            <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-widest text-[#E8611A] mb-2 text-center">
              Built by practitioners
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center mb-3">
              No theory. No agency fluff.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
              This assessment was built by two people who do this work every day — not a research team or a software house.
            </motion.p>

            <motion.div variants={stagger} className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">

              {/* Mark */}
              <motion.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-2 ring-[#E8611A]/40 bg-[#354E5E] flex items-center justify-center">
                  {/* Replace with: <img src="/mark-de-kock.jpg" alt="Mark de Kock" className="w-full h-full object-cover" /> */}
                  <span className="text-white font-bold text-xl">MdK</span>
                </div>
                <h3 className="text-white font-bold text-base mb-0.5">Mark de Kock</h3>
                <p className="text-[#E8611A] text-xs font-semibold mb-3">AI Transformation Lead · Kirk &amp; Blackbeard</p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Works with leadership teams across Europe to design and implement practical AI strategies — from board alignment to team adoption.
                </p>
              </motion.div>

              {/* Frank */}
              <motion.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-2 ring-[#E8611A]/40">
                  {/* Replace src once photo is in /public/frank-meeuwsen.jpg */}
                  <img
                    src="/frank-meeuwsen.jpg"
                    alt="Frank Meeuwsen"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const t = e.currentTarget
                      t.style.display = 'none'
                      if (t.parentElement) t.parentElement.innerHTML = '<span class="w-full h-full flex items-center justify-center bg-[#354E5E] text-white font-bold text-xl">FM</span>'
                    }}
                  />
                </div>
                <h3 className="text-white font-bold text-base mb-0.5">Frank Meeuwsen</h3>
                <p className="text-[#E8611A] text-xs font-semibold mb-3">AI Trainer &amp; Consultant · 30 years digital experience</p>
                <p className="text-gray-400 text-sm leading-relaxed italic">
                  &ldquo;Geen hype, geen bullshit. Gewoon wat werkt in de echte wereld.&rdquo;
                </p>
                <p className="text-gray-500 text-xs mt-2">No hype, no buzzwords. Just what works in the real world.</p>
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
            Ready to find out where you stand?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
            No sign-up required until you see your results.
            Free. Takes 5 minutes.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href="/quiz"
              onClick={() => trackEvent('final_cta_short_clicked')}
              className="inline-flex flex-col items-center px-12 py-5 bg-[#E8611A] hover:bg-orange-700 text-white font-bold rounded-2xl transition-colors shadow-xl shadow-orange-900/30"
            >
              <span className="text-xl">Start the free 5-minute scan →</span>
              <span className="text-xs font-normal text-white/70 mt-1">8 questions · instant score · no card required</span>
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} className="mt-6 text-sm text-gray-500">
            Want the full breakdown instead?{' '}
            <Link
              href="/quiz/extended"
              className="text-gray-400 underline underline-offset-2 hover:text-white transition-colors"
            >
              25-question full assessment →
            </Link>
          </motion.p>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Kirk &amp; Blackbeard · Brand PWRD Media. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <a href="mailto:mark@brandpwrdmedia.com" className="hover:text-gray-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
