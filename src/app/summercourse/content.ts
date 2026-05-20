// Content model + defaults for the Summer Course Claude AI page.
// The public page (src/app/summercourse/page.tsx) reads an override blob from
// Supabase `site_content` (product_key 'summer_course', locale 'nl') and deep-
// merges it over these defaults, so the page renders fully even before any CMS
// edit. The admin editor (src/app/admin/summercourse) saves the whole object back.

export interface SCDay { daynum: string; title: string; morning: string[]; afternoon: string[] }
export interface SCRow { time: string; text: string }
export interface SCHost { initials: string; name: string; bio: string }
export interface SCFaq { q: string; a: string }
export interface SCPhase { label: string; title: string; body: string }

export interface SummerCourseContent {
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    bullets: string[]
    credibility: string
    ctaPrimary: string
    ctaSecondary: string
    note: string
  }
  problem: { heading: string; paragraphs: string[] }
  outcome: { heading: string; intro: string; items: string[] }
  audience: {
    heading: string
    intro: string
    forTitle: string
    forItems: string[]
    notTitle: string
    notItems: string[]
  }
  program: {
    heading: string
    intro: string
    intake: SCPhase
    days: SCDay[]
    after: SCPhase
  }
  schedule: { heading: string; intro: string; rows: SCRow[] }
  hosts: { heading: string; intro: string; people: SCHost[] }
  pricing: {
    heading: string
    ebLabel: string
    ebPrice: string
    regPrice: string
    onlineVsLive: string
    depositLine: string
    ctaLabel: string
    inclTitle: string
    incl: string[]
    scarcity: string
  }
  faq: { heading: string; items: SCFaq[] }
  signup: { heading: string; intro: string; ctaLabel: string; ctaHref: string }
}

export const DEFAULT_CONTENT: SummerCourseContent = {
  hero: {
    eyebrow: 'Zomercursus · 3-daagse AI build sprint',
    title: 'Bouw in drie dagen je eigen AI-werkproces',
    subtitle:
      'Een praktische zomercursus met Frank Meeuwsen en Mark de Kock, voor professionals die Claude niet alleen willen proberen, maar echt willen toepassen in hun werk.',
    bullets: [
      '3 dagen live begeleiding',
      'Kleine groep — max. 12',
      'Geen programmeerkennis nodig',
      'Je werkt aan je eigen case',
      'Inclusief toegang tot de online Claude Code cursus',
    ],
    credibility:
      'Gebaseerd op de online Claude Code cursus van Frank Meeuwsen, aangevuld met live begeleiding, strategische vertaling en persoonlijke toepassing door Mark de Kock.',
    ctaPrimary: 'Reserveer je plek',
    ctaSecondary: 'Bekijk het programma',
    note: 'Aanbetaling reserveert je plek. Gaat de cursus niet door (min. 6 deelnemers)? Dan krijg je 100% terug.',
  },
  problem: {
    heading: 'Van proberen naar gebruiken',
    paragraphs: [
      'De meeste mensen blijven hangen in "AI uitproberen". Je test wat prompts, je leest LinkedIn-posts, je kijkt demo’s — maar je dagelijkse werk verandert niet echt.',
      'Deze driedaagse is voor wie de stap zet van experimenteren naar echt gebruiken. Je werkt niet aan oefencases. Je werkt aan je eigen werk.',
    ],
  },
  outcome: {
    heading: 'Wat je meeneemt',
    intro: 'Geen aantekeningen die in een la verdwijnen, maar iets wat je maandag erna direct gebruikt.',
    items: [
      'Een eigen Claude-workflow voor een echte taak uit jouw werk',
      'Een set herbruikbare prompts en instructies',
      'Een beter begrip van context, bestanden, checks en outputkwaliteit',
      'Een eenvoudige werkwijze om Claude veilig en kritisch in te zetten',
      'Een concreet vervolgplan voor jezelf of je team',
    ],
  },
  audience: {
    heading: 'Voor wie is dit?',
    intro: 'Voor professionals die werken met kennis, tekst, plannen, analyse, ideeën of klantwerk.',
    forTitle: 'Wel voor',
    forItems: [
      'Content- & researchprofessionals',
      'Marketing, communicatie en strategie',
      'Zelfstandigen en kleine teams',
      'Iedereen die werkt met kennis, tekst, plannen, analyse of klantoutput',
    ],
    notTitle: 'Niet voor',
    notItems: [
      'Mensen die alleen willen luisteren',
      'Wie een diepe technische programmeercursus zoekt',
      'Wie generieke AI-inspiratie wil zonder zelf te bouwen',
    ],
  },
  program: {
    heading: 'Het programma',
    intro:
      'Een begeleide build sprint met een duidelijke leerboog. Elke ochtend een vast programma, elke middag bouwen aan je eigen case.',
    intake: {
      label: 'Vooraf',
      title: 'Intake & voorbereiding',
      body: 'Korte intake en je kiest je case. Je neemt één echte werkuitdaging mee, zodat je vanaf dag 1 aan iets van jezelf werkt.',
    },
    days: [
      {
        daynum: 'Dag 1',
        title: 'Begrijpen & kiezen',
        morning: [
          'Wat kan Claude realistisch voor jouw werk doen?',
          'Mentale modellen: Claude.ai, Projects en Claude Code',
          'Prompting voorbij de basis: context, structuur, denkstappen',
          'Live demo: Frank & Mark doen écht werk voor de groep',
        ],
        afternoon: [
          'Kies één concrete use case uit je eigen werk',
          'Scope hem af en zet je eerste werkende prompts',
          'Daily debrief: een paar deelnemers laten zien',
        ],
      },
      {
        daynum: 'Dag 2',
        title: 'Bouwen & structureren',
        morning: [
          'Van losse prompts naar een herbruikbaar werkproces',
          'Documenten, context en instructies slim inrichten',
          'MCP voor niet-developers: koppel je eigen tools',
          'Checks & handover-logica inbouwen',
        ],
        afternoon: [
          'Bouw de eerste werkende versie van je workflow',
          'Office-hours: 1-op-1 met Frank of Mark',
          'Daily debrief',
        ],
      },
      {
        daynum: 'Dag 3',
        title: 'Testen & toepasbaar maken',
        morning: [
          '"Is dit goed?" — output evalueren en hallucinaties spotten',
          'Veilig & kritisch: privacy, GDPR, IP en bias',
          'Kostenbewustzijn: tokens, abonnementen, modelkeuze',
          'Je werkwijze documenteren als simpele handleiding',
        ],
        afternoon: [
          'Stress-test je workflow tegen echte voorbeelden',
          'Slot-presentaties: iedereen laat z’n werkproces zien',
          'Vervolgplan + borrel',
        ],
      },
    ],
    after: {
      label: 'Achteraf',
      title: 'Toegang & opvolging',
      body: 'Toegang tot de online Claude Code cursus en een optioneel terugkommoment om je workflow te verbeteren of klaar te maken voor je team.',
    },
  },
  schedule: {
    heading: 'Een dag in de sprint',
    intro: 'Reken op ~24 uur begeleide bouwtijd over drie dagen. Geen verplicht huiswerk — wel optioneel doorbouwen tussendoor.',
    rows: [
      { time: '09:00–09:30', text: 'Inloop & koffie' },
      { time: '09:30–12:30', text: 'Vast ochtendprogramma — theorie, live demo & werkblok in de groep' },
      { time: '12:30–13:30', text: 'Lunch (verzorgd)' },
      { time: '13:30–17:00', text: 'Bouwen aan je eigen case onder begeleiding — Frank & Mark lopen rond, korte 1-op-1’s' },
      { time: '17:00–17:30', text: 'Daily debrief — een paar deelnemers presenteren' },
    ],
  },
  hosts: {
    heading: 'Je begeleiders',
    intro:
      'Frank brengt de praktische AI- en Claude-ervaring; Mark vertaalt het naar strategie, werkproces en toepassing in je organisatie.',
    people: [
      { initials: 'FM', name: 'Frank Meeuwsen', bio: 'Maakt AI al jaren praktisch toepasbaar. Maker van de online Claude Code cursus en stem van "minder práten over AI, meer dóén".' },
      { initials: 'MdK', name: 'Mark de Kock', bio: 'Brengt strategie naar uitvoering. Helpt professionals en teams AI vertalen naar een werkend werkproces. Partner bij Kirk & Blackbeard.' },
    ],
  },
  pricing: {
    heading: 'Investering',
    ebLabel: 'Early-bird · eerste 6 plekken',
    ebPrice: '€799',
    regPrice: '€899',
    onlineVsLive: 'De online cursus leert je de basis. Deze driedaagse helpt je om het toe te passen op jouw werk.',
    depositLine: 'Reserveer met €199 aanbetaling. Restant per factuur, uiterlijk 14 dagen voor aanvang. Prijzen excl. btw.',
    ctaLabel: 'Reserveer je plek',
    inclTitle: 'Inbegrepen',
    incl: [
      'Drie live cursusdagen met persoonlijke begeleiding',
      'Lunch, koffie/thee & slotborrel',
      'Toegang tot de online Claude Code cursus',
      'Een eigen uitgewerkte, herbruikbare workflow',
      'Een follow-up gesprek (30 min, online) na 4 weken',
    ],
    scarcity: 'Kleine groep, veel persoonlijke begeleiding. Daarom is het aantal plekken beperkt.',
  },
  faq: {
    heading: 'Veelgestelde vragen',
    items: [
      { q: 'Wat is het verschil met de online Claude Code cursus?', a: 'De online cursus leert je in je eigen tempo de basis. Tijdens deze driedaagse pas je het onder begeleiding toe op je eigen werk — met live feedback, bouwtijd en accountability. Toegang tot de online cursus zit bij de driedaagse inbegrepen.' },
      { q: 'Moet ik al ervaring met AI hebben?', a: 'Basiservaring met ChatGPT of Claude is een pré, geen vereiste. Via de intake stemmen we de groep en jouw case af.' },
      { q: 'Heb ik programmeerkennis nodig?', a: 'Nee. We werken vanuit je eigen werk, niet vanuit code. Lichte technische affiniteit is mooi meegenomen, maar geen voorwaarde.' },
      { q: 'In welke taal is de cursus?', a: 'Nederlandstalig. Materiaal en voorbeelden zijn deels Engels (zoals de tools zelf).' },
      { q: 'Wat als er minder dan 6 inschrijvingen zijn?', a: 'Dan gaat de cursus niet door en krijg je je aanbetaling 100% terug.' },
      { q: 'Kan ik op bedrijfsnaam factureren?', a: 'Ja. Bij de inschrijving vul je je bedrijfs- en btw-gegevens in; de factuur voor het restbedrag zetten we daarop.' },
      { q: 'Wat moet ik meenemen?', a: 'Je laptop met oplader, een claude.ai-account en één echte werkuitdaging. Verder regelen we alles op locatie.' },
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
