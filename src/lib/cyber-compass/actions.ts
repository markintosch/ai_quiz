/**
 * HCSS Cyber Compass — gecureerde quick-wins library met expliciete bronnen.
 *
 * Claude kiest 2 hieruit (de meest relevante voor deze respondent), valideert
 * server-side. Geen hallucinaties, geen biohacker-tips.
 *
 * Bronnen: NCSC NL, Digital Trust Center, ENISA, CIS Controls, NIS2 guidance,
 * ISO 27001, Cloud Security Alliance.
 */

export type ActionCategory =
  | 'iam'
  | 'awareness'
  | 'data'
  | 'endpoint'
  | 'backup'
  | 'compliance'
  | 'supply_chain'

export interface CompassAction {
  /** Stable code voor referentie */
  code:        string
  category:    ActionCategory
  /** Korte titel — max ~50 tekens */
  title:       string
  /** Concrete actie 1-2 zinnen */
  text:        string
  /** Waarom dit werkt — 1-2 zinnen, getoond onder de actie */
  rationale:   string
  /** Bron-label — googelbaar */
  source:      string
  sourceUrl?:  string
  /** Geschatte tijdsinvestering */
  effort:      string
  /** Wanneer Claude dit moet kiezen */
  whenAppropriate: string
}

// ──────────────────────────────────────────────────────────────────────────
// IAM — Identity & Access Management (Diederik's huis)
// ──────────────────────────────────────────────────────────────────────────
export const ACT_MFA_ENFORCE: CompassAction = {
  code: 'mfa_enforce', category: 'iam',
  title: 'Forceer multi-factor authenticatie (MFA) op alle accounts',
  text:  'Activeer MFA op je e-mail, SaaS-apps en VPN voor élke gebruiker — niet alleen administrators. Zonder MFA is een gestolen wachtwoord een directe toegangsweg.',
  rationale: 'NCSC NL noemt MFA de meest effectieve enkele maatregel tegen account-overname. Microsoft data toont 99,9% reductie in succesvolle aanvallen op accounts met MFA.',
  source: 'NCSC NL · Microsoft Security · CIS Control 6',
  sourceUrl: 'https://www.ncsc.nl/onderwerpen/multi-factor-authenticatie',
  effort: '~2 uur setup, geen kosten',
  whenAppropriate: 'Bij MFA niet-aan op alle accounts. Eerste actie als IAM-score laag is.',
}

export const ACT_OFFBOARDING: CompassAction = {
  code: 'offboarding_checklist', category: 'iam',
  title: 'Maak een leaver-checklist en zet die op de kalender',
  text:  'Leg vast wat er gebeurt op de laatste werkdag: accounts deactiveren, MFA-tokens intrekken, devices terugnemen, gedeelde licenties terug naar pool. Plan een check 30 dagen later — heeft iemand nog toegang?',
  rationale: 'Vergeten accounts zijn verantwoordelijk voor 60% van interne datalekken (ENISA threat landscape). Een eenvoudige checklist neemt deze risicoroute weg zonder tooling-investering.',
  source: 'ENISA Threat Landscape · NCSC NL',
  sourceUrl: 'https://www.ncsc.nl',
  effort: '~3 uur eenmalig + 15 min per leaver',
  whenAppropriate: 'Bij ontbrekend joiner/mover/leaver proces of onduidelijkheid wat er met accounts gebeurt na vertrek.',
}

export const ACT_PASSWORD_MANAGER: CompassAction = {
  code: 'password_manager', category: 'iam',
  title: 'Roll uit een password manager voor het hele team',
  text:  '1Password, Bitwarden of LastPass voor alle medewerkers — bedrijfslicentie. Verbod op wachtwoorden in browsers/notepads/spreadsheets. Begin met de top-10 meest gebruikte SaaS-apps.',
  rationale: 'Wachtwoord-hergebruik is de #1 oorzaak van account-overname bij MKB volgens Verizon DBIR. Een password manager vervangt slecht gedrag door makkelijker gedrag.',
  source: 'Verizon DBIR · NIST SP 800-63B',
  sourceUrl: 'https://www.verizon.com/business/resources/reports/dbir/',
  effort: '€3-6 per gebruiker per maand · setup ~1 dag',
  whenAppropriate: 'Bij geen of slecht wachtwoordbeleid; bij meldingen van wachtwoord-hergebruik.',
}

// ──────────────────────────────────────────────────────────────────────────
// Awareness — mensen + gedrag
// ──────────────────────────────────────────────────────────────────────────
export const ACT_PHISHING_TEST: CompassAction = {
  code: 'phishing_test', category: 'awareness',
  title: 'Doe een phishing-test in deze maand',
  text:  'Stuur via een tool als KnowBe4, Hoxhunt of Sophos een gecontroleerde phishing-test naar het hele team. Meet wie klikt, gebruik de uitslag voor gerichte training (geen public shaming).',
  rationale: 'Eén test geeft je een feitelijke baseline van je menselijke verdediging. Herhaling elke 8-12 weken laat een meetbare daling zien — gedrag verandert door oefenen, niet door regels.',
  source: 'NCSC NL · KnowBe4 benchmark · CIS Control 14',
  sourceUrl: 'https://www.ncsc.nl/onderwerpen/phishing',
  effort: '€1-3 per gebruiker per maand · setup ~halve dag',
  whenAppropriate: 'Bij geen recente phishing-test of lage awareness-score.',
}

export const ACT_REPORT_BUTTON: CompassAction = {
  code: 'phish_report_button', category: 'awareness',
  title: 'Installeer een 1-klik phishing-meldknop in mailclient',
  text:  'Activeer in Outlook/Gmail de "Report phishing"-knop voor elke medewerker. Verwerk meldingen binnen 4 uur en stuur een korte samenvatting terug naar de melder. Beloon melden.',
  rationale: 'Een meldcultuur waar geen schaamte zit, vangt 80% van succesvolle aanvallen op vóór ze schade doen. De feedback-loop maakt het verschil — zonder reactie meldt niemand meer.',
  source: 'Digital Trust Center · CIS Control 14',
  sourceUrl: 'https://www.digitaltrustcenter.nl',
  effort: '~2 uur setup · 30 min per melding',
  whenAppropriate: 'Bij lage meld-cultuur of als phishing-meldingen nu nergens heen gaan.',
}

// ──────────────────────────────────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────────────────────────────────
export const ACT_DATA_MAPPING: CompassAction = {
  code: 'data_mapping_lite', category: 'data',
  title: 'Doe een halve dag data-mapping',
  text:  'Inventariseer in een eenvoudige spreadsheet: welke persoonsgegevens, waar opgeslagen (welke SaaS / share / device), wie heeft toegang, hoe lang bewaard. Geen volledig AVG-dossier — wel het overzicht dat alles begint.',
  rationale: 'Je weet pas wat je beschermen moet als je weet wat er is. Een lichte mapping in een halve dag geeft je een platform voor alle andere maatregelen — én bewijs voor AVG.',
  source: 'AVG Art. 30 · Autoriteit Persoonsgegevens',
  sourceUrl: 'https://autoriteitpersoonsgegevens.nl',
  effort: '~4 uur eenmalig',
  whenAppropriate: 'Bij geen of beperkte data-classificatie; bij AVG-onzekerheid.',
}

export const ACT_RETENTION_POLICY: CompassAction = {
  code: 'retention_policy', category: 'data',
  title: 'Stel een minimale retentie-policy op',
  text:  '1 A4: per data-categorie hoe lang bewaren en wie verwijdert. Begin met klantgegevens, sollicitaties en oude exports. Activeer auto-delete waar mogelijk in je SaaS-tools.',
  rationale: 'Data die je niet meer hebt, kan niet uitlekken. Auto-delete is een gratis security-maatregel die nu al in de meeste cloud-tools beschikbaar is — alleen niet aangezet.',
  source: 'AVG Art. 5(1)(e) · NCSC NL',
  effort: '~3 uur eenmalig',
  whenAppropriate: 'Bij geen retentie-beleid of opgehoopte oude data.',
}

// ──────────────────────────────────────────────────────────────────────────
// Endpoint
// ──────────────────────────────────────────────────────────────────────────
export const ACT_AUTO_PATCH: CompassAction = {
  code: 'auto_patch', category: 'endpoint',
  title: 'Activeer automatische updates op alle devices',
  text:  'OS-updates en browser-updates op forced-auto. Gebruik MDM (Microsoft Intune, Jamf, Kandji) als je dat al hebt. Zo niet: communiceer een vaste deadline-window — alle updates binnen 7 dagen, controleer maandelijks.',
  rationale: 'Bekende kwetsbaarheden zonder patch zijn de #2 inbraakroute na phishing. Automatische updates verlagen je window-of-exposure van weken naar uren.',
  source: 'CIS Control 7 · NIS2 Art. 21',
  sourceUrl: 'https://www.cisecurity.org/controls',
  effort: '~2 uur setup als MDM al draait',
  whenAppropriate: 'Bij geen automatische patching of onduidelijkheid wie verantwoordelijk is voor updates.',
}

export const ACT_ENDPOINT_PROTECTION: CompassAction = {
  code: 'endpoint_protection', category: 'endpoint',
  title: 'Modern endpoint detection & response (EDR) op alle laptops',
  text:  'Vervang gewone antivirus door EDR — Microsoft Defender for Endpoint, CrowdStrike Falcon Go, of SentinelOne. EDR ziet ook nieuw / onbekend gedrag en kan automatisch isoleren.',
  rationale: 'Klassieke antivirus mist 30-50% van moderne malware (signature-based). EDR detecteert gedragspatronen en stopt aanvallen die je AV mist.',
  source: 'NCSC NL · Gartner Magic Quadrant EDR',
  effort: '€8-15 per device per maand',
  whenAppropriate: 'Bij gewone antivirus of geen endpoint-bescherming op alle apparaten.',
}

// ──────────────────────────────────────────────────────────────────────────
// Backup
// ──────────────────────────────────────────────────────────────────────────
export const ACT_BACKUP_TEST: CompassAction = {
  code: 'backup_restore_test', category: 'backup',
  title: 'Doe deze maand een restore-test',
  text:  'Pak een willekeurig bestand uit je backup van 30 dagen geleden en restore het — niet alleen of je het kunt downloaden, maar ook of de inhoud daadwerkelijk bruikbaar is. Documenteer wat goed ging en wat niet.',
  rationale: 'Backup zonder restore-test is geen backup, het is hoop. De meeste organisaties ontdekken op de dag van de ransomware dat de backup corrupt is of de restore-procedure niet werkt.',
  source: 'NCSC NL · CIS Control 11',
  sourceUrl: 'https://www.ncsc.nl/onderwerpen/back-ups',
  effort: '~2 uur eerste keer · 1 uur herhalingen',
  whenAppropriate: 'Bij backup zonder recent geteste restore. Hoogste prioriteit als ransomware-risico hoog is.',
}

export const ACT_321_BACKUP: CompassAction = {
  code: '321_backup', category: 'backup',
  title: 'Implementeer 3-2-1 backup-regel',
  text:  '3 kopieën van data, op 2 verschillende media, met 1 offline (of immutable). Cloud-backup met immutability is de moderne invulling — Veeam, Acronis, Datto bieden dit standaard.',
  rationale: 'Ransomware probeert ook backup te versleutelen. Een offline of immutable kopie is het verschil tussen "betalen" en "restoren". Dit is de minimale standaard tegen moderne ransomware.',
  source: 'NCSC NL · CISA Ransomware Guide',
  effort: '€50-200 per maand voor MKB',
  whenAppropriate: 'Bij backup op één locatie of zonder offline/immutable kopie.',
}

// ──────────────────────────────────────────────────────────────────────────
// Compliance
// ──────────────────────────────────────────────────────────────────────────
export const ACT_NIS2_SCOPE: CompassAction = {
  code: 'nis2_scope_check', category: 'compliance',
  title: 'Check formeel of je onder NIS2 valt — en begin met scope-bepaling',
  text:  'NIS2 raakt sinds 18 oktober 2024 ~10.000 NL-organisaties. Check via de NIS2 Quick Scan van het Digital Trust Center. Als je in scope valt: begin met asset-inventarisatie en risk assessment, deze tellen.',
  rationale: 'Veel MKB-organisaties weten niet dat ze in scope vallen via leveranciersketens (essential entities). De boetes zijn substantieel (max €10M of 2% omzet) — en compliance-werk neemt ~6 maanden.',
  source: 'Digital Trust Center · NIS2 NL',
  sourceUrl: 'https://www.digitaltrustcenter.nl/nis2',
  effort: 'Quick scan: 30 min · Implementatie: 6-12 mnd',
  whenAppropriate: 'Bij organisaties >50 medewerkers of essential/important entity-sectoren (energy, finance, healthcare, transport, etc).',
}

export const ACT_INFOSEC_POLICY: CompassAction = {
  code: 'infosec_policy', category: 'compliance',
  title: 'Schrijf een 1-pager Information Security Policy',
  text:  'Niet 50 pagina\'s ISO-jargon — wel één leesbare A4 die zegt: dit zijn onze regels, dit accepteren we wel/niet, dit doen we bij incident, deze persoon is aanspreekpunt. Laat alle medewerkers tekenen.',
  rationale: 'Een geschreven beleid is een vereiste voor NIS2, ISO 27001, AVG én cyber-verzekeringen. De 1-pager versie is goed genoeg om mee te beginnen — uitbreiden kan later.',
  source: 'ISO 27001 Annex A · NIS2 Art. 21',
  effort: '~4 uur eenmalig',
  whenAppropriate: 'Bij geen formeel security-beleid op papier.',
}

// ──────────────────────────────────────────────────────────────────────────
// Supply chain
// ──────────────────────────────────────────────────────────────────────────
export const ACT_VENDOR_INVENTORY: CompassAction = {
  code: 'vendor_inventory', category: 'supply_chain',
  title: 'Maak een leveranciers-inventaris met security-scope',
  text:  'Lijst alle externe partijen die toegang hebben tot je data of systemen. Per leverancier: welke data delen jullie, welke compliance-statements heb je (ISO 27001, SOC 2, AVG-DPA), wanneer voor laatst gecheckt.',
  rationale: 'Supply-chain-aanvallen (zoals SolarWinds, MOVEit) komen via een leverancier die jij vertrouwde. Een lijst met statements is je eerste verdediging — én bewijs voor NIS2.',
  source: 'NIS2 Art. 21(2)(d) · ENISA Supply Chain Threat Landscape',
  effort: '~4-6 uur initieel',
  whenAppropriate: 'Bij geen leveranciers-inventaris of onduidelijkheid over 3rd party access.',
}

export const ACT_SAAS_REVIEW: CompassAction = {
  code: 'saas_review', category: 'supply_chain',
  title: 'Doe een SaaS-permission review',
  text:  'Open je top-5 SaaS-tools (Microsoft 365, Google Workspace, Slack, etc) en check welke 3rd party apps toegang hebben. Verwijder wat niemand meer gebruikt. Zet OAuth-controle aan voor nieuwe.',
  rationale: 'Vergeten OAuth-tokens van oude tools blijven jaren actief en zijn een onderschat aanvalsvlak. Microsoft 365 alleen heeft gemiddeld 20+ ongebruikte apps per organisatie.',
  source: 'Cloud Security Alliance · CIS Control 4',
  effort: '~2 uur per platform',
  whenAppropriate: 'Bij veel SaaS-gebruik en geen review-process.',
}

// ──────────────────────────────────────────────────────────────────────────
// Specialist topics — wat Diederik beter kan oppakken (voor specialist_topic)
// ──────────────────────────────────────────────────────────────────────────
export const SPECIALIST_TOPICS: Record<ActionCategory, { topic: string; reason: string }> = {
  iam: {
    topic:  'Identity & Access architectuur — van MFA naar Zero Trust',
    reason: 'IAM is Diederik\'s specialiteit. Een gericht traject van 4-8 weken brengt je van losse maatregelen naar een Zero Trust-aanpak: weten wie wat mag, op welk apparaat, vanaf welke locatie. Dit is geen DIY-werk.',
  },
  awareness: {
    topic:  'Een werkend security-awareness programma opzetten',
    reason: 'Awareness-tools alleen werken niet — een programma dat blijft hangen wel. Diederik heeft dit voor o.a. KWF Kankerbestrijding en Toyota Lowman gebouwd. Een eerste opzet kost ~2 weken consult.',
  },
  data: {
    topic:  'Data-classificatie + AVG-readiness audit',
    reason: 'Een volledige data-flow mapping inclusief AVG-vereisten is meerdaags werk dat juridische én technische blik vraagt. Diederik werkt deze dossiers regelmatig samen met DPO\'s op.',
  },
  endpoint: {
    topic:  'Endpoint security architectuur (MDM + EDR + DLP)',
    reason: 'Een werkend endpoint-stack opzetten over Windows/Mac/mobiel met MDM, EDR en DLP is geen middag werk. Diederik kan een eerste fit-gap binnen 2 weken laten zien.',
  },
  backup: {
    topic:  'Backup-strategie + ransomware draaiboek',
    reason: '3-2-1 backup is een principe — uitwerken vereist keuzes per data-categorie. Plus een getest draaiboek voor het moment dat ransomware toeslaat (uren maken het verschil).',
  },
  compliance: {
    topic:  'NIS2 compliance roadmap',
    reason: 'NIS2 is geen vinkje — het is een 6-12 maanden traject met formele asset-inventaris, risk assessment, incident-response procedures en boardroom-rapportages. Diederik begeleidt dit voor middelgrote organisaties.',
  },
  supply_chain: {
    topic:  'Third-party risk management',
    reason: 'Supply-chain audit + DPA-checks + leveranciers-classificatie is werk dat juridische en security-bril vraagt. Een eerste opzet plus 5-10 leveranciers door hebben kost ~3 weken.',
  },
}

// ──────────────────────────────────────────────────────────────────────────
// Bibliotheek
// ──────────────────────────────────────────────────────────────────────────
export const ALL_ACTIONS: CompassAction[] = [
  ACT_MFA_ENFORCE, ACT_OFFBOARDING, ACT_PASSWORD_MANAGER,
  ACT_PHISHING_TEST, ACT_REPORT_BUTTON,
  ACT_DATA_MAPPING, ACT_RETENTION_POLICY,
  ACT_AUTO_PATCH, ACT_ENDPOINT_PROTECTION,
  ACT_BACKUP_TEST, ACT_321_BACKUP,
  ACT_NIS2_SCOPE, ACT_INFOSEC_POLICY,
  ACT_VENDOR_INVENTORY, ACT_SAAS_REVIEW,
]

export function getActionByCode(code: string): CompassAction | null {
  return ALL_ACTIONS.find((a) => a.code === code) ?? null
}

export function actionsForPrompt(): string {
  return ALL_ACTIONS.map((a) =>
    `- code: ${a.code}\n  category: ${a.category}\n  title: "${a.title}"\n  when: ${a.whenAppropriate}\n  effort: "${a.effort}"\n  source: "${a.source}"`,
  ).join('\n')
}
