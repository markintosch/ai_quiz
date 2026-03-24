'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { getCxContent } from '@/products/cx/data'
import CxRadarChart from '@/components/cx/RadarChart'

// ── Brand tokens ─────────────────────────────────────────────────────────────
const BLUE       = '#4B9FD6'
const PINK       = '#D4607A'
const DARK       = '#1E293B'
const BODY       = '#475569'
const MUTED      = '#94A3B8'
const BLUE_LIGHT = '#EBF5FB'
const PINK_LIGHT = '#FDF0F3'

// ── Animation helpers ─────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
}

// Sample scores for the radar preview
const SAMPLE_SCORES = {
  insight: 2.5,
  journey: 3.0,
  alignment: 1.8,
  measurement: 2.2,
  prioritisation: 1.5,
  culture: 2.8,
}

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  en: {
    navRole: 'CX Expert',
    startCta: 'Start assessment →',
    badge: 'CX Maturity Assessment',
    heroTitle1: 'How customer-centric is',
    heroAccent: 'your organisation',
    heroTitle2: '— really?',
    heroBody: 'In 15 minutes, discover where you genuinely stand across 6 dimensions of CX maturity — and where the biggest opportunities are hiding.',
    heroCta: 'Start the assessment — it\'s free →',
    trustLine: '24 questions · 6 dimensions · ~15 minutes · No registration required',
    howLabel: 'How it works',
    howTitle: 'Three steps to clarity',
    steps: [
      { n: '01', title: 'Select your role',     body: 'Tell us where you sit in the organisation. Different roles see different things — that\'s the point.' },
      { n: '02', title: 'Answer 24 questions',  body: 'Rate your organisation honestly across 6 CX dimensions. No right or wrong — just where you are today.' },
      { n: '03', title: 'See your results',     body: 'Get a radar chart, dimension scores, and your top 3 priority gaps — plus a starting point for a conversation.' },
    ],
    whatLabel: 'What you get',
    whatTitle: 'Your personal CX radar',
    whatBody: 'See exactly where you stand on each dimension — and where to focus first.',
    exampleLabel: 'Example result',
    exampleCaption: 'Sample — your results reflect your actual organisation',
    dimsLabel: 'The 6 dimensions',
    dimsTitle: 'Where does customer-centricity live?',
    dimsBody: 'Each dimension reveals a different facet of CX maturity — together they form your full picture.',
    guideLabel: 'Your guide',
    guideTitle: 'Built by a CX practitioner',
    marije: {
      role: 'CX Expert · 20+ years experience · Freelance consultant',
      quote: '\u201cIn markets where products and services are barely distinguishable anymore, customer experience is the differentiator.\u201d',
      bio: 'After two decades helping organisations put customers at the heart of their strategy, Marije distilled her diagnostic framework into this assessment — a fast, honest mirror for where you really stand. She helps directors and teams make customer insight visible, actionable, and strategically prioritised.',
    },
    levelsTitle: 'Four levels of CX maturity',
    levels: [
      { label: 'Customer-Led',   score: '3.5 – 4.0', desc: 'CX is embedded in strategy, culture and daily operations. You\'re building a sustainable advantage.',          bg: '#E6F9F8', border: '#0EA5A0', text: '#0EA5A0' },
      { label: 'Customer-Aware', score: '2.5 – 3.4', desc: 'You understand the importance of CX and have good practices in place — now sharpen execution.',              bg: BLUE_LIGHT, border: BLUE, text: BLUE },
      { label: 'Inside-Out',     score: '1.5 – 2.4', desc: 'CX intentions are there, but internal processes and structures pull focus away from the customer.',           bg: '#FEF3C7', border: '#D97706', text: '#D97706' },
      { label: 'Product-First',  score: '1.0 – 1.5', desc: 'The organisation is primarily focused on products or internal goals. There\'s real opportunity here.',        bg: PINK_LIGHT, border: PINK, text: PINK },
    ],
    ctaTitle: 'Ready to find out where you stand?',
    ctaBody: 'The assessment takes about 15 minutes. Your results are instant, honest, and the beginning of something useful.',
    ctaBtn: 'Start the assessment →',
    ctaTrust: 'Free · No registration required · Results immediately',
    footerRole: 'Marije Gast — CX Expert',
    footerCopy: 'CX Maturity Assessment',
  },
  nl: {
    navRole: 'CX Expert',
    startCta: 'Start assessment →',
    badge: 'CX Volwassenheidsassessment',
    heroTitle1: 'Hoe klantgericht is',
    heroAccent: 'jouw organisatie',
    heroTitle2: '— echt?',
    heroBody: 'Ontdek in 15 minuten waar je werkelijk staat op 6 dimensies van CX-volwassenheid — en waar de grootste kansen verborgen liggen.',
    heroCta: 'Start het assessment — gratis →',
    trustLine: '24 vragen · 6 dimensies · ~15 minuten · Geen registratie vereist',
    howLabel: 'Hoe het werkt',
    howTitle: 'Drie stappen naar duidelijkheid',
    steps: [
      { n: '01', title: 'Selecteer je rol',       body: 'Vertel ons waar je zit in de organisatie. Verschillende rollen zien verschillende dingen — dat is precies de bedoeling.' },
      { n: '02', title: 'Beantwoord 24 vragen',   body: 'Beoordeel je organisatie eerlijk op 6 CX-dimensies. Geen goed of fout — alleen waar je vandaag staat.' },
      { n: '03', title: 'Bekijk je resultaten',   body: 'Ontvang een radargrafiek, dimensiescores en je top 3 prioritaire verbeterpunten — plus een vertrekpunt voor een gesprek.' },
    ],
    whatLabel: 'Wat je krijgt',
    whatTitle: 'Jouw persoonlijke CX-radar',
    whatBody: 'Zie precies waar je staat per dimensie — en waar je het eerst op moet focussen.',
    exampleLabel: 'Voorbeeldresultaat',
    exampleCaption: 'Voorbeeld — jouw resultaten weerspiegelen jouw werkelijke organisatie',
    dimsLabel: 'De 6 dimensies',
    dimsTitle: 'Waar leeft klantgerichtheid?',
    dimsBody: 'Elke dimensie onthult een ander facet van CX-volwassenheid — samen vormen ze jouw complete beeld.',
    guideLabel: 'Jouw gids',
    guideTitle: 'Gebouwd door een CX-practitioner',
    marije: {
      role: 'CX Expert · 20+ jaar ervaring · Freelance adviseur',
      quote: '\u201cIn markten waar producten en diensten nauwelijks van elkaar te onderscheiden zijn, is klantervaring de onderscheidende factor.\u201d',
      bio: 'Na twee decennia lang organisaties helpen om klanten centraal te stellen in hun strategie, heeft Marije haar diagnostisch raamwerk omgezet in dit assessment — een snelle, eerlijke spiegel voor waar je echt staat. Ze helpt directeuren en teams om klantinzicht zichtbaar, uitvoerbaar en strategisch geprioriteerd te maken.',
    },
    levelsTitle: 'Vier niveaus van CX-volwassenheid',
    levels: [
      { label: 'Klantgedreven',          score: '3.5 – 4.0', desc: 'CX is verankerd in strategie, cultuur en dagelijkse werkzaamheden. Je bouwt een duurzaam voordeel op.',    bg: '#E6F9F8', border: '#0EA5A0', text: '#0EA5A0' },
      { label: 'Klantbewust',            score: '2.5 – 3.4', desc: 'Je begrijpt het belang van CX en hebt goede praktijken — nu is het tijd om de uitvoering te verscherpen.', bg: BLUE_LIGHT, border: BLUE, text: BLUE },
      { label: 'Van Binnen Naar Buiten', score: '1.5 – 2.4', desc: 'De CX-intenties zijn er, maar interne processen en structuren trekken de aandacht weg van de klant.',       bg: '#FEF3C7', border: '#D97706', text: '#D97706' },
      { label: 'Productgericht',         score: '1.0 – 1.5', desc: 'De organisatie focust primair op producten of interne doelen. Hier ligt echte kans voor verbetering.',       bg: PINK_LIGHT, border: PINK, text: PINK },
    ],
    ctaTitle: 'Klaar om te ontdekken waar je staat?',
    ctaBody: 'Het assessment duurt ongeveer 15 minuten. Jouw resultaten zijn direct beschikbaar, eerlijk en het begin van iets nuttigs.',
    ctaBtn: 'Start het assessment →',
    ctaTrust: 'Gratis · Geen registratie vereist · Direct resultaat',
    footerRole: 'Marije Gast — CX Expert',
    footerCopy: 'CX Volwassenheidsassessment',
  },
}

export default function CxLandingPage() {
  const [lang, setLang] = useState<'en'|'nl'>('nl')
  const t = T[lang]
  const { DIMENSIONS } = getCxContent(lang)
  const assessHref = lang === 'nl' ? '/cx/assess?lang=nl' : '/cx/assess'

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: DARK, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ── Nav ── */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #EEF2F7', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{
              width: 36, height: 36, borderRadius: '50%', overflow: 'hidden',
              border: `2px solid ${PINK}33`,
              background: PINK_LIGHT,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <img src="/marije-gast.png" alt="Marije Gast" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: DARK, lineHeight: 1.2 }}>Marije Gast</p>
              <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.2 }}>{t.navRole}</p>
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
                background: PINK, color: '#fff', fontSize: 13, fontWeight: 700,
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
                textTransform: 'uppercase', color: BLUE, background: BLUE_LIGHT,
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
              <span style={{ color: PINK }}>{t.heroAccent}</span>
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
                  background: `linear-gradient(135deg, ${PINK}, #E8607A)`,
                  color: '#fff', fontWeight: 700, fontSize: 16,
                  padding: '16px 40px', borderRadius: 100, textDecoration: 'none',
                  boxShadow: '0 12px 32px rgba(212,96,122,0.3)',
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

      {/* ── Wave divider ── */}
      <div style={{ background: '#fff' }}>
        <svg viewBox="0 0 1440 40" fill="none" style={{ display: 'block' }}>
          <path d="M0 0 Q360 40 720 20 Q1080 0 1440 30 L1440 40 L0 40Z" fill="#FAFBFD" />
        </svg>
      </div>

      {/* ── How it works ── */}
      <section style={{ padding: '72px 24px', background: '#FAFBFD' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: PINK, marginBottom: 10 }}>
              {t.howLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 48, color: DARK }}>
              {t.howTitle}
            </motion.h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {t.steps.map((s, i) => (
                <motion.div key={s.n} variants={fadeUp} style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', border: '1px solid #EEF2F7', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: i === 1 ? PINK_LIGHT : BLUE_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: i === 1 ? PINK : BLUE, marginBottom: 16 }}>
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

      {/* ── Results preview ── */}
      <section style={{ background: '#fff', padding: '72px 24px' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: BLUE, marginBottom: 10 }}>
              {t.whatLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 12, color: DARK }}>
              {t.whatTitle}
            </motion.h2>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 15, color: BODY, marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
              {t.whatBody}
            </motion.p>
            <motion.div variants={fadeUp} style={{ maxWidth: 340, margin: '0 auto', background: '#FAFBFD', borderRadius: 24, padding: '28px 24px', border: '1px solid #EEF2F7', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED, marginBottom: 12 }}>{t.exampleLabel}</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: 'rgba(212,96,122,0.08)', border: `4px solid ${PINK}33`, marginBottom: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: PINK }}>2.3</span>
              </div>
              <p style={{ fontSize: 16, fontWeight: 800, color: DARK, marginBottom: 16 }}>
                {lang === 'nl' ? 'Van Binnen Naar Buiten' : 'Inside-Out'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CxRadarChart scores={SAMPLE_SCORES} size={220} primaryColor={PINK} />
              </div>
              <p style={{ fontSize: 11, color: MUTED, marginTop: 12, fontStyle: 'italic' }}>{t.exampleCaption}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── 6 Dimensions ── */}
      <section style={{ background: '#FAFBFD', padding: '72px 24px' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: PINK, marginBottom: 10 }}>
              {t.dimsLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 12, color: DARK }}>
              {t.dimsTitle}
            </motion.h2>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 15, color: BODY, marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
              {t.dimsBody}
            </motion.p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DIMENSIONS.map((d, i) => {
                const isPink = i % 2 === 1
                return (
                  <motion.div
                    key={d.id}
                    variants={fadeUp}
                    style={{
                      borderRadius: 18, padding: '24px 22px',
                      background: isPink ? PINK_LIGHT : BLUE_LIGHT,
                      border: `1px solid ${isPink ? PINK : BLUE}22`,
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 12 }}>{d.icon}</div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: isPink ? PINK : BLUE, marginBottom: 6 }}>{d.name}</p>
                    <p style={{ fontSize: 13, color: BODY, lineHeight: 1.6 }}>{d.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Marije — built by ── */}
      <section style={{ background: '#fff', padding: '80px 24px' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: BLUE, marginBottom: 10 }}>
              {t.guideLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 40, color: DARK }}>
              {t.guideTitle}
            </motion.h2>

            <motion.div
              variants={fadeUp}
              style={{ background: '#FAFBFD', borderRadius: 28, padding: '40px', border: '1px solid #EEF2F7', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}
            >
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* Photo */}
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    width: 140, height: 140, borderRadius: '50%', overflow: 'hidden',
                    border: `4px solid ${PINK}33`,
                    boxShadow: `0 8px 32px rgba(212,96,122,0.15)`,
                  }}>
                    <img
                      src="/marije-gast.png"
                      alt="Marije Gast"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: DARK, marginBottom: 4 }}>Marije Gast</h3>
                  <p style={{ fontSize: 13, fontWeight: 700, color: PINK, marginBottom: 16 }}>
                    {t.marije.role}
                  </p>
                  <blockquote style={{ fontSize: 16, fontWeight: 600, color: DARK, lineHeight: 1.65, borderLeft: `3px solid ${PINK}`, paddingLeft: 16, marginBottom: 16 }}>
                    {t.marije.quote}
                  </blockquote>
                  <p style={{ fontSize: 14, color: BODY, lineHeight: 1.7 }}>
                    {t.marije.bio}
                  </p>
                </div>
              </div>
            </motion.div>
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
                  background: `linear-gradient(135deg, ${PINK}, #E8607A)`,
                  color: '#fff', fontWeight: 700, fontSize: 16,
                  padding: '16px 40px', borderRadius: 100, textDecoration: 'none',
                  boxShadow: '0 12px 32px rgba(212,96,122,0.3)',
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
          <div className="flex items-center gap-3">
            <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: `1.5px solid ${PINK}33` }}>
              <img src="/marije-gast.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: 13, color: MUTED }}>{t.footerRole}</span>
          </div>
          <p style={{ fontSize: 12, color: MUTED }}>{t.footerCopy} · {new Date().getFullYear()}</p>
        </div>
      </footer>

    </div>
  )
}
