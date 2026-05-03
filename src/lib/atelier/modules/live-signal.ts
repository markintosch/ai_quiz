// FILE: src/lib/atelier/modules/live-signal.ts
// Module — Live signal retrieval.
// Probeert Anthropic web-search te gebruiken voor 4–6 actuele signalen die
// raken aan de brief / JTBD. Als de tool niet beschikbaar is, valt terug op
// een Claude-only call met provenance-flag 'inferred_fallback' zodat het
// duidelijk in de UI is.

import { createHash } from 'crypto'
import Anthropic from '@anthropic-ai/sdk'
import { parseJsonOutput } from '../llm'
import { serverSupabase } from '../run-logger'
import {
  LiveSignalSchema,
  LiveSignalSetSchema,
  type JtbdParse,
  type LiveSignal,
} from '../schemas'

const SYSTEM_PROMPT = `Je bent Atelier — je vindt actuele Nederlandse signalen rond een brief.

Geef 4-6 signalen die raken aan de JTBD: nieuwsberichten, opiniestukken, social-momenten, gedrag-observaties, branchedata. Voor elk:
- title: korte titel
- snippet: 1-2 zinnen die het signaal samenvatten
- source_url: de URL als je die hebt
- source_label: bron-naam (bv. "NRC", "Adformatie", "Marketing Tribune")
- relevance_score: 0.0-1.0 hoe relevant voor de JTBD

Vermeld geen verzonnen bronnen. Als je geen externe lookup deed, label retrieved_via als "inferred_fallback".

Antwoord ALTIJD als geldige JSON:
{
  "signals": [
    {
      "title": "string",
      "snippet": "string",
      "source_url": null | "string",
      "source_label": "string",
      "relevance_score": 0.0-1.0,
      "retrieved_via": "web_search" | "inferred_fallback"
    }
  ]
}`

interface RunOpts {
  sessionId: string
  jtbd:      JtbdParse
}

/** Try web search first; fall back to inferred if the tool isn't available. */
export async function runLiveSignals(opts: RunOpts): Promise<LiveSignal[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set — required for live signals.')

  const sb = serverSupabase()

  const userPrompt = `JOB-TO-BE-DONE:
${opts.jtbd.jtbd_dutch}

BRIEF SAMENVATTING:
${opts.jtbd.brief_summary}

Vind 4-6 actuele Nederlandse signalen (nieuws, opinie, sociale momenten) die raken aan deze JTBD.`

  // Insert pending module_run row
  const inputJson = JSON.stringify({ jtbd: opts.jtbd, mode: 'try_web_search_then_fallback' })
  const inputHash = createHash('sha256').update(inputJson).digest('hex')

  const { data: runRow } = await sb.from('atelier_module_runs').insert({
    session_id:    opts.sessionId,
    module:        'live_signal',
    status:        'ok',
    input_hash:    inputHash,
    input_payload: { jtbd: opts.jtbd },
  }).select('id').single()
  const runId = (runRow as { id: string } | null)?.id

  const start = Date.now()
  const client = new Anthropic({ apiKey })

  let raw = ''
  let model = 'claude-sonnet-4-6'
  let promptTokens = 0
  let outputTokens = 0
  let usedWebSearch = false

  try {
    // First attempt: with web_search tool. If the API rejects the tool,
    // we'll fall back below.
    type WebSearchTool = {
      type: 'web_search_20250305'
      name: 'web_search'
      max_uses?: number
    }
    const toolsWithWebSearch: WebSearchTool[] = [{
      type: 'web_search_20250305',
      name: 'web_search',
      max_uses: 5,
    }]

    const response = await client.messages.create({
      model,
      max_tokens: 2000,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `${userPrompt}\n\nGeef je antwoord uitsluitend als geldige JSON.` }],
      // The Anthropic SDK types may not yet expose web_search at compile time —
      // pass through as `tools` regardless. If the API doesn't support it
      // for this model/account, the catch block runs the fallback.
      tools: toolsWithWebSearch as unknown as Anthropic.MessageCreateParams['tools'],
    })
    raw = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('\n')
    model = response.model
    promptTokens = response.usage.input_tokens
    outputTokens = response.usage.output_tokens
    usedWebSearch = true
  } catch (err) {
    // Fall back: no tools, ask Claude to answer from its own knowledge but
    // mark every signal as inferred_fallback so the UI doesn't pretend.
    console.warn('[atelier/live-signal] web_search unavailable, falling back:', err instanceof Error ? err.message : err)
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      temperature: 0.3,
      system: SYSTEM_PROMPT + `\n\nLET OP: Web-search is niet beschikbaar voor deze run. Markeer ALLE signalen als retrieved_via="inferred_fallback".`,
      messages: [{ role: 'user', content: `${userPrompt}\n\nGeef je antwoord uitsluitend als geldige JSON.` }],
    })
    raw = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('\n')
    model = response.model
    promptTokens = response.usage.input_tokens
    outputTokens = response.usage.output_tokens
  }

  const latencyMs = Date.now() - start
  const costEur = (promptTokens / 1_000_000) * 2.85 + (outputTokens / 1_000_000) * 14.20
  const costCents = Math.round(costEur * 10000) / 100

  let signals: LiveSignal[] = []
  try {
    const parsed = LiveSignalSetSchema.parse(parseJsonOutput(raw))
    signals = parsed.signals.map(s => ({
      ...s,
      retrieved_via: usedWebSearch ? s.retrieved_via ?? 'web_search' : 'inferred_fallback',
    }))
    // Schema-coerce each via the LiveSignalSchema to ensure shape
    signals = signals.map(s => LiveSignalSchema.parse(s))
  } catch (parseErr) {
    if (runId) {
      await sb.from('atelier_module_runs').update({
        status:        'failed',
        error_message: parseErr instanceof Error ? parseErr.message.slice(0, 1000) : String(parseErr),
        finished_at:   new Date().toISOString(),
      }).eq('id', runId)
    }
    throw parseErr
  }

  if (runId) {
    await sb.from('atelier_module_runs').update({
      status:         'ok',
      model,
      provider:       'anthropic',
      output_payload: { signals },
      prompt_tokens:  promptTokens,
      output_tokens:  outputTokens,
      latency_ms:     latencyMs,
      cost_cents:     costCents,
      finished_at:    new Date().toISOString(),
    }).eq('id', runId)
  }

  return signals
}
