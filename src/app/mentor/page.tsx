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
    heroH1a:    'Ik bouw AI voor complexe sectoren.',
    heroH1b:    'Dat inzicht zet ik in als mentor.',
    heroBody:   'Ik heb AI-toepassingen gebouwd voor gezondheidszorg, vastgoed en klantbeleving. Ik zie keer op keer hetzelfde patroon: de technologie is niet het probleem. Strategische richting van bovenaf is dat wél. Dat is waar ik je mee help.',
    heroCta1:   'Plan een intakegesprek →',
    heroCta2:   'Doe eerst de gratis AI-scan',
    heroTrust:  '3 maanden · Max. 5 deelnemers · Intake vereist',

    probLabel:  'Wat ik keer op keer zie',
    probTitle:  'Drie patronen die AI-trajecten in de boardroom doen stranden',
    probItems: [
      { icon: '📤', title: 'AI belandt bij IT — zonder eigenaar bovenaan', body: 'Ik bouw voor organisaties waar AI al "aan de gang" is. Maar wanneer ik doorvraag, bepaalt niemand bovenaan de richting. De technologie wacht op een strategisch besluit dat nooit komt.' },
      { icon: '🛠️', title: 'Tools voor vragen die niemand gesteld heeft', body: 'In elke sector dezelfde situatie: teams experimenteren met Copilot, ChatGPT, Notion AI — maar het probleem dat het moet oplossen is nooit scherp gedefinieerd. Geen probleem, geen prioriteit, geen resultaat.' },
      { icon: '🎤', title: 'Na de inspiratie komt de stilte', body: 'Ik heb de AI-workshop gezien, het pilotje, de keynote. En dan niets. Niet omdat de mensen niet wilden — maar omdat niemand bovenaan zei: dit is de richting, dit is de eerste stap.' },
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

    proofLabel:  'Wat ik meeneem uit de praktijk',
    proofTitle:  'Elke tool leerde me iets over hoe organisaties met AI omgaan.',
    proofBody:   'Ik bouw geen prototypes. Ik bouw werkende toepassingen in sectoren waar fouten consequenties hebben. De patronen die ik daarin zie, brengt ik mee naar jouw mentortraject.',
    proofItems: [
      { icon: '💜', color: '#6B2D8B', title: 'CLL Clinical Practice Optimiser', client: 'Gezondheidszorg', body: 'Wat ik leerde: zelfs in een hooggereguleerde sector met ervaren specialisten bepaalt het ontbreken van richting van bovenaf of een AI-tool écht gebruikt wordt — of stof vangt.' },
      { icon: '♻️', color: '#398684', title: 'Circular Readiness Assessment',    client: 'Vastgoed & Duurzaamheid', body: 'Wat ik leerde: regeldruk (CSRD) creëert urgentie, maar geen strategie. Organisaties die snel bewegen hebben één ding gemeen — iemand bovenaan die keuzes durft te maken.' },
      { icon: '⭐', color: '#1D4ED8', title: 'CX Maturity Assessment',           client: 'Customer Experience', body: 'Wat ik leerde: bedrijven weten dat klantbeleving telt, maar kunnen niet meten waar ze staan. Meten is het begin. Richting geven op basis van die meting is het echte werk.' },
    ],

    aboutLabel: 'Waarom dit werkt',
    aboutTitle: 'Ik heb het gezien. In meerdere sectoren. Dat patroon herken ik snel.',
    aboutBody1: 'Ik heb geen carrière opgebouwd als AI-trainer. Ik heb AI gebouwd — voor organisaties in gezondheidszorg, duurzaamheid en klantbeleving, sectoren waar het ingewikkeld is en fouten tellen. Dat geeft me een andere blik dan de meeste coaches.',
    aboutBody2: 'Ik zie patronen die jij zelf misschien niet ziet. Ik weet hoe vergelijkbare teams het aanpakten, wat werkte en wat niet. En ik weet hoe je van "wij moeten iets met AI" naar een concrete, werkende toepassing gaat — zonder dat je team er onder bezwijkt.',
    aboutCredentials: ['Bouwt AI-toepassingen voor complexe, gereguleerde sectoren', 'Werkt in Nederlands, Engels en Frans', 'Actief voor Fortune 500 en snelgroeiende scale-ups'],

    spotsLabel:  'Beschikbaarheid',
    spotsTitle:  'Vijf plekken per cohort.',
    spotsBody:   'Ik werk met een kleine groep zodat de begeleiding écht persoonlijk is en ik de patronen in jouw specifieke situatie kan herkennen. Het Q2 2026-cohort gaat binnenkort van start.',
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
    heroH1a:    'I build AI for complex sectors.',
    heroH1b:    'That experience is what I bring to mentoring.',
    heroBody:   'I\'ve built AI applications for healthcare, real estate and customer experience. I see the same pattern every time: the technology is not the problem. Strategic direction from the top is. That\'s what I help you with.',
    heroCta1:   'Book an intake call →',
    heroCta2:   'Take the free AI scan first',
    heroTrust:  '3 months · Max. 5 participants · Intake required',

    probLabel:  'What I see every time',
    probTitle:  'Three patterns that stall AI in the boardroom',
    probItems: [
      { icon: '📤', title: 'AI lands at IT — with no owner at the top', body: 'I build for organisations where AI is already "happening". But when I ask who sets the direction, nobody at the top does. The technology is waiting for a strategic decision that never comes.' },
      { icon: '🛠️', title: 'Tools for questions nobody asked', body: 'In every sector, the same situation: teams experiment with Copilot, ChatGPT, Notion AI — but the problem it should solve has never been sharply defined. No problem, no priority, no result.' },
      { icon: '🎤', title: 'After the inspiration comes silence', body: 'I\'ve seen the AI workshop, the pilot, the keynote. And then nothing. Not because people didn\'t want to — but because nobody at the top said: this is the direction, this is the first step.' },
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

    proofLabel:  'What I bring from practice',
    proofTitle:  'Every tool taught me something about how organisations handle AI.',
    proofBody:   'I don\'t build prototypes. I build working applications in sectors where mistakes have consequences. The patterns I see there are what I bring to your mentorship.',
    proofItems: [
      { icon: '💜', color: '#6B2D8B', title: 'CLL Clinical Practice Optimiser', client: 'Healthcare', body: 'What I learned: even in a highly regulated sector with experienced specialists, the absence of direction from the top determines whether an AI tool actually gets used — or collects dust.' },
      { icon: '♻️', color: '#398684', title: 'Circular Readiness Assessment',    client: 'Real estate & Sustainability', body: 'What I learned: regulatory pressure (CSRD) creates urgency but not strategy. Organisations that move fast have one thing in common — someone at the top who dares to make choices.' },
      { icon: '⭐', color: '#1D4ED8', title: 'CX Maturity Assessment',           client: 'Customer Experience', body: 'What I learned: companies know customer experience matters but can\'t measure where they stand. Measuring is the start. Giving direction based on that measurement is the real work.' },
    ],

    aboutLabel: 'Why this works',
    aboutTitle: 'I\'ve seen it. Across multiple sectors. I recognise the pattern fast.',
    aboutBody1: 'I haven\'t built a career as an AI trainer. I\'ve built AI — for organisations in healthcare, sustainability and customer experience, sectors where it\'s complicated and mistakes count. That gives me a different view than most coaches.',
    aboutBody2: 'I see patterns you might not see yourself. I know how comparable teams approached it, what worked and what didn\'t. And I know how you get from "we need to do something with AI" to a concrete, working application — without your team buckling under it.',
    aboutCredentials: ['Builds AI applications for complex, regulated sectors', 'Works in Dutch, English and French', 'Active for Fortune 500 and fast-growing scale-ups'],

    spotsLabel:  'Availability',
    spotsTitle:  'Five spots per cohort.',
    spotsBody:   'I work with a small group so the guidance stays genuinely personal and I can recognise the patterns in your specific situation. The Q2 2026 cohort is opening soon.',
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
