// FILE: src/lib/atelier/run-logger.ts
// Wraps an LLM call with persistence to atelier_module_runs so every
// module invocation is auditable and the Phase 1 quantitative gates
// have data to query.

import { createHash } from 'crypto'
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import { llmCall, type LlmCallParams, type LlmCallResult } from './llm'

let _sb: SupabaseClient | null = null
function sb(): SupabaseClient {
  if (_sb) return _sb
  _sb = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  return _sb
}

export interface RunLoggerInput<TInput, TOutput> {
  sessionId:  string
  module:     'brief_jtbd' | 'reference' | 'audience' | 'tension' | 'output'
  llm:        Omit<LlmCallParams, 'module'>
  /** Used for input_hash + stored payload. Should fully describe the input. */
  inputPayload: TInput
  /** Parses & validates the model's text response. Throw on invalid. */
  parse:      (raw: string) => TOutput
}

export interface RunLoggerResult<TOutput> {
  output:    TOutput
  raw:       LlmCallResult
  runId:     string
}

/**
 * Run an LLM call inside a logged module-run row.
 *  - Hashes the input for cache/dedupe
 *  - Persists timing, cost, model, prompt + output tokens
 *  - Stores the validated output payload
 *  - Marks status ok / failed
 *
 * Always returns the parsed output on success. On parse failure, persists
 * a 'failed' run and re-throws so the orchestrator can surface the error.
 */
export async function runModule<TInput, TOutput>(
  args: RunLoggerInput<TInput, TOutput>
): Promise<RunLoggerResult<TOutput>> {
  const inputJson = JSON.stringify(args.inputPayload)
  const inputHash = createHash('sha256').update(inputJson).digest('hex')

  // Insert pending run row to capture started_at + dedupe attempts later
  const { data: runRow, error: insertErr } = await sb()
    .from('atelier_module_runs')
    .insert({
      session_id:    args.sessionId,
      module:        args.module,
      status:        'ok',  // optimistic; flipped to 'failed' on error
      input_hash:    inputHash,
      input_payload: args.inputPayload,
    })
    .select('id')
    .single()

  if (insertErr || !runRow) {
    // If even the insert failed, surface clearly — likely the migration
    // hasn't been applied yet.
    throw new Error(`atelier_module_runs insert failed (did the migration run?): ${insertErr?.message ?? 'no row returned'}`)
  }

  const runId = (runRow as { id: string }).id

  try {
    const result = await llmCall({ ...args.llm, module: args.module })
    const output = args.parse(result.text)

    await sb()
      .from('atelier_module_runs')
      .update({
        status:         'ok',
        model:          result.model,
        provider:       result.provider,
        output_payload: output as unknown as object,
        prompt_tokens:  result.promptTokens,
        output_tokens:  result.outputTokens,
        latency_ms:     result.latencyMs,
        cost_cents:     result.costCents,
        finished_at:    new Date().toISOString(),
      })
      .eq('id', runId)

    return { output, raw: result, runId }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await sb()
      .from('atelier_module_runs')
      .update({
        status:        'failed',
        error_message: message.slice(0, 1000),
        finished_at:   new Date().toISOString(),
      })
      .eq('id', runId)
    throw err
  }
}

export { sb as serverSupabase }
