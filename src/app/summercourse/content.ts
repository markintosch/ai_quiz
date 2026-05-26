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
export interface SCCase { title: string; forWho: string; build: string; input: string; result: string }

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
  cases: {
    heading: string
    intro: string[]
    items: SCCase[]
    closingTitle: string
    closingBody: string
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
  signup: {
    heading: string
    intro: string
    ebLabel: string
    ebPrice: string
    ebSub: string
    ebHref: string
    regLabel: string
    regPrice: string
    regSub: string
    regHref: string
    note: string
  }
}

export const DEFAULT_CONTENT: SummerCourseContent = {
  hero: {
    eyebrow: 'Zomercursus · 3-daagse AI build sprint',
    title: 'Bouw in drie dagen je eigen AI-werkproces',
    subtitle:
      'Een praktische zomercursus met Frank Meeuwsen en Mark de Kock, voor professionals die Claude niet alleen willen proberen, maar echt willen toepassen in hun werk.',
    bullets: [
      '📅 7, 9 en 14 juli 2026',
      '📍 Wonders of Work, Utrecht',
      'Kleine groep — max. 12',
      'Geen programmeerkennis nodig',
      'Je werkt aan je eigen case',
      'Claude Max-abonnement zelf regelen (±€90/mnd)',
    ],
    credibility:
      'Gebaseerd op de online Claude Code cursus van Frank Meeuwsen, aangevuld met live begeleiding, strategische vertaling en persoonlijke toepassing door Mark de Kock.',
    ctaPrimary: 'Reserveer je plek',
    ctaSecondary: 'Bekijk het programma',
    note: 'Vooruitbetaling vooraf via Mollie, zoals een concertkaartje. Gaat de cursus niet door (min. 6 deelnemers)? Dan krijg je 100% terug.',
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
      'Een begeleide build sprint met een duidelijke leerboog. Dag 1 en 2 in dezelfde week (di + do), dan een week ruimte om zelf te oefenen, en dag 3 een week later om je workflow te testen en agents toe te voegen.',
    intake: {
      label: 'Vooraf',
      title: 'Intake & voorbereiding',
      body: 'Korte intake, je kiest je case en regelt je Claude Max-abonnement (±€90/maand) zodat je tijdens de sprint niet tegen tokenlimieten aanloopt. Je neemt één echte werkuitdaging mee, zodat je vanaf dag 1 aan iets van jezelf werkt.',
    },
    days: [
      {
        daynum: 'Dag 1 · di 7 juli',
        title: 'Begrijpen & kiezen',
        morning: [
          'Wat kan Claude realistisch voor jouw werk doen?',
          'Mentale modellen: Claude.ai, Projects en Claude Code',
          'Prompting voorbij de basis: context, structuur, denkstappen',
          'Live demo: Frank & Mark doen écht werk voor de groep',
        ],
        afternoon: [
          'Kies één concrete use case uit je eigen werk (ideation)',
          'Scope hem af en zet je eerste werkende prompts',
          'Daily debrief: een paar deelnemers laten zien',
        ],
      },
      {
        daynum: 'Dag 2 · do 9 juli',
        title: 'Bouwen & structureren',
        morning: [
          'Van losse prompts naar een herbruikbaar werkproces',
          'Documenten, context en instructies slim inrichten',
          'MCP voor niet-developers: koppel je eigen tools',
          'Checks & handover-logica inbouwen',
        ],
        afternoon: [
          'Bouw de eerste werkende versie van je workflow',
          'Office hours: 1-op-1 met Frank of Mark (±20 min p.p.)',
          'Daily debrief — na afloop vragen we per formulier wat je tegenkomt, zodat we dag 3 daarop afstemmen',
        ],
      },
      {
        daynum: 'Dag 3 · di 14 juli',
        title: 'Testen & toepassen — werken met agents',
        morning: [
          'Werken met agents: Claude Code en MCP voor wie geen developer is',
          'Stress-test je workflow tegen echte voorbeelden',
          '"Is dit goed?" — output evalueren en hallucinaties spotten',
          'Veilig & kritisch: privacy, GDPR, IP en kosten',
        ],
        afternoon: [
          'Eindsprint — agent-toepassing op je eigen case',
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
  cases: {
    heading: 'Voorbeeldcases die je in drie dagen kunt bouwen',
    intro: [
      'Je hoeft niet vooraf precies te weten wat je wilt maken. De meeste deelnemers komen binnen met een vaag idee, een terugkerende taak of een frustratie in hun werk. Tijdens de intake maken we daar een scherpe bouwcase van.',
      'Hieronder zie je voorbeelden van werkprocessen die goed passen bij deze driedaagse. Voor elke case geldt: hoe meer echt materiaal je meeneemt uit je eigen werk, hoe beter je workflow na drie dagen aansluit op jouw praktijk.',
    ],
    items: [
      {
        title: 'Klantdossier als AI-werkruimte',
        forWho: 'Strategen, consultants, bureaus en zelfstandigen.',
        build: 'Eén Claude Project per klant, gevuld met aanbod, notities, eerdere output, tone-of-voice en vaste prompts voor discovery, voorstellen en opvolging.',
        input: 'Een bestaande klantcase, intake-notities, eerdere voorstellen, mails, deliverables of tone-of-voice voorbeelden.',
        result: 'Je start sneller met klantwerk en hoeft minder vaak opnieuw context uit te leggen.',
      },
      {
        title: 'LinkedIn-schrijfpartner in jouw stem',
        forWho: 'Professionals die vaker willen publiceren, maar niet telkens vanaf nul willen beginnen.',
        build: 'Een schrijfproces op basis van je eigen posts, thema’s, stijl en ruwe ideeën.',
        input: '10–20 eigen posts, losse ideeën, thema’s waar je over wilt schrijven en eventueel voorbeelden van posts die je goed vindt.',
        result: 'Je maakt sneller sterke conceptposts zonder generieke AI-toon.',
      },
      {
        title: 'Voorstel- en offertegenerator',
        forWho: 'Zelfstandigen, consultants en kleine bureaus.',
        build: 'Een workflow die intake-notities of e-mailwisselingen omzet naar een conceptvoorstel in jouw eigen structuur.',
        input: 'Een recente intake, e-mailwisseling, offerte-template, dienstenbeschrijving en voorbeelden van eerdere voorstellen.',
        result: 'Je gaat sneller van goed gesprek naar professioneel voorstel, inclusief aannames, scope en open vragen.',
      },
      {
        title: 'Wekelijkse trend- of sectorwatcher',
        forWho: 'Content-, research-, marketing- en strategieprofessionals.',
        build: 'Een vaste workflow om bronnen, rapporten en losse signalen samen te vatten in jouw eigen rapportformat.',
        input: 'Nieuwsbrieven, rapporten, websites, artikelen of bronnen die je nu al gebruikt om je vak of markt te volgen.',
        result: 'Je hebt sneller overzicht én een betere vertaalslag naar wat dit betekent voor klanten, team of markt.',
      },
      {
        title: 'Van briefing naar creatief concept',
        forWho: 'Marketing-, communicatie- en creatieve professionals.',
        build: 'Een proces dat een briefing vertaalt naar meerdere denkrichtingen, met rationale, voorbeeldcopy en mogelijke visuele haakjes.',
        input: 'Een echte briefing, merkcontext, doelgroepinformatie, eerdere campagnes en voorbeelden van werk dat qua richting past.',
        result: 'Je begint conceptontwikkeling met meer structuur, betere opties en minder leeg scherm.',
      },
      {
        title: 'Maandelijkse rapportage in vast format',
        forWho: 'Marketing-, operations-, finance- of projectprofessionals.',
        build: 'Een workflow die data, notities en context omzet naar een helder maandrapport in de toon en structuur die jouw klant of directie verwacht.',
        input: 'Een bestaande rapportage, losse data, notities, KPI’s, klantfeedback en het format waarin je normaal rapporteert.',
        result: 'Rapporteren wordt geen terugkerende tijdslurper, maar een vast proces dat je steeds opnieuw kunt gebruiken.',
      },
    ],
    closingTitle: 'Staat jouw case hier niet tussen?',
    closingBody:
      'Grote kans dat hij toch past. Zolang het gaat om kenniswerk, tekst, analyse, voorbereiding, rapportage, klantoutput of terugkerende werkprocessen kunnen we er meestal een bruikbare AI-workflow van maken. Tijdens de intake helpen we je kiezen wat haalbaar, waardevol en scherp genoeg is om in drie dagen te bouwen.',
  },
  schedule: {
    heading: 'Een dag in de sprint',
    intro: 'Reken op ~24 uur begeleide bouwtijd over drie dagen. Dag 1 en 2 in dezelfde week (di + do), dag 3 een week later — zo heb je tussendoor ruimte om zelf te oefenen.',
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
    regPrice: '€999',
    onlineVsLive: 'De online cursus leert je de basis. Deze driedaagse helpt je om het toe te passen op jouw werk.',
    depositLine: 'Vooruitbetaling vooraf via Mollie — zoals een concertkaartje. Geen factuurgedoe achteraf. Prijzen excl. btw.',
    ctaLabel: 'Reserveer je plek',
    inclTitle: 'Inbegrepen',
    incl: [
      'Drie live cursusdagen met persoonlijke begeleiding (di 7, do 9 en di 14 juli)',
      'Locatie in Utrecht (Wonders of Work) incl. lunch en koffie/thee',
      'Office hours op dag 2 — 1-op-1 met Frank of Mark (±20 min)',
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
      { q: 'Wat als er minder dan 6 inschrijvingen zijn?', a: 'Dan gaat de cursus niet door en krijg je je betaling 100% terug.' },
      { q: 'Kan ik op bedrijfsnaam factureren?', a: 'Ja. Bij de inschrijving vul je je bedrijfs- en btw-gegevens in; je krijgt een factuur op naam van je bedrijf voor de vooruitbetaling.' },
      { q: 'Wat moet ik meenemen?', a: 'Je laptop met oplader en één echte werkuitdaging. Een Claude Max-abonnement (±€90/maand) regel je zelf vooraf — daar werken we tijdens de sprint mee zodat je niet tegen tokenlimieten aanloopt.' },
      { q: 'Waarom een week tussen dag 2 en dag 3?', a: 'Dan heb je ruimte om je workflow zelf uit te proberen. Na dag 2 vragen we per formulier wat je tegenkomt, zodat we dag 3 daarop afstemmen — met een focus op agents en toepassing.' },
      { q: 'Wat is de locatie?', a: 'Wonders of Work in Utrecht, op loopafstand van het centrum. Lunch en koffie/thee zijn inbegrepen.' },
    ],
  },
  signup: {
    heading: 'Reserveer en betaal je plek',
    intro:
      'Vooruitbetaling vooraf via Mollie — veilig en in één keer geregeld, zoals een concertkaartje. Je krijgt direct een bevestiging en daarna van ons de voorbereiding voor dag 1.',
    // ── Frank: vervang de twee href-waarden hieronder door je Mollie Payment Links.
    ebLabel: 'Early-bird',
    ebPrice: '€799',
    ebSub: 'eerste 6 plekken · excl. btw',
    ebHref: 'https://www.mollie.com/payment/REPLACE_WITH_EARLYBIRD_LINK',
    regLabel: 'Regulier',
    regPrice: '€999',
    regSub: 'excl. btw',
    regHref: 'https://www.mollie.com/payment/REPLACE_WITH_REGULAR_LINK',
    note: 'Veilig betalen via Mollie · iDEAL, creditcard, Bancontact. Gaat de cursus niet door (min. 6 deelnemers)? Dan krijg je 100% terug.',
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
