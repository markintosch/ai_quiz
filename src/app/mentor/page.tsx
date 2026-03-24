'use client'

import { useState, useEffect } from 'react'
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
    heroBadge:  'AI Transition Mentoring · Max. 5 mensen tegelijk',
    heroH1a:    'Van AI-ambitie naar',
    heroH1b:    'iets wat écht werkt in jouw organisatie.',
    heroBody:   'De meeste leiders weten wat ze willen met AI. Wat ontbreekt is de vertaling: van richting naar beslissingen, van beslissingen naar resultaat. Ik heb die brug zelf gebouwd — in complexe sectoren, voor echte organisaties. Dat is wat ik meeneem.',
    heroCta1:   'Plan een intakegesprek →',
    heroCta2:   'Doe eerst de gratis AI-scan',
    heroTrust:  '3 maanden · Max. 5 deelnemers · Intake vereist',

    probLabel:  'Wat ik keer op keer zie',
    probTitle:  'De kloof tussen AI-ambitie en AI-resultaat',
    probItems: [
      { icon: '📤', title: 'Strategie stopt bij de presentatie', body: 'Veel leiders hebben een helder beeld van waar AI ze kan brengen. Maar de vertaling naar concrete keuzes — wat doen we eerst, wie trekt het, hoe meten we succes — blijft hangen. De organisatie wacht op richting die niet komt.' },
      { icon: '🛠️', title: 'Executie zonder strategische kapstok', body: 'Teams experimenteren, tools worden aangeschaft, pilots gestart. Maar zonder een gedeeld kader bovenaan fragmenteert het. Elk team doet iets anders. Niets schaalt.' },
      { icon: '🎤', title: 'Na de inspiratie komt de stilte', body: 'De AI-dag, de keynote, het externe rapport. Maandag is het weer business as usual. Niet omdat de wil er niet is — maar omdat de stap van inzicht naar eerste concrete actie nergens eigenaarschap heeft.' },
    ],

    forLabel:   'Voor wie',
    forTitle:   'Dit programma is voor jou als...',
    forItems: [
      { icon: '🧭', text: 'Je weet dat AI ertoe doet voor jouw organisatie, maar de vertaling naar een concrete aanpak ontbreekt.' },
      { icon: '⏱️', text: 'Je wil regie houden over de richting — zonder zelf een AI-expert te worden.' },
      { icon: '🏗️', text: 'Je hebt initiatieven zien stranden en wil nu een aanpak die wél iets concreets oplevert.' },
      { icon: '💬', text: 'Je wil intern geloofwaardig zijn over AI: tegenover je team, je board, je klanten en je aandeelhouders.' },
    ],

    areasLabel: 'Wat we aanpakken',
    areasTitle: 'Zes gebieden. Eén organisatie. Jouw situatie.',
    areasBody:  'Ik gebruik dezelfde 6 dimensies die ik inzet om AI-volwassenheid in organisaties te meten — nu volledig gericht op jouw specifieke context en uitdagingen.',
    areas: [
      { icon: '🧭', title: 'Strategie & Visie',        body: 'Waar zit AI in jouw businessmodel? Wat is jouw rol als leidinggevende? Ik help je een helder fundament leggen — geen abstracte visie, maar keuzes die sturen.' },
      { icon: '🛡️', title: 'Governance & Risico',      body: 'Welke AI-beslissingen neem jij zelf, wat delegeer je, en hoe zorg je dat risico\'s — reputatie, data, compliance — op de juiste plek belanden?' },
      { icon: '⚡', title: 'Huidige toepassingen',      body: 'Wat gebruikt je team al? Ik maak de onzichtbare AI-activiteit in jouw organisatie zichtbaar — inclusief wat wél werkt en wat je kunt stoppen.' },
      { icon: '🗄️', title: 'Data & Infrastructuur',    body: 'Je hoeft geen techneut te zijn. Maar je moet weten welke vragen je moet stellen. Ik geef je die vragen — gebaseerd op wat ik in de praktijk ben tegengekomen.' },
      { icon: '🧑‍💻', title: 'Talent & Cultuur',        body: 'Hoe krijg je je team mee zonder ze te overbelasten? Wie zijn de trekkers? Ik herken dit patroon in meerdere sectoren en weet wat werkt.' },
      { icon: '🔍', title: 'Kansen & Prioriteiten',    body: 'Samen bepalen we de ene use case die in 3 maanden concreet wordt. Niet de meest indrukwekkende — de meest haalbare met het meeste effect.' },
    ],

    programLabel: 'Het programma',
    programTitle: 'Drie maanden. Eén werkende use case. Blijvend inzicht.',
    programMonths: [
      {
        n: '01', title: 'Inzicht',
        body: 'We brengen jouw organisatie in kaart op de 6 dimensies. Ik gebruik hiervoor de aanpak die ik in de praktijk ontwikkeld heb. Je verlaat maand 1 met een eerlijk beeld, een scherpe prioriteit, en een gedeelde taal voor AI in jouw organisatie.',
        tag: 'Maand 1',
      },
      {
        n: '02', title: 'Toepassing',
        body: 'We bouwen samen — of ik begeleid het bouwen van — een eerste werkende AI-toepassing in jouw bedrijf. Geen demo. Iets wat je morgen kunt gebruiken en aan je team kunt laten zien. Ik weet hoe dit eruitziet in complexe omgevingen.',
        tag: 'Maand 2',
      },
      {
        n: '03', title: 'Richting',
        body: 'We verankeren wat je hebt geleerd. Je verlaat het traject met een AI-visie die past bij jouw organisatie, een framework voor toekomstige beslissingen, en de taal om intern en extern het gesprek te leiden — met vertrouwen.',
        tag: 'Maand 3',
      },
    ],

    proofLabel:  'Strategie én executie — van beide kanten',
    proofTitle:  'Ik heb de vertaling zelf moeten maken. Dat is mijn voordeel.',
    proofBody:   'In elk project stond ik op de grens tussen strategische ambitie en wat er technisch en organisatorisch haalbaar is. Die positie geeft me een perspectief dat puur strategisch of puur technisch advies niet heeft.',
    proofItems: [
      { icon: '💜', color: '#6B2D8B', title: 'CLL Clinical Practice Optimiser', client: 'Gezondheidszorg', body: 'Strategie: hoe maak je klinische best practice schaalbaar in een gedecentraliseerde organisatie? Executie: een tool die specialisten zelf gebruiken, zonder IT-afhankelijkheid.' },
      { icon: '♻️', color: '#398684', title: 'Circular Readiness Assessment',    client: 'Vastgoed & Duurzaamheid', body: 'Strategie: CSRD-verplichting vertalen naar een prioritering die past bij de organisatie. Executie: meting die directie én operatie hetzelfde beeld geeft.' },
      { icon: '⭐', color: '#1D4ED8', title: 'CX Maturity Assessment',           client: 'Customer Experience', body: 'Strategie: van "klantgerichtheid is belangrijk" naar een keuze waar je op kunt sturen. Executie: een meetinstrument dat intern draagvlak creëert voor de juiste prioriteiten.' },
    ],

    aboutLabel: 'Wat ik doe',
    aboutTitle: 'Ik vertaal. Tussen ambitie en actie. Tussen leiderschap en uitvoering.',
    aboutBody1: 'Ik ben geen AI-trainer en geen implementatiepartner. Ik zit ertussenin — op de plek waar strategische keuzes vertaald moeten worden naar iets wat een organisatie écht kan doen. Dat is ook de plek waar de meeste AI-trajecten vastlopen.',
    aboutBody2: 'Ik heb die vertaling gemaakt in meerdere sectoren, voor uiteenlopende organisaties. Ik herken de patronen snel, weet waar de weerstand zit, en weet hoe je van een heldere prioriteit naar een eerste concreet resultaat komt.',
    aboutCredentials: ['Bouwt AI-toepassingen voor complexe, gereguleerde sectoren', 'Werkt in Nederlands, Engels en Frans', 'Ervaring in gezondheidszorg, finance, FMCG, duurzaamheid, CX en meer'],

    spotsLabel:  'Beschikbaarheid',
    spotsTitle:  'Ik begeleid maximaal vijf mensen tegelijk.',
    spotsBody:   'Niet omdat het een programma is, maar omdat goede begeleiding tijd kost. Ik wil jouw situatie kennen, niet een template uitrollen.',
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
    heroBadge:  'AI Transition Mentoring · Max. 5 people at a time',
    heroH1a:    'From AI ambition to',
    heroH1b:    'something that actually works in your organisation.',
    heroBody:   'Most leaders know what they want from AI. What\'s missing is the translation: from direction to decisions, from decisions to results. I\'ve built that bridge myself — in complex sectors, for real organisations. That\'s what I bring.',
    heroCta1:   'Book an intake call →',
    heroCta2:   'Take the free AI scan first',
    heroTrust:  '3 months · Max. 5 participants · Intake required',

    probLabel:  'What I see every time',
    probTitle:  'The gap between AI ambition and AI results',
    probItems: [
      { icon: '📤', title: 'Strategy stops at the presentation', body: 'Many leaders have a clear picture of where AI can take them. But the translation into concrete choices — what first, who owns it, how do we measure success — gets stuck. The organisation waits for direction that never arrives.' },
      { icon: '🛠️', title: 'Execution without a strategic frame', body: 'Teams experiment, tools get purchased, pilots start. But without a shared framework from the top it fragments. Every team does something different. Nothing scales.' },
      { icon: '🎤', title: 'After the inspiration comes silence', body: 'The AI day, the keynote, the external report. Monday it\'s business as usual. Not because the will isn\'t there — but because the step from insight to first concrete action has no owner.' },
    ],

    forLabel:   'Who this is for',
    forTitle:   'This programme is for you if...',
    forItems: [
      { icon: '🧭', text: 'You know AI matters for your organisation, but the translation to a concrete approach is missing.' },
      { icon: '⏱️', text: 'You want to stay in control of the direction — without becoming an AI expert yourself.' },
      { icon: '🏗️', text: 'You\'ve seen initiatives fail to land and want an approach that actually produces something concrete.' },
      { icon: '💬', text: 'You want to be credible on AI: with your team, your board, your clients and your shareholders.' },
    ],

    areasLabel: 'What we work on',
    areasTitle: 'Six areas. One organisation. Your situation.',
    areasBody:  'I use the same 6 dimensions I deploy to measure AI maturity in organisations — now entirely focused on your specific context and challenges.',
    areas: [
      { icon: '🧭', title: 'Strategy & Vision',        body: 'Where does AI sit in your business model? What is your role as a leader? I help you build a clear foundation — not an abstract vision, but choices that actually steer.' },
      { icon: '🛡️', title: 'Governance & Risk',        body: 'Which AI decisions do you own, what do you delegate, and how do you make sure risks — reputation, data, compliance — land in the right place?' },
      { icon: '⚡', title: 'Current Usage',             body: 'What is your team already using? I make the invisible AI activity in your organisation visible — including what\'s actually working and what you can stop.' },
      { icon: '🗄️', title: 'Data & Infrastructure',    body: 'You don\'t need to be technical. But you need to know which questions to ask. I give you those questions — based on what I\'ve encountered in practice.' },
      { icon: '🧑‍💻', title: 'Talent & Culture',        body: 'How do you bring your team along without burning them out? Who are the champions? I recognise this pattern across sectors and know what works.' },
      { icon: '🔍', title: 'Opportunities & Priorities', body: 'Together we identify the one use case that becomes concrete in 3 months. Not the most impressive — the most achievable with the most impact.' },
    ],

    programLabel: 'The programme',
    programTitle: 'Three months. One working use case. Lasting clarity.',
    programMonths: [
      {
        n: '01', title: 'Insight',
        body: 'We map your organisation across the 6 dimensions using the approach I developed in practice. You leave month 1 with an honest picture, a sharp priority, and a shared language for AI in your organisation.',
        tag: 'Month 1',
      },
      {
        n: '02', title: 'Application',
        body: 'Together — or with my guidance — we build a first working AI application in your business. Not a demo. Something you can use tomorrow and show your team. I know what this looks like in complex environments.',
        tag: 'Month 2',
      },
      {
        n: '03', title: 'Direction',
        body: 'We embed what you\'ve learned. You leave with an AI vision that fits your organisation, a framework for future decisions, and the language to lead the conversation internally and externally — with confidence.',
        tag: 'Month 3',
      },
    ],

    proofLabel:  'Strategy and execution — from both sides',
    proofTitle:  'I\'ve had to make the translation myself. That\'s my advantage.',
    proofBody:   'In every project I stood on the boundary between strategic ambition and what\'s technically and organisationally feasible. That position gives me a perspective that purely strategic or purely technical advice doesn\'t have.',
    proofItems: [
      { icon: '💜', color: '#6B2D8B', title: 'CLL Clinical Practice Optimiser', client: 'Healthcare', body: 'Strategy: how do you make clinical best practice scalable in a decentralised organisation? Execution: a tool specialists use themselves, without IT dependency.' },
      { icon: '♻️', color: '#398684', title: 'Circular Readiness Assessment',    client: 'Real estate & Sustainability', body: 'Strategy: translate a CSRD obligation into a prioritisation that fits the organisation. Execution: a measurement that gives leadership and operations the same picture.' },
      { icon: '⭐', color: '#1D4ED8', title: 'CX Maturity Assessment',           client: 'Customer Experience', body: 'Strategy: from "customer experience matters" to a choice you can actually steer on. Execution: a measurement instrument that builds internal support for the right priorities.' },
    ],

    aboutLabel: 'What I do',
    aboutTitle: 'I translate. Between ambition and action. Between leadership and delivery.',
    aboutBody1: 'I\'m not an AI trainer and not an implementation partner. I sit in between — at the point where strategic choices need to be translated into something an organisation can actually do. That\'s also where most AI initiatives get stuck.',
    aboutBody2: 'I\'ve made that translation across multiple sectors, for very different organisations. I recognise the patterns quickly, know where the resistance sits, and know how you move from a clear priority to a first concrete result.',
    aboutCredentials: ['Builds AI applications for complex, regulated sectors', 'Works in Dutch, English and French', 'Experience across healthcare, finance, FMCG, sustainability, CX and more'],

    spotsLabel:  'Availability',
    spotsTitle:  'I work with a maximum of five people at a time.',
    spotsBody:   'Not because it\'s a programme, but because good guidance takes time. I want to know your situation — not roll out a template.',
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

  // ── Store UTM attribution in sessionStorage so the quiz can pick it up ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    sessionStorage.setItem('mentor_attribution', JSON.stringify({
      ref:          'mentor',
      utm_source:   params.get('utm_source')   ?? '',
      utm_medium:   params.get('utm_medium')   ?? '',
      utm_campaign: params.get('utm_campaign') ?? '',
    }))
  }, [])

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
