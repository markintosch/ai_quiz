// FILE: src/lib/signal/score.ts
// ─── Moba Signal — deterministic scoring and linking ──────────────────────────
//
// The impact model stays rule-based on purpose: the analyst must be able to
// see WHY an item scored what it did, and adjust it. The LLM extracts facts;
// it does not rank them (PRD: the agent ranks by rules, the human declares).

import type { ExtractedItem } from './extract'

export interface EntityRow {
  id: string
  name: string
  ownership_kind: string
  aliases: string[]
  regions: string[]
  priority: boolean
}

export interface LinkResult {
  entityId: string | null
  entityGuess: string | null
  linkedIds: string[]
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/** Match extracted company names against tracked entities (names + aliases). */
export function linkEntities(names: string[], entities: EntityRow[]): LinkResult {
  const matched: string[] = []
  let guess: string | null = null
  for (const raw of names) {
    const n = norm(raw)
    const hit = entities.find(e =>
      norm(e.name) === n ||
      e.aliases.some(a => norm(a) === n) ||
      n.includes(norm(e.name)) || norm(e.name).includes(n)
    )
    if (hit) { if (!matched.includes(hit.id)) matched.push(hit.id) }
    else if (!guess) guess = raw
  }
  return { entityId: matched[0] ?? null, entityGuess: matched.length ? null : guess, linkedIds: matched.slice(1) }
}

/** Credibility by source class (PRD §6): primary=verify later, press=2, social=1. */
export function credibilityFor(sourceClass: string): 1 | 2 | 3 {
  switch (sourceClass) {
    case 'competitor-site':
    case 'patents':
    case 'events':
    case 'association': return 2   // primary source, but 3 requires analyst verification
    case 'trade-press': return 2
    case 'social':
    case 'jobs':
    case 'human':       return 1
    default:            return 1
  }
}

/** Materiality by event type. */
export function materialityFor(type: ExtractedItem['type']): 1 | 2 | 3 {
  switch (type) {
    case 'funding':
    case 'facility':     return 3
    case 'win':
    case 'partnership':
    case 'launch':       return 2
    case 'personnel':    return 2
    case 'certification':return 1
    default:             return 1
  }
}

/**
 * Proximity: 3 when a strategic account is named or the item touches a Moba
 * brand; 2 when a tracked competitor in our segment; 1 for adjacent context.
 */
export function proximityFor(item: ExtractedItem, link: LinkResult, entities: EntityRow[], accountNames: string[]): 1 | 2 | 3 {
  const text = norm(`${item.title} ${item.summary} ${item.entities.join(' ')}`)
  if (accountNames.some(a => a && text.includes(norm(a)))) return 3
  const primary = entities.find(e => e.id === link.entityId)
  if (primary?.ownership_kind === 'moba') return 3
  if (primary) return 2
  return 1
}

/** Dedupe key: same entity (or guess), same type, same week bucket. */
export function dedupeKey(item: ExtractedItem, link: LinkResult): string {
  const who = link.entityId ?? norm(link.entityGuess ?? item.entities[0] ?? 'unknown')
  const week = Math.floor(Date.parse(item.date) / (7 * 86_400_000))
  return `${who}|${item.type}|${week}`
}
