'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const INK        = '#0F172A'   // hero / dark sections
const NAVY       = '#1E3A5F'   // secondary dark
const WHITE      = '#FFFFFF'
const LIGHT      = '#F8FAFC'   // light section bg
const ACCENT     = '#1D4ED8'   // blue primary
const WARM       = '#D97706'   // amber accent
const WARM_LIGHT = '#FEF3C7'   // amber pastel
const BODY       = '#374151'
const MUTED      = '#94A3B8'
const BORDER     = '#E2E8F0'

// ── Calendly URLs ─────────────────────────────────────────────────────────────
const CALENDLY_INTAKE   = 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'
const CALENDLY_STRATEGY = 'https://calendly.com/markiesbpm/ai-strategy-session'

// ── Animation helpers ─────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.10 } },
}

// ── Content ───────────────────────────────────────────────────────────────────
const T = {
  nl: {
    navName:    'Mark de Kock',
    navRole:    'AI Transition Mentor',
    navCta:     'Plan gesprek →',
    heroBadge:  'AI Transition Mentoring · Max. 5 deelnemers per cohort',
    heroH1a:    'Ik help directeuren hun organisatie',
    heroH1b:    'door de AI-transitie leiden.',
    heroBody:   'Niet met trainingen en theorie. Met een werkende AI-toepassing in jouw eigen bedrijf, en het strategisch inzicht om je team te sturen.',
    heroCta1:   'Plan een intakegesprek →',
    heroCta2:   'Doe eerst de gratis AI-scan',
    heroTrust:  '3 maanden · Max. 5 deelnemers · Intake vereist',

    probLabel:  'De realiteit',
    probTitle:  'Waarom AI-trajecten bij directeuren stranden',
    probItems: [
      { icon: '📤', title: 'Delegeren zonder richting',   body: 'AI wordt weggezet bij IT of marketing, terwijl strategische keuzes — wat bouwen we, voor wie, waarom — bij de top horen.' },
      { icon: '🛠️', title: 'Tools kopen voor het probleem duidelijk is', body: 'Abonnementen op Copilot, ChatGPT Teams, Notion AI. Maar wat lost het op? Voor wie? Het antwoord blijft vaag.' },
      { icon: '🎤', title: 'Inspiratie zonder concrete stap',  body: 'Keynotes, workshops, een AI-dag. Maandag is het weer business as usual. Geen eigenaar, geen deadline, geen output.' },
    ],

    forLabel:   'Voor wie',
    forTitle:   'Dit programma is voor jou als...',
    forItems: [
      { icon: '🧭', text: 'Je begrijpt dat AI er toe doet, maar je weet niet precies waar jouw organisatie moet beginnen.' },
      { icon: '⏱️', text: 'Je hebt geen tijd om zelf een AI-cursus te volgen, maar wilt wel regie houden over de richting.' },
      { icon: '🏗️', text: 'Je hebt al initiatieven gezien die niet landden — en wil nu een aanpak die wél iets oplevert.' },
      { icon: '💬', text: 'Je wil intern geloofwaardig zijn over AI: tegenover je team, je board, je klanten.' },
    ],

    areasLabel: 'Wat we aanpakken',
    areasTitle: 'Zes gebieden. Één organisatie. Jouw situatie.',
    areasBody:  'We werken samen langs dezelfde 6 dimensies die ik gebruik om AI-volwassenheid in organisaties te meten — nu gericht op jouw specifieke context.',
    areas: [
      { icon: '🧭', title: 'Strategie & Visie',        body: 'Waar zit AI in jouw businessmodel? Wat is de rol van de directeur? We leggen een helder fundament.' },
      { icon: '🛡️', title: 'Governance & Risico',      body: 'Welke besluiten neem jij zelf, wat delegeer je, en hoe voorkom je dat AI-risico\'s jou verrassen?' },
      { icon: '⚡', title: 'Huidige toepassingen',      body: 'Wat gebruikt je team al? Wat werkt, wat niet? We maken de onzichtbare AI-activiteit zichtbaar.' },
      { icon: '🗄️', title: 'Data & Infrastructuur',    body: 'Je hoeft geen techneut te zijn. Maar je moet weten welke vragen je moet stellen over jouw data.' },
      { icon: '🧑‍💻', title: 'Talent & Cultuur',        body: 'Hoe krijg je je team mee? Wie zijn de trekkers? Hoe bouw je AI-capaciteit zonder iedereen te overbelasten?' },
      { icon: '🔍', title: 'Kansen & Prioriteiten',    body: 'Samen bepalen we de één use case die in 3 maanden concreet wordt — met meetbaar resultaat.' },
    ],

    programLabel: 'Het programma',
    programTitle: 'Drie maanden. Eén werkende use case. Blijvend inzicht.',
    programMonths: [
      {
        n: '01', title: 'Inzicht',
        body: 'We brengen jouw organisatie in kaart op de 6 dimensies. Waar staat je team? Wat loopt al? Waar zitten de blinde vlekken? Je verlaat maand 1 met een eerlijk beeld en een heldere prioriteit.',
        tag: 'Maand 1',
      },
      {
        n: '02', title: 'Toepassing',
        body: 'We bouwen samen — of begeleid ik het bouwen van — een eerste werkende AI-toepassing in jouw bedrijf. Geen demo. Iets wat je morgen kunt gebruiken en aan je team kunt laten zien.',
        tag: 'Maand 2',
      },
      {
        n: '03', title: 'Richting',
        body: 'We verankeren wat je hebt geleerd. Je krijgt een AI-visie die past bij jouw organisatie, een framework voor toekomstige beslissingen, en de taal om intern en extern het gesprek te leiden.',
        tag: 'Maand 3',
      },
    ],

    proofLabel:  'Bewijs',
    proofTitle:  'Ik bouw tools voor echte organisaties.',
    proofBody:   'Geen powerpoints. Geen generiek advies. Dit zijn toepassingen die ik gebouwd heb voor complexe sectoren — dezelfde aanpak breng ik mee naar jouw mentortraject.',
    proofItems: [
      { icon: '💜', color: '#6B2D8B', title: 'CLL Clinical Practice Optimiser', client: 'Gezondheidszorg · AbbVie', body: 'Zelfevaluatie voor hematologen op 6 klinische dimensies. Gebouwd voor gebruik door MSLs in bestaande klantkontacten.' },
      { icon: '♻️', color: '#398684', title: 'Circular Readiness Assessment',    client: 'Vastgoed · Madaster',     body: 'Circulaire rijpheid meten op 6 dimensies. CSRD-gereed, direct inzetbaar voor vastgoedbeheerders en projectontwikkelaars.' },
      { icon: '⭐', color: '#1D4ED8', title: 'CX Maturity Assessment',           client: 'Customer Experience',     body: 'Klantgerichtheid meten van productgericht tot klantgedreven. Met sectorspecifieke benchmarks en uitvoerbare aanbevelingen.' },
    ],

    aboutLabel: 'Over Mark',
    aboutTitle: 'Ik ben practitioner. Geen trainer.',
    aboutBody1: 'Ik bouw AI-tools voor organisaties in complexe sectoren: gezondheidszorg, duurzaamheid, klantbeleving. Niet als concept — als werkende software die mensen dagelijks gebruiken.',
    aboutBody2: 'Ik mentor directeuren omdat ik zie dat de grootste blokkade niet technisch is. Het is het ontbreken van strategische richting van bovenaf. Dat is precies waar ik het meeste waarde toevoeg.',
    aboutCredentials: ['Bouwt AI-toepassingen voor Fortune 500 en scale-ups', 'Werkt in Nederlands, Engels en Frans', 'Actief in gezondheidszorg, duurzaamheid en CX'],

    spotsLabel:  'Beschikbaarheid',
    spotsTitle:  'Vijf plekken per cohort.',
    spotsBody:   'Ik werk met een kleine groep zodat de begeleiding écht persoonlijk is. Het Q2 2026-cohort gaat binnenkort van start. Aanmelden via een kort intakegesprek.',
    spotsCta1:   'Plan een intakegesprek →',
    spotsCta2:   'Liever een strategiegesprek →',
    spotsTrust:  'Gratis intake · Geen verplichtingen · Ik laat je weten of er een match is',

    footerCopy:  'AI Transition Mentor',
    footerSub:   'markdekock.com',
  },
  en: {
    navName:    'Mark de Kock',
    navRole:    'AI Transition Mentor',
    navCta:     'Book a call →',
    heroBadge:  'AI Transition Mentoring · Max. 5 participants per cohort',
    heroH1a:    'I help executives lead their organisation',
    heroH1b:    'through the AI transition.',
    heroBody:   'Not with training and theory. With a working AI application in your own business, and the strategic clarity to direct your team.',
    heroCta1:   'Book an intake call →',
    heroCta2:   'Take the free AI scan first',
    heroTrust:  '3 months · Max. 5 participants · Intake required',

    probLabel:  'The reality',
    probTitle:  'Why AI initiatives stall at C-level',
    probItems: [
      { icon: '📤', title: 'Delegating without direction',   body: 'AI gets handed to IT or marketing, while strategic choices — what to build, for whom, why — belong at the top.' },
      { icon: '🛠️', title: 'Buying tools before the problem is clear', body: 'Subscriptions to Copilot, ChatGPT Teams, Notion AI. But what does it solve? For whom? The answer stays vague.' },
      { icon: '🎤', title: 'Inspiration without a concrete step',  body: 'Keynotes, workshops, an AI day. Monday it\'s business as usual again. No owner, no deadline, no output.' },
    ],

    forLabel:   'Who this is for',
    forTitle:   'This programme is for you if...',
    forItems: [
      { icon: '🧭', text: 'You understand AI matters, but aren\'t sure where your organisation should start.' },
      { icon: '⏱️', text: 'You don\'t have time to take an AI course, but want to stay in control of the direction.' },
      { icon: '🏗️', text: 'You\'ve seen initiatives fail to land — and want an approach that actually produces output.' },
      { icon: '💬', text: 'You want to be credible on AI: with your team, your board, your clients.' },
    ],

    areasLabel: 'What we work on',
    areasTitle: 'Six areas. One organisation. Your situation.',
    areasBody:  'We work together across the same 6 dimensions I use to measure AI maturity in organisations — focused entirely on your specific context.',
    areas: [
      { icon: '🧭', title: 'Strategy & Vision',        body: 'Where does AI sit in your business model? What is the executive\'s role? We build a clear foundation.' },
      { icon: '🛡️', title: 'Governance & Risk',        body: 'Which decisions do you own, what do you delegate, and how do you avoid being surprised by AI risks?' },
      { icon: '⚡', title: 'Current Usage',             body: 'What is your team already using? What works, what doesn\'t? We make invisible AI activity visible.' },
      { icon: '🗄️', title: 'Data & Infrastructure',    body: 'You don\'t need to be technical. But you need to know which questions to ask about your data.' },
      { icon: '🧑‍💻', title: 'Talent & Culture',        body: 'How do you bring your team along? Who are the champions? How do you build AI capacity without burning people out?' },
      { icon: '🔍', title: 'Opportunities & Priorities', body: 'Together we identify the one use case that becomes concrete in 3 months — with measurable output.' },
    ],

    programLabel: 'The programme',
    programTitle: 'Three months. One working use case. Lasting clarity.',
    programMonths: [
      {
        n: '01', title: 'Insight',
        body: 'We map your organisation across the 6 dimensions. Where is your team? What\'s already running? Where are the blind spots? You leave month 1 with an honest picture and a clear priority.',
        tag: 'Month 1',
      },
      {
        n: '02', title: 'Application',
        body: 'Together — or with my guidance — we build a first working AI application in your business. Not a demo. Something you can use tomorrow and show your team.',
        tag: 'Month 2',
      },
      {
        n: '03', title: 'Direction',
        body: 'We embed what you\'ve learned. You leave with an AI vision that fits your organisation, a framework for future decisions, and the language to lead the conversation internally and externally.',
        tag: 'Month 3',
      },
    ],

    proofLabel:  'Proof',
    proofTitle:  'I build tools for real organisations.',
    proofBody:   'No PowerPoints. No generic advice. These are applications I\'ve built for complex sectors — the same approach I bring to your mentorship.',
    proofItems: [
      { icon: '💜', color: '#6B2D8B', title: 'CLL Clinical Practice Optimiser', client: 'Healthcare · AbbVie', body: 'Self-assessment for haematologists across 6 clinical dimensions. Built for use by MSLs in existing client visits.' },
      { icon: '♻️', color: '#398684', title: 'Circular Readiness Assessment',    client: 'Real estate · Madaster', body: 'Circular maturity across 6 dimensions. CSRD-ready, immediately deployable for asset managers and developers.' },
      { icon: '⭐', color: '#1D4ED8', title: 'CX Maturity Assessment',           client: 'Customer Experience',    body: 'Measuring customer-centricity from product-focused to customer-driven. With sector benchmarks and actionable recommendations.' },
    ],

    aboutLabel: 'About Mark',
    aboutTitle: 'I\'m a practitioner. Not a trainer.',
    aboutBody1: 'I build AI tools for organisations in complex sectors: healthcare, sustainability, customer experience. Not as concepts — as working software people use every day.',
    aboutBody2: 'I mentor executives because I see that the biggest blocker is not technical. It\'s the absence of strategic direction from the top. That\'s exactly where I add the most value.',
    aboutCredentials: ['Builds AI applications for Fortune 500 and scale-ups', 'Works in Dutch, English and French', 'Active in healthcare, sustainability and CX'],

    spotsLabel:  'Availability',
    spotsTitle:  'Five spots per cohort.',
    spotsBody:   'I work with a small group to keep the mentoring genuinely personal. The Q2 2026 cohort is opening soon. Apply via a short intake call.',
    spotsCta1:   'Book an intake call →',
    spotsCta2:   'Prefer a strategy session →',
    spotsTrust:  'Free intake · No obligations · I\'ll let you know if there\'s a fit',

    footerCopy:  'AI Transition Mentor',
    footerSub:   'markdekock.com',
  },
}

export default function MentorPage() {
  const [lang, setLang] = useState<'nl'|'en'>('nl')
  const t = T[lang]

  return (
    <div style={{ minHeight: '100vh', background: WHITE, color: INK, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ── Nav ── */}
      <nav style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Monogram + name */}
          <div className="flex items-center gap-3">
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: WHITE, fontFamily: 'serif' }}>M</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: INK, lineHeight: 1.2 }}>{t.navName}</p>
              <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.2 }}>{t.navRole}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Lang toggle */}
            <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 100, padding: 3, gap: 2 }}>
              {(['nl', 'en'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                    background: lang === l ? WHITE : 'transparent',
                    color: lang === l ? INK : MUTED,
                    border: 'none', cursor: 'pointer',
                    boxShadow: lang === l ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <a
              href={CALENDLY_INTAKE}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: WARM, color: WHITE, fontSize: 13, fontWeight: 700,
                padding: '8px 20px', borderRadius: 100, textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {t.navCta}
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: INK, paddingTop: 96, paddingBottom: 104 }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div variants={stagger} initial="hidden" animate="show">

            <motion.div variants={fadeUp}>
              <span style={{
                display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: WARM, background: `${WARM}22`,
                padding: '5px 16px', borderRadius: 100, marginBottom: 32,
                border: `1px solid ${WARM}44`,
              }}>
                {t.heroBadge}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              style={{ fontSize: 'clamp(30px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, color: WHITE }}
            >
              {t.heroH1a}{' '}
              <span style={{
                background: `linear-gradient(135deg, ${WARM}, #F59E0B)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {t.heroH1b}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              style={{ fontSize: 18, color: '#CBD5E1', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 40px' }}
            >
              {t.heroBody}
            </motion.p>

            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href={CALENDLY_INTAKE}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  background: WARM,
                  color: WHITE, fontWeight: 700, fontSize: 16,
                  padding: '16px 40px', borderRadius: 100, textDecoration: 'none',
                  boxShadow: `0 12px 32px ${WARM}55`,
                }}
              >
                {t.heroCta1}
              </a>
              <a
                href="/"
                style={{
                  display: 'inline-block',
                  background: 'transparent',
                  color: '#94A3B8', fontWeight: 600, fontSize: 15,
                  padding: '16px 32px', borderRadius: 100, textDecoration: 'none',
                  border: '1px solid #334155',
                }}
              >
                {t.heroCta2}
              </a>
            </motion.div>

            <motion.p variants={fadeUp} style={{ fontSize: 13, color: '#475569', marginTop: 20 }}>
              {t.heroTrust}
            </motion.p>

          </motion.div>
        </div>
      </section>

      {/* ── Wave ── */}
      <div style={{ background: INK }}>
        <svg viewBox="0 0 1440 40" fill="none" style={{ display: 'block' }}>
          <path d="M0 0 Q360 40 720 20 Q1080 0 1440 30 L1440 40 L0 40Z" fill={WHITE} />
        </svg>
      </div>

      {/* ── The Problem ── */}
      <section style={{ background: WHITE, padding: '80px 24px' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: WARM, marginBottom: 10 }}>
              {t.probLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, marginBottom: 48, color: INK }}>
              {t.probTitle}
            </motion.h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {t.probItems.map((item, i) => (
                <motion.div key={i} variants={fadeUp} style={{
                  background: LIGHT, borderRadius: 20, padding: '28px 24px',
                  border: `1px solid ${BORDER}`,
                }}>
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{item.icon}</div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 8 }}>{item.title}</p>
                  <p style={{ fontSize: 14, color: BODY, lineHeight: 1.65 }}>{item.body}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section style={{ background: LIGHT, padding: '80px 24px' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT, marginBottom: 10 }}>
              {t.forLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, marginBottom: 40, color: INK }}>
              {t.forTitle}
            </motion.h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {t.forItems.map((item, i) => (
                <motion.div key={i} variants={fadeUp} style={{
                  background: WHITE, borderRadius: 16, padding: '20px 24px',
                  border: `1px solid ${BORDER}`,
                  display: 'flex', alignItems: 'flex-start', gap: 16,
                }}>
                  <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                  <p style={{ fontSize: 15, color: BODY, lineHeight: 1.65 }}>{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 6 Areas ── */}
      <section style={{ background: WHITE, padding: '80px 24px' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT, marginBottom: 10 }}>
              {t.areasLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, marginBottom: 12, color: INK }}>
              {t.areasTitle}
            </motion.h2>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 15, color: BODY, maxWidth: 480, margin: '0 auto 44px', lineHeight: 1.65 }}>
              {t.areasBody}
            </motion.p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.areas.map((a, i) => {
                const isDark = i % 2 === 1
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    style={{
                      borderRadius: 18, padding: '24px 22px',
                      background: isDark ? INK : LIGHT,
                      border: `1px solid ${isDark ? '#ffffff11' : BORDER}`,
                    }}
                  >
                    <div style={{ fontSize: 26, marginBottom: 12 }}>{a.icon}</div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: isDark ? WARM : ACCENT, marginBottom: 6 }}>{a.title}</p>
                    <p style={{ fontSize: 13, color: isDark ? '#CBD5E1' : BODY, lineHeight: 1.65 }}>{a.body}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Program ── */}
      <section style={{ background: NAVY, padding: '88px 24px' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: WARM, marginBottom: 10 }}>
              {t.programLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 800, marginBottom: 56, color: WHITE }}>
              {t.programTitle}
            </motion.h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {t.programMonths.map((m, i) => (
                <motion.div key={m.n} variants={fadeUp} style={{
                  background: `${WHITE}08`, borderRadius: 20, padding: '32px 24px',
                  border: `1px solid ${WHITE}15`,
                  position: 'relative',
                }}>
                  <div style={{
                    display: 'inline-block',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: WARM, background: `${WARM}22`, padding: '3px 12px',
                    borderRadius: 100, marginBottom: 20,
                    border: `1px solid ${WARM}33`,
                  }}>
                    {m.tag}
                  </div>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: i === 1 ? WARM : `${WHITE}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 900,
                    color: i === 1 ? WHITE : `${WHITE}99`,
                    marginBottom: 20,
                  }}>
                    {m.n}
                  </div>
                  <p style={{ fontSize: 18, fontWeight: 800, color: WHITE, marginBottom: 12 }}>{m.title}</p>
                  <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7 }}>{m.body}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Proof ── */}
      <section style={{ background: WHITE, padding: '80px 24px' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT, marginBottom: 10 }}>
              {t.proofLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, marginBottom: 12, color: INK }}>
              {t.proofTitle}
            </motion.h2>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 15, color: BODY, maxWidth: 480, margin: '0 auto 44px', lineHeight: 1.65 }}>
              {t.proofBody}
            </motion.p>
            <div className="grid sm:grid-cols-3 gap-6">
              {t.proofItems.map((p, i) => (
                <motion.div key={i} variants={fadeUp} style={{
                  background: LIGHT, borderRadius: 20, padding: '28px 24px',
                  border: `1px solid ${BORDER}`,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, marginBottom: 18,
                  }}>
                    {p.icon}
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: INK, marginBottom: 4 }}>{p.title}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: p.color, marginBottom: 10 }}>{p.client}</p>
                  <p style={{ fontSize: 13, color: BODY, lineHeight: 1.65 }}>{p.body}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── About ── */}
      <section style={{ background: LIGHT, padding: '80px 24px' }}>
        <div className="max-w-2xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: WARM, marginBottom: 24 }}>
              {t.aboutLabel}
            </motion.p>
            {/* Monogram avatar */}
            <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 24,
                background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 16px 48px ${INK}33`,
              }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: WHITE, fontFamily: 'serif' }}>M</span>
              </div>
            </motion.div>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, marginBottom: 20, color: INK }}>
              {t.aboutTitle}
            </motion.h2>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 16, color: BODY, lineHeight: 1.7, marginBottom: 16 }}>
              {t.aboutBody1}
            </motion.p>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 16, color: BODY, lineHeight: 1.7, marginBottom: 32 }}>
              {t.aboutBody2}
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360, margin: '0 auto' }}>
              {t.aboutCredentials.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: WARM, flexShrink: 0 }} />
                  <p style={{ fontSize: 14, color: BODY }}>{c}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Spots + CTA ── */}
      <section style={{ background: INK, padding: '100px 24px' }}>
        <div className="max-w-xl mx-auto text-center">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: WARM, marginBottom: 16 }}>
              {t.spotsLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 900, color: WHITE, marginBottom: 16, lineHeight: 1.1 }}>
              {t.spotsTitle}
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 17, color: '#94A3B8', marginBottom: 44, lineHeight: 1.7, maxWidth: 420, margin: '0 auto 44px' }}>
              {t.spotsBody}
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href={CALENDLY_INTAKE}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  background: WARM,
                  color: WHITE, fontWeight: 700, fontSize: 16,
                  padding: '16px 40px', borderRadius: 100, textDecoration: 'none',
                  boxShadow: `0 12px 32px ${WARM}55`,
                }}
              >
                {t.spotsCta1}
              </a>
              <a
                href={CALENDLY_STRATEGY}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  background: 'transparent',
                  color: '#94A3B8', fontWeight: 600, fontSize: 15,
                  padding: '16px 32px', borderRadius: 100, textDecoration: 'none',
                  border: '1px solid #334155',
                }}
              >
                {t.spotsCta2}
              </a>
            </motion.div>
            <motion.p variants={fadeUp} style={{ fontSize: 13, color: '#475569', marginTop: 24 }}>
              {t.spotsTrust}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid #1E293B`, background: '#080E1A', padding: '28px 24px' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div style={{ width: 24, height: 24, borderRadius: 6, background: INK, border: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: WHITE, fontFamily: 'serif' }}>M</div>
            <span style={{ fontSize: 13, color: '#475569' }}>{t.navName} — {t.footerCopy}</span>
          </div>
          <p style={{ fontSize: 12, color: '#334155' }}>{t.footerSub} · {new Date().getFullYear()}</p>
        </div>
      </footer>

    </div>
  )
}
