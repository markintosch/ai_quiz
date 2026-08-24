// FILE: src/lib/signal/paper.ts
// ─── Moba Signal — the Positioning agent's quarterly paper ───────────────────
//
// Drafts the brand & positioning research paper for the configured subjects
// (default: Moba, Sanovo, NABEL). Inputs are public positioning pages (live
// fetch, Wayback fallback for blocked sites — never circumvention), approved
// signals from the store, and the share-of-voice numbers. One profile call
// per subject, one cross-company call, everything Zod-validated. The delta
// section is computed in code by diffing against the previous approved
// edition, never drafted. The result stays status='draft' until the analyst
// approves it in the console.

import { z } from 'zod'
import { parseJson, signalLlmCall } from './llm'
import { fetchPage, htmlToText, resolveWaybackSnapshot } from './crawl'
import { PAPER_THEMES, PAPER_AXES } from '@/products/moba_signal/types'
import type {
  PaperChange, PaperProfile, PaperThemeKey, PositioningPaper,
} from '@/products/moba_signal/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

export const DEFAULT_SUBJECTS = ['moba', 'sanovo', 'nabel']

const PAGE_TEXT_CAP = 7_000
const THEME_KEYS = Object.keys(PAPER_THEMES) as PaperThemeKey[]

// ── Schemas ───────────────────────────────────────────────────────────────────

const Fact = z.object({
  text: z.string().min(5).max(400),
  source_url: z.string().url(),
})

const ProfileSchema = z.object({
  snapshot:            z.array(Fact).min(1).max(8),
  tagline:             z.string().max(200).nullish(),
  positioning_summary: z.string().min(20).max(900),
  claims:              z.array(Fact).max(8),
  themes: z.record(z.enum(THEME_KEYS as [PaperThemeKey, ...PaperThemeKey[]]), z.object({
    score:    z.number().int().min(0).max(3),
    evidence: z.array(Fact).max(3),
  })),
  audience:     z.array(Fact).max(6),
  proof_points: z.array(Fact).max(8),
})

const CrossSchema = z.object({
  placements: z.array(z.object({
    entity_id: z.string(),
    x:         z.number().min(0).max(100),
    y:         z.number().min(0).max(100),
    rationale: z.string().min(10).max(400),
  })),
  collisions: z.array(z.object({
    claim:      z.string().min(5).max(250),
    entity_ids: z.array(z.string()).min(2),
    note:       z.string().max(400),
  })).max(6),
  implications: z.string().min(50).max(2000),
})

// ── Prompts ───────────────────────────────────────────────────────────────────

const themeList = THEME_KEYS.map(k => `- ${k}: ${PAPER_THEMES[k]}`).join('\n')

const PROFILE_SYSTEM = `You are the Positioning agent of Moba Signal, a competitive intelligence system for Moba (egg grading, packing and processing equipment).

You draft one company's profile for the quarterly Brand & Positioning paper. STRICT GROUNDING RULES:
- Use ONLY the provided page texts and signal items. Never add facts, products, numbers or history from outside the input.
- Every snapshot fact, claim, audience signal and proof point MUST carry the source_url of the provided page or item it comes from. No URL, no statement.
- 'positioning_summary': how THEY present themselves, in 2-4 plain sentences. Their framing, not your judgement.
- 'claims': positioning claims they repeat, quoted or tightly paraphrased.
- 'themes': score every theme 0-3. 0 = absent from their messaging, 1 = mentioned, 2 = recurring, 3 = core theme. Score ONLY from the input; give evidence quotes with source_url for every score of 2 or 3. Themes:
${themeList}
- If the input is thin for a section, return fewer entries. An empty section beats an invented one.
- Style: short sentences, no hype words, no em-dashes.

Answer with valid JSON only:
{"snapshot":[{"text":"...","source_url":"..."}],"tagline":"...or null","positioning_summary":"...","claims":[...same shape...],"themes":{"integration":{"score":0,"evidence":[...]},...all eight...},"audience":[...],"proof_points":[...]}`

const CROSS_SYSTEM = `You are the Positioning agent of Moba Signal. Given the drafted company profiles (already grounded and sourced), produce the cross-company analysis for the quarterly Brand & Positioning paper.

RULES:
- Base everything ONLY on the provided profiles. No outside knowledge.
- 'placements': one per company on the fixed 2x2 map.
  x-axis "${PAPER_AXES.x.label}": 0 = ${PAPER_AXES.x.low}, 100 = ${PAPER_AXES.x.high}.
  y-axis "${PAPER_AXES.y.label}": 0 = ${PAPER_AXES.y.low}, 100 = ${PAPER_AXES.y.high}.
  Place each company from its stated positioning and theme scores; one sentence of rationale each.
- 'collisions': claims where two or more companies occupy the same ground, with the entity ids and one note on how their wording differs.
- 'implications': 3-6 sentences for Moba marketing and innovation. Options to consider, not orders. This is a draft: the analyst rewrites and owns it.
- Style: short sentences, no hype words, no em-dashes.

Answer with valid JSON only:
{"placements":[{"entity_id":"...","x":50,"y":50,"rationale":"..."}],"collisions":[{"claim":"...","entity_ids":["..."],"note":"..."}],"implications":"..."}`

// ── Helpers ───────────────────────────────────────────────────────────────────

export function quarterOf(d: Date): string {
  return `${d.getUTCFullYear()}-Q${Math.floor(d.getUTCMonth() / 3) + 1}`
}

interface PageFetch {
  url: string
  label?: string
  text: string
  via: 'live' | 'wayback' | 'failed'
}

async function fetchPositioningPage(url: string, label?: string): Promise<PageFetch> {
  try {
    const html = await fetchPage(url)
    const text = htmlToText(html).slice(0, PAGE_TEXT_CAP)
    if (text.length > 200) return { url, label, text, via: 'live' }
  } catch { /* fall through to wayback */ }
  const snap = await resolveWaybackSnapshot(url)
  if (snap) {
    try {
      const html = await fetchPage(snap.url)
      const text = htmlToText(html).slice(0, PAGE_TEXT_CAP)
      if (text.length > 200) return { url, label, text, via: 'wayback' }
    } catch { /* recorded as failed below */ }
  }
  return { url, label, text: '', via: 'failed' }
}

const factsOf = (arr: Array<{ text: string; source_url: string }>) =>
  arr.map(f => ({ text: f.text, sourceUrl: f.source_url }))

/** Field-level diff vs the previous approved edition. Deterministic. */
export function computeChanges(prev: PositioningPaper | null, next: PositioningPaper): PaperChange[] {
  if (!prev) return []
  const out: PaperChange[] = []
  const prevProfile = new Map(prev.profiles.map(p => [p.entityId, p]))
  const prevPlace = new Map(prev.map.placements.map(p => [p.entityId, p]))
  for (const p of next.profiles) {
    const was = prevProfile.get(p.entityId)
    if (!was) { out.push({ entityId: p.entityId, field: 'profile', change: 'New subject in this edition.' }); continue }
    const norm = (s?: string) => (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim()
    if (norm(was.tagline) !== norm(p.tagline)) {
      out.push({ entityId: p.entityId, field: 'tagline', change: `Tagline changed: "${was.tagline ?? 'none'}" → "${p.tagline ?? 'none'}".` })
    }
    if (norm(was.positioningSummary) !== norm(p.positioningSummary)) {
      out.push({ entityId: p.entityId, field: 'positioning', change: 'Stated positioning wording changed since the previous edition.' })
    }
    for (const k of THEME_KEYS) {
      const a = was.themes[k]?.score ?? 0
      const b = p.themes[k]?.score ?? 0
      if (a !== b) out.push({ entityId: p.entityId, field: `theme:${k}`, change: `${PAPER_THEMES[k]}: ${a} → ${b}.` })
    }
  }
  for (const pl of next.map.placements) {
    const was = prevPlace.get(pl.entityId)
    if (!was) continue
    const dx = pl.x - was.x, dy = pl.y - was.y
    if (Math.abs(dx) + Math.abs(dy) >= 10) {
      const dir = [
        Math.abs(dx) >= 5 ? (dx > 0 ? `toward ${PAPER_AXES.x.high.toLowerCase()}` : `toward ${PAPER_AXES.x.low.toLowerCase()}`) : '',
        Math.abs(dy) >= 5 ? (dy > 0 ? `toward ${PAPER_AXES.y.high.toLowerCase()}` : `toward ${PAPER_AXES.y.low.toLowerCase()}`) : '',
      ].filter(Boolean).join(' and ')
      out.push({ entityId: pl.entityId, field: 'map', change: `Moved ${dir} on the positioning map.` })
    }
  }
  return out
}

// ── The draft run ─────────────────────────────────────────────────────────────

export interface PaperResult {
  edition: string
  drafted: boolean
  subjects: string[]
  pagesFetched: number
  pagesFailed: string[]
  itemsUsed: number
  error?: string
}

export async function draftPositioningPaper(db: Db, now = new Date()): Promise<PaperResult> {
  const edition = quarterOf(now)
  const base: PaperResult = { edition, drafted: false, subjects: [], pagesFetched: 0, pagesFailed: [], itemsUsed: 0 }

  // An approved edition is the analyst's document: never overwrite it.
  const { data: existing } = await db.from('moba_signal_papers')
    .select('edition, status').eq('edition', edition).maybeSingle()
  if (existing?.status === 'approved') {
    return { ...base, error: `Edition ${edition} is already approved. The next draft runs in the next quarter.` }
  }

  const since = new Date(now.getTime() - 365 * 86_400_000).toISOString().slice(0, 10)
  const [{ data: pages }, { data: entities }, { data: items }, { data: sovStats }, { data: sovPages }] = await Promise.all([
    db.from('moba_signal_paper_pages').select('*').eq('active', true),
    db.from('moba_signal_entities').select('id, name, ownership_kind, parent_name'),
    db.from('moba_signal_items')
      .select('title, summary, event_date, entity_id, type, category, region, source_url')
      .eq('review_status', 'approved').gte('event_date', since)
      .order('event_date', { ascending: false }).limit(120),
    db.from('moba_signal_social_stats').select('*').order('period_end', { ascending: false }).limit(60),
    db.from('moba_signal_social_pages').select('*'),
  ])

  const subjects = DEFAULT_SUBJECTS.filter(id => (entities ?? []).some((e: Row) => e.id === id))
  if (subjects.length === 0) return { ...base, error: 'None of the paper subjects exist as entities.' }
  base.subjects = subjects

  const entityName = (id: string) => {
    const e = (entities ?? []).find((x: Row) => x.id === id)
    return e ? (e.parent_name ? `${e.name} (part of ${e.parent_name})` : e.name) : id
  }

  // Share-of-voice per subject: latest imported period, pages rolled up.
  const pageEntity = new Map<string, string>(
    (sovPages ?? []).filter((p: Row) => p.include !== false && p.entity_id).map((p: Row) => [p.page_name, p.entity_id]))
  const sovBySubject = new Map<string, { eng: number; posts: number; followers: number }>()
  const latestEnd = (sovStats ?? []).map((s: Row) => s.period_end).sort().pop()
  for (const s of (sovStats ?? []) as Row[]) {
    if (s.period_end !== latestEnd) continue
    const ent = pageEntity.get(s.page_name)
    if (!ent) continue
    const cur = sovBySubject.get(ent) ?? { eng: 0, posts: 0, followers: 0 }
    cur.eng += s.engagements ?? 0; cur.posts += s.posts ?? 0; cur.followers += s.followers ?? 0
    sovBySubject.set(ent, cur)
  }

  // Profile per subject: positioning pages + approved items + channel numbers.
  const profiles: PaperProfile[] = []
  for (const subjectId of subjects) {
    const subjectPages = (pages ?? []).filter((p: Row) => p.entity_id === subjectId)
    const fetched: PageFetch[] = []
    for (const p of subjectPages) {
      const f = await fetchPositioningPage(p.url, p.label ?? undefined)
      fetched.push(f)
      if (f.via === 'failed') base.pagesFailed.push(p.url)
      else base.pagesFetched++
    }
    const subjectItems = ((items ?? []) as Row[]).filter(i => i.entity_id === subjectId).slice(0, 25)
    base.itemsUsed += subjectItems.length

    const pageBlocks = fetched.filter(f => f.via !== 'failed').map(f =>
      `PAGE ${f.url}${f.via === 'wayback' ? ' (via Internet Archive snapshot)' : ''}${f.label ? ` — ${f.label}` : ''}\n${f.text}`)
    const itemLines = subjectItems.map(i =>
      `- [${i.event_date}] ${i.type}/${i.category}/${i.region}: ${i.title}. ${i.summary} (source_url: ${i.source_url})`)

    if (pageBlocks.length === 0 && itemLines.length === 0) {
      return { ...base, error: `No readable input for ${subjectId}: all positioning pages failed and no approved items. Add pages or upload evidence first.` }
    }

    const user = `Company: ${entityName(subjectId)} (entity id: ${subjectId}).

POSITIONING PAGES (their own public copy):
${pageBlocks.length ? pageBlocks.join('\n\n') : 'None reachable this run.'}

APPROVED SIGNAL ITEMS from the last 12 months (${subjectItems.length}):
${itemLines.length ? itemLines.join('\n') : 'None.'}

Draft this company's profile for the Brand & Positioning paper.`

    let raw: string
    try {
      raw = await signalLlmCall({ tier: 'sonnet', system: PROFILE_SYSTEM, user, maxTokens: 3500 })
    } catch (err) {
      return { ...base, error: `Profile draft for ${subjectId} failed: ${err instanceof Error ? err.message : err}` }
    }
    const parsed = ProfileSchema.safeParse(parseJson(raw))
    if (!parsed.success) {
      return { ...base, error: `Profile draft for ${subjectId} did not match the schema.` }
    }
    const d = parsed.data
    const sov = sovBySubject.get(subjectId)
    const themes: PaperProfile['themes'] = {}
    for (const k of THEME_KEYS) {
      const t = d.themes[k]
      if (t) themes[k] = { score: t.score as 0 | 1 | 2 | 3, evidence: factsOf(t.evidence) }
    }
    profiles.push({
      entityId: subjectId,
      snapshot: factsOf(d.snapshot),
      tagline: d.tagline ?? undefined,
      positioningSummary: d.positioning_summary,
      claims: factsOf(d.claims),
      themes,
      audience: factsOf(d.audience),
      proofPoints: factsOf(d.proof_points),
      // Deterministic, from our own stores: never drafted.
      channelBehaviour: sov
        ? `LinkedIn, latest imported period: ${sov.posts} posts, ${sov.eng.toLocaleString('en-US')} engagements, ${sov.followers.toLocaleString('en-US')} followers across mapped pages.`
        : 'No share-of-voice data imported for this company yet.',
    })
  }

  // Cross-company pass on the validated profiles.
  const crossUser = `Company profiles for this edition (grounded and sourced):

${JSON.stringify(profiles.map(p => ({
    entity_id: p.entityId, name: entityName(p.entityId), tagline: p.tagline,
    positioning_summary: p.positioningSummary,
    claims: p.claims.map(c => c.text),
    themes: Object.fromEntries(Object.entries(p.themes).map(([k, v]) => [k, v.score])),
    audience: p.audience.map(a => a.text),
    proof_points: p.proofPoints.map(f => f.text),
  })), null, 1)}

Produce the cross-company analysis.`

  let crossRaw: string
  try {
    crossRaw = await signalLlmCall({ tier: 'sonnet', system: CROSS_SYSTEM, user: crossUser, maxTokens: 2500 })
  } catch (err) {
    return { ...base, error: `Cross-company draft failed: ${err instanceof Error ? err.message : err}` }
  }
  const cross = CrossSchema.safeParse(parseJson(crossRaw))
  if (!cross.success) return { ...base, error: 'Cross-company draft did not match the schema.' }

  const placements = cross.data.placements
    .filter(p => subjects.includes(p.entity_id))
    .map(p => ({ entityId: p.entity_id, x: Math.round(p.x), y: Math.round(p.y), rationale: p.rationale }))
  if (placements.length !== subjects.length) {
    return { ...base, error: 'Cross-company draft is missing a map placement for a subject.' }
  }

  const paper: PositioningPaper = {
    edition,
    subjects,
    generatedAt: new Date().toISOString(),
    profiles,
    map: { placements },
    collisions: cross.data.collisions
      .map(c => ({ claim: c.claim, entityIds: c.entity_ids.filter(id => subjects.includes(id)), note: c.note }))
      .filter(c => c.entityIds.length >= 2),
    changes: [],
    implications: cross.data.implications,
  }

  // Delta vs the previous approved edition: computed, never drafted.
  const { data: prevRow } = await db.from('moba_signal_papers')
    .select('content').eq('status', 'approved').lt('edition', edition)
    .order('edition', { ascending: false }).limit(1).maybeSingle()
  paper.changes = computeChanges((prevRow?.content as PositioningPaper) ?? null, paper)

  const { error } = await db.from('moba_signal_papers').upsert({
    edition, status: 'draft', subjects, content: paper,
    generated_at: paper.generatedAt, approved_by: null, approved_at: null,
  }, { onConflict: 'edition' })
  if (error) return { ...base, error: error.message }
  return { ...base, drafted: true }
}
