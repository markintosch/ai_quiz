'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { getCxContent } from '@/products/cx_essense/data'
import CxRadarChart from '@/components/cx/RadarChart'

// ── Brand tokens (Essense) ────────────────────────────────────────────────────
const GREEN       = '#24CF7A'
const GREEN_DARK  = '#044524'
const GREEN_LIGHT = '#EAF5F2'
const GREEN_MID   = '#D2F5E8'
const DARK        = '#1A1A2E'
const BODY        = '#374151'
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
    navRole: 'Hands-on CX Agency',
    startCta: 'Start assessment →',
    badge: 'CX Maturity Assessment',
    heroTitle1: 'How customer-centric is',
    heroAccent: 'your organisation',
    heroTitle2: '— really?',
    heroBody: 'In 15 minutes, discover where you genuinely stand across 6 dimensions of CX maturity — and get a practical starting point for what to do next.',
    heroCta: 'Start the assessment — it\'s free →',
    trustLine: '24 questions · 6 dimensions · ~15 minutes · No registration required',
    howLabel: 'How it works',
    howTitle: 'Three steps to clarity',
    steps: [
      { n: '01', title: 'Select your role',     body: 'Tell us where you sit in the organisation. Different roles see different things — that\'s the point.' },
      { n: '02', title: 'Answer 24 questions',  body: 'Rate your organisation honestly across 6 CX dimensions. No right or wrong — just where you are today.' },
      { n: '03', title: 'See your results',     body: 'Get a radar chart, dimension scores, and your top 3 priority gaps — a concrete starting point for action.' },
    ],
    whatLabel: 'What you get',
    whatTitle: 'Your personal CX radar',
    whatBody: 'See exactly where you stand on each dimension — and where to focus first.',
    exampleLabel: 'Example result',
    exampleCaption: 'Sample — your results reflect your actual organisation',
    dimsLabel: 'The 6 dimensions',
    dimsTitle: 'Where does customer-centricity live?',
    dimsBody: 'Each dimension reveals a different facet of CX maturity — together they form your complete picture.',
    guideLabel: 'About Essense',
    guideTitle: 'Built by CX practitioners',
    essense: {
      tagline: 'Hands-on CX Agency · Amsterdam · Making CX practical & operational',
      quote: '\u201cThe gap between CX ambition and CX reality is where organisations lose customers. We help you close it.\u201d',
      bio: 'Essense helps organisations make CX management practical and operational. We don\'t just advise — we embed in your team and deliver. From CX strategy and journey management to data-driven optimisation and operational excellence. This assessment is the starting point for that conversation.',
    },
    levelsTitle: 'Four levels of CX maturity',
    levels: [
      { label: 'CX-Led',           score: '3.5 – 4.0', desc: 'CX is embedded in strategy, culture and daily operations. You\'re building a sustainable competitive advantage.',    bg: GREEN_LIGHT, border: GREEN_DARK, text: GREEN_DARK },
      { label: 'Customer-Centric', score: '2.5 – 3.4', desc: 'You have good CX practices in place — now it\'s time to operationalise and govern them systematically.',            bg: GREEN_MID,   border: GREEN,      text: GREEN_DARK },
      { label: 'CX Emerging',      score: '1.5 – 2.4', desc: 'CX intentions are there, but internal processes and silos pull focus away from the customer.',                      bg: '#FEF3C7',   border: '#D97706',  text: '#D97706' },
      { label: 'Internally Driven',score: '1.0 – 1.5', desc: 'The organisation is primarily focused on internal goals. There\'s real opportunity here — and a clear path forward.', bg: '#FDF0F3',  border: '#E05A7A',  text: '#E05A7A' },
    ],
    ctaTitle: 'Ready to turn insight into action?',
    ctaBody: 'The assessment takes about 15 minutes. Your results are instant — and the beginning of something practical.',
    ctaBtn: 'Start the assessment →',
    ctaTrust: 'Free · No registration required · Results immediately',
    footerCopy: 'CX Maturity Assessment by Essense',
  },
  nl: {
    navRole: 'Hands-on CX bureau',
    startCta: 'Start assessment →',
    badge: 'CX Volwassenheidsassessment',
    heroTitle1: 'Hoe klantgericht is',
    heroAccent: 'jouw organisatie',
    heroTitle2: '— echt?',
    heroBody: 'Ontdek in 15 minuten waar je werkelijk staat op 6 dimensies van CX-volwassenheid — en krijg een praktisch startpunt voor wat je als volgende stap kunt doen.',
    heroCta: 'Start het assessment — gratis →',
    trustLine: '24 vragen · 6 dimensies · ~15 minuten · Geen registratie vereist',
    howLabel: 'Hoe het werkt',
    howTitle: 'Drie stappen naar duidelijkheid',
    steps: [
      { n: '01', title: 'Selecteer je rol',       body: 'Vertel ons waar je zit in de organisatie. Verschillende rollen zien verschillende dingen — dat is precies de bedoeling.' },
      { n: '02', title: 'Beantwoord 24 vragen',   body: 'Beoordeel je organisatie eerlijk op 6 CX-dimensies. Geen goed of fout — alleen waar je vandaag staat.' },
      { n: '03', title: 'Bekijk je resultaten',   body: 'Ontvang een radargrafiek, dimensiescores en je top 3 prioritaire verbeterpunten — een concreet startpunt voor actie.' },
    ],
    whatLabel: 'Wat je krijgt',
    whatTitle: 'Jouw persoonlijke CX-radar',
    whatBody: 'Zie precies waar je staat per dimensie — en waar je het eerst op moet focussen.',
    exampleLabel: 'Voorbeeldresultaat',
    exampleCaption: 'Voorbeeld — jouw resultaten weerspiegelen jouw werkelijke organisatie',
    dimsLabel: 'De 6 dimensies',
    dimsTitle: 'Waar leeft klantgerichtheid?',
    dimsBody: 'Elke dimensie onthult een ander facet van CX-volwassenheid — samen vormen ze jouw complete beeld.',
    guideLabel: 'Over Essense',
    guideTitle: 'Gebouwd door CX-practitioners',
    essense: {
      tagline: 'Hands-on CX bureau · Amsterdam · CX praktisch & operationeel maken',
      quote: '\u201cDe kloof tussen CX-ambitie en CX-realiteit is waar organisaties klanten verliezen. Wij helpen die te dichten.\u201d',
      bio: 'Essense helpt organisaties om CX-management praktisch en operationeel te maken. We adviseren niet alleen — we werken in jouw team en leveren resultaten. Van CX-strategie en journey management tot data-gedreven optimalisatie en operationele excellentie. Dit assessment is het startpunt voor dat gesprek.',
    },
    levelsTitle: 'Vier niveaus van CX-volwassenheid',
    levels: [
      { label: 'CX-gedreven',       score: '3.5 – 4.0', desc: 'CX is verankerd in strategie, cultuur en dagelijkse werkzaamheden. Je bouwt een duurzaam concurrentievoordeel op.',    bg: GREEN_LIGHT, border: GREEN_DARK, text: GREEN_DARK },
      { label: 'Klantgericht',      score: '2.5 – 3.4', desc: 'Je hebt goede CX-praktijken — nu is het tijd om ze systematisch te operationaliseren en te besturen.',                bg: GREEN_MID,   border: GREEN,      text: GREEN_DARK },
      { label: 'CX in Ontwikkeling',score: '1.5 – 2.4', desc: 'De intenties zijn er, maar interne processen en silo\'s trekken de aandacht weg van de klant.',                        bg: '#FEF3C7',   border: '#D97706',  text: '#D97706' },
      { label: 'Intern Gericht',    score: '1.0 – 1.5', desc: 'De organisatie focust primair op interne doelen. Hier ligt echte kans — en een duidelijk pad voorwaarts.',             bg: '#FDF0F3',   border: '#E05A7A',  text: '#E05A7A' },
    ],
    ctaTitle: 'Klaar om inzicht om te zetten in actie?',
    ctaBody: 'Het assessment duurt ongeveer 15 minuten. Jouw resultaten zijn direct beschikbaar — en het begin van iets praktisch.',
    ctaBtn: 'Start het assessment →',
    ctaTrust: 'Gratis · Geen registratie vereist · Direct resultaat',
    footerCopy: 'CX Volwassenheidsassessment door Essense',
  },
}

export default function CxEssenseLandingPage() {
  const [lang, setLang] = useState<'en'|'nl'>('nl')
  const t = T[lang]
  const { DIMENSIONS } = getCxContent(lang)
  const assessHref = lang === 'nl' ? '/cx_essense/assess?lang=nl' : '/cx_essense/assess'

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: DARK, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ── Nav ── */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #EEF2F7', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Essense wordmark */}
            <div style={{
              width: 36, height: 36, borderRadius: 10, overflow: 'hidden',
              background: GREEN_DARK,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ color: GREEN, fontSize: 18, fontWeight: 900, letterSpacing: -1 }}>e</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: DARK, lineHeight: 1.2 }}>Essense</p>
              <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.2 }}>{t.navRole}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
                background: GREEN, color: '#fff', fontSize: 13, fontWeight: 700,
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
                textTransform: 'uppercase', color: GREEN_DARK, background: GREEN_LIGHT,
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
              <span style={{ color: GREEN }}>{t.heroAccent}</span>
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
                  background: `linear-gradient(135deg, ${GREEN}, #1DB865)`,
                  color: '#fff', fontWeight: 700, fontSize: 16,
                  padding: '16px 40px', borderRadius: 100, textDecoration: 'none',
                  boxShadow: '0 12px 32px rgba(36,207,122,0.3)',
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
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: GREEN_DARK, marginBottom: 10 }}>
              {t.howLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 48, color: DARK }}>
              {t.howTitle}
            </motion.h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {t.steps.map((s, i) => (
                <motion.div key={s.n} variants={fadeUp} style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', border: '1px solid #EEF2F7', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: i === 1 ? GREEN_LIGHT : GREEN_MID, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: GREEN_DARK, marginBottom: 16 }}>
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
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: GREEN_DARK, marginBottom: 10 }}>
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
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: GREEN_LIGHT, border: `4px solid ${GREEN}33`, marginBottom: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: GREEN_DARK }}>2.3</span>
              </div>
              <p style={{ fontSize: 16, fontWeight: 800, color: DARK, marginBottom: 16 }}>
                {lang === 'nl' ? 'CX in Ontwikkeling' : 'CX Emerging'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CxRadarChart scores={SAMPLE_SCORES} size={220} primaryColor={GREEN} />
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
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: GREEN_DARK, marginBottom: 10 }}>
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
                const isAlt = i % 2 === 1
                return (
                  <motion.div
                    key={d.id}
                    variants={fadeUp}
                    style={{
                      borderRadius: 18, padding: '24px 22px',
                      background: isAlt ? GREEN_MID : GREEN_LIGHT,
                      border: `1px solid ${GREEN}22`,
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 12 }}>{d.icon}</div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: GREEN_DARK, marginBottom: 6 }}>{d.name}</p>
                    <p style={{ fontSize: 13, color: BODY, lineHeight: 1.6 }}>{d.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── About Essense ── */}
      <section style={{ background: '#fff', padding: '80px 24px' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: GREEN_DARK, marginBottom: 10 }}>
              {t.guideLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 40, color: DARK }}>
              {t.guideTitle}
            </motion.h2>

            <motion.div
              variants={fadeUp}
              style={{ background: GREEN_DARK, borderRadius: 28, padding: '40px', border: `1px solid ${GREEN}33` }}
            >
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* Logo mark */}
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    width: 100, height: 100, borderRadius: 20,
                    background: GREEN,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ color: GREEN_DARK, fontSize: 56, fontWeight: 900, letterSpacing: -3 }}>e</span>
                  </div>
                </div>

                {/* Bio */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Essense</h3>
                  <p style={{ fontSize: 13, fontWeight: 700, color: GREEN, marginBottom: 16 }}>
                    {t.essense.tagline}
                  </p>
                  <blockquote style={{ fontSize: 16, fontWeight: 600, color: '#fff', lineHeight: 1.65, borderLeft: `3px solid ${GREEN}`, paddingLeft: 16, marginBottom: 16 }}>
                    {t.essense.quote}
                  </blockquote>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
                    {t.essense.bio}
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
                  background: `linear-gradient(135deg, ${GREEN}, #1DB865)`,
                  color: '#fff', fontWeight: 700, fontSize: 16,
                  padding: '16px 40px', borderRadius: 100, textDecoration: 'none',
                  boxShadow: '0 12px 32px rgba(36,207,122,0.3)',
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
            <div style={{ width: 28, height: 28, borderRadius: 7, background: GREEN_DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: GREEN, fontSize: 16, fontWeight: 900 }}>e</span>
            </div>
            <span style={{ fontSize: 13, color: MUTED }}>Essense</span>
          </div>
          <p style={{ fontSize: 12, color: MUTED }}>{t.footerCopy} · {new Date().getFullYear()}</p>
        </div>
      </footer>

    </div>
  )
}
