// FILE: src/lib/atelier/llm.ts
// Provider-agnostic LLM client for Atelier modules.
// First implementation: Anthropic Claude. The interface stays narrow so we
// can swap or add providers (OpenAI, OpenRouter, ...) without changing module
// code. Each module declares the *tier* it wants — the client maps it.

import Anthropic from '@anthropic-ai/sdk'
import { jsonrepair } from 'jsonrepair'

// ── Public types ───────────────────────────────────────────────────────────

export type ModelTier = 'haiku' | 'sonnet' | 'opus'

export interface LlmCallParams {
  /** Module ID for logging — e.g. 'brief_jtbd' */
  module: string
  /** Tier requested. Higher tier = more capable + more expensive. */
  tier: ModelTier
  /** System prompt. Atelier system prompts are in Dutch by default. */
  system: string
  /** User-turn content (what we pass to the model). */
  user: string
  /** Force a JSON-only response (the user prompt should already ask for JSON). */
  jsonOnly?: boolean
  /** Hard cap on output tokens. Defaults to 2048. */
  maxTokens?: number
  /** Sampling temperature. Atelier defaults to 0.3 — synthesis tasks. */
  temperature?: number
}

export interface LlmCallResult {
  text:           string
  model:          string
  provider:       string
  promptTokens:   number
  outputTokens:   number
  latencyMs:      number
  costCents:      number   // estimated, in EUR cents (rough)
}

// ── Tier → model mapping ───────────────────────────────────────────────────
// Mapping centralised here so a single edit changes every module's model.
// Keep in sync with the README in docs/atelier-architecture.md.

const ANTHROPIC_MODEL_BY_TIER: Record<ModelTier, string> = {
  haiku:  'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-6',
  // Opus reserved for monthly review / heavy synthesis. Keep an eye on cost.
  opus:   'claude-opus-4-7',
}

// Indicative pricing (€/M tokens) — used only for cost-cents logging.
// Recheck when Anthropic updates pricing; off by ±20% is fine for ops use.
const PRICING_PER_M_TOKENS_EUR: Record<ModelTier, { input: number; output: number }> = {
  haiku:  { input: 0.85, output: 4.20 },   // ~ $1 / $5
  sonnet: { input: 2.85, output: 14.20 },  // ~ $3 / $15
  opus:   { input: 14.00, output: 70.00 }, // ~ $15 / $75
}

// ── Client init ────────────────────────────────────────────────────────────

let _client: Anthropic | null = null
function client(): Anthropic {
  if (_client) return _client
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set — required for Atelier LLM calls.')
  }
  _client = new Anthropic({ apiKey })
  return _client
}

// ── Main entry point ───────────────────────────────────────────────────────

export async function llmCall(params: LlmCallParams): Promise<LlmCallResult> {
  const start = Date.now()
  const model = ANTHROPIC_MODEL_BY_TIER[params.tier]
  const userMessage = params.jsonOnly
    ? `${params.user}\n\nGeef je antwoord uitsluitend als geldige JSON, zonder enige tekst eromheen.`
    : params.user

  const response = await client().messages.create({
    model,
    max_tokens:  params.maxTokens ?? 2048,
    temperature: params.temperature ?? 0.3,
    system:      params.system,
    messages: [{ role: 'user', content: userMessage }],
  })

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('\n')

  const latencyMs = Date.now() - start
  const promptTokens = response.usage.input_tokens
  const outputTokens = response.usage.output_tokens
  const pricing = PRICING_PER_M_TOKENS_EUR[params.tier]
  const costEur = (promptTokens / 1_000_000) * pricing.input
                + (outputTokens / 1_000_000) * pricing.output
  const costCents = Math.round(costEur * 100 * 100) / 100  // 4-decimal cents

  return {
    text,
    model,
    provider: 'anthropic',
    promptTokens,
    outputTokens,
    latencyMs,
    costCents,
  }
}

// ── JSON helper — safely extract JSON from a model response ────────────────

/**
 * Robustly parse a JSON object/array out of a model response.
 *
 * Handles three real-world failure modes we've seen on Atelier:
 *   1. Markdown code fences around the JSON (`\`\`\`json ... \`\`\``).
 *   2. The model added prose before/after the JSON ("Here is the JSON: { ... }").
 *   3. The response got truncated mid-string by max_tokens (no closing bracket).
 *
 * Strategy:
 *   - Strip code fences if any.
 *   - Locate the first JSON candidate by scanning bracket depth — extract just
 *     the {...}/[...] block, ignoring any prose around it.
 *   - Try JSON.parse. On failure, run jsonrepair (handles truncated strings,
 *     missing brackets, single quotes, trailing commas, etc.) and try again.
 *   - If repair also fails, throw the original error.
 */
export function parseJsonOutput<T>(raw: string): T {
  let s = raw.trim()
  if (s.startsWith('```')) {
    s = s.replace(/^```[a-zA-Z]*\n?/, '').replace(/```\s*$/, '').trim()
  }

  const candidate = extractFirstJsonCandidate(s)
  if (!candidate) {
    throw new Error(`No JSON found in model output: ${raw.slice(0, 200)}`)
  }

  try {
    return JSON.parse(candidate) as T
  } catch (firstErr) {
    try {
      const repaired = jsonrepair(candidate)
      return JSON.parse(repaired) as T
    } catch {
      throw firstErr
    }
  }
}

/**
 * Walk the string, find the first `{` or `[`, return everything from there
 * up to (and including) the matching closing bracket. If we run off the end
 * without closing, return everything from the opener — jsonrepair will then
 * fix the truncation downstream.
 */
function extractFirstJsonCandidate(s: string): string | null {
  let depth = 0
  let inString = false
  let escape = false
  let start = -1
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (escape) { escape = false; continue }
    if (ch === '\\') { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === '{' || ch === '[') {
      if (start === -1) start = i
      depth++
    } else if (ch === '}' || ch === ']') {
      if (start === -1) continue
      depth--
      if (depth === 0) {
        return s.slice(start, i + 1)
      }
    }
  }
  return start !== -1 ? s.slice(start) : null
}
