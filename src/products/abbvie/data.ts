// ── CLL Clinical Practice Optimiser — AbbVie ────────────────────────────────
// Non-promotional clinical practice assessment for haematologists
// Dimensions map to best-practice CLL patient management

export type AbbvieDimensionId =
  | 'identification'
  | 'biomarkers'
  | 'sequencing'
  | 'mdt'
  | 'monitoring'
  | 'sdm'

export interface AbbvieDimension {
  id: AbbvieDimensionId
  name: string
  short: string
  description: string
  icon: string
}

export interface AbbvieQuestion {
  id: string
  dimensionId: AbbvieDimensionId
  text: string
  lowAnchor: string
  highAnchor: string
}

export interface AbbvieRole {
  id: string
  label: string
  description: string
}

export type AbbvieDimScores = Record<AbbvieDimensionId, number>

export interface AbbvieScoreColour {
  bg: string
  text: string
  label: string
  labelNl: string
  pastelBg: string
}

// ── Dimensions ────────────────────────────────────────────────────────────────

const DIMENSIONS_EN: AbbvieDimension[] = [
  { id: 'identification', name: 'Patient Identification',     short: 'Identification', icon: '🔬', description: 'Are you systematically reviewing your CLL panel for patients who may qualify for — or benefit from — a treatment change?' },
  { id: 'biomarkers',     name: 'Biomarker & Molecular Testing', short: 'Biomarkers',  icon: '🧬', description: 'Is molecular profiling (IGHV, TP53, BTK/BCL2 resistance) routinely driving your treatment decisions at every line?' },
  { id: 'sequencing',     name: 'Treatment Sequencing',       short: 'Sequencing',     icon: '📋', description: 'Are your sequencing decisions for CLL aligned with current EHA/ESMO guidelines — including time-limited therapy options?' },
  { id: 'mdt',            name: 'Multidisciplinary Care',     short: 'MDT',            icon: '🏥', description: 'Are complex and high-risk CLL cases — del(17p), Richter transformation, severe comorbidities — systematically discussed in MDT?' },
  { id: 'monitoring',     name: 'Therapy Monitoring',         short: 'Monitoring',     icon: '📈', description: 'Do you have consistent protocols for TLS prevention, BTKi cardiac monitoring, MRD assessment, and targeted toxicity management?' },
  { id: 'sdm',            name: 'Shared Decision-Making',     short: 'SDM',            icon: '🤝', description: 'Are patients actively involved in choosing between continuous vs. time-limited therapy, and oral vs. IV options?' },
]

const DIMENSIONS_NL: AbbvieDimension[] = [
  { id: 'identification', name: 'Patiëntidentificatie',       short: 'Identificatie',  icon: '🔬', description: 'Beoordeelt u systematisch uw CLL-patiënten op mogelijke behandelwijziging of start van een nieuwe behandellijn?' },
  { id: 'biomarkers',     name: 'Biomarker- en Moleculair Onderzoek', short: 'Biomarkers', icon: '🧬', description: 'Stuurt moleculaire profilering (IGHV, TP53, BTK/BCL2-resistentie) routinematig uw behandelbeslissingen bij elke therapielijn?' },
  { id: 'sequencing',     name: 'Behandelsequencing',         short: 'Sequencing',     icon: '📋', description: 'Zijn uw sequencingbeslissingen voor CLL in lijn met de huidige EHA/ESMO-richtlijnen, inclusief tijdgebonden therapieopties?' },
  { id: 'mdt',            name: 'Multidisciplinaire Zorg',    short: 'MDT',            icon: '🏥', description: 'Worden complexe en hoogrisicogevallen — del(17p), Richtertransformatie, ernstige comorbiditeiten — systematisch in het MDO besproken?' },
  { id: 'monitoring',     name: 'Therapiemonitoring',         short: 'Monitoring',     icon: '📈', description: 'Beschikt u over consistente protocollen voor TLS-preventie, cardiale monitoring bij BTKi, MRD-meting en gerichte toxiciteitsbeheersing?' },
  { id: 'sdm',            name: 'Gedeelde Besluitvorming',    short: 'GDB',            icon: '🤝', description: 'Worden patiënten actief betrokken bij de keuze tussen continue versus tijdgebonden therapie, en oraal versus IV?' },
]

// ── Questions ─────────────────────────────────────────────────────────────────

const QUESTIONS_EN: AbbvieQuestion[] = [
  // PATIENT IDENTIFICATION
  { id: 'id1', dimensionId: 'identification', text: 'I systematically review all CLL patients in my practice to identify those who may be eligible for treatment initiation or change.',                     lowAnchor: 'No structured review process',              highAnchor: 'Systematic, scheduled review in place' },
  { id: 'id2', dimensionId: 'identification', text: 'I use defined criteria (e.g. iwCLL treatment indication criteria) consistently when deciding whether a watch-and-wait patient requires treatment.',    lowAnchor: 'Mainly clinical judgement',                 highAnchor: 'Consistent use of iwCLL criteria' },
  { id: 'id3', dimensionId: 'identification', text: 'I proactively identify watch-and-wait patients showing early signs of progression before they become symptomatic.',                                    lowAnchor: 'Act when symptoms arise',                   highAnchor: 'Proactive progression monitoring' },
  { id: 'id4', dimensionId: 'identification', text: 'I have a clear process for identifying relapsed/refractory CLL patients who may benefit from a next-line targeted therapy.',                          lowAnchor: 'Reactive — managed case by case',           highAnchor: 'Structured R/R identification process' },
  // BIOMARKER & MOLECULAR TESTING
  { id: 'bio1', dimensionId: 'biomarkers',    text: 'I routinely request IGHV mutation status at the time of CLL diagnosis for all eligible patients.',                                                    lowAnchor: 'Testing is inconsistent or reactive',       highAnchor: 'IGHV tested at diagnosis as standard' },
  { id: 'bio2', dimensionId: 'biomarkers',    text: 'I systematically test for TP53 mutation and del(17p) before initiating any line of therapy.',                                                         lowAnchor: 'Not always tested before treatment',        highAnchor: 'TP53/del(17p) tested before every line' },
  { id: 'bio3', dimensionId: 'biomarkers',    text: 'At relapse, I test for BTK and/or BCL2 resistance mutations before deciding on the next treatment line.',                                             lowAnchor: 'Resistance testing is inconsistent',        highAnchor: 'Resistance tested at every relapse' },
  { id: 'bio4', dimensionId: 'biomarkers',    text: 'Biomarker results actively and consistently influence my treatment decisions — not just inform the discussion.',                                       lowAnchor: 'Results noted but not always acted on',     highAnchor: 'Biomarkers systematically drive decisions' },
  // TREATMENT SEQUENCING
  { id: 'seq1', dimensionId: 'sequencing',    text: 'My first-line and subsequent treatment decisions for CLL are aligned with the current EHA Clinical Practice Guidelines.',                             lowAnchor: 'Limited familiarity with current guidelines', highAnchor: 'Fully aligned with EHA guidelines' },
  { id: 'seq2', dimensionId: 'sequencing',    text: 'I actively consider targeted therapies (BTK inhibitors, BCL2 inhibitors) as preferred options where the patient and disease profile supports it.',   lowAnchor: 'Targeted therapy considered late or rarely', highAnchor: 'Targeted therapy considered first-line' },
  { id: 'seq3', dimensionId: 'sequencing',    text: 'I am aware of — and apply — current evidence on time-limited versus continuous targeted therapy options in CLL.',                                      lowAnchor: 'Limited awareness of time-limited options', highAnchor: 'Evidence-based approach to therapy duration' },
  { id: 'seq4', dimensionId: 'sequencing',    text: 'I discuss clinical trial eligibility with appropriate CLL patients before defaulting to standard of care.',                                           lowAnchor: 'Trials rarely discussed proactively',       highAnchor: 'Trial eligibility assessed for all patients' },
  // MULTIDISCIPLINARY CARE
  { id: 'mdt1', dimensionId: 'mdt',           text: 'Complex CLL cases — including del(17p), Richter transformation, and severe comorbidities — are systematically presented at a multidisciplinary tumour board.', lowAnchor: 'MDT used mainly for very complex cases',    highAnchor: 'Structured MDT for all high-risk CLL' },
  { id: 'mdt2', dimensionId: 'mdt',           text: 'I involve or refer to specialist haematology expertise for CLL patients whose complexity exceeds my standard practice.',                               lowAnchor: 'Referral is ad hoc or delayed',             highAnchor: 'Clear referral pathways in place' },
  { id: 'mdt3', dimensionId: 'mdt',           text: 'Pharmacy, nursing, and supportive care teams are proactively integrated in the management of patients on targeted CLL therapies.',                    lowAnchor: 'Pharmacy/nursing involved reactively',      highAnchor: 'Multidisciplinary care from treatment start' },
  { id: 'mdt4', dimensionId: 'mdt',           text: 'Treatment rationale and goals are documented and communicated clearly to all team members involved in a patient\'s care.',                            lowAnchor: 'Documentation is inconsistent',             highAnchor: 'Clear, consistent documentation practice' },
  // THERAPY MONITORING
  { id: 'mon1', dimensionId: 'monitoring',    text: 'I use a structured protocol for assessing and managing tumour lysis syndrome (TLS) risk in patients starting venetoclax.',                           lowAnchor: 'TLS management is not fully protocolised',  highAnchor: 'Structured TLS protocol applied to all' },
  { id: 'mon2', dimensionId: 'monitoring',    text: 'I proactively assess and manage cardiovascular risk — including atrial fibrillation — in patients on BTK inhibitor therapy.',                        lowAnchor: 'Cardiac monitoring is reactive',            highAnchor: 'Proactive cardiac monitoring protocol' },
  { id: 'mon3', dimensionId: 'monitoring',    text: 'I apply MRD (minimal residual disease) monitoring to guide treatment decisions where current evidence supports it.',                                  lowAnchor: 'MRD not routinely used',                    highAnchor: 'MRD-guided decision-making in practice' },
  { id: 'mon4', dimensionId: 'monitoring',    text: 'I have a clear, consistent approach to managing the specific adverse events associated with targeted CLL therapies.',                                 lowAnchor: 'Adverse events managed reactively',         highAnchor: 'Proactive AE management protocols' },
  // SHARED DECISION-MAKING
  { id: 'sdm1', dimensionId: 'sdm',           text: 'Before initiating CLL therapy, I routinely discuss the goals of treatment (remission, MRD negativity, response) with each patient.',                 lowAnchor: 'Goals discussed but not systematically',    highAnchor: 'Structured goal-setting conversation' },
  { id: 'sdm2', dimensionId: 'sdm',           text: 'I present treatment options with clear, understandable explanations of the efficacy, safety, and quality-of-life implications.',                     lowAnchor: 'Information-giving is mainly one-way',      highAnchor: 'Balanced, patient-centred option discussion' },
  { id: 'sdm3', dimensionId: 'sdm',           text: 'Patient preferences — including time-limited vs. continuous therapy and oral vs. IV administration — actively influence my treatment choice.',       lowAnchor: 'Preferences acknowledged but rarely pivotal', highAnchor: 'Patient preferences drive the final choice' },
  { id: 'sdm4', dimensionId: 'sdm',           text: 'I regularly check how patients are experiencing their therapy — beyond clinical response — using structured or semi-structured conversations.',       lowAnchor: 'PROs/experience discussed at major reviews', highAnchor: 'Patient experience assessed at every visit' },
]

const QUESTIONS_NL: AbbvieQuestion[] = [
  // PATIËNTIDENTIFICATIE
  { id: 'id1', dimensionId: 'identification', text: 'Ik review systematisch alle CLL-patiënten in mijn praktijk om degenen te identificeren die in aanmerking komen voor behandelstart of -wijziging.',      lowAnchor: 'Geen gestructureerd reviewproces',           highAnchor: 'Systematische, geplande review aanwezig' },
  { id: 'id2', dimensionId: 'identification', text: 'Ik gebruik vaste criteria (bijv. iwCLL-behandelindicatiecriteria) consequent bij de beslissing of een watch-and-wait-patiënt behandeling nodig heeft.', lowAnchor: 'Voornamelijk klinisch oordeel',              highAnchor: 'Consequent gebruik van iwCLL-criteria' },
  { id: 'id3', dimensionId: 'identification', text: 'Ik identificeer proactief watch-and-wait-patiënten met vroege progressieverscijnselen, vóórdat zij symptomatisch worden.',                             lowAnchor: 'Handelen wanneer symptomen optreden',        highAnchor: 'Proactieve progressiemonitoring' },
  { id: 'id4', dimensionId: 'identification', text: 'Ik heb een duidelijk proces om R/R CLL-patiënten te identificeren die baat kunnen hebben bij een volgende lijn gerichte therapie.',                    lowAnchor: 'Reactief — per geval bekeken',               highAnchor: 'Gestructureerd R/R-identificatieproces' },
  // BIOMARKER- EN MOLECULAIR ONDERZOEK
  { id: 'bio1', dimensionId: 'biomarkers',    text: 'Ik verzoek routinematig IGHV-mutatiestatus op het moment van CLL-diagnose bij alle in aanmerking komende patiënten.',                                  lowAnchor: 'Testen is inconsistent of reactief',         highAnchor: 'IGHV standaard getest bij diagnose' },
  { id: 'bio2', dimensionId: 'biomarkers',    text: 'Ik test systematisch op TP53-mutatie en del(17p) vóór het starten van elke therapielijn.',                                                              lowAnchor: 'Niet altijd getest vóór behandeling',        highAnchor: 'TP53/del(17p) getest vóór elke lijn' },
  { id: 'bio3', dimensionId: 'biomarkers',    text: 'Bij relaps test ik op BTK- en/of BCL2-resistentiemutaties vóór de beslissing over de volgende behandellijn.',                                          lowAnchor: 'Resistentietests zijn inconsistent',         highAnchor: 'Resistentie getest bij elk relaps' },
  { id: 'bio4', dimensionId: 'biomarkers',    text: 'Biomarkerresultaten beïnvloeden mijn behandelbeslissingen actief en consequent — niet slechts ter informatie.',                                        lowAnchor: 'Resultaten genoteerd maar niet altijd gevolgd', highAnchor: 'Biomarkers sturen beslissingen systematisch' },
  // BEHANDELSEQUENCING
  { id: 'seq1', dimensionId: 'sequencing',    text: 'Mijn eerste- en vervolglijnsbehandelkeuzes voor CLL zijn in lijn met de actuele EHA Clinical Practice Guidelines.',                                    lowAnchor: 'Beperkte bekendheid met actuele richtlijnen', highAnchor: 'Volledig in lijn met EHA-richtlijnen' },
  { id: 'seq2', dimensionId: 'sequencing',    text: 'Ik overweeg gerichte therapieën (BTK-remmers, BCL2-remmers) actief als voorkeursoptie waar het patiënt- en ziekteprofiel dit ondersteunt.',            lowAnchor: 'Gerichte therapie laat of zelden overwogen',  highAnchor: 'Gerichte therapie als eerstelijnsoverweging' },
  { id: 'seq3', dimensionId: 'sequencing',    text: 'Ik ben op de hoogte van — en pas toe — het huidige bewijs voor tijdgebonden versus continue gerichte therapieopties bij CLL.',                         lowAnchor: 'Beperkte kennis van tijdgebonden opties',    highAnchor: 'Evidence-based benadering van therapieduur' },
  { id: 'seq4', dimensionId: 'sequencing',    text: 'Ik bespreek klinische trial-geschiktheid met geschikte CLL-patiënten vóór de keuze voor standaard zorg.',                                              lowAnchor: 'Trials zelden proactief besproken',          highAnchor: 'Trial-geschiktheid beoordeeld voor alle patiënten' },
  // MULTIDISCIPLINAIRE ZORG
  { id: 'mdt1', dimensionId: 'mdt',           text: 'Complexe CLL-gevallen — inclusief del(17p), Richtertransformatie en ernstige comorbiditeiten — worden systematisch in het MDO besproken.',              lowAnchor: 'MDO alleen voor zeer complexe gevallen',     highAnchor: 'Gestructureerd MDO voor alle hoog-risico CLL' },
  { id: 'mdt2', dimensionId: 'mdt',           text: 'Ik schakel gespecialiseerde hematologische expertise in of verwijs door voor CLL-patiënten wiens complexiteit mijn standaardpraktijk overstijgt.',     lowAnchor: 'Verwijzing is ad hoc of vertraagd',          highAnchor: 'Duidelijke verwijzingspaden beschikbaar' },
  { id: 'mdt3', dimensionId: 'mdt',           text: 'Apotheek, verpleging en ondersteunende zorg zijn proactief betrokken bij patiënten die gerichte CLL-therapieën ontvangen.',                            lowAnchor: 'Apotheek/verpleging reactief betrokken',     highAnchor: 'Multidisciplinaire zorg vanaf behandelstart' },
  { id: 'mdt4', dimensionId: 'mdt',           text: 'Behandelrationale en doelen worden duidelijk gedocumenteerd en gecommuniceerd aan alle betrokken teamleden.',                                           lowAnchor: 'Documentatie is inconsistent',               highAnchor: 'Heldere, consistente documentatiepraktijk' },
  // THERAPIEMONITORING
  { id: 'mon1', dimensionId: 'monitoring',    text: 'Ik gebruik een gestructureerd protocol voor het beoordelen en beheersen van tumorlysissyndroom (TLS)-risico bij patiënten die starten met venetoclax.', lowAnchor: 'TLS-management niet volledig geprotocolleerd', highAnchor: 'Gestructureerd TLS-protocol bij alle patiënten' },
  { id: 'mon2', dimensionId: 'monitoring',    text: 'Ik beoordeel en beheer cardiovasculair risico — inclusief atriumfibrilleren — proactief bij patiënten op een BTK-remmer.',                             lowAnchor: 'Cardiale monitoring is reactief',            highAnchor: 'Proactief cardiaal monitoringprotocol' },
  { id: 'mon3', dimensionId: 'monitoring',    text: 'Ik pas MRD-monitoring (minimale restziekte) toe om behandelbeslissingen te sturen waar huidig bewijs dit ondersteunt.',                                lowAnchor: 'MRD niet routinematig gebruikt',             highAnchor: 'MRD-gestuurde besluitvorming in praktijk' },
  { id: 'mon4', dimensionId: 'monitoring',    text: 'Ik heb een duidelijke, consistente aanpak voor het beheren van de specifieke bijwerkingen van gerichte CLL-therapieën.',                               lowAnchor: 'Bijwerkingen reactief beheerd',              highAnchor: 'Proactieve bijwerkingsmanagementprotocollen' },
  // GEDEELDE BESLUITVORMING
  { id: 'sdm1', dimensionId: 'sdm',           text: 'Vóór start van CLL-therapie bespreek ik routinematig de behandeldoelen (remissie, MRD-negativiteit, respons) met elke patiënt.',                       lowAnchor: 'Doelen besproken maar niet systematisch',    highAnchor: 'Gestructureerd doelstellingsgesprek' },
  { id: 'sdm2', dimensionId: 'sdm',           text: 'Ik presenteer behandelopties met heldere, begrijpelijke uitleg over werkzaamheid, veiligheid en kwaliteit-van-levenimplicaties.',                      lowAnchor: 'Informatieverstrekking is voornamelijk éénrichtingsverkeer', highAnchor: 'Evenwichtige, patiëntgerichte optiebespreking' },
  { id: 'sdm3', dimensionId: 'sdm',           text: 'Patiëntvoorkeuren — tijdgebonden vs. continu en oraal vs. IV — beïnvloeden mijn behandelkeuze actief.',                                                lowAnchor: 'Voorkeuren erkend maar zelden doorslaggevend', highAnchor: 'Patiëntvoorkeur bepaalt de uiteindelijke keuze' },
  { id: 'sdm4', dimensionId: 'sdm',           text: 'Ik vraag regelmatig hoe patiënten hun therapie ervaren — buiten klinische respons — via gestructureerde of semi-gestructureerde gesprekken.',          lowAnchor: 'PRO\'s besproken bij grote evaluaties',      highAnchor: 'Patiëntervaring bij elk consult beoordeeld' },
]

// ── Roles ─────────────────────────────────────────────────────────────────────

const ROLES_EN: AbbvieRole[] = [
  { id: 'haematologist',  label: 'Haematologist / Internist-Oncologist', description: 'I am the primary treating physician for CLL patients in my department.' },
  { id: 'fellow',         label: 'Haematology Fellow / Trainee',          description: 'I am in specialist training and manage CLL patients under supervision.' },
  { id: 'nurse',          label: 'Oncology Nurse / Nurse Practitioner',   description: 'I deliver and monitor targeted therapy and support patients day-to-day.' },
  { id: 'head',           label: 'Department Head / Clinical Lead',       description: 'I am responsible for the clinical direction and quality of haematology care in my unit.' },
]

const ROLES_NL: AbbvieRole[] = [
  { id: 'haematologist',  label: 'Hematoloog / Internist-Oncoloog',       description: 'Ik ben de primaire behandelend arts voor CLL-patiënten in mijn afdeling.' },
  { id: 'fellow',         label: 'Hematoloog in opleiding (AIOS)',         description: 'Ik volg de specialistenopleiding en behandel CLL-patiënten onder supervisie.' },
  { id: 'nurse',          label: 'Oncologieverpleegkundige / Verpleegkundig Specialist', description: 'Ik verzorg gerichte therapie en ondersteun patiënten dagelijks.' },
  { id: 'head',           label: 'Afdelingshoofd / Klinisch Leider',      description: 'Ik ben verantwoordelijk voor de klinische richting en kwaliteit van hematologische zorg in mijn unit.' },
]

// ── Locale accessor ───────────────────────────────────────────────────────────

export function getAbbvieContent(locale: string) {
  const isNl = locale === 'nl'
  return {
    DIMENSIONS: isNl ? DIMENSIONS_NL : DIMENSIONS_EN,
    QUESTIONS:  isNl ? QUESTIONS_NL  : QUESTIONS_EN,
    ROLES:      isNl ? ROLES_NL      : ROLES_EN,
  }
}

// ── Scoring ───────────────────────────────────────────────────────────────────

export function overallScore(scores: Partial<AbbvieDimScores>): number {
  const vals = Object.values(scores).filter(Boolean) as number[]
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 1
}

export function scoreColour(score: number): AbbvieScoreColour {
  if (score >= 3.5) return { bg: '#6B2D8B', text: '#fff', label: 'Best Practice Leader',  labelNl: 'Best Practice Leider',    pastelBg: '#F0E8F7' }
  if (score >= 2.5) return { bg: '#0072CE', text: '#fff', label: 'Guideline-Aligned',     labelNl: 'Richtlijnconform',         pastelBg: '#E5F3FF' }
  if (score >= 1.5) return { bg: '#F59E0B', text: '#fff', label: 'Developing Practice',   labelNl: 'Praktijk in Ontwikkeling', pastelBg: '#FEF3C7' }
  return               { bg: '#E05A7A', text: '#fff', label: 'Emerging Practice',      labelNl: 'Opkomende Praktijk',       pastelBg: '#FDF0F3' }
}

// Legacy exports
export const DIMENSIONS = DIMENSIONS_EN
export const QUESTIONS  = QUESTIONS_EN
export const ROLES      = ROLES_EN
