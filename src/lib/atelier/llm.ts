// FILE: src/lib/atelier/llm.ts
// Provider-agnostic LLM client for Atelier modules.
// First implementation: Anthropic Claude. The interface stays narrow so we
// can swap or add providers (OpenAI, OpenRouter, ...) without changing module
// code. Each module declares the *tier* it wants — the client maps it.

import Anthropic from '@anthropic-ai/sdk'

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

export function parseJsonOutput<T>(raw: string): T {
  // Strip optional markdown code fences (the model occasionally adds them
  // even when told not to).
  let s = raw.trim()
  if (s.startsWith('```')) {
    s = s.replace(/^```[a-zA-Z]*\n?/, '').replace(/```\s*$/, '').trim()
  }
  // Some models prefix a sentence before the JSON. Best-effort: find the
  // first `{` or `[` and parse from there.
  const start = Math.min(
    ...['{', '['].map(c => {
      const i = s.indexOf(c)
      return i === -1 ? Infinity : i
    })
  )
  if (start === Infinity) throw new Error(`No JSON found in model output: ${raw.slice(0, 200)}`)
  s = s.slice(start)

  // Try direct parse first
  try {
    return JSON.parse(s) as T
  } catch (firstErr) {
    // If the response was truncated mid-string (model ran out of tokens),
    // attempt a salvage: cut at the last complete element/property and
    // close the open brackets. Crude but usually works for our schemas
    // because the early fields are the load-bearing ones.
    const repaired = repairTruncatedJson(s)
    try {
      return JSON.parse(repaired) as T
    } catch {
      // Re-throw original error so the failure mode is clear in logs
      throw firstErr
    }
  }
}

/**
 * Best-effort repair for JSON that was cut off mid-string by max_tokens.
 *  1. Walk back to the last complete `,` or `}` or `]` we can see at the right depth.
 *  2. Close any open `{` `[` and `"`.
 * Imperfect but unlocks a usable result instead of a hard failure.
 */
function repairTruncatedJson(s: string): string {
  // Walk forward, track string state + bracket depths.
  const stack: string[] = []
  let inString = false
  let escape = false
  let lastSafeIdx = -1
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (escape) { escape = false; continue }
    if (ch === '\\') { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === '{' || ch === '[') stack.push(ch === '{' ? '}' : ']')
    else if (ch === '}' || ch === ']') {
      if (stack.length > 0 && stack[stack.length - 1] === ch) stack.pop()
    }
    // Mark a safe truncation point: after we've completed a value at top-of-stack
    if (!inString && (ch === ',' || ch === '}' || ch === ']') && stack.length <= 1) {
      lastSafeIdx = i
    }
  }
  // If we ended inside a string, cut at lastSafeIdx and close.
  let trimmed = lastSafeIdx >= 0 ? s.slice(0, lastSafeIdx + 1) : s
  // Strip trailing comma if present
  trimmed = trimmed.replace(/,\s*$/, '')
  // Recompute open brackets
  const openCount: Record<string, number> = { '{': 0, '[': 0 }
  let stringMode = false
  let esc = false
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i]
    if (esc) { esc = false; continue }
    if (ch === '\\') { esc = true; continue }
    if (ch === '"') stringMode = !stringMode
    if (stringMode) continue
    if (ch === '{') openCount['{']++
    if (ch === '}') openCount['{']--
    if (ch === '[') openCount['[']++
    if (ch === ']') openCount['[']--
  }
  if (stringMode) trimmed += '"'
  // Close remaining brackets in reverse-LIFO order — best-effort
  while (openCount['['] > 0) { trimmed += ']'; openCount['[']-- }
  while (openCount['{'] > 0) { trimmed += '}'; openCount['{']-- }
  return trimmed
}
