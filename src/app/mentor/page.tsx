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
    navRole:    'Strategisch mentor voor AI & executie',
    navCta:     'Plan gesprek →',
    heroBadge:  'Persoonlijke begeleiding · Max. 5 leiders tegelijk',
    heroH1a:    'Van AI-ambitie naar',
    heroH1b:    'iets wat écht werkt in jouw organisatie.',
    heroBody:   'AI is voor de meeste organisaties geen inspiratievraag meer. De echte vraag is: wat betekent dit voor ons, waar beginnen we, en hoe maken we het concreet zonder te verdwalen in pilots, tools of abstracte plannen? Ik help leiders bij precies dat punt — niet als trainer, maar als iemand die beweegt tussen strategie, verandering en uitvoering.',
    heroCta1:   'Plan een intakegesprek →',
    heroCta2:   'Doe eerst de gratis AI-scan',
    heroTrust:  'Persoonlijk traject · 3 maanden · Intake vereist',

    probLabel:  'Wat ik vaak zie',
    probTitle:  'Niet de ambitie is het probleem. De vertaling is het probleem.',
    probItems: [
      { icon: '🎯', title: 'De richting is er, maar de eerste echte keuze niet', body: 'Veel leiders voelen goed aan dat AI relevant is. Maar tussen "we moeten hier iets mee" en "dit is wat we nu gaan doen" zit een lastige laag van keuzes, prioriteiten, risico\'s en eigenaarschap. Juist daar blijft het vaak hangen.' },
      { icon: '🔀', title: 'Er gebeurt van alles, maar niets komt samen', body: 'Teams experimenteren. Er worden tools getest. Iemand gebruikt AI slim, een ander start een pilot. Maar zonder gezamenlijke richting en duidelijke keuzes ontstaat versnippering. Er is activiteit, maar nog geen voortgang.' },
      { icon: '⏸️', title: 'Na de inspiratie volgt geen structuur', body: 'De keynote, de strategiesessie of het rapport zet iets in beweging. Maar daarna moet iemand de stap maken van inzicht naar ritme, prioriteit en concrete toepassing. Als die rol ontbreekt, valt een goed voornemen terug in de drukte van alledag.' },
    ],

    whyLabel:  'Waarom ik',
    whyTitle:  'Ik kom niet alleen uit AI. Ik kom uit strategie, verandering en uitvoering.',
    whyP1:     'Mijn achtergrond ligt niet in een lab of alleen in technologie. Ik heb jarenlang gewerkt op het snijvlak van strategie, commerciële groei, klantbeleving, teams en executie. Juist daardoor kijk ik anders naar AI dan veel specialisten. Niet als doel op zich, maar als iets dat moet landen in een organisatie — bij mensen, processen en verantwoordelijkheden.',
    whyP2:     'In de afgelopen periode heb ik AI-oplossingen ontwikkeld en toegepast in verschillende contexten — van zorg en duurzaamheid tot finance, customer experience en FMCG. Dat hands-on werk neem ik mee. Maar net zo belangrijk: ik weet hoe organisaties bewegen, waar weerstand ontstaat, en waarom goede plannen stranden tussen directie en uitvoering.',
    whyP3:     'Daar zit mijn rol. Ik help je niet om "meer over AI te weten". Ik help je om betere keuzes te maken, richting te geven, en in beweging te komen op een manier die past bij jouw organisatie.',

    forLabel:   'Voor wie',
    forTitle:   'Dit is voor leiders die serieus werk willen maken van AI, zonder zichzelf te verliezen in de hype.',
    forItems: [
      { icon: '🧭', text: 'Je weet dat AI impact gaat hebben op jouw organisatie, maar de vertaling naar richting en prioriteit ontbreekt nog.' },
      { icon: '❓', text: 'Je wil de juiste vragen kunnen stellen, zonder zelf specialist of techneut te hoeven worden.' },
      { icon: '🤝', text: 'Je zoekt geen training of dikke advieslaag, maar persoonlijke begeleiding bij echte keuzes.' },
      { icon: '💬', text: 'Je wil geloofwaardig leidinggeven op dit onderwerp — richting team, directie, board of aandeelhouders.' },
      { icon: '📈', text: 'Je wil niet eindigen met losse experimenten, maar met iets dat daadwerkelijk werkt en intern verder kan groeien.' },
    ],

    areasLabel: 'Waar we aan werken',
    areasTitle: 'Geen generiek AI-verhaal. Jouw organisatie, jouw context, jouw keuzes.',
    areasBody:  'Ik gebruik een vaste denkrichting, maar geen template. We kijken samen naar de thema\'s die ertoe doen in jouw situatie — strategisch, organisatorisch en praktisch.',
    areas: [
      { icon: '🧭', title: 'Richting en prioriteit',                       body: 'Waar raakt AI jouw businessmodel, je dienstverlening of je manier van werken? Wat vraagt nu aandacht, en wat juist nog niet?' },
      { icon: '👔', title: 'Leiderschap en besluitvorming',                 body: 'Welke rol moet jij als leider pakken? Welke keuzes kun je delegeren, en welke juist niet? Hoe houd je regie zonder alles zelf te hoeven weten?' },
      { icon: '🛡️', title: 'Risico, governance en verantwoordelijkheid',   body: 'Hoe ga je om met data, reputatie, compliance en interne kaders zonder dat het onderwerp vastloopt in voorzichtigheid?' },
      { icon: '⚡', title: 'Wat er al gebeurt in je organisatie',           body: 'Welke AI-initiatieven, experimenten of schaduwpraktijken zijn er al? Wat werkt echt, wat is ruis, en waar zit energie die je kunt benutten?' },
      { icon: '🧑‍💻', title: 'Mensen, cultuur en adoptie',                  body: 'Wie trekt dit intern? Hoe krijg je mensen mee zonder extra veranderdruk te creëren? Wat heeft jouw team nodig om veilig en praktisch te kunnen leren?' },
      { icon: '🎯', title: 'De eerste use case die ertoe doet',             body: 'We kiezen niet de meest spectaculaire toepassing, maar de toepassing die geloofwaardig, haalbaar en waardevol genoeg is om beweging te creëren.' },
    ],

    programLabel: 'Hoe het werkt',
    programTitle: 'Drie maanden. Persoonlijk, praktisch en gericht op echte voortgang.',
    programMonths: [
      {
        n: '01', title: 'Scherp krijgen wat er speelt',
        body: 'We brengen jouw situatie helder in kaart. Waar zit de ambitie? Waar zit de verwarring? Wat gebeurt er al? Waar moeten keuzes gemaakt worden? Je krijgt een eerlijk beeld en een duidelijke focus.',
        tag: 'Stap 1',
      },
      {
        n: '02', title: 'Van inzicht naar toepassing',
        body: 'We vertalen die focus naar een eerste concrete stap. Dat kan een werkende use case zijn, een besluitvormingskader, een leiderschapsaanpak of een combinatie. In elk geval iets dat verder gaat dan praten alleen.',
        tag: 'Stap 2',
      },
      {
        n: '03', title: 'Verankeren en vooruitkijken',
        body: 'We zorgen dat er niet alleen iets gestart is, maar ook iets blijft hangen: in taal, richting, eigenaarschap en vervolg. Zodat je na drie maanden verder kunt bouwen.',
        tag: 'Stap 3',
      },
    ],

    proofLabel:  'Ervaring uit de praktijk',
    proofTitle:  'Ik werk op de grens van ambitie en haalbaarheid. Daar ontstaat de echte waarde.',
    proofBody:   'In verschillende opdrachten en sectoren heb ik steeds dezelfde vertaalslag moeten maken: wat wil een organisatie bereiken, wat is realistisch, en hoe maak je de eerste stap zó dat mensen mee kunnen?',
    proofItems: [
      { icon: '💜', color: '#6B2D8B', sector: 'Gezondheidszorg',             body: 'Van strategische ambitie rond kennisdeling en best practice naar een toepassing die professionals zelf gebruiken in hun dagelijkse werk.' },
      { icon: '♻️', color: '#398684', sector: 'Vastgoed & Duurzaamheid',     body: 'Van externe druk en CSRD-verplichtingen naar een praktisch model waarmee directie en operatie naar dezelfde werkelijkheid kijken.' },
      { icon: '⭐', color: '#1D4ED8', sector: 'Customer Experience',         body: 'Van abstracte klantambitie naar een meet- en sturingsmodel dat helpt om prioriteiten te kiezen en intern draagvlak op te bouwen.' },
      { icon: '🏦', color: '#374151', sector: 'Finance & gereguleerde context', body: 'Van voorzichtigheid en compliance-zorgen naar een werkbare manier om AI toch verantwoord te verkennen en toe te passen.' },
    ],

    aboutLabel: 'Over mij',
    aboutTitle: 'Ik help leiders richting geven op het punt waar strategie concreet moet worden.',
    aboutBody1: 'Ik ben van nature een bruggenbouwer tussen denken en doen. In mijn loopbaan heb ik veel gewerkt op het snijvlak van strategie, groei, klantgerichtheid, teams en verandering. AI is daar voor mij geen los onderwerp bovenop, maar een nieuwe realiteit die leiders vraagt om betere keuzes, meer scherpte en meer vertaalvermogen.',
    aboutBody2: 'Wat ik meebreng is tweeledig: hands-on ervaring met AI in de praktijk én jarenlange ervaring met organisaties, positionering, teams, executie en veranderdynamiek. Die combinatie is precies waarom senior leiders mij weten te vinden.',
    aboutCredentials: [
      'Senior ervaring in strategie, groei, klantbeleving en executie',
      'Hands-on ontwikkeling en toepassing van AI in meerdere sectoren',
      'Werkt in Nederlands en Engels',
      'Ervaring in zorg, finance, FMCG, duurzaamheid, CX en meer',
    ],

    spotsLabel:  'Beschikbaarheid',
    spotsTitle:  'Ik begeleid maximaal vijf leiders tegelijk.',
    spotsBody:   'Omdat dit alleen werkt als ik echt kan meedenken in jouw situatie. Geen standaard format, geen groep. Wel persoonlijke begeleiding, scherpe vragen en concrete voortgang.',
    spotsCta1:   'Plan een intakegesprek →',
    spotsCta2:   'Doe eerst de gratis AI-scan',
    spotsTrust:  'Gratis intake · Geen verplichting · We bekijken samen of er een match is',

    footerCopy:  'Strategisch mentor voor AI & executie',
    footerSub:   'markdekock.com',
  },
  en: {
    navName:    'Mark de Kock',
    navRole:    'Strategic mentor for AI & execution',
    navCta:     'Book a call →',
    heroBadge:  'Personal mentorship · Max. 5 leaders at a time',
    heroH1a:    'From AI ambition to',
    heroH1b:    'something that actually works in your organisation.',
    heroBody:   'For most organisations, AI is no longer an inspiration question. The real question is: what does this mean for us, where do we start, and how do we make it concrete without getting lost in pilots, tools or abstract plans? That\'s exactly where I come in — not as a trainer, but as someone who moves between strategy, change and execution.',
    heroCta1:   'Book an intake call →',
    heroCta2:   'Take the free AI scan first',
    heroTrust:  'Personal mentorship · 3 months · Intake required',

    probLabel:  'What I often see',
    probTitle:  'The ambition isn\'t the problem. The translation is.',
    probItems: [
      { icon: '🎯', title: 'The direction exists, but the first real choice doesn\'t', body: 'Most leaders sense that AI is relevant. But between "we need to do something with this" and "this is what we\'re doing now" sits a difficult layer of choices, priorities, risks and ownership. That\'s where things tend to get stuck.' },
      { icon: '🔀', title: 'A lot is happening, but nothing is connecting', body: 'Teams are experimenting. Tools are being tested. Someone uses AI cleverly, another starts a pilot. But without shared direction and clear choices, things fragment. There\'s activity, but not yet progress.' },
      { icon: '⏸️', title: 'After the inspiration, there\'s no structure', body: 'The keynote, the strategy session, the external report sets something in motion. But then someone needs to make the step from insight to rhythm, priority and concrete application. When that role is missing, good intentions fall back into the noise of everyday business.' },
    ],

    whyLabel:  'Why me',
    whyTitle:  'I don\'t just come from AI. I come from strategy, change and execution.',
    whyP1:     'My background isn\'t in a lab or purely in technology. I\'ve spent years working at the intersection of strategy, commercial growth, customer experience, teams and execution. That\'s exactly why I look at AI differently to many specialists — not as an end in itself, but as something that has to land in an organisation, with real people, processes and accountabilities.',
    whyP2:     'In recent years I\'ve built and applied AI in different contexts — from healthcare and sustainability to finance, customer experience and FMCG. I bring that hands-on work with me. But just as important: I understand how organisations move, where resistance emerges, and why good plans get stuck between leadership and delivery.',
    whyP3:     'That\'s where my role sits. I don\'t help you "know more about AI". I help you make better decisions, give direction, and move forward in a way that actually fits your organisation.',

    forLabel:   'Who this is for',
    forTitle:   'This is for leaders who want to make AI work — without getting lost in the hype.',
    forItems: [
      { icon: '🧭', text: 'You know AI is going to impact your organisation, but the translation to direction and priority is still missing.' },
      { icon: '❓', text: 'You want to be able to ask the right questions, without having to become a technical expert yourself.' },
      { icon: '🤝', text: 'You\'re not looking for a training or a thick advisory layer — you want personal guidance on real choices.' },
      { icon: '💬', text: 'You want to lead credibly on this topic — with your team, your board, your clients and your shareholders.' },
      { icon: '📈', text: 'You don\'t want to end up with scattered experiments, but with something that actually works and can grow.' },
    ],

    areasLabel: 'What we work on',
    areasTitle: 'No generic AI story. Your organisation, your context, your choices.',
    areasBody:  'I use a consistent way of thinking, but not a template. Together we look at the themes that matter in your situation — strategic, organisational and practical.',
    areas: [
      { icon: '🧭', title: 'Direction and priority',                         body: 'Where does AI touch your business model, your services or your way of working? What needs attention now — and what can wait?' },
      { icon: '👔', title: 'Leadership and decision-making',                 body: 'What role do you need to take as a leader? What can you delegate, and what must you own? How do you stay in control without needing to know everything?' },
      { icon: '🛡️', title: 'Risk, governance and accountability',            body: 'How do you handle data, reputation, compliance and internal frameworks without letting caution bring everything to a standstill?' },
      { icon: '⚡', title: 'What\'s already happening in your organisation', body: 'What AI initiatives, experiments or shadow practices are already underway? What\'s actually working, what\'s noise, and where is there energy to build on?' },
      { icon: '🧑‍💻', title: 'People, culture and adoption',                 body: 'Who leads this internally? How do you bring people along without creating more change pressure? What does your team need to learn safely and practically?' },
      { icon: '🎯', title: 'The first use case that matters',                body: 'We don\'t pick the most spectacular application — we pick the one that\'s credible, achievable and valuable enough to create real momentum.' },
    ],

    programLabel: 'How it works',
    programTitle: 'Three months. Personal, practical and focused on real progress.',
    programMonths: [
      {
        n: '01', title: 'Getting clarity on what\'s at stake',
        body: 'We map your situation clearly. Where is the ambition? Where is the confusion? What\'s already happening? Where do decisions need to be made? You get an honest picture and a clear focus.',
        tag: 'Step 1',
      },
      {
        n: '02', title: 'From insight to application',
        body: 'We translate that focus into a first concrete step. That could be a working use case, a decision framework, a leadership approach — or a combination. Something that goes beyond conversation.',
        tag: 'Step 2',
      },
      {
        n: '03', title: 'Embedding and looking ahead',
        body: 'We make sure something doesn\'t just start — it sticks: in language, direction, ownership and follow-through. So you can keep building after three months.',
        tag: 'Step 3',
      },
    ],

    proofLabel:  'Experience from practice',
    proofTitle:  'I work at the boundary between ambition and feasibility. That\'s where real value emerges.',
    proofBody:   'Across different projects and sectors I\'ve had to make the same translation: what does this organisation want to achieve, what\'s realistic, and how do you make the first step in a way that brings people along?',
    proofItems: [
      { icon: '💜', color: '#6B2D8B', sector: 'Healthcare',                  body: 'From strategic ambition around knowledge-sharing and best practice to an application that professionals use themselves in their daily work.' },
      { icon: '♻️', color: '#398684', sector: 'Real estate & Sustainability', body: 'From external pressure and CSRD obligations to a practical model that gives leadership and operations the same picture of reality.' },
      { icon: '⭐', color: '#1D4ED8', sector: 'Customer Experience',          body: 'From abstract customer ambition to a measurement and steering model that helps prioritise and build internal support for the right choices.' },
      { icon: '🏦', color: '#374151', sector: 'Finance & regulated sectors',  body: 'From caution and compliance concerns to a workable way to explore and apply AI responsibly.' },
    ],

    aboutLabel: 'About me',
    aboutTitle: 'I help leaders give direction at the point where strategy needs to become concrete.',
    aboutBody1: 'I\'m naturally a bridge-builder between thinking and doing. I\'ve spent a lot of my career at the intersection of strategy, growth, customer experience, teams and change. For me, AI isn\'t a separate topic layered on top — it\'s a new reality that asks leaders to make better decisions, think with more clarity, and translate ambition into something real.',
    aboutBody2: 'What I bring is twofold: hands-on experience building and applying AI in practice, and years of experience with organisations, positioning, teams, execution and change dynamics. That combination is why senior leaders come to me.',
    aboutCredentials: [
      'Senior experience in strategy, growth, customer experience and execution',
      'Hands-on development and application of AI across multiple sectors',
      'Works in Dutch and English',
      'Experience across healthcare, finance, FMCG, sustainability, CX and more',
    ],

    spotsLabel:  'Availability',
    spotsTitle:  'I work with a maximum of five leaders at a time.',
    spotsBody:   'Because this only works if I can genuinely think along in your situation. No standard format, no group. Personal guidance, sharp questions and concrete progress.',
    spotsCta1:   'Book an intake call →',
    spotsCta2:   'Take the free AI scan first',
    spotsTrust:  'Free intake · No obligations · We\'ll see if there\'s a fit',

    footerCopy:  'Strategic mentor for AI & execution',
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
              style={{ fontSize: 18, color: '#CBD5E1', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px' }}
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
                href={lang === 'nl' ? '/nl' : '/en'}
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

      {/* ── Why me ── */}
      <section style={{ background: INK, padding: '88px 24px' }}>
        <div className="max-w-2xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: WARM, marginBottom: 16 }}>
              {t.whyLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, marginBottom: 32, color: WHITE, lineHeight: 1.25 }}>
              {t.whyTitle}
            </motion.h2>
            <motion.div variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[t.whyP1, t.whyP2, t.whyP3].map((p, i) => (
                <motion.p key={i} variants={fadeUp} style={{
                  fontSize: 16, color: i === 2 ? WHITE : '#94A3B8',
                  lineHeight: 1.75,
                  fontWeight: i === 2 ? 500 : 400,
                }}>
                  {p}
                </motion.p>
              ))}
            </motion.div>
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
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, marginBottom: 40, color: INK, lineHeight: 1.3 }}>
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {t.proofItems.map((p, i) => (
                <motion.div key={i} variants={fadeUp} style={{
                  background: LIGHT, borderRadius: 20, padding: '28px 22px',
                  border: `1px solid ${BORDER}`,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, marginBottom: 16,
                  }}>
                    {p.icon}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: INK, marginBottom: 10 }}>{p.sector}</p>
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
            <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400, margin: '0 auto' }}>
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
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: WHITE, marginBottom: 16, lineHeight: 1.1 }}>
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
                href={lang === 'nl' ? '/nl' : '/en'}
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
