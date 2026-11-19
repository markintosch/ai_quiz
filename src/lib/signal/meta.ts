// FILE: src/lib/signal/meta.ts
// ─── Moba Signal — Meta Business Suite export parsing ────────────────────────
//
// Parses the per-metric CSV that Meta Business Suite exports for a page Moba
// manages (Insights → export). Known shape, Dutch or English UI:
//
//   sep=,
//   "Facebook-bezoeken"            ← metric title, one metric per file
//   "Datum","Primary"
//   "2026-01-01T01:00:00","22"     ← one row per day, local midnight
//
// The file is UTF-16 with a byte-order mark, which is why a plain UTF-8 read
// sees garbage. Unknown titles fail loudly with the title we saw, never
// silently. This is Moba's own account: owned-channel context, never
// competitor data.

export type MetaPlatform = 'facebook' | 'instagram' | 'meta'
export type MetaMetric = 'views' | 'interactions' | 'visits' | 'link_clicks' | 'follows' | 'reach'

export const META_METRIC_LABELS: Record<MetaMetric, string> = {
  views:        'Views',
  interactions: 'Content interactions',
  visits:       'Page visits',
  link_clicks:  'Link clicks',
  follows:      'New followers',
  reach:        'Viewers',
}

export interface MetaDailyRow {
  platform: MetaPlatform
  metric: MetaMetric
  day: string   // ISO date
  value: number
}

export interface MetaParseResult {
  title: string
  platform: MetaPlatform
  /** True when the title named the platform; false when the uploader's choice was used. */
  platformFromTitle: boolean
  metric: MetaMetric
  rows: MetaDailyRow[]
}

/** Decode by byte-order mark: Meta exports UTF-16LE; re-saved files are often UTF-8. */
export function decodeExport(bytes: Uint8Array): string {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes.subarray(2))
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(bytes.subarray(2))
  const text = new TextDecoder('utf-8').decode(bytes)
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

/** Order matters: "klikken op Facebook-links" must hit clicks before anything else. */
const METRIC_RULES: Array<[RegExp, MetaMetric]> = [
  [/klik|click/i, 'link_clicks'],
  [/interact/i, 'interactions'],
  [/bezoek|visit/i, 'visits'],
  [/volger|follow/i, 'follows'],
  // Meta renamed Reach to Viewers (NL: Kijkers): unique accounts that saw content
  [/kijker|viewer|bereik|reach/i, 'reach'],
  [/weergave|view|impressi/i, 'views'],
]

function cells(line: string): string[] {
  // The export quotes every cell and never embeds quotes or commas in values.
  return line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
}

export function parseMetaExport(bytes: Uint8Array, fallbackPlatform: MetaPlatform): MetaParseResult {
  const lines = decodeExport(bytes).split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  let i = 0
  if (/^sep=/i.test(lines[i] ?? '')) i++
  const title = cells(lines[i++] ?? '')[0] ?? ''
  if (!title) throw new Error('No metric title found on the first lines.')

  const metric = METRIC_RULES.find(([re]) => re.test(title))?.[1]
  if (!metric) throw new Error(`Unknown metric title "${title}". Expected views, viewers, interactions, visits, link clicks or followers.`)

  const fromTitle: MetaPlatform | null = /facebook/i.test(title) ? 'facebook' : /instagram/i.test(title) ? 'instagram' : null
  const platform = fromTitle ?? fallbackPlatform

  const header = cells(lines[i++] ?? '')
  if (header.length < 2 || !/datum|date/i.test(header[0])) {
    throw new Error(`Unexpected header row: ${header.join(' | ') || '(empty)'}. Expected "Datum","Primary".`)
  }

  const rows: MetaDailyRow[] = []
  for (; i < lines.length; i++) {
    const [d, v] = cells(lines[i])
    const day = /^\d{4}-\d{2}-\d{2}/.test(d ?? '') ? d.slice(0, 10) : null
    const value = Number(v)
    if (!day || !Number.isFinite(value)) continue
    rows.push({ platform, metric, day, value: Math.round(value) })
  }
  if (rows.length === 0) throw new Error(`"${title}" has no daily rows.`)
  return { title, platform, platformFromTitle: fromTitle !== null, metric, rows }
}
