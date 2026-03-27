'use client'

import { useState, useEffect } from 'react'
import { motion, type Variants } from 'framer-motion'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const INK        = '#0F172A'
const NAVY       = '#1E3A5F'
const WHITE      = '#FFFFFF'
const LIGHT      = '#F8FAFC'
const ACCENT     = '#1D4ED8'
const WARM       = '#D97706'
const BODY       = '#374151'
const MUTED      = '#94A3B8'
const BORDER     = '#E2E8F0'

// ── Calendly URLs ─────────────────────────────────────────────────────────────
const CALENDLY_INTAKE   = 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'

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
    navPartner: 'Partner · Kirk & Blackbeard',
    navCta:     'Plan gesprek →',

    // ── Hero ──
    heroBadge:  'MAX. 5 TRAJECTEN TEGELIJK · INTAKE VEREIST',
    heroH1a:    'Van AI-ambitie naar',
    heroH1b:    'heldere richting, intern draagvlak en een eerste use case die werkt.',
    heroBody:   'De meeste leidinggevenden die ik spreek missen geen informatie over AI. Ze missen iemand die helpt beslissen — en die beweegt tussen directie en wat er in de praktijk daadwerkelijk van terechtkomt.',
    heroAuth:   '20 jaar strategie & executie · Partner Kirk & Blackbeard · AI gebouwd in zorg, finance, FMCG & duurzaamheid',
    heroCta1:   'Plan een intakegesprek →',
    heroCta2:   'Doe eerst de gratis AI-scan',
    heroCtaGuide: 'Al urgentie of herkenning? Plan direct. Wil je eerst een richtinggevend beeld? Doe de scan.',

    // ── Proof strip ──
    proofStripItems: [
      { n: '20+',  label: 'jaar op snijvlak strategie & executie' },
      { n: '5',    label: 'sectoren: zorg · finance · FMCG · duurzaamheid · CX' },
      { n: '3 mnd', label: 'persoonlijk traject · board-backed resultaten' },
    ],

    // ── Problem ──
    probLabel: 'Wat ik zie',
    probTitle: 'De ambitie is er. De vertaling naar beweging is het probleem.',
    probItems: [
      { icon: '🎯', title: 'Richting zonder houvast.', body: 'Teams grijpen naar tools onder druk. Dat voelt als beweging. Maar een tool is geen antwoord op een vraag die nog niet gesteld is. Wat ontbreekt is een beslissing, niet een applicatie.' },
      { icon: '📋', title: 'AI-beslissingen landen niet.', body: 'Marketing, sales en operations sturen op hun eigen agenda. De AI-keuze is nooit vertaald naar de doelen waar ze op sturen. Geen gedeeld kader. Geen eigenaar. Geen beweging.' },
      { icon: '💼', title: 'De CEO heeft het al druk genoeg.', body: 'Een heldere AI-strategie klinkt logisch, maar voelt als risico bovenop alles wat al speelt. Wat ontbreekt is iemand die je kunt vertrouwen om dit geordend te houden — zonder dat je er zelf in moet duiken.' },
    ],

    // ── Authority ──
    authLabel: 'Waarom ik',
    authTitle: 'Senior operator. Niet een adviseur die AI van buitenaf bekijkt.',
    authItems: [
      'Partner bij Kirk & Blackbeard',
      '20 jaar ervaring in strategie, groei, klantbeleving en executie',
      'Hands-on AI-toepassingen gebouwd in meerdere sectoren',
      'Werkt in Nederlands en Engels',
    ],
    authP1: 'Ik heb AI-oplossingen gebouwd én ingevoerd — in zorg, finance, FMCG en duurzaamheid. Steeds op dezelfde plek: tussen de strategische keuze en wat er daadwerkelijk van terechtkomt.',
    authP2: 'Dat geeft een ander perspectief dan een AI-specialist. Ik weet hoe beslissingen vastlopen. Waar de weerstand echt zit. Waarom goede plannen stranden in de ruimte tussen directie en uitvoering. Dat is niet abstract — dat is twintig jaar patroonherkenning.',

    // ── Mini proof ──
    miniProofLabel: 'Uit de praktijk',
    miniProofTitle: 'Concrete resultaten, niet strategische reflectie.',
    miniProofItems: [
      { icon: '💜', sector: 'Gezondheidszorg', line: 'Van versnipperde AI-pilots naar één board-backed prioriteit — uitgewerkt tot werkende toepassing die professionals dagelijks gebruiken.' },
      { icon: '♻️', sector: 'Vastgoed & duurzaamheid', line: 'CSRD-druk omgezet in een praktisch model waarmee directie én operatie naar dezelfde werkelijkheid kijken.' },
      { icon: '⭐', sector: 'Customer Experience', line: 'Abstracte klantambitie vertaald naar een sturingsmodel. Van geen richting naar gedeeld prioriteitenkader in één kwartaal.' },
      { icon: '🏦', sector: 'Finance & gereguleerde context', line: 'Eerste werkende AI-toepassing ontwikkeld en ingevoerd — ondanks compliance-complexiteit en interne terughoudendheid.' },
    ],

    // ── Areas ──
    areasLabel: 'Waar we aan werken',
    areasTitle: 'Geen template. Jouw situatie als vertrekpunt.',
    areasBody:  'Ik gebruik een vaste denkrichting, geen format. De thema\'s hangen af van wat er in jouw situatie speelt.',
    areas: [
      { icon: '🧭', title: 'Richting en prioriteit',               body: 'Waar raakt AI jouw businessmodel of dienstverlening? Wat vraagt nu aandacht, en wat juist nog niet?' },
      { icon: '👔', title: 'Leiderschap en besluitvorming',        body: 'Welke rol moet jij pakken? Wat kun je delegeren, wat juist niet? Hoe houd je regie zonder alles te hoeven weten?' },
      { icon: '🛡️', title: 'Risico en governance',                body: 'Data, reputatie, compliance en interne kaders — zonder dat voorzichtigheid alles vertraagt.' },
      { icon: '⚡', title: 'Wat er al gebeurt',                    body: 'Welke initiatieven of schaduwpraktijken zijn er al? Wat werkt echt, wat is ruis, waar zit energie?' },
      { icon: '🧑‍💻', title: 'Mensen en adoptie',                 body: 'Wie trekt dit intern? Hoe krijg je mensen mee zonder extra veranderdruk? Wat heeft je team nodig?' },
      { icon: '🎯', title: 'De eerste use case die ertoe doet',   body: 'Niet de meest spectaculaire toepassing — maar de toepassing die geloofwaardig, haalbaar en waardevol genoeg is om beweging te creëren.' },
    ],

    // ── Program ──
    programLabel: 'Hoe het werkt',
    programTitle: 'Drie maanden. Persoonlijk en gericht op iets dat daadwerkelijk werkt.',
    programMonths: [
      { n: '01', tag: 'Stap 1', title: 'Scherp krijgen wat er speelt',    body: 'We brengen jouw situatie helder in kaart. Ambitie, verwarring, lopende initiatieven, openstaande beslissingen. Je krijgt een eerlijk beeld en een duidelijke focus.' },
      { n: '02', tag: 'Stap 2', title: 'Van inzicht naar toepassing',     body: 'Die focus vertalen we naar een eerste concrete stap: een werkende use case, een besluitvormingskader of een leiderschapsaanpak. Iets dat verder gaat dan praten alleen.' },
      { n: '03', tag: 'Stap 3', title: 'Verankeren en vooruitkijken',     body: 'We zorgen dat er iets blijft hangen: in taal, richting, eigenaarschap en vervolg. Zodat je na drie maanden verder kunt bouwen zonder dat het afhankelijk is van mij.' },
    ],
    programCta: 'Bekijk de trajectopties →',

    // ── For who ──
    forLabel: 'Voor wie',
    forTitle: 'Voor leidinggevenden die serieus werk willen maken van AI, zonder zich te verliezen in de hype.',
    forItems: [
      { icon: '🧭', text: 'Je weet dat AI impact gaat hebben op jouw organisatie, maar de vertaling naar richting en prioriteit ontbreekt nog.' },
      { icon: '❓', text: 'Je wil de juiste vragen kunnen stellen — intern, richting board of aandeelhouders — zonder zelf specialist te worden.' },
      { icon: '🤝', text: 'Je zoekt persoonlijke begeleiding bij echte keuzes, geen training of dikke advieslaag.' },
      { icon: '📈', text: 'Je wil eindigen met iets dat werkt en intern verder kan groeien.' },
    ],

    // ── Collab (compressed) ──
    collabLabel: 'Netwerk',
    collabTitle: 'Wanneer relevant breng ik vertrouwde specialisten in.',
    collabBody:  'Geen vast team, maar een kring van mensen die ik ken en vertrouw: strategen, technologen, AI-trainers en uitvoerders. Ik breng ze in op het juiste moment — als dat jouw traject verder brengt.',
    collabPeople: [
      { initials: 'WB',   name: 'Wouter Bloik',    role: 'Marketing & commerciële groei' },
      { initials: 'BvdB', name: 'Ben van der Burg', role: 'Technologie & digitale strategie' },
      { initials: 'FM',   name: 'Frank Meeuwsen',   role: 'AI-trainer & consultant' },
      { initials: 'SH',   name: 'Sandra Hofstede',  role: 'Strategisch leiderschap & integratie' },
    ],

    // ── Spots ──
    spotsLabel: 'Beschikbaarheid',
    spotsTitle: 'Ik begeleid maximaal vijf trajecten tegelijk.',
    spotsBody:  'Omdat dit alleen werkt als ik echt kan meedenken. Geen standaard format. Persoonlijke begeleiding met een concreet resultaat.',
    spotsCta1:  'Plan een intakegesprek →',
    spotsCta2:  'Doe eerst de gratis AI-scan',
    spotsCtaGuide: 'Al urgentie? Plan direct. Wil je eerst een richtinggevend beeld? Doe de scan — vijf minuten, direct resultaat.',
    spotsTrust: 'Gratis intake · Geen verplichting · We bekijken samen of er een match is',

    footerCopy: 'Strategisch mentor voor AI & executie',
    footerSub:  'markdekock.com',
    footerWerk: 'Wat ik maak →',
  },
  en: {
    navName:    'Mark de Kock',
    navRole:    'Strategic mentor for AI & execution',
    navPartner: 'Partner · Kirk & Blackbeard',
    navCta:     'Book a call →',

    heroBadge:   'MAX. 5 ENGAGEMENTS AT A TIME · INTAKE REQUIRED',
    heroH1a:     'From AI ambition to',
    heroH1b:     'clear direction, internal ownership, and a first use case that actually works.',
    heroBody:    'Most leaders I speak with don\'t lack information about AI. They lack someone to help them decide — who moves between strategy and what actually gets delivered.',
    heroAuth:    '20 years strategy & execution · Partner Kirk & Blackbeard · AI built across healthcare, finance, FMCG & sustainability',
    heroCta1:    'Book an intake call →',
    heroCta2:    'Take the free AI scan first',
    heroCtaGuide: 'Already have urgency? Book directly. Want a first directional picture? Take the scan.',

    proofStripItems: [
      { n: '20+',   label: 'years at the intersection of strategy & execution' },
      { n: '5',     label: 'sectors: healthcare · finance · FMCG · sustainability · CX' },
      { n: '3 mo',  label: 'personal engagement · board-backed results' },
    ],

    probLabel: 'What I see',
    probTitle: 'The ambition is there. Translating it into movement is the problem.',
    probItems: [
      { icon: '🎯', title: 'Direction without grip.', body: 'Teams reach for tools under pressure. That feels like action. But a tool is no answer to a question that hasn\'t been asked yet. What\'s missing is a decision, not an application.' },
      { icon: '📋', title: 'AI decisions don\'t land.', body: 'Marketing, sales and operations keep moving on their own agendas. The AI choice was never translated into the goals they actually work towards. No shared framework. No owner. No movement.' },
      { icon: '💼', title: 'The CEO already has enough on their plate.', body: 'A clear AI strategy sounds logical but feels like one more risk on top of everything. What\'s missing is someone to trust with keeping this organised — without having to become an expert yourself.' },
    ],

    authLabel: 'Why me',
    authTitle: 'Senior operator. Not an advisor looking at AI from the outside.',
    authItems: [
      'Partner at Kirk & Blackbeard',
      '20 years of experience in strategy, growth, customer experience and execution',
      'Hands-on AI applications built and deployed across multiple sectors',
      'Works in Dutch and English',
    ],
    authP1: 'I\'ve built and applied AI in practice — in healthcare, finance, FMCG and sustainability. Always at the same point: between the strategic decision and what actually gets delivered.',
    authP2: 'That gives a different perspective than an AI specialist. I know how decisions stall. Where the real resistance sits. Why good plans get stranded between leadership and execution. That\'s not abstract — that\'s twenty years of pattern recognition.',

    miniProofLabel: 'From practice',
    miniProofTitle: 'Concrete outcomes, not strategic reflection.',
    miniProofItems: [
      { icon: '💜', sector: 'Healthcare', line: 'From scattered AI pilots to one board-backed priority — worked through to a live application that professionals use daily.' },
      { icon: '♻️', sector: 'Real estate & sustainability', line: 'CSRD pressure translated into a practical model that gives leadership and operations the same picture of reality.' },
      { icon: '⭐', sector: 'Customer Experience', line: 'Abstract customer ambition turned into a steering model. No direction to a shared priority framework in one quarter.' },
      { icon: '🏦', sector: 'Finance & regulated sectors', line: 'First working AI application built and deployed — despite compliance complexity and internal reluctance.' },
    ],

    areasLabel: 'What we work on',
    areasTitle: 'No template. Your situation as the starting point.',
    areasBody:  'I use a consistent framework, not a format. The themes depend on what\'s actually happening in your situation.',
    areas: [
      { icon: '🧭', title: 'Direction and priority',                  body: 'Where does AI touch your business model or services? What needs attention now, and what can wait?' },
      { icon: '👔', title: 'Leadership and decision-making',          body: 'What role do you need to take? What can you delegate, what must you own? How do you stay in control?' },
      { icon: '🛡️', title: 'Risk and governance',                    body: 'Data, reputation, compliance and internal frameworks — without letting caution bring everything to a standstill.' },
      { icon: '⚡', title: 'What\'s already happening',              body: 'What AI initiatives or shadow practices are already underway? What works, what\'s noise, where is energy?' },
      { icon: '🧑‍💻', title: 'People and adoption',                  body: 'Who leads this internally? How do you bring people along without extra change pressure?' },
      { icon: '🎯', title: 'The first use case that matters',        body: 'Not the most spectacular application — the one that\'s credible, achievable and valuable enough to create momentum.' },
    ],

    programLabel: 'How it works',
    programTitle: 'Three months. Personal and focused on something that actually works.',
    programMonths: [
      { n: '01', tag: 'Step 1', title: 'Getting clarity on what\'s at stake',   body: 'We map your situation clearly. Ambition, confusion, current initiatives, open decisions. You get an honest picture and a clear focus.' },
      { n: '02', tag: 'Step 2', title: 'From insight to application',           body: 'We translate that focus into a first concrete step: a working use case, a decision framework or a leadership approach. Something that goes beyond conversation.' },
      { n: '03', tag: 'Step 3', title: 'Embedding and looking ahead',           body: 'We make sure something sticks: in language, direction, ownership and follow-through. So you can keep building after three months.' },
    ],
    programCta: 'See engagement options →',

    forLabel: 'Who this is for',
    forTitle: 'For senior leaders who want to make AI work — without getting lost in the hype.',
    forItems: [
      { icon: '🧭', text: 'You know AI is going to impact your organisation, but the translation to direction and priority is still missing.' },
      { icon: '❓', text: 'You want to ask the right questions — with your team, board or shareholders — without having to become a technical expert.' },
      { icon: '🤝', text: 'You want personal guidance on real choices, not a training or a thick advisory layer.' },
      { icon: '📈', text: 'You want to end up with something that works and can grow internally.' },
    ],

    collabLabel: 'Network',
    collabTitle: 'When relevant, I bring in trusted specialists.',
    collabBody:  'No fixed team, but a circle of people I know and trust: strategists, technologists, AI trainers and practitioners. I bring them in at the right moment — when that moves your engagement forward.',
    collabPeople: [
      { initials: 'WB',   name: 'Wouter Bloik',    role: 'Marketing & commercial growth' },
      { initials: 'BvdB', name: 'Ben van der Burg', role: 'Technology & digital strategy' },
      { initials: 'FM',   name: 'Frank Meeuwsen',   role: 'AI trainer & consultant' },
      { initials: 'SH',   name: 'Sandra Hofstede',  role: 'Strategic leadership & integration' },
    ],

    spotsLabel: 'Availability',
    spotsTitle: 'I work with a maximum of five engagements at a time.',
    spotsBody:  'Because this only works if I can genuinely think along in your situation. No standard format. Personal guidance with a concrete result.',
    spotsCta1:  'Book an intake call →',
    spotsCta2:  'Take the free AI scan first',
    spotsCtaGuide: 'Already have urgency? Book directly. Want a first picture first? Take the scan — five minutes, instant result.',
    spotsTrust: 'Free intake · No obligations · We\'ll see if there\'s a fit',

    footerCopy: 'Strategic mentor for AI & execution',
    footerSub:  'markdekock.com',
    footerWerk: 'What I build →',
  },
}

export default function MentorV2Page() {
  const [lang, setLang] = useState<'nl'|'en'>('nl')
  const t = T[lang]

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    sessionStorage.setItem('mentor_attribution', JSON.stringify({
      ref:          'mentor_v2',
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
          <div className="flex items-center gap-3">
            <div style={{ width: 38, height: 38, borderRadius: 12, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: WHITE, fontFamily: 'serif' }}>M</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: INK, lineHeight: 1.2 }}>{t.navName}</p>
              <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.2 }}>{t.navRole}</p>
              <p style={{ fontSize: 10, color: WARM, fontWeight: 600, lineHeight: 1.2 }}>{t.navPartner}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 100, padding: 3, gap: 2 }}>
              {(['nl', 'en'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                  background: lang === l ? WHITE : 'transparent',
                  color: lang === l ? INK : MUTED,
                  border: 'none', cursor: 'pointer',
                  boxShadow: lang === l ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                  transition: 'all 0.15s',
                }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <a href="/werk" style={{ fontSize: 13, fontWeight: 600, color: BODY, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {lang === 'nl' ? 'Projecten' : 'Projects'}
            </a>
            <a href={CALENDLY_INTAKE} target="_blank" rel="noopener noreferrer" style={{
              background: WARM, color: WHITE, fontSize: 13, fontWeight: 700,
              padding: '8px 20px', borderRadius: 100, textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              {t.navCta}
            </a>
          </div>
        </div>
      </nav>

      {/* ── V2 preview banner ── */}
      <div style={{ background: ACCENT, padding: '10px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: WHITE, fontWeight: 600, margin: 0 }}>
          ✦ PREVIEW — V2 (concept) · <a href="/mentor" style={{ color: WHITE, textDecoration: 'underline' }}>Bekijk huidige versie →</a>
        </p>
      </div>

      {/* ── Hero ── */}
      <section style={{ background: INK, paddingTop: 80, paddingBottom: 96 }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div variants={stagger} initial="hidden" animate="show">

            {/* Authority line above badge */}
            <motion.p variants={fadeUp} style={{ fontSize: 12, color: `${WARM}CC`, fontWeight: 600, marginBottom: 12, letterSpacing: '0.02em' }}>
              {t.heroAuth}
            </motion.p>

            <motion.div variants={fadeUp}>
              <span style={{
                display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: WARM, background: `${WARM}22`,
                padding: '5px 16px', borderRadius: 100, marginBottom: 28,
                border: `1px solid ${WARM}44`,
              }}>
                {t.heroBadge}
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 22, color: WHITE }}>
              {t.heroH1a}{' '}
              <span style={{ background: `linear-gradient(135deg, ${WARM}, #F59E0B)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {t.heroH1b}
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} style={{ fontSize: 17, color: '#CBD5E1', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 36px' }}>
              {t.heroBody}
            </motion.p>

            {/* CTA pair */}
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              <a href={CALENDLY_INTAKE} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-block', background: WARM, color: WHITE, fontWeight: 700, fontSize: 15,
                padding: '14px 36px', borderRadius: 100, textDecoration: 'none',
                boxShadow: `0 12px 32px ${WARM}55`,
              }}>
                {t.heroCta1}
              </a>
              <a href={lang === 'nl' ? '/nl' : '/en'} style={{
                display: 'inline-block', background: 'transparent', color: '#94A3B8', fontWeight: 600, fontSize: 14,
                padding: '14px 28px', borderRadius: 100, textDecoration: 'none', border: '1px solid #334155',
              }}>
                {t.heroCta2}
              </a>
            </motion.div>

            {/* CTA guidance — new: explains the choice */}
            <motion.p variants={fadeUp} style={{ fontSize: 13, color: '#475569', fontStyle: 'italic' }}>
              {t.heroCtaGuide}
            </motion.p>

          </motion.div>
        </div>
      </section>

      {/* ── Proof strip (new — early credibility) ── */}
      <div style={{ background: NAVY, borderTop: `1px solid rgba(255,255,255,0.07)` }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div style={{ display: 'flex', justifyContent: 'center', gap: 0, flexWrap: 'wrap' }}>
            {t.proofStripItems.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 0,
                padding: '0 32px',
                borderRight: i < t.proofStripItems.length - 1 ? '1px solid rgba(255,255,255,0.12)' : 'none',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 24, fontWeight: 900, color: WARM, lineHeight: 1.1, marginBottom: 4 }}>{item.n}</p>
                  <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.4, maxWidth: 160 }}>{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Wave ── */}
      <div style={{ background: NAVY }}>
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

      {/* ── Authority (Waarom ik — earlier, more direct) ── */}
      <section style={{ background: INK, padding: '80px 24px' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 40 }} className="sm:grid-cols-2" >
              <motion.div variants={fadeUp}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: WARM, marginBottom: 16 }}>
                  {t.authLabel}
                </p>
                <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: WHITE, marginBottom: 24, lineHeight: 1.25 }}>
                  {t.authTitle}
                </h2>
                <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.75, marginBottom: 16 }}>{t.authP1}</p>
                <p style={{ fontSize: 15, color: WHITE, lineHeight: 1.75, fontWeight: 500 }}>{t.authP2}</p>
              </motion.div>
              <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
                {t.authItems.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'rgba(255,255,255,0.05)', borderRadius: 12,
                    padding: '14px 18px', border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: WARM, flexShrink: 0 }} />
                    <p style={{ fontSize: 14, color: '#CBD5E1', lineHeight: 1.4 }}>{item}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Mini proof (moved earlier, more specific) ── */}
      <section style={{ background: LIGHT, padding: '80px 24px' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT, marginBottom: 10 }}>
              {t.miniProofLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 800, marginBottom: 12, color: INK }}>
              {t.miniProofTitle}
            </motion.h2>
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 44 }}>
              <a href="/werk" style={{ fontSize: 13, fontWeight: 600, color: ACCENT, textDecoration: 'none', borderBottom: `1px solid ${ACCENT}`, paddingBottom: 2 }}>
                {lang === 'nl' ? 'Bekijk projecten →' : 'View projects →'}
              </a>
            </motion.div>
            <div className="grid sm:grid-cols-2 gap-5">
              {t.miniProofItems.map((p, i) => (
                <motion.div key={i} variants={fadeUp} style={{
                  background: WHITE, borderRadius: 18, padding: '28px 26px',
                  border: `1px solid ${BORDER}`,
                  display: 'flex', gap: 18, alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: 26, flexShrink: 0, marginTop: 2 }}>{p.icon}</span>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{p.sector}</p>
                    <p style={{ fontSize: 14, color: BODY, lineHeight: 1.65 }}>{p.line}</p>
                  </div>
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
                  <motion.div key={i} variants={fadeUp} style={{
                    borderRadius: 18, padding: '24px 22px',
                    background: isDark ? INK : LIGHT,
                    border: `1px solid ${isDark ? '#ffffff11' : BORDER}`,
                  }}>
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
                  border: `1px solid ${WHITE}15`, position: 'relative',
                }}>
                  <div style={{
                    display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: WARM, background: `${WARM}22`,
                    padding: '3px 12px', borderRadius: 100, marginBottom: 20, border: `1px solid ${WARM}33`,
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
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginTop: 40 }}>
              <a href="/mentor/aanpak" style={{
                display: 'inline-block', fontSize: 14, fontWeight: 700, color: WARM,
                padding: '10px 28px', borderRadius: 100, border: `1px solid ${WARM}55`,
                textDecoration: 'none', background: `${WARM}12`,
              }}>
                {t.programCta}
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── For who (tightened — 4 items instead of 5) ── */}
      <section style={{ background: LIGHT, padding: '80px 24px' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT, marginBottom: 10 }}>
              {t.forLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, marginBottom: 40, color: INK, lineHeight: 1.3 }}>
              {t.forTitle}
            </motion.h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {t.forItems.map((item, i) => (
                <motion.div key={i} variants={fadeUp} style={{
                  background: WHITE, borderRadius: 16, padding: '18px 22px',
                  border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'flex-start', gap: 16,
                }}>
                  <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                  <p style={{ fontSize: 15, color: BODY, lineHeight: 1.65 }}>{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Network (compressed — not a second story) ── */}
      <section style={{ background: INK, padding: '64px 24px' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: WARM, marginBottom: 12 }}>
              {t.collabLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: WHITE, marginBottom: 12, lineHeight: 1.25 }}>
              {t.collabTitle}
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 15, color: MUTED, lineHeight: 1.7, marginBottom: 28, maxWidth: 560 }}>
              {t.collabBody}
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {t.collabPeople.map((person) => (
                <div key={person.name} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'rgba(255,255,255,0.06)', borderRadius: 100,
                  padding: '8px 16px 8px 10px', border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', background: NAVY,
                    border: `1px solid rgba(255,255,255,0.15)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 800, color: WHITE, flexShrink: 0,
                  }}>
                    {person.initials}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: WHITE, lineHeight: 1.2 }}>{person.name}</p>
                    <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.2 }}>{person.role}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Spots + CTA (with choice guidance) ── */}
      <section style={{ background: LIGHT, padding: '100px 24px' }}>
        <div className="max-w-xl mx-auto text-center">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: WARM, marginBottom: 16 }}>
              {t.spotsLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, color: INK, marginBottom: 16, lineHeight: 1.1 }}>
              {t.spotsTitle}
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 17, color: BODY, marginBottom: 16, lineHeight: 1.7, maxWidth: 420, margin: '0 auto 16px' }}>
              {t.spotsBody}
            </motion.p>

            {/* CTA guidance — clear decision helper */}
            <motion.div variants={fadeUp} style={{
              background: WHITE, borderRadius: 16, padding: '16px 24px',
              border: `1px solid ${BORDER}`, marginBottom: 32, maxWidth: 420, margin: '0 auto 32px',
            }}>
              <p style={{ fontSize: 13, color: BODY, lineHeight: 1.6, fontStyle: 'italic' }}>{t.spotsCtaGuide}</p>
            </motion.div>

            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={CALENDLY_INTAKE} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-block', background: WARM, color: WHITE, fontWeight: 700, fontSize: 15,
                padding: '14px 36px', borderRadius: 100, textDecoration: 'none',
                boxShadow: `0 12px 32px ${WARM}44`,
              }}>
                {t.spotsCta1}
              </a>
              <a href={lang === 'nl' ? '/nl' : '/en'} style={{
                display: 'inline-block', background: 'transparent', color: BODY, fontWeight: 600, fontSize: 14,
                padding: '14px 28px', borderRadius: 100, textDecoration: 'none', border: `1px solid ${BORDER}`,
              }}>
                {t.spotsCta2}
              </a>
            </motion.div>
            <motion.p variants={fadeUp} style={{ fontSize: 13, color: MUTED, marginTop: 20 }}>
              {t.spotsTrust}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: INK, borderTop: `1px solid rgba(255,255,255,0.07)`, padding: '32px 24px' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: WHITE }}>{t.navName}</p>
            <p style={{ fontSize: 12, color: MUTED }}>{t.footerCopy}</p>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <a href="/werk" style={{ fontSize: 13, color: MUTED, textDecoration: 'none' }}>{t.footerWerk}</a>
            <a href="/mentor/aanpak" style={{ fontSize: 13, color: MUTED, textDecoration: 'none' }}>{lang === 'nl' ? 'Aanpak' : 'Approach'}</a>
            <a href="/privacy" style={{ fontSize: 13, color: MUTED, textDecoration: 'none' }}>Privacy</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
