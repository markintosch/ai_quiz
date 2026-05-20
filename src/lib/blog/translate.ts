/**
 * Translate a Tiptap document and metadata via Claude.
 *
 * Strategy: walk the Tiptap tree and collect every text leaf into a numbered
 * list. Send that list (plus the title/excerpt) to Claude with strict
 * "translate-only, return JSON object {idx -> translation}" instructions.
 * Then walk the tree again and substitute the translated strings back in,
 * preserving every node, mark, and attr exactly.
 *
 * Why this approach instead of just "translate the JSON":
 *   - Asking the LLM to return Tiptap JSON risks structural drift (mis-nested
 *     marks, dropped attrs, broken image src).
 *   - Numbered list keeps token cost low, response is easy to validate, and
 *     structure is guaranteed to round-trip.
 *
 * Image alt text and link href title attrs are also collected (we want those
 * translated too). URLs themselves are NOT translated.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { TiptapDoc, TiptapNode, BlogLocale } from '@/types/blog'

const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929'   // Sonnet 4.6 alias
const MAX_TOKENS   = 8192
const TIMEOUT_MS   = 90_000

const LANG_LABEL: Record<BlogLocale, string> = {
  nl: 'Dutch (Netherlands)',
  en: 'English (US)',
  de: 'German (Germany — Hochdeutsch)',
}

export interface TranslateResult {
  title:    string
  excerpt:  string | null
  content:  TiptapDoc
  meta_title:       string | null
  meta_description: string | null
}

interface TranslatableInputs {
  title:    string
  excerpt:  string | null
  meta_title:       string | null
  meta_description: string | null
  content:  TiptapDoc
}

export async function translatePost(
  inputs:     TranslatableInputs,
  fromLocale: BlogLocale,
  toLocale:   BlogLocale,
): Promise<TranslateResult> {
  if (fromLocale === toLocale) {
    return {
      title:            inputs.title,
      excerpt:          inputs.excerpt,
      content:          inputs.content,
      meta_title:       inputs.meta_title,
      meta_description: inputs.meta_description,
    }
  }

  // Collect translatable strings from the body.
  const slots: string[] = []
  collectStrings(inputs.content as unknown as TiptapNode, slots)

  // Add metadata at the front so we get them back in a single call.
  const META_OFFSET = 4
  const allStrings: string[] = [
    inputs.title,
    inputs.excerpt ?? '',
    inputs.meta_title ?? '',
    inputs.meta_description ?? '',
    ...slots,
  ]

  // Build the numbered prompt.
  const numbered = allStrings
    .map((s, i) => `${i}: ${JSON.stringify(s)}`)
    .join('\n')

  const sourceLang = LANG_LABEL[fromLocale]
  const targetLang = LANG_LABEL[toLocale]

  const system = `You are a professional translator specialising in marketing & strategy content for B2B audiences.

Translate from ${sourceLang} to ${targetLang}.

Tone: confident, peer-to-peer, direct. Match the register of the source. Avoid fluff and Americanisms (German output uses Hochdeutsch unless the source uses Schweizer Orthografie — preserve "ss" if the source has it). Keep proper nouns (Brand PWRD Media, Mark de Kock, names of products, names of cities) untranslated.

Brand voice notes:
- Mark de Kock writes in first person.
- Tone is calm, opinionated, and lightly contrarian.
- Avoid corporate-speak ("synergies", "leverage", "deliverables" are forbidden).

Format: respond with ONE JSON object, no surrounding prose, no markdown fences. Schema:

{ "0": "translated string for index 0", "1": "translated string for index 1", ... }

Every numbered entry from the input MUST appear in the output. If a string is empty (""), translate it as "". Preserve any markdown-like punctuation (asterisks, backticks) inside the strings exactly.`

  const user = `Translate every string. Return JSON only.

${numbered}`

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' })
  const ac = new AbortController()
  const t  = setTimeout(() => ac.abort(), TIMEOUT_MS)

  let raw: string
  try {
    const resp = await client.messages.create(
      {
        model:       CLAUDE_MODEL,
        max_tokens:  MAX_TOKENS,
        temperature: 0.2,
        system,
        messages:    [{ role: 'user', content: user }],
      },
      { signal: ac.signal },
    )
    const block = resp.content.find((b) => b.type === 'text')
    raw = block && 'text' in block ? block.text : ''
  } finally {
    clearTimeout(t)
  }

  // Extract JSON object — model sometimes wraps in fences despite instructions.
  const jsonText = extractJson(raw)
  let parsed: Record<string, string>
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error('Translation response was not valid JSON')
  }

  // Build the translated string array, falling back to source if a key is missing.
  const translated: string[] = allStrings.map((src, i) => {
    const v = parsed[String(i)]
    return typeof v === 'string' ? v : src
  })

  // Walk the body again and rewrite text leaves with the translated entries.
  const newContent = JSON.parse(JSON.stringify(inputs.content)) as TiptapDoc
  let cursor = META_OFFSET
  cursor = applyStrings(newContent as unknown as TiptapNode, translated, cursor)
  // cursor is incremented as we go; we don't care about its final value
  void cursor

  return {
    title:            translated[0] || inputs.title,
    excerpt:          translated[1] || (inputs.excerpt ?? null),
    meta_title:       translated[2] || inputs.meta_title,
    meta_description: translated[3] || inputs.meta_description,
    content:          newContent,
  }
}

// ── Tree walkers ────────────────────────────────────────────────────────────

/**
 * Push every translatable string in the tree to `out`, in the same order
 * `applyStrings` will consume them.
 */
function collectStrings(node: TiptapNode, out: string[]): void {
  if (typeof node.text === 'string' && node.text.length > 0) {
    out.push(node.text)
  }
  // Image alt + title attrs
  if (node.type === 'image' && node.attrs) {
    if (typeof node.attrs.alt   === 'string' && node.attrs.alt.length   > 0) out.push(node.attrs.alt as string)
    if (typeof node.attrs.title === 'string' && node.attrs.title.length > 0) out.push(node.attrs.title as string)
  }
  // Link mark title attr — usually empty so this rarely fires
  if (node.marks) {
    for (const m of node.marks) {
      if (m.type === 'link' && m.attrs && typeof m.attrs.title === 'string' && (m.attrs.title as string).length > 0) {
        out.push(m.attrs.title as string)
      }
    }
  }
  if (Array.isArray(node.content)) {
    for (const c of node.content) collectStrings(c, out)
  }
}

/**
 * Walk the same tree, replacing each translatable position with the next
 * entry from `translated`. Returns the new cursor position.
 */
function applyStrings(node: TiptapNode, translated: string[], cursor: number): number {
  if (typeof node.text === 'string' && node.text.length > 0) {
    node.text = translated[cursor] ?? node.text
    cursor++
  }
  if (node.type === 'image' && node.attrs) {
    if (typeof node.attrs.alt === 'string' && (node.attrs.alt as string).length > 0) {
      node.attrs.alt = translated[cursor] ?? node.attrs.alt
      cursor++
    }
    if (typeof node.attrs.title === 'string' && (node.attrs.title as string).length > 0) {
      node.attrs.title = translated[cursor] ?? node.attrs.title
      cursor++
    }
  }
  if (node.marks) {
    for (const m of node.marks) {
      if (m.type === 'link' && m.attrs && typeof m.attrs.title === 'string' && (m.attrs.title as string).length > 0) {
        m.attrs.title = translated[cursor] ?? m.attrs.title
        cursor++
      }
    }
  }
  if (Array.isArray(node.content)) {
    for (const c of node.content) {
      cursor = applyStrings(c, translated, cursor)
    }
  }
  return cursor
}

function extractJson(raw: string): string {
  const trimmed = raw.trim()
  // Strip ```json ... ``` or ``` ... ``` fences if present
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  if (fenced) return fenced[1].trim()
  // Find first { ... } block
  const first = trimmed.indexOf('{')
  const last  = trimmed.lastIndexOf('}')
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1)
  return trimmed
}
