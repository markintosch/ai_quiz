// FILE: src/products/maritime_scan/data.ts
// ──────────────────────────────────────────────────────────────────────────────
// Maritime Compliance Readiness Scan — content + question bank.
//
// Audience: shipping-company professionals (Crew Manager / Manning / DPA /
// Compliance / Fleet Ops / C-level). Self-segmenting role-pick at intake.
//
// Languages: NL primary; EN provided. ES/FR can be added later.
// Engine pattern mirrors src/products/ai_benchmark/data.ts so existing helpers
// (scoring, aggregates, etc.) port over with minimal change.

export type Lang = 'nl' | 'en'
export const LANGS: Lang[] = ['nl', 'en']

export function pickLang(input: string | string[] | undefined | null): Lang {
  const v = Array.isArray(input) ? input[0] : input
  return v === 'en' ? 'en' : 'nl'
}

// ── Taxonomies ────────────────────────────────────────────────────────────────

export type DimensionId =
  | 'documentation'   // Crew documentation digitization
  | 'psc_readiness'   // Port state control / audit readiness
  | 'data_protection' // Cyber + data sovereignty
  | 'interop'         // Multi-flag interoperability
  | 'cycle_time'      // Crew verification & onboarding cycle-time
  | 'esg'             // Sustainability + paper-replacement

export type Dimension = {
  id:          DimensionId
  icon:        string
  name:        string
  description: string
}

// Compliance posture (replaces "archetype" framing — heavier register)
export type PostureId = 'at_risk' | 'patchwork' | 'managed' | 'connected' | 'hardened'

export type Posture = {
  id:       PostureId
  name:     string
  headline: string  // shown as the H1 on the result page
  body:     string  // 2-3 lines under the H1
  scoreMax: number  // top of the band (inclusive)
}

// Cohort / role-pick at intake
export type Role = 'crew_manning' | 'compliance_dpa' | 'fleet_ops' | 'leadership'

export type RoleDef = {
  id:          Role
  name:        string
  jobTitles:   string  // example titles for self-recognition
  hint:        string  // one-liner that confirms "yes, this is me"
}

// ── Question types ────────────────────────────────────────────────────────────

export type QuestionType = 'single_select' | 'multiselect'

export type Option = {
  id:     string
  label:  string
  weight?: number  // 0..100; used for scoring single_select; max-of-selected for multiselect
}

export type Question = {
  id:        string
  type:      QuestionType
  dimension: DimensionId
  text:      string
  hint?:     string
  options:   Option[]
  // If set, this question only renders for these roles. If omitted, universal.
  roles?:    Role[]
}

// ── Per-language content ──────────────────────────────────────────────────────

export type LangContent = {
  // Nav
  navName:    string
  navTagline: string

  // Hero
  heroBadge:    string
  heroH1a:      string
  heroH1b:      string
  heroIntro:    string
  heroSub:      string
  heroCta1:     string
  trustLine:    string

  // Trust / why this exists
  whyLabel:    string
  whyHeadline: string
  whyBody:     string

  // Roles section
  rolesLabel:    string
  rolesHeadline: string
  rolesSub:      string

  // Footer
  footerLine: string
  reportLine: string
  privacyLink: string

  // Start (intro form)
  startBadge:           string
  startH1:              string
  startBody:            string
  startNameLabel:       string
  startEmailLabel:      string
  startEmailHint:       string
  startRoleLabel:       string
  startVesselTypeLabel: string
  startFleetSizeLabel:  string
  startRegionLabel:     string
  startFlagCountLabel:  string
  startConsentLabel:    string
  startSubmitCta:       string
  startProgress:        string  // template "Vraag {current} van {total}"

  // Results page
  resultsBadge:         string
  resultsScoreLbl:      string
  resultsPostureLbl:    string
  resultsDimsTitle:     string
  resultsDimsHeadline:  string
  resultsCtaLowEyebrow:  string
  resultsCtaLowHeading:  string
  resultsCtaLowBody:     string
  resultsCtaLowButton:   string
  resultsCtaMidEyebrow:  string
  resultsCtaMidHeading:  string
  resultsCtaMidBody:     string
  resultsCtaMidButton:   string
  resultsCtaHighEyebrow: string
  resultsCtaHighHeading: string
  resultsCtaHighBody:    string
  resultsCtaHighButton:  string
  resultsBackLink:       string

  // Vessel-type / fleet-size / region / flag-count options (intake form)
  VESSEL_TYPES: { id: string; label: string }[]
  FLEET_SIZES:  { id: string; label: string }[]
  REGIONS:      { id: string; label: string }[]
  FLAG_COUNTS:  { id: string; label: string }[]

  // Taxonomies (translated)
  ROLES:      RoleDef[]
  DIMENSIONS: Dimension[]
  POSTURES:   Posture[]
}

// ────────────────────────────────────────────────────────────────────────────
// NL — primary language
// ────────────────────────────────────────────────────────────────────────────

const NL: LangContent = {
  navName:    'Maritime Compliance Scan',
  navTagline: 'voor shipping companies',

  heroBadge:  'Onafhankelijke scan · Anoniem · 6 minuten',
  heroH1a:    'Hoe audit-ready is je',
  heroH1b:    'crew-documentatie écht?',
  heroIntro:  'Een scherpe diagnose van waar je vandaag exposure hebt: PSC-inspecties, cert-renewals, multi-flag operations, en waar persoonlijke crew-data nu rondzwerft.',
  heroSub:    'Geen marketing-vragenlijst. Antwoorden in operationele werkelijkheid: uren, incidenten, jurisdicties.',
  heroCta1:   'Start de scan →',
  trustLine:  'Je antwoorden zijn vertrouwelijk. Geen sales-mail tenzij je daar expliciet voor kiest.',

  whyLabel:    'Waarom deze scan',
  whyHeadline: 'Compliance is geen boekenkast. Het is een operatie.',
  whyBody:     'De meeste shipping co\'s ontdekken hun gaten pas op het moment dat het misgaat: een PSC-detentie, een verlopen STCW endorsement, een gelekte paspoort-scan. Deze scan brengt vooraf in kaart waar de operationele werkelijkheid afwijkt van wat op papier in orde is.',

  rolesLabel:    'Voor wie',
  rolesHeadline: 'Vier rollen herkennen zich het sterkst.',
  rolesSub:      'Bij de start kies je je rol. De vragen passen zich aan op wat jij dagelijks ziet — niet op wat in een ISM-handboek hoort.',

  footerLine: 'Maritime Compliance Scan · gehost door Mark de Kock',
  reportLine: 'Resultaten geanonimiseerd. Individuele antwoorden niet zichtbaar voor derden.',
  privacyLink: 'Privacybeleid',

  startBadge:           'Stap 1 · Achtergrond',
  startH1:              'Vertel kort wie je bent.',
  startBody:            'Vier velden. Daarna direct door naar de scan. Geen account nodig.',
  startNameLabel:       'Je naam',
  startEmailLabel:      'E-mail',
  startEmailHint:       'We sturen je de uitslag. Geen marketing tenzij je dat expliciet aanvinkt.',
  startRoleLabel:       'Welke rol past het beste bij jou?',
  startVesselTypeLabel: 'Belangrijkste vessel type',
  startFleetSizeLabel:  'Vlootgrootte',
  startRegionLabel:     'Hoofd operating region',
  startFlagCountLabel:  'Onder hoeveel flag states opereert je vloot?',
  startConsentLabel:    'Ik ga akkoord dat mijn (geanonimiseerde) antwoorden meetellen in geaggregeerde benchmarks.',
  startSubmitCta:       'Start de scan →',
  startProgress:        'Vraag {current} van {total}',

  resultsBadge:         'Resultaat',
  resultsScoreLbl:      'Compliance score',
  resultsPostureLbl:    'Compliance posture',
  resultsDimsTitle:     'Per dimensie',
  resultsDimsHeadline:  'Waar zit je sterk, waar zit de exposure.',
  resultsCtaLowEyebrow:  'Volgende stap',
  resultsCtaLowHeading:  'Je opereert op vertrouwen, niet op verificatie.',
  resultsCtaLowBody:     '30 minuten. We mappen samen waar de drie grootste exposures zitten en wat per gat de snelste mitigatie is.',
  resultsCtaLowButton:   'Plan een compliance-gap call →',
  resultsCtaMidEyebrow:  'Volgende stap',
  resultsCtaMidHeading:  'Je bent in control. Maar de volgende stap is niet meer optioneel.',
  resultsCtaMidBody:     'In 90 dagen bewijzen op één vessel: digitale crew-identity, cryptografisch ondertekende certs, real-time PSC-readiness.',
  resultsCtaMidButton:   'Bespreek een 90-dagen pilot →',
  resultsCtaHighEyebrow: 'Volgende stap',
  resultsCtaHighHeading: 'Je voldoet ruim. Tijd om er een differentiator van te maken.',
  resultsCtaHighBody:    'Multi-flag interoperabiliteit als competitive advantage. Charterers en class societies belonen het. Je crew ook.',
  resultsCtaHighButton:  'Plan een interoperabiliteits-sessie →',
  resultsBackLink:       '← Terug naar de scan',

  VESSEL_TYPES: [
    { id: 'tanker',       label: 'Tanker (oil / chemical / LNG)' },
    { id: 'container',    label: 'Container / ro-ro' },
    { id: 'offshore',     label: 'Offshore (O&G, OSV)' },
    { id: 'ferry_cruise', label: 'Ferry / cruise / passenger' },
    { id: 'bulk',         label: 'Dry bulk' },
    { id: 'mixed',        label: 'Gemengde vloot' },
  ],
  FLEET_SIZES: [
    { id: '1_4',      label: '1 — 4 schepen' },
    { id: '5_20',     label: '5 — 20 schepen' },
    { id: '21_50',    label: '21 — 50 schepen' },
    { id: '51_150',   label: '51 — 150 schepen' },
    { id: '150_plus', label: '150+ schepen' },
  ],
  REGIONS: [
    { id: 'nw_europe',     label: 'Noord/West-Europa (NL, NO, DK, DE, UK)' },
    { id: 'greek_cypriot', label: 'Grieks/Cypriotisch cluster' },
    { id: 'singapore_uae', label: 'Singapore / UAE / Midden-Oosten' },
    { id: 'americas',      label: 'Noord/Zuid-Amerika' },
    { id: 'asia_other',    label: 'Overig Azië' },
    { id: 'global',        label: 'Wereldwijd verspreid' },
  ],
  FLAG_COUNTS: [
    { id: '1',          label: '1 — alles onder één flag' },
    { id: '2_3',        label: '2 — 3 flags' },
    { id: '4_7',        label: '4 — 7 flags' },
    { id: '8_plus',     label: '8 of meer flags' },
    { id: 'flag_state', label: 'Wij ZIJN een flag state / port authority' },
  ],

  ROLES: [
    { id: 'crew_manning', name: 'Crew & Manning',
      jobTitles: 'Crew Manager · Manning Director · Crewing Coordinator · Crew Operations',
      hint: 'Verantwoordelijk voor wie aan boord komt, met welke certs, op welk schip.' },
    { id: 'compliance_dpa', name: 'Compliance & DPA',
      jobTitles: 'Designated Person Ashore · Compliance Officer · ISM Manager · QHSE',
      hint: 'Accountable voor ISM Code, audit-trail, vetting regimes.' },
    { id: 'fleet_ops', name: 'Fleet Operations',
      jobTitles: 'Fleet Manager · Technical Superintendent · Operations Manager · Marine Superintendent',
      hint: 'Vessel-side: port-call efficiency, vessel certs, technical compliance.' },
    { id: 'leadership', name: 'Leadership',
      jobTitles: 'CEO · COO · MD · Director · Owner',
      hint: 'Strategisch zicht: cyber, ESG, fleet-wide risk, capital-allocation.' },
  ],

  DIMENSIONS: [
    { id: 'documentation',
      icon: '📄',
      name: 'Crew documentation',
      description: 'Hoe digitaal, centraal en machine-verifieerbaar zijn je crew-docs?' },
    { id: 'psc_readiness',
      icon: '🛂',
      name: 'PSC & audit readiness',
      description: 'Hoe snel kun je tijdens een inspectie de juiste documenten overleggen?' },
    { id: 'data_protection',
      icon: '🔒',
      name: 'Data protection',
      description: 'Waar leeft persoonlijke crew-data en hoe veilig is het?' },
    { id: 'interop',
      icon: '🌍',
      name: 'Multi-flag interoperability',
      description: 'Friction bij multi-flag operations en cross-jurisdiction recognition.' },
    { id: 'cycle_time',
      icon: '⏱',
      name: 'Verification cycle-time',
      description: 'Time-to-board, cert-renewal, en hoeveel daarvan is automated.' },
    { id: 'esg',
      icon: '🌱',
      name: 'ESG & paper replacement',
      description: 'Paper-volume, CO2-impact, CSRD-readiness van je crew-administratie.' },
  ],

  POSTURES: [
    { id: 'at_risk', name: 'At-risk', scoreMax: 29,
      headline: 'Je opereert op vertrouwen, niet op verificatie.',
      body:     'De meeste van je crew-documentatie leeft buiten één gecontroleerd systeem. Eén PSC-detentie, één gelekte paspoort-scan, of één verlopen cert die niemand zag, kan een vessel-detentie of multi-mil verzekeringsclaim opleveren.' },
    { id: 'patchwork', name: 'Patchwork', scoreMax: 49,
      headline: 'Het werkt — totdat het misgaat.',
      body:     'Je hebt onderdelen op orde, maar de keten heeft gaten. Crew weet vaak hoe het hoort; maar als één persoon ziek is, of één manning agent vertraagt, valt de operatie terug op e-mail en WhatsApp. Dat is precies waar de toezichthouder doorheen prikt.' },
    { id: 'managed', name: 'Managed', scoreMax: 69,
      headline: 'Je bent in control. Maar de volgende stap is niet meer optioneel.',
      body:     'Je systemen werken voor de meeste cases. De vraag is of je voorbereid bent op wat charterers en flag states de komende 24 maanden vragen: cryptografisch ondertekende records, real-time vessel/crew status, automatische cross-flag recognition.' },
    { id: 'connected', name: 'Connected', scoreMax: 84,
      headline: 'Je voldoet ruim. Tijd om er een differentiator van te maken.',
      body:     'Je crew-administratie is gedigitaliseerd, gecentraliseerd en grotendeels geautomatiseerd. De volgende winst zit niet in mitigatie maar in commerciële differentiatie: charterers, P&I clubs en talent kiezen voor operators die dit kunnen aantonen.' },
    { id: 'hardened', name: 'Hardened', scoreMax: 100,
      headline: 'Je bent waar de industrie over 5 jaar wil zijn.',
      body:     'Volledig digitale, cryptografisch ondertekende, multi-flag-interoperabele crew- en vessel-administratie. Vraag is alleen nog: hoe maak je hier een referentie van die je marktpositie versterkt?' },
  ],
}

// ────────────────────────────────────────────────────────────────────────────
// EN — translation pass. Idiomatic, not literal.
// ────────────────────────────────────────────────────────────────────────────

const EN: LangContent = {
  navName:    'Maritime Compliance Scan',
  navTagline: 'for shipping companies',

  heroBadge:  'Independent scan · Anonymous · 6 minutes',
  heroH1a:    'How audit-ready is your',
  heroH1b:    'crew documentation, really?',
  heroIntro:  'A sharp diagnosis of where you have exposure today: PSC inspections, cert renewals, multi-flag operations, and where personal crew data currently lives.',
  heroSub:    'Not a marketing questionnaire. Answers in operational reality: hours, incidents, jurisdictions.',
  heroCta1:   'Start the scan →',
  trustLine:  'Your answers are confidential. No sales mail unless you explicitly opt in.',

  whyLabel:    'Why this scan',
  whyHeadline: 'Compliance is not a binder. It is an operation.',
  whyBody:     "Most shipping companies discover their gaps only when something goes wrong: a PSC detention, an expired STCW endorsement, a leaked passport scan. This scan maps where operational reality drifts from what's on paper, before it bites.",

  rolesLabel:    'Who this is for',
  rolesHeadline: 'Four roles recognise themselves most.',
  rolesSub:      "At the start you pick your role. The questions adapt to what you actually see day-to-day — not to what an ISM manual prescribes.",

  footerLine: 'Maritime Compliance Scan · hosted by Mark de Kock',
  reportLine: 'Results anonymised. Individual answers not visible to third parties.',
  privacyLink: 'Privacy policy',

  startBadge:           'Step 1 · Background',
  startH1:              'Tell us briefly who you are.',
  startBody:            'Four fields. Then straight into the scan. No account required.',
  startNameLabel:       'Your name',
  startEmailLabel:      'Email',
  startEmailHint:       "We'll send you the result. No marketing unless you explicitly opt in.",
  startRoleLabel:       'Which role best fits you?',
  startVesselTypeLabel: 'Primary vessel type',
  startFleetSizeLabel:  'Fleet size',
  startRegionLabel:     'Main operating region',
  startFlagCountLabel:  'How many flag states do you operate under?',
  startConsentLabel:    'I agree that my (anonymised) answers may contribute to aggregated benchmarks.',
  startSubmitCta:       'Start the scan →',
  startProgress:        'Question {current} of {total}',

  resultsBadge:         'Result',
  resultsScoreLbl:      'Compliance score',
  resultsPostureLbl:    'Compliance posture',
  resultsDimsTitle:     'By dimension',
  resultsDimsHeadline:  'Where you stand strong, where the exposure is.',
  resultsCtaLowEyebrow:  'Next step',
  resultsCtaLowHeading:  'You operate on trust, not on verification.',
  resultsCtaLowBody:     'Thirty minutes. We map your three biggest exposures together, and what the fastest mitigation is for each.',
  resultsCtaLowButton:   'Book a compliance-gap call →',
  resultsCtaMidEyebrow:  'Next step',
  resultsCtaMidHeading:  "You're in control. But the next step is no longer optional.",
  resultsCtaMidBody:     'Prove it on one vessel in 90 days: digital crew identity, cryptographically signed certs, real-time PSC readiness.',
  resultsCtaMidButton:   'Discuss a 90-day pilot →',
  resultsCtaHighEyebrow: 'Next step',
  resultsCtaHighHeading: "You comfortably comply. Time to turn it into a differentiator.",
  resultsCtaHighBody:    'Multi-flag interoperability as competitive advantage. Charterers and class societies reward it. Your crew too.',
  resultsCtaHighButton:  'Book an interoperability session →',
  resultsBackLink:       '← Back to the scan',

  VESSEL_TYPES: [
    { id: 'tanker',       label: 'Tanker (oil / chemical / LNG)' },
    { id: 'container',    label: 'Container / ro-ro' },
    { id: 'offshore',     label: 'Offshore (O&G, OSV)' },
    { id: 'ferry_cruise', label: 'Ferry / cruise / passenger' },
    { id: 'bulk',         label: 'Dry bulk' },
    { id: 'mixed',        label: 'Mixed fleet' },
  ],
  FLEET_SIZES: [
    { id: '1_4',      label: '1 — 4 vessels' },
    { id: '5_20',     label: '5 — 20 vessels' },
    { id: '21_50',    label: '21 — 50 vessels' },
    { id: '51_150',   label: '51 — 150 vessels' },
    { id: '150_plus', label: '150+ vessels' },
  ],
  REGIONS: [
    { id: 'nw_europe',     label: 'Northern / Western Europe (NL, NO, DK, DE, UK)' },
    { id: 'greek_cypriot', label: 'Greek / Cypriot cluster' },
    { id: 'singapore_uae', label: 'Singapore / UAE / Middle East' },
    { id: 'americas',      label: 'North / South America' },
    { id: 'asia_other',    label: 'Other Asia' },
    { id: 'global',        label: 'Globally distributed' },
  ],
  FLAG_COUNTS: [
    { id: '1',          label: '1 — single flag' },
    { id: '2_3',        label: '2 — 3 flags' },
    { id: '4_7',        label: '4 — 7 flags' },
    { id: '8_plus',     label: '8 or more flags' },
    { id: 'flag_state', label: 'We ARE a flag state / port authority' },
  ],

  ROLES: [
    { id: 'crew_manning', name: 'Crew & Manning',
      jobTitles: 'Crew Manager · Manning Director · Crewing Coordinator · Crew Operations',
      hint: 'Responsible for who comes on board, with which certs, on which vessel.' },
    { id: 'compliance_dpa', name: 'Compliance & DPA',
      jobTitles: 'Designated Person Ashore · Compliance Officer · ISM Manager · QHSE',
      hint: 'Accountable for ISM Code, audit trail, vetting regimes.' },
    { id: 'fleet_ops', name: 'Fleet Operations',
      jobTitles: 'Fleet Manager · Technical Superintendent · Operations Manager · Marine Superintendent',
      hint: 'Vessel-side: port-call efficiency, vessel certs, technical compliance.' },
    { id: 'leadership', name: 'Leadership',
      jobTitles: 'CEO · COO · MD · Director · Owner',
      hint: 'Strategic view: cyber, ESG, fleet-wide risk, capital allocation.' },
  ],

  DIMENSIONS: [
    { id: 'documentation',
      icon: '📄',
      name: 'Crew documentation',
      description: 'How digital, central and machine-verifiable are your crew docs?' },
    { id: 'psc_readiness',
      icon: '🛂',
      name: 'PSC & audit readiness',
      description: 'How fast can you produce the right documents during inspection?' },
    { id: 'data_protection',
      icon: '🔒',
      name: 'Data protection',
      description: 'Where personal crew data lives and how secure it is.' },
    { id: 'interop',
      icon: '🌍',
      name: 'Multi-flag interoperability',
      description: 'Friction in multi-flag operations and cross-jurisdiction recognition.' },
    { id: 'cycle_time',
      icon: '⏱',
      name: 'Verification cycle-time',
      description: 'Time-to-board, cert renewal, and how much of it is automated.' },
    { id: 'esg',
      icon: '🌱',
      name: 'ESG & paper replacement',
      description: 'Paper volume, CO2 impact, CSRD readiness of crew administration.' },
  ],

  POSTURES: [
    { id: 'at_risk', name: 'At-risk', scoreMax: 29,
      headline: 'You operate on trust, not on verification.',
      body:     'Most of your crew documentation lives outside one controlled system. One PSC detention, one leaked passport scan, or one expired cert no one noticed, can mean a vessel detention or a multi-million insurance claim.' },
    { id: 'patchwork', name: 'Patchwork', scoreMax: 49,
      headline: 'It works — until it does not.',
      body:     'You have parts in order, but the chain has gaps. Crew often know what should happen; but when one person is ill or one manning agent is delayed, the operation falls back on email and WhatsApp. That is exactly where regulators see through.' },
    { id: 'managed', name: 'Managed', scoreMax: 69,
      headline: "You're in control. But the next step is no longer optional.",
      body:     'Your systems work for most cases. The question is whether you are ready for what charterers and flag states will require over the next 24 months: cryptographically signed records, real-time vessel/crew status, automatic cross-flag recognition.' },
    { id: 'connected', name: 'Connected', scoreMax: 84,
      headline: 'You comfortably comply. Time to turn it into a differentiator.',
      body:     'Your crew administration is digitised, centralised and largely automated. The next gain is not mitigation but commercial differentiation: charterers, P&I clubs and talent choose operators who can prove this.' },
    { id: 'hardened', name: 'Hardened', scoreMax: 100,
      headline: 'You are where the industry wants to be in five years.',
      body:     'Fully digital, cryptographically signed, multi-flag-interoperable crew and vessel administration. The only remaining question is how to turn this into a reference that strengthens your market position.' },
  ],
}

// ────────────────────────────────────────────────────────────────────────────
// CONTENT lookup
// ────────────────────────────────────────────────────────────────────────────

export const CONTENT: Record<Lang, LangContent> = { nl: NL, en: EN }

export function getContent(lang: Lang): LangContent {
  return CONTENT[lang] ?? NL
}

// ════════════════════════════════════════════════════════════════════════════
// Question bank
// ════════════════════════════════════════════════════════════════════════════
//
// Per question:
//   - Stated in operational reality (hours, incidents, jurisdictions), not
//     ISM jargon.
//   - Single-select unless otherwise noted.
//   - Options ordered weakest → strongest. Weight is the score (0..100) the
//     option contributes when picked.
//   - For multiselect: highest-weight selected option counts (max-of-selected).
//
// Roles:
//   - omitted   → universal, all roles answer
//   - roles:[…] → only renders when the picked role is in the list
//
// All copy currently NL. EN bank below.

const Q_NL: Question[] = [
  // ── Q1 — universal — documentation
  {
    id: 'q1', type: 'single_select', dimension: 'documentation',
    text: 'Waar leven de geldige certificaten van je crew vandaag de dag voornamelijk?',
    options: [
      { id: 'paper',     label: 'Papieren originelen aan boord en in een kantoorarchief',                            weight: 0  },
      { id: 'pdf_drive', label: "PDF's in shared drives + e-mail",                                                    weight: 25 },
      { id: 'cms_attach',label: 'Een crew-management systeem (Adonis, OCI, MCT) — maar docs nog losse bijlagen',     weight: 50 },
      { id: 'central',   label: 'Centraal digitaal systeem mét gestructureerde cert-data',                            weight: 75 },
      { id: 'signed',    label: 'Cryptografisch ondertekend, machine-verifieerbaar door derden',                      weight: 100 },
    ],
  },
  // ── Q2 — universal — psc_readiness (the embarrassment hook)
  {
    id: 'q2', type: 'single_select', dimension: 'psc_readiness',
    text: 'Stel: morgen om 06:00 stapt PSC aan boord en vraagt naar de Engineer\'s STCW endorsement van een crew member die gisteren is geboard. Hoe lang duurt het voordat je het document kunt overleggen?',
    options: [
      { id: 'unknown',  label: 'Onbekend / het is in het verleden misgegaan',                                  weight: 0   },
      { id: 'half_day', label: 'Halve dag, hangt van tijdzone HQ af',                                          weight: 25  },
      { id: 'hour',     label: 'Binnen het uur via e-mail/telefoon naar HQ',                                   weight: 50  },
      { id: 'minutes',  label: 'Binnen 15 minuten via remote walorganisatie',                                  weight: 75  },
      { id: 'instant',  label: 'Onmiddellijk, app-beschikbaar voor Master en walorganisatie',                  weight: 100 },
    ],
  },
  // ── Q3 — universal — data_protection (THE embarrassment question)
  {
    id: 'q3', type: 'multiselect', dimension: 'data_protection',
    text: 'In welke kanalen circuleren scans van crew-paspoorten en certificaten op dit moment? Selecteer wat van toepassing is.',
    hint: 'Eerlijk antwoord telt — anoniem.',
    options: [
      { id: 'whatsapp',    label: 'WhatsApp / Signal / Telegram met manning agents',     weight: 0   },
      { id: 'email',       label: 'E-mail bijlagen',                                     weight: 0   },
      { id: 'shared_drive',label: 'Onbeveiligde shared drives (SharePoint, Dropbox)',   weight: 25  },
      { id: 'cms_secure',  label: 'In een afgeschermd crew-management systeem',          weight: 75  },
      { id: 'e2e',         label: 'Alleen via een end-to-end versleuteld systeem',       weight: 100 },
    ],
  },
  // ── Q4 — universal — interop
  {
    id: 'q4', type: 'single_select', dimension: 'interop',
    text: 'Hoe vaak ontstaat er friction omdat een cert die geldig is onder de ene flag, niet automatisch door een andere flag wordt geaccepteerd?',
    options: [
      { id: 'weekly',   label: 'Wekelijks of vaker',                                weight: 0   },
      { id: 'monthly',  label: 'Maandelijks, vooral bij flag-switch of vetting',    weight: 25  },
      { id: 'quarter',  label: 'Een paar keer per kwartaal',                        weight: 50  },
      { id: 'rare',     label: 'Zelden — onze processen vangen het meestal op',     weight: 75  },
      { id: 'never',    label: 'Nooit — alles loopt via een interoperabel systeem', weight: 100 },
    ],
  },
  // ── Q5 — universal — cycle_time
  {
    id: 'q5', type: 'single_select', dimension: 'cycle_time',
    text: 'Hoe lang duurt het gemiddeld vanaf "offer accepted" tot een Engineer met geverifieerde docs aan boord stapt?',
    options: [
      { id: 'over30', label: '30+ dagen',                  weight: 0   },
      { id: 'd14_30', label: '14 — 30 dagen',              weight: 25  },
      { id: 'd7_14',  label: '7 — 14 dagen',               weight: 50  },
      { id: 'd3_7',   label: '3 — 7 dagen',                weight: 75  },
      { id: 'd0_3',   label: '0 — 3 dagen',                weight: 100 },
    ],
  },
  // ── Q6 — universal — esg
  {
    id: 'q6', type: 'single_select', dimension: 'esg',
    text: 'Hoeveel papieren logbooks (alle types samen) genereert je vloot per jaar — schatting?',
    hint: 'Eén logbook ≈ 4,3 kg CO2.',
    options: [
      { id: 'unknown', label: 'Geen idee',         weight: 0   },
      { id: 'over2k',  label: '2.000+',            weight: 25  },
      { id: 'k500_2k', label: '500 — 2.000',       weight: 50  },
      { id: 'h100_500',label: '100 — 500',         weight: 75  },
      { id: 'under100',label: 'Onder de 100',      weight: 100 },
    ],
  },
  // ── Q7 — universal — psc_readiness — vessel-doc side
  {
    id: 'q7', type: 'single_select', dimension: 'psc_readiness',
    text: 'Hoeveel PSC-detenties of major-deficiencies hebben jullie de afgelopen 24 maanden gehad?',
    options: [
      { id: 'three_plus', label: '3 of meer',                weight: 0   },
      { id: 'two',        label: '2',                        weight: 25  },
      { id: 'one',        label: '1',                        weight: 50  },
      { id: 'zero_minor', label: '0 — wel minor findings',   weight: 75  },
      { id: 'zero_clean', label: '0 — schoon',               weight: 100 },
    ],
  },
  // ── Q8 — universal — documentation
  {
    id: 'q8', type: 'single_select', dimension: 'documentation',
    text: 'Hoe verifieer je vandaag of een door een manning agent aangeleverd certificaat echt is?',
    options: [
      { id: 'trust',     label: 'We vertrouwen op de manning agent',                                weight: 0   },
      { id: 'visual',    label: 'Visuele check tegen een sample / vorige scan',                     weight: 25  },
      { id: 'callback',  label: 'Bellen / mailen met issuing authority bij twijfel',                weight: 50  },
      { id: 'platform',  label: 'Cross-check via een trusted-source platform',                      weight: 75  },
      { id: 'crypto',    label: 'Cryptografische verificatie (NFC chip, signed credential)',        weight: 100 },
    ],
  },
  // ── Q9 — universal — cycle_time
  {
    id: 'q9', type: 'single_select', dimension: 'cycle_time',
    text: 'Welk percentage van cert-renewals wordt nu via een geautomatiseerd workflow getriggerd (alert → renewal → upload → verify)?',
    options: [
      { id: 'manual',  label: 'Volledig handmatig — we plannen het in spreadsheets',  weight: 0   },
      { id: 'lt25',    label: 'Onder de 25%',                                          weight: 25  },
      { id: '25_50',   label: '25 — 50%',                                              weight: 50  },
      { id: '50_80',   label: '50 — 80%',                                              weight: 75  },
      { id: 'over80',  label: 'Meer dan 80% volledig geautomatiseerd',                 weight: 100 },
    ],
  },
  // ── Q10 — universal — interop
  {
    id: 'q10', type: 'single_select', dimension: 'interop',
    text: 'Als je morgen één vessel naar een andere flag wil overzetten — hoeveel weken kost dat aan crew-side documentatie?',
    options: [
      { id: 'over12',  label: '12+ weken — en pijnlijk',           weight: 0   },
      { id: 'w8_12',   label: '8 — 12 weken',                       weight: 25  },
      { id: 'w4_8',    label: '4 — 8 weken',                        weight: 50  },
      { id: 'w2_4',    label: '2 — 4 weken',                        weight: 75  },
      { id: 'under2',  label: 'Onder de 2 weken — meest digitaal',  weight: 100 },
    ],
  },
  // ── Q11 — universal — data_protection
  {
    id: 'q11', type: 'single_select', dimension: 'data_protection',
    text: 'Welke jurisdictie(s) regelen waar de persoonlijke data van je crew opgeslagen mag worden?',
    options: [
      { id: 'unknown',  label: 'Daar hebben we eigenlijk geen scherp beeld van',                       weight: 0   },
      { id: 'eu_only',  label: 'EU GDPR — alleen daarop ingericht',                                    weight: 25  },
      { id: 'multiple', label: 'Meerdere regimes (EU + UK + ander land), case-by-case',                weight: 50  },
      { id: 'mapped',   label: 'Per crew-nationaliteit gemapped tegen het juiste regime',              weight: 75  },
      { id: 'controlled',label: 'Volledig controllable per crew-id, per regime, met audit-trail',       weight: 100 },
    ],
  },

  // ── Q12 — Crew & Manning specific
  {
    id: 'q12_crew', type: 'single_select', dimension: 'cycle_time', roles: ['crew_manning'],
    text: 'Hoeveel tijd per week ben je kwijt aan handmatig nazoeken / chasen van ontbrekende of verlopen crew-documenten?',
    options: [
      { id: 'over15',  label: '15+ uur',                 weight: 0   },
      { id: 'h8_15',   label: '8 — 15 uur',              weight: 25  },
      { id: 'h3_8',    label: '3 — 8 uur',               weight: 50  },
      { id: 'h1_3',    label: '1 — 3 uur',               weight: 75  },
      { id: 'under1',  label: 'Onder het uur',           weight: 100 },
    ],
  },

  // ── Q12 — Compliance & DPA specific
  {
    id: 'q12_dpa', type: 'single_select', dimension: 'psc_readiness', roles: ['compliance_dpa'],
    text: 'Bij een interne ISM-audit van vandaag: welk percentage van je cert-records zou direct, machine-leesbaar, met audit-trail beschikbaar zijn?',
    options: [
      { id: 'lt25',   label: 'Onder de 25%',              weight: 0   },
      { id: 'p25_50', label: '25 — 50%',                  weight: 25  },
      { id: 'p50_75', label: '50 — 75%',                  weight: 50  },
      { id: 'p75_95', label: '75 — 95%',                  weight: 75  },
      { id: 'over95', label: '95% of meer',               weight: 100 },
    ],
  },

  // ── Q12 — Fleet Ops specific
  {
    id: 'q12_ops', type: 'single_select', dimension: 'documentation', roles: ['fleet_ops'],
    text: 'Hoeveel verschillende systemen moet je raadplegen om voor één vessel een volledig crew + cert + statutory-cert overzicht te krijgen?',
    options: [
      { id: 'six_plus', label: '6 of meer — verspreid over kantoor, vessel, manning agents', weight: 0   },
      { id: 'four_five',label: '4 — 5 systemen',                                              weight: 25  },
      { id: 'two_three',label: '2 — 3 systemen',                                              weight: 50  },
      { id: 'one_view', label: 'Eén systeem, alle bronnen geïntegreerd',                      weight: 75  },
      { id: 'realtime', label: 'Eén realtime view, ook voor vessel zelf',                     weight: 100 },
    ],
  },

  // ── Q12 — Leadership specific
  {
    id: 'q12_lead', type: 'single_select', dimension: 'data_protection', roles: ['leadership'],
    text: 'Wat zou een succesvolle ransomware-aanval op je crew-administratie vandaag betekenen voor je operatie?',
    options: [
      { id: 'catastrophic', label: 'Catastrofaal — operatie zou dagen tot weken stilliggen',         weight: 0   },
      { id: 'severe',       label: 'Ernstig — verzekering dekt deels, reputational damage groot',    weight: 25  },
      { id: 'manageable',   label: 'Hanteerbaar — we hebben back-ups, maar herstel kost tijd',       weight: 50  },
      { id: 'limited',      label: 'Beperkt — DR-plan getest, snel herstel mogelijk',                weight: 75  },
      { id: 'minimal',      label: 'Minimaal — zero-trust architectuur, gedistribueerde records',    weight: 100 },
    ],
  },

  // ── Q13 — universal — esg
  {
    id: 'q13', type: 'single_select', dimension: 'esg',
    text: 'Welke ESG-rapportageverplichtingen raken jouw crew-administratie de komende 24 maanden direct?',
    options: [
      { id: 'unaware',  label: 'Daar hebben we ons nog niet in verdiept',          weight: 0   },
      { id: 'csrd',     label: 'CSRD — we weten dát het komt, niet hoe',           weight: 25  },
      { id: 'mapped',   label: 'CSRD én sector-specifieke regimes geïdentificeerd',weight: 50  },
      { id: 'plan',     label: 'Compliance-roadmap loopt, deadlines gehaald',       weight: 75  },
      { id: 'lead',     label: 'We rapporteren al beyond compliance',                weight: 100 },
    ],
  },
  // ── Q14 — universal — interop
  {
    id: 'q14', type: 'single_select', dimension: 'interop',
    text: 'Welk percentage van je manning komt via externe agencies vs in-house?',
    hint: 'Hoge externe afhankelijkheid betekent meer document-friction.',
    options: [
      { id: 'all_ext',   label: '90%+ extern — volledig agency-driven',          weight: 0   },
      { id: 'mostly_ext',label: '60 — 90% extern',                                weight: 25  },
      { id: 'mixed',     label: '40 — 60% extern',                                weight: 50  },
      { id: 'mostly_in', label: 'Voornamelijk in-house, agencies voor piek',     weight: 75  },
      { id: 'all_in',    label: '100% in-house manning',                          weight: 100 },
    ],
  },
  // ── Q15 — universal — psc_readiness — culture check
  {
    id: 'q15', type: 'single_select', dimension: 'psc_readiness',
    text: 'Hoe ervaart je crew aan boord het huidige documentatie-proces?',
    hint: 'Crew turnover en welbevinden hangen hier mee samen.',
    options: [
      { id: 'painful',  label: 'Pijnlijk — klagen er actief over',                  weight: 0   },
      { id: 'tedious',  label: 'Tijdrovend, accepteren het als noodzakelijk kwaad', weight: 25  },
      { id: 'okay',     label: 'Werkt, geen actief gemopper',                        weight: 50  },
      { id: 'smooth',   label: 'Soepel, ze hebben er weinig last van',               weight: 75  },
      { id: 'asset',    label: 'Asset — ze prefereren het boven concurrenten',      weight: 100 },
    ],
  },
]

// EN question bank — same IDs, mirror weights, idiomatic text.
const Q_EN: Question[] = [
  { id: 'q1', type: 'single_select', dimension: 'documentation',
    text: 'Where do your crew\'s valid certificates primarily live today?',
    options: [
      { id: 'paper',     label: 'Paper originals on board and in an office archive',                          weight: 0   },
      { id: 'pdf_drive', label: 'PDFs in shared drives + email',                                              weight: 25  },
      { id: 'cms_attach',label: 'A crew-management system (Adonis, OCI, MCT) — but docs as loose attachments',weight: 50  },
      { id: 'central',   label: 'Central digital system with structured cert data',                           weight: 75  },
      { id: 'signed',    label: 'Cryptographically signed, machine-verifiable by third parties',              weight: 100 },
    ],
  },
  { id: 'q2', type: 'single_select', dimension: 'psc_readiness',
    text: "Tomorrow at 06:00 PSC boards and asks for the Engineer's STCW endorsement of a crew member who joined yesterday. How long until you can produce the document?",
    options: [
      { id: 'unknown',  label: 'Unknown / it has gone wrong before',                       weight: 0   },
      { id: 'half_day', label: 'Half a day, depending on HQ time zone',                    weight: 25  },
      { id: 'hour',     label: 'Within an hour, by phoning HQ',                            weight: 50  },
      { id: 'minutes',  label: 'Within 15 minutes via remote shore organisation',          weight: 75  },
      { id: 'instant',  label: 'Instantly, app-available for Master and shore',            weight: 100 },
    ],
  },
  { id: 'q3', type: 'multiselect', dimension: 'data_protection',
    text: 'Through which channels do scans of crew passports and certificates currently move? Pick all that apply.',
    hint: 'Honest answers count — anonymous.',
    options: [
      { id: 'whatsapp',    label: 'WhatsApp / Signal / Telegram with manning agents',  weight: 0   },
      { id: 'email',       label: 'Email attachments',                                  weight: 0   },
      { id: 'shared_drive',label: 'Unsecured shared drives (SharePoint, Dropbox)',     weight: 25  },
      { id: 'cms_secure',  label: 'Within a secured crew-management system',           weight: 75  },
      { id: 'e2e',         label: 'Only via an end-to-end encrypted system',           weight: 100 },
    ],
  },
  { id: 'q4', type: 'single_select', dimension: 'interop',
    text: 'How often does friction arise because a cert valid under one flag is not automatically accepted by another?',
    options: [
      { id: 'weekly',  label: 'Weekly or more often',                                  weight: 0   },
      { id: 'monthly', label: 'Monthly, especially during flag switch or vetting',     weight: 25  },
      { id: 'quarter', label: 'A few times per quarter',                               weight: 50  },
      { id: 'rare',    label: 'Rarely — our processes usually catch it',               weight: 75  },
      { id: 'never',   label: 'Never — everything runs through an interop system',     weight: 100 },
    ],
  },
  { id: 'q5', type: 'single_select', dimension: 'cycle_time',
    text: "On average, how long from \"offer accepted\" until an Engineer with verified docs steps on board?",
    options: [
      { id: 'over30', label: '30+ days',           weight: 0   },
      { id: 'd14_30', label: '14 — 30 days',       weight: 25  },
      { id: 'd7_14',  label: '7 — 14 days',        weight: 50  },
      { id: 'd3_7',   label: '3 — 7 days',         weight: 75  },
      { id: 'd0_3',   label: '0 — 3 days',         weight: 100 },
    ],
  },
  { id: 'q6', type: 'single_select', dimension: 'esg',
    text: 'Roughly how many paper logbooks (all types together) does your fleet generate per year?',
    hint: 'One logbook ≈ 4.3 kg CO2.',
    options: [
      { id: 'unknown',  label: 'No idea',          weight: 0   },
      { id: 'over2k',   label: '2,000+',           weight: 25  },
      { id: 'k500_2k',  label: '500 — 2,000',      weight: 50  },
      { id: 'h100_500', label: '100 — 500',        weight: 75  },
      { id: 'under100', label: 'Under 100',        weight: 100 },
    ],
  },
  { id: 'q7', type: 'single_select', dimension: 'psc_readiness',
    text: 'How many PSC detentions or major deficiencies have you had in the past 24 months?',
    options: [
      { id: 'three_plus', label: '3 or more',                  weight: 0   },
      { id: 'two',        label: '2',                          weight: 25  },
      { id: 'one',        label: '1',                          weight: 50  },
      { id: 'zero_minor', label: '0 — but with minor findings',weight: 75  },
      { id: 'zero_clean', label: '0 — clean',                  weight: 100 },
    ],
  },
  { id: 'q8', type: 'single_select', dimension: 'documentation',
    text: 'How do you verify today whether a certificate supplied by a manning agent is genuine?',
    options: [
      { id: 'trust',    label: 'We trust the manning agent',                                  weight: 0   },
      { id: 'visual',   label: 'Visual check against a sample / previous scan',               weight: 25  },
      { id: 'callback', label: 'Phone or email the issuing authority when in doubt',          weight: 50  },
      { id: 'platform', label: 'Cross-check via a trusted-source platform',                   weight: 75  },
      { id: 'crypto',   label: 'Cryptographic verification (NFC chip, signed credential)',    weight: 100 },
    ],
  },
  { id: 'q9', type: 'single_select', dimension: 'cycle_time',
    text: 'What share of cert renewals is currently triggered by an automated workflow (alert → renewal → upload → verify)?',
    options: [
      { id: 'manual',  label: 'Fully manual — we track in spreadsheets',  weight: 0   },
      { id: 'lt25',    label: 'Under 25%',                                weight: 25  },
      { id: '25_50',   label: '25 — 50%',                                 weight: 50  },
      { id: '50_80',   label: '50 — 80%',                                 weight: 75  },
      { id: 'over80',  label: 'Over 80% fully automated',                 weight: 100 },
    ],
  },
  { id: 'q10', type: 'single_select', dimension: 'interop',
    text: 'If you wanted to move one vessel to a different flag tomorrow — how many weeks of crew-side documentation work would that cost?',
    options: [
      { id: 'over12',  label: '12+ weeks — and painful',                weight: 0   },
      { id: 'w8_12',   label: '8 — 12 weeks',                           weight: 25  },
      { id: 'w4_8',    label: '4 — 8 weeks',                            weight: 50  },
      { id: 'w2_4',    label: '2 — 4 weeks',                            weight: 75  },
      { id: 'under2',  label: 'Under 2 weeks — mostly digital',         weight: 100 },
    ],
  },
  { id: 'q11', type: 'single_select', dimension: 'data_protection',
    text: 'Which jurisdictions govern where your crew\'s personal data may be stored?',
    options: [
      { id: 'unknown',   label: "We don't have a sharp picture of that",                          weight: 0   },
      { id: 'eu_only',   label: 'EU GDPR — set up only for that',                                 weight: 25  },
      { id: 'multiple',  label: 'Multiple regimes (EU + UK + others), case by case',              weight: 50  },
      { id: 'mapped',    label: 'Mapped per crew nationality against the right regime',           weight: 75  },
      { id: 'controlled',label: 'Fully controllable per crew ID, per regime, with audit trail',   weight: 100 },
    ],
  },
  { id: 'q12_crew', type: 'single_select', dimension: 'cycle_time', roles: ['crew_manning'],
    text: 'How many hours per week do you spend manually chasing missing or expired crew documents?',
    options: [
      { id: 'over15',  label: '15+ hours',         weight: 0   },
      { id: 'h8_15',   label: '8 — 15 hours',      weight: 25  },
      { id: 'h3_8',    label: '3 — 8 hours',       weight: 50  },
      { id: 'h1_3',    label: '1 — 3 hours',       weight: 75  },
      { id: 'under1',  label: 'Under one hour',    weight: 100 },
    ],
  },
  { id: 'q12_dpa', type: 'single_select', dimension: 'psc_readiness', roles: ['compliance_dpa'],
    text: 'In an internal ISM audit today: what share of your cert records would be instantly, machine-readable, with audit trail?',
    options: [
      { id: 'lt25',   label: 'Under 25%',          weight: 0   },
      { id: 'p25_50', label: '25 — 50%',           weight: 25  },
      { id: 'p50_75', label: '50 — 75%',           weight: 50  },
      { id: 'p75_95', label: '75 — 95%',           weight: 75  },
      { id: 'over95', label: '95% or more',        weight: 100 },
    ],
  },
  { id: 'q12_ops', type: 'single_select', dimension: 'documentation', roles: ['fleet_ops'],
    text: 'How many separate systems do you have to consult to get a complete crew + cert + statutory-cert overview for one vessel?',
    options: [
      { id: 'six_plus', label: '6 or more — across office, vessel, manning agents', weight: 0   },
      { id: 'four_five',label: '4 — 5 systems',                                      weight: 25  },
      { id: 'two_three',label: '2 — 3 systems',                                      weight: 50  },
      { id: 'one_view', label: 'One system, all sources integrated',                 weight: 75  },
      { id: 'realtime', label: 'One real-time view, also for the vessel itself',     weight: 100 },
    ],
  },
  { id: 'q12_lead', type: 'single_select', dimension: 'data_protection', roles: ['leadership'],
    text: 'What would a successful ransomware attack on your crew administration mean for your operation today?',
    options: [
      { id: 'catastrophic', label: 'Catastrophic — operations down for days to weeks',               weight: 0   },
      { id: 'severe',       label: 'Severe — insurance partially covers, big reputational damage',  weight: 25  },
      { id: 'manageable',   label: 'Manageable — we have backups but recovery takes time',          weight: 50  },
      { id: 'limited',      label: 'Limited — DR plan tested, fast recovery possible',              weight: 75  },
      { id: 'minimal',      label: 'Minimal — zero-trust architecture, distributed records',        weight: 100 },
    ],
  },
  { id: 'q13', type: 'single_select', dimension: 'esg',
    text: 'Which ESG reporting obligations directly touch your crew administration in the next 24 months?',
    options: [
      { id: 'unaware',  label: "We haven't looked into it yet",                       weight: 0   },
      { id: 'csrd',     label: "CSRD — we know it's coming, not how",                 weight: 25  },
      { id: 'mapped',   label: 'CSRD plus sector-specific regimes identified',        weight: 50  },
      { id: 'plan',     label: 'Compliance roadmap running, hitting deadlines',       weight: 75  },
      { id: 'lead',     label: "We're already reporting beyond compliance",           weight: 100 },
    ],
  },
  { id: 'q14', type: 'single_select', dimension: 'interop',
    text: 'What share of your manning comes through external agencies vs in-house?',
    hint: 'Higher external dependency means more document friction.',
    options: [
      { id: 'all_ext',   label: '90%+ external — fully agency-driven',          weight: 0   },
      { id: 'mostly_ext',label: '60 — 90% external',                            weight: 25  },
      { id: 'mixed',     label: '40 — 60% external',                            weight: 50  },
      { id: 'mostly_in', label: 'Mostly in-house, agencies for peak demand',    weight: 75  },
      { id: 'all_in',    label: '100% in-house manning',                        weight: 100 },
    ],
  },
  { id: 'q15', type: 'single_select', dimension: 'psc_readiness',
    text: 'How does your crew on board experience the current documentation process?',
    hint: 'Crew turnover and wellbeing are tied to this.',
    options: [
      { id: 'painful',  label: 'Painful — they actively complain about it',     weight: 0   },
      { id: 'tedious',  label: 'Tedious, accepted as a necessary evil',         weight: 25  },
      { id: 'okay',     label: 'Works, no active complaints',                   weight: 50  },
      { id: 'smooth',   label: 'Smooth, they barely notice it',                 weight: 75  },
      { id: 'asset',    label: 'An asset — they prefer it over competitors',    weight: 100 },
    ],
  },
]

// ── Public accessor ─────────────────────────────────────────────────────────
// Returns the question set for the picked role, in the requested language.
// Universal questions (no `roles` field) are always included; role-specific
// ones only when the role matches.

export function getQuestions(role: Role, lang: Lang = 'nl'): Question[] {
  const bank = lang === 'en' ? Q_EN : Q_NL
  return bank.filter(q => !q.roles || q.roles.includes(role))
}
