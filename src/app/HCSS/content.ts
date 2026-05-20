// Content model + defaults for the HCSS (Hammer Cyber Security Services) site.
// Lives at /HCSS as a standalone subtree on markdekock.com, to be transferred to
// Diederik's own hosting later. The public page reads an override blob from
// Supabase `site_content` (product_key 'hcss', locale 'nl') and deep-merges it
// over these defaults, so the page renders fully before any CMS edit. The admin
// editor (src/app/admin/hcss) saves the whole object back.
//
// Copy sourced from the HCSS Website Copy + Strategy documents (Brand PWRD Media).

export interface HLink { label: string; href: string }
export interface HCard { title: string; body: string }
export interface HStep { title: string; body: string }
export interface HTier { name: string; forWho: string; contains: string }
export interface HCred { category: string; detail: string }
export interface HFaq { q: string; a: string }
export interface HTestimonial { quote: string; role: string }

export interface HcssContent {
  nav: { links: HLink[]; cta: HLink }
  hero: {
    title: string
    subtitle: string
    ctaPrimary: HLink
    ctaSecondary: HLink
    trustBar: string[]
  }
  problem: { heading: string; body: string; closing: string }
  services: { heading: string; intro: string; cards: HCard[] }
  assessment: {
    eyebrow: string
    heading: string
    body: string
    bullets: string[]
    ctaLabel: string
    ctaHref: string
    note: string
    tiers: HTier[]
    tiersNote: string
  }
  werkwijze: { heading: string; intro: string; steps: HStep[] }
  waarom: { heading: string; items: HCard[] }
  founder: {
    heading: string
    name: string
    bio: string
    ctaLabel: string
    ctaHref: string
    credsTitle: string
    creds: HCred[]
  }
  testimonials: { heading: string; items: HTestimonial[] }
  contact: {
    heading: string
    intro: string
    expectTitle: string
    expect: string[]
    directTitle: string
    email: string
    phone: string
    linkedin: string
    kvk: string
    successMessage: string
  }
  faq: { heading: string; items: HFaq[] }
  footer: { tagline: string; legal: string }
}

export const DEFAULT_CONTENT: HcssContent = {
  nav: {
    links: [
      { label: 'Diensten', href: '#diensten' },
      { label: 'Werkwijze', href: '#werkwijze' },
      { label: 'Over HCSS', href: '#over' },
      { label: 'Contact', href: '#contact' },
    ],
    cta: { label: 'Plan een kennismaking', href: '#contact' },
  },
  hero: {
    title: 'Pragmatische cybersecurity voor het MKB',
    subtitle: 'Cyberweerbaarheid die begrijpelijk, haalbaar en effectief blijft. Zonder enterprise-complexiteit.',
    ctaPrimary: { label: 'Plan een kennismaking', href: '#contact' },
    ctaSecondary: { label: 'Bekijk de aanpak', href: '#werkwijze' },
    trustBar: [
      'ISO 27001 & NIST CSF-gebaseerd',
      'Certified Zero Trust (CCZT)',
      'Ervaren bij o.a. KWF en Toyota Louwman Financial Services',
    ],
  },
  problem: {
    heading: 'Herkenbaar?',
    body: 'Je organisatie draait op digitale systemen, maar niemand houdt zich fulltime bezig met informatiebeveiliging. Je weet dat er risico’s zijn, maar niet precies welke. En de securitybedrijven die je vindt, bieden oplossingen die te zwaar, te duur of te complex zijn voor jouw situatie.',
    closing: 'HCSS is er voor organisaties die cybersecurity serieus willen nemen, zonder dat het een enterprise-project wordt.',
  },
  services: {
    heading: 'Wat HCSS voor je doet',
    intro: 'Geen standaardpakket. HCSS bekijkt wat jouw organisatie nodig heeft en biedt precies die ondersteuning.',
    cards: [
      { title: 'Cybersecurity Assessment', body: 'Weet waar je staat. Van compact inzicht tot strategische doorlichting, gebaseerd op ISO 27001 en NIST CSF.' },
      { title: 'Security Officer as a Service', body: 'Geen eigen security officer? HCSS vult die rol in. Structureel, op maat, zolang als nodig.' },
      { title: 'Awareness & Training', body: 'Medewerkers zijn de eerste verdedigingslinie. Workshops, phishing-awareness en incident response oefeningen.' },
      { title: 'Implementatie & Advies', body: 'Van toolingselectie tot roadmap-implementatie. Praktische verbeteringen die passen bij jouw organisatie.' },
    ],
  },
  assessment: {
    eyebrow: 'Gratis · ~10 minuten',
    heading: 'Doe de Cyber Compass',
    body: 'In 10 minuten weet je waar je organisatie staat op zeven dimensies van cyberweerbaarheid. Geen IT-jargon, geen verkooppraatje — wel een eerlijke score, drie risico-observaties en concrete eerste stappen.',
    bullets: [
      'Score op 7 dimensies met radar',
      'Anoniem starten, e-mail pas bij resultaten',
      'Gebaseerd op NCSC, NIS2, CIS Controls en ENISA',
    ],
    ctaLabel: 'Start de Cyber Compass →',
    ctaHref: '/HCSS/assess',
    note: 'Liever meteen sparren? Plan een vrijblijvend kennismakingsgesprek.',
    tiers: [
      { name: 'Compact', forWho: 'Eerste inzicht, kleine organisaties', contains: 'Intakegesprek, maturityscan, compacte rapportage, adviesgesprek' },
      { name: 'Uitgebreid', forWho: 'Groeiende organisaties, structuur nodig', contains: 'Interviews, organisatorische + technische analyse, roadmap, presentatie' },
      { name: 'Strategisch', forWho: 'Complexe organisaties, governance', contains: 'Diepgaande analyse, stakeholderinterviews, governance, implementatieplan' },
    ],
    tiersNote: 'Welk assessment past, bepalen we samen in het kennismakingsgesprek.',
  },
  werkwijze: {
    heading: 'Zo werkt HCSS',
    intro: 'Cybersecurity hoeft niet ingewikkeld te zijn. HCSS werkt stapsgewijs, transparant en altijd op jouw tempo.',
    steps: [
      { title: 'Vrijblijvend kennismakingsgesprek', body: 'We beginnen met een gesprek. Waar staat je organisatie? Wat zijn je zorgen? Geen verkooppraatje, gewoon luisteren en meedenken.' },
      { title: 'Cybersecurity Assessment', body: 'Op basis van het gesprek voeren we een passend assessment uit: compact, uitgebreid of strategisch.' },
      { title: 'Rapportage & Inzicht', body: 'Je ontvangt een visuele rapportage met maturity-overzicht, quick wins en een geprioriteerde roadmap. Geen jargon-rapport.' },
      { title: 'Verbetering & Implementatie', body: 'Samen pakken we de belangrijkste verbeterpunten op. HCSS adviseert, begeleidt of werkt zelf mee.' },
      { title: 'Langdurige ondersteuning', body: 'Cybersecurity is geen eenmalig project. HCSS biedt doorlopende ondersteuning, reviews en awareness-programma’s.' },
    ],
  },
  waarom: {
    heading: 'Waarom HCSS',
    items: [
      { title: 'Lage instap', body: 'Snel een helder eerste beeld van waar je staat — zonder groot traject vooraf.' },
      { title: 'Persoonlijk', body: 'Je werkt altijd direct met Diederik, niet met een accountmanager of wisselende consultants.' },
      { title: 'Praktisch', body: 'Geen dikke rapporten die op de plank liggen. Concrete stappen die je morgen kunt zetten.' },
      { title: 'Op standaarden', body: 'Gebaseerd op ISO 27001 en NIST CSF, maar zonder de compliance-bureaucratie.' },
    ],
  },
  founder: {
    heading: 'De persoon achter HCSS',
    name: 'Diederik Hammer',
    bio: 'Diederik Hammer is oprichter en principal consultant van HCSS. Met een achtergrond in Identity & Access Management en jarenlange ervaring als Security Officer bij organisaties als KWF Kankerbestrijding en Toyota Louwman Financial Services, combineert hij technische kennis met een praktische aanpak. Hij maakt cybersecurity begrijpelijk voor iedereen in de organisatie.',
    ctaLabel: 'Plan een kennismaking',
    ctaHref: '#contact',
    credsTitle: 'Achtergrond & certificeringen',
    creds: [
      { category: 'Opleiding', detail: 'Bachelor Business Information Technology — HAN' },
      { category: 'Certificering', detail: 'CCZT — Certificate of Competence in Zero Trust (Cloud Security Alliance)' },
      { category: 'Specialisaties', detail: 'Identity & Access Management, Security Assessments, Governance, Awareness & Training' },
      { category: 'Ervaring', detail: 'Security Officer bij KWF, Principal Consultant bij SonicBee, ISO bij Toyota Louwman Financial Services' },
      { category: 'Trainer', detail: 'Gecertificeerd Cyber Security Trainer — ontwikkelt alle trainingsinhoud zelf' },
      { category: 'Branche-ervaring', detail: 'Zorg, financiële dienstverlening, automotive, onderwijs en meerdere MKB-sectoren' },
    ],
  },
  testimonials: {
    heading: 'Wat opdrachtgevers zeggen',
    items: [
      { quote: 'Diederik heeft enorm veel kennis op het gebied van cybersecurity. Hij is niet alleen een professional, maar ook een uitstekende luisteraar die altijd openstaat voor nieuwe ideeën.', role: 'Opdrachtgever — samengewerkt aan informatiebeveiliging' },
      { quote: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, met heldere taal en concrete vervolgstappen.', role: 'Rol — bijv. IT-manager, financiële dienstverlening' },
      { quote: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo. Pragmatisch, persoonlijk en zonder onnodige complexiteit.', role: 'Rol — bijv. Directeur, MKB-organisatie' },
    ],
  },
  contact: {
    heading: 'Laten we kennismaken',
    intro: 'Cybersecurity begint met een gesprek. Vertel iets over je organisatie en waar je tegenaan loopt. Diederik neemt binnen twee werkdagen contact op.',
    expectTitle: 'Wat je kunt verwachten',
    expect: [
      'Diederik neemt binnen 2 werkdagen contact op',
      'Een kort telefoongesprek of videocall van 15–20 minuten',
      'Eerlijk advies over of en hoe HCSS kan helpen',
      'Geen verplichtingen, geen verkoopdruk',
    ],
    directTitle: 'Liever direct contact?',
    email: '',
    phone: '',
    linkedin: 'https://linkedin.com/in/diederik-hammer',
    kvk: '',
    successMessage: 'Bedankt — je bericht is verstuurd. Diederik neemt binnen twee werkdagen contact op.',
  },
  faq: {
    heading: 'Veelgestelde vragen',
    items: [
      { q: 'Wat kost een assessment?', a: 'Dat hangt af van de omvang en complexiteit van je organisatie. In het kennismakingsgesprek bespreken we wat voor jouw situatie het meest zinvol is.' },
      { q: 'Is HCSS ook geschikt voor hele kleine organisaties?', a: 'Ja. Het compacte assessment is specifiek ontwikkeld voor kleinere organisaties die eerste inzicht willen. Cybersecurity begint niet bij een bepaalde bedrijfsgrootte.' },
      { q: 'Werkt HCSS ook buiten de Randstad?', a: 'HCSS werkt door heel Nederland. Veel werk kan remote, en voor assessments, workshops en trainingen komt Diederik on-site.' },
      { q: 'Ik heb al een IT-partner. Kan HCSS daarmee samenwerken?', a: 'Absoluut. HCSS vervangt je IT-partner niet, maar vult aan op het gebied van informatiebeveiliging. In de praktijk werken ze juist goed samen.' },
      { q: 'Hoe verhoudt HCSS zich tot een groot securitybedrijf?', a: 'Je werkt direct met de specialist, zonder tussenlagen. Lagere overhead, persoonlijker, flexibeler. Voor MKB is dat vaak precies wat nodig is.' },
      { q: 'Moet ik al iets weten over cybersecurity?', a: 'Nee. Juist niet. HCSS is er voor organisaties die weten dat ze iets moeten doen, maar niet precies weten wat. Diederik legt alles uit in begrijpelijke taal.' },
    ],
  },
  footer: {
    tagline: 'Pragmatische cybersecurity en cyberweerbaarheid voor het MKB.',
    legal: '© 2025–2026 Hammer Cyber Security Services. Alle rechten voorbehouden.',
  },
}

// Recursive merge: objects merge by key, arrays + scalars are replaced wholesale
// by the override when present.
export function mergeContent(base: HcssContent, override: unknown): HcssContent {
  if (!override || typeof override !== 'object') return base
  return deepMerge(base, override as Record<string, unknown>) as HcssContent
}

function deepMerge(base: unknown, over: unknown): unknown {
  if (Array.isArray(over)) return over
  if (over && typeof over === 'object' && base && typeof base === 'object' && !Array.isArray(base)) {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) }
    for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
      out[k] = k in (base as Record<string, unknown>) ? deepMerge((base as Record<string, unknown>)[k], v) : v
    }
    return out
  }
  return over === undefined ? base : over
}
