// FILE: src/lib/signal/social.ts
// ─── Moba Signal — LinkedIn share-of-voice parsing ────────────────────────────
//
// Parses the LinkedIn competitor analytics export (.xlsx/.xls). Known shape:
// row 1 carries the period start and end dates, row 2 the headers
// (Page, Total Followers, New Followers, Total post engagements, Total posts),
// then one row per page. Every sheet matching that shape is parsed, so a
// 365-day export with several period sheets works unchanged. Unknown shapes
// fail loudly with the headers we actually saw, never silently.

import * as XLSX from 'xlsx'

export interface SocialRow {
  pageName: string
  periodStart: string   // ISO date
  periodEnd: string
  followers: number | null
  newFollowers: number | null
  engagements: number | null
  posts: number | null
}

export interface SocialParseResult {
  rows: SocialRow[]
  sheetsParsed: number
  sheetsSkipped: Array<{ sheet: string; reason: string }>
}

const HEADER_ALIASES: Record<string, keyof Omit<SocialRow, 'pageName' | 'periodStart' | 'periodEnd'>> = {
  'total followers': 'followers',
  'followers': 'followers',
  'new followers': 'newFollowers',
  'total post engagements': 'engagements',
  'post engagements': 'engagements',
  'engagements': 'engagements',
  'total posts': 'posts',
  'posts': 'posts',
}

function toIso(v: unknown): string | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 10)
  if (typeof v === 'number' && v > 20000 && v < 80000) {
    // Excel serial date
    const d = new Date(Math.round((v - 25569) * 86_400_000))
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
  }
  if (typeof v === 'string') {
    const t = Date.parse(v)
    if (!Number.isNaN(t)) return new Date(t).toISOString().slice(0, 10)
  }
  return null
}

function toNum(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.round(v)
  if (typeof v === 'string') {
    const n = Number(v.replace(/[,\s]/g, ''))
    return Number.isFinite(n) ? Math.round(n) : null
  }
  return null
}

export function parseSocialWorkbook(buf: Uint8Array, fallbackEnd?: string): SocialParseResult {
  const wb = XLSX.read(buf, { type: 'array', cellDates: true })
  const rows: SocialRow[] = []
  const skipped: Array<{ sheet: string; reason: string }> = []
  let parsed = 0

  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const grid: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null })
    if (grid.length < 3) { skipped.push({ sheet: name, reason: 'fewer than 3 rows' }); continue }

    // Find the header row: the one whose first cell is "Page"
    const headerIdx = grid.findIndex(r => String(r?.[0] ?? '').trim().toLowerCase() === 'page')
    if (headerIdx === -1) {
      skipped.push({ sheet: name, reason: `no "Page" header row; first cells: ${grid.slice(0, 3).map(r => String(r?.[0] ?? '')).join(' | ')}` })
      continue
    }

    // Period dates: scan the rows above the header for two parseable dates
    let periodStart: string | null = null
    let periodEnd: string | null = null
    for (let i = 0; i < headerIdx; i++) {
      const dates = (grid[i] ?? []).map(toIso).filter((d): d is string => d !== null)
      if (dates.length >= 2) { periodStart = dates[0]; periodEnd = dates[1]; break }
      if (dates.length === 1 && !periodStart) periodStart = dates[0]
    }
    if (!periodEnd) periodEnd = fallbackEnd ?? new Date().toISOString().slice(0, 10)
    if (!periodStart) { skipped.push({ sheet: name, reason: 'no period dates found above the header row' }); continue }

    // Map columns by header alias
    const header = grid[headerIdx].map(h => String(h ?? '').trim().toLowerCase())
    const colFor = new Map<number, keyof Omit<SocialRow, 'pageName' | 'periodStart' | 'periodEnd'>>()
    header.forEach((h, i) => { if (HEADER_ALIASES[h]) colFor.set(i, HEADER_ALIASES[h]) })
    if (colFor.size === 0) {
      skipped.push({ sheet: name, reason: `no recognised metric headers in: ${header.filter(Boolean).join(', ')}` })
      continue
    }

    for (const r of grid.slice(headerIdx + 1)) {
      const pageName = String(r?.[0] ?? '').trim()
      if (!pageName) continue
      const row: SocialRow = {
        pageName, periodStart, periodEnd,
        followers: null, newFollowers: null, engagements: null, posts: null,
      }
      for (const [i, key] of colFor) row[key] = toNum(r[i])
      rows.push(row)
    }
    parsed++
  }

  return { rows, sheetsParsed: parsed, sheetsSkipped: skipped }
}
