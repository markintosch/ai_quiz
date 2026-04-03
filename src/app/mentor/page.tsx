'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

// ── GA4 CTA tracking ──────────────────────────────────────────────────────────
function trackCta(id: string, location: string, label: string) {
  if (typeof window === 'undefined') return
  const w = window as unknown as { gtag?: (...a: unknown[]) => void }
  if (typeof w.gtag === 'function') {
    w.gtag('event', 'cta_click', { cta_id: id, cta_location: location, cta_label: label })
  }
}

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
    heroBadge:  'Persoonlijke begeleiding · Beperkt beschikbaar',
    heroH1a:    'Van AI-ambitie naar',
    heroH1b:    'iets wat écht werkt in jouw organisatie.',
    heroBody:   'De meeste leidinggevenden die ik spreek missen geen informatie over AI. Ze missen iemand die helpt beslissen. Niet als trainer, maar als iemand die beweegt tussen strategie en wat er in de praktijk van terechtkomt.',
    heroCta1:   'Plan een intakegesprek →',
    heroCta2:   'Doe eerst de gratis AI-scan',
    heroTrust:  'Persoonlijk · Gratis intake',

    probLabel:  'Wat ik zie',
    probTitle:  'De ambitie is niet het probleem. Het pad ernaar toe wel.',
    probItems: [
      { icon: '🎯', title: 'De richting ontbreekt niet. Het houvast wel.', body: 'Teams grijpen naar tools onder druk. Het voelt als beweging. Maar een tool is geen antwoord op een vraag die nog niet gesteld is.' },
      { icon: '📋', title: 'Strategische keuzes landen niet in de organisatie.', body: 'Marketing, sales en operations werken door op hun eigen agenda. De AI-beslissing is nooit vertaald naar de doelen waar ze op sturen. Er is geen gedeeld kader om op te sturen.' },
      { icon: '💼', title: 'De CEO heeft al genoeg op zijn bord.', body: 'Van merk tot sales tot install base. Een heldere AI-strategie klinkt logisch, maar voelt als risico bovenop alles wat al speelt. Wat ontbreekt is iemand die je kunt vertrouwen om dit geordend te houden.' },
    ],

    whyLabel:  'Waarom ik',
    whyTitle:  'Twintig jaar op het snijvlak van strategie en uitvoering. AI is het nieuwste vraagstuk. Niet het eerste.',
    whyP1:     'Dat geeft een ander perspectief dan een AI-specialist. Ik weet hoe beslissingen vastlopen. Waar de weerstand echt zit. Waarom goede plannen stranden in de ruimte tussen directie en uitvoering.',
    whyP2:     'In die periode heb ik AI-oplossingen gebouwd en ingevoerd in zorg, finance, FMCG en duurzaamheid. Steeds op dezelfde plek: tussen de ambitie en wat er daadwerkelijk van terechtkomt.',
    whyP3:     'Mijn rol zit in dat midden. Tussen de strategische keuze aan de top en de teams die ermee aan de slag moeten. Dat gat is groter dan de meeste directies denken.',

    forLabel:   'Voor wie',
    forTitle:   'Dit is voor leidinggevenden en managementteams die serieus werk willen maken van AI, zonder zich te verliezen in de hype.',
    forItems: [
      { icon: '🧭', text: 'Je weet dat AI impact gaat hebben op jouw organisatie, maar de vertaling naar richting en prioriteit ontbreekt nog.' },
      { icon: '❓', text: 'Je wil de juiste vragen kunnen stellen, zonder zelf specialist of techneut te hoeven worden.' },
      { icon: '🤝', text: 'Je zoekt persoonlijke begeleiding bij echte keuzes, geen training of dikke advieslaag.' },
      { icon: '💬', text: 'Je wil geloofwaardig leidinggeven op dit onderwerp: richting team, directie, board of aandeelhouders.' },
      { icon: '📈', text: 'Je wil eindigen met iets dat werkt en intern verder kan groeien.' },
    ],

    areasLabel: 'Waar we aan werken',
    areasTitle: 'Jouw situatie als vertrekpunt.',
    areasBody:  'Ik gebruik een vaste denkrichting, geen template. De thema\'s die we aanpakken hangen af van wat er in jouw situatie speelt.',
    areas: [
      { icon: '🧭', title: 'Richting en prioriteit',                       body: 'Waar raakt AI jouw businessmodel, je dienstverlening of je manier van werken? Wat vraagt nu aandacht, en wat juist nog niet?' },
      { icon: '👔', title: 'Leiderschap en besluitvorming',                 body: 'Welke rol moet jij als leider pakken? Welke keuzes kun je delegeren, en welke juist niet? Hoe houd je regie zonder alles zelf te hoeven weten?' },
      { icon: '🛡️', title: 'Risico, governance en verantwoordelijkheid',   body: 'Hoe ga je om met data, reputatie, compliance en interne kaders zonder dat het onderwerp vastloopt in voorzichtigheid?' },
      { icon: '⚡', title: 'Wat er al gebeurt in je organisatie',           body: 'Welke AI-initiatieven, experimenten of schaduwpraktijken zijn er al? Wat werkt echt, wat is ruis, en waar zit energie die je kunt benutten?' },
      { icon: '🧑‍💻', title: 'Mensen, cultuur en adoptie',                  body: 'Wie trekt dit intern? Hoe krijg je mensen mee zonder extra veranderdruk te creëren? Wat heeft jouw team nodig om veilig en praktisch te kunnen leren?' },
      { icon: '🎯', title: 'De eerste use case die ertoe doet',             body: 'We kiezen niet de meest spectaculaire toepassing, maar de toepassing die geloofwaardig, haalbaar en waardevol genoeg is om beweging te creëren.' },
    ],

    programLabel: 'Hoe het werkt',
    programTitle: 'In drie stappen. Persoonlijk en gericht op iets dat daadwerkelijk werkt.',
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
        body: 'We zorgen dat er niet alleen iets gestart is, maar ook iets blijft hangen: in taal, richting, eigenaarschap en vervolg. Zodat je daarna zelfstandig verder kunt bouwen.',
        tag: 'Stap 3',
      },
    ],

    proofLabel:  'Ervaring uit de praktijk',
    proofTitle:  'Ik werk op de grens van ambitie en haalbaarheid. Daar ontstaat de echte waarde.',
    proofBody:   'In opdrachten en sectoren maak ik steeds dezelfde vertaalslag. Van wat een organisatie wil naar de eerste stap die mensen daadwerkelijk kunnen zetten.',
    proofItems: [
      { icon: '💜', color: '#6B2D8B', sector: 'Gezondheidszorg',             body: 'Van strategische ambitie rond kennisdeling en best practice naar een toepassing die professionals zelf gebruiken in hun dagelijkse werk.' },
      { icon: '♻️', color: '#398684', sector: 'Vastgoed & Duurzaamheid',     body: 'Van externe druk en CSRD-verplichtingen naar een praktisch model waarmee directie en operatie naar dezelfde werkelijkheid kijken.' },
      { icon: '⭐', color: '#1D4ED8', sector: 'Customer Experience',         body: 'Van abstracte klantambitie naar een meet- en sturingsmodel dat helpt om prioriteiten te kiezen en intern draagvlak op te bouwen.' },
      { icon: '🏦', color: '#374151', sector: 'Finance & gereguleerde context', body: 'Van voorzichtigheid en compliance-zorgen naar een werkbare manier om AI toch verantwoord te verkennen en toe te passen.' },
    ],

    collabLabel: 'Samenwerking',
    collabTitle: 'Een netwerk van mensen die ik vertrouw en ken.',
    collabBody:  'Ik werk vanuit een brede kring van specialisten. Strategen, technologen, trainers en uitvoerders die ik op het juiste moment inbreng. Geen vast team. Wel mensen met wie ik inhoudelijk op één lijn zit.',
    collabNote:  'Hieronder een paar voorbeelden van mensen met wie ik samenwerk.',
    collabPeople: [
      { initials: 'WB',   name: 'Wouter Blok',     url: 'https://www.linkedin.com/in/wouterblok/', role: 'Marketing en commerciële groei',       bio: 'Wouter combineert merkstrategie met commerciële uitvoering. Met zijn Growth Flywheel aanpak brengt hij mensen, processen en platforms op één lijn zodat marketinginspanningen daadwerkelijk door de organisatie heen werken. Brede ervaring in FMCG en retailomgevingen.' },
      { initials: 'BvdB', name: 'Ben van der Burg',  url: 'https://www.benvanderburg.nl/', role: 'Technologie en digitale strategie',    bio: 'Podcast-host van De Technoloog en BNR Digitaal, spreker en tech-expert. Ben vertaalt technologische complexiteit naar strategisch inzicht voor leiders die de juiste vragen willen stellen zonder techneut te worden.' },
      { initials: 'FM',   name: 'Frank Meeuwsen',    url: 'https://frankmeeuwsen.com/', role: 'AI-trainer en consultant',              bio: '30 jaar digitale ervaring. Frank helpt professionals en teams om AI praktisch te integreren in hun dagelijkse werk. Zonder hype, zonder jargon. Scherp op toepassing, eerlijk over wat wel en niet werkt.' },
      { initials: 'SH',   name: 'Sandra Hofstede',   role: 'Strategisch leiderschap en integratie', bio: '20 jaar ervaring in governance, M&A-integratie en turnaround. Sandra stapt in als er beweging nodig is. Bij fusies, schaalvraagstukken of organisaties die vastlopen. Ze herstelt eigenaarschap en brengt structuur waar de druk het hoogst is.' },
    ],

    aboutLabel: 'Over mij',
    aboutTitle: 'Ik help leidinggevenden en managementteams richting geven op het punt waar strategie concreet moet worden.',
    aboutBody1: 'In mijn loopbaan heb ik veel gewerkt op het snijvlak van strategie, groei en uitvoering. AI is voor mij geen los onderwerp bovenop, maar de nieuwste realiteit op een vertrouwd snijvlak: hoe zorg je dat goede ideeën ook landen?',
    aboutBody2: 'Wat ik meebreng: hands-on ervaring met AI in de praktijk én jarenlange ervaring met organisaties die moeten bewegen maar vastlopen. Ik weet wanneer een plan haalbaar is. En wanneer het mooi klinkt maar nooit landt.',
    aboutCredentials: [
      'Partner bij Kirk & Blackbeard',
      'Senior ervaring in strategie, groei, klantbeleving en executie',
      'Hands-on ontwikkeling en toepassing van AI in meerdere sectoren',
      'Werkt in Nederlands en Engels',
      'Ervaring in zorg, finance, FMCG, duurzaamheid, CX en meer',
    ],

    programCta:  'Bekijk de trajectopties →',

    spotsLabel:  'Beschikbaarheid',
    spotsTitle:  'Ik werk met een klein aantal trajecten tegelijk.',
    spotsBody:   'Omdat dit alleen werkt als ik echt kan meedenken in jouw situatie. Geen standaard format. Persoonlijke begeleiding met een concreet resultaat.',
    spotsCta1:   'Plan een intakegesprek →',
    spotsCta2:   'Doe eerst de gratis AI-scan',
    spotsTrust:  'Gratis intake · Geen verplichting · We bekijken samen of er een match is',

    footerCopy:  'Strategisch mentor voor AI & executie',
    footerSub:   'markdekock.com',
    footerWerk:  'Wat ik maak →',
  },
  en: {
    navName:    'Mark de Kock',
    navRole:    'Strategic mentor for AI & execution',
    navPartner: 'Partner · Kirk & Blackbeard',
    navCta:     'Book a call →',
    heroBadge:  'Personal mentorship · Limited availability',
    heroH1a:    'From AI ambition to',
    heroH1b:    'something that actually works in your organisation.',
    heroBody:   'Most leaders I speak with don\'t lack information about AI. They lack someone to help them decide. Not as a trainer, but as someone who moves between strategy and what actually gets delivered.',
    heroCta1:   'Book an intake call →',
    heroCta2:   'Take the free AI scan first',
    heroTrust:  'Personal · Free intake',

    probLabel:  'What I see',
    probTitle:  'The ambition isn\'t the problem. Finding the path forward is.',
    probItems: [
      { icon: '🎯', title: 'Direction isn\'t the problem. Grip is.', body: 'Teams reach for tools under pressure. It feels like action. But a tool is no answer to a question that hasn\'t been asked yet.' },
      { icon: '📋', title: 'Strategic choices don\'t land in the organisation.', body: 'Marketing, sales and operations keep moving on their own agendas. The AI decision was never translated into goals they actually work towards. There\'s no shared framework to steer on.' },
      { icon: '💼', title: 'The CEO already has enough on their plate.', body: 'From brand to sales to install base. A clear AI strategy sounds logical, but feels like one more risk on top of everything else. What\'s missing is someone to trust with keeping this organised.' },
    ],

    whyLabel:  'Why me',
    whyTitle:  'Twenty years at the intersection of strategy and execution. AI is the newest challenge. Not the first.',
    whyP1:     'That gives a different perspective than an AI specialist. I know how decisions stall. Where the real resistance sits. Why good plans get stranded in the space between leadership and execution.',
    whyP2:     'In that time I\'ve built and applied AI in healthcare, finance, FMCG and sustainability. Always at the same point: between the ambition and what actually comes of it.',
    whyP3:     'My role is in that middle. Between the strategic decision at the top and the teams who need to act on it. That gap is larger than most leadership teams expect.',

    forLabel:   'Who this is for',
    forTitle:   'This is for senior managers and management teams who want to make AI work — without getting lost in the hype.',
    forItems: [
      { icon: '🧭', text: 'You know AI is going to impact your organisation, but the translation to direction and priority is still missing.' },
      { icon: '❓', text: 'You want to be able to ask the right questions, without having to become a technical expert yourself.' },
      { icon: '🤝', text: 'You want personal guidance on real choices, not a training or a thick advisory layer.' },
      { icon: '💬', text: 'You want to lead credibly on this topic: with your team, your board, your clients and your shareholders.' },
      { icon: '📈', text: 'You want to end up with something that actually works and can grow internally.' },
    ],

    areasLabel: 'What we work on',
    areasTitle: 'Your situation as the starting point.',
    areasBody:  'I use a consistent framework, not a template. The themes we work on depend on what is actually happening in your situation.',
    areas: [
      { icon: '🧭', title: 'Direction and priority',                         body: 'Where does AI touch your business model, your services or your way of working? What needs attention now, and what can wait?' },
      { icon: '👔', title: 'Leadership and decision-making',                 body: 'What role do you need to take as a leader? What can you delegate, and what must you own? How do you stay in control without needing to know everything?' },
      { icon: '🛡️', title: 'Risk, governance and accountability',            body: 'How do you handle data, reputation, compliance and internal frameworks without letting caution bring everything to a standstill?' },
      { icon: '⚡', title: 'What\'s already happening in your organisation', body: 'What AI initiatives, experiments or shadow practices are already underway? What\'s actually working, what\'s noise, and where is there energy to build on?' },
      { icon: '🧑‍💻', title: 'People, culture and adoption',                 body: 'Who leads this internally? How do you bring people along without creating more change pressure? What does your team need to learn safely and practically?' },
      { icon: '🎯', title: 'The first use case that matters',                body: 'We don\'t pick the most spectacular application. We pick the one that\'s credible, achievable and valuable enough to create real momentum.' },
    ],

    programLabel: 'How it works',
    programTitle: 'Three steps. Personal and focused on something that actually works.',
    programMonths: [
      {
        n: '01', title: 'Getting clarity on what\'s at stake',
        body: 'We map your situation clearly. Where is the ambition? Where is the confusion? What\'s already happening? Where do decisions need to be made? You get an honest picture and a clear focus.',
        tag: 'Step 1',
      },
      {
        n: '02', title: 'From insight to application',
        body: 'We translate that focus into a first concrete step. That could be a working use case, a decision framework, a leadership approach or a combination. Something that goes beyond conversation.',
        tag: 'Step 2',
      },
      {
        n: '03', title: 'Embedding and looking ahead',
        body: 'We make sure something doesn\'t just start. It sticks: in language, direction, ownership and follow-through. So you can keep building independently from there.',
        tag: 'Step 3',
      },
    ],

    proofLabel:  'Experience from practice',
    proofTitle:  'I work at the boundary between ambition and feasibility. That\'s where real value emerges.',
    proofBody:   'Across projects and sectors I make the same translation. From what an organisation wants to the first step people can actually take.',
    proofItems: [
      { icon: '💜', color: '#6B2D8B', sector: 'Healthcare',                  body: 'From strategic ambition around knowledge-sharing and best practice to an application that professionals use themselves in their daily work.' },
      { icon: '♻️', color: '#398684', sector: 'Real estate & Sustainability', body: 'From external pressure and CSRD obligations to a practical model that gives leadership and operations the same picture of reality.' },
      { icon: '⭐', color: '#1D4ED8', sector: 'Customer Experience',          body: 'From abstract customer ambition to a measurement and steering model that helps prioritise and build internal support for the right choices.' },
      { icon: '🏦', color: '#374151', sector: 'Finance & regulated sectors',  body: 'From caution and compliance concerns to a workable way to explore and apply AI responsibly.' },
    ],

    collabLabel: 'Collaboration',
    collabTitle: 'A network of people I trust and know.',
    collabBody:  'I work from a broad circle of specialists. Strategists, technologists, trainers and practitioners I bring in at the right moment. No fixed team. People I am genuinely aligned with.',
    collabNote:  'A few examples of people I work with.',
    collabPeople: [
      { initials: 'WB',   name: 'Wouter Blok',     url: 'https://www.linkedin.com/in/wouterblok/', role: 'Marketing and commercial growth',       bio: 'Wouter combines brand strategy with commercial execution. His Growth Flywheel approach aligns people, processes and platforms so that marketing efforts actually work through the organisation. Broad experience in FMCG and retail environments.' },
      { initials: 'BvdB', name: 'Ben van der Burg',  url: 'https://www.benvanderburg.nl/', role: 'Technology and digital strategy',       bio: 'Podcast host of De Technoloog and BNR Digitaal, speaker and tech expert. Ben translates technological complexity into clear strategic insight for leaders who want to ask the right questions without becoming technical experts.' },
      { initials: 'FM',   name: 'Frank Meeuwsen',    url: 'https://frankmeeuwsen.com/', role: 'AI trainer and consultant',             bio: '30 years of digital experience. Frank helps professionals and teams integrate AI practically into their daily work. No hype, no jargon. Sharp on application, honest about what works and what does not.' },
      { initials: 'SH',   name: 'Sandra Hofstede',   role: 'Strategic leadership and integration',  bio: '20 years of experience in governance, M&A integration and turnaround. Sandra steps in when movement is needed. In mergers, scaling challenges or organisations that have stalled. She restores ownership and brings structure under pressure.' },
    ],

    aboutLabel: 'About me',
    aboutTitle: 'I help senior managers and management teams give direction at the point where strategy needs to become concrete.',
    aboutBody1: 'I\'ve spent a lot of my career at the intersection of strategy, growth and execution. For me, AI isn\'t a separate topic layered on top. It\'s the latest challenge on a familiar question: how do you make sure good ideas actually land?',
    aboutBody2: 'What I bring: hands-on experience building and applying AI in practice, and years of experience with organisations that need to move but keep getting stuck. I know the difference between a plan that sounds right and one that will actually hold.',
    aboutCredentials: [
      'Partner at Kirk & Blackbeard',
      'Senior experience in strategy, growth, customer experience and execution',
      'Hands-on development and application of AI across multiple sectors',
      'Works in Dutch and English',
      'Experience across healthcare, finance, FMCG, sustainability, CX and more',
    ],

    programCta:  'See engagement options →',

    spotsLabel:  'Availability',
    spotsTitle:  'I work with a small number of engagements at a time.',
    spotsBody:   'Because this only works if I can genuinely think along in your situation. No standard format. Personal guidance with a concrete result.',
    spotsCta1:   'Book an intake call →',
    spotsCta2:   'Take the free AI scan first',
    spotsTrust:  'Free intake · No obligations · We\'ll see if there\'s a fit',

    footerCopy:  'Strategic mentor for AI & execution',
    footerSub:   'markdekock.com',
    footerWerk:  'What I build →',
  },
  de: {
    navName:    'Mark de Kock',
    navRole:    'Strategischer Mentor für KI & Umsetzung',
    navPartner: 'Partner · Kirk & Blackbeard',
    navCta:     'Gespräch vereinbaren →',
    heroBadge:  'Persönliches Mentoring · Begrenzte Verfügbarkeit',
    heroH1a:    'Von KI-Ambitionen zu',
    heroH1b:    'etwas, das in deiner Organisation wirklich funktioniert.',
    heroBody:   'Die meisten Führungskräfte, mit denen ich spreche, haben keinen Mangel an Informationen über KI. Was fehlt, ist jemand, der hilft, Entscheidungen zu treffen. Nicht als Trainer, sondern als jemand, der sich zwischen Strategie und dem bewegt, was tatsächlich umgesetzt wird.',
    heroCta1:   'Erstgespräch vereinbaren →',
    heroCta2:   'Zuerst den kostenlosen KI-Scan machen',
    heroTrust:  'Persönlich · Kostenloses Erstgespräch',

    probLabel:  'Was ich beobachte',
    probTitle:  'Die Ambition ist nicht das Problem. Der Weg dorthin schon.',
    probItems: [
      { icon: '🎯', title: 'Die Richtung fehlt nicht. Die Orientierung schon.', body: 'Teams greifen unter Druck zu Tools. Das fühlt sich nach Bewegung an. Aber ein Tool ist keine Antwort auf eine Frage, die noch nicht gestellt wurde.' },
      { icon: '📋', title: 'Strategische Entscheidungen landen nicht in der Organisation.', body: 'Marketing, Vertrieb und Operations arbeiten weiterhin auf eigene Rechnung. Die KI-Entscheidung wurde nie in Ziele übersetzt, an denen sie arbeiten. Es fehlt ein gemeinsamer Rahmen zur Steuerung.' },
      { icon: '💼', title: 'Die Führungskraft hat bereits genug auf dem Tisch.', body: 'Von Marke bis Vertrieb bis Bestandskunden. Eine klare KI-Strategie klingt logisch, fühlt sich aber wie ein weiteres Risiko an. Was fehlt, ist jemand, dem man vertrauen kann, um das geordnet zu halten.' },
    ],

    whyLabel:  'Warum ich',
    whyTitle:  'Zwanzig Jahre an der Schnittstelle von Strategie und Umsetzung. KI ist die neueste Herausforderung. Nicht die erste.',
    whyP1:     'Das gibt eine andere Perspektive als die eines KI-Spezialisten. Ich weiss, wie Entscheidungen ins Stocken geraten. Wo der wirkliche Widerstand sitzt. Warum gute Pläne im Raum zwischen Führung und Umsetzung steckenbleiben.',
    whyP2:     'In dieser Zeit habe ich KI-Lösungen in den Bereichen Gesundheitswesen, Finance, FMCG und Nachhaltigkeit entwickelt und eingeführt. Immer an derselben Stelle: zwischen der Ambition und dem, was tatsächlich daraus wird.',
    whyP3:     'Meine Rolle liegt in dieser Mitte. Zwischen der strategischen Entscheidung an der Spitze und den Teams, die damit arbeiten müssen. Diese Lücke ist grösser, als die meisten Führungsteams vermuten.',

    forLabel:   'Für wen',
    forTitle:   'Das richtet sich an Führungskräfte und Managementteams, die KI ernsthaft angehen wollen — ohne sich im Hype zu verlieren.',
    forItems: [
      { icon: '🧭', text: 'Du weisst, dass KI Auswirkungen auf deine Organisation haben wird, aber die Übersetzung in Richtung und Priorität fehlt noch.' },
      { icon: '❓', text: 'Du möchtest die richtigen Fragen stellen können, ohne selbst Spezialist oder Techniker werden zu müssen.' },
      { icon: '🤝', text: 'Du suchst persönliche Begleitung bei echten Entscheidungen, keine Schulung oder aufwändige Beratungsebene.' },
      { icon: '💬', text: 'Du möchtest glaubwürdig führen: gegenüber deinem Team, dem Vorstand, Kunden und Investoren.' },
      { icon: '📈', text: 'Du möchtest am Ende etwas haben, das funktioniert und intern weiter wachsen kann.' },
    ],

    areasLabel: 'Woran wir arbeiten',
    areasTitle: 'Deine Situation als Ausgangspunkt.',
    areasBody:  'Ich verwende eine klare Denkrichtung, kein Template. Die Themen, die wir angehen, hängen davon ab, was in deiner Situation wirklich eine Rolle spielt.',
    areas: [
      { icon: '🧭', title: 'Richtung und Priorität', body: 'Wo berührt KI dein Geschäftsmodell, deine Leistungen oder deine Arbeitsweise? Was braucht jetzt Aufmerksamkeit, und was noch nicht?' },
      { icon: '👔', title: 'Führung und Entscheidungsfindung', body: 'Welche Rolle musst du als Führungskraft übernehmen? Was kannst du delegieren, und was musst du selbst verantworten? Wie behältst du die Steuerung, ohne alles selbst wissen zu müssen?' },
      { icon: '🛡️', title: 'Risiko, Governance und Verantwortung', body: 'Wie gehst du mit Daten, Reputation, Compliance und internen Leitlinien um, ohne dass Vorsicht alles blockiert?' },
      { icon: '⚡', title: 'Was in deiner Organisation bereits passiert', body: 'Welche KI-Initiativen, Experimente oder informellen Praktiken gibt es bereits? Was funktioniert wirklich, was ist Lärm, und wo steckt Energie, die du nutzen kannst?' },
      { icon: '🧑‍💻', title: 'Menschen, Kultur und Adoption', body: 'Wer führt das intern? Wie nimmst du Menschen mit, ohne zusätzlichen Veränderungsdruck zu erzeugen? Was braucht dein Team, um sicher und praktisch zu lernen?' },
      { icon: '🎯', title: 'Der erste Use Case, der wirklich zählt', body: 'Wir wählen nicht die spektakulärste Anwendung, sondern die, die glaubwürdig, machbar und wertvoll genug ist, um echte Bewegung zu erzeugen.' },
    ],

    programLabel: 'Wie es funktioniert',
    programTitle: 'Drei Schritte. Persönlich und auf etwas ausgerichtet, das wirklich funktioniert.',
    programMonths: [
      { n: '01', title: 'Klarheit über die Situation gewinnen', body: 'Wir bringen deine Situation klar in Sicht. Wo liegt die Ambition? Wo herrscht Unklarheit? Was passiert bereits? Wo müssen Entscheidungen getroffen werden? Du bekommst ein ehrliches Bild und einen klaren Fokus.', tag: 'Schritt 1' },
      { n: '02', title: 'Von Erkenntnis zur Anwendung', body: 'Wir übersetzen diesen Fokus in einen ersten konkreten Schritt. Das kann ein funktionierender Use Case sein, ein Entscheidungsrahmen, ein Führungsansatz oder eine Kombination. In jedem Fall etwas, das über reines Reden hinausgeht.', tag: 'Schritt 2' },
      { n: '03', title: 'Verankern und nach vorne schauen', body: 'Wir sorgen dafür, dass nicht nur etwas gestartet wird, sondern auch etwas bestehen bleibt: in Sprache, Richtung, Verantwortung und Weiterführung. So dass du danach selbstständig weiterbauen kannst.', tag: 'Schritt 3' },
    ],

    proofLabel:  'Erfahrung aus der Praxis',
    proofTitle:  'Ich arbeite an der Grenze zwischen Ambition und Machbarkeit. Dort entsteht der echte Wert.',
    proofBody:   'In Aufträgen und Sektoren mache ich immer dieselbe Übersetzung. Von dem, was eine Organisation will, zum ersten Schritt, den Menschen tatsächlich gehen können.',
    proofItems: [
      { icon: '💜', color: '#6B2D8B', sector: 'Gesundheitswesen', body: 'Von strategischer Ambition rund um Wissensteilung und Best Practice zu einer Anwendung, die Fachleute selbst in ihrer täglichen Arbeit nutzen.' },
      { icon: '♻️', color: '#398684', sector: 'Immobilien & Nachhaltigkeit', body: 'Von externem Druck und CSRD-Verpflichtungen zu einem praktischen Modell, mit dem Führung und operatives Team auf dieselbe Realität blicken.' },
      { icon: '⭐', color: '#1D4ED8', sector: 'Customer Experience', body: 'Von abstrakter Kundenambition zu einem Mess- und Steuerungsmodell, das hilft, Prioritäten zu setzen und intern Rückhalt für die richtigen Entscheidungen aufzubauen.' },
      { icon: '🏦', color: '#374151', sector: 'Finance & reguliertes Umfeld', body: 'Von Vorsicht und Compliance-Bedenken zu einem praktikablen Weg, KI verantwortungsvoll zu erkunden und einzusetzen.' },
    ],

    collabLabel: 'Zusammenarbeit',
    collabTitle: 'Ein Netzwerk von Menschen, denen ich vertraue und die ich kenne.',
    collabBody:  'Ich arbeite aus einem breiten Kreis von Spezialisten heraus. Strategen, Technologen, Trainer und Umsetzer, die ich im richtigen Moment einbringe. Kein festes Team. Aber Menschen, mit denen ich inhaltlich auf einer Linie bin.',
    collabNote:  'Einige Beispiele von Menschen, mit denen ich zusammenarbeite.',
    collabPeople: [
      { initials: 'WB',   name: 'Wouter Blok',     url: 'https://www.linkedin.com/in/wouterblok/', role: 'Marketing und kommerzielles Wachstum',       bio: 'Wouter verbindet Markenstrategie mit kommerzieller Umsetzung. Sein Growth-Flywheel-Ansatz bringt Menschen, Prozesse und Plattformen auf eine Linie, damit Marketingbemühungen tatsächlich durch die Organisation wirken. Breite Erfahrung in FMCG- und Handelsumgebungen.' },
      { initials: 'BvdB', name: 'Ben van der Burg',  url: 'https://www.benvanderburg.nl/', role: 'Technologie und digitale Strategie',    bio: 'Podcast-Host von De Technoloog und BNR Digitaal, Speaker und Tech-Experte. Ben übersetzt technologische Komplexität in klare strategische Erkenntnisse für Führungskräfte, die die richtigen Fragen stellen möchten, ohne Techniker zu werden.' },
      { initials: 'FM',   name: 'Frank Meeuwsen',    url: 'https://frankmeeuwsen.com/', role: 'KI-Trainer und Berater',              bio: '30 Jahre digitale Erfahrung. Frank hilft Fachleuten und Teams, KI praktisch in ihre tägliche Arbeit zu integrieren. Ohne Hype, ohne Jargon. Präzise in der Anwendung, ehrlich darüber, was funktioniert und was nicht.' },
      { initials: 'SH',   name: 'Sandra Hofstede',   role: 'Strategische Führung und Integration', bio: '20 Jahre Erfahrung in Governance, M&A-Integration und Turnaround. Sandra tritt ein, wenn Bewegung nötig ist. Bei Fusionen, Skalierungsfragen oder Organisationen, die feststecken. Sie stellt Eigenverantwortung wieder her und bringt Struktur dort, wo der Druck am höchsten ist.' },
    ],

    aboutLabel: 'Über mich',
    aboutTitle: 'Ich helfe Führungskräften und Managementteams, Orientierung zu geben, wo Strategie konkret werden muss.',
    aboutBody1: 'In meiner Laufbahn habe ich viel an der Schnittstelle von Strategie, Wachstum und Umsetzung gearbeitet. KI ist für mich kein separates Thema obendrauf, sondern die neueste Realität an einer vertrauten Schnittstelle: Wie sorgt man dafür, dass gute Ideen wirklich landen?',
    aboutBody2: 'Was ich mitbringe: praktische Erfahrung mit KI in der Realität und jahrelange Erfahrung mit Organisationen, die sich bewegen müssen, aber immer wieder steckenbleiben. Ich weiss, wann ein Plan tragfähig ist. Und wann er gut klingt, aber nie umgesetzt wird.',
    aboutCredentials: [
      'Partner bei Kirk & Blackbeard',
      'Umfangreiche Erfahrung in Strategie, Wachstum, Customer Experience und Umsetzung',
      'Praktische Entwicklung und Anwendung von KI in mehreren Sektoren',
      'Arbeitet auf Niederländisch und Englisch (internationale Projekte)',
      'Erfahrung in Gesundheitswesen, Finance, FMCG, Nachhaltigkeit, CX und mehr',
    ],

    programCta:  'Trajektoptionen ansehen →',

    spotsLabel:  'Verfügbarkeit',
    spotsTitle:  'Ich arbeite mit einer kleinen Anzahl von Begleitungen gleichzeitig.',
    spotsBody:   'Weil das nur funktioniert, wenn ich wirklich in deiner Situation mitdenken kann. Kein Standardformat. Persönliche Begleitung mit einem konkreten Ergebnis.',
    spotsCta1:   'Erstgespräch vereinbaren →',
    spotsCta2:   'Zuerst den kostenlosen KI-Scan machen',
    spotsTrust:  'Kostenloses Erstgespräch · Keine Verpflichtung · Wir schauen gemeinsam, ob es passt',

    footerCopy:  'Strategischer Mentor für KI & Umsetzung',
    footerSub:   'markdekock.com',
    footerWerk:  'Was ich baue →',
  },
}

function MentorPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const rawLang = searchParams.get('lang') ?? 'nl'
  const lang = (['nl', 'en', 'de'].includes(rawLang) ? rawLang : 'nl') as 'nl' | 'en' | 'de'
  const t = T[lang]

  const switchLang = (l: 'nl' | 'en' | 'de') => router.replace(`/mentor?lang=${l}`)

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
              <p style={{ fontSize: 10, color: WARM, fontWeight: 600, lineHeight: 1.2 }}>{t.navPartner}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Lang toggle */}
            <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 100, padding: 3, gap: 2 }}>
              {(['nl', 'en', 'de'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => switchLang(l)}
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
              href="/werk"
              onClick={() => trackCta('nav_werk', 'nav', 'Projecten')}
              style={{
                fontSize: 13, fontWeight: 600, color: BODY, textDecoration: 'none',
                whiteSpace: 'nowrap',
                borderBottom: '1px solid transparent',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderBottomColor = WARM)}
              onMouseLeave={e => (e.currentTarget.style.borderBottomColor = 'transparent')}
            >
              {lang === 'nl' ? 'Projecten' : lang === 'de' ? 'Projekte' : 'Projects'}
            </a>
            <a
              href={CALENDLY_INTAKE}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta('nav_calendly', 'nav', t.navCta)}
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
      <section style={{ background: INK, paddingTop: 96, paddingBottom: 104, position: 'relative', overflow: 'hidden' }}>

        {/* Bridge sketch — inverted (white lines on dark), screen-blended so the black bg disappears */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/bridge-sketch2.png"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 40%',
            filter: 'contrast(20)',
            mixBlendMode: 'screen',
            opacity: 0.25,
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />

        <div className="max-w-3xl mx-auto px-6 text-center" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div variants={stagger} initial="hidden" animate="show">

            <motion.div variants={fadeUp}>
              <span style={{
                display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: WARM, background: `${WARM}55`,
                padding: '5px 16px', borderRadius: 100, marginBottom: 32,
                border: `1px solid ${WARM}88`,
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
                onClick={() => trackCta('hero_calendly', 'hero', t.heroCta1)}
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
                onClick={() => trackCta('hero_ai_scan', 'hero', t.heroCta2)}
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

            <motion.p variants={fadeUp} style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 20 }}>
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

      {/* ── 6 Areas ── */}
      <section style={{ background: LIGHT, padding: '80px 24px' }}>
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
                      background: isDark ? INK : WHITE,
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
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginTop: 40 }}>
              <a
                href="/mentor/aanpak"
                onClick={() => trackCta('program_aanpak', 'program', t.programCta)}
                style={{
                  display: 'inline-block',
                  fontSize: 14, fontWeight: 700,
                  color: WARM,
                  padding: '10px 28px', borderRadius: 100,
                  border: `1px solid ${WARM}55`,
                  textDecoration: 'none',
                  background: `${WARM}12`,
                }}
              >
                {t.programCta}
              </a>
            </motion.div>
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
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 15, color: BODY, maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.65 }}>
              {t.proofBody}
            </motion.p>
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 44 }}>
              <a href="/werk"
                onClick={() => trackCta('proof_werk', 'proof', 'Bekijk projecten')}
                style={{
                fontSize: 13, fontWeight: 600, color: ACCENT, textDecoration: 'none',
                borderBottom: `1px solid ${ACCENT}`, paddingBottom: 2,
              }}>
                {lang === 'nl' ? 'Bekijk projecten →' : lang === 'de' ? 'Projekte ansehen →' : 'View projects →'}
              </a>
            </motion.div>
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

      {/* ── Collaboration ── */}
      <section style={{ background: INK, padding: '80px 24px' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: WARM, marginBottom: 16 }}>
              {t.collabLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ fontSize: 32, fontWeight: 800, color: WHITE, marginBottom: 16, lineHeight: 1.25, maxWidth: 560 }}>
              {t.collabTitle}
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 16, color: MUTED, maxWidth: 580, lineHeight: 1.7, marginBottom: 8 }}>
              {t.collabBody}
            </motion.p>
            <motion.p variants={fadeUp} style={{ fontSize: 14, color: '#475569', maxWidth: 580, lineHeight: 1.6, marginBottom: 48, fontStyle: 'italic' }}>
              {t.collabNote}
            </motion.p>

            <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
              {t.collabPeople.map((person) => (
                <motion.div
                  key={person.name}
                  variants={fadeUp}
                  style={{
                    background: 'rgba(30,58,95,0.45)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 18,
                    padding: '28px 26px',
                    display: 'flex',
                    gap: 18,
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{
                    width: 50, height: 50, borderRadius: '50%',
                    background: NAVY,
                    border: '2px solid rgba(29,78,216,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: 12, fontWeight: 800, color: WHITE, letterSpacing: '-0.01em',
                  }}>
                    {person.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: WHITE, marginBottom: 3 }}>
                      {person.url ? (
                        <a href={person.url} target="_blank" rel="noopener noreferrer" style={{ color: WHITE, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)' }}
                          onMouseEnter={e => (e.currentTarget.style.borderBottomColor = WARM)}
                          onMouseLeave={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.3)')}
                        >{person.name}</a>
                      ) : person.name}
                    </p>
                    <p style={{ fontSize: 10, fontWeight: 700, color: WARM, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 10 }}>{person.role}</p>
                    <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.65 }}>{person.bio}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
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
                onClick={() => trackCta('spots_calendly', 'spots', t.spotsCta1)}
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
                onClick={() => trackCta('spots_ai_scan', 'spots', t.spotsCta2)}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <a href="/werk" onClick={() => trackCta('footer_werk', 'footer', t.footerWerk)} style={{ fontSize: 12, color: '#64748B', textDecoration: 'none' }}>{t.footerWerk}</a>
            <p style={{ fontSize: 12, color: '#334155', margin: 0 }}>{t.footerSub} · {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default function MentorPage() {
  return (
    <Suspense fallback={<div />}>
      <MentorPageInner />
    </Suspense>
  )
}
