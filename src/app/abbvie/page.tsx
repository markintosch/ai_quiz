'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { getAbbvieContent, scoreColour } from '@/products/abbvie/data'
import CxRadarChart from '@/components/cx/RadarChart'

// ── Brand tokens ─────────────────────────────────────────────────────────────
const PURPLE       = '#6B2D8B'
const PURPLE_LIGHT = '#F0E8F7'
const PURPLE_MID   = '#9B59B6'
const DARK_PURPLE  = '#2D1247'
const BLUE         = '#0072CE'
const DARK         = '#1A0E2B'
const BODY         = '#4A5568'
const MUTED        = '#94A3B8'

// ── Animation helpers ─────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
}

// ── Sample radar scores (illustrative — not real patient data) ────────────────
const SAMPLE_SCORES = {
  identification: 2.5,
  biomarkers:     3.0,
  sequencing:     2.8,
  mdt:            2.2,
  monitoring:     2.0,
  sdm:            1.8,
}

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  en: {
    navLabel:    'CLL Clinical Practice Optimiser',
    startCta:    'Start assessment →',
    badge:       'Non-promotional · For Healthcare Professionals',
    heroTitle1:  'How does your CLL practice',
    heroAccent:  'measure up to best practice',
    heroTitle2:  '?',
    heroBody:    'In 15 minutes, review your own practice across 6 clinical dimensions aligned with EHA/ESMO guidelines — patient identification, biomarker testing, treatment sequencing, MDT, monitoring, and shared decision-making.',
    heroCta:     'Start the self-assessment →',
    trustLine:   '24 questions · 6 clinical dimensions · ~15 minutes · Confidential',
    howLabel:    'How it works',
    howTitle:    'Three steps to clinical clarity',
    steps: [
      { n: '01', title: 'Select your role',      body: 'Whether you\'re a treating haematologist, fellow, nurse practitioner, or department head — the context is yours.' },
      { n: '02', title: 'Rate your own practice', body: 'Work through 24 questions across 6 dimensions. Be honest — this is for your eyes only. No right or wrong answer.' },
      { n: '03', title: 'See your picture',       body: 'Get a radar chart, dimension scores, and your 3 biggest opportunities to move towards best-practice CLL care.' },
    ],
    whatLabel:      'What you receive',
    whatTitle:      'Your CLL Practice Radar',
    whatBody:       'An honest snapshot of where your practice stands — and where targeted attention can have the biggest clinical impact.',
    exampleLabel:   'Example result',
    exampleScore:   'Guideline-Aligned',
    exampleCaption: 'Illustrative — your results reflect your actual practice',
    dimsLabel:      'The 6 clinical dimensions',
    dimsTitle:      'A complete picture of CLL practice quality',
    dimsBody:       'Each dimension maps to an area of CLL management where best-practice adherence directly impacts patient outcomes.',
    whyLabel:       'Why it matters',
    whyTitle:       'CLL care is evolving faster than practice',
    whyCards: [
      { icon: '🧬', title: 'Molecular testing gaps',      body: 'Studies show IGHV and TP53 testing remains inconsistent across European centres — creating avoidable treatment inequity.' },
      { icon: '📋', title: 'Guideline alignment',         body: 'EHA/ESMO guidelines are updated regularly. Systematic self-review helps ensure your sequencing decisions reflect current evidence.' },
      { icon: '🤝', title: 'Shared decision-making',      body: 'Time-limited therapy options have changed the patient conversation. Structured SDM improves adherence and patient experience.' },
    ],
    levelsTitle: 'Four levels of clinical practice maturity',
    levels: [
      { label: 'Best Practice Leader',    score: '3.5 – 4.0', desc: 'Your practice fully reflects current guidelines across all dimensions. You are a model for peer learning and quality improvement.',   bg: PURPLE_LIGHT, border: PURPLE,    text: PURPLE },
      { label: 'Guideline-Aligned',       score: '2.5 – 3.4', desc: 'Strong alignment with EHA/ESMO guidelines. A few areas remain where structured systematisation could raise the bar further.',       bg: '#E5F3FF',    border: BLUE,      text: BLUE },
      { label: 'Developing Practice',     score: '1.5 – 2.4', desc: 'Core principles are in place but applied inconsistently. Targeted focus on 2–3 dimensions will have meaningful patient impact.',     bg: '#FEF3C7',    border: '#D97706', text: '#D97706' },
      { label: 'Emerging Practice',       score: '1.0 – 1.5', desc: 'Significant gaps relative to current best practice. A structured development plan across multiple dimensions is recommended.',       bg: '#FDF0F3',    border: '#E05A7A', text: '#E05A7A' },
    ],
    ctaTitle: 'Ready to see your clinical practice picture?',
    ctaBody:  'The assessment takes 15 minutes. Your results are entirely confidential — no data is stored, shared, or linked to your identity or institution.',
    ctaBtn:   'Start the assessment →',
    ctaTrust: 'Free · Confidential · No login required · Results in your browser only',
    disclaimer: 'This is a non-promotional, educational self-assessment tool. It does not constitute medical advice or clinical guidance. Results are indicative and for personal professional reflection only.',
    footerCopy: 'CLL Clinical Practice Optimiser',
  },
  nl: {
    navLabel:    'CLL Klinische Praktijkoptimalisatie',
    startCta:    'Start assessment →',
    badge:       'Niet-promotioneel · Voor Zorgprofessionals',
    heroTitle1:  'Hoe verhoudt uw CLL-praktijk zich',
    heroAccent:  'tot de huidige best practice',
    heroTitle2:  '?',
    heroBody:    'Beoordeel uw eigen praktijk in 15 minuten op 6 klinische dimensies in lijn met EHA/ESMO-richtlijnen — patiëntidentificatie, biomarkertests, behandelsequencing, MDO, monitoring en gedeelde besluitvorming.',
    heroCta:     'Start de zelfevaluatie →',
    trustLine:   '24 vragen · 6 klinische dimensies · ~15 minuten · Vertrouwelijk',
    howLabel:    'Hoe het werkt',
    howTitle:    'Drie stappen naar klinische duidelijkheid',
    steps: [
      { n: '01', title: 'Selecteer uw rol',         body: 'Of u nu behandelend hematoloog, AIOS, verpleegkundig specialist of afdelingshoofd bent — de context is die van u.' },
      { n: '02', title: 'Beoordeel uw eigen praktijk', body: 'Beantwoord 24 vragen over 6 dimensies. Wees eerlijk — dit is alleen voor uzelf. Er is geen goed of fout antwoord.' },
      { n: '03', title: 'Bekijk uw profiel',         body: 'Ontvang een radargrafiek, dimensiescores en uw 3 grootste kansen om richting best-practice CLL-zorg te bewegen.' },
    ],
    whatLabel:      'Wat u ontvangt',
    whatTitle:      'Uw CLL Praktijk Radar',
    whatBody:       'Een eerlijk beeld van waar uw praktijk staat — en waar gerichte aandacht de grootste klinische impact kan hebben.',
    exampleLabel:   'Voorbeeldresultaat',
    exampleScore:   'Richtlijnconform',
    exampleCaption: 'Illustratief — uw resultaten weerspiegelen uw eigen praktijk',
    dimsLabel:      'De 6 klinische dimensies',
    dimsTitle:      'Een volledig beeld van CLL-praktijkkwaliteit',
    dimsBody:       'Elke dimensie correspondeert met een gebied van CLL-management waar best-practice-naleving directe impact heeft op patiëntuitkomsten.',
    whyLabel:       'Waarom het ertoe doet',
    whyTitle:       'CLL-zorg evolueert sneller dan de praktijk',
    whyCards: [
      { icon: '🧬', title: 'Lacunes in moleculaire testing',  body: 'Onderzoek toont aan dat IGHV- en TP53-testen inconsistent blijft in Europese centra — wat vermijdbare ongelijkheid in behandeling creëert.' },
      { icon: '📋', title: 'Richtlijnafstemming',             body: 'EHA/ESMO-richtlijnen worden regelmatig bijgewerkt. Systematische zelfreview helpt garanderen dat uw sequencingbeslissingen huidig bewijs weerspiegelen.' },
      { icon: '🤝', title: 'Gedeelde besluitvorming',         body: 'Tijdgebonden therapieopties hebben het patiëntgesprek veranderd. Gestructureerde GDB verbetert therapietrouw en patiëntervaring.' },
    ],
    levelsTitle: 'Vier niveaus van klinische praktijkvolwassenheid',
    levels: [
      { label: 'Best Practice Leider',      score: '3.5 – 4.0', desc: 'Uw praktijk weerspiegelt volledig de huidige richtlijnen op alle dimensies. U bent een voorbeeld voor peer learning en kwaliteitsverbetering.',  bg: PURPLE_LIGHT, border: PURPLE,    text: PURPLE },
      { label: 'Richtlijnconform',          score: '2.5 – 3.4', desc: 'Sterke afstemming op EHA/ESMO-richtlijnen. Enkele gebieden waar systematisering de lat verder kan verhogen.',                                   bg: '#E5F3FF',    border: BLUE,      text: BLUE },
      { label: 'Praktijk in Ontwikkeling',  score: '1.5 – 2.4', desc: 'Kernprincipes zijn aanwezig maar inconsistent toegepast. Gerichte focus op 2–3 dimensies heeft betekenisvolle patiëntimpact.',                  bg: '#FEF3C7',    border: '#D97706', text: '#D97706' },
      { label: 'Opkomende Praktijk',        score: '1.0 – 1.5', desc: 'Significante lacunes ten opzichte van huidige best practice. Een gestructureerd ontwikkelplan over meerdere dimensies is aanbevolen.',            bg: '#FDF0F3',    border: '#E05A7A', text: '#E05A7A' },
    ],
    ctaTitle: 'Klaar om uw klinische praktijk in beeld te brengen?',
    ctaBody:  'Het assessment duurt 15 minuten. Uw resultaten zijn volledig vertrouwelijk — er worden geen gegevens opgeslagen, gedeeld of gekoppeld aan uw identiteit of instelling.',
    ctaBtn:   'Start het assessment →',
    ctaTrust: 'Gratis · Vertrouwelijk · Geen login vereist · Resultaten alleen in uw browser',
    disclaimer: 'Dit is een niet-promotioneel, educatief zelfevaluatie-instrument. Het vormt geen medisch advies of klinische richtlijn. Resultaten zijn indicatief en uitsluitend bedoeld voor persoonlijke professionele reflectie.',
    footerCopy: 'CLL Klinische Praktijkoptimalisatie',
  },
}

export default function AbbvieLandingPage() {
  const [lang, setLang] = useState<'en'|'nl'>('nl')
  const t = T[lang]
  const { DIMENSIONS } = getAbbvieContent(lang)
  const assessHref = lang === 'nl' ? '/abbvie/assess?lang=nl' : '/abbvie/assess'
  const sampleScoreColour = scoreColour(2.8)

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: DARK, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ── Nav ── */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #EEF2F7', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: PURPLE, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 18 }}>🩺</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: DARK, lineHeight: 1.2 }}>AbbVie</p>
              <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.2 }}>{t.navLabel}</p>
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
                background: PURPLE, color: '#fff', fontSize: 13, fontWeight: 700,
                padding: '8px 20px', borderRadius: 100, textDecoration: 'none',
              }}
            >
              {t.startCta}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HCP badge strip ── */}
      <div style={{ background: DARK_PURPLE, padding: '6px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#ffffff99', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {t.badge}
        </p>
      </div>

      {/* ── Hero ── */}
      <section style={{ background: '#fff', paddingTop: 80, paddingBottom: 88 }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div variants={stagger} initial="hidden" animate="show">

            <motion.h1
              variants={fadeUp}
              style={{ fontSize: 'clamp(28px, 4.5vw, 50px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 20, color: DARK }}
            >
              {t.heroTitle1}{' '}
              <span style={{ color: PURPLE }}>{t.heroAccent}</span>
              {t.heroTitle2}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              style={{ fontSize: 17, color: BODY, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 36px' }}
            >
              {t.heroBody}
            </motion.p>

            <motion.div variants={fadeUp}>
              <Link
                href={assessHref}
                style={{
                  display: 'inline-block',
                  background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_MID})`,
                  color: '#fff', fontWeight: 700, fontSize: 16,
                  padding: '16px 40px', borderRadius: 100, textDecoration: 'none',
                  boxShadow: `0 12px 32px ${PURPLE}44`,
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

      {/* ── How it works ── */}
      <section style={{ padding: '72px 24px', background: '#FAFBFD' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: PURPLE, marginBottom: 10 }}>
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
                    background: i === 1 ? DARK_PURPLE : PURPLE_LIGHT,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800,
                    color: i === 1 ? '#fff' : PURPLE,
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
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: PURPLE, marginBottom: 10 }}>
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
                <span style={{ fontSize: 24, fontWeight: 900, color: sampleScoreColour.bg }}>2.8</span>
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
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: PURPLE, marginBottom: 10 }}>
              {t.whyLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 48, color: DARK }}>
              {t.whyTitle}
            </motion.h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {t.whyCards.map((c, i) => (
                <motion.div key={i} variants={fadeUp} style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', border: '1px solid #EEF2F7', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{c.icon}</div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: PURPLE, marginBottom: 8 }}>{c.title}</p>
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
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: PURPLE, marginBottom: 10 }}>
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
                      background: isDark ? DARK_PURPLE : PURPLE_LIGHT,
                      border: `1px solid ${isDark ? '#ffffff11' : PURPLE + '22'}`,
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 12 }}>{d.icon}</div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: isDark ? '#E5D5F5' : PURPLE, marginBottom: 6 }}>{d.name}</p>
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
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, color: DARK, marginBottom: 16, lineHeight: 1.2 }}>
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
                  background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_MID})`,
                  color: '#fff', fontWeight: 700, fontSize: 16,
                  padding: '16px 40px', borderRadius: 100, textDecoration: 'none',
                  boxShadow: `0 12px 32px ${PURPLE}44`,
                }}
              >
                {t.ctaBtn}
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} style={{ fontSize: 12, color: MUTED, marginTop: 16 }}>
              {t.ctaTrust}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #EEF2F7', background: '#fff', padding: '28px 24px' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div style={{ width: 24, height: 24, borderRadius: 6, background: PURPLE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🩺</div>
            <span style={{ fontSize: 13, color: MUTED }}>AbbVie — {t.footerCopy}</span>
          </div>
          <p style={{ fontSize: 12, color: MUTED, textAlign: 'center', maxWidth: 480 }}>{t.disclaimer}</p>
        </div>
      </footer>

    </div>
  )
}
