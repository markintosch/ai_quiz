// Content model + defaults for the "Verantwoord AI omarmen" introductiemiddag —
// a pre-registration page for CISO/DPO/compliance-type roles responsible for AI
// guardrails. Lives at /ai-governance as a standalone subtree on markdekock.com.
// Reads a site_content override (product_key 'ai_governance', locale 'nl') and
// deep-merges over these defaults. Editable via /admin/ai-governance.

export interface AIGLink { label: string; href: string }
export interface AIGItem { title: string; body: string }
export interface AIGHost { initials: string; name: string; bio: string }
export interface AIGFact { label: string; value: string }
export interface AIGFaq { q: string; a: string }

export interface AIGContent {
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    bullets: string[]
    ctaPrimary: AIGLink
    ctaSecondary: AIGLink
    note: string
  }
  problem: { heading: string; body: string }
  audience: { heading: string; intro: string; roles: string[]; note: string }
  program: { heading: string; intro: string; items: AIGItem[] }
  takeaways: { heading: string; items: string[] }
  hosts: { heading: string; intro: string; people: AIGHost[] }
  practical: { heading: string; facts: AIGFact[] }
  signup: { heading: string; intro: string; roleOptions: string[]; successMessage: string }
  faq: { heading: string; items: AIGFaq[] }
  footer: { tagline: string; legal: string }
}

export const DEFAULT_CONTENT: AIGContent = {
  hero: {
    eyebrow: 'Introductiemiddag · CISO, DPO & compliance',
    title: 'Verantwoord AI omarmen — zonder de afdeling "nee" te worden',
    subtitle: 'Een praktische middag voor wie in zijn organisatie de guardrails voor AI moet neerzetten. Geen theorie van de AI Act, wel wat je maandag doet.',
    bullets: [
      'Halve dag, kleine groep',
      'Voor CISO, DPO, compliance & legal',
      'Checklist + concept-beleid mee naar huis',
      'Begeleid door Mark de Kock & Frank Meeuwsen',
    ],
    ctaPrimary: { label: 'Schrijf je voorlopig in', href: '#inschrijven' },
    ctaSecondary: { label: 'Bekijk het programma', href: '#programma' },
    note: 'Voorinschrijving is vrijblijvend. Je reserveert interesse; we bevestigen datum, locatie en prijs (€95–€195 p.p.) zodra de groep rond is.',
  },
  problem: {
    heading: 'Van rem op AI naar enabler',
    body: 'De business wil vandaag met AI aan de slag. Jij moet zorgen dat het veilig, compliant en uitlegbaar gebeurt — terwijl shadow-AI allang in je organisatie zit. De vraag is niet óf je AI toelaat, maar hoe je er verantwoord guardrails omheen zet zonder de boel stil te leggen.',
  },
  audience: {
    heading: 'Voor wie is deze middag?',
    intro: 'Voor de mensen die verantwoordelijk zijn voor veilige, verantwoorde AI-adoptie. Kom je met een collega uit een aangrenzende discipline? Des te beter — security, privacy en legal versterken elkaar.',
    roles: [
      'CISO / Security Officer / ISO',
      'DPO / Privacy Officer / FG',
      'Compliance & Risk Officer',
      'Bedrijfsjurist / Legal counsel',
      'CIO / IT-directeur / IT-manager',
      'Security- of enterprise-architect',
      'Chief AI Officer / AI-lead',
      'Internal audit / kwaliteitsmanagement',
      'Inkoop / vendor management',
    ],
    note: 'Geen technische voorkennis nodig — wel verantwoordelijkheid voor beleid, risico of governance rond AI.',
  },
  program: {
    heading: 'Wat we behandelen',
    intro: 'In een halve dag lopen we langs de onderwerpen die er nu toe doen — met veel ruimte voor je eigen situatie.',
    items: [
      { title: 'Het speelveld in gewone taal', body: 'AI Act, NIS2 en AVG: wat raakt jou écht, en wat is ruis.' },
      { title: 'Shadow AI & datalekrisico', body: 'Wat er nu al gebeurt met ChatGPT, Copilot en Claude — en waar je data heen lekt.' },
      { title: 'Een werkbaar acceptable-use-beleid', body: 'Hoe je AI-gebruik toestaat én begrenst, zonder een document dat niemand leest.' },
      { title: 'AI-tools toetsen', body: 'Een lichte manier om vendors, data en risico’s te beoordelen voordat iets de organisatie in komt.' },
      { title: 'Een guardrails-framework', body: 'Een simpel raamwerk om governance, techniek en mens samen te brengen.' },
      { title: 'Peer-uitwisseling', body: 'Leren van hoe andere organisaties het aanpakken — vaak het waardevolste deel.' },
    ],
  },
  takeaways: {
    heading: 'Wat je meeneemt',
    items: [
      'Een checklist om je AI-governance te toetsen',
      'Een concept acceptable-use-beleid om in je organisatie aan te passen',
      'De relevante kaders (AI Act, NIS2, AVG) in gewone taal',
      'Een netwerk van vakgenoten die met dezelfde vraag worstelen',
    ],
  },
  hosts: {
    heading: 'Je begeleiders',
    intro: 'Mark en Frank werken dagelijks met organisaties aan praktische AI-adoptie. Geen juristen — wel de mensen die de vertaalslag naar de praktijk maken, met een gastexpert waar dat helpt.',
    people: [
      { initials: 'MdK', name: 'Mark de Kock', bio: 'Brengt AI-strategie naar uitvoering. Helpt organisaties van ambitie naar een werkende, verantwoorde aanpak.' },
      { initials: 'FM', name: 'Frank Meeuwsen', bio: 'Maakt AI al jaren praktisch toepasbaar. Stem van "minder práten over AI, meer dóén" — met oog voor wat verantwoord is.' },
    ],
  },
  practical: {
    heading: 'Praktisch',
    facts: [
      { label: 'Vorm', value: 'Introductiemiddag, ca. 3–4 uur' },
      { label: 'Groep', value: 'Kleine groep, veel interactie' },
      { label: 'Investering', value: '€95–€195 p.p. (indicatief, excl. btw)' },
      { label: 'Datum & locatie', value: 'Nog te bepalen — voorinschrijvers denken mee' },
      { label: 'Taal', value: 'Nederlands' },
    ],
  },
  signup: {
    heading: 'Voorinschrijving',
    intro: 'Laat weten dat je interesse hebt. Je rol en je grootste governance-vraag helpen ons het programma scherp te stellen. Vrijblijvend — we nemen contact op zodra datum en locatie vaststaan.',
    roleOptions: [
      'CISO / Security Officer / ISO',
      'DPO / Privacy Officer / FG',
      'Compliance & Risk Officer',
      'Bedrijfsjurist / Legal counsel',
      'CIO / IT-directeur / IT-manager',
      'Security- of enterprise-architect',
      'Chief AI Officer / AI-lead',
      'Internal audit / kwaliteitsmanagement',
      'Inkoop / vendor management',
      'Anders',
    ],
    successMessage: 'Bedankt — je voorinschrijving is binnen. We nemen contact op zodra datum, locatie en prijs vaststaan.',
  },
  faq: {
    heading: 'Veelgestelde vragen',
    items: [
      { q: 'Is dit juridisch advies?', a: 'Nee. We maken de kaders (AI Act, NIS2, AVG) praktisch en behapbaar, maar dit vervangt geen juridisch of compliance-advies. Waar nodig schakelen we een gastexpert in.' },
      { q: 'Heb ik technische voorkennis nodig?', a: 'Nee. De middag is bedoeld voor verantwoordelijken voor beleid, risico en governance — niet voor engineers.' },
      { q: 'Wat kost het en wanneer is het?', a: 'De investering is indicatief €95–€195 p.p. (excl. btw). Datum en locatie bepalen we zodra de groep rond is; voorinschrijvers denken mee.' },
      { q: 'Kan ik met een collega komen?', a: 'Graag zelfs. Security, privacy en legal versterken elkaar — schrijf je allebei in.' },
      { q: 'Wat als ik me voorlopig inschrijf?', a: 'Dat is vrijblijvend. Je reserveert interesse; pas als datum, locatie en prijs vaststaan vragen we een definitieve bevestiging.' },
    ],
  },
  footer: {
    tagline: 'Een initiatief van Mark de Kock & Frank Meeuwsen.',
    legal: '© 2026. Alle rechten voorbehouden.',
  },
}

export function mergeContent(base: AIGContent, override: unknown): AIGContent {
  if (!override || typeof override !== 'object') return base
  return deepMerge(base, override as Record<string, unknown>) as AIGContent
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
