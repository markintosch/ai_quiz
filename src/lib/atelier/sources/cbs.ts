// FILE: src/lib/atelier/sources/cbs.ts
// CBS StatLine integration — gratis NL-statistiek voor Ground Truth signalen.
//
// API: https://opendata.cbs.nl/ODataApi/odata/<table_id>
// Geen key nodig, geen hard rate-limit (binnen redelijke marge).
//
// Approach:
//   1. We hebben een gecureerde set tables die voor de meeste briefs nuttig zijn
//      (demografie, bedrijfsgrootte, consumentenuitgaven, etc.).
//   2. Per sessie: Claude kiest uit deze set 2–3 meest relevante tables o.b.v. JTBD.
//   3. We halen de top-rijen op en zetten die om naar AudienceSignal[] voor Module 3.
//   4. Provenance: source_label = "CBS StatLine — Tabel <id> (<title>)",
//      source_url = directe link naar het portaal, confidence = 'strong'.

import { llmCall, parseJsonOutput } from '../llm'
import type { AudienceSignal } from '../schemas'

/** Curated set of CBS tables die over de meeste Atelier-briefs nuttig zijn. */
export const CBS_CURATED_TABLES = [
  {
    id: '83482NED',
    title: 'Bevolking; geslacht, leeftijd en burgerlijke staat, 1 januari',
    topic: 'demografie',
    use_when: 'Brief richt zich op consumenten / bevolking-demografie / leeftijdsgroepen',
  },
  {
    id: '85003NED',
    title: 'Inwoners per gemeente',
    topic: 'demografie · regionaal',
    use_when: 'Brief is regionaal of provinciaal gericht',
  },
  {
    id: '85587NED',
    title: 'Consumentenvertrouwen, economisch klimaat en koopbereidheid',
    topic: 'koopgedrag · sentiment',
    use_when: 'B2C of retail-brief over consumentenstemming',
  },
  {
    id: '83631NED',
    title: 'Bedrijven; bedrijfstak (SBI 2008)',
    topic: 'bedrijfsleven',
    use_when: 'B2B-brief, segmenten op sector',
  },
  {
    id: '81588NED',
    title: 'Bedrijven; grootte (aantal werkzame personen)',
    topic: 'bedrijfsgrootte',
    use_when: 'B2B-brief, ICP gedefinieerd op bedrijfsgrootte',
  },
  {
    id: '85013NED',
    title: 'Inkomen van personen; persoonskenmerken',
    topic: 'inkomen',
    use_when: 'B2C, premium- of price-related propositie',
  },
  {
    id: '83653NED',
    title: 'ICT-gebruik bij bedrijven',
    topic: 'tech-adoptie',
    use_when: 'Tech-brief, AI/digital, B2B-software',
  },
  {
    id: '84279NED',
    title: 'ICT-gebruik bij huishoudens en personen',
    topic: 'tech-adoptie · consumer',
    use_when: 'B2C tech, app, online platform',
  },
  {
    id: '85123NED',
    title: 'Vertrouwen in instituties',
    topic: 'vertrouwen · sentiment',
    use_when: 'Brand-trust, B2G, financiële diensten, gezondheid',
  },
  {
    id: '85045NED',
    title: 'Werkzame beroepsbevolking; beroep',
    topic: 'beroepsbevolking',
    use_when: 'Brief over specifieke beroepsgroep / talent / employer brand',
  },
  {
    id: '85146NED',
    title: 'Duurzaamheid; gedrag van personen',
    topic: 'duurzaamheid',
    use_when: 'Sustainability-brief, milieubewust merkgedrag',
  },
  {
    id: '85196NED',
    title: 'Materiële welvaart van huishoudens',
    topic: 'welvaart',
    use_when: 'Premium / luxury / mid-market positioning',
  },
] as const

const CBS_PORTAL_URL = (tableId: string) =>
  `https://opendata.cbs.nl/statline/#/CBS/nl/dataset/${tableId}/table`

const CBS_API_BASE = 'https://opendata.cbs.nl/ODataApi/odata'

interface CbsObservationRow {
  ID?: number
  [key: string]: unknown
}

interface CbsApiResponse {
  value: CbsObservationRow[]
}

/**
 * Fetch the first ~10 observations from a CBS table (latest period).
 * Returns raw rows — caller decides how to summarise.
 */
async function fetchCbsTable(tableId: string, top = 10): Promise<CbsObservationRow[]> {
  const url = `${CBS_API_BASE}/${tableId}/TypedDataSet?$top=${top}&$orderby=ID%20desc`
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    // Aggressive timeout — CBS is usually fast but we don't want to block
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) {
    throw new Error(`CBS API ${tableId} returned ${res.status}`)
  }
  const json = (await res.json()) as CbsApiResponse
  return json.value ?? []
}

/**
 * Ask Claude to pick the 2–3 most relevant CBS tables for a given JTBD,
 * fetch them, and produce AudienceSignal[] entries with strong provenance.
 *
 * Failure modes are non-fatal: if CBS is down or no relevant tables, we
 * return an empty array. The audience module continues with its own work.
 */
export interface CbsEnrichment {
  signals:     AudienceSignal[]
  fetched_at:  string  // ISO timestamp when CBS was last polled
}

export async function enrichWithCbs(args: {
  sessionId:    string
  jtbdDutch:    string
  briefSummary: string
}): Promise<CbsEnrichment> {
  // Step 1 — let Claude pick relevant tables
  const tablesList = CBS_CURATED_TABLES.map(t =>
    `- ${t.id} · ${t.title} (${t.topic}). Use when: ${t.use_when}`
  ).join('\n')

  const pickPrompt = `Atelier-brief samenvatting:
${args.briefSummary}

JTBD:
${args.jtbdDutch}

Beschikbare CBS-tables:
${tablesList}

Welke 2–3 tables zijn het meest relevant voor de Ground Truth-onderbouwing van deze brief? Geef JSON met alleen de IDs.

Antwoord ALTIJD als geldige JSON:
{
  "table_ids": ["XXXNED", "XXXNED", ...]
}`

  let pickedIds: string[] = []
  try {
    const result = await llmCall({
      module: 'cbs_pick',
      tier:   'haiku',
      system: 'Je bent Atelier — je kiest welke CBS-tables een brief het beste onderbouwen.',
      user:   pickPrompt,
      jsonOnly: true,
      maxTokens: 300,
      temperature: 0.2,
    })
    const parsed = parseJsonOutput<{ table_ids: string[] }>(result.text)
    pickedIds = (parsed.table_ids ?? [])
      .filter(id => CBS_CURATED_TABLES.some(t => t.id === id))
      .slice(0, 3)
  } catch (err) {
    console.warn('[cbs] pick step failed, skipping enrichment:', err instanceof Error ? err.message : err)
    return { signals: [], fetched_at: new Date().toISOString() }
  }

  const emptyResult: CbsEnrichment = { signals: [], fetched_at: new Date().toISOString() }
  if (pickedIds.length === 0) return emptyResult

  // Step 2 — fetch each table in parallel
  const fetchedAt = new Date().toISOString()
  const fetched = await Promise.allSettled(
    pickedIds.map(async id => {
      const table = CBS_CURATED_TABLES.find(t => t.id === id)!
      const rows = await fetchCbsTable(id, 8)
      return { table, rows }
    })
  )

  // Step 3 — let Claude summarise each table into 1 specific audience claim
  const fetchedTables = fetched
    .filter((r): r is PromiseFulfilledResult<{ table: typeof CBS_CURATED_TABLES[number]; rows: CbsObservationRow[] }> => r.status === 'fulfilled')
    .map(r => r.value)

  if (fetchedTables.length === 0) return emptyResult

  const summarisePrompt = `Atelier-brief samenvatting:
${args.briefSummary}

JTBD:
${args.jtbdDutch}

CBS-data die we ophaalden:
${fetchedTables.map(({ table, rows }) =>
  `=== ${table.id} · ${table.title} ===\n${JSON.stringify(rows.slice(0, 5), null, 2)}`
).join('\n\n')}

Maak per CBS-table 1 concrete audience-claim die direct relevant is voor de brief. Vermeld het cijfer/de observatie, niet enkel "CBS heeft data".

Antwoord ALTIJD als geldige JSON:
{
  "claims": [
    {
      "table_id": "XXXNED",
      "claim": "string — concrete observatie met cijfer/jaartal",
      "evidence": "string — hoe je deze claim uit de data haalt"
    }
  ]
}`

  try {
    const result = await llmCall({
      module: 'cbs_summarise',
      tier:   'sonnet',
      system: 'Je bent Atelier — je vat CBS-statistiek samen tot scherpe audience-claims.',
      user:   summarisePrompt,
      jsonOnly: true,
      maxTokens: 1200,
      temperature: 0.3,
    })
    const parsed = parseJsonOutput<{
      claims: Array<{ table_id: string; claim: string; evidence: string }>
    }>(result.text)

    const built: Array<AudienceSignal | null> = (parsed.claims ?? [])
      .map(c => {
        const table = fetchedTables.find(t => t.table.id === c.table_id)?.table
        if (!table) return null
        const sig: AudienceSignal = {
          track:        'ground',
          claim:        c.claim,
          evidence:     c.evidence,
          source_label: `CBS StatLine — Tabel ${table.id} (${table.title})`,
          source_url:   CBS_PORTAL_URL(table.id),
          confidence:   'strong',
          contradicts:  [],
        }
        return sig
      })

    const signals: AudienceSignal[] = built.filter((s): s is AudienceSignal => s !== null)
    return { signals, fetched_at: fetchedAt }
  } catch (err) {
    console.warn('[cbs] summarise step failed, skipping enrichment:', err instanceof Error ? err.message : err)
    return emptyResult
  }
}
