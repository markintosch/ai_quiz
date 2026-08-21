// FILE: src/lib/signal/brief.ts
// ─── Moba Signal — the Editor agent's weekly brief ───────────────────────────
//
// Drafts the Monday competitive brief from the week's APPROVED items only:
// the agent summarises what humans already validated, never raw collection.
// Temperature is computed deterministically (explainable); the prose sections
// are drafted by the sonnet tier under strict grounding instructions and
// stay status='draft' until the analyst approves them in the console.

import { z } from 'zod'
import { parseJson, signalLlmCall } from './llm'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any

const BriefSchema = z.object({
  headline:           z.string().min(20).max(400),
  what_happened:      z.string().min(10).max(700),
  key_development:    z.string().min(10).max(500),
  why_it_matters:     z.string().min(10).max(600),
  moba_advantage:     z.string().min(10).max(500),
  marketing_response: z.string().min(10).max(400),
  sales_response:     z.string().min(10).max(400),
  watch_next:         z.string().min(10).max(400),
  changes:            z.array(z.object({ entity: z.string(), change: z.string().max(200) })).max(5),
})

const SYSTEM = `You are the Editor agent of Moba Signal, a competitive intelligence system for Moba (egg grading, packing and processing equipment; competitors include Sanovo, NABEL, Prinzen/Vencomatic, Zenyer).

You draft the Monday competitive brief for Moba's marketing and innovation leadership. STRICT GROUNDING RULES:
- Use ONLY the items and numbers provided. Never add facts, companies, products or figures that are not in the input.
- If the week is thin, say so plainly. A short honest brief beats a padded one.
- Recommended responses must follow from the provided items; frame them as options for the team, not orders.
- Style: short sentences, no hype words, no em-dashes. Write like an analyst opening a Monday meeting.
- 'changes': up to 5 per-competitor movements this week, each one concrete sentence.

Answer with valid JSON only, exactly these keys:
{"headline":"...","what_happened":"...","key_development":"...","why_it_matters":"...","moba_advantage":"...","marketing_response":"...","sales_response":"...","watch_next":"...","changes":[{"entity":"...","change":"..."}]}`

function mondayOf(d: Date): string {
  const x = new Date(d)
  const day = x.getUTCDay()
  x.setUTCDate(x.getUTCDate() - ((day + 6) % 7))
  return x.toISOString().slice(0, 10)
}

export interface BriefResult {
  weekStart: string
  temperature: 'elevated' | 'normal' | 'quiet'
  itemsUsed: number
  drafted: boolean
  error?: string
}

export async function draftWeeklyBrief(db: Db, now = new Date()): Promise<BriefResult> {
  const weekStart = mondayOf(now)
  const since = new Date(now.getTime() - 7 * 86_400_000).toISOString().slice(0, 10)
  const prior28 = new Date(now.getTime() - 35 * 86_400_000).toISOString().slice(0, 10)

  const [{ data: items }, { data: priorItems }, { data: entities }, { data: sovStats }, { data: sovPages }] = await Promise.all([
    db.from('moba_signal_items')
      .select('title, summary, event_date, entity_id, entity_guess, type, region, category, proximity, materiality, credibility, disposition, quotes')
      .eq('review_status', 'approved').gte('event_date', since).order('event_date', { ascending: false }).limit(40),
    db.from('moba_signal_items').select('id, event_date').eq('review_status', 'approved')
      .gte('event_date', prior28).lt('event_date', since),
    db.from('moba_signal_entities').select('id, name, ownership_kind, parent_name'),
    db.from('moba_signal_social_stats').select('*').order('period_end', { ascending: false }).limit(40),
    db.from('moba_signal_social_pages').select('*'),
  ])

  const weekItems = items ?? []
  // Deterministic temperature: any critical-scoring item or 1.5x the prior
  // 4-week weekly average = elevated; zero items = quiet; else normal.
  const weeklyAvg = (priorItems?.length ?? 0) / 4
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasCritical = weekItems.some((i: any) => i.proximity + i.materiality + i.credibility >= 8 && i.credibility > 1)
  const temperature: BriefResult['temperature'] =
    weekItems.length === 0 ? 'quiet'
    : hasCritical || weekItems.length > Math.max(weeklyAvg * 1.5, 2) ? 'elevated'
    : 'normal'

  if (weekItems.length === 0) {
    await db.from('moba_signal_briefs').upsert({
      week_start: weekStart, status: 'draft', temperature,
      headline: 'A quiet competitive week: no approved items in the last seven days.',
      what_happened: 'No approved competitive items this week.',
      key_development: 'None recorded.', why_it_matters: 'No movement to act on.',
      moba_advantage: 'Not assessed this week.', marketing_response: 'No action needed.',
      sales_response: 'No action needed.', watch_next: 'Next collection cycles and the review queue.',
      changes: [],
    }, { onConflict: 'week_start' })
    return { weekStart, temperature, itemsUsed: 0, drafted: true }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entityName = (id: string | null, guess: string | null) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = (entities ?? []).find((x: any) => x.id === id)
    if (!e) return guess ?? 'unknown'
    return e.parent_name ? `${e.name} (part of ${e.parent_name})` : e.name
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itemLines = weekItems.map((i: any) =>
    `- [${i.event_date}] ${entityName(i.entity_id, i.entity_guess)} · ${i.type}/${i.category}/${i.region} · score ${i.proximity + i.materiality + i.credibility}/9${i.disposition ? ` · ${i.disposition}` : ''}: ${i.title}. ${i.summary}${(i.quotes ?? []).length ? ` Quotes: ${(i.quotes as string[]).join(' | ')}` : ''}`)

  // Share-of-voice context: latest period per entity, mapped pages only
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageEntity = new Map<string, string>((sovPages ?? []).filter((p: any) => p.include !== false && p.entity_id).map((p: any) => [p.page_name, p.entity_id]))
  const sovLines: string[] = []
  if ((sovStats ?? []).length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const latestEnd = (sovStats as any[]).map(s => s.period_end).sort().pop()
    const agg = new Map<string, { eng: number; posts: number }>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const s of sovStats as any[]) {
      if (s.period_end !== latestEnd) continue
      const ent = pageEntity.get(s.page_name)
      if (!ent) continue
      const cur = agg.get(ent) ?? { eng: 0, posts: 0 }
      cur.eng += s.engagements ?? 0; cur.posts += s.posts ?? 0
      agg.set(ent, cur)
    }
    for (const [ent, v] of agg) sovLines.push(`- ${entityName(ent, null)}: ${v.posts} posts, ${v.eng} engagements (latest imported period)`)
  }

  const user = `Week starting ${weekStart}. Competitive temperature (computed): ${temperature}.

Approved competitive items from the last 7 days (${weekItems.length}):
${itemLines.join('\n')}
${sovLines.length ? `\nLinkedIn share-of-voice, latest period:\n${sovLines.join('\n')}` : ''}

Draft the Monday competitive brief.`

  let raw: string
  try {
    raw = await signalLlmCall({ tier: 'sonnet', system: SYSTEM, user, maxTokens: 2000 })
  } catch (err) {
    return { weekStart, temperature, itemsUsed: weekItems.length, drafted: false, error: err instanceof Error ? err.message : String(err) }
  }
  const parsed = BriefSchema.safeParse(parseJson(raw))
  if (!parsed.success) {
    return { weekStart, temperature, itemsUsed: weekItems.length, drafted: false, error: 'Draft did not match the brief schema' }
  }
  const b = parsed.data

  const { error } = await db.from('moba_signal_briefs').upsert({
    week_start: weekStart, status: 'draft', temperature,
    headline: b.headline, what_happened: b.what_happened, key_development: b.key_development,
    why_it_matters: b.why_it_matters, moba_advantage: b.moba_advantage,
    marketing_response: b.marketing_response, sales_response: b.sales_response,
    watch_next: b.watch_next, changes: b.changes,
  }, { onConflict: 'week_start' })
  if (error) return { weekStart, temperature, itemsUsed: weekItems.length, drafted: false, error: error.message }
  return { weekStart, temperature, itemsUsed: weekItems.length, drafted: true }
}
