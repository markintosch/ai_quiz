// ── CX Maturity Assessment — by Marije Gast ─────────────────────────────────
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
  { id: 'insight',         name: 'Customer Insight',          short: 'Insight',         icon: '🔍', description: 'Do you genuinely know your customers — their needs, emotions, and behaviours beyond what they say out loud?' },
  { id: 'journey',         name: 'Journey Design',            short: 'Journey',         icon: '🗺️', description: 'Are your services and digital touchpoints designed from the customer\'s perspective — or from the inside out?' },
  { id: 'alignment',       name: 'Internal Alignment',        short: 'Alignment',       icon: '🤝', description: 'Does the whole organisation face the same direction — or is CX the responsibility of one isolated team?' },
  { id: 'measurement',     name: 'Measurement',               short: 'Measurement',     icon: '📊', description: 'Are you tracking what matters to your customers, or only what\'s easy to count internally?' },
  { id: 'prioritisation',  name: 'Strategic Prioritisation',  short: 'Prioritisation',  icon: '🎯', description: 'Can you make sharp choices based on customer impact — and confidently say no to what doesn\'t move the needle?' },
  { id: 'culture',         name: 'Service Culture',           short: 'Culture',         icon: '💛', description: 'Is customer-centricity a behaviour woven into daily work — or a value on a poster in the hallway?' },
]

const DIMENSIONS_NL: CxDimension[] = [
  { id: 'insight',         name: 'Klantinzicht',              short: 'Inzicht',         icon: '🔍', description: 'Ken je je klanten echt — hun behoeften, emoties en gedrag voorbij wat ze hardop zeggen?' },
  { id: 'journey',         name: 'Journey Design',            short: 'Journey',         icon: '🗺️', description: 'Zijn je services en digitale touchpoints ontworpen vanuit het perspectief van de klant — of van binnenuit?' },
  { id: 'alignment',       name: 'Interne Afstemming',        short: 'Afstemming',      icon: '🤝', description: 'Werkt de hele organisatie in dezelfde richting — of is CX de verantwoordelijkheid van één geïsoleerd team?' },
  { id: 'measurement',     name: 'Meting',                    short: 'Meting',          icon: '📊', description: 'Meet je wat er voor je klanten toe doet, of alleen wat intern makkelijk te tellen is?' },
  { id: 'prioritisation',  name: 'Strategische Prioritering', short: 'Prioritering',    icon: '🎯', description: 'Kun je scherpe keuzes maken op basis van klantimpact — en vol vertrouwen nee zeggen tegen wat er niet toe doet?' },
  { id: 'culture',         name: 'Servicecultuur',            short: 'Cultuur',         icon: '💛', description: 'Is klantgerichtheid een gedrag verweven in het dagelijks werk — of een waarde op een poster in de gang?' },
]

// ── Questions ────────────────────────────────────────────────────────────────

const QUESTIONS_EN: CxQuestion[] = [
  // INSIGHT
  { id: 'i1', dimensionId: 'insight',        text: 'We conduct regular research to understand what customers genuinely need — not just what they tell us they want.',                            lowAnchor: 'We assume we know',                       highAnchor: 'We have evidence' },
  { id: 'i2', dimensionId: 'insight',        text: 'We have a clear picture of the emotional journey customers go through, not just the functional steps.',                                    lowAnchor: 'We focus on process',                     highAnchor: 'We map emotions too' },
  { id: 'i3', dimensionId: 'insight',        text: 'Customer insights actively shape product, service, and process decisions — not just marketing.',                                           lowAnchor: 'Insights sit in reports',                 highAnchor: 'Insights drive decisions' },
  { id: 'i4', dimensionId: 'insight',        text: 'We can distinguish between what customers say they want and what they actually do.',                                                       lowAnchor: 'We take feedback at face value',           highAnchor: 'We look at behaviour' },
  // JOURNEY
  { id: 'j1', dimensionId: 'journey',        text: 'Our digital touchpoints are designed based on observed user behaviour, not internal assumptions.',                                         lowAnchor: 'Built for us',                            highAnchor: 'Built for them' },
  { id: 'j2', dimensionId: 'journey',        text: 'We regularly test our services with real users — before and after launch, not just once.',                                                 lowAnchor: 'We test when something breaks',            highAnchor: 'Testing is continuous' },
  { id: 'j3', dimensionId: 'journey',        text: 'When a process is complex internally, we don\'t let the customer absorb that complexity.',                                                 lowAnchor: 'Our complexity leaks out',                highAnchor: 'We shield the customer' },
  { id: 'j4', dimensionId: 'journey',        text: 'Our channels feel seamless and connected from the customer\'s perspective.',                                                              lowAnchor: 'Siloed experiences',                      highAnchor: 'One coherent journey' },
  // ALIGNMENT
  { id: 'a1', dimensionId: 'alignment',      text: 'Leadership actively champions CX with visible time, budget and attention — not just words.',                                               lowAnchor: 'It\'s delegated downward',                highAnchor: 'Leadership leads by example' },
  { id: 'a2', dimensionId: 'alignment',      text: 'When teams make decisions, customer impact is part of the standard evaluation — not an afterthought.',                                    lowAnchor: 'Rarely considered',                       highAnchor: 'Always part of the process' },
  { id: 'a3', dimensionId: 'alignment',      text: 'Customer feedback reaches the people who can act on it — quickly and directly.',                                                          lowAnchor: 'Gets stuck or filtered',                  highAnchor: 'Flows to those who own it' },
  { id: 'a4', dimensionId: 'alignment',      text: 'We celebrate customer wins and success stories as visibly as we share revenue results.',                                                   lowAnchor: 'Revenue is what we celebrate',            highAnchor: 'Both are equally visible' },
  // MEASUREMENT
  { id: 'm1', dimensionId: 'measurement',    text: 'Our KPIs include metrics that reflect the customer\'s experience, not just our operational efficiency.',                                   lowAnchor: 'Internal metrics only',                   highAnchor: 'Customer metrics are core KPIs' },
  { id: 'm2', dimensionId: 'measurement',    text: 'We know our customer satisfaction or NPS score — and we genuinely understand why it is what it is.',                                      lowAnchor: 'We measure but don\'t dig in',             highAnchor: 'We know the root causes' },
  { id: 'm3', dimensionId: 'measurement',    text: 'We can connect customer experience data to business outcomes like retention, revenue, or referrals.',                                      lowAnchor: 'CX data stands alone',                    highAnchor: 'Connected to business results' },
  { id: 'm4', dimensionId: 'measurement',    text: 'Customer experience data is accessible to all relevant teams — not owned by one department.',                                             lowAnchor: 'Locked in one team',                      highAnchor: 'Democratised across the org' },
  // PRIORITISATION
  { id: 'p1', dimensionId: 'prioritisation', text: 'We have a clear view of which customer problems, if solved, would have the greatest business impact.',                                    lowAnchor: 'Everything feels equally urgent',         highAnchor: 'We know where to focus' },
  { id: 'p2', dimensionId: 'prioritisation', text: 'When resources are scarce, customer value is a key criterion for what gets built or improved first.',                                     lowAnchor: 'Internal pressure drives choices',        highAnchor: 'Customer impact drives choices' },
  { id: 'p3', dimensionId: 'prioritisation', text: 'We can confidently deprioritise or say no to initiatives that don\'t meaningfully improve the experience.',                               lowAnchor: 'Hard to say no',                          highAnchor: 'We make clear choices' },
  { id: 'p4', dimensionId: 'prioritisation', text: 'Our CX ambition is woven into our business strategy — not managed as a separate workstream.',                                             lowAnchor: 'CX is its own island',                    highAnchor: 'Integrated into strategy' },
  // CULTURE
  { id: 'c1', dimensionId: 'culture',        text: 'Employees at all levels can explain how their work affects the customer experience.',                                                      lowAnchor: 'Only frontline staff know',               highAnchor: 'Everyone sees the connection' },
  { id: 'c2', dimensionId: 'culture',        text: 'When something goes wrong for a customer, the response is proactive and transparent — not defensive.',                                    lowAnchor: 'We manage the perception',                highAnchor: 'We own it and fix it' },
  { id: 'c3', dimensionId: 'culture',        text: 'We actively seek out critical feedback from customers — not just the positive kind.',                                                     lowAnchor: 'We prefer good news',                     highAnchor: 'Criticism is welcomed' },
  { id: 'c4', dimensionId: 'culture',        text: 'Customer stories and real quotes show up regularly in our meetings and strategic conversations.',                                          lowAnchor: 'Rarely heard in the boardroom',           highAnchor: 'Customer voice is always present' },
]

const QUESTIONS_NL: CxQuestion[] = [
  // INZICHT
  { id: 'i1', dimensionId: 'insight',        text: 'We doen regelmatig onderzoek om te begrijpen wat klanten echt nodig hebben — niet alleen wat ze zeggen te willen.',                        lowAnchor: 'We denken dat we het weten',              highAnchor: 'We hebben bewijs' },
  { id: 'i2', dimensionId: 'insight',        text: 'We hebben een helder beeld van de emotionele reis die klanten doorlopen, niet alleen de functionele stappen.',                             lowAnchor: 'We focussen op processen',                highAnchor: 'We brengen ook emoties in kaart' },
  { id: 'i3', dimensionId: 'insight',        text: 'Klantinzichten bepalen actief product-, service- en procesbeslissingen — niet alleen marketing.',                                          lowAnchor: 'Inzichten staan in rapporten',            highAnchor: 'Inzichten sturen beslissingen' },
  { id: 'i4', dimensionId: 'insight',        text: 'We kunnen onderscheiden wat klanten zeggen te willen en wat ze daadwerkelijk doen.',                                                      lowAnchor: 'We nemen feedback letterlijk',            highAnchor: 'We kijken naar gedrag' },
  // JOURNEY
  { id: 'j1', dimensionId: 'journey',        text: 'Onze digitale touchpoints zijn ontworpen op basis van geobserveerd gebruikersgedrag, niet interne aannames.',                             lowAnchor: 'Gebouwd voor ons',                        highAnchor: 'Gebouwd voor hen' },
  { id: 'j2', dimensionId: 'journey',        text: 'We testen onze diensten regelmatig met echte gebruikers — voor en na de lancering, niet slechts eenmalig.',                               lowAnchor: 'We testen als iets kapot is',             highAnchor: 'Testen is continu' },
  { id: 'j3', dimensionId: 'journey',        text: 'Als een proces intern complex is, laten we de klant die complexiteit niet voelen.',                                                        lowAnchor: 'Onze complexiteit sijpelt naar buiten',   highAnchor: 'We beschermen de klant' },
  { id: 'j4', dimensionId: 'journey',        text: 'Onze kanalen voelen naadloos en samenhangend vanuit het perspectief van de klant.',                                                       lowAnchor: 'Gesilode ervaringen',                     highAnchor: 'Één coherente reis' },
  // AFSTEMMING
  { id: 'a1', dimensionId: 'alignment',      text: 'Het leiderschap zet zich actief in voor CX met zichtbare tijd, budget en aandacht — niet alleen woorden.',                                lowAnchor: 'Het wordt naar beneden gedelegeerd',      highAnchor: 'Leiderschap geeft het goede voorbeeld' },
  { id: 'a2', dimensionId: 'alignment',      text: 'Wanneer teams beslissingen nemen, maakt klantimpact deel uit van de standaardevaluatie — niet als bijgedachte.',                          lowAnchor: 'Zelden overwogen',                        highAnchor: 'Altijd onderdeel van het proces' },
  { id: 'a3', dimensionId: 'alignment',      text: 'Klantfeedback bereikt de mensen die er actie op kunnen ondernemen — snel en direct.',                                                     lowAnchor: 'Blijft steken of wordt gefilterd',        highAnchor: 'Stroomt naar wie het bezit' },
  { id: 'a4', dimensionId: 'alignment',      text: 'We vieren klantsuccessen en succesverhalen even zichtbaar als we omzetresultaten delen.',                                                  lowAnchor: 'Omzet is wat we vieren',                  highAnchor: 'Beide zijn even zichtbaar' },
  // METING
  { id: 'm1', dimensionId: 'measurement',    text: 'Onze KPI\'s omvatten maatstaven die de klantervaring weerspiegelen, niet alleen onze operationele efficiëntie.',                          lowAnchor: 'Alleen interne metrics',                  highAnchor: 'Klantmetrics zijn kern-KPI\'s' },
  { id: 'm2', dimensionId: 'measurement',    text: 'We kennen onze klanttevredenheids- of NPS-score — en we begrijpen echt waarom die is zoals die is.',                                      lowAnchor: 'We meten maar graven niet diep',          highAnchor: 'We kennen de hoofdoorzaken' },
  { id: 'm3', dimensionId: 'measurement',    text: 'We kunnen klantervaringsdata verbinden met bedrijfsresultaten zoals retentie, omzet of doorverwijzingen.',                                lowAnchor: 'CX-data staat op zichzelf',               highAnchor: 'Verbonden met bedrijfsresultaten' },
  { id: 'm4', dimensionId: 'measurement',    text: 'Klantervaringsdata is toegankelijk voor alle relevante teams — niet eigendom van één afdeling.',                                          lowAnchor: 'Opgesloten in één team',                  highAnchor: 'Gedemocratiseerd door de organisatie' },
  // PRIORITERING
  { id: 'p1', dimensionId: 'prioritisation', text: 'We hebben een duidelijk beeld van welke klantproblemen, als opgelost, de grootste zakelijke impact zouden hebben.',                       lowAnchor: 'Alles voelt even urgent',                 highAnchor: 'We weten waar we ons op moeten focussen' },
  { id: 'p2', dimensionId: 'prioritisation', text: 'Als middelen schaars zijn, is klantwaarde een belangrijk criterium voor wat er eerst gebouwd of verbeterd wordt.',                        lowAnchor: 'Interne druk stuurt keuzes',              highAnchor: 'Klantimpact stuurt keuzes' },
  { id: 'p3', dimensionId: 'prioritisation', text: 'We kunnen vol vertrouwen initiatieven deprioriteren of nee zeggen als ze de ervaring niet zinvol verbeteren.',                            lowAnchor: 'Moeilijk om nee te zeggen',               highAnchor: 'We maken duidelijke keuzes' },
  { id: 'p4', dimensionId: 'prioritisation', text: 'Onze CX-ambitie is verweven in onze bedrijfsstrategie — niet beheerd als een aparte workstream.',                                        lowAnchor: 'CX is zijn eigen eiland',                 highAnchor: 'Geïntegreerd in strategie' },
  // CULTUUR
  { id: 'c1', dimensionId: 'culture',        text: 'Medewerkers op alle niveaus kunnen uitleggen hoe hun werk de klantervaring beïnvloedt.',                                                  lowAnchor: 'Alleen frontlijnmedewerkers weten het',   highAnchor: 'Iedereen ziet de verbinding' },
  { id: 'c2', dimensionId: 'culture',        text: 'Als er iets misgaat voor een klant, is de reactie proactief en transparant — niet defensief.',                                            lowAnchor: 'We managen de perceptie',                 highAnchor: 'We erkennen het en lossen het op' },
  { id: 'c3', dimensionId: 'culture',        text: 'We zoeken actief naar kritische feedback van klanten — niet alleen de positieve.',                                                        lowAnchor: 'We geven de voorkeur aan goed nieuws',    highAnchor: 'Kritiek wordt verwelkomd' },
  { id: 'c4', dimensionId: 'culture',        text: 'Klantverhalen en echte citaten verschijnen regelmatig in onze vergaderingen en strategische gesprekken.',                                 lowAnchor: 'Zelden te horen in de bestuurskamer',     highAnchor: 'De stem van de klant is altijd aanwezig' },
]

// ── Roles ─────────────────────────────────────────────────────────────────────

const ROLES_EN: CxRole[] = [
  { id: 'exec',       label: 'Executive / Board',      description: 'C-suite, director or supervisory board member' },
  { id: 'cx',         label: 'CX / Service Lead',      description: 'Responsible for customer experience or service' },
  { id: 'digital',    label: 'Digital / Product',      description: 'Digital, product or UX ownership' },
  { id: 'marketing',  label: 'Marketing / Brand',      description: 'Marketing, communications or brand strategy' },
  { id: 'operations', label: 'Operations / Process',   description: 'Process management, operations or quality' },
]

const ROLES_NL: CxRole[] = [
  { id: 'exec',       label: 'Directie / Bestuur',     description: 'C-suite, directeur of lid van de raad van toezicht' },
  { id: 'cx',         label: 'CX / Service Lead',      description: 'Verantwoordelijk voor klantervaring of service' },
  { id: 'digital',    label: 'Digitaal / Product',     description: 'Eigenaarschap over digitaal, product of UX' },
  { id: 'marketing',  label: 'Marketing / Merk',       description: 'Marketing, communicatie of merkstrategie' },
  { id: 'operations', label: 'Operaties / Proces',     description: 'Procesmanagement, operaties of kwaliteit' },
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

// ── Legacy exports (English, for backward compat) ────────────────────────────
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
  if (score >= 3.5) return { bg: '#0EA5A0', text: '#fff', label: 'Customer-Led',    labelNl: 'Klantgedreven',     pastelBg: '#E6F9F8' }
  if (score >= 2.5) return { bg: '#4B9FD6', text: '#fff', label: 'Customer-Aware',  labelNl: 'Klantbewust',       pastelBg: '#EBF5FB' }
  if (score >= 1.5) return { bg: '#F59E0B', text: '#fff', label: 'Inside-Out',      labelNl: 'Van Binnen Naar Buiten', pastelBg: '#FEF3C7' }
  return               { bg: '#E05A7A', text: '#fff', label: 'Product-First',   labelNl: 'Productgericht',    pastelBg: '#FDF0F3' }
}

export function overallScore(dimScores: Record<string, number>): number {
  const vals = Object.values(dimScores).filter(v => v > 0)
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export type CxDimScores = Record<CxDimensionId, number>
