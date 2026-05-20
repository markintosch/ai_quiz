/**
 * HCSS Cyber Compass — UI strings.
 * NL als basis (Nederlandse MKB-doelgroep). EN-architectuur klaar voor v2.
 */

export type Lang = 'nl' | 'en'

export function pickLang(input: string | string[] | undefined | null): Lang {
  const v = Array.isArray(input) ? input[0] : input
  return v === 'en' ? 'en' : 'nl'
}

// ── Brand: HCSS, niet Brand PWRD Media ──────────────────────────────────────
export const BRAND = {
  productName:    'Cyber Compass',
  ownerShort:     'HCSS',
  ownerLong:      'Hammer Cyber Security Services',
  founderName:    'Diederik Hammer',
  founderEmail:   'diederik@hammercybersec.nl',  // placeholder — Diederik bevestigt
  calendlyUrl:    'https://calendly.com/diederik-hammer',  // placeholder — Diederik bevestigt
}

export const LANDING: Record<Lang, {
  metaTitle:     string
  metaDesc:      string
  eyebrow:       string
  title:         string
  intro:         string
  cta:           string
  ctaSub:        string
  whatHeading:   string
  feat:          { num: string; title: string; body: string }[]
  forWhomHeading:string
  forWhom:       { strong: string; text: string }[]
  notHeading:    string
  notList:       string[]
  testimonialsHeading: string
  testimonials:  { quote: string; role: string }[]
  finalLine:     string
  ownedBy:       string
}> = {
  nl: {
    metaTitle:     'HCSS Cyber Compass — hoe weerbaar is je organisatie?',
    metaDesc:      'In 10 minuten een eerlijke score op 7 dimensies van cyberweerbaarheid. Voor MKB tussen 10 en 250 medewerkers. Geen IT-jargon, geen verkooppraatje — wel concrete actiepunten.',
    eyebrow:       'Cyberweerbaarheid voor het MKB',
    title:         'HCSS Cyber Compass',
    intro:         'In 10 minuten weet je waar je organisatie staat op de zeven dimensies van cyberweerbaarheid. Geen IT-jargon. Geen verkooppraatje. Wel een eerlijke kijk waar je risico ligt — en waar je morgen mee kunt beginnen.',
    cta:           'Start de Cyber Compass →',
    ctaSub:        '~10 minuten · anoniem starten · e-mail pas bij resultaten',
    whatHeading:   'Wat krijg je terug',
    feat: [
      { num: '01', title: 'Score op 7 dimensies', body: 'Identity & access · awareness · data · endpoints · backup · compliance · supply chain. Met radar zodat je in één blik ziet waar je staat.' },
      { num: '02', title: 'Drie risico-observaties', body: 'Op basis van jouw antwoorden: drie geformuleerde risicogebieden die nu de meeste aandacht vragen. Geen hype, geen disclaimers, wel context.' },
      { num: '03', title: 'Twee quick wins', body: 'Concrete acties die je morgen zelf kunt doen, met bron uit erkende richtlijnen (NCSC NL, NIS2, CIS Controls, ENISA).' },
      { num: '04', title: 'Eén punt voor een specialist', body: 'Welk onderwerp je beter niet alleen oppakt. Met de optie direct een gesprek met Diederik in te plannen — of niet, jouw keuze.' },
    ],
    forWhomHeading:'Voor wie?',
    forWhom: [
      { strong: 'Hoofddoelgroep:', text: 'directeur, eigenaar of MT-lid van een MKB-organisatie (10-250 medewerkers) zonder eigen security-team.' },
      { strong: 'Tweede groep:',   text: 'IT-managers en officers die hun maturity willen valideren tegen wat normaal is in vergelijkbare organisaties.' },
      { strong: 'Voor wie geschikt:', text: 'mensen die een eerlijke score willen — en bereid zijn er iets mee te doen. Niet voor wie alleen een sticker zoekt.' },
    ],
    notHeading:    'Wat dit niet is',
    notList: [
      'Geen vervanging voor een formele security-audit of pentest.',
      'Geen NIS2- of ISO-certificeringscheck (wel een eerste richtingsbepaling).',
      'Geen sales-funnel — je bent vrij om alleen je score te bekijken en weg te gaan.',
      'Geen dataverkoop. Het platform en je antwoorden worden beheerd door Brand PWRD Media. Diederik (HCSS) is inhoudelijk eigenaar van het assessment.',
    ],
    testimonialsHeading: 'Wat opdrachtgevers zeggen',
    testimonials: [
      { quote: 'Diederik heeft enorm veel kennis op het gebied van cybersecurity. Hij is niet alleen een professional, maar ook een uitstekende luisteraar die altijd openstaat voor nieuwe ideeën.', role: 'Opdrachtgever — samengewerkt aan informatiebeveiliging' },
    ],
    finalLine:     'Klaar voor je nulmeting?',
    ownedBy:       'Een instrument van Hammer Cyber Security Services (HCSS), gebouwd op het Brand PWRD Media platform.',
  },
  en: {
    metaTitle:     'HCSS Cyber Compass — how resilient is your organisation?',
    metaDesc:      'A 10-minute honest score across 7 cyber resilience dimensions. For SMEs of 10-250 employees. No IT jargon, no sales pitch — just concrete action points.',
    eyebrow:       'Cyber resilience for SMEs',
    title:         'HCSS Cyber Compass',
    intro:         'In 10 minutes you know where your organisation stands on the seven dimensions of cyber resilience. No IT jargon. No sales pitch. Just an honest view of where your risk lies — and where you can start tomorrow.',
    cta:           'Start the Cyber Compass →',
    ctaSub:        '~10 minutes · start anonymously · email only at results',
    whatHeading:   'What you get back',
    feat: [
      { num: '01', title: 'Score on 7 dimensions',     body: 'Identity & access · awareness · data · endpoints · backup · compliance · supply chain. With radar so you see at a glance where you stand.' },
      { num: '02', title: 'Three risk observations',   body: 'Based on your answers: three risk areas that need most attention now. No hype, no disclaimers, just context.' },
      { num: '03', title: 'Two quick wins',            body: 'Concrete actions you can take tomorrow, sourced from recognised guidelines (NCSC NL, NIS2, CIS Controls, ENISA).' },
      { num: '04', title: 'One topic for a specialist',body: 'Which topic you should not tackle alone. With the option to book a call with Diederik directly — or not, your choice.' },
    ],
    forWhomHeading:'For whom?',
    forWhom: [
      { strong: 'Primary audience:', text: 'director, owner or management team member of an SME (10-250 employees) without an in-house security team.' },
      { strong: 'Secondary group:',  text: 'IT managers and officers who want to validate their maturity against what is normal in comparable organisations.' },
      { strong: 'Best fit:',         text: 'people who want an honest score — and are willing to do something with it. Not for those who just want a sticker.' },
    ],
    notHeading:    'What this is not',
    notList: [
      'Not a replacement for a formal security audit or pentest.',
      'Not a NIS2 or ISO certification check (does give a first direction).',
      'Not a sales funnel — you can view your score and leave.',
      'No data sales. The platform and your answers are managed by Brand PWRD Media. Diederik (HCSS) is the content owner of the assessment.',
    ],
    testimonialsHeading: 'What clients say',
    testimonials: [
      { quote: 'Diederik has an enormous amount of knowledge in cybersecurity. He is not only a professional, but also an excellent listener who is always open to new ideas.', role: 'Client — worked together on information security' },
    ],
    finalLine:     'Ready for your baseline?',
    ownedBy:       'A tool by Hammer Cyber Security Services (HCSS), built on the Brand PWRD Media platform.',
  },
}

export const STEPPER: Record<Lang, {
  loading:        string
  back:           string
  nextDefault:    string
  nextLast:       string
  toResults:      string
  skip:           string
  myResults:      string
  errRequired:    string
  errEmail:       string
  errNetwork:     string
  errConsent:     string
  submitting1:    string
  submitting2:    string
  firstQuestion:  string
  almostDone:     string
  leadHeading:    string
  leadIntro:      string
  emailLabel:     string
  emailPlaceholder:string
  consentText:    string
  orgNameLabel:   string
  orgNamePlaceholder: string
}> = {
  nl: {
    loading:        'Laden…',
    back:           '← Vorige',
    nextDefault:    'Volgende →',
    nextLast:       'Naar resultaten →',
    toResults:      'Naar resultaten →',
    skip:           'Sla over (anoniem afronden)',
    myResults:      'Mijn resultaten →',
    errRequired:    'Deze vraag is verplicht. Selecteer of vul iets in.',
    errEmail:       'Ongeldig e-mailadres.',
    errNetwork:     'Netwerkfout — probeer opnieuw.',
    errConsent:     'Vink het AVG-vakje aan om je resultaten per mail te ontvangen.',
    submitting1:    'Even geduld…',
    submitting2:    'Je score wordt berekend en je risico-observaties worden geformuleerd. Dit duurt 30-60 seconden.',
    firstQuestion:  'Eerste vraag',
    almostDone:     'Bijna klaar',
    leadHeading:    'Waar mogen we je resultaten heen sturen?',
    leadIntro:      'Vul je e-mail in om een samenvatting te ontvangen en eventueel later met Diederik door te praten. Sla over voor anoniem afronden — je krijgt je resultaat dan alleen op het scherm.',
    emailLabel:     'E-mail (optioneel)',
    emailPlaceholder:'naam@bedrijf.nl',
    consentText:    'Ik ga akkoord met het privacybeleid en het ontvangen van mijn Cyber Compass-resultaten per e-mail van HCSS / Brand PWRD Media.',
    orgNameLabel:   'Organisatie (optioneel)',
    orgNamePlaceholder: 'Bedrijfsnaam',
  },
  en: {
    loading:        'Loading…',
    back:           '← Back',
    nextDefault:    'Next →',
    nextLast:       'To results →',
    toResults:      'To results →',
    skip:           'Skip (finish anonymously)',
    myResults:      'My results →',
    errRequired:    'This question is required.',
    errEmail:       'Invalid email.',
    errNetwork:     'Network error — try again.',
    errConsent:     'Tick the GDPR box to receive your results by email.',
    submitting1:    'One moment…',
    submitting2:    'Your score is being calculated and your risk observations are being formulated. This takes 30-60 seconds.',
    firstQuestion:  'First question',
    almostDone:     'Almost done',
    leadHeading:    'Where shall we send your results?',
    leadIntro:      'Enter your email to receive a summary and optionally book a call with Diederik later. Skip to finish anonymously — you\'ll only get your result on screen.',
    emailLabel:     'Email (optional)',
    emailPlaceholder:'name@company.com',
    consentText:    'I agree with the privacy policy and to receive my Cyber Compass results by email from HCSS / Brand PWRD Media.',
    orgNameLabel:   'Organisation (optional)',
    orgNamePlaceholder: 'Company name',
  },
}

export const RESULTS: Record<Lang, {
  eyebrow:           string
  greetingFallback:  string
  perDimension:      string
  topRiskHeading:    string
  riskObservations:  string
  quickWinsHeading:  string
  specialistHeading: string
  specialistIntro:   string
  bookCallCta:       string
  noEmailNote:       string
  bookmarkHint:      string
  sourceLabel:       string
  evidenceFooter:    string
  ownerFooter:       string
  topLeverFor:       Record<string, string>
}> = {
  nl: {
    eyebrow:           'Je Cyber Compass',
    greetingFallback:  'Je nulmeting',
    perDimension:      'Per dimensie',
    topRiskHeading:    'Je grootste risico-hefboom nu',
    riskObservations:  'Drie risico-observaties',
    quickWinsHeading:  'Twee quick wins voor deze week',
    specialistHeading: 'Een specialist-onderwerp',
    specialistIntro:   'Eén onderwerp dat je beter niet alleen oppakt. Diederik kent dit terrein — een verkennend gesprek van 30 minuten kost niets en levert je een eerlijke inschatting van wat het gaat kosten en duren.',
    bookCallCta:       'Plan een gesprek met Diederik →',
    noEmailNote:       'Geen e-mail ingevuld? Geen probleem. Bewaar deze pagina-URL als je later wilt terugkomen.',
    bookmarkHint:      'Bewaar deze pagina — de URL is uniek voor jou en blijft 12 maanden bereikbaar.',
    sourceLabel:       'Bron',
    evidenceFooter:    'Quick wins zijn gekozen uit erkende cyber-richtlijnen: NCSC NL · Digital Trust Center · ENISA · CIS Controls · NIS2 guidance · ISO 27001.',
    ownerFooter:       'Je antwoorden zijn opgeslagen door Brand PWRD Media (data controller). Diederik Hammer / HCSS is inhoudelijk eigenaar van het assessment en ontvangt jouw resultaten alleen als je je e-mail hebt ingevuld.',
    topLeverFor: {
      iam:           'Identity & access management is bij een MKB vaak de gevoeligste plek — wachtwoorden zonder MFA en accounts die blijven hangen na vertrek zijn de meest voorkomende inbraakroutes. Hier zit ook Diederik\'s specialisme: snelle wins, structurele aanpak.',
      awareness:     'Mensen blijven de eerste én de beste verdedigingslinie. Een organisatie waar collega\'s zonder schaamte een verdacht mailtje melden, vangt 80% van de echte aanvallen op vóór ze schade doen.',
      data:          'Je weet pas wat je moet beschermen als je weet welke data waar leeft. Een lichte mapping in een halve dag werk geeft je een platform om alle andere maatregelen op te baseren.',
      endpoint:      'De laptops en telefoons van je team zijn je grootste aanvalsoppervlak. Patching en endpoint-bescherming zijn de basis — als die niet op orde zijn, wordt al het andere kwetsbaar.',
      backup:        'Backup is je verzekering tegen ransomware. Als de back-up er is maar nooit getest is, weet je pas op de slechtste dag dat het niet werkt. Hier zit dus de hoogste prioriteit.',
      compliance:    'NIS2, AVG en sector-eisen tellen op. De vraag is niet of je in scope valt, maar of je dat formeel kunt aantonen. Dat aantoonbaar maken — dáár zit het werk.',
      supply_chain:  'Je leveranciers en cloud-providers zijn jouw verlengde aanvalsoppervlak. Een verbroken-keten-aanval (zoals SolarWinds) kan via een derde partij binnenkomen die jij vertrouwde. Mapping is stap één.',
    },
  },
  en: {
    eyebrow:           'Your Cyber Compass',
    greetingFallback:  'Your baseline',
    perDimension:      'Per dimension',
    topRiskHeading:    'Your biggest risk lever right now',
    riskObservations:  'Three risk observations',
    quickWinsHeading:  'Two quick wins for this week',
    specialistHeading: 'One specialist topic',
    specialistIntro:   'One topic better not tackled alone. Diederik knows this terrain — an exploratory 30-minute call is free and gives you an honest estimate of what it will cost and take.',
    bookCallCta:       'Book a call with Diederik →',
    noEmailNote:       'No email entered? Fine. Bookmark this page URL if you want to come back later.',
    bookmarkHint:      'Bookmark this page — the URL is unique to you and stays accessible for 12 months.',
    sourceLabel:       'Source',
    evidenceFooter:    'Quick wins are chosen from recognised cyber guidelines: NCSC NL · Digital Trust Center · ENISA · CIS Controls · NIS2 guidance · ISO 27001.',
    ownerFooter:       'Your answers are stored by Brand PWRD Media (data controller). Diederik Hammer / HCSS owns the assessment content and receives your results only if you entered your email.',
    topLeverFor: {
      iam:           'Identity & access management is often the most vulnerable spot at an SME — passwords without MFA and accounts that linger after employees leave are the most common breach routes. This is also Diederik\'s specialty: quick wins, structural approach.',
      awareness:     'People remain the first and best line of defence. An organisation where colleagues report suspicious emails without shame catches 80% of real attacks before they do damage.',
      data:          'You only know what to protect when you know what data lives where. A light mapping in half a day gives you a platform for all other measures.',
      endpoint:      'Your team\'s laptops and phones are your biggest attack surface. Patching and endpoint protection are the basics — without those, everything else becomes vulnerable.',
      backup:        'Backup is your insurance against ransomware. If a backup exists but is never tested, you\'ll only learn on the worst day that it does not work. Highest priority lives here.',
      compliance:    'NIS2, GDPR and sector requirements add up. The question is not whether you\'re in scope, but whether you can formally prove it. Provability is where the work lives.',
      supply_chain:  'Your suppliers and cloud providers are your extended attack surface. A supply-chain attack (like SolarWinds) can enter through a third party you trusted. Mapping is step one.',
    },
  },
}

export const BAND_COPY: Record<Lang, Record<string, { title: string; sub: string }>> = {
  nl: {
    exposed:    { title: 'Exposed',   sub: 'Significante gaten op meerdere fronten. Met de juiste prioritering binnen 6 maanden naar een werkbaar veiligheidsniveau — maar nu actie nemen is geen luxe.' },
    aware:      { title: 'Aware',     sub: 'Je beseft de risico\'s, maar de praktijk loopt nog achter. Dit is precies de fase waar tactische begeleiding het meeste oplevert per geïnvesteerd uur.' },
    maturing:   { title: 'Maturing',  sub: 'De basis staat. Nu zit het werk in integratie, leveranciersketen en awareness — minder zichtbaar, even belangrijk. Je bent over de gevaarlijkste drempel heen.' },
    resilient:  { title: 'Resilient', sub: 'Je staat er sterk voor. Focus nu op stress-testen, third-party risico\'s en compliance-finetuning. Dit is geen eindstation — wel een goede positie.' },
  },
  en: {
    exposed:    { title: 'Exposed',   sub: 'Significant gaps on multiple fronts. With proper prioritisation, you can reach a workable security posture within 6 months — but acting now is no luxury.' },
    aware:      { title: 'Aware',     sub: 'You see the risks, but practice lags behind. This is exactly the phase where tactical guidance delivers the most per invested hour.' },
    maturing:   { title: 'Maturing',  sub: 'The basics are in place. Now the work is in integration, supply chain and awareness — less visible, equally important. You\'re past the most dangerous threshold.' },
    resilient:  { title: 'Resilient', sub: 'You\'re in a strong position. Focus now on stress testing, third-party risk and compliance fine-tuning. Not an end station — but a good place to be.' },
  },
}

// Sector list (used in Q1 — sectoraal benchmark + Diederik targeting)
export const SECTORS: Record<Lang, { value: string; label: string }[]> = {
  nl: [
    { value: 'finance',      label: 'Financiële dienstverlening' },
    { value: 'healthcare',   label: 'Zorg & welzijn' },
    { value: 'industry',     label: 'Industrie & maakindustrie' },
    { value: 'retail',       label: 'Retail & e-commerce' },
    { value: 'tech',         label: 'IT & software' },
    { value: 'logistics',    label: 'Transport & logistiek' },
    { value: 'professional', label: 'Zakelijke dienstverlening' },
    { value: 'government',   label: 'Overheid & semi-overheid' },
    { value: 'nonprofit',    label: 'Goede doelen / non-profit' },
    { value: 'education',    label: 'Onderwijs' },
    { value: 'hospitality',  label: 'Horeca & toerisme' },
    { value: 'other',        label: 'Anders' },
  ],
  en: [
    { value: 'finance',      label: 'Financial services' },
    { value: 'healthcare',   label: 'Healthcare' },
    { value: 'industry',     label: 'Industry & manufacturing' },
    { value: 'retail',       label: 'Retail & e-commerce' },
    { value: 'tech',         label: 'IT & software' },
    { value: 'logistics',    label: 'Transport & logistics' },
    { value: 'professional', label: 'Professional services' },
    { value: 'government',   label: 'Government & semi-public' },
    { value: 'nonprofit',    label: 'Charity / non-profit' },
    { value: 'education',    label: 'Education' },
    { value: 'hospitality',  label: 'Hospitality & tourism' },
    { value: 'other',        label: 'Other' },
  ],
}
