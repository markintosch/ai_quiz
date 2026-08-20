// FILE: src/lib/signal/ingest.ts
// ─── Moba Signal — manual document ingestion ─────────────────────────────────
//
// The PRD's drag-and-drop contribution channel: a human uploads a document
// (a saved press page, a research report, field notes) and it enters the SAME
// pipeline as crawled material — extraction, entity linking, deterministic
// scoring, and the review queue. Human-submitted never means pre-approved.
//
// The document kind changes how it is treated:
//   news:     a saved press/news page. Few chunks, current events.
//   research: a report or whitepaper. Many chunks, historical events wanted —
//             this is also the backfill path for documents like the Asia
//             landscape research.
//   notes:    field intelligence. Credibility forced to 1, human-asserted.

import { extractItems, type ExtractedItem, type ExtractMode } from './extract'
import { storeExtracted, type SourceRow } from './runner'

const CHUNK = 12_000

const KIND_CONFIG: Record<ExtractMode, { maxChunks: number }> = {
  news:     { maxChunks: 3 },
  research: { maxChunks: 10 },
  notes:    { maxChunks: 2 },
}

export interface IngestResult {
  chunks: number
  itemsFound: number
  itemsNew: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ingestDocument(db: any, args: {
  source: SourceRow
  /** The original public URL the document represents — provenance is never optional. */
  sourceUrl: string
  filename: string
  text: string
  kind: ExtractMode
  note?: string
}): Promise<IngestResult> {
  const { maxChunks } = KIND_CONFIG[args.kind]
  const chunks: string[] = []
  for (let i = 0; i < args.text.length && chunks.length < maxChunks; i += CHUNK) {
    chunks.push(args.text.slice(i, i + CHUNK + 400)) // slight overlap so items on a boundary survive
  }

  const extracted: ExtractedItem[] = []
  for (const chunk of chunks) {
    try {
      extracted.push(...await extractItems(args.sourceUrl, chunk, undefined, args.kind))
    } catch {
      // one bad chunk should not sink the document
    }
  }

  // Field notes are credibility 1 by rule, whatever source they are filed under
  const source: SourceRow = args.kind === 'notes'
    ? { ...args.source, source_class: 'human' }
    : args.source

  const { itemsNew } = await storeExtracted(db, source, extracted, {
    assertedBy: 'human',
    provenance: { uploadedFile: args.filename, uploadKind: args.kind, uploadNote: args.note ?? null },
  })

  // The upload shows up in the run log, so source health reflects manual feeds
  await db.from('moba_signal_runs').insert({
    source_id: args.source.id,
    finished_at: new Date().toISOString(),
    ok: true,
    pages_fetched: chunks.length,
    items_found: extracted.length,
    items_new: itemsNew,
    error: null,
  })
  if (itemsNew > 0) {
    await db.from('moba_signal_sources')
      .update({ last_item_at: new Date().toISOString() })
      .eq('id', args.source.id)
  }

  return { chunks: chunks.length, itemsFound: extracted.length, itemsNew }
}
