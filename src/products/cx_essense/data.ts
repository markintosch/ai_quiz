// ── CX Maturity Assessment — by Essense ──────────────────────────────────────
// Product data: dimensions, questions, roles, scoring helpers

export type CxDimensionId =
  | 'insight'
  | 'journey'
  | 'alignment'
  | 'measurement'
  | 'prioritisation'
  | 'culture'

export interface CxDimension {
  id: CxDimensionId
  name: string
  short: string
  description: string
  icon: string
}

export interface CxQuestion {
  id: string
  dimensionId: CxDimensionId
  text: string
  lowAnchor: string
  highAnchor: string
}

export interface CxRole {
  id: string
  label: string
  description: string
}

// ── Dimensions ───────────────────────────────────────────────────────────────

const DIMENSIONS_EN: CxDimension[] = [
  { id: 'insight',         name: 'Voice-of-Customer & Research',    short: 'Insight',     icon: '🔍', description: 'Do you have continuous, evidence-based insight into customer needs, emotions and behaviour — or do you rely on assumptions and one-off research?' },
  { id: 'journey',         name: 'Journey Management & Governance', short: 'Journey',     icon: '🗺️', description: 'Are your customer journeys actively managed, governed and improved over time — or designed once and left to drift?' },
  { id: 'alignment',       name: 'Brand Promise & Alignment',       short: 'Alignment',   icon: '🤝', description: 'Does your organisation consistently deliver on its brand promise across all channels and departments — or does the experience depend on which team the customer reaches?' },
  { id: 'measurement',     name: 'Data-Driven CX',                  short: 'Measurement', icon: '📊', description: 'Are you using customer data and insights to actively steer decisions — or do metrics sit in dashboards that nobody acts on?' },
  { id: 'prioritisation',  name: 'CX Strategy & Ambition',          short: 'Strategy',    icon: '🎯', description: 'Is your CX ambition clearly defined and embedded in your business strategy — or managed as a separate workstream without real teeth?' },
  { id: 'culture',         name: 'Operational Excellence & EX',     short: 'Culture',     icon: '💛', description: 'Is customer-centricity operationalised in your daily way-of-working and embedded across the organisation — or still aspirational?' },
]

const DIMENSIONS_NL: CxDimension[] = [
  { id: 'insight',         name: 'Klantonderzoek & Voice-of-Customer', short: 'Inzicht',    icon: '🔍', description: 'Heb je continu, op bewijs gebaseerd inzicht in klantbehoeften, emoties en gedrag — of vertrouw je op aannames en eenmalig onderzoek?' },
  { id: 'journey',         name: 'Journey Management & Governance',    short: 'Journey',    icon: '🗺️', description: 'Worden je customer journeys actief beheerd, gestuurd en verbeterd — of zijn ze eenmalig ontworpen en sindsdien aan zichzelf overgelaten?' },
  { id: 'alignment',       name: 'Merkbelofte & Afstemming',           short: 'Afstemming', icon: '🤝', description: 'Levert je organisatie consistent haar merkbelofte in alle kanalen en afdelingen — of hangt de ervaring af van welk team de klant bereikt?' },
  { id: 'measurement',     name: 'Data-gedreven CX',                   short: 'Meting',     icon: '📊', description: 'Gebruik je klantdata en inzichten om actief beslissingen te sturen — of staan metrics in dashboards die niemand gebruikt?' },
  { id: 'prioritisation',  name: 'CX-strategie & Ambitie',             short: 'Strategie',  icon: '🎯', description: 'Is je CX-ambitie helder gedefinieerd en verankerd in je bedrijfsstrategie — of wordt het beheerd als aparte workstream zonder echte slagkracht?' },
  { id: 'culture',         name: 'Operationele Excellentie & EX',      short: 'Cultuur',    icon: '💛', description: 'Is klantgerichtheid geoperationaliseerd in de dagelijkse manier van werken en ingebed in de organisatie — of blijft het bij intenties?' },
]

// ── Questions ────────────────────────────────────────────────────────────────

const QUESTIONS_EN: CxQuestion[] = [
  // INSIGHT
  { id: 'i1', dimensionId: 'insight',        text: 'We conduct continuous voice-of-customer research to understand what customers genuinely need — not just what they tell us they want.',       lowAnchor: 'We assume we know',                       highAnchor: 'We have ongoing evidence' },
  { id: 'i2', dimensionId: 'insight',        text: 'We have a clear picture of the emotional journey customers go through — including the moments of truth that make or break the experience.',  lowAnchor: 'We focus on process steps',               highAnchor: 'We map moments of truth' },
  { id: 'i3', dimensionId: 'insight',        text: 'Customer insights actively shape product, service and process decisions — they are embedded in how we work, not stored in reports.',         lowAnchor: 'Insights sit in reports',                 highAnchor: 'Insights drive decisions' },
  { id: 'i4', dimensionId: 'insight',        text: 'We can distinguish between what customers say they want and what they actually do — and we use behavioural data to improve our services without assumptions.', lowAnchor: 'We take feedback at face value', highAnchor: 'We look at behaviour' },
  // JOURNEY
  { id: 'j1', dimensionId: 'journey',        text: 'Our customer journeys are actively governed — with clear ownership, targets, and a structured way-of-working to monitor and improve them.',  lowAnchor: 'Journeys are not actively managed',       highAnchor: 'Governance is in place' },
  { id: 'j2', dimensionId: 'journey',        text: 'We regularly test and optimise our services with real customers — from activation to loyalty, not just at the point of complaint.',          lowAnchor: 'We test when something breaks',            highAnchor: 'Optimisation is continuous' },
  { id: 'j3', dimensionId: 'journey',        text: 'When a process is complex internally, we make sure the customer does not absorb that complexity — we shield the experience from our silos.', lowAnchor: 'Our complexity leaks out',                highAnchor: 'We shield the customer' },
  { id: 'j4', dimensionId: 'journey',        text: 'Our channels feel seamless and connected from the customer\'s perspective — with a clear role and focus for each channel.',                  lowAnchor: 'Siloed channel experiences',              highAnchor: 'One coherent omni-channel journey' },
  // ALIGNMENT
  { id: 'a1', dimensionId: 'alignment',      text: 'Leadership actively champions CX — with visible time, budget and accountability, not just words.',                                           lowAnchor: 'It\'s delegated downward',                highAnchor: 'Leadership leads by example' },
  { id: 'a2', dimensionId: 'alignment',      text: 'Our brand promise is reflected in every customer touchpoint — we don\'t just communicate it, we deliver it consistently.',                   lowAnchor: 'Promise and reality don\'t match',        highAnchor: 'We deliver on our promise' },
  { id: 'a3', dimensionId: 'alignment',      text: 'Customer feedback reaches the people who can act on it — quickly and directly, without getting stuck or filtered.',                          lowAnchor: 'Gets stuck or filtered',                  highAnchor: 'Flows to those who own it' },
  { id: 'a4', dimensionId: 'alignment',      text: 'Siloed departments are actively aligned around the customer journey — we work cross-functionally to resolve issues at the root.',            lowAnchor: 'Silos are a constant obstacle',           highAnchor: 'We align across departments' },
  // MEASUREMENT
  { id: 'm1', dimensionId: 'measurement',    text: 'Our KPIs include metrics that reflect the customer\'s experience — not just our operational efficiency.',                                    lowAnchor: 'Internal metrics only',                   highAnchor: 'Customer metrics are core KPIs' },
  { id: 'm2', dimensionId: 'measurement',    text: 'We know our customer satisfaction or NPS score — and we genuinely understand the root causes behind it.',                                   lowAnchor: 'We measure but don\'t dig in',             highAnchor: 'We know the root causes' },
  { id: 'm3', dimensionId: 'measurement',    text: 'We can connect CX data to business outcomes like retention, revenue or referrals — and use AI or data tools to find patterns at scale.',    lowAnchor: 'CX data stands alone',                    highAnchor: 'Connected to business results' },
  { id: 'm4', dimensionId: 'measurement',    text: 'Customer experience data is accessible to all relevant teams — not owned by one department and unavailable to the rest.',                   lowAnchor: 'Locked in one team',                      highAnchor: 'Democratised across the org' },
  // PRIORITISATION
  { id: 'p1', dimensionId: 'prioritisation', text: 'We have a clear CX ambition that defines what differentiates our experience — and this is embedded in our business strategy, not a separate workstream.', lowAnchor: 'CX is its own island',           highAnchor: 'CX is part of our strategy' },
  { id: 'p2', dimensionId: 'prioritisation', text: 'We have a clear view of which customer problems, if solved, would have the greatest business impact — and we use this to prioritise.',     lowAnchor: 'Everything feels equally urgent',         highAnchor: 'We know where to focus' },
  { id: 'p3', dimensionId: 'prioritisation', text: 'We can confidently deprioritise or say no to initiatives that don\'t meaningfully improve the experience or deliver on our brand promise.',  lowAnchor: 'Hard to say no',                          highAnchor: 'We make clear choices' },
  { id: 'p4', dimensionId: 'prioritisation', text: 'We have a concrete execution plan for our CX ambition — not just a strategy document, but a practical roadmap with clear ownership.',       lowAnchor: 'We have ambition, not execution',         highAnchor: 'We have a practical roadmap' },
  // CULTURE
  { id: 'c1', dimensionId: 'culture',        text: 'Employees at all levels can explain how their work affects the customer experience — CX is part of our daily way-of-working, not a separate initiative.', lowAnchor: 'Only frontline staff know',    highAnchor: 'Everyone sees the connection' },
  { id: 'c2', dimensionId: 'culture',        text: 'When something goes wrong for a customer, the response is proactive and transparent — we own it and fix it rather than managing the perception.', lowAnchor: 'We manage the perception',       highAnchor: 'We own it and fix it' },
  { id: 'c3', dimensionId: 'culture',        text: 'Employee experience is actively managed — we invest in the people and processes that enable great service delivery, not just the customer-facing layer.', lowAnchor: 'Employee side is neglected',    highAnchor: 'EX and CX are connected' },
  { id: 'c4', dimensionId: 'culture',        text: 'Customer stories and real data show up regularly in our meetings and strategic conversations — the voice of the customer is always in the room.', lowAnchor: 'Rarely heard in the boardroom', highAnchor: 'Customer voice is always present' },
]

const QUESTIONS_NL: CxQuestion[] = [
  // INZICHT
  { id: 'i1', dimensionId: 'insight',        text: 'We doen continu voice-of-customer onderzoek om te begrijpen wat klanten echt nodig hebben — niet alleen wat ze zeggen te willen.',          lowAnchor: 'We denken dat we het weten',              highAnchor: 'We hebben doorlopend bewijs' },
  { id: 'i2', dimensionId: 'insight',        text: 'We hebben een helder beeld van de emotionele klantreis — inclusief de moments of truth die de ervaring maken of breken.',                   lowAnchor: 'We focussen op processtappen',            highAnchor: 'We brengen moments of truth in kaart' },
  { id: 'i3', dimensionId: 'insight',        text: 'Klantinzichten bepalen actief product-, service- en procesbeslissingen — ze zijn ingebed in hoe we werken, niet opgeslagen in rapporten.',  lowAnchor: 'Inzichten staan in rapporten',            highAnchor: 'Inzichten sturen beslissingen' },
  { id: 'i4', dimensionId: 'insight',        text: 'We kunnen onderscheiden wat klanten zeggen te willen en wat ze daadwerkelijk doen — en we gebruiken gedragsdata om onze diensten te verbeteren zonder aannames.', lowAnchor: 'We nemen feedback letterlijk', highAnchor: 'We kijken naar gedrag' },
  // JOURNEY
  { id: 'j1', dimensionId: 'journey',        text: 'Onze customer journeys worden actief beheerd — met duidelijk eigenaarschap, doelstellingen en een gestructureerde manier van werken om ze te monitoren en verbeteren.', lowAnchor: 'Journeys worden niet actief beheerd', highAnchor: 'Governance is ingericht' },
  { id: 'j2', dimensionId: 'journey',        text: 'We testen en optimaliseren onze diensten continu met echte klanten — van activatie tot loyaliteit, niet alleen bij klachten.',               lowAnchor: 'We testen als iets kapot is',             highAnchor: 'Optimalisatie is continu' },
  { id: 'j3', dimensionId: 'journey',        text: 'Als een proces intern complex is, zorgen we dat de klant die complexiteit niet voelt — we beschermen de beleving tegen onze silo\'s.',      lowAnchor: 'Onze complexiteit sijpelt naar buiten',   highAnchor: 'We beschermen de klant' },
  { id: 'j4', dimensionId: 'journey',        text: 'Onze kanalen voelen naadloos en samenhangend vanuit klantperspectief — met een duidelijke rol en focus per kanaal.',                        lowAnchor: 'Gesilode kanaalbeleving',                 highAnchor: 'Één coherente omnichannel reis' },
  // AFSTEMMING
  { id: 'a1', dimensionId: 'alignment',      text: 'Het leiderschap zet zich actief in voor CX — met zichtbare tijd, budget en verantwoordelijkheid, niet alleen woorden.',                     lowAnchor: 'Het wordt naar beneden gedelegeerd',      highAnchor: 'Leiderschap geeft het goede voorbeeld' },
  { id: 'a2', dimensionId: 'alignment',      text: 'Onze merkbelofte is zichtbaar in elk klantcontactmoment — we communiceren hem niet alleen, we maken hem waar.',                             lowAnchor: 'Belofte en werkelijkheid kloppen niet',   highAnchor: 'We leveren op onze belofte' },
  { id: 'a3', dimensionId: 'alignment',      text: 'Klantfeedback bereikt de mensen die er actie op kunnen ondernemen — snel en direct, zonder dat het blijft steken of gefilterd wordt.',     lowAnchor: 'Blijft steken of wordt gefilterd',        highAnchor: 'Stroomt naar wie het bezit' },
  { id: 'a4', dimensionId: 'alignment',      text: 'Gesilode afdelingen worden actief uitgelijnd rondom de customer journey — we lossen problemen cross-functioneel op bij de kern.',           lowAnchor: 'Silo\'s zijn een constant obstakel',      highAnchor: 'We stemmen af over afdelingen heen' },
  // METING
  { id: 'm1', dimensionId: 'measurement',    text: 'Onze KPI\'s omvatten maatstaven die de klantervaring weerspiegelen — niet alleen onze operationele efficiëntie.',                           lowAnchor: 'Alleen interne metrics',                  highAnchor: 'Klantmetrics zijn kern-KPI\'s' },
  { id: 'm2', dimensionId: 'measurement',    text: 'We kennen onze klanttevredenheids- of NPS-score — en we begrijpen echt de onderliggende oorzaken.',                                         lowAnchor: 'We meten maar graven niet diep',          highAnchor: 'We kennen de hoofdoorzaken' },
  { id: 'm3', dimensionId: 'measurement',    text: 'We kunnen CX-data verbinden met bedrijfsresultaten zoals retentie, omzet of doorverwijzingen — en we gebruiken data of AI om patronen op schaal te vinden.', lowAnchor: 'CX-data staat op zichzelf', highAnchor: 'Verbonden met bedrijfsresultaten' },
  { id: 'm4', dimensionId: 'measurement',    text: 'Klantervaringsdata is toegankelijk voor alle relevante teams — niet het eigendom van één afdeling.',                                        lowAnchor: 'Opgesloten in één team',                  highAnchor: 'Gedemocratiseerd door de organisatie' },
  // STRATEGIE
  { id: 'p1', dimensionId: 'prioritisation', text: 'We hebben een heldere CX-ambitie die bepaalt wat onze ervaring onderscheidt — en dit is verankerd in onze bedrijfsstrategie, niet een aparte workstream.', lowAnchor: 'CX is zijn eigen eiland', highAnchor: 'CX is onderdeel van onze strategie' },
  { id: 'p2', dimensionId: 'prioritisation', text: 'We weten welke klantproblemen, als opgelost, de grootste zakelijke impact zouden hebben — en we gebruiken dit om te prioriteren.',          lowAnchor: 'Alles voelt even urgent',                 highAnchor: 'We weten waar we ons op moeten focussen' },
  { id: 'p3', dimensionId: 'prioritisation', text: 'We kunnen vol vertrouwen initiatieven deprioriteren of nee zeggen als ze de ervaring of merkbelofte niet zinvol versterken.',               lowAnchor: 'Moeilijk om nee te zeggen',               highAnchor: 'We maken duidelijke keuzes' },
  { id: 'p4', dimensionId: 'prioritisation', text: 'We hebben een concreet uitvoeringsplan voor onze CX-ambitie — geen strategiedocument, maar een praktische roadmap met duidelijk eigenaarschap.', lowAnchor: 'We hebben ambitie, geen uitvoering',  highAnchor: 'We hebben een praktische roadmap' },
  // CULTUUR
  { id: 'c1', dimensionId: 'culture',        text: 'Medewerkers op alle niveaus kunnen uitleggen hoe hun werk de klantervaring beïnvloedt — CX is onderdeel van onze dagelijkse manier van werken.', lowAnchor: 'Alleen frontlijnmedewerkers weten het', highAnchor: 'Iedereen ziet de verbinding' },
  { id: 'c2', dimensionId: 'culture',        text: 'Als er iets misgaat voor een klant, is de reactie proactief en transparant — we erkennen het en lossen het op in plaats van de perceptie te managen.', lowAnchor: 'We managen de perceptie',        highAnchor: 'We erkennen het en lossen het op' },
  { id: 'c3', dimensionId: 'culture',        text: 'Employee experience wordt actief beheerd — we investeren in de mensen en processen die goede dienstverlening mogelijk maken, niet alleen in de klantlaag.', lowAnchor: 'Medewerkerszijde wordt verwaarloosd', highAnchor: 'EX en CX zijn verbonden' },
  { id: 'c4', dimensionId: 'culture',        text: 'Klantverhalen en echte data verschijnen regelmatig in vergaderingen en strategische gesprekken — de stem van de klant is altijd aanwezig.',   lowAnchor: 'Zelden te horen in de bestuurskamer',     highAnchor: 'De stem van de klant is altijd aanwezig' },
]

// ── Roles ─────────────────────────────────────────────────────────────────────

const ROLES_EN: CxRole[] = [
  { id: 'exec',          label: 'Executive / Board',      description: 'C-suite, director or supervisory board member' },
  { id: 'cx',            label: 'CX / Service Lead',      description: 'Responsible for customer experience or service design' },
  { id: 'journey',       label: 'Journey Manager',        description: 'Manages and governs customer journeys end-to-end' },
  { id: 'digital',       label: 'Digital / Product',      description: 'Digital, product or UX ownership' },
  { id: 'data',          label: 'Data & Insights',        description: 'Customer data, analytics or voice-of-customer research' },
  { id: 'marketing',     label: 'Marketing / Brand',      description: 'Marketing, communications or brand strategy' },
  { id: 'operations',    label: 'Operations / Process',   description: 'Process management, operations or service delivery' },
]

const ROLES_NL: CxRole[] = [
  { id: 'exec',          label: 'Directie / Bestuur',     description: 'C-suite, directeur of lid van de raad van toezicht' },
  { id: 'cx',            label: 'CX / Service Lead',      description: 'Verantwoordelijk voor klantervaring of service design' },
  { id: 'journey',       label: 'Journey Manager',        description: 'Beheert en stuurt customer journeys end-to-end' },
  { id: 'digital',       label: 'Digitaal / Product',     description: 'Eigenaarschap over digitaal, product of UX' },
  { id: 'data',          label: 'Data & Insights',        description: 'Klantdata, analyse of voice-of-customer onderzoek' },
  { id: 'marketing',     label: 'Marketing / Merk',       description: 'Marketing, communicatie of merkstrategie' },
  { id: 'operations',    label: 'Operaties / Proces',     description: 'Procesmanagement, operaties of dienstverlening' },
]

// ── Locale-aware content accessor ────────────────────────────────────────────

export function getCxContent(locale: string) {
  const isNl = locale === 'nl'
  return {
    DIMENSIONS:  isNl ? DIMENSIONS_NL  : DIMENSIONS_EN,
    QUESTIONS:   isNl ? QUESTIONS_NL   : QUESTIONS_EN,
    ROLES:       isNl ? ROLES_NL       : ROLES_EN,
  }
}

export const DIMENSIONS = DIMENSIONS_EN
export const QUESTIONS  = QUESTIONS_EN
export const ROLES      = ROLES_EN

// ── Scoring ──────────────────────────────────────────────────────────────────

export interface ScoreColour {
  bg: string
  text: string
  label: string
  labelNl: string
  pastelBg: string
}

export function scoreColour(score: number): ScoreColour {
  if (score >= 3.5) return { bg: '#044524', text: '#fff', label: 'CX-Led',           labelNl: 'CX-gedreven',         pastelBg: '#EAF5F2' }
  if (score >= 2.5) return { bg: '#24CF7A', text: '#fff', label: 'Customer-Centric', labelNl: 'Klantgericht',        pastelBg: '#D2F5E8' }
  if (score >= 1.5) return { bg: '#F59E0B', text: '#fff', label: 'CX Emerging',      labelNl: 'CX in Ontwikkeling',  pastelBg: '#FEF3C7' }
  return               { bg: '#E05A7A', text: '#fff', label: 'Internally Driven', labelNl: 'Intern Gericht',      pastelBg: '#FDF0F3' }
}

export function overallScore(dimScores: Record<string, number>): number {
  const vals = Object.values(dimScores).filter(v => v > 0)
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export type CxDimScores = Record<CxDimensionId, number>
