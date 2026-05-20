// Content model + defaults for the Summer Course Claude AI page.
// The public page (src/app/summercourse/page.tsx) reads an override blob from
// Supabase `site_content` (product_key 'summer_course', locale 'nl') and deep-
// merges it over these defaults, so the page renders fully even before any CMS
// edit. The admin editor (src/app/admin/summercourse) saves the whole object back.

export interface SCCard { tag: string; title: string; body: string }
export interface SCDay { daynum: string; title: string; morning: string[]; afternoon: string[] }
export interface SCRow { time: string; text: string }
export interface SCHost { initials: string; name: string; bio: string }
export interface SCFaq { q: string; a: string }

export interface SummerCourseContent {
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    badges: string[]
    ctaPrimary: string
    ctaSecondary: string
    note: string
  }
  audience: {
    heading: string
    intro: string
    cards: SCCard[]
    exclTitle: string
    exclBody: string
  }
  goals: { heading: string; items: string[] }
  program: { heading: string; intro: string; days: SCDay[] }
  schedule: { heading: string; intro: string; rows: SCRow[] }
  hosts: { heading: string; people: SCHost[] }
  pricing: {
    heading: string
    ebLabel: string
    ebPrice: string
    regPrice: string
    depositLine: string
    ctaLabel: string
    inclTitle: string
    incl: string[]
  }
  faq: { heading: string; items: SCFaq[] }
  signup: { heading: string; intro: string; ctaLabel: string; ctaHref: string }
}

export const DEFAULT_CONTENT: SummerCourseContent = {
  hero: {
    eyebrow: 'Summer Course · Editie 2026',
    title: 'Drie dagen Claude AI. Eén werkend recept dat van jou is.',
    subtitle:
      'Geen losse trucs, maar een persoonlijke AI-workflow verankerd in je eigen werk. Kleine groep, veel handen-uit-de-mouwen, begeleid door Mark de Kock & Frank Meeuwsen.',
    badges: ['📅 3 aaneengesloten dagen', '👥 Max. 12 deelnemers', '📍 Locatie n.t.b. — NL', '🗣️ Nederlandstalig'],
    ctaPrimary: 'Reserveer je plek · €199 aanbetaling',
    ctaSecondary: 'Bekijk het programma',
    note: 'Aanbetaling reserveert je plek. Gaat de cursus niet door (min. 6 deelnemers)? Dan krijg je 100% terug.',
  },
  audience: {
    heading: 'Voor wie is dit?',
    intro:
      'Voor knowledge workers die Claude écht in hun werk willen inzetten — niet voor de hardcore programmeurs onder ons.',
    cards: [
      { tag: 'Marketeers & makers', title: 'Content & research', body: 'Schrijfwerk, research, contentworkflows — van uren naar minuten, met behoud van jouw stem.' },
      { tag: 'Ondernemers & freelancers', title: 'Je tweede brein', body: 'Claude als hefboom voor je praktijk: voorstellen, klantwerk, de administratie die blijft liggen.' },
      { tag: 'Knowledge workers', title: 'Strategen & redacteuren', body: 'Consultants, beleidsmensen, redacteuren die AI-fluency willen die verder gaat dan een chatvenster.' },
    ],
    exclTitle: 'Niet voor: hardcore programmeurs',
    exclBody:
      'Bouw je dagelijks met de API en ken je je weg in een terminal? Dan haal je hier te weinig uit. Lichte technische affiniteit zonder dev-achtergrond? Juist welkom.',
  },
  goals: {
    heading: 'Waar loop je mee weg',
    items: [
      'Een werkend Claude-recept — een persoonlijke workflow die je dag-3 al gebruikt, niet een mapje met losse prompts.',
      'Bagage om zelf verder te bouwen — Projects, MCP-koppelingen, agents en de juiste modelkeuze (Opus / Sonnet / Haiku) met kostenbesef.',
      'Een kritische, ethische blik — privacy & GDPR, IP, bias en hallucinaties: wanneer Claude briljant is, en wanneer je hem juist níét inzet.',
    ],
  },
  program: {
    heading: 'Het programma',
    intro:
      'Elke ochtend een vast programma: theorie, live demo en een werkblok. Elke middag bouw je aan je eigen project, terwijl Mark & Frank rondlopen.',
    days: [
      {
        daynum: 'Dag 1',
        title: 'Foundations & mindset',
        morning: [
          'Wat ís Claude? Anthropic, modellen, wanneer welk model',
          'Mentale modellen: Claude.ai vs API vs Claude Code',
          'Prompting voorbij de basis: context, structuur, denkstappen',
          'Live demo: Mark & Frank doen écht werk voor de groep',
        ],
        afternoon: [
          'Kies je eigen project: "waar wil ik dag 3 mee thuiskomen?"',
          'Scopen, eerste prompts, Projects opzetten',
          'Daily debrief: 3 deelnemers laten zien',
        ],
      },
      {
        daynum: 'Dag 2',
        title: 'Diepte & gereedschap',
        morning: [
          'Projects, artifacts & file uploads als productieomgeving',
          'MCP uitgelegd voor niet-developers (Notion, Gmail, Drive, Agenda)',
          'Agents & workflows: chat, agent of Claude Code?',
          'Light intro Claude Code — conversationeel bouwen',
        ],
        afternoon: [
          'Doorbouwen met Projects + MCP',
          'Office-hours 1-op-1’s op inschrijving',
          'Daily debrief',
        ],
      },
      {
        daynum: 'Dag 3',
        title: 'Shippen & volhouden',
        morning: [
          '"Is dit goed?" — output evalueren, hallucinaties spotten',
          'Ethiek, bias, IP, privacy, GDPR & NDA-werk',
          'Kostenbewustzijn: tokens, abonnementen, API-prijzen',
          'Volhouden: rituelen, prompt-bibliotheek, communities',
        ],
        afternoon: [
          'Eindsprint eigen project',
          'Slot-presentaties: iedereen 5 minuten',
          'Borrel',
        ],
      },
    ],
  },
  schedule: {
    heading: 'Een dag in de cursus',
    intro:
      'Reken op ~24 uur contact over drie dagen. Geen verplicht huiswerk — wel optioneel doorprutsen tussendoor.',
    rows: [
      { time: '09:00–09:30', text: 'Inloop & koffie' },
      { time: '09:30–12:30', text: 'Vast ochtendprogramma — theorie, live demo & werkblok in de groep' },
      { time: '12:30–13:30', text: 'Lunch (verzorgd)' },
      { time: '13:30–17:00', text: 'Eigen project bouwen onder begeleiding — Mark & Frank lopen rond, korte 1-op-1’s' },
      { time: '17:00–17:30', text: 'Daily debrief — 3 deelnemers presenteren' },
    ],
  },
  hosts: {
    heading: 'Je begeleiders',
    people: [
      { initials: 'MdK', name: 'Mark de Kock', bio: '[Korte bio — wat doe je, waarom geef je deze cursus, één concrete Claude-win uit je eigen werk.]' },
      { initials: 'FM', name: 'Frank Meeuwsen', bio: '[Korte bio — achtergrond, schrijven/AI, waarom jij dit samen met Mark doet.]' },
    ],
  },
  pricing: {
    heading: 'Investering',
    ebLabel: 'Early-bird · eerste 6 plekken',
    ebPrice: '€799',
    regPrice: '€899',
    depositLine: 'Reserveer met €199 aanbetaling. Restant per factuur, uiterlijk 14 dagen voor aanvang.',
    ctaLabel: 'Reserveer je plek',
    inclTitle: 'Inbegrepen',
    incl: [
      '3 dagen begeleiding door Mark & Frank',
      'Lunch, koffie/thee & slotborrel',
      'Digitale cursusgids met alle prompts & links',
      '3 maanden afterparty-community',
      '1 follow-up gesprek (30 min, online) na 4 weken',
    ],
  },
  faq: {
    heading: 'Veelgestelde vragen',
    items: [
      { q: 'Moet ik al ervaring met AI hebben?', a: 'Basiservaring met ChatGPT of Claude is een pré, geen vereiste. Via je motivatie bij de inschrijving stemmen we de groep af.' },
      { q: 'In welke taal is de cursus?', a: 'Nederlandstalig. Materiaal en voorbeelden zijn deels Engels (zoals de tools zelf).' },
      { q: 'Wat als er minder dan 6 inschrijvingen zijn?', a: 'Dan gaat de cursus niet door en krijg je je aanbetaling 100% terug.' },
      { q: 'Kan ik op bedrijfsnaam factureren?', a: 'Ja. Bij de inschrijving vul je je bedrijfs- en btw-gegevens in; de factuur voor het restbedrag zetten we daarop.' },
      { q: 'Wat moet ik meenemen?', a: 'Je laptop met oplader en een claude.ai-account. Verder regelen we alles op locatie.' },
      { q: 'Hoe zit het met annuleren?', a: '[Annuleringsvoorwaarden n.t.b. — staffel op basis van dagen voor aanvang.]' },
    ],
  },
  signup: {
    heading: 'Reserveer je plek',
    intro:
      'De online inschrijving met aanbetaling volgt binnenkort. Wil je nu al een plek? Mail ons — dan zetten we je op de lijst.',
    ctaLabel: 'Mail ons je interesse',
    ctaHref: 'mailto:hello@markdekock.com?subject=Summer%20Course%20Claude%20AI',
  },
}

// Recursive merge: objects merge by key, arrays + scalars are replaced wholesale
// by the override when present. Lets the saved blob fill in only what changed
// while new default fields still appear.
export function mergeContent(
  base: SummerCourseContent,
  override: unknown,
): SummerCourseContent {
  if (!override || typeof override !== 'object') return base
  return deepMerge(base, override as Record<string, unknown>) as SummerCourseContent
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
