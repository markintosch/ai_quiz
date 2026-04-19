/**
 * src/lib/insights/posts.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Source of truth for /insights content. MDX-free: posts are typed data so
 * they flow cleanly into sitemap, RSS, JSON-LD, and the Next.js route
 * without additional dependencies.
 */

export type InsightLocale = 'nl' | 'en'

export interface InsightPost {
  slug:        string
  locale:      InsightLocale
  title:       string
  description: string
  published:   string // ISO date
  updated?:    string
  readMinutes: number
  keywords:    string[]
  /** translation of this post in the other locale */
  translation?: { locale: InsightLocale; slug: string }
  body: Array<
    | { type: 'p';  text: string }
    | { type: 'h2'; text: string }
    | { type: 'h3'; text: string }
    | { type: 'ul'; items: string[] }
    | { type: 'quote'; text: string; attribution?: string }
  >
}

// ── Posts ─────────────────────────────────────────────────────────────────────

const posts: InsightPost[] = [
  {
    slug:        'ai-strategie-voor-leiders',
    locale:      'nl',
    title:       'AI-strategie voor leiders: van ambitie naar iets wat werkt',
    description:
      'Waarom de meeste AI-trajecten vastlopen in het midden — en wat er nodig is om een strategie te laten landen in de organisatie.',
    published:   '2026-03-04',
    readMinutes: 7,
    keywords: [
      'AI strategie', 'AI mentor', 'strategisch mentor AI', 'AI implementatie',
      'digitale transformatie leiderschap', 'AI readiness',
    ],
    translation: { locale: 'en', slug: 'ai-strategy-for-leaders' },
    body: [
      { type: 'p', text:
        'De meeste leidinggevenden die ik spreek hebben geen tekort aan informatie over AI. Ze hebben een tekort aan richting. Er zijn tools, er zijn use cases, er zijn vendors. Wat ontbreekt is de vertaling van strategische ambitie naar keuzes die teams daadwerkelijk maken op maandagochtend.',
      },
      { type: 'h2', text: 'Het gat tussen strategie en uitvoering' },
      { type: 'p', text:
        'Een AI-strategie op papier is iets anders dan beweging in een organisatie. Goede plannen stranden steeds op dezelfde plek: de ruimte tussen directie en uitvoering. Marketing werkt door op zijn eigen agenda. Sales grijpt naar tools onder druk. Operations wacht tot er een KPI verandert. Niemand heeft slechte intenties. Er is alleen geen gedeeld kader.',
      },
      { type: 'h2', text: 'Drie patronen die ik telkens zie' },
      { type: 'ul', items: [
        'Tools worden gekocht voordat de vraag is geformuleerd. Het voelt als beweging, maar een tool is geen antwoord op een vraag die nog niet is gesteld.',
        'Governance wordt behandeld als een remvlak, niet als enabler. Het gevolg: voorzichtigheid wint, en de organisatie leert niet.',
        'Er is geen enkele plek waar de keuzes zichtbaar worden. Zonder overzicht raakt elk MT-lid verdwaald in zijn eigen hoek.',
      ]},
      { type: 'h2', text: 'Waar ik wel begin' },
      { type: 'p', text:
        'Niet met technologie. Met de vraag welke beslissingen nu genomen moeten worden en door wie. Dat klinkt bestuurlijk saai, maar het is precies wat een organisatie in beweging brengt. Pas dan heeft een eerste use case betekenis — niet als pilot, maar als test van de richting.',
      },
      { type: 'quote', text:
        'AI is zelden het probleem. De vertaling tussen ambitie en werkelijkheid wel.',
      },
      { type: 'h2', text: 'Wat werkt' },
      { type: 'ul', items: [
        'Eén gedeeld kader waar iedereen op stuurt — zichtbaar, niet alleen besproken.',
        'Twee of drie use cases waarvan de criteria voor succes vóóraf vastliggen.',
        'Een MT dat in hetzelfde tempo leert — geen versnipperde kennis per afdeling.',
        'Externe begeleiding die verdwijnt zodra het intern staat. Geen permanent adviesmodel.',
      ]},
      { type: 'p', text:
        'Als dat er ligt, wordt AI niet meer het onderwerp van elke vergadering. Dan wordt het het middel waarmee andere onderwerpen sneller worden opgelost. Dat is het punt waar je naartoe wilt.',
      },
    ],
  },
  {
    slug:        'ai-strategy-for-leaders',
    locale:      'en',
    title:       'AI strategy for leaders: from ambition to something that works',
    description:
      'Why most AI initiatives stall in the middle — and what it takes to turn a strategy into real movement inside an organisation.',
    published:   '2026-03-04',
    readMinutes: 7,
    keywords: [
      'AI strategy', 'AI mentor', 'strategic AI advisor', 'AI implementation',
      'digital transformation leadership', 'AI readiness',
    ],
    translation: { locale: 'nl', slug: 'ai-strategie-voor-leiders' },
    body: [
      { type: 'p', text:
        'Most leaders I speak with do not lack information about AI. They lack direction. There are tools, there are vendors, there are endless use cases. What is missing is the translation of strategic ambition into choices teams actually make on Monday morning.',
      },
      { type: 'h2', text: 'The gap between strategy and execution' },
      { type: 'p', text:
        'An AI strategy on paper is not the same as movement in an organisation. Good plans keep failing in the same place: the space between the boardroom and the floor. Marketing stays on its own agenda. Sales grabs tools under pressure. Operations waits for a KPI to change. No one has bad intentions. There is simply no shared frame.',
      },
      { type: 'h2', text: 'Three patterns I keep seeing' },
      { type: 'ul', items: [
        'Tools get bought before the question is framed. It feels like motion, but a tool is not the answer to a question that has not been asked.',
        'Governance is treated as a brake, not as an enabler. Caution wins, and the organisation does not learn.',
        'There is no single place where the choices are visible. Without that, each leader gets lost in their own corner.',
      ]},
      { type: 'h2', text: 'Where I do start' },
      { type: 'p', text:
        'Not with technology. With the question of which decisions need to be made now, and by whom. That sounds dull, but it is exactly what gets an organisation moving. Only then does a first use case mean something — not as a pilot, but as a test of the direction.',
      },
      { type: 'quote', text:
        'AI is rarely the problem. The translation between ambition and reality is.',
      },
      { type: 'h2', text: 'What works' },
      { type: 'ul', items: [
        'One shared frame everyone steers by — visible, not merely discussed.',
        'Two or three use cases whose success criteria are fixed up front.',
        'A leadership team that learns at the same pace — no fragmented knowledge per department.',
        'External guidance that disappears as soon as it holds internally. No permanent advisory model.',
      ]},
      { type: 'p', text:
        'When that is in place, AI stops being the subject of every meeting. It becomes the instrument by which other subjects get solved faster. That is the point you want to reach.',
      },
    ],
  },
  {
    slug:        'shadow-ai-in-organisaties',
    locale:      'nl',
    title:       'Shadow AI: het signaal dat je organisatie klaar is, maar je strategie nog niet',
    description:
      'Waarom medewerkers sneller AI gebruiken dan directies kunnen sturen — en waarom dat geen risico is, maar een diagnose.',
    published:   '2026-03-25',
    readMinutes: 6,
    keywords: [
      'Shadow AI', 'AI governance', 'AI beleid', 'AI risico',
      'AI in organisaties', 'AI change management',
    ],
    translation: { locale: 'en', slug: 'shadow-ai-in-organisations' },
    body: [
      { type: 'p', text:
        'In bijna elke diagnose die ik doe komt hetzelfde patroon terug. Medewerkers gebruiken meer AI dan de directie weet. Niet in het klein — op schaal, in hun dagelijkse werk. Ze doen dat niet uit roekeloosheid. Ze doen dat omdat het werkt en omdat er geen beleid is dat hen stuurt.',
      },
      { type: 'h2', text: 'Waarom "verbieden" nooit een oplossing is' },
      { type: 'p', text:
        'Een verbod op publieke AI-tools verdwijnt binnen drie maanden uit het geheugen van een organisatie. Mensen werken om het verbod heen omdat de productiviteitswinst te groot is. Wat je overhoudt is een organisatie die AI gebruikt zónder dat je weet waar, hoe of met welke data.',
      },
      { type: 'h2', text: 'Shadow AI als diagnose' },
      { type: 'p', text:
        'Als Shadow AI hoog is terwijl je formele strategie laag scoort, is dat geen risico — dat is een signaal. Je medewerkers zijn verder dan je beleid. De juiste reactie is niet paniek, maar een gesprek: wat gebruiken jullie, waarvoor, en wat zouden jullie willen doen als het wél mocht?',
      },
      { type: 'quote', text:
        'Shadow AI is niet het probleem. Het tekort aan beleid dat erbij past wel.',
      },
      { type: 'h2', text: 'Wat te doen' },
      { type: 'ul', items: [
        'Inventariseer zonder oordeel. Laat teams delen wat ze gebruiken. Luister eerst.',
        'Maak onderscheid tussen publieke tools, betaalde tools en ingebedde tools. Elk vraagt een ander kader.',
        'Stel minimale kaders op rond data, klantinformatie en besluitvorming. Niet meer dan nodig.',
        'Gebruik de inventarisatie als input voor je strategie. Je medewerkers zijn je beste onderzoek.',
      ]},
      { type: 'p', text:
        'De organisaties die dit goed doen, maken van Shadow AI een versneller. Ze halen de beste praktijken naar boven, schalen wat werkt, en bouwen beleid dat past bij wat er écht gebeurt — niet bij wat ze hoopten dat zou gebeuren.',
      },
    ],
  },
  {
    slug:        'shadow-ai-in-organisations',
    locale:      'en',
    title:       'Shadow AI: the signal that your organisation is ready, but your strategy is not',
    description:
      'Why employees adopt AI faster than leadership can steer — and why that is not a risk, but a diagnosis.',
    published:   '2026-03-25',
    readMinutes: 6,
    keywords: [
      'Shadow AI', 'AI governance', 'AI policy', 'AI risk',
      'AI in organisations', 'AI change management',
    ],
    translation: { locale: 'nl', slug: 'shadow-ai-in-organisaties' },
    body: [
      { type: 'p', text:
        'Almost every diagnosis I run shows the same pattern. Employees are using more AI than leadership knows. Not in small pockets — at scale, in their everyday work. They are not being reckless. They are doing it because it works and because no policy exists to guide them.',
      },
      { type: 'h2', text: 'Why "banning" is never the answer' },
      { type: 'p', text:
        'A ban on public AI tools disappears from an organisation\'s memory within three months. People work around it because the productivity gain is too large. What you end up with is an organisation that uses AI without you knowing where, how, or with which data.',
      },
      { type: 'h2', text: 'Shadow AI as diagnosis' },
      { type: 'p', text:
        'When Shadow AI is high while your formal strategy scores low, that is not a risk — it is a signal. Your people are ahead of your policy. The right response is not panic, but conversation: what are you using, what for, and what would you do if it were explicitly allowed?',
      },
      { type: 'quote', text:
        'Shadow AI is not the problem. The absence of matching policy is.',
      },
      { type: 'h2', text: 'What to do' },
      { type: 'ul', items: [
        'Map it without judgement. Let teams share what they use. Listen first.',
        'Distinguish public tools, paid tools, and embedded tools. Each needs its own frame.',
        'Set minimal guardrails around data, customer information, and decision-making. No more than needed.',
        'Use the map as input for your strategy. Your employees are your best research.',
      ]},
      { type: 'p', text:
        'Organisations that handle this well turn Shadow AI into an accelerator. They surface the best practices, scale what works, and build policy that fits what is actually happening — not what they had hoped would happen.',
      },
    ],
  },
]

export function getAllPosts(): InsightPost[] {
  return [...posts].sort((a, b) => b.published.localeCompare(a.published))
}

export function getPostsByLocale(locale: InsightLocale): InsightPost[] {
  return getAllPosts().filter(p => p.locale === locale)
}

export function getPost(locale: InsightLocale, slug: string): InsightPost | undefined {
  return posts.find(p => p.locale === locale && p.slug === slug)
}

export function getAllSlugs(): Array<{ locale: InsightLocale; slug: string }> {
  return posts.map(({ locale, slug }) => ({ locale, slug }))
}
