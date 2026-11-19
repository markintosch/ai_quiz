// FILE: src/lib/signal/meta.ts
// ─── Moba Signal — Meta Business Suite export parsing ────────────────────────
//
// Parses the CSVs that Meta Business Suite exports for a page Moba manages
// (Insights → export), Dutch or English UI. Known shape:
//
//   sep=,
//   "Facebook-bezoeken"            ← metric title
//   "Datum","Primary"              ← date column plus one or more value columns
//   "2026-01-01T01:00:00","22"     ← one row per day, local midnight
//
// A file can hold several such sections one after another; each title starts
// a new metric. Value columns named Facebook or Instagram set the platform per
// column; "Primary" takes the platform from the title, or the uploader's
// choice when the title does not name one.
//
// Every title is accepted. Known titles map to a fixed metric key the card
// understands; anything else is stored under a slug of its own title
// ("other:..."), so no export is ever rejected for an unfamiliar name.
//
// The file is UTF-16 with a byte-order mark, which is why a plain UTF-8 read
// sees garbage. This is Moba's own account: owned-channel context, never
// competitor data.

export type MetaPlatform = 'facebook' | 'instagram' | 'meta'

export type KnownMetaMetric =
  | 'views' | 'reach' | 'impressions' | 'interactions' | 'visits' | 'link_clicks'
  | 'follows' | 'unfollows' | 'followers_total' | 'likes' | 'comments' | 'shares'
  | 'saves' | 'video_views' | 'reel_views' | 'watch_minutes' | 'profile_activity'

/** A known key, or "other:<slug of the title>". */
export type MetaMetric = KnownMetaMetric | `other:${string}`

export const META_METRIC_LABELS: Record<KnownMetaMetric, string> = {
  views:            'Views',
  reach:            'Viewers',
  impressions:      'Impressions',
  interactions:     'Content interactions',
  visits:           'Page visits',
  link_clicks:      'Link clicks',
  follows:          'New followers',
  unfollows:        'Unfollows',
  followers_total:  'Total followers',
  likes:            'Likes and reactions',
  comments:         'Comments',
  shares:           'Shares',
  saves:            'Saves',
  video_views:      'Video views',
  reel_views:       'Reel views',
  watch_minutes:    'Minutes watched',
  profile_activity: 'Profile activity',
}

/** Metrics that are a level (a running total), not a daily count: never summed. */
export const LEVEL_METRICS: ReadonlySet<string> = new Set(['followers_total'])

export interface MetaDailyRow {
  platform: MetaPlatform
  metric: MetaMetric
  day: string   // ISO date
  value: number
}

export interface MetaSection {
  title: string
  metric: MetaMetric
  /** False when the title matched no known metric and was stored under its own name. */
  known: boolean
  platforms: MetaPlatform[]
  /** True when the platform came from the title or a column name, not the uploader's choice. */
  platformFromFile: boolean
  rows: MetaDailyRow[]
}

export interface MetaParseResult {
  sections: MetaSection[]
  rows: MetaDailyRow[]
}

/** Decode by byte-order mark: Meta exports UTF-16LE; re-saved files are often UTF-8. */
export function decodeExport(bytes: Uint8Array): string {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes.subarray(2))
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(bytes.subarray(2))
  const text = new TextDecoder('utf-8').decode(bytes)
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

/**
 * Title → metric. First match wins, so the specific rules sit above the
 * general ones: "Klikken op Facebook-links" is clicks, not visits; "Weergaven
 * van reels" is reel views, not views; "Totaal aantal volgers" is a level,
 * not new followers.
 */
const METRIC_RULES: Array<[RegExp, KnownMetaMetric]> = [
  [/klik|click/i, 'link_clicks'],
  [/minut|watch time|kijktijd|afspeeltijd/i, 'watch_minutes'],
  [/reel/i, 'reel_views'],
  [/video/i, 'video_views'],
  [/ontvolg|unfollow|niet meer volg/i, 'unfollows'],
  [/totaal.*volger|total.*follower|volgers in totaal|paginavolgers/i, 'followers_total'],
  [/volger|follow/i, 'follows'],
  [/interact/i, 'interactions'],
  [/profielactiviteit|profile activity/i, 'profile_activity'],
  [/bezoek|visit/i, 'visits'],
  [/vind-ik-leuk|vind ik leuk|like|reactie op|reactions?$/i, 'likes'],
  [/opmerking|comment|reacties$/i, 'comments'],
  [/gedeeld|delen|share/i, 'shares'],
  [/opgeslagen|bewaard|save/i, 'saves'],
  // Meta renamed Reach to Viewers (NL: Kijkers): unique accounts that saw content
  [/kijker|viewer|bereik|reach/i, 'reach'],
  [/impressie|impression/i, 'impressions'],
  [/weergave|view/i, 'views'],
]

export function metricFor(title: string): { metric: MetaMetric; known: boolean } {
  const hit = METRIC_RULES.find(([re]) => re.test(title))?.[1]
  if (hit) return { metric: hit, known: true }
  const slug = title.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48) || 'metric'
  return { metric: `other:${slug}`, known: false }
}

/** Human label for any stored metric key. */
export function metricLabel(metric: string): string {
  if (metric in META_METRIC_LABELS) return META_METRIC_LABELS[metric as KnownMetaMetric]
  const slug = metric.replace(/^other:/, '').replace(/_/g, ' ')
  return slug.charAt(0).toUpperCase() + slug.slice(1)
}

function cells(line: string): string[] {
  // The export quotes every cell and never embeds quotes or commas in values.
  return line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
}

const isDateHeader = (c: string[]) => c.length >= 2 && /^(datum|date|dag|day)$/i.test(c[0])
const isDataRow = (c: string[]) => /^\d{4}-\d{2}-\d{2}/.test(c[0] ?? '')

function platformOf(text: string): MetaPlatform | null {
  return /facebook/i.test(text) ? 'facebook' : /instagram/i.test(text) ? 'instagram' : null
}

export function parseMetaExport(bytes: Uint8Array, fallbackPlatform: MetaPlatform): MetaParseResult {
  const lines = decodeExport(bytes).split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const sections: MetaSection[] = []
  let i = 0
  if (/^sep=/i.test(lines[i] ?? '')) i++

  while (i < lines.length) {
    const titleCells = cells(lines[i])
    // A section starts with a one-cell title line followed by a date header.
    if (isDataRow(titleCells) || isDateHeader(titleCells) || !isDateHeader(cells(lines[i + 1] ?? ''))) { i++; continue }
    const title = titleCells.filter(Boolean).join(' ').trim()
    const header = cells(lines[i + 1])
    i += 2

    const { metric, known } = metricFor(title)
    const titlePlatform = platformOf(title)
    const colPlatforms: MetaPlatform[] = header.slice(1).map(h => platformOf(h) ?? titlePlatform ?? fallbackPlatform)
    const fromFile = titlePlatform !== null || header.slice(1).some(h => platformOf(h) !== null)

    const rows: MetaDailyRow[] = []
    for (; i < lines.length; i++) {
      const c = cells(lines[i])
      if (!isDataRow(c)) break
      const day = c[0].slice(0, 10)
      c.slice(1).forEach((v, k) => {
        const value = Number(v.replace(/[\s.](?=\d{3}\b)/g, '').replace(',', '.'))
        if (v !== '' && Number.isFinite(value)) rows.push({ platform: colPlatforms[k], metric, day, value: Math.round(value) })
      })
    }
    if (rows.length > 0) {
      sections.push({ title, metric, known, platforms: [...new Set(colPlatforms)], platformFromFile: fromFile, rows })
    }
  }

  if (sections.length === 0) throw new Error('No metric with daily rows found. Expected a title line, then "Datum","Primary", then one row per day.')
  // Same platform, metric and day twice in one file: keep the last, as the upsert would.
  const byKey = new Map<string, MetaDailyRow>()
  for (const s of sections) for (const r of s.rows) byKey.set(`${r.platform}|${r.metric}|${r.day}`, r)
  return { sections, rows: [...byKey.values()] }
}
