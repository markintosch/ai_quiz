'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'

const INK        = '#0F172A'
const WHITE      = '#FFFFFF'
const LIGHT      = '#F8FAFC'
const WARM       = '#D97706'
const WARM_LIGHT = '#FEF3C7'
const ACCENT     = '#1D4ED8'
const BODY       = '#374151'
const MUTED      = '#94A3B8'
const BORDER     = '#E2E8F0'

const CALENDLY_INTAKE = 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.09 } },
}

const T = {
  nl: {
    navName:    'Mark de Kock',
    navRole:    'Strategisch mentor voor AI & executie',
    navPartner: 'Partner · Brand PWRD Media',
    navCta:     'Plan gesprek →',

    heroLabel:  'Wat ik maak',
    heroTitle:  'Ik adviseer niet alleen. Ik maak ook.',
    heroBody:   'De meeste adviseurs praten over AI. Ik gebruik het om dingen te bouwen die werken. Samen met Claude heb ik een platform ontwikkeld dat nu acht diagnostische producten draait — voor sectoren van pharma tot M&A, van klantervaringsmanagement tot cloud readiness. Productieomgeving. Meerdere talen. Één architectuur.',

    platformLabel: 'Het platform',
    platformTitle: 'Één codebase. Acht producten. Zeven klantcontexten.',
    platformBody:  'Wat begon als een AI-gereedheidsdiagnose is uitgegroeid tot een white-label assessmentplatform met eigen subdomeinen per klant, volledig admin-dashboard, GDPR-compliance, score-gebaseerde routering en een live multiplayer quiz-engine voor evenementen. Gebouwd met AI als co-developer op elke laag — van architectuur tot copy tot securityaudit.',
    platformStack: 'Next.js 14 · Supabase · Vercel · Resend · Tailwind · Framer Motion',

    projectsLabel: 'Voorbeelden',
    projects: [
      {
        tag:   'Diagnostisch platform',
        title: 'AI-gereedheidsdiagnose',
        body:  'Zes dimensies. Zesentwintig vragen. Benchmarking per sector en rol. Shadow AI-detectie. Ingezet als publiek instrument én als white-label product met bedrijfsbranding, cohortanalyse en meertalige ondersteuning. Het fundament waarop alles daarna gebouwd is.',
        pills: ['NL · EN · FR', 'White-label', 'Benchmarking', 'Cohortanalyse'],
        accent: ACCENT,
      },
      {
        tag:   'Due diligence tool',
        title: 'M&A-gereedheid',
        body:  'Zeven dimensies. Vier invalshoeken — eigenaar, PE-investeerder, portfoliobedrijf, adviseur. Dezelfde organisatie, vier verschillende lezingen van de data. Het scoringsmodel maakt zichtbaar waar de waardecreatie-aannames realistisch zijn en waar niet.',
        pills: ['4 rollen', 'Scoringslogica', 'Exit readiness'],
        accent: '#6B2D8B',
      },
      {
        tag:   'Go-to-market intelligence',
        title: 'Oncologie GTM',
        body:  'Lanceringsgereedheid voor een diagnostisch product in tien Europese markten. Aparte invalshoeken voor Medical Affairs, Country Heads, Market Access en Commercial — elk met relevante dimensies en een gedeeld dashboard voor kwartaalomzet per markt.',
        pills: ['10 markten', 'Pharma', '4 rollen', 'Sales dashboard'],
        accent: '#047857',
      },
      {
        tag:   'Live engagement',
        title: 'Arena',
        body:  'Een multiplayer quiz-engine voor evenementen en workshops. Deelnemers joinen met een code, beantwoorden getimede vragen, zien een live scorebord bijwerken. Gescoord op juistheid, snelheid en moeilijkheidsgraad. Voor teams die op een andere manier geactiveerd willen worden dan via een standaard sessie.',
        pills: ['Real-time', 'Live scorebord', 'Evenementen'],
        accent: WARM,
      },
      {
        tag:   'Positioneringssite',
        title: 'markdekock.com',
        body:  'Deze site. Van nul naar live in één iteratief traject — positionering, copy, UX, techniek, DNS, deployment. Tweetalig. Directe rootdomein-routing zonder redirect. Elk stuk copy gebouwd vanuit echte observaties, niet vanuit een brief.',
        pills: ['NL · EN', 'Rootdomein-routing', 'Calendly-integratie'],
        accent: INK,
      },
    ],

    closingTitle: 'Wat dit betekent',
    closingBody:  'Ik kan meedenken over strategie en het daarna ook uitvoeren. Niet via een ontwikkelaar die mijn briefing interpreteert — maar direct, snel en met begrip van wat er onder de motorkap zit. Dat verandert wat er mogelijk is in een traject.',

    ctaTitle: 'Klaar om te bouwen?',
    ctaBody:  'Plan een intakegesprek. We kijken samen wat logisch is als eerste stap.',
    ctaCta:   'Plan gratis intake →',
    ctaTrust: 'Gratis · Geen verplichting · 30 minuten',

    faqLabel: 'Veelgestelde vragen',
    faqTitle: 'Alles wat je wilt weten voor je besluit',
    faq: [
      { q: 'Hoe ziet een traject er in de praktijk uit?', a: 'Dat verschilt per klant. Afhankelijk van onze eerste gesprekken en prioriteiten bepalen we samen waar behoefte aan is. Soms werk ik 2–3 weken intensief samen. Andere keren komen we 1 keer samen en werk ik bijvoorbeeld een workshop of visiedocument uit om te bespreken. Ik ben altijd bereikbaar voor kortere vragen of beslismomenten. Elk gesprek heeft een concreet doel: een openstaande vraag beantwoorden, een keuze maken of een volgende stap vastleggen.' },
      { q: 'Hoe vaak spreken we af?', a: 'Afhankelijk van de grootte en het belang van de opdracht maken we samen afspraken hoe vaak we elkaar zien — fysiek en/of online. Bij de meeste opdrachten is met name het begin veel meer fysiek en in contact met alle spelers, medewerkers en partners. Het ritme past zich aan op basis van wat er speelt.' },
      { q: 'Is dit voor de CEO/CDO/CTO/CMO zelf of voor het hele managementteam?', a: 'Het begint vaak met 1 persoon en idealiter heb ik contact met het hele team. AI is niet iets dat je half moet aanpakken binnen 1 deel van de organisatie. Waar we bijvoorbeeld eerst aan de slag gaan met marketing en sales, kan het goed zijn om een bredere workshop te houden met het hele MT — zodat iedereen op hetzelfde kennisniveau komt en de muren tussen afdelingen mogelijk ook worden geslecht door een verbindend element zoals AI. Uiteraard waar wenselijk en mogelijk.' },
      { q: 'Werkt dit ook als mijn organisatie nog nauwelijks met AI bezig is?', a: 'Juist dan. Het meeste werk zit niet in de technologie — het zit in de vraag welke richting je op wilt en hoe je dat intern voor elkaar krijgt. Daar begin je mee, ongeacht hoe ver je al bent.' },
      { q: 'Wat als we al een AI-strategie hebben?', a: 'Dan kijken we of die strategie werkt — of hij gedeeld wordt, of hij vertaald is naar keuzes die mensen daadwerkelijk maken. Een strategie op papier is iets anders dan beweging in een organisatie.' },
      { q: 'Ik weet nog niet goed wat ik nodig heb. Heeft het al zin om contact op te nemen?', a: 'Dat is precies het goede moment. De intake is er juist voor om dat samen helder te krijgen — wat er speelt, wat de echte blokkade is, en wat een zinvolle eerste stap zou zijn. Je committeert je aan niets. Als er geen match is, zeg ik dat gewoon.' },
      { q: 'Moet ik meteen een volledig traject afnemen?', a: 'Nee. We beginnen altijd met een gratis intakegesprek om te kijken of er een match is. Daarna volgt een korte verkenningsfase — zodat we snel helder krijgen wat jouw situatie vraagt. Pas dan beslissen we samen wat logisch is. Sommige trajecten lopen over drie maanden. Andere bestaan uit een reeks gerichte gesprekken. De structuur past zich aan jouw situatie aan, niet andersom.' },
      { q: 'Wat kost een traject?', a: 'Je betaalt per fase, niet voor een volledig traject vooraf. Dat wordt pas helder na het intakegesprek — afhankelijk van omvang en context. Ik zorg er altijd voor dat de stappen behapbaar zijn en voorzien van duidelijke deliverables per fase. Zo kun je te allen tijde beslissen om te stoppen als de realiteit van alle dag daarom vraagt. Je zult ook altijd de opgeleverde documenten, presentaties, data en agents bezitten. Het intakegesprek zelf is gratis en vrijblijvend.' },
      { q: 'Hoe snel kan ik starten?', a: 'Vaak kunnen we binnen 1 à 2 weken beginnen met een kick-off zodat we snel duidelijk krijgen wat de beste aanpak is. Ik werk met maximaal vijf trajecten tegelijk.' },
      { q: 'In welke sectoren heb je gewerkt?', a: 'Door mijn brede ervaring heb ik voor bijna alle sectoren gewerkt. Denk aan Automotive, Finance, Gezondheidszorg, FMCG, Overheid, Publiek/privaat, duurzaamheid en klantbeleving. Maar AI-vraagstukken voor leiders zijn sectoroverstijgend — de patronen die ik zie, herhalen zich ongeacht de branche.' },
      { q: 'Waarom Brand PWRD Media?', a: 'Brand PWRD Media is een netwerk van senior operators — mensen met brede ervaring in strategie, groei en executie. Ik werk vanuit dat netwerk omdat het mij de ruimte geeft om selectief en persoonlijk te zijn. Geen groot bureau, geen junior consultants. Daarnaast hebben we een netwerk van mensen die bewezen kwaliteit leveren, waar we eerder mee hebben gewerkt en voor hun kwaliteit kunnen instaan.' },
      { q: 'Wat maakt dit anders dan een coach of consultant?', a: 'Een coach werkt aan jou als persoon. Een consultant lost een probleem op. Ik doe iets ertussenin: ik help jou als leidinggevende de juiste beslissingen nemen over een specifiek strategisch vraagstuk — en zorg dat je het daarna zelf kunt. Terwijl ik ook de stakeholders binnen jouw omgeving meeneem op de reis naar hun doelen, met de ondersteuning van AI. Want AI zelf is nooit het doel.' },
    ],

    footerCopy: 'Strategisch mentor voor AI & executie',
    footerSub:  'markdekock.com',
    footerBack: '← Terug naar markdekock.com',
  },
  en: {
    navName:    'Mark de Kock',
    navRole:    'Strategic mentor for AI & execution',
    navPartner: 'Partner · Brand PWRD Media',
    navCta:     'Book a call →',

    heroLabel:  'What I build',
    heroTitle:  'I don\'t just advise. I build too.',
    heroBody:   'Most advisors talk about AI. I use it to build things that work. Together with Claude I\'ve developed a platform that now runs eight diagnostic products — across pharma, M&A, customer experience and cloud readiness. Production environment. Multiple languages. One architecture.',

    platformLabel: 'The platform',
    platformTitle: 'One codebase. Eight products. Seven client contexts.',
    platformBody:  'What started as an AI readiness diagnostic has grown into a white-label assessment platform with per-client subdomains, a full admin dashboard, GDPR compliance, score-based routing and a live multiplayer quiz engine for events. Built with AI as co-developer at every layer — from architecture to copy to security audit.',
    platformStack: 'Next.js 14 · Supabase · Vercel · Resend · Tailwind · Framer Motion',

    projectsLabel: 'Examples',
    projects: [
      {
        tag:   'Diagnostic platform',
        title: 'AI Maturity Assessment',
        body:  'Six dimensions. Twenty-six questions. Benchmarking by sector and role. Shadow AI detection. Deployed as a public tool and as a white-label product with company branding, cohort analysis and multi-language support. The foundation everything else is built on.',
        pills: ['NL · EN · FR', 'White-label', 'Benchmarking', 'Cohort analysis'],
        accent: ACCENT,
      },
      {
        tag:   'Due diligence tool',
        title: 'M&A Readiness',
        body:  'Seven dimensions. Four entry points — owner, PE investor, portfolio company, advisor. The same organisation, four different readings of the data. The scoring model surfaces where value creation assumptions hold and where they don\'t.',
        pills: ['4 roles', 'Scoring logic', 'Exit readiness'],
        accent: '#6B2D8B',
      },
      {
        tag:   'Go-to-market intelligence',
        title: 'Oncology GTM',
        body:  'Launch readiness for a diagnostic product across ten European markets. Separate entry points for Medical Affairs, Country Heads, Market Access and Commercial — each with relevant dimensions and a shared dashboard tracking quarterly revenue per market.',
        pills: ['10 markets', 'Pharma', '4 roles', 'Sales dashboard'],
        accent: '#047857',
      },
      {
        tag:   'Live engagement',
        title: 'Arena',
        body:  'A multiplayer quiz engine for events and workshops. Participants join with a code, answer timed questions, watch a live leaderboard update. Scored on accuracy, speed and difficulty. For teams that want a different kind of activation than a standard session.',
        pills: ['Real-time', 'Live leaderboard', 'Events'],
        accent: WARM,
      },
      {
        tag:   'Positioning site',
        title: 'markdekock.com',
        body:  'This site. From zero to live in one iterative process — positioning, copy, UX, engineering, DNS, deployment. Bilingual. Root domain routing without redirect. Every piece of copy built from real observations, not from a brief.',
        pills: ['NL · EN', 'Root domain routing', 'Calendly integration'],
        accent: INK,
      },
    ],

    closingTitle: 'What this means',
    closingBody:  'I can think through strategy and then execute it. Not via a developer who interprets my brief — directly, quickly and with understanding of what\'s under the hood. That changes what\'s possible in an engagement.',

    ctaTitle: 'Ready to build?',
    ctaBody:  'Book an intake call. We\'ll look together at what makes sense as a first step.',
    ctaCta:   'Book free intake →',
    ctaTrust: 'Free · No commitment · 30 minutes',

    faqLabel: 'FAQ',
    faqTitle: 'Everything you want to know before you decide',
    faq: [
      { q: 'How does an engagement work in practice?', a: 'It depends on the client. Based on our first conversations and priorities we decide together where the need is. Sometimes I work intensively together for 2–3 weeks. Other times we meet once and I work out a workshop or vision document to discuss. I\'m always reachable for shorter questions or decision moments. Every conversation has a concrete goal: answer an open question, make a choice, or fix the next step.' },
      { q: 'How often do we meet?', a: 'Depending on the scale and importance of the assignment, we agree together on how often we see each other — in person and/or online. For most assignments the beginning is much more physical and in contact with all players, employees and partners. The rhythm adapts based on what\'s happening.' },
      { q: 'Is this for the CEO/CDO/CTO/CMO or the entire management team?', a: 'It often starts with 1 person and ideally I have contact with the whole team. AI is not something you can tackle halfway within 1 part of the organisation. Where we first start with marketing and sales, for example, it can be good to hold a broader workshop with the whole MT — so everyone is at the same knowledge level and the walls between departments can be broken down through a connecting element like AI. Obviously where desirable and possible.' },
      { q: 'Does this work if my organisation is barely engaged with AI yet?', a: 'Especially then. Most of the work is not in the technology — it\'s in the question of which direction you want to go and how you get that done internally. That\'s where you start, regardless of how far along you are.' },
      { q: 'What if we already have an AI strategy?', a: 'Then we look at whether that strategy works — whether it\'s shared, whether it\'s translated into choices people actually make. A strategy on paper is different from movement in an organisation.' },
      { q: 'I\'m not sure yet what I need. Does it make sense to reach out already?', a: 'That\'s exactly the right moment. The intake is there to get that clear together — what\'s happening, what the real obstacle is, and what a meaningful first step would be. You commit to nothing. If there\'s no match, I\'ll say so.' },
      { q: 'Do I need to commit to a full engagement straight away?', a: 'No. We always start with a free intake conversation to see if there\'s a match. After that comes a short exploration phase — so we quickly get clarity on what your situation needs. Only then do we decide together what makes sense. Some engagements run over three months. Others are a series of focused conversations. The structure adapts to your situation, not the other way around.' },
      { q: 'What does an engagement cost?', a: 'You pay per phase, not for a full engagement upfront. The specifics only become clear after the intake — depending on scale and context. I always make sure the steps are manageable with clear deliverables per phase. So you can decide at any time to stop if day-to-day reality requires it. You will also always own the delivered documents, presentations, data and agents. The intake conversation itself is free and without obligation.' },
      { q: 'How quickly can I start?', a: 'We can often start within 1 to 2 weeks with a kick-off so we quickly get clarity on the best approach. I work with a maximum of five engagements at a time.' },
      { q: 'Which sectors have you worked in?', a: 'Through my broad experience I have worked for almost all sectors. Think Automotive, Finance, Healthcare, FMCG, Government, Public/private, sustainability and customer experience. But AI questions for leaders are cross-sectoral — the patterns I see repeat themselves regardless of the sector.' },
      { q: 'Why Brand PWRD Media?', a: 'Brand PWRD Media is a network of senior operators — people with broad experience in strategy, growth and execution. I work from that network because it gives me the space to be selective and personal. No large firm, no junior consultants. We also have a network of people who deliver proven quality, with whom we have worked before and can vouch for.' },
      { q: 'What makes this different from a coach or consultant?', a: 'A coach works on you as a person. A consultant solves a problem. I do something in between: I help you as a leader make the right decisions about a specific strategic question — and make sure you can do it yourself afterwards. While I also bring the stakeholders within your environment along on the journey towards their goals, with the support of AI. Because AI itself is never the goal.' },
    ],

    footerCopy: 'Strategic mentor for AI & execution',
    footerSub:  'markdekock.com',
    footerBack: '← Back to markdekock.com',
  },
}

export default function WerkPage() {
  const [lang, setLang] = useState<'nl' | 'en'>('nl')
  const t = T[lang]
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div style={{ minHeight: '100vh', background: WHITE, color: INK, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Nav */}
      <nav style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/mentor" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: WHITE, fontFamily: 'serif' }}>M</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: INK, lineHeight: 1.2 }}>{t.navName}</p>
              <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.2 }}>{t.navRole}</p>
              <p style={{ fontSize: 10, color: WARM, fontWeight: 600, lineHeight: 1.2 }}>{t.navPartner}</p>
            </div>
          </a>
          <div className="flex items-center gap-3">
            <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 100, padding: 3, gap: 2 }}>
              {(['nl', 'en'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)} style={{ padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: lang === l ? WHITE : 'transparent', color: lang === l ? INK : MUTED, border: 'none', cursor: 'pointer', boxShadow: lang === l ? '0 1px 4px rgba(0,0,0,0.10)' : 'none', transition: 'all 0.15s' }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <a href={CALENDLY_INTAKE} target="_blank" rel="noopener noreferrer" style={{ background: WARM, color: WHITE, fontSize: 13, fontWeight: 700, padding: '8px 20px', borderRadius: 100, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {t.navCta}
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: INK, paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.p variants={fadeUp} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: WARM, marginBottom: 20 }}>
              {t.heroLabel}
            </motion.p>
            <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: WHITE, lineHeight: 1.1, marginBottom: 20 }}>
              {t.heroTitle}
            </motion.h1>
            <motion.p variants={fadeUp} style={{ fontSize: 17, color: MUTED, lineHeight: 1.7, maxWidth: 540, margin: '0 auto' }}>
              {t.heroBody}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Platform */}
      <section style={{ background: LIGHT, padding: '72px 24px' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT, marginBottom: 14 }}>
              {t.platformLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: INK, marginBottom: 20, lineHeight: 1.25 }}>
              {t.platformTitle}
            </motion.h2>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 16, color: BODY, lineHeight: 1.75, maxWidth: 580, margin: '0 auto 24px' }}>
              {t.platformBody}
            </motion.p>
            <motion.div variants={fadeUp} style={{ textAlign: 'center' }}>
              <span style={{ display: 'inline-block', fontSize: 12, color: MUTED, fontFamily: 'monospace', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 16px', letterSpacing: '0.03em' }}>
                {t.platformStack}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Projects */}
      <section style={{ background: WHITE, padding: '80px 24px' }}>
        <div className="max-w-5xl mx-auto">
          <motion.p
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: WARM, marginBottom: 48 }}
          >
            {t.projectsLabel}
          </motion.p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {t.projects.map((p, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }}
                style={{
                  background: LIGHT,
                  borderRadius: 20,
                  padding: '32px 36px',
                  border: `1px solid ${BORDER}`,
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  gap: 32,
                  alignItems: 'start',
                  marginBottom: 16,
                }}
                className="flex-col sm:grid"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 900, color: WHITE }}>{(i + 1).toString().padStart(2, '0')}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED }}>
                      {p.tag}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: INK, lineHeight: 1.2, marginBottom: 16 }}>
                    {p.title}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {p.pills.map((pill, j) => (
                      <span key={j} style={{ fontSize: 11, fontWeight: 600, color: p.accent, background: `${p.accent}12`, border: `1px solid ${p.accent}30`, borderRadius: 100, padding: '3px 10px' }}>
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ paddingTop: 4 }}>
                  <p style={{ fontSize: 15, color: BODY, lineHeight: 1.75 }}>{p.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section style={{ background: LIGHT, padding: '72px 24px' }}>
        <div className="max-w-2xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
            <motion.div variants={fadeUp} style={{ background: WHITE, borderRadius: 20, padding: '40px 44px', border: `1px solid ${BORDER}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: WARM_LIGHT, fontFamily: 'serif' }}>M</span>
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: INK, marginBottom: 10 }}>{t.closingTitle}</p>
                  <p style={{ fontSize: 15, color: BODY, lineHeight: 1.75 }}>{t.closingBody}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: WHITE, padding: '80px 24px' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.05 }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: WARM, marginBottom: 14 }}>
              {t.faqLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: INK, marginBottom: 52, lineHeight: 1.25 }}>
              {t.faqTitle}
            </motion.h2>
            <motion.div variants={fadeUp}>
              {t.faq.map((item, i) => (
                <div key={i} style={{ borderTop: `1px solid ${BORDER}` }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16 }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 700, color: INK, lineHeight: 1.4 }}>{item.q}</span>
                    <span style={{ fontSize: 20, color: MUTED, flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', lineHeight: 1 }}>+</span>
                  </button>
                  {openFaq === i && (
                    <p style={{ fontSize: 15, color: BODY, lineHeight: 1.75, paddingBottom: 24, margin: 0, maxWidth: 620 }}>
                      {item.a}
                    </p>
                  )}
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${BORDER}` }} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: INK, padding: '100px 24px' }}>
        <div className="max-w-xl mx-auto text-center">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, color: WHITE, marginBottom: 16, lineHeight: 1.15 }}>
              {t.ctaTitle}
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 17, color: MUTED, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 44px' }}>
              {t.ctaBody}
            </motion.p>
            <motion.div variants={fadeUp}>
              <a href={CALENDLY_INTAKE} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: WARM, color: WHITE, fontWeight: 700, fontSize: 16, padding: '16px 40px', borderRadius: 100, textDecoration: 'none', boxShadow: `0 12px 32px ${WARM}55` }}>
                {t.ctaCta}
              </a>
            </motion.div>
            <motion.p variants={fadeUp} style={{ fontSize: 13, color: '#475569', marginTop: 20 }}>
              {t.ctaTrust}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1E293B', background: '#080E1A', padding: '28px 24px' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div style={{ width: 24, height: 24, borderRadius: 6, background: INK, border: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: WHITE, fontFamily: 'serif' }}>M</div>
            <span style={{ fontSize: 13, color: '#475569' }}>{t.navName} — {t.footerCopy}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <a href="/" style={{ fontSize: 12, color: '#64748B', textDecoration: 'none' }}>{t.footerBack}</a>
            <p style={{ fontSize: 12, color: '#334155', margin: 0 }}>{t.footerSub} · {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
