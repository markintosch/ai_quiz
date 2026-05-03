// FILE: src/lib/atelier/seed-corpus.ts
// Mock reference corpus — used by Module 2 until real archive ingestion lands.
// Each entry mirrors the production `Reference` schema (sans LLM-derived
// relevance / taste_note, which the model assigns at retrieval time).
//
// Real archive ingestion (Tomas's work + curated Dutch creative landmarks)
// happens in Phase 0 of the real build. This corpus stays as a development
// fallback / reproducibility seed even after that.

export interface SeedReference {
  id:           string
  title:        string
  description:  string
  source_kind:  'archive' | 'live_source' | 'inferred'
  source_label: string
  source_url:   string | null
  /** Tags used to crudely retrieve relevant items by keyword overlap. */
  tags:         string[]
}

export const SEED_REFERENCES: SeedReference[] = [
  {
    id: 'heineken-worlds-apart',
    title: 'Heineken — Worlds Apart',
    description: 'Tegengestelde meningen samenbrengen rond een biertje. Niet over de smaak — over wat er gebeurt als mensen elkaar pas leren kennen voordat ze elkaar afschrijven.',
    source_kind: 'archive',
    source_label: 'Atelier seed · Heineken · 2017',
    source_url: 'https://www.youtube.com/watch?v=etIqln7vT4w',
    tags: ['polarisation', 'tension', 'human-truth', 'craft', 'long-form', 'NL-brand'],
  },
  {
    id: 'kpn-dichtbij',
    title: 'KPN — Dichterbij dan ooit',
    description: 'Verbinding als kernbelofte. Niet via tech-features, maar via mensen die elkaar weer vinden. De technologie is het middel, de relatie het verhaal.',
    source_kind: 'archive',
    source_label: 'Atelier seed · KPN · 2019',
    source_url: null,
    tags: ['connection', 'family', 'NL-brand', 'tech-as-means', 'emotion-led'],
  },
  {
    id: 'jumbo-zelfbewust',
    title: 'Jumbo — Zelfbewust met humor',
    description: 'Categorie-conventies omdraaien. Geen gladde supermarkt-esthetiek, maar een merk dat zichzelf relativeert en daarmee dichterbij komt.',
    source_kind: 'archive',
    source_label: 'Atelier seed · Jumbo retail · 2021',
    source_url: null,
    tags: ['humour', 'self-aware', 'category-disruption', 'NL-retail', 'brand-personality'],
  },
  {
    id: 'rituals-meaningful',
    title: 'Rituals — From routine to ritual',
    description: 'Banale handelingen herdefiniëren als betekenisvolle momenten. Het product is het kleinste deel van het verhaal — de gewoonte eromheen is het echte verhaal.',
    source_kind: 'archive',
    source_label: 'Atelier seed · Rituals · 2022',
    source_url: null,
    tags: ['ritual', 'wellness', 'meaning', 'NL-brand', 'lifestyle'],
  },
  {
    id: 'oxfam-secondhand',
    title: 'Oxfam — Second-hand September',
    description: 'Een maand die een gewoonte wordt. Geen donatie-vraag, maar een gedragsverandering die het merk niet bezit maar wel start.',
    source_kind: 'archive',
    source_label: 'Atelier seed · Oxfam · 2019',
    source_url: 'https://www.oxfam.org.uk/get-involved/second-hand-september/',
    tags: ['behaviour-change', 'sustainability', 'movement', 'long-form', 'non-profit'],
  },
  {
    id: 'patagonia-dont-buy',
    title: "Patagonia — Don't Buy This Jacket",
    description: 'Anti-consumptie-advertentie van een bedrijf dat bestaat om jacks te verkopen. Werkte omdat de brand de claim al jaren waarmaakt — provenance is alles.',
    source_kind: 'archive',
    source_label: 'Atelier seed · Patagonia · 2011',
    source_url: 'https://www.patagonia.com/stories/dont-buy-this-jacket-black-friday-and-the-new-york-times/story-18615.html',
    tags: ['paradox', 'sustainability', 'brand-courage', 'long-form', 'category-disruption'],
  },
  {
    id: 'ah-makkelijk',
    title: 'Albert Heijn — Hamsterweken',
    description: 'Promo wordt cultuurcode. Een commerciële mechaniek (bulk-aanbieding) is uitgegroeid tot een seizoensritueel waar consumenten op rekenen.',
    source_kind: 'archive',
    source_label: 'Atelier seed · Albert Heijn · ongoing since 1990s',
    source_url: null,
    tags: ['ritual', 'NL-retail', 'pricing-as-brand', 'longevity', 'mass-market'],
  },
  {
    id: 'ing-pulse',
    title: 'ING — Onderscheidende digital tone',
    description: 'Bank die spreekt als een collega, niet als een instelling. Tone-of-voice als competitief voordeel in een categorie waar iedereen serieus klinkt.',
    source_kind: 'archive',
    source_label: 'Atelier seed · ING · 2018–nu',
    source_url: null,
    tags: ['tone-of-voice', 'finance', 'NL-brand', 'humanisation', 'digital-first'],
  },
  {
    id: 'gucci-self-as-style',
    title: 'Gucci — Self-expression als merk',
    description: 'Mode als identiteit-ankerpunt voor Gen-Z. Het kledingstuk is het minst belangrijke; de uitnodiging om jezelf zichtbaar te maken is het product.',
    source_kind: 'archive',
    source_label: 'Atelier seed · Gucci · 2020-2023',
    source_url: null,
    tags: ['identity', 'gen-z', 'fashion', 'community', 'self-expression'],
  },
  {
    id: 'oatly-loud',
    title: 'Oatly — Hard, eerlijk, eigenwijs',
    description: 'Categorie betreden met een stem die alle conventies negeert. Niet rationale "het is plantaardig" maar attitude — de stem ís de propositie.',
    source_kind: 'archive',
    source_label: 'Atelier seed · Oatly · 2018-2022',
    source_url: null,
    tags: ['voice-as-brand', 'sustainability', 'category-entry', 'attitude', 'visual-disruption'],
  },
]
