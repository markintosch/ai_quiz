// ── Marketing Organisation Scan — by Wouter Blok ─────────────────────────────
// 8 Performance Pillars × 3 questions = 24 questions. AI woven throughout.

export type PillarId =
  | 'targets'
  | 'audiences'
  | 'investment'
  | 'creative'
  | 'experience'
  | 'data'
  | 'experimentation'
  | 'automation'

export interface Pillar {
  id: PillarId
  name: string
  short: string
  description: string
  icon: string
}

export interface ScanQuestion {
  id: string
  pillarId: PillarId
  text: string
  lowAnchor: string
  highAnchor: string
}

export interface ScanRole {
  id: string
  label: string
  description: string
}

// ── Pillars ───────────────────────────────────────────────────────────────────

const PILLARS_EN: Pillar[] = [
  { id: 'targets',         name: 'Business Targets',   short: 'Targets',        icon: '🎯', description: 'Are your marketing goals clearly tied to business outcomes — and do AI-driven attribution models tell you what\'s actually moving the needle?' },
  { id: 'audiences',       name: 'Audiences',           short: 'Audiences',      icon: '👥', description: 'Do you know exactly who your best customers are — and are AI-powered segmentation and predictive models finding more of them?' },
  { id: 'investment',      name: 'Investment',          short: 'Investment',     icon: '💰', description: 'Is your marketing budget allocated based on real performance data — and are you using AI to optimise spend in real time?' },
  { id: 'creative',        name: 'Creative',            short: 'Creative',       icon: '🎨', description: 'Is your creative strategy informed by data and tested at scale — and are AI tools accelerating production and personalisation?' },
  { id: 'experience',      name: 'Customer Experience', short: 'Experience',     icon: '⭐', description: 'Are you personalising the customer journey at scale — with AI-driven recommendations, dynamic content and predictive triggers?' },
  { id: 'data',            name: 'Data',                short: 'Data',           icon: '📊', description: 'Do you have a solid first-party data foundation — with the infrastructure, governance and AI models to turn it into a real competitive advantage?' },
  { id: 'experimentation', name: 'Experimentation',     short: 'Experiment',     icon: '🧪', description: 'Is testing embedded in your marketing culture — and are AI tools helping you prioritise, run and learn from experiments faster?' },
  { id: 'automation',      name: 'Automation',          short: 'Automation',     icon: '⚡', description: 'Has your team automated the repeatable and delegated it to AI — freeing people to focus on strategy, creativity and judgment?' },
]

const PILLARS_NL: Pillar[] = [
  { id: 'targets',         name: 'Business Targets',    short: 'Targets',        icon: '🎯', description: 'Zijn je marketingdoelen duidelijk gekoppeld aan bedrijfsresultaten — en vertellen AI-gedreven attributiemodellen je wat er echt impact maakt?' },
  { id: 'audiences',       name: 'Doelgroepen',         short: 'Doelgroepen',    icon: '👥', description: 'Weet je precies wie je beste klanten zijn — en vinden AI-modellen voor segmentatie en lookalikes er meer van?' },
  { id: 'investment',      name: 'Investering',         short: 'Investering',    icon: '💰', description: 'Wordt je marketingbudget verdeeld op basis van echte prestatiedata — en gebruik je AI om bestedingen in real time te optimaliseren?' },
  { id: 'creative',        name: 'Creatie',             short: 'Creatie',        icon: '🎨', description: 'Is je creatieve strategie data-gedreven en getest op schaal — en versnellen AI-tools je productie en personalisatie?' },
  { id: 'experience',      name: 'Klantbeleving',       short: 'Beleving',       icon: '⭐', description: 'Personaliseer je de klantreis op schaal — met AI-gedreven aanbevelingen, dynamische content en voorspellende triggers?' },
  { id: 'data',            name: 'Data',                short: 'Data',           icon: '📊', description: 'Heb je een solide first-party data fundament — met de infrastructuur, governance en AI-modellen om data echt competitief in te zetten?' },
  { id: 'experimentation', name: 'Experimenteren',      short: 'Experimenteren', icon: '🧪', description: 'Is testen ingebed in je marketingcultuur — en helpen AI-tools je om experimenten sneller te prioriteren, uit te voeren en te leren?' },
  { id: 'automation',      name: 'Automatisering',      short: 'Automatisering', icon: '⚡', description: 'Heeft je team het herhaalbare geautomatiseerd en aan AI overgelaten — zodat mensen zich kunnen focussen op strategie, creativiteit en oordeel?' },
]

// ── Questions ─────────────────────────────────────────────────────────────────

const QUESTIONS_EN: ScanQuestion[] = [
  // TARGETS
  { id: 't1', pillarId: 'targets',         text: 'Our marketing KPIs are directly connected to business outcomes like revenue, retention and margin — not just reach or traffic.',               lowAnchor: 'We track vanity metrics',          highAnchor: 'KPIs drive business decisions' },
  { id: 't2', pillarId: 'targets',         text: 'We use multi-touch attribution or AI-assisted models to understand which marketing activities genuinely drive results — not last-click.',    lowAnchor: 'Last-click is our default',        highAnchor: 'AI attribution guides budget' },
  { id: 't3', pillarId: 'targets',         text: 'Leadership and the marketing team are fully aligned on targets, definitions and what success looks like — with no conflicting scorecards.', lowAnchor: 'Everyone measures differently',    highAnchor: 'One shared definition of success' },
  // AUDIENCES
  { id: 'a1', pillarId: 'audiences',       text: 'We have a clear picture of our most valuable customer segments — based on behavioural data and lifetime value, not just demographics.',      lowAnchor: 'We target broad demographics',     highAnchor: 'Segments are behavioural & predictive' },
  { id: 'a2', pillarId: 'audiences',       text: 'We actively use first-party data and AI-powered tools to find and engage new audiences that look like our best customers.',                  lowAnchor: 'We rely on channel defaults',      highAnchor: 'AI finds our next best customers' },
  { id: 'a3', pillarId: 'audiences',       text: 'Our audience strategy is connected across channels — the same person gets a coherent, context-aware experience wherever they encounter us.', lowAnchor: 'Audiences are siloed per channel', highAnchor: 'Unified cross-channel audience view' },
  // INVESTMENT
  { id: 'i1', pillarId: 'investment',      text: 'Budget allocation decisions are driven by real performance data and incrementality testing — not by historical patterns or internal politics.', lowAnchor: 'Budget is historically anchored',  highAnchor: 'Data and testing drive allocation' },
  { id: 'i2', pillarId: 'investment',      text: 'We use AI or algorithmic tools to optimise media spend in real time — adjusting bids, channels and audiences based on live performance.',     lowAnchor: 'Manual optimisation only',         highAnchor: 'AI optimises spend continuously' },
  { id: 'i3', pillarId: 'investment',      text: 'We can clearly articulate the return on our marketing investment to the CFO or board — with confident numbers, not just directional trends.', lowAnchor: 'ROI is hard to prove',             highAnchor: 'ROI is measured and defensible' },
  // CREATIVE
  { id: 'c1', pillarId: 'creative',        text: 'Our creative decisions are informed by performance data — we know what formats, messages and visuals drive results in each channel.',         lowAnchor: 'Gut instinct drives creative',     highAnchor: 'Data informs every creative choice' },
  { id: 'c2', pillarId: 'creative',        text: 'We use AI tools to generate, adapt or personalise creative content at scale — without sacrificing brand quality or strategic intent.',       lowAnchor: 'AI is not part of our process',    highAnchor: 'AI accelerates and personalises at scale' },
  { id: 'c3', pillarId: 'creative',        text: 'There is a clear feedback loop between creative performance data and the briefing process — what we learn shapes what we make next.',        lowAnchor: 'Creative and data teams don\'t talk', highAnchor: 'Performance feeds back into every brief' },
  // EXPERIENCE
  { id: 'e1', pillarId: 'experience',      text: 'We personalise the customer journey based on behaviour, context and stage — not just name fields and birthday emails.',                      lowAnchor: 'Personalisation is surface-level', highAnchor: 'Context-aware, behavioural personalisation' },
  { id: 'e2', pillarId: 'experience',      text: 'AI-driven recommendations, dynamic content or predictive triggers are part of how we engage customers across the funnel.',                   lowAnchor: 'Static content for everyone',      highAnchor: 'AI personalises at every touchpoint' },
  { id: 'e3', pillarId: 'experience',      text: 'Brand experience and performance marketing are tightly integrated — we don\'t sacrifice long-term brand equity for short-term conversion.',  lowAnchor: 'Brand and performance are in conflict', highAnchor: 'Brandformance: both work together' },
  // DATA
  { id: 'd1', pillarId: 'data',            text: 'We have a robust first-party data strategy — actively building owned data assets that are not dependent on third-party cookies or platforms.', lowAnchor: 'We rely on third-party data',      highAnchor: 'First-party data is a strategic asset' },
  { id: 'd2', pillarId: 'data',            text: 'Our data infrastructure (CDP, data warehouse, pipelines) gives the marketing team clean, accessible, actionable data in near-real time.',     lowAnchor: 'Data is messy and hard to access', highAnchor: 'Clean data flows to marketing in real time' },
  { id: 'd3', pillarId: 'data',            text: 'We use predictive models or machine learning to anticipate customer behaviour — churn, LTV, next best action — rather than reacting after the fact.', lowAnchor: 'We react to what happened',   highAnchor: 'ML models predict what will happen' },
  // EXPERIMENTATION
  { id: 'x1', pillarId: 'experimentation', text: 'Experimentation is a standard part of how we work — we run structured tests, document learnings and apply them to future decisions.',        lowAnchor: 'Testing is ad hoc and forgotten',  highAnchor: 'Always-on test-and-learn culture' },
  { id: 'x2', pillarId: 'experimentation', text: 'We use AI or statistical tools to prioritise which experiments to run first — focusing effort on tests with the highest expected impact.',   lowAnchor: 'We test whatever feels urgent',    highAnchor: 'AI prioritises the highest-impact tests' },
  { id: 'x3', pillarId: 'experimentation', text: 'Insights from experiments are systematically shared and embedded into the organisation — they change how we brief, build and invest.',       lowAnchor: 'Learnings stay in a slide deck',   highAnchor: 'Insights drive organisational change' },
  // AUTOMATION
  { id: 'u1', pillarId: 'automation',      text: 'Repetitive marketing tasks — reporting, scheduling, bidding, tagging — are automated, freeing the team to focus on strategy and creativity.',  lowAnchor: 'Manual work dominates our week',   highAnchor: 'Repetitive work is fully automated' },
  { id: 'u2', pillarId: 'automation',      text: 'We use AI agents or automated workflows to handle tasks like content adaptation, audience updates, campaign triggers or reporting.',           lowAnchor: 'AI agents are not part of our stack', highAnchor: 'AI agents run routine marketing tasks' },
  { id: 'u3', pillarId: 'automation',      text: 'Our marketing stack is integrated — tools talk to each other, data flows automatically, and we don\'t rely on manual exports and spreadsheets.', lowAnchor: 'Siloed tools, manual handoffs',   highAnchor: 'Fully integrated, automated stack' },
]

const QUESTIONS_NL: ScanQuestion[] = [
  // TARGETS
  { id: 't1', pillarId: 'targets',         text: 'Onze marketing-KPI\'s zijn direct gekoppeld aan bedrijfsresultaten zoals omzet, retentie en marge — niet alleen aan bereik of traffic.',      lowAnchor: 'We meten vanity metrics',          highAnchor: 'KPI\'s sturen zakelijke beslissingen' },
  { id: 't2', pillarId: 'targets',         text: 'We gebruiken multi-touch attributie of AI-modellen om te begrijpen welke marketingactiviteiten echt resultaat opleveren — niet last-click.',  lowAnchor: 'Last-click is onze standaard',     highAnchor: 'AI-attributie stuurt ons budget' },
  { id: 't3', pillarId: 'targets',         text: 'Leiderschap en marketingteam zijn volledig op één lijn over targets en wat succes betekent — geen conflicterende scorecards.',                 lowAnchor: 'Iedereen meet anders',             highAnchor: 'Één gedeelde definitie van succes' },
  // AUDIENCES
  { id: 'a1', pillarId: 'audiences',       text: 'We hebben een helder beeld van onze meest waardevolle klantsegmenten — op basis van gedragsdata en lifetime value, niet alleen demografie.',  lowAnchor: 'We targeten brede demografieën',   highAnchor: 'Segmenten zijn gedragsgebaseerd & voorspellend' },
  { id: 'a2', pillarId: 'audiences',       text: 'We gebruiken first-party data en AI-tools actief om nieuwe doelgroepen te vinden die lijken op onze beste klanten.',                          lowAnchor: 'We vertrouwen op kanaaldefaults',  highAnchor: 'AI vindt onze volgende beste klanten' },
  { id: 'a3', pillarId: 'audiences',       text: 'Onze doelgroepstrategie is kanaaloverstijgend — dezelfde persoon krijgt een coherente, contextbewuste beleving waar we ook verschijnen.',      lowAnchor: 'Doelgroepen zijn gesiloëerd per kanaal', highAnchor: 'Unified kanaaloverstijgend doelgroepbeeld' },
  // INVESTMENT
  { id: 'i1', pillarId: 'investment',      text: 'Budgetallocatie wordt gestuurd door prestatiedata en incrementaliteitstest — niet door historische patronen of interne politiek.',             lowAnchor: 'Budget is historisch verankerd',   highAnchor: 'Data en tests sturen allocatie' },
  { id: 'i2', pillarId: 'investment',      text: 'We gebruiken AI of algoritmische tools om mediaspending in real time te optimaliseren — op basis van live prestaties.',                        lowAnchor: 'Alleen handmatige optimalisatie',  highAnchor: 'AI optimaliseert spending continu' },
  { id: 'i3', pillarId: 'investment',      text: 'We kunnen het rendement op onze marketinginvestering helder aantonen aan de CFO of raad — met solide cijfers, niet slechts richtingen.',      lowAnchor: 'ROI is moeilijk te bewijzen',       highAnchor: 'ROI is gemeten en verdedigbaar' },
  // CREATIVE
  { id: 'c1', pillarId: 'creative',        text: 'Onze creatieve beslissingen worden gestuurd door prestatiedata — we weten welke formats, boodschappen en visuals werken per kanaal.',         lowAnchor: 'Onderbuikgevoel bepaalt creatie',  highAnchor: 'Data informeert elke creatieve keuze' },
  { id: 'c2', pillarId: 'creative',        text: 'We gebruiken AI-tools om creatieve content op schaal te genereren, aan te passen of te personaliseren — zonder merkkwaliteit te verliezen.',  lowAnchor: 'AI maakt geen deel uit van ons proces', highAnchor: 'AI versnelt en personaliseert op schaal' },
  { id: 'c3', pillarId: 'creative',        text: 'Er is een duidelijke feedbackloop tussen creatieve prestatiedata en het briefingproces — wat we leren bepaalt wat we daarna maken.',           lowAnchor: 'Creatief en data spreken niet met elkaar', highAnchor: 'Prestaties voeden elke volgende brief' },
  // EXPERIENCE
  { id: 'e1', pillarId: 'experience',      text: 'We personaliseren de klantreis op basis van gedrag, context en fase — niet alleen naamvelden en verjaardagsemails.',                          lowAnchor: 'Personalisatie is oppervlakkig',   highAnchor: 'Contextbewuste, gedragsgebaseerde personalisatie' },
  { id: 'e2', pillarId: 'experience',      text: 'AI-gedreven aanbevelingen, dynamische content of voorspellende triggers zijn onderdeel van hoe we klanten door de funnel begeleiden.',        lowAnchor: 'Statische content voor iedereen', highAnchor: 'AI personaliseert op elk contactmoment' },
  { id: 'e3', pillarId: 'experience',      text: 'Merkbeleving en performance marketing zijn strak geïntegreerd — we offeren langetermijn merkwaarde niet op voor korte conversiewinst.',        lowAnchor: 'Merk en performance botsen',       highAnchor: 'Brandformance: beide werken samen' },
  // DATA
  { id: 'd1', pillarId: 'data',            text: 'We hebben een robuuste first-party datastrategie — we bouwen actief aan eigen dataassets die niet afhankelijk zijn van third-party cookies.',  lowAnchor: 'We vertrouwen op third-party data', highAnchor: 'First-party data is een strategisch asset' },
  { id: 'd2', pillarId: 'data',            text: 'Onze data-infrastructuur geeft het marketingteam schone, toegankelijke en actionable data in near-real time.',                                lowAnchor: 'Data is rommelig en moeilijk toegankelijk', highAnchor: 'Schone data stroomt in real time naar marketing' },
  { id: 'd3', pillarId: 'data',            text: 'We gebruiken voorspellende modellen of machine learning om klantgedrag te anticiperen — churn, LTV, next best action — in plaats van achteraf te reageren.', lowAnchor: 'We reageren op wat al is gebeurd', highAnchor: 'ML-modellen voorspellen wat gaat gebeuren' },
  // EXPERIMENTATION
  { id: 'x1', pillarId: 'experimentation', text: 'Experimenteren is een standaard onderdeel van hoe we werken — we draaien gestructureerde tests, documenteren learnings en passen ze toe.',   lowAnchor: 'Testen is ad hoc en wordt vergeten', highAnchor: 'Always-on test-and-learn cultuur' },
  { id: 'x2', pillarId: 'experimentation', text: 'We gebruiken AI of statistische tools om te prioriteren welke experimenten we eerst draaien — gericht op de hoogste verwachte impact.',       lowAnchor: 'We testen wat urgent voelt',       highAnchor: 'AI prioriteert de impactvolste tests' },
  { id: 'x3', pillarId: 'experimentation', text: 'Inzichten uit experimenten worden systematisch gedeeld en ingebed in de organisatie — ze veranderen hoe we briefen, bouwen en investeren.',   lowAnchor: 'Learnings blijven in een slidedeck', highAnchor: 'Inzichten leiden tot organisatieverandering' },
  // AUTOMATION
  { id: 'u1', pillarId: 'automation',      text: 'Repetitieve marketingtaken — rapportage, planning, bieden, tagging — zijn geautomatiseerd, zodat het team zich richt op strategie en creatie.', lowAnchor: 'Handmatig werk domineert onze week', highAnchor: 'Repetitief werk is volledig geautomatiseerd' },
  { id: 'u2', pillarId: 'automation',      text: 'We gebruiken AI-agents of geautomatiseerde workflows voor taken als contentadaptatie, doelgroepupdates, campagnetriggers of rapportage.',     lowAnchor: 'AI-agents zijn geen deel van onze stack', highAnchor: 'AI-agents voeren routinematige taken uit' },
  { id: 'u3', pillarId: 'automation',      text: 'Onze marketingstack is geïntegreerd — tools communiceren, data stroomt automatisch en we vertrouwen niet op handmatige exports en spreadsheets.', lowAnchor: 'Gesilode tools, handmatige overdrachten', highAnchor: 'Volledig geïntegreerde, geautomatiseerde stack' },
]

const PILLARS_DE: Pillar[] = [
  { id: 'targets',         name: 'Business Targets',      short: 'Targets',          icon: '🎯', description: 'Sind deine Marketingziele klar mit Geschäftsergebnissen verknüpft — und verraten dir KI-gestützte Attributionsmodelle, was wirklich den Unterschied macht?' },
  { id: 'audiences',       name: 'Zielgruppen',           short: 'Zielgruppen',      icon: '👥', description: 'Weißt du genau, wer deine wertvollsten Kunden sind — und finden KI-gestützte Segmentierungs- und Lookalike-Modelle mehr davon?' },
  { id: 'investment',      name: 'Investition',           short: 'Investition',      icon: '💰', description: 'Wird dein Marketingbudget auf Basis echter Performance-Daten verteilt — und nutzt du KI, um Ausgaben in Echtzeit zu optimieren?' },
  { id: 'creative',        name: 'Kreation',              short: 'Kreation',         icon: '🎨', description: 'Ist deine Kreativstrategie datengetrieben und skaliert getestet — und beschleunigen KI-Tools deine Produktion und Personalisierung?' },
  { id: 'experience',      name: 'Kundenerlebnis',        short: 'Erlebnis',         icon: '⭐', description: 'Personalisierst du die Customer Journey im großen Maßstab — mit KI-gestützten Empfehlungen, dynamischen Inhalten und prädiktiven Auslösern?' },
  { id: 'data',            name: 'Daten',                 short: 'Daten',            icon: '📊', description: 'Verfügst du über ein solides First-Party-Datenfundament — mit der Infrastruktur, Governance und KI-Modellen, um daraus einen echten Wettbewerbsvorteil zu machen?' },
  { id: 'experimentation', name: 'Experimentieren',       short: 'Experim.',         icon: '🧪', description: 'Ist Testen fest in deiner Marketingkultur verankert — und helfen KI-Tools dabei, Experimente schneller zu priorisieren, durchzuführen und auszuwerten?' },
  { id: 'automation',      name: 'Automatisierung',       short: 'Automatisier.',    icon: '⚡', description: 'Hat dein Team das Wiederholbare automatisiert und an KI delegiert — damit sich Menschen auf Strategie, Kreativität und Urteilsvermögen konzentrieren können?' },
]

const PILLARS_DE_CH: Pillar[] = [
  { id: 'targets',         name: 'Business Targets',      short: 'Targets',          icon: '🎯', description: 'Sind deine Marketingziele klar mit Geschäftsergebnissen verknüpft — und verraten dir KI-gestützte Attributionsmodelle, was wirklich den Unterschied macht?' },
  { id: 'audiences',       name: 'Zielgruppen',           short: 'Zielgruppen',      icon: '👥', description: 'Weisst du genau, wer deine wertvollsten Kunden sind — und finden KI-gestützte Segmentierungs- und Lookalike-Modelle mehr davon?' },
  { id: 'investment',      name: 'Investition',           short: 'Investition',      icon: '💰', description: 'Wird dein Marketingbudget auf Basis echter Performance-Daten verteilt — und nutzt du KI, um Ausgaben in Echtzeit zu optimieren?' },
  { id: 'creative',        name: 'Kreation',              short: 'Kreation',         icon: '🎨', description: 'Ist deine Kreativstrategie datengetrieben und skaliert getestet — und beschleunigen KI-Tools deine Produktion und Personalisierung?' },
  { id: 'experience',      name: 'Kundenerlebnis',        short: 'Erlebnis',         icon: '⭐', description: 'Personalisierst du die Customer Journey in grossem Massstab — mit KI-gestützten Empfehlungen, dynamischen Inhalten und prädiktiven Auslösern?' },
  { id: 'data',            name: 'Daten',                 short: 'Daten',            icon: '📊', description: 'Verfügst du über ein solides First-Party-Datenfundament — mit der Infrastruktur, Governance und KI-Modellen, um daraus einen echten Wettbewerbsvorteil zu machen?' },
  { id: 'experimentation', name: 'Experimentieren',       short: 'Experim.',         icon: '🧪', description: 'Ist Testen fest in deiner Marketingkultur verankert — und helfen KI-Tools dabei, Experimente schneller zu priorisieren, durchzuführen und auszuwerten?' },
  { id: 'automation',      name: 'Automatisierung',       short: 'Automatisier.',    icon: '⚡', description: 'Hat dein Team das Wiederholbare automatisiert und an KI delegiert — damit sich Menschen auf Strategie, Kreativität und Urteilsvermögen konzentrieren können?' },
]

// ── Questions DE / DE-CH ──────────────────────────────────────────────────────

const QUESTIONS_DE: ScanQuestion[] = [
  // TARGETS
  { id: 't1', pillarId: 'targets',         text: 'Unsere Marketing-KPIs sind direkt mit Geschäftsergebnissen wie Umsatz, Kundenbindung und Marge verknüpft — nicht nur mit Reichweite oder Traffic.',        lowAnchor: 'Wir messen Vanity-Metriken',         highAnchor: 'KPIs steuern Geschäftsentscheidungen' },
  { id: 't2', pillarId: 'targets',         text: 'Wir nutzen Multi-Touch-Attribution oder KI-gestützte Modelle, um zu verstehen, welche Marketingaktivitäten wirklich Ergebnisse liefern — kein Last-Click.', lowAnchor: 'Last-Click ist unser Standard',      highAnchor: 'KI-Attribution steuert das Budget' },
  { id: 't3', pillarId: 'targets',         text: 'Führung und Marketingteam sind vollständig auf Ziele und Erfolgsdefinitionen ausgerichtet — keine widersprüchlichen Scorecards.',                           lowAnchor: 'Jeder misst anders',                 highAnchor: 'Eine gemeinsame Definition von Erfolg' },
  // AUDIENCES
  { id: 'a1', pillarId: 'audiences',       text: 'Wir haben ein klares Bild unserer wertvollsten Kundensegmente — auf Basis von Verhaltensdaten und Lifetime Value, nicht nur Demografie.',                   lowAnchor: 'Wir targetieren breite Demografien', highAnchor: 'Segmente sind verhaltensbasiert & prädiktiv' },
  { id: 'a2', pillarId: 'audiences',       text: 'Wir nutzen First-Party-Daten und KI-Tools aktiv, um neue Zielgruppen zu finden, die unseren besten Kunden ähneln.',                                         lowAnchor: 'Wir verlassen uns auf Kanal-Defaults', highAnchor: 'KI findet unsere nächsten Wunschkunden' },
  { id: 'a3', pillarId: 'audiences',       text: 'Unsere Zielgruppenstrategie ist kanalübergreifend — dieselbe Person bekommt ein kohärentes, kontextbewusstes Erlebnis, wo auch immer sie uns begegnet.',    lowAnchor: 'Zielgruppen sind pro Kanal isoliert', highAnchor: 'Einheitliche kanalübergreifende Zielgruppenansicht' },
  // INVESTMENT
  { id: 'i1', pillarId: 'investment',      text: 'Budgetentscheidungen werden durch echte Performance-Daten und Inkrementalitätstests gesteuert — nicht durch historische Muster oder interne Politik.',        lowAnchor: 'Budget ist historisch verankert',    highAnchor: 'Daten und Tests steuern die Allokation' },
  { id: 'i2', pillarId: 'investment',      text: 'Wir nutzen KI oder algorithmische Tools, um Media-Ausgaben in Echtzeit zu optimieren — auf Basis von Live-Performance-Daten.',                              lowAnchor: 'Nur manuelle Optimierung',           highAnchor: 'KI optimiert Ausgaben kontinuierlich' },
  { id: 'i3', pillarId: 'investment',      text: 'Wir können den ROI unserer Marketinginvestitionen dem CFO oder Vorstand klar belegen — mit soliden Zahlen, nicht nur Richtungstendenzen.',                   lowAnchor: 'ROI ist schwer nachweisbar',         highAnchor: 'ROI ist messbar und verteidigbar' },
  // CREATIVE
  { id: 'c1', pillarId: 'creative',        text: 'Unsere kreativen Entscheidungen werden durch Performance-Daten informiert — wir wissen, welche Formate, Botschaften und Visuals in jedem Kanal wirken.',     lowAnchor: 'Bauchgefühl bestimmt die Kreation',  highAnchor: 'Daten informieren jede kreative Entscheidung' },
  { id: 'c2', pillarId: 'creative',        text: 'Wir nutzen KI-Tools, um kreative Inhalte in großem Maßstab zu generieren, anzupassen oder zu personalisieren — ohne Markenqualität zu opfern.',              lowAnchor: 'KI ist kein Teil unseres Prozesses', highAnchor: 'KI beschleunigt und personalisiert in großem Maßstab' },
  { id: 'c3', pillarId: 'creative',        text: 'Es gibt eine klare Feedbackschleife zwischen kreativen Performance-Daten und dem Briefing-Prozess — was wir lernen, prägt was wir als Nächstes machen.',      lowAnchor: 'Kreativ- und Daten-Teams sprechen nicht miteinander', highAnchor: 'Performance fließt in jedes Briefing ein' },
  // EXPERIENCE
  { id: 'e1', pillarId: 'experience',      text: 'Wir personalisieren die Customer Journey auf Basis von Verhalten, Kontext und Phase — nicht nur Namensfeldern und Geburtstags-E-Mails.',                     lowAnchor: 'Personalisierung ist oberflächlich', highAnchor: 'Kontextbewusste, verhaltensbasierte Personalisierung' },
  { id: 'e2', pillarId: 'experience',      text: 'KI-gestützte Empfehlungen, dynamische Inhalte oder prädiktive Trigger sind Teil unserer Kundenkommunikation entlang des gesamten Funnels.',                  lowAnchor: 'Statische Inhalte für alle',         highAnchor: 'KI personalisiert an jedem Touchpoint' },
  { id: 'e3', pillarId: 'experience',      text: 'Markenerlebnis und Performance Marketing sind eng integriert — wir opfern langfristiges Markenkapital nicht für kurzfristige Conversion.',                    lowAnchor: 'Marke und Performance sind im Konflikt', highAnchor: 'Brandformance: beides arbeitet zusammen' },
  // DATA
  { id: 'd1', pillarId: 'data',            text: 'Wir haben eine robuste First-Party-Datenstrategie — wir bauen aktiv eigene Daten-Assets auf, die nicht von Third-Party-Cookies oder Plattformen abhängen.',  lowAnchor: 'Wir vertrauen auf Drittanbieter-Daten', highAnchor: 'First-Party-Daten sind ein strategisches Asset' },
  { id: 'd2', pillarId: 'data',            text: 'Unsere Dateninfrastruktur (CDP, Data Warehouse, Pipelines) liefert dem Marketingteam saubere, zugängliche und handlungsrelevante Daten nahezu in Echtzeit.',  lowAnchor: 'Daten sind unordentlich und schwer zugänglich', highAnchor: 'Saubere Daten fließen in Echtzeit ins Marketing' },
  { id: 'd3', pillarId: 'data',            text: 'Wir nutzen prädiktive Modelle oder Machine Learning, um Kundenverhalten vorherzusagen — Churn, LTV, Next Best Action — statt nachträglich zu reagieren.',     lowAnchor: 'Wir reagieren auf Vergangenes',       highAnchor: 'ML-Modelle sagen voraus, was passiert' },
  // EXPERIMENTATION
  { id: 'x1', pillarId: 'experimentation', text: 'Experimentieren ist ein fester Bestandteil unserer Arbeitsweise — wir führen strukturierte Tests durch, dokumentieren Erkenntnisse und wenden sie an.',      lowAnchor: 'Testen ist ad hoc und wird vergessen', highAnchor: 'Always-on Test-and-Learn-Kultur' },
  { id: 'x2', pillarId: 'experimentation', text: 'Wir nutzen KI oder statistische Tools, um zu priorisieren, welche Experimente wir zuerst durchführen — fokussiert auf den höchsten erwarteten Wirkung.',     lowAnchor: 'Wir testen was dringend erscheint',  highAnchor: 'KI priorisiert die wirkungsvollsten Tests' },
  { id: 'x3', pillarId: 'experimentation', text: 'Erkenntnisse aus Experimenten werden systematisch geteilt und in die Organisation eingebettet — sie verändern wie wir briefen, bauen und investieren.',       lowAnchor: 'Erkenntnisse bleiben in Präsentationen', highAnchor: 'Insights treiben organisatorischen Wandel' },
  // AUTOMATION
  { id: 'u1', pillarId: 'automation',      text: 'Wiederkehrende Marketingaufgaben — Reporting, Planung, Gebotsabgabe, Tagging — sind automatisiert, damit sich das Team auf Strategie und Kreativität konzentriert.', lowAnchor: 'Manuelle Arbeit dominiert unsere Woche', highAnchor: 'Wiederkehrende Arbeit ist vollständig automatisiert' },
  { id: 'u2', pillarId: 'automation',      text: 'Wir nutzen KI-Agenten oder automatisierte Workflows für Aufgaben wie Inhaltsadaption, Zielgruppen-Updates, Kampagnen-Trigger oder Reporting.',                lowAnchor: 'KI-Agenten sind nicht Teil unseres Stacks', highAnchor: 'KI-Agenten übernehmen Routineaufgaben' },
  { id: 'u3', pillarId: 'automation',      text: 'Unser Marketing-Stack ist integriert — Tools kommunizieren miteinander, Daten fließen automatisch und wir verlassen uns nicht auf manuelle Exporte.',           lowAnchor: 'Isolierte Tools, manuelle Übergaben',  highAnchor: 'Vollständig integrierter, automatisierter Stack' },
]

// Swiss German: identical to QUESTIONS_DE but ß → ss, and "großem" → "grossem" etc.
const QUESTIONS_DE_CH: ScanQuestion[] = QUESTIONS_DE.map(q => ({
  ...q,
  text:       q.text.replace(/ß/g, 'ss').replace(/großem/g, 'grossem').replace(/großen/g, 'grossen').replace(/großer/g, 'grosser').replace(/groß/g, 'gross').replace(/Maßstab/g, 'Massstab').replace(/Maßnahmen/g, 'Massnahmen').replace(/Straße/g, 'Strasse'),
  lowAnchor:  q.lowAnchor.replace(/ß/g, 'ss'),
  highAnchor: q.highAnchor.replace(/ß/g, 'ss'),
}))

// ── Roles ─────────────────────────────────────────────────────────────────────

const ROLES_EN: ScanRole[] = [
  { id: 'ceo',       label: 'CEO / Founder',         description: 'Responsible for overall business growth and strategy' },
  { id: 'cmo',       label: 'CMO / Marketing Director', description: 'Leads the marketing organisation and strategy' },
  { id: 'vp',        label: 'VP / Head of Marketing',description: 'Owns a major marketing function or team' },
  { id: 'growth',    label: 'Growth / Performance',  description: 'Acquisition, conversion and growth marketing' },
  { id: 'brand',     label: 'Brand / Content',       description: 'Brand strategy, content and creative direction' },
  { id: 'data',      label: 'Data / Analytics',      description: 'Marketing data, measurement and analytics' },
  { id: 'digital',   label: 'Digital / Product',     description: 'Digital channels, product marketing or UX' },
]

const ROLES_NL: ScanRole[] = [
  { id: 'ceo',       label: 'CEO / Oprichter',        description: 'Verantwoordelijk voor bedrijfsgroei en strategie' },
  { id: 'cmo',       label: 'CMO / Marketing Director', description: 'Leidt de marketingorganisatie en strategie' },
  { id: 'vp',        label: 'VP / Head of Marketing', description: 'Eigenaar van een grote marketingfunctie of team' },
  { id: 'growth',    label: 'Growth / Performance',   description: 'Acquisitie, conversie en growth marketing' },
  { id: 'brand',     label: 'Merk / Content',         description: 'Merkstrategie, content en creatieve richting' },
  { id: 'data',      label: 'Data / Analytics',       description: 'Marketing data, meting en analyse' },
  { id: 'digital',   label: 'Digitaal / Product',     description: 'Digitale kanalen, productmarketing of UX' },
]

const ROLES_DE: ScanRole[] = [
  { id: 'ceo',       label: 'CEO / Gründer',             description: 'Verantwortlich für Unternehmenswachstum und Strategie' },
  { id: 'cmo',       label: 'CMO / Marketing-Direktor',  description: 'Leitet die Marketingorganisation und -strategie' },
  { id: 'vp',        label: 'VP / Head of Marketing',    description: 'Verantwortet eine wesentliche Marketingfunktion oder ein Team' },
  { id: 'growth',    label: 'Growth / Performance',      description: 'Akquisition, Conversion und Wachstumsmarketing' },
  { id: 'brand',     label: 'Marke / Content',           description: 'Markenstrategie, Content und kreative Ausrichtung' },
  { id: 'data',      label: 'Daten / Analytics',         description: 'Marketing-Daten, Messung und Analyse' },
  { id: 'digital',   label: 'Digital / Produkt',         description: 'Digitale Kanäle, Produktmarketing oder UX' },
]

const ROLES_DE_CH: ScanRole[] = [
  { id: 'ceo',       label: 'CEO / Gründer',             description: 'Verantwortlich für Unternehmenswachstum und Strategie' },
  { id: 'cmo',       label: 'CMO / Marketing-Direktor',  description: 'Leitet die Marketingorganisation und -strategie' },
  { id: 'vp',        label: 'VP / Head of Marketing',    description: 'Verantwortet eine wesentliche Marketingfunktion oder ein Team' },
  { id: 'growth',    label: 'Growth / Performance',      description: 'Akquisition, Conversion und Wachstumsmarketing' },
  { id: 'brand',     label: 'Marke / Content',           description: 'Markenstrategie, Content und kreative Ausrichtung' },
  { id: 'data',      label: 'Daten / Analytics',         description: 'Marketing-Daten, Messung und Analyse' },
  { id: 'digital',   label: 'Digital / Produkt',         description: 'Digitale Kanäle, Produktmarketing oder UX' },
]

// ── Locale accessor ───────────────────────────────────────────────────────────

export function getScanContent(locale: string) {
  if (locale === 'nl')    return { PILLARS: PILLARS_NL,    QUESTIONS: QUESTIONS_NL,    ROLES: ROLES_NL    }
  if (locale === 'de')    return { PILLARS: PILLARS_DE,    QUESTIONS: QUESTIONS_DE,    ROLES: ROLES_DE    }
  if (locale === 'de-ch') return { PILLARS: PILLARS_DE_CH, QUESTIONS: QUESTIONS_DE_CH, ROLES: ROLES_DE_CH }
  return { PILLARS: PILLARS_EN, QUESTIONS: QUESTIONS_EN, ROLES: ROLES_EN }
}

export const PILLARS   = PILLARS_EN
export const QUESTIONS = QUESTIONS_EN
export const ROLES     = ROLES_EN

// ── Scoring ───────────────────────────────────────────────────────────────────

export interface ScoreColour {
  bg: string
  text: string
  label: string
  labelNl: string
  labelDe: string
  pastelBg: string
  description: string
  descriptionNl: string
  descriptionDe: string
}

export function scoreColour(score: number): ScoreColour {
  if (score >= 3.5) return {
    bg: '#EA580C', text: '#fff', label: 'AI-Native',    labelNl: 'AI-gedreven',    labelDe: 'KI-getrieben',
    pastelBg: '#FFF7ED',
    description:   'Marketing is fully data-driven and AI-augmented across all pillars. You\'re building a compounding advantage.',
    descriptionNl: 'Marketing is volledig data-gedreven en AI-versterkt op alle pillars. Je bouwt een zichzelf versterkend voordeel.',
    descriptionDe: 'Marketing ist vollständig datengetrieben und KI-gestützt über alle Pillars hinweg. Du baust einen sich selbst verstärkenden Wettbewerbsvorteil auf.',
  }
  if (score >= 2.5) return {
    bg: '#F97316', text: '#fff', label: 'Data-Driven',  labelNl: 'Data-gedreven',  labelDe: 'Datengetrieben',
    pastelBg: '#FFF7ED',
    description:   'Strong foundations with selective AI use. The infrastructure is there — now scale the intelligence.',
    descriptionNl: 'Sterke fundamenten met selectief AI-gebruik. De infrastructuur is er — nu de intelligentie opschalen.',
    descriptionDe: 'Starke Grundlagen mit selektivem KI-Einsatz. Die Infrastruktur ist vorhanden — jetzt gilt es, die Intelligenz zu skalieren.',
  }
  if (score >= 1.5) return {
    bg: '#FBBF24', text: '#fff', label: 'Developing',   labelNl: 'In Ontwikkeling', labelDe: 'Im Aufbau',
    pastelBg: '#FFFBEB',
    description:   'Good instincts, but running on manual processes and fragmented data. Ready to make the leap.',
    descriptionNl: 'Goede instincten, maar draait op handmatige processen en gefragmenteerde data. Klaar voor de volgende stap.',
    descriptionDe: 'Gute Instinkte, aber noch abhängig von manuellen Prozessen und fragmentierten Daten. Bereit für den nächsten Schritt.',
  }
  return {
    bg: '#94A3B8', text: '#fff', label: 'Ad Hoc',       labelNl: 'Ad Hoc',          labelDe: 'Ad hoc',
    pastelBg: '#F8FAFC',
    description:   'Marketing is operational but reactive. Significant opportunity — the gap between where you are and where AI-native competitors are is closing fast.',
    descriptionNl: 'Marketing is operationeel maar reactief. Grote kans — de kloof tussen jou en AI-native concurrenten sluit snel.',
    descriptionDe: 'Marketing ist operativ, aber reaktiv. Grosse Chance — der Abstand zu KI-nativen Mitbewerbern schliesst sich schnell.',
  }
}

export function overallScore(pillarScores: Record<string, number>): number {
  const vals = Object.values(pillarScores).filter(v => v > 0)
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export type PillarScores = Record<PillarId, number>
