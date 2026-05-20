/**
 * HCSS Cyber Compass — vragenset.
 *
 * 22 vragen verspreid over 7 dimensies + meta. Skip-logic op organisation_size
 * (NIS2-vragen alleen voor 51+ medewerkers).
 *
 * Ontworpen voor MKB decision-makers (geen IT-jargon).
 */

import type { Lang } from './i18n'

export type Stage = '1-10' | '11-50' | '51-250' | '251-1000' | '1000+'

export type Dimension =
  | 'meta'
  | 'iam'
  | 'awareness'
  | 'data'
  | 'endpoint'
  | 'backup'
  | 'compliance'
  | 'supply_chain'

export type QuestionKind = 'single' | 'multi' | 'likert' | 'text'

type I18nMap = Record<Lang, string>

export interface RawOption {
  value:  string
  labels: I18nMap
  score?: number
}

export interface RawQuestion {
  code:        string
  dimension:   Dimension
  kind:        QuestionKind
  prompts:     I18nMap
  helps?:      I18nMap
  scale?:      number
  best?:       number
  options?:    RawOption[]
  showIfStage?: Stage[]
  contextOnly?: boolean
  required?:   boolean
}

export interface LocalizedOption {
  value: string
  label: string
  score?: number
}

export interface LocalizedQuestion {
  code:        string
  dimension:   Dimension
  kind:        QuestionKind
  prompt:      string
  help?:       string
  scale?:      number
  best?:       number
  options?:    LocalizedOption[]
  showIfStage?: Stage[]
  contextOnly?: boolean
  required?:   boolean
}

// Backwards-compat alias
export type CompassQuestion = LocalizedQuestion

// ──────────────────────────────────────────────────────────────────────────
// Q0: Stage — organisation size (bepaalt skip-logic)
// ──────────────────────────────────────────────────────────────────────────
export const STAGE_QUESTION_RAW: RawQuestion = {
  code: 'organisation_size', dimension: 'meta', kind: 'single', required: true,
  prompts: {
    nl: 'Hoeveel medewerkers heeft je organisatie?',
    en: 'How many employees does your organisation have?',
  },
  helps: {
    nl: 'Bepaalt welke vragen we je verder stellen — sommige (zoals NIS2) zijn alleen relevant boven een bepaalde grootte.',
    en: 'Determines which questions we ask next — some (like NIS2) only apply above a certain size.',
  },
  options: [
    { value: '1-10',     labels: { nl: '1 – 10 medewerkers',      en: '1 – 10 employees' } },
    { value: '11-50',    labels: { nl: '11 – 50 medewerkers',     en: '11 – 50 employees' } },
    { value: '51-250',   labels: { nl: '51 – 250 medewerkers',    en: '51 – 250 employees' } },
    { value: '251-1000', labels: { nl: '251 – 1.000 medewerkers', en: '251 – 1,000 employees' } },
    { value: '1000+',    labels: { nl: 'Meer dan 1.000',          en: 'More than 1,000' } },
  ],
}

// ──────────────────────────────────────────────────────────────────────────
// META vragen — geen score, wel context
// ──────────────────────────────────────────────────────────────────────────
const ROLE: RawQuestion = {
  code: 'role', dimension: 'meta', kind: 'single', required: true, contextOnly: true,
  prompts: {
    nl: 'Wat is jouw rol in de organisatie?',
    en: 'What is your role in the organisation?',
  },
  options: [
    { value: 'owner',        labels: { nl: 'Eigenaar / directeur', en: 'Owner / director' } },
    { value: 'manager',      labels: { nl: 'Manager / MT-lid',     en: 'Manager / MT member' } },
    { value: 'it_manager',   labels: { nl: 'IT-manager',           en: 'IT manager' } },
    { value: 'officer',      labels: { nl: 'Security / privacy officer', en: 'Security / privacy officer' } },
    { value: 'employee',     labels: { nl: 'Medewerker',           en: 'Employee' } },
    { value: 'other',        labels: { nl: 'Anders',                en: 'Other' } },
  ],
}

const SECTOR: RawQuestion = {
  code: 'sector', dimension: 'meta', kind: 'single', required: true, contextOnly: true,
  prompts: {
    nl: 'In welke sector zit je organisatie?',
    en: 'Which sector is your organisation in?',
  },
  options: [
    { value: 'finance',      labels: { nl: 'Financiële dienstverlening', en: 'Financial services' } },
    { value: 'healthcare',   labels: { nl: 'Zorg & welzijn',              en: 'Healthcare' } },
    { value: 'industry',     labels: { nl: 'Industrie & maakindustrie',   en: 'Industry & manufacturing' } },
    { value: 'retail',       labels: { nl: 'Retail & e-commerce',          en: 'Retail & e-commerce' } },
    { value: 'tech',         labels: { nl: 'IT & software',                 en: 'IT & software' } },
    { value: 'logistics',    labels: { nl: 'Transport & logistiek',         en: 'Transport & logistics' } },
    { value: 'professional', labels: { nl: 'Zakelijke dienstverlening',     en: 'Professional services' } },
    { value: 'government',   labels: { nl: 'Overheid & semi-overheid',      en: 'Government & semi-public' } },
    { value: 'nonprofit',    labels: { nl: 'Goede doelen / non-profit',     en: 'Charity / non-profit' } },
    { value: 'education',    labels: { nl: 'Onderwijs',                     en: 'Education' } },
    { value: 'hospitality',  labels: { nl: 'Horeca & toerisme',             en: 'Hospitality & tourism' } },
    { value: 'other',        labels: { nl: 'Anders',                        en: 'Other' } },
  ],
}

// ──────────────────────────────────────────────────────────────────────────
// IAM (4 vragen)
// ──────────────────────────────────────────────────────────────────────────
const Q_MFA: RawQuestion = {
  code: 'mfa_coverage', dimension: 'iam', kind: 'single', required: true,
  prompts: { nl: 'Hoeveel medewerkers gebruiken multi-factor authenticatie (MFA) op hun zakelijke accounts?', en: 'What share of employees uses MFA on business accounts?' },
  options: [
    { value: 'all',     labels: { nl: 'Iedereen, op alle systemen',      en: 'Everyone, on all systems' },     score: 100 },
    { value: 'most',    labels: { nl: 'Iedereen op kritieke systemen',   en: 'Everyone on critical systems' },  score: 75  },
    { value: 'admins',  labels: { nl: 'Alleen administrators',            en: 'Only administrators' },           score: 40  },
    { value: 'some',    labels: { nl: 'Sommigen, niet structureel',      en: 'Some, not structural' },          score: 20  },
    { value: 'none',    labels: { nl: 'Niemand of weet ik niet',          en: 'No one or unsure' },               score: 0   },
  ],
}

const Q_OFFBOARDING: RawQuestion = {
  code: 'offboarding_process', dimension: 'iam', kind: 'single', required: true,
  prompts: { nl: 'Wat gebeurt er met accounts en toegangsrechten als iemand de organisatie verlaat?', en: 'What happens to accounts and access rights when someone leaves?' },
  options: [
    { value: 'documented_24h', labels: { nl: 'Gedocumenteerd proces, alles binnen 24u uitgeschakeld', en: 'Documented process, all disabled within 24h' }, score: 100 },
    { value: 'standard_week',  labels: { nl: 'Standaard binnen een week',                            en: 'Standard within a week' },                       score: 70  },
    { value: 'ad_hoc',         labels: { nl: 'Ad hoc, hangt van wie het oppakt',                      en: 'Ad hoc, depends on who handles it' },             score: 35  },
    { value: 'lingering',      labels: { nl: 'Vergeten — accounts blijven vaak hangen',               en: 'Forgotten — accounts often linger' },             score: 0   },
  ],
}

const Q_PASSWORD: RawQuestion = {
  code: 'password_policy', dimension: 'iam', kind: 'likert', scale: 5, best: 5, required: true,
  prompts: { nl: 'Hoe sterk is jullie wachtwoordbeleid in de praktijk?', en: 'How strong is your password policy in practice?' },
  helps:   { nl: '1 = wachtwoorden in spreadsheets, hergebruik · 5 = password manager + complexe + unieke wachtwoorden', en: '1 = passwords in spreadsheets, reuse · 5 = password manager + complex unique passwords' },
}

const Q_VENDOR_ACCESS: RawQuestion = {
  code: 'vendor_access', dimension: 'iam', kind: 'single', required: true,
  prompts: { nl: 'Hoe beheer je toegang van externe leveranciers tot je systemen?', en: 'How do you manage external vendor access to your systems?' },
  options: [
    { value: 'time_limited', labels: { nl: 'Tijdgebonden accounts met MFA, gelogd', en: 'Time-limited accounts with MFA, logged' }, score: 100 },
    { value: 'separate',     labels: { nl: 'Aparte accounts per leverancier',         en: 'Separate accounts per vendor' },           score: 70  },
    { value: 'shared',       labels: { nl: 'Gedeelde accounts of via medewerkers',    en: 'Shared accounts or via employees' },        score: 25  },
    { value: 'none',         labels: { nl: 'Geen externe leveranciers / weet ik niet',en: 'No external vendors / not sure' },          score: 50  },
  ],
}

// ──────────────────────────────────────────────────────────────────────────
// Awareness (3 vragen)
// ──────────────────────────────────────────────────────────────────────────
const Q_TRAINING: RawQuestion = {
  code: 'security_training_freq', dimension: 'awareness', kind: 'single', required: true,
  prompts: { nl: 'Hoe vaak krijgt je team security-awareness training?', en: 'How often does your team get security awareness training?' },
  options: [
    { value: 'monthly',    labels: { nl: 'Maandelijks (kort + gerichte phishing-tests)', en: 'Monthly (short + targeted phishing tests)' }, score: 100 },
    { value: 'quarterly',  labels: { nl: 'Per kwartaal',                                  en: 'Quarterly' },                                  score: 80  },
    { value: 'annual',     labels: { nl: 'Eens per jaar',                                  en: 'Annually' },                                   score: 50  },
    { value: 'onboarding', labels: { nl: 'Alleen bij indiensttreding',                     en: 'Only on onboarding' },                         score: 25  },
    { value: 'never',      labels: { nl: 'Niet of zelden',                                  en: 'Rarely or never' },                            score: 0   },
  ],
}

const Q_REPORT_CULTURE: RawQuestion = {
  code: 'report_culture', dimension: 'awareness', kind: 'likert', scale: 5, best: 5, required: true,
  prompts: { nl: 'Hoe makkelijk is het voor een medewerker om een verdacht mailtje te melden?', en: 'How easy is it for an employee to report a suspicious email?' },
  helps:   { nl: '1 = niemand weet waar of voelt zich vrij · 5 = 1-klik knop, snelle bevestiging, geen gezichtsverlies', en: '1 = nobody knows where or feels free · 5 = 1-click button, quick confirmation, no shame' },
}

const Q_PHISHING_TEST: RawQuestion = {
  code: 'phishing_test_history', dimension: 'awareness', kind: 'single', required: true,
  prompts: { nl: 'Wanneer hebben jullie voor het laatst een gecontroleerde phishing-test gedaan?', en: 'When did you last run a controlled phishing test?' },
  options: [
    { value: 'last_3m',    labels: { nl: 'Afgelopen 3 maanden',         en: 'Past 3 months' },     score: 100 },
    { value: 'last_year',  labels: { nl: 'Afgelopen jaar',               en: 'Past year' },          score: 70  },
    { value: 'over_year',  labels: { nl: 'Langer dan een jaar geleden',  en: 'Over a year ago' },    score: 30  },
    { value: 'never',      labels: { nl: 'Nooit',                        en: 'Never' },              score: 0   },
  ],
}

// ──────────────────────────────────────────────────────────────────────────
// Data (3 vragen)
// ──────────────────────────────────────────────────────────────────────────
const Q_DATA_LOCATION: RawQuestion = {
  code: 'data_mapping_state', dimension: 'data', kind: 'single', required: true,
  prompts: { nl: 'Weet je waar persoonsgegevens van klanten en medewerkers leven?', en: 'Do you know where customer and employee personal data lives?' },
  options: [
    { value: 'mapped',     labels: { nl: 'Volledig in kaart, recent gecheckt',     en: 'Fully mapped, recently checked' },         score: 100 },
    { value: 'partial',    labels: { nl: 'Op de hoofdsystemen wel, randzaken niet',en: 'Main systems yes, peripheral no' },        score: 60  },
    { value: 'guessing',   labels: { nl: 'Weet het ongeveer maar niet zeker',      en: 'Roughly, but not certain' },                score: 30  },
    { value: 'unclear',    labels: { nl: 'Geen idee — leeft op meerdere plekken',  en: 'No idea — lives in many places' },          score: 0   },
  ],
}

const Q_AVG: RawQuestion = {
  code: 'gdpr_awareness', dimension: 'data', kind: 'likert', scale: 5, best: 5, required: true,
  prompts: { nl: 'Hoe goed weet je wat de AVG van jullie verwacht?', en: 'How well do you know what GDPR expects from you?' },
  helps:   { nl: '1 = geen idee · 5 = wij voldoen aantoonbaar (verwerkingsregister, DPA\'s, retentie)', en: '1 = no idea · 5 = we are demonstrably compliant (processing register, DPAs, retention)' },
}

const Q_RETENTION: RawQuestion = {
  code: 'data_retention', dimension: 'data', kind: 'single', required: true,
  prompts: { nl: 'Heb je een retentie-beleid voor data (hoe lang bewaren, wanneer wissen)?', en: 'Do you have a data retention policy (how long to keep, when to delete)?' },
  options: [
    { value: 'enforced',   labels: { nl: 'Beleid + auto-delete in tools waar mogelijk',  en: 'Policy + auto-delete in tools where possible' }, score: 100 },
    { value: 'documented', labels: { nl: 'Wel een beleid, niet altijd nageleefd',         en: 'Policy exists, not always enforced' },           score: 60  },
    { value: 'informal',   labels: { nl: 'Informeel — we gooien af en toe iets weg',      en: 'Informal — we delete things occasionally' },     score: 25  },
    { value: 'none',       labels: { nl: 'Geen beleid, alles blijft staan',                en: 'No policy, everything stays' },                  score: 0   },
  ],
}

// ──────────────────────────────────────────────────────────────────────────
// Endpoint (3 vragen)
// ──────────────────────────────────────────────────────────────────────────
const Q_PATCHING: RawQuestion = {
  code: 'patch_management', dimension: 'endpoint', kind: 'single', required: true,
  prompts: { nl: 'Hoe regelen jullie OS- en software-updates op laptops en telefoons?', en: 'How do you handle OS and software updates on laptops and phones?' },
  options: [
    { value: 'auto_managed', labels: { nl: 'Automatisch via MDM, gemonitord',     en: 'Automatic via MDM, monitored' },         score: 100 },
    { value: 'auto_user',    labels: { nl: 'Automatisch, gebruiker beslist wanneer',en: 'Automatic, user decides when' },         score: 65  },
    { value: 'reminder',     labels: { nl: 'We sturen reminders, geen handhaving',  en: 'We send reminders, no enforcement' },     score: 30  },
    { value: 'unclear',      labels: { nl: 'Onduidelijk wie verantwoordelijk is',   en: 'Unclear who is responsible' },             score: 0   },
  ],
}

const Q_ENDPOINT_PROTECTION: RawQuestion = {
  code: 'endpoint_protection', dimension: 'endpoint', kind: 'single', required: true,
  prompts: { nl: 'Welke endpoint-bescherming staat er op jullie laptops?', en: 'What endpoint protection is installed on your laptops?' },
  options: [
    { value: 'edr_managed', labels: { nl: 'Modern EDR (Defender, CrowdStrike, SentinelOne) centraal beheerd', en: 'Modern EDR (Defender, CrowdStrike, SentinelOne) centrally managed' }, score: 100 },
    { value: 'edr_local',   labels: { nl: 'EDR maar niet centraal beheerd',                                   en: 'EDR but not centrally managed' },                                     score: 75  },
    { value: 'av',          labels: { nl: 'Klassieke antivirus',                                              en: 'Classic antivirus' },                                                  score: 40  },
    { value: 'os_only',     labels: { nl: 'Alleen OS-bescherming (Windows Defender free)',                   en: 'OS protection only (Windows Defender free)' },                          score: 25  },
    { value: 'none',        labels: { nl: 'Geen of weet ik niet',                                              en: 'None or unsure' },                                                     score: 0   },
  ],
}

const Q_REMOTE_ACCESS: RawQuestion = {
  code: 'remote_access', dimension: 'endpoint', kind: 'single', required: true,
  prompts: { nl: 'Hoe verbinden medewerkers vanuit huis met bedrijfssystemen?', en: 'How do employees connect to business systems from home?' },
  options: [
    { value: 'zero_trust', labels: { nl: 'Zero Trust / SASE — per-app authenticatie',  en: 'Zero Trust / SASE — per-app authentication' }, score: 100 },
    { value: 'vpn_mfa',    labels: { nl: 'VPN met MFA',                                  en: 'VPN with MFA' },                              score: 80  },
    { value: 'vpn',        labels: { nl: 'VPN zonder MFA',                                en: 'VPN without MFA' },                            score: 40  },
    { value: 'direct',     labels: { nl: 'Rechtstreeks via internet (RDP / web-portal)',  en: 'Directly via internet (RDP / web portal)' },   score: 15  },
    { value: 'cloud_only', labels: { nl: 'Alles in de cloud, geen interne systemen',     en: 'Everything in cloud, no internal systems' },   score: 75  },
  ],
}

// ──────────────────────────────────────────────────────────────────────────
// Backup (3 vragen)
// ──────────────────────────────────────────────────────────────────────────
const Q_BACKUP_FREQ: RawQuestion = {
  code: 'backup_frequency', dimension: 'backup', kind: 'single', required: true,
  prompts: { nl: 'Hoe vaak worden jullie kritieke systemen gebackupt?', en: 'How often are your critical systems backed up?' },
  options: [
    { value: 'continuous',labels: { nl: 'Continu / per uur',                en: 'Continuous / hourly' },        score: 100 },
    { value: 'daily',     labels: { nl: 'Dagelijks',                         en: 'Daily' },                       score: 80  },
    { value: 'weekly',    labels: { nl: 'Wekelijks',                         en: 'Weekly' },                      score: 40  },
    { value: 'monthly',   labels: { nl: 'Maandelijks of minder',              en: 'Monthly or less' },             score: 15  },
    { value: 'unclear',   labels: { nl: 'Onduidelijk of weet ik niet',        en: 'Unclear or unsure' },           score: 0   },
  ],
}

const Q_BACKUP_TEST: RawQuestion = {
  code: 'backup_restore_tested', dimension: 'backup', kind: 'single', required: true,
  prompts: { nl: 'Wanneer is voor het laatst een restore-test gedaan?', en: 'When was the last restore test performed?' },
  helps:   { nl: 'Niet alleen of je het kunt downloaden — wel of de inhoud daadwerkelijk bruikbaar is.', en: 'Not just whether you can download it — but whether the content is actually usable.' },
  options: [
    { value: 'last_quarter',labels: { nl: 'Afgelopen kwartaal',          en: 'Past quarter' },             score: 100 },
    { value: 'last_year',   labels: { nl: 'Afgelopen jaar',               en: 'Past year' },                 score: 70  },
    { value: 'over_year',   labels: { nl: 'Langer dan een jaar geleden',  en: 'Over a year ago' },           score: 30  },
    { value: 'never',       labels: { nl: 'Nooit',                         en: 'Never' },                    score: 0   },
  ],
}

const Q_RANSOMWARE: RawQuestion = {
  code: 'ransomware_playbook', dimension: 'backup', kind: 'single', required: true,
  prompts: { nl: 'Heb je een draaiboek voor het moment dat ransomware toeslaat?', en: 'Do you have a playbook for when ransomware strikes?' },
  options: [
    { value: 'tested',      labels: { nl: 'Ja, getest in tabletop-oefening',  en: 'Yes, tested in tabletop exercise' }, score: 100 },
    { value: 'documented',  labels: { nl: 'Ja, op papier maar niet getest',    en: 'Yes, on paper but not tested' },     score: 60  },
    { value: 'partial',     labels: { nl: 'Wel een idee, niet uitgewerkt',     en: 'Some idea, not detailed' },           score: 25  },
    { value: 'none',        labels: { nl: 'Nee — we zien wel als het gebeurt', en: 'No — we will see when it happens' },  score: 0   },
  ],
}

// ──────────────────────────────────────────────────────────────────────────
// Compliance (2-3 vragen, NIS2 alleen voor 51+)
// ──────────────────────────────────────────────────────────────────────────
const Q_NIS2: RawQuestion = {
  code: 'nis2_status', dimension: 'compliance', kind: 'single', required: true,
  showIfStage: ['51-250', '251-1000', '1000+'],
  prompts: { nl: 'Wat is jullie status op NIS2 (Europese cyber-richtlijn die sinds oktober 2024 geldt)?', en: 'What is your NIS2 status (EU cyber directive in force since October 2024)?' },
  options: [
    { value: 'not_in_scope',  labels: { nl: 'Wij vallen er niet onder (formeel gecheckt)',  en: 'We are not in scope (formally checked)' },     score: 100 },
    { value: 'compliant',     labels: { nl: 'In scope, voldoen aantoonbaar',                en: 'In scope, demonstrably compliant' },             score: 100 },
    { value: 'in_progress',   labels: { nl: 'In scope, traject loopt',                       en: 'In scope, trajectory in progress' },              score: 65  },
    { value: 'in_scope_undone',labels: { nl: 'In scope, maar nog geen plan',                  en: 'In scope, but no plan yet' },                     score: 20  },
    { value: 'unsure',        labels: { nl: 'Weet niet of we eronder vallen',                 en: 'Unsure if we are in scope' },                      score: 5   },
  ],
}

const Q_ISO: RawQuestion = {
  code: 'iso27001_status', dimension: 'compliance', kind: 'single', required: true,
  prompts: { nl: 'Hoe staan jullie tegenover ISO 27001 of een vergelijkbaar framework?', en: 'How do you stand on ISO 27001 or a comparable framework?' },
  options: [
    { value: 'certified',     labels: { nl: 'Gecertificeerd',                                 en: 'Certified' },                             score: 100 },
    { value: 'implementing',  labels: { nl: 'In implementatie',                                en: 'Implementing' },                          score: 70  },
    { value: 'planning',      labels: { nl: 'Verkennen / in planning',                         en: 'Exploring / planning' },                  score: 40  },
    { value: 'none_required', labels: { nl: 'Niet vereist of relevant voor ons',                en: 'Not required or relevant for us' },       score: 70  },
    { value: 'not_done',      labels: { nl: 'Wel relevant, niet gedaan',                       en: 'Relevant, not done' },                    score: 15  },
  ],
}

const Q_POLICY: RawQuestion = {
  code: 'security_policy', dimension: 'compliance', kind: 'likert', scale: 5, best: 5, required: true,
  prompts: { nl: 'In hoeverre is jullie information security policy op papier én bekend bij medewerkers?', en: 'To what extent is your information security policy on paper AND known to employees?' },
  helps:   { nl: '1 = niets op papier · 5 = beleid bestaat, alle medewerkers getekend, jaarlijks gereviewd', en: '1 = nothing on paper · 5 = policy exists, all employees signed, annually reviewed' },
}

// ──────────────────────────────────────────────────────────────────────────
// Supply chain (2 vragen)
// ──────────────────────────────────────────────────────────────────────────
const Q_VENDOR_INVENTORY: RawQuestion = {
  code: 'vendor_inventory', dimension: 'supply_chain', kind: 'single', required: true,
  prompts: { nl: 'Heb je een actueel overzicht van leveranciers met toegang tot je data?', en: 'Do you have a current overview of vendors with access to your data?' },
  options: [
    { value: 'full',     labels: { nl: 'Ja, met DPA\'s en security-statements per partij', en: 'Yes, with DPAs and security statements per vendor' }, score: 100 },
    { value: 'partial',  labels: { nl: 'Hoofdleveranciers wel, kleinere niet',              en: 'Main vendors yes, smaller no' },                       score: 55  },
    { value: 'list',     labels: { nl: 'Een lijst, geen verdere checks',                     en: 'A list, no further checks' },                           score: 30  },
    { value: 'none',     labels: { nl: 'Nee, geen overzicht',                                en: 'No, no overview' },                                     score: 0   },
  ],
}

const Q_3RD_PARTY: RawQuestion = {
  code: 'third_party_review', dimension: 'supply_chain', kind: 'likert', scale: 5, best: 5, required: true,
  prompts: { nl: 'Hoe vaak check je security-statements (ISO, SOC 2, AVG-DPA) van je belangrijkste leveranciers?', en: 'How often do you check security statements (ISO, SOC 2, GDPR DPA) of key vendors?' },
  helps:   { nl: '1 = nooit, ongelezen geaccepteerd · 5 = jaarlijks, met opvolging', en: '1 = never, accepted unread · 5 = annually, with follow-up' },
}

// ──────────────────────────────────────────────────────────────────────────
// Open vrij veld (context naar Claude)
// ──────────────────────────────────────────────────────────────────────────
const TOP_CONCERN: RawQuestion = {
  code: 'top_concern', dimension: 'meta', kind: 'text', required: false, contextOnly: true,
  prompts: { nl: 'Wat is op dit moment je grootste cyber-zorg of -vraag?', en: 'What is your biggest cyber concern or question right now?' },
  helps:   { nl: 'Eén of twee zinnen is genoeg. Optioneel.', en: 'One or two sentences is enough. Optional.' },
}

// ──────────────────────────────────────────────────────────────────────────
// Volgorde
// ──────────────────────────────────────────────────────────────────────────
export const RAW_QUESTIONS: RawQuestion[] = [
  STAGE_QUESTION_RAW, ROLE, SECTOR,
  Q_MFA, Q_OFFBOARDING, Q_PASSWORD, Q_VENDOR_ACCESS,
  Q_TRAINING, Q_REPORT_CULTURE, Q_PHISHING_TEST,
  Q_DATA_LOCATION, Q_AVG, Q_RETENTION,
  Q_PATCHING, Q_ENDPOINT_PROTECTION, Q_REMOTE_ACCESS,
  Q_BACKUP_FREQ, Q_BACKUP_TEST, Q_RANSOMWARE,
  Q_NIS2, Q_ISO, Q_POLICY,
  Q_VENDOR_INVENTORY, Q_3RD_PARTY,
  TOP_CONCERN,
]

export const ALL_QUESTIONS = RAW_QUESTIONS
export const STAGE_QUESTION = STAGE_QUESTION_RAW

function localize(q: RawQuestion, lang: Lang): LocalizedQuestion {
  return {
    code:        q.code,
    dimension:   q.dimension,
    kind:        q.kind,
    prompt:      q.prompts[lang] ?? q.prompts.nl,
    help:        q.helps?.[lang]  ?? q.helps?.nl,
    scale:       q.scale,
    best:        q.best,
    showIfStage: q.showIfStage,
    contextOnly: q.contextOnly,
    required:    q.required,
    options:     q.options?.map((o) => ({
      value: o.value,
      label: o.labels[lang] ?? o.labels.nl,
      score: o.score,
    })),
  }
}

export function getLocalizedQuestions(lang: Lang): LocalizedQuestion[] {
  return RAW_QUESTIONS.map((q) => localize(q, lang))
}

export function questionsForStage(stage: Stage, lang: Lang = 'nl'): LocalizedQuestion[] {
  return getLocalizedQuestions(lang).filter((q) => !q.showIfStage || q.showIfStage.includes(stage))
}

export function stageQuestion(lang: Lang): LocalizedQuestion {
  return localize(STAGE_QUESTION_RAW, lang)
}
