// ── Circular Readiness Assessment — Madaster ─────────────────────────────────
// Product data: dimensions, questions, roles, scoring helpers

export type MadasterDimensionId =
  | 'materials'
  | 'design'
  | 'data'
  | 'compliance'
  | 'value'
  | 'alignment'

export interface MadasterDimension {
  id: MadasterDimensionId
  name: string
  short: string
  description: string
  icon: string
}

export interface MadasterQuestion {
  id: string
  dimensionId: MadasterDimensionId
  text: string
  lowAnchor: string
  highAnchor: string
}

export interface MadasterRole {
  id: string
  label: string
  description: string
}

export type MadasterDimScores = Record<MadasterDimensionId, number>

export interface MadasterScoreColour {
  bg: string
  text: string
  label: string
  labelNl: string
  pastelBg: string
}

// ── Dimensions ────────────────────────────────────────────────────────────────

const DIMENSIONS_EN: MadasterDimension[] = [
  { id: 'materials',   name: 'Materials Registration',   short: 'Materials',   icon: '🏗️', description: 'Do you know what\'s in your buildings? A complete material inventory is the foundation of circular strategy.' },
  { id: 'design',      name: 'Circular Design',           short: 'Design',      icon: '♻️', description: 'Are your projects designed for disassembly, reuse and material recovery — or built to last until demolition?' },
  { id: 'data',        name: 'Data Infrastructure',       short: 'Data',        icon: '📊', description: 'Do you have structured, accessible data on your materials — or is it buried in PDFs, spreadsheets and silos?' },
  { id: 'compliance',  name: 'Regulatory Compliance',     short: 'Compliance',  icon: '📋', description: 'Are you prepared for MPG, EU taxonomy, BREEAM-NL and CSRD — or will each requirement catch you off guard?' },
  { id: 'value',       name: 'Financial Valuation',       short: 'Valuation',   icon: '💶', description: 'Do you quantify the residual material value in your assets — or is circular value invisible in your financial models?' },
  { id: 'alignment',   name: 'Stakeholder Alignment',     short: 'Alignment',   icon: '🤝', description: 'Does your supply chain — architects, contractors, suppliers — share and deliver on your circularity goals?' },
]

const DIMENSIONS_NL: MadasterDimension[] = [
  { id: 'materials',   name: 'Materiaalregistratie',      short: 'Materialen',  icon: '🏗️', description: 'Weet je wat er in je gebouwen zit? Een volledig materialenoverzicht is het fundament van een circulaire strategie.' },
  { id: 'design',      name: 'Circulair Ontwerp',          short: 'Ontwerp',     icon: '♻️', description: 'Zijn je projecten ontworpen voor demontage, hergebruik en materiaalterugwinning — of gebouwd om te slopen?' },
  { id: 'data',        name: 'Data-infrastructuur',        short: 'Data',        icon: '📊', description: 'Heb je gestructureerde, toegankelijke data over je materialen — of zit het begraven in pdf\'s, spreadsheets en silo\'s?' },
  { id: 'compliance',  name: 'Regelgevingsnaleving',       short: 'Compliance',  icon: '📋', description: 'Ben je voorbereid op MPG, EU-taxonomie, BREEAM-NL en CSRD — of verrast elke nieuwe verplichting je?' },
  { id: 'value',       name: 'Financiële Waardering',      short: 'Waardering',  icon: '💶', description: 'Kwantificeer je de resterende materiaalwaarde in je assets — of is circulaire waarde onzichtbaar in je financiële modellen?' },
  { id: 'alignment',   name: 'Stakeholderafstemming',      short: 'Afstemming',  icon: '🤝', description: 'Deelt je keten — architecten, aannemers, leveranciers — je circulariteitsdoelen en levert zij erop?' },
]

// ── Questions ─────────────────────────────────────────────────────────────────

const QUESTIONS_EN: MadasterQuestion[] = [
  // MATERIALS REGISTRATION
  { id: 'mat1', dimensionId: 'materials',  text: 'We have a complete, up-to-date record of the materials in our built assets.',                                                              lowAnchor: 'Little insight into what\'s in our buildings',  highAnchor: 'Detailed material inventories maintained' },
  { id: 'mat2', dimensionId: 'materials',  text: 'We can quickly identify which materials are hazardous, recyclable, or suitable for reuse.',                                               lowAnchor: 'Material composition largely unknown',          highAnchor: 'Full material profile known' },
  { id: 'mat3', dimensionId: 'materials',  text: 'We track material data across the full lifecycle — from construction through renovation to end-of-life.',                                 lowAnchor: 'Data captured at handover only',                highAnchor: 'Tracked throughout the full lifecycle' },
  { id: 'mat4', dimensionId: 'materials',  text: 'Our material records are accessible to all relevant teams and stakeholders — not locked in a single system or silo.',                    lowAnchor: 'Data is fragmented and hard to access',         highAnchor: 'Material data is centrally available' },
  // CIRCULAR DESIGN
  { id: 'des1', dimensionId: 'design',     text: 'Our new buildings and renovation projects are explicitly designed for future disassembly and material recovery.',                         lowAnchor: 'Design focuses on initial performance only',    highAnchor: 'Design explicitly enables future reuse' },
  { id: 'des2', dimensionId: 'design',     text: 'We select materials based on their recyclability and circular potential — not just upfront cost or availability.',                       lowAnchor: 'Cost and availability drive selection',         highAnchor: 'Circular potential is a key criterion' },
  { id: 'des3', dimensionId: 'design',     text: 'We use reversible connections and building techniques to enable future material recovery.',                                               lowAnchor: 'Permanent connections are the standard',        highAnchor: 'Reversible techniques are the norm' },
  { id: 'des4', dimensionId: 'design',     text: 'Circularity metrics are part of our standard project review and design approval process.',                                               lowAnchor: 'Circularity is an afterthought',               highAnchor: 'Reviewed at every project stage' },
  // DATA INFRASTRUCTURE
  { id: 'dat1', dimensionId: 'data',       text: 'We use BIM (Building Information Modelling) data systematically across our projects and portfolio.',                                     lowAnchor: 'BIM used inconsistently or not at all',         highAnchor: 'BIM is standard across all projects' },
  { id: 'dat2', dimensionId: 'data',       text: 'Material and product data is captured in structured, machine-readable formats rather than PDFs or spreadsheets.',                       lowAnchor: 'Data lives in PDFs and spreadsheets',           highAnchor: 'Structured, interoperable data formats' },
  { id: 'dat3', dimensionId: 'data',       text: 'We have a central platform or registry for storing and accessing material passports and product data.',                                  lowAnchor: 'No central data repository exists',             highAnchor: 'Central platform in active use' },
  { id: 'dat4', dimensionId: 'data',       text: 'Our data systems are compatible with regulatory reporting platforms and external databases such as EPD libraries.',                      lowAnchor: 'Manual data translation needed for reporting',  highAnchor: 'Seamless integration with external platforms' },
  // REGULATORY COMPLIANCE
  { id: 'com1', dimensionId: 'compliance', text: 'We actively monitor and manage our MPG (Milieuprestatie Gebouwen) scores across our portfolio.',                                        lowAnchor: 'MPG calculated only when required',             highAnchor: 'MPG actively managed and optimised' },
  { id: 'com2', dimensionId: 'compliance', text: 'We can produce documentation for BREEAM-NL, EU taxonomy, or CSRD reporting without significant additional effort.',                    lowAnchor: 'Reports require major effort each time',        highAnchor: 'Reporting is straightforward and systematic' },
  { id: 'com3', dimensionId: 'compliance', text: 'Current and upcoming regulatory requirements are embedded in our project planning and design processes.',                                lowAnchor: 'We react to regulations as they arrive',        highAnchor: 'Regulations proactively integrated' },
  { id: 'com4', dimensionId: 'compliance', text: 'We can clearly demonstrate our circularity performance to investors, clients, and government stakeholders.',                             lowAnchor: 'Hard to evidence our performance',              highAnchor: 'Evidence readily available and credible' },
  // FINANCIAL VALUATION
  { id: 'val1', dimensionId: 'value',      text: 'We assess the residual material value of our assets as part of regular financial planning and reporting.',                               lowAnchor: 'Residual value not quantified',                 highAnchor: 'Residual value part of financial models' },
  { id: 'val2', dimensionId: 'value',      text: 'Circular material choices and design-for-disassembly are included in our investment decision criteria.',                                lowAnchor: 'Circular value not financially modelled',       highAnchor: 'Circular value influences investment decisions' },
  { id: 'val3', dimensionId: 'value',      text: 'We can quantify the long-term financial benefit of reversible design versus conventional demolition.',                                  lowAnchor: 'Business case unclear or untested',             highAnchor: 'Clear, evidenced financial models' },
  { id: 'val4', dimensionId: 'value',      text: 'Our organisation understands the depreciation and obsolescence risk of holding non-circular assets.',                                   lowAnchor: 'Non-circular risk is not on our radar',         highAnchor: 'Non-circular risk actively managed' },
  // STAKEHOLDER ALIGNMENT
  { id: 'ali1', dimensionId: 'alignment',  text: 'Our key suppliers and manufacturers provide structured material data and Environmental Product Declarations (EPDs) as standard.',       lowAnchor: 'EPD availability is limited or inconsistent',   highAnchor: 'Suppliers deliver structured data as standard' },
  { id: 'ali2', dimensionId: 'alignment',  text: 'The architects and contractors we work with understand and actively apply circular design principles.',                                  lowAnchor: 'Circularity depends on the individual',         highAnchor: 'Circularity embedded in how we work together' },
  { id: 'ali3', dimensionId: 'alignment',  text: 'Circularity targets and material data requirements are included in our contracts and procurement criteria.',                            lowAnchor: 'Discussed but not contractual',                 highAnchor: 'Contractual requirements drive circularity' },
  { id: 'ali4', dimensionId: 'alignment',  text: 'Leadership actively champions circularity goals with visible budget, decision-making authority, and accountability.',                   lowAnchor: 'Circularity delegated to a small team',         highAnchor: 'Leadership visibly owns the agenda' },
]

const QUESTIONS_NL: MadasterQuestion[] = [
  // MATERIAALREGISTRATIE
  { id: 'mat1', dimensionId: 'materials',  text: 'We hebben een volledig, actueel overzicht van de materialen in onze gebouwde assets.',                                                   lowAnchor: 'Weinig inzicht in wat er in onze gebouwen zit', highAnchor: 'Gedetailleerde materialenoverzichten bijgehouden' },
  { id: 'mat2', dimensionId: 'materials',  text: 'We kunnen snel identificeren welke materialen gevaarlijk, recyclebaar of geschikt voor hergebruik zijn.',                                lowAnchor: 'Materiaalsamenstelling grotendeels onbekend',   highAnchor: 'Volledig materiaalenprofiel bekend' },
  { id: 'mat3', dimensionId: 'materials',  text: 'We volgen materiaaldata door de volledige levenscyclus — van bouw via renovatie tot sloop.',                                             lowAnchor: 'Data vastgelegd alleen bij oplevering',         highAnchor: 'Gevolgd door de volledige levenscyclus' },
  { id: 'mat4', dimensionId: 'materials',  text: 'Onze materiaalgegevens zijn toegankelijk voor alle relevante teams en stakeholders — niet opgesloten in één systeem of silo.',           lowAnchor: 'Data is gefragmenteerd en moeilijk te raadplegen', highAnchor: 'Materiaaldata centraal beschikbaar' },
  // CIRCULAIR ONTWERP
  { id: 'des1', dimensionId: 'design',     text: 'Onze nieuwe gebouwen en renovatieprojecten zijn expliciet ontworpen voor toekomstige demontage en materiaalterugwinning.',               lowAnchor: 'Ontwerp richt zich alleen op initiële prestaties', highAnchor: 'Ontwerp maakt toekomstig hergebruik mogelijk' },
  { id: 'des2', dimensionId: 'design',     text: 'We selecteren materialen op basis van hun recyclebaarheid en circulair potentieel — niet alleen op prijs of beschikbaarheid.',           lowAnchor: 'Kosten en beschikbaarheid bepalen de keuze',    highAnchor: 'Circulair potentieel is een kerncriterium' },
  { id: 'des3', dimensionId: 'design',     text: 'We gebruiken omkeerbare verbindingen en bouwtechnieken om toekomstige materiaalterugwinning mogelijk te maken.',                         lowAnchor: 'Vaste verbindingen zijn de standaard',          highAnchor: 'Omkeerbare technieken zijn de norm' },
  { id: 'des4', dimensionId: 'design',     text: 'Circulariteitsmetrieken maken deel uit van onze standaard projectreview en ontwerpgoedkeuringsproces.',                                  lowAnchor: 'Circulariteit is een bijzaak',                  highAnchor: 'Beoordeeld in elke projectfase' },
  // DATA-INFRASTRUCTUUR
  { id: 'dat1', dimensionId: 'data',       text: 'We gebruiken BIM-data (Building Information Modelling) systematisch in onze projecten en portfolio.',                                    lowAnchor: 'BIM wordt inconsistent of niet gebruikt',       highAnchor: 'BIM is standaard in alle projecten' },
  { id: 'dat2', dimensionId: 'data',       text: 'Materiaal- en productdata worden vastgelegd in gestructureerde, machine-leesbare formaten in plaats van pdf\'s of spreadsheets.',       lowAnchor: 'Data staat in pdf\'s en spreadsheets',          highAnchor: 'Gestructureerde, interoperabele dataformaten' },
  { id: 'dat3', dimensionId: 'data',       text: 'We hebben een centraal platform of register voor het opslaan en raadplegen van materiaalpaspoorten en productdata.',                     lowAnchor: 'Geen centrale dataopslag aanwezig',             highAnchor: 'Centraal platform in actief gebruik' },
  { id: 'dat4', dimensionId: 'data',       text: 'Onze datasystemen zijn compatibel met rapportageplatformen en externe databases zoals EPD-bibliotheken.',                                lowAnchor: 'Handmatige datavertaling nodig voor rapportage', highAnchor: 'Naadloze integratie met externe platforms' },
  // REGELGEVINGSNALEVING
  { id: 'com1', dimensionId: 'compliance', text: 'We monitoren en beheren actief onze MPG-scores (Milieuprestatie Gebouwen) door het hele portfolio.',                                    lowAnchor: 'MPG alleen berekend als het verplicht is',      highAnchor: 'MPG actief beheerd en geoptimaliseerd' },
  { id: 'com2', dimensionId: 'compliance', text: 'We kunnen documentatie produceren voor BREEAM-NL, EU-taxonomie of CSRD-rapportage zonder grote extra inspanning.',                     lowAnchor: 'Rapporten vereisen elke keer grote inspanning', highAnchor: 'Rapportage eenvoudig en systematisch' },
  { id: 'com3', dimensionId: 'compliance', text: 'Huidige en komende regelgeving is ingebed in onze projectplanning en ontwerpprocessen.',                                                 lowAnchor: 'We reageren op regelgeving als het arriveert',  highAnchor: 'Regelgeving proactief geïntegreerd' },
  { id: 'com4', dimensionId: 'compliance', text: 'We kunnen onze circulariteitsprestaties duidelijk aantonen aan investeerders, klanten en overheidsinstanties.',                          lowAnchor: 'Moeilijk om prestaties te onderbouwen',         highAnchor: 'Bewijs direct beschikbaar en geloofwaardig' },
  // FINANCIËLE WAARDERING
  { id: 'val1', dimensionId: 'value',      text: 'We beoordelen de resterende materiaalwaarde van onze assets als onderdeel van reguliere financiële planning en rapportage.',             lowAnchor: 'Restwaarde wordt niet gekwantificeerd',         highAnchor: 'Restwaarde onderdeel van financiële modellen' },
  { id: 'val2', dimensionId: 'value',      text: 'Circulaire materiaalkeuzes en ontwerp-voor-demontage zijn opgenomen in onze investeringscriteria.',                                      lowAnchor: 'Circulaire waarde niet financieel gemodelleerd', highAnchor: 'Circulaire waarde beïnvloedt investeringsbeslissingen' },
  { id: 'val3', dimensionId: 'value',      text: 'We kunnen het langetermijn financieel voordeel van omkeerbaar ontwerp ten opzichte van conventionele sloop kwantificeren.',              lowAnchor: 'Businesscase onduidelijk of niet onderbouwd',   highAnchor: 'Duidelijke, onderbouwde financiële modellen' },
  { id: 'val4', dimensionId: 'value',      text: 'Onze organisatie begrijpt het afschrijvings- en obsolescenterisico van niet-circulaire assets.',                                         lowAnchor: 'Niet-circulair risico staat niet op ons netvlies', highAnchor: 'Niet-circulair risico actief beheerd' },
  // STAKEHOLDERAFSTEMMING
  { id: 'ali1', dimensionId: 'alignment',  text: 'Onze belangrijkste leveranciers en fabrikanten verstrekken gestructureerde materiaaldata en Milieu Product Verklaringen (EPD\'s) als standaard.', lowAnchor: 'EPD-beschikbaarheid is beperkt of inconsistent', highAnchor: 'Leveranciers leveren gestructureerde data als standaard' },
  { id: 'ali2', dimensionId: 'alignment',  text: 'De architecten en aannemers waarmee we werken, begrijpen circulaire ontwerpprincipes en passen deze actief toe.',                        lowAnchor: 'Circulariteit hangt af van het individu',       highAnchor: 'Circulariteit is verankerd in onze samenwerking' },
  { id: 'ali3', dimensionId: 'alignment',  text: 'Circulariteitsdoelen en materiaaldatavereisten zijn opgenomen in onze contracten en inkoopscriteria.',                                   lowAnchor: 'Besproken maar niet contractueel vastgelegd',   highAnchor: 'Contractuele vereisten sturen circulariteit' },
  { id: 'ali4', dimensionId: 'alignment',  text: 'Leiderschap bepleit circulariteitsdoelen actief met zichtbaar budget, beslissingsbevoegdheid en verantwoordelijkheid.',                  lowAnchor: 'Circulariteit gedelegeerd aan een klein team',  highAnchor: 'Leiderschap heeft zichtbaar eigenaarschap' },
]

// ── Roles ─────────────────────────────────────────────────────────────────────

const ROLES_EN: MadasterRole[] = [
  { id: 'owner',         label: 'Real Estate Owner / Asset Manager', description: 'I own or manage built assets and am responsible for long-term value and performance.' },
  { id: 'developer',     label: 'Project Developer',                 description: 'I develop new construction or renovation projects from initiation to delivery.' },
  { id: 'architect',     label: 'Architect / Designer',              description: 'I design buildings and specify materials, structures and systems.' },
  { id: 'contractor',    label: 'Contractor / Builder',              description: 'I construct and deliver projects and manage subcontractors and material sourcing.' },
  { id: 'sustainability',label: 'Sustainability / ESG Manager',      description: 'I lead or support environmental, sustainability, and regulatory compliance initiatives.' },
]

const ROLES_NL: MadasterRole[] = [
  { id: 'owner',         label: 'Vastgoedeigenaar / Assetmanager',   description: 'Ik bezit of beheer gebouwde assets en ben verantwoordelijk voor de langetermijnwaarde en prestaties.' },
  { id: 'developer',     label: 'Projectontwikkelaar',               description: 'Ik ontwikkel nieuwe bouw- of renovatieprojecten van initiatie tot oplevering.' },
  { id: 'architect',     label: 'Architect / Ontwerper',             description: 'Ik ontwerp gebouwen en specificeer materialen, constructies en systemen.' },
  { id: 'contractor',    label: 'Aannemer / Bouwer',                 description: 'Ik bouw en lever projecten op en beheer onderaannemers en materiaalinkoop.' },
  { id: 'sustainability',label: 'Duurzaamheids-/ ESG-manager',       description: 'Ik leid of ondersteun milieu-, duurzaamheids- en regelgevingsnalevinginitiatieven.' },
]

// ── Locale accessor ───────────────────────────────────────────────────────────

export function getMadasterContent(locale: string) {
  const isNl = locale === 'nl'
  return {
    DIMENSIONS: isNl ? DIMENSIONS_NL : DIMENSIONS_EN,
    QUESTIONS:  isNl ? QUESTIONS_NL  : QUESTIONS_EN,
    ROLES:      isNl ? ROLES_NL      : ROLES_EN,
  }
}

// ── Scoring ───────────────────────────────────────────────────────────────────

export function overallScore(scores: Partial<MadasterDimScores>): number {
  const vals = Object.values(scores).filter(Boolean) as number[]
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 1
}

export function scoreColour(score: number): MadasterScoreColour {
  if (score >= 3.5) return { bg: '#398684', text: '#fff', label: 'Circular Leader',      labelNl: 'Circulaire Leider',    pastelBg: '#E6F4F4' }
  if (score >= 2.5) return { bg: '#55B4B1', text: '#fff', label: 'Circular Aware',       labelNl: 'Circulairbewust',      pastelBg: '#EDF8F8' }
  if (score >= 1.5) return { bg: '#F59E0B', text: '#fff', label: 'Compliance-Driven',    labelNl: 'Regelgedreven',        pastelBg: '#FEF3C7' }
  return               { bg: '#E05A7A', text: '#fff', label: 'Materials Blind',       labelNl: 'Materialenblind',      pastelBg: '#FDF0F3' }
}

// Legacy named exports (English defaults)
export const DIMENSIONS = DIMENSIONS_EN
export const QUESTIONS  = QUESTIONS_EN
export const ROLES      = ROLES_EN
