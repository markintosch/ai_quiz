// FILE: src/lib/signal/llm.ts
// ─── Moba Signal — LLM client ─────────────────────────────────────────────────
//
// Copied and trimmed from the Atelier pattern (src/lib/atelier/llm.ts), kept
// deliberately separate so the two products never share code paths or model
// policy. Two tiers only: extraction is mechanical (haiku), interpretation
// drafts are not (sonnet).

import Anthropic from '@anthropic-ai/sdk'
import { jsonrepair } from 'jsonrepair'

export type SignalModelTier = 'haiku' | 'sonnet'

const MODEL_BY_TIER: Record<SignalModelTier, string> = {
  haiku:  'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-5',
}

const CALL_TIMEOUT_MS = 90_000

let _client: Anthropic | null = null
function client(): Anthropic {
  if (_client) return _client
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set — required for Moba Signal collection.')
  _client = new Anthropic({ apiKey })
  return _client
}

export interface SignalLlmParams {
  tier: SignalModelTier
  system: string
  user: string
  maxTokens?: number
}

export async function signalLlmCall(params: SignalLlmParams): Promise<string> {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), CALL_TIMEOUT_MS)
  try {
    const res = await client().messages.create({
      model:       MODEL_BY_TIER[params.tier],
      max_tokens:  params.maxTokens ?? 2048,
      temperature: 0.2,
      system:      params.system,
      messages:    [{ role: 'user', content: params.user }],
    }, { signal: ac.signal })
    const block = res.content.find(c => c.type === 'text')
    return block && block.type === 'text' ? block.text : ''
  } catch (err) {
    if (ac.signal.aborted) throw new Error(`Signal LLM call timed out after ${CALL_TIMEOUT_MS / 1000}s`)
    throw err
  } finally {
    clearTimeout(timer)
  }
}

export interface VisionImage {
  base64: string
  mediaType: 'image/png' | 'image/jpeg'
}

export interface SignalVisionParams {
  tier: SignalModelTier
  system: string
  user: string
  images: VisionImage[]
  maxTokens?: number
}

/** Vision variant: image blocks first, then the text instruction. Used for OCR
 *  of screenshot PDFs and image uploads, where there is no text layer to read. */
export async function signalVisionCall(params: SignalVisionParams): Promise<string> {
  if (params.images.length === 0) return ''
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), CALL_TIMEOUT_MS)
  try {
    const res = await client().messages.create({
      model:       MODEL_BY_TIER[params.tier],
      max_tokens:  params.maxTokens ?? 4096,
      temperature: 0,
      system:      params.system,
      messages: [{
        role: 'user',
        content: [
          ...params.images.map(img => ({
            type: 'image' as const,
            source: { type: 'base64' as const, media_type: img.mediaType, data: img.base64 },
          })),
          { type: 'text' as const, text: params.user },
        ],
      }],
    }, { signal: ac.signal })
    const block = res.content.find(c => c.type === 'text')
    return block && block.type === 'text' ? block.text : ''
  } catch (err) {
    if (ac.signal.aborted) throw new Error(`Signal vision call timed out after ${CALL_TIMEOUT_MS / 1000}s`)
    throw err
  } finally {
    clearTimeout(timer)
  }
}

/** Tolerant JSON parse: strips fences, repairs trailing commas etc. */
export function parseJson<T>(raw: string): T {
  let s = raw.trim()
  if (s.startsWith('```')) s = s.replace(/^```[a-zA-Z]*\n?/, '').replace(/```\s*$/, '').trim()
  const start = Math.min(...['{', '['].map(ch => { const i = s.indexOf(ch); return i === -1 ? Infinity : i }))
  if (!isFinite(start)) throw new Error(`No JSON in model output: ${raw.slice(0, 160)}`)
  const candidate = s.slice(start)
  try {
    return JSON.parse(candidate) as T
  } catch {
    return JSON.parse(jsonrepair(candidate)) as T
  }
}
