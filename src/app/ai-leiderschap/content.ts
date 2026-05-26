// Content model + defaults for the "AI impact op leiderschap" pre-registration
// page (CMO/CDO/CEO-audience). One hard event date with two slots (ochtend +
// middag), each booked + paid via Mollie. A waitlist below the slots captures
// interest for follow-up editions. CMS-editable via /admin/ai-leiderschap.

export interface AILItem { title: string; body: string }
export interface AILHost { initials: string; name: string; role: string; bio: string; photo: string }
export interface AILFact { label: string; value: string }
export interface AILFaq { q: string; a: string }
export interface AILStep { label: string; title: string; body: string }
export interface AILSlot { id: string; label: string; time: string; price: string; mollieHref: string; note: string }
export interface AILTestimonial { quote: string; name: string; role: string }

export interface AILContent {
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    eventDate: string        // e.g. "Maandag 29 juni 2026"
    eventLocation: string
    bullets: string[]
    ctaPrimary: { label: string; href: string }
    ctaSecondary: { label: string; href: string }
    note: string
  }
  problem: { heading: string; body: string }
  audience: { heading: string; intro: string; roles: string[]; scenarios: string[]; note: string }
  program: { heading: string; intro: string; items: AILItem[] }
  trajectory: { heading: string; intro: string; steps: AILStep[] }
  hosts: { heading: string; intro: string; people: AILHost[] }
  testimonials: { heading: string; items: AILTestimonial[] }
  practical: { heading: string; facts: AILFact[] }
  slots: {
    heading: string
    intro: string
    items: AILSlot[]
    payNote: string
  }
  waitlist: {
    heading: string
    intro: string
    successMessage: string
  }
  faq: { heading: string; items: AILFaq[] }
  footer: { tagline: string; legal: string }
}

export const DEFAULT_CONTENT: AILContent = {
  hero: {
    eyebrow: 'Executive middag · met Ben van den Burg & Mark de Kock',
    title: 'AI impact op leiderschap',
    subtitle: 'Een praktische middag voor CEO, CMO en CDO over wat AI vraagt van hoe je leidt. Gevolgd door een gefaciliteerd 90-dagen-traject zodat de keuzes die je maakt ook landen.',
    eventDate: 'Maandag 29 juni 2026',
    eventLocation: 'Utrecht (locatie wordt gedeeld bij bevestiging)',
    bullets: [
      '📅 Maandag 29 juni 2026',
      '📍 Utrecht',
      'Kies tussen ochtend of middag',
      'Max. 20 deelnemers per sessie',
      'Inclusief 90-dagen-vervolgtraject',
      'Begeleid door Ben van den Burg & Mark de Kock',
    ],
    ctaPrimary: { label: 'Boek je plek →', href: '#boeken' },
    ctaSecondary: { label: 'Bekijk het programma', href: '#programma' },
    note: 'Beide sessies gaan door bij minimaal 10 inschrijvingen. Vooruitbetaling via Mollie. Excl. btw.',
  },
  problem: {
    heading: 'AI is een leiderschapsvraagstuk, geen IT-project',
    body: 'Je organisatie experimenteert met AI, of weet dat het moet. Wat het écht vraagt van jou als leider blijft vaak ongezegd. Het gaat niet alleen over welke tool je kiest of welke training je inkoopt. Het gaat over de beslissingen die je neemt en de richting die je je organisatie meegeeft, in een tijd waarin AI je strategie, je team en je rol verandert.',
  },
  audience: {
    heading: 'Voor wie is deze middag?',
    intro: 'Voor leiders die met AI niet alleen willen experimenteren, maar willen sturen. Eindverantwoordelijken die hun organisatie de juiste richting in moeten zetten.',
    roles: [
      'CEO / DGA / Directeur-eigenaar',
      'CMO / Commercieel directeur',
      'CDO / Chief Digital Officer',
      'COO / Chief Operating Officer',
      'Voorzitter RvB / lid RvT',
      'Algemeen directeur / MT-voorzitter',
    ],
    scenarios: [
      'Je hebt drie AI-pilots lopen, maar geen strategie die ze verbindt.',
      'Je team vraagt om richting en je weet nog niet welke.',
      'Je wilt niet experimenteren met AI, je wilt sturen.',
    ],
    note: 'Kom met een collega uit je directie of MT. Peer-werk wordt rijker wanneer je samen kunt terugkomen op de inzichten.',
  },
  program: {
    heading: 'Het programma',
    intro: 'Een halve dag in vier blokken: oriëntatie, dialoog, eigen werk en commitments. Ben leidt de dag, Mark begeleidt het werk en het 90-dagen-vervolg.',
    items: [
      { title: 'Keynote door Ben van den Burg', body: 'Eén uur over wat AI verschuift in leiderschap, met scherpe observaties uit de praktijk.' },
      { title: 'Diagnose (werkblok 1)', body: 'In trio\'s op de dimensies van je AI-assessment. Waar staat jouw organisatie? Wat zien je peers dat jij niet ziet?' },
      { title: 'Cohort-spiegel', body: 'De geaggregeerde data van deze zaal op het scherm. Waar zit deze groep sterk, waar liggen risico\'s, hoe verhouden jullie je tot de markt.' },
      { title: '90-dagen-canvas (werkblok 2)', body: 'Eén concrete keuze voor de komende 90 dagen, gebaseerd op je zwakste dimensie. Eindigt met je eerste stap en je boodschap aan je team.' },
      { title: 'Afsluiting & Q&A', body: 'Ben en Mark vatten samen, prikkelen, beantwoorden wat er nog ligt.' },
      { title: 'Borrel / lunch + netwerken', body: 'De waardevolle helft van zo\'n middag: peers die hetzelfde dragen, dezelfde vragen stellen, andere antwoorden gevonden hebben.' },
    ],
  },
  trajectory: {
    heading: 'Een 90-dagen-traject met de middag als startpunt',
    intro: 'De middag is het anker. Daarna word je niet losgelaten: vier momenten waarop het systeem aan je trekt, plus een 1-op-1 met Mark.',
    steps: [
      { label: 'Voor de dag', title: 'Baseline-assessment', body: 'Vul de AI-maturity-scan in (~10 min). Resultaten landen in het cohort en vormen je vertrekpunt.' },
      { label: '29 juni', title: 'De middag zelf', body: 'Keynote, diagnose, canvas, commitments en Q&A. Je vertrekt met een persoonlijk rapport en een 90-dagen-canvas.' },
      { label: 'Dag 15', title: '1-op-1 met Mark', body: 'Een persoonlijk gesprek van 30 minuten over hoe je ervoor staat, waar je hapert en welke ondersteuning helpt.' },
      { label: 'Dag 30 / 60 / 90', title: 'Progressiemetingen', body: 'Drie korte gepersonaliseerde metingen op precies de mijlpalen van je canvas. Je krijgt je delta-rapport, zo zie je waar je beweegt en waar niet.' },
      { label: 'Dag 90', title: 'Cohort-slotrapport', body: 'Hoe heeft jullie zaal als geheel zich ontwikkeld? Met een optionele afsluitcall om de balans op te maken.' },
    ],
  },
  hosts: {
    heading: 'Je begeleiders',
    intro: 'Twee perspectieven: Ben als dagvoorzitter en strateeg, Mark als gastheer en vervolgtraject-begeleider.',
    people: [
      {
        initials: 'BvdB',
        name: 'Ben van den Burg',
        role: 'Dagvoorzitter & keynote',
        bio: 'Strateeg en spreker over leiderschap in technologische transitie. Begeleidt directieteams bij strategische heroriëntatie wanneer markt, organisatie en technologie tegelijk schuiven. Schrijft en spreekt regelmatig over de menselijke kant van digitale transformatie.',
        photo: '/Ben_van_den_Burg.jpg',
      },
      {
        initials: 'MdK',
        name: 'Mark de Kock',
        role: 'Gastheer & traject-begeleider',
        bio: 'Vertaalt AI-strategie naar uitvoering. Werkt met directieteams aan het verbinden van ambitie, organisatie en eerste werkende toepassingen. Faciliteert de werkblokken, het 90-dagen-traject en de individuele follow-up calls.',
        photo: '/markdekock_2026.png',
      },
    ],
  },
  testimonials: {
    heading: 'Wat deelnemers zeggen',
    items: [
      // Vul aan via /admin/ai-leiderschap. Sectie verbergt zich als de lijst leeg is.
    ],
  },
  practical: {
    heading: 'Praktisch',
    facts: [
      { label: 'Datum', value: 'Maandag 29 juni 2026' },
      { label: 'Locatie', value: 'Utrecht (locatie bevestigd bij boeking)' },
      { label: 'Vorm', value: 'Halve dag, kies ochtend of middag' },
      { label: 'Groep', value: 'Min. 10, max. 20 per sessie' },
      { label: 'Investering', value: '€1.595 p.p. (excl. btw)' },
      { label: 'Inbegrepen', value: 'Baseline-assessment, canvas + boekje, lunch/borrel, 90-dagen-traject met 1-op-1 en progressiemetingen' },
      { label: 'Taal', value: 'Nederlands' },
    ],
  },
  slots: {
    heading: 'Boek je plek voor 29 juni 2026',
    intro: 'Kies het tijdslot dat je het beste uitkomt. Beide sessies hebben hetzelfde programma en gaan door bij minimaal 10 inschrijvingen.',
    items: [
      {
        id: 'ochtend',
        label: 'Ochtend',
        time: '09:00 – 13:00 (incl. afsluitende lunch)',
        price: '€1.595',
        // Vervang door je Mollie Payment Link (begint met https://). Zolang
        // hier "#" of een placeholder staat, toont de View een "Boeking opent
        // binnenkort"-staat in plaats van een dode link.
        mollieHref: '#boeken',
        note: 'Max. 20 plekken',
      },
      {
        id: 'middag',
        label: 'Middag',
        time: '13:30 – 17:30 (incl. afsluitende borrel)',
        price: '€1.595',
        mollieHref: '#boeken',
        note: 'Max. 20 plekken',
      },
    ],
    payNote: 'Veilig betalen via Mollie · iDEAL, creditcard, Bancontact. Bij minder dan 10 inschrijvingen voor jouw slot krijg je je betaling volledig terug. Prijzen excl. btw.',
  },
  waitlist: {
    heading: 'Kan je niet op 29 juni?',
    intro: 'Schrijf je vrijblijvend voor. We plannen regelmatig een nieuwe editie en voorinschrijvers worden als eerste uitgenodigd zodra de volgende datum vaststaat.',
    successMessage: 'Bedankt, je staat op de lijst. We laten weten zodra de volgende editie gepland is.',
  },
  faq: {
    heading: 'Veelgestelde vragen',
    items: [
      { q: 'Wat is het verschil tussen ochtend en middag?', a: 'Niets inhoudelijk. Beide sessies bieden hetzelfde programma met dezelfde begeleiders. Je kiest puur op wat jou logistiek het beste schikt.' },
      { q: 'Wat als mijn slot niet doorgaat?', a: 'Bij minder dan 10 inschrijvingen voor een slot gaat dat slot niet door en krijg je je betaling 100% terug. Eventueel kun je overstappen naar het andere slot.' },
      { q: 'Heb ik AI-voorkennis nodig?', a: 'Nee. We gaan ervan uit dat je in je organisatie met AI bezig bent, maar dit is geen technische middag. Het gaat over leiderschap, niet over tooling.' },
      { q: 'Is de baseline-assessment verplicht?', a: 'Aanbevolen, niet verplicht. Wie vooraf invult haalt veel meer uit de cohort-spiegel en de werkblokken. Daar komt de data van de zaal terug.' },
      { q: 'Hoe werkt het 90-dagen-traject precies?', a: 'Na de middag krijg je op dag 15 een 1-op-1 met Mark (30 min, online). Op dag 30, 60 en 90 ontvang je een korte gepersonaliseerde meting met je delta-rapport. Op dag 90 een cohort-slotrapport.' },
      { q: 'Kan ik op bedrijfsnaam factureren?', a: 'Ja. Bij de Mollie-checkout vul je je bedrijfs- en btw-gegevens in. Je ontvangt een factuur op naam van je bedrijf.' },
      { q: 'Kan ik met een collega komen?', a: 'Graag. Twee mensen uit dezelfde organisatie maken het peer-werk en het 90-dagen-traject sterker. Beide boeken één plek.' },
    ],
  },
  footer: {
    tagline: 'Een initiatief van Ben van den Burg & Mark de Kock.',
    legal: '© 2026. Alle rechten voorbehouden.',
  },
}

export function mergeContent(base: AILContent, override: unknown): AILContent {
  if (!override || typeof override !== 'object') return base
  return deepMerge(base, override as Record<string, unknown>) as AILContent
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
