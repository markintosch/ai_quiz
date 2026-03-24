'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { getMadasterContent, scoreColour } from '@/products/madaster/data'
import CxRadarChart from '@/components/cx/RadarChart'

// ── Brand tokens ─────────────────────────────────────────────────────────────
const TEAL        = '#398684'
const TEAL_LIGHT  = '#E6F4F4'
const TEAL_MID    = '#55B4B1'
const DARK_TEAL   = '#1D4A56'
const ACCENT      = '#DDED79'
const DARK        = '#1D2B36'
const BODY        = '#4A5568'
const MUTED       = '#94A3B8'

// ── Animation helpers ─────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
}

// ── Sample radar scores ───────────────────────────────────────────────────────
const SAMPLE_SCORES = {
  materials: 2.2, design: 1.8, data: 2.5,
  compliance: 3.0, value: 1.5, alignment: 2.0,
}

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  en: {
    navLabel:   'Circular Readiness Assessment',
    startCta:   'Start assessment →',
    badge:      'Circular Readiness Assessment',
    heroTitle1: 'How circular-ready is',
    heroAccent: 'your organisation',
    heroTitle2: '— really?',
    heroBody:   'In 15 minutes, discover where you genuinely stand across 6 dimensions of circular maturity — and where the biggest compliance and value risks are hiding.',
    heroCta:    'Start the assessment — it\'s free →',
    trustLine:  '24 questions · 6 dimensions · ~15 minutes · No registration required',
    howLabel:   'How it works',
    howTitle:   'Three steps to clarity',
    steps: [
      { n: '01', title: 'Select your role',    body: 'Tell us your role in the organisation. An asset manager sees different things than a project developer — that context shapes your picture.' },
      { n: '02', title: 'Answer 24 questions', body: 'Rate your organisation honestly across 6 circular readiness dimensions. No right or wrong — just where you are today.' },
      { n: '03', title: 'See your results',    body: 'Get a radar chart, dimension scores, and your top 3 priority gaps — with a clear starting point for action.' },
    ],
    whatLabel:      'What you get',
    whatTitle:      'Your Circular Readiness Radar',
    whatBody:       'See exactly where you stand on each dimension — and where to focus first to reduce risk and unlock value.',
    exampleLabel:   'Example result',
    exampleScore:   'Compliance-Driven',
    exampleCaption: 'Sample — your results reflect your actual organisation',
    dimsLabel:      'The 6 dimensions',
    dimsTitle:      'Where does circular readiness live?',
    dimsBody:       'Each dimension reveals a different facet of your circular maturity — together they form the complete picture.',
    whyLabel:       'Why it matters',
    whyTitle:       'The regulatory and financial case for circularity',
    whyCards: [
      { icon: '📋', title: 'CSRD & EU Taxonomy',     body: 'From 2025, large companies must report on circular economy metrics. Not knowing your material flows is no longer an option.' },
      { icon: '💶', title: 'Residual asset value',   body: 'Buildings with material passports and reversible design retain higher residual value — and attract better financing terms.' },
      { icon: '🎯', title: 'MPG obligations',         body: 'The Milieuprestatie Gebouwen score tightens every year. Organisations without material data will struggle to comply.' },
    ],
    levelsTitle: 'Four levels of circular readiness',
    levels: [
      { label: 'Circular Leader',      score: '3.5 – 4.0', desc: 'Circularity is embedded in strategy, procurement, data systems and culture. You\'re building long-term resilience.',   bg: '#E6F4F4', border: TEAL,      text: TEAL },
      { label: 'Circular Aware',       score: '2.5 – 3.4', desc: 'Good awareness and practices in place — now time to systematise and get ahead of regulatory requirements.',           bg: '#EDF8F8', border: TEAL_MID,  text: TEAL_MID },
      { label: 'Compliance-Driven',    score: '1.5 – 2.4', desc: 'Primarily motivated by regulation, with limited proactive circular practice. Reactive today, exposed tomorrow.',        bg: '#FEF3C7', border: '#D97706', text: '#D97706' },
      { label: 'Materials Blind',      score: '1.0 – 1.5', desc: 'Little visibility into material stocks or circular potential. The risks are real — and so is the opportunity.',        bg: '#FDF0F3', border: '#E05A7A', text: '#E05A7A' },
    ],
    ctaTitle: 'Ready to see where you stand?',
    ctaBody:  'The assessment takes 15 minutes. Your results are instant, confidential, and the starting point for a sharper circular strategy.',
    ctaBtn:   'Start the assessment →',
    ctaTrust: 'Free · No registration · Results immediately',
    footerCopy: 'Circular Readiness Assessment',
  },
  nl: {
    navLabel:   'Circular Readiness Assessment',
    startCta:   'Start assessment →',
    badge:      'Circular Readiness Assessment',
    heroTitle1: 'Hoe circulair-klaar is',
    heroAccent: 'jouw organisatie',
    heroTitle2: '— echt?',
    heroBody:   'Ontdek in 15 minuten waar je werkelijk staat op 6 dimensies van circulaire volwassenheid — en waar de grootste compliance- en waarderisico\'s verborgen liggen.',
    heroCta:    'Start het assessment — gratis →',
    trustLine:  '24 vragen · 6 dimensies · ~15 minuten · Geen registratie vereist',
    howLabel:   'Hoe het werkt',
    howTitle:   'Drie stappen naar duidelijkheid',
    steps: [
      { n: '01', title: 'Selecteer je rol',      body: 'Vertel ons je rol in de organisatie. Een assetmanager ziet andere dingen dan een projectontwikkelaar — die context bepaalt het beeld.' },
      { n: '02', title: 'Beantwoord 24 vragen',  body: 'Beoordeel je organisatie eerlijk op 6 dimensies van circulaire gereedheid. Geen goed of fout — alleen waar je vandaag staat.' },
      { n: '03', title: 'Bekijk je resultaten',  body: 'Ontvang een radargrafiek, dimensiescores en je top 3 prioritaire verbeterpunten — met een helder vertrekpunt voor actie.' },
    ],
    whatLabel:      'Wat je krijgt',
    whatTitle:      'Jouw Circular Readiness Radar',
    whatBody:       'Zie precies waar je staat per dimensie — en waar je het eerst op moet focussen om risico te verminderen en waarde te ontsluiten.',
    exampleLabel:   'Voorbeeldresultaat',
    exampleScore:   'Regelgedreven',
    exampleCaption: 'Voorbeeld — jouw resultaten weerspiegelen jouw werkelijke organisatie',
    dimsLabel:      'De 6 dimensies',
    dimsTitle:      'Waar leeft circulaire gereedheid?',
    dimsBody:       'Elke dimensie onthult een ander facet van je circulaire volwassenheid — samen vormen ze het complete beeld.',
    whyLabel:       'Waarom het ertoe doet',
    whyTitle:       'De regelgeving- en financiële reden voor circulariteit',
    whyCards: [
      { icon: '📋', title: 'CSRD & EU-taxonomie',    body: 'Vanaf 2025 moeten grote bedrijven rapporteren over circulariteitsmetrieken. Niet weten wat er in je gebouwen zit is geen optie meer.' },
      { icon: '💶', title: 'Resterende assetwaarde', body: 'Gebouwen met materiaalpaspoorten en omkeerbaar ontwerp behouden hogere restwaarde — en trekken betere financieringsvoorwaarden aan.' },
      { icon: '🎯', title: 'MPG-verplichtingen',      body: 'De Milieuprestatie Gebouwen-score wordt elk jaar strenger. Organisaties zonder materiaaldata zullen moeite hebben om te voldoen.' },
    ],
    levelsTitle: 'Vier niveaus van circulaire gereedheid',
    levels: [
      { label: 'Circulaire Leider',    score: '3.5 – 4.0', desc: 'Circulariteit is verankerd in strategie, inkoop, datasystemen en cultuur. Je bouwt aan langdurige weerbaarheid.',       bg: '#E6F4F4', border: TEAL,      text: TEAL },
      { label: 'Circulairbewust',      score: '2.5 – 3.4', desc: 'Goed bewustzijn en praktijken aanwezig — nu tijd om te systematiseren en voor te blijven op regelgeving.',              bg: '#EDF8F8', border: TEAL_MID,  text: TEAL_MID },
      { label: 'Regelgedreven',        score: '1.5 – 2.4', desc: 'Primair gedreven door regelgeving, met beperkte proactieve circulaire praktijk. Reactief vandaag, kwetsbaar morgen.',   bg: '#FEF3C7', border: '#D97706', text: '#D97706' },
      { label: 'Materialenblind',      score: '1.0 – 1.5', desc: 'Weinig inzicht in materiaalvoorraden of circulair potentieel. De risico\'s zijn reëel — en de kansen ook.',             bg: '#FDF0F3', border: '#E05A7A', text: '#E05A7A' },
    ],
    ctaTitle: 'Klaar om te zien waar je staat?',
    ctaBody:  'Het assessment duurt 15 minuten. Jouw resultaten zijn direct beschikbaar, vertrouwelijk en het startpunt voor een scherpere circulaire strategie.',
    ctaBtn:   'Start het assessment →',
    ctaTrust: 'Gratis · Geen registratie · Direct resultaat',
    footerCopy: 'Circular Readiness Assessment',
  },
}

export default function MadasterLandingPage() {
  const [lang, setLang] = useState<'en'|'nl'>('nl')
  const t = T[lang]
  const { DIMENSIONS } = getMadasterContent(lang)
  const assessHref = lang === 'nl' ? '/madaster/assess?lang=nl' : '/madaster/assess'
  const sampleScoreColour = scoreColour(2.0)

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: DARK, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ── Nav ── */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #EEF2F7', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo mark */}
          <div className="flex items-center gap-3">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 18 }}>♻️</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: DARK, lineHeight: 1.2 }}>Madaster</p>
              <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.2 }}>{t.navLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 100, padding: 3, gap: 2 }}>
              {(['nl', 'en'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                    background: lang === l ? '#fff' : 'transparent',
                    color: lang === l ? DARK : MUTED,
                    border: 'none', cursor: 'pointer',
                    boxShadow: lang === l ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <Link
              href={assessHref}
              style={{
                background: TEAL, color: '#fff', fontSize: 13, fontWeight: 700,
                padding: '8px 20px', borderRadius: 100, textDecoration: 'none',
              }}
            >
              {t.startCta}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: '#fff', paddingTop: 80, paddingBottom: 88 }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div variants={stagger} initial="hidden" animate="show">

            <motion.div variants={fadeUp}>
              <span style={{
                display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
                textTransform: 'uppercase', color: TEAL, background: TEAL_LIGHT,
                padding: '4px 14px', borderRadius: 100, marginBottom: 24,
              }}>
                {t.badge}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              style={{ fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 20, color: DARK }}
            >
              {t.heroTitle1}{' '}
              <span style={{ color: TEAL }}>{t.heroAccent}</span>
              {' '}{t.heroTitle2}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              style={{ fontSize: 18, color: BODY, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 36px' }}
            >
              {t.heroBody}
            </motion.p>

            <motion.div variants={fadeUp}>
              <Link
                href={assessHref}
                style={{
                  display: 'inline-block',
                  background: `linear-gradient(135deg, ${TEAL}, ${TEAL_MID})`,
                  color: '#fff', fontWeight: 700, fontSize: 16,
                  padding: '16px 40px', borderRadius: 100, textDecoration: 'none',
                  boxShadow: `0 12px 32px ${TEAL}44`,
                }}
              >
                {t.heroCta}
              </Link>
            </motion.div>

            <motion.p variants={fadeUp} style={{ fontSize: 13, color: MUTED, marginTop: 16 }}>
              {t.trustLine}
            </motion.p>

          </motion.div>
        </div>
      </section>

      {/* ── Wave ── */}
      <div style={{ background: '#fff' }}>
        <svg viewBox="0 0 1440 40" fill="none" style={{ display: 'block' }}>
          <path d="M0 0 Q360 40 720 20 Q1080 0 1440 30 L1440 40 L0 40Z" fill="#FAFBFD" />
        </svg>
      </div>

      {/* ── How it works ── */}
      <section style={{ padding: '72px 24px', background: '#FAFBFD' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: TEAL, marginBottom: 10 }}>
              {t.howLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 48, color: DARK }}>
              {t.howTitle}
            </motion.h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {t.steps.map((s, i) => (
                <motion.div key={s.n} variants={fadeUp} style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', border: '1px solid #EEF2F7', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: i === 1 ? DARK_TEAL : TEAL_LIGHT,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800,
                    color: i === 1 ? '#fff' : TEAL,
                    marginBottom: 16,
                  }}>
                    {s.n}
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: DARK }}>{s.title}</p>
                  <p style={{ fontSize: 14, color: BODY, lineHeight: 1.65 }}>{s.body}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Radar preview ── */}
      <section style={{ background: '#fff', padding: '72px 24px' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: TEAL, marginBottom: 10 }}>
              {t.whatLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 12, color: DARK }}>
              {t.whatTitle}
            </motion.h2>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 15, color: BODY, maxWidth: 480, margin: '0 auto 40px' }}>
              {t.whatBody}
            </motion.p>
            <motion.div variants={fadeUp} style={{ maxWidth: 340, margin: '0 auto', background: '#FAFBFD', borderRadius: 24, padding: '28px 24px', border: '1px solid #EEF2F7', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED, marginBottom: 12 }}>{t.exampleLabel}</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: sampleScoreColour.pastelBg, border: `4px solid ${sampleScoreColour.bg}33`, marginBottom: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: sampleScoreColour.bg }}>2.0</span>
              </div>
              <p style={{ fontSize: 16, fontWeight: 800, color: DARK, marginBottom: 16 }}>{t.exampleScore}</p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CxRadarChart scores={SAMPLE_SCORES} size={220} primaryColor={sampleScoreColour.bg} />
              </div>
              <p style={{ fontSize: 11, color: MUTED, marginTop: 12, fontStyle: 'italic' }}>{t.exampleCaption}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Why it matters ── */}
      <section style={{ background: '#FAFBFD', padding: '72px 24px' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: TEAL, marginBottom: 10 }}>
              {t.whyLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 48, color: DARK }}>
              {t.whyTitle}
            </motion.h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {t.whyCards.map((c, i) => (
                <motion.div key={i} variants={fadeUp} style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', border: '1px solid #EEF2F7', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{c.icon}</div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: TEAL, marginBottom: 8 }}>{c.title}</p>
                  <p style={{ fontSize: 14, color: BODY, lineHeight: 1.65 }}>{c.body}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 6 Dimensions ── */}
      <section style={{ background: '#fff', padding: '72px 24px' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: TEAL, marginBottom: 10 }}>
              {t.dimsLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 12, color: DARK }}>
              {t.dimsTitle}
            </motion.h2>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 15, color: BODY, maxWidth: 480, margin: '0 auto 40px' }}>
              {t.dimsBody}
            </motion.p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DIMENSIONS.map((d, i) => {
                const isDark = i % 2 === 1
                return (
                  <motion.div
                    key={d.id}
                    variants={fadeUp}
                    style={{
                      borderRadius: 18, padding: '24px 22px',
                      background: isDark ? DARK_TEAL : TEAL_LIGHT,
                      border: `1px solid ${isDark ? '#ffffff11' : TEAL + '22'}`,
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 12 }}>{d.icon}</div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: isDark ? ACCENT : TEAL, marginBottom: 6 }}>{d.name}</p>
                    <p style={{ fontSize: 13, color: isDark ? '#ffffffcc' : BODY, lineHeight: 1.6 }}>{d.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Score legend ── */}
      <section style={{ background: '#FAFBFD', padding: '64px 24px' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 22, fontWeight: 800, marginBottom: 32, color: DARK }}>
              {t.levelsTitle}
            </motion.h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {t.levels.map(l => (
                <motion.div key={l.label} variants={fadeUp} style={{ borderRadius: 14, padding: '20px', background: l.bg, border: `1px solid ${l.border}33` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: l.text }}>{l.label}</p>
                    <span style={{ fontSize: 12, fontWeight: 700, color: l.text, background: '#fff', padding: '2px 10px', borderRadius: 100 }}>{l.score}</span>
                  </div>
                  <p style={{ fontSize: 13, color: BODY, lineHeight: 1.6 }}>{l.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: '88px 24px', background: '#fff' }}>
        <div className="max-w-xl mx-auto text-center">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: DARK, marginBottom: 16, lineHeight: 1.2 }}>
              {t.ctaTitle}
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 16, color: BODY, marginBottom: 32, lineHeight: 1.7 }}>
              {t.ctaBody}
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href={assessHref}
                style={{
                  display: 'inline-block',
                  background: `linear-gradient(135deg, ${TEAL}, ${TEAL_MID})`,
                  color: '#fff', fontWeight: 700, fontSize: 16,
                  padding: '16px 40px', borderRadius: 100, textDecoration: 'none',
                  boxShadow: `0 12px 32px ${TEAL}44`,
                }}
              >
                {t.ctaBtn}
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} style={{ fontSize: 13, color: MUTED, marginTop: 16 }}>
              {t.ctaTrust}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #EEF2F7', background: '#fff', padding: '28px 24px' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div style={{ width: 24, height: 24, borderRadius: 6, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>♻️</div>
            <span style={{ fontSize: 13, color: MUTED }}>Madaster — {t.footerCopy}</span>
          </div>
          <p style={{ fontSize: 12, color: MUTED }}>{new Date().getFullYear()}</p>
        </div>
      </footer>

    </div>
  )
}
