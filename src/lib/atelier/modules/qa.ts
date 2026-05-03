// FILE: src/lib/atelier/modules/qa.ts
// Module — Session Q&A.
// Beantwoordt vragen over een specifieke sessie. Krijgt de bundle als
// context (JTBD, references, audience, ICP, angles, directions) en het
// nieuwste vraag van de gebruiker. Antwoord wordt gepersisteerd in
// atelier_qa_turns + ook gelogd in atelier_module_runs.

import { createHash } from 'crypto'
import { llmCall } from '../llm'
import { serverSupabase } from '../run-logger'
import type {
  AudiencePicture,
  Direction,
  IcpProfile,
  JtbdParse,
  LiveSignal,
  Reference,
  Angle,
} from '../schemas'

const SYSTEM_PROMPT = `Je bent Atelier — werkpartner voor brand- en creatieve teams. Je hebt een complete sessie-bundle voor je: JTBD, doelgroep, ICP, referenties, drie analytische lenzen, directional routes en eventuele live signalen.

Beantwoord de vraag van de gebruiker over deze specifieke sessie. Regels:
- Schrijf in Nederlands tenzij anders gevraagd.
- Maximaal 6 zinnen tenzij meer echt nodig.
- Verwijs concreet naar onderdelen van de bundle (bv. "Route 2", "Street Signal #1", "ICP-trigger 'budget cycle'").
- Verzin geen feiten. Als het antwoord niet uit de bundle volgt, zeg dat.
- Toon scherpte boven beleefdheid.`

interface AskInput {
  sessionId: string
  question:  string
  bundle: {
    jtbd:        JtbdParse
    references:  Reference[]
    audience:    AudiencePicture
    directions:  Direction[]
    icp?:        IcpProfile
    angles:      Angle[]
    liveSignals: LiveSignal[]
  }
  history: Array<{ question: string; answer: string }>
}

export interface QaAnswer {
  answer:    string
  costCents: number
  model:     string
  promptTokens: number
  outputTokens: number
}

export async function runQa(input: AskInput): Promise<QaAnswer> {
  const sb = serverSupabase()

  const bundleSummary = buildBundleSummary(input.bundle)
  const historyBlock = input.history.length > 0
    ? `EERDERE VRAGEN IN DEZE SESSIE:\n${input.history.map((h, i) => `${i + 1}. Q: ${h.question}\n   A: ${h.answer}`).join('\n\n')}\n`
    : ''

  const userPrompt = `${bundleSummary}\n\n${historyBlock}NIEUWE VRAAG:\n${input.question}`

  const inputHash = createHash('sha256').update(input.question + input.sessionId).digest('hex')
  const { data: runRow } = await sb.from('atelier_module_runs').insert({
    session_id:    input.sessionId,
    module:        'qa',
    status:        'ok',
    input_hash:    inputHash,
    input_payload: { question: input.question, history_length: input.history.length },
  }).select('id').single()
  const runId = (runRow as { id: string } | null)?.id

  try {
    const result = await llmCall({
      module: 'qa',
      tier:   'sonnet',
      system: SYSTEM_PROMPT,
      user:   userPrompt,
      maxTokens: 800,
      temperature: 0.4,
    })

    if (runId) {
      await sb.from('atelier_module_runs').update({
        status:         'ok',
        model:          result.model,
        provider:       result.provider,
        output_payload: { answer: result.text },
        prompt_tokens:  result.promptTokens,
        output_tokens:  result.outputTokens,
        latency_ms:     result.latencyMs,
        cost_cents:     result.costCents,
        finished_at:    new Date().toISOString(),
      }).eq('id', runId)
    }

    return {
      answer:       result.text.trim(),
      costCents:    result.costCents,
      model:        result.model,
      promptTokens: result.promptTokens,
      outputTokens: result.outputTokens,
    }
  } catch (err) {
    if (runId) {
      await sb.from('atelier_module_runs').update({
        status:        'failed',
        error_message: err instanceof Error ? err.message.slice(0, 1000) : String(err),
        finished_at:   new Date().toISOString(),
      }).eq('id', runId)
    }
    throw err
  }
}

function buildBundleSummary(b: AskInput['bundle']): string {
  const refsBlock = b.references.length > 0
    ? `REFERENTIES:\n${b.references.map(r => `- ${r.title} — ${r.taste_note} [bron: ${r.source_label}]`).join('\n')}`
    : 'REFERENTIES: (geen)'

  const street = b.audience.signals.filter(s => s.track === 'street')
  const ground = b.audience.signals.filter(s => s.track === 'ground')

  const audienceBlock = `AUDIENCE PICTURE:
${b.audience.audience_summary}

STREET SIGNAL:
${street.length > 0 ? street.map(s => `- ${s.claim} (${s.confidence}, bron: ${s.source_label})`).join('\n') : '(geen)'}

GROUND TRUTH:
${ground.length > 0 ? ground.map(s => `- ${s.claim} (${s.confidence}, bron: ${s.source_label})`).join('\n') : '(geen)'}`

  const icpBlock = b.icp
    ? `ICP:
- Industry: ${b.icp.industry}
- Rol: ${b.icp.role}
- Bedrijfsgrootte: ${b.icp.company_size}
- Triggers: ${b.icp.triggers.join('; ')}
- Jobs: ${b.icp.jobs.join('; ')}
- Pains: ${b.icp.pains.join('; ')}
- Buying committee: ${b.icp.buying_committee.map(m => `${m.role} (${m.influence})`).join(', ')}`
    : 'ICP: (geen)'

  const anglesBlock = b.angles.length > 0
    ? `LENZEN:\n${b.angles.map(a => `[${a.lens}] ${a.headline}`).join('\n')}`
    : 'LENZEN: (geen)'

  const directionsBlock = b.directions.length > 0
    ? `DIRECTIONAL ROUTES:\n${b.directions.map(d => `${d.position}. TENSION: ${d.tension}\n   ROUTE: ${d.route}`).join('\n\n')}`
    : 'DIRECTIONAL ROUTES: (geen)'

  const liveBlock = b.liveSignals.length > 0
    ? `LIVE SIGNALS:\n${b.liveSignals.map(s => `- ${s.title} [${s.retrieved_via}, bron: ${s.source_label}]`).join('\n')}`
    : ''

  return `JTBD:
${b.jtbd.jtbd_dutch}
(${b.jtbd.brief_summary})

${refsBlock}

${audienceBlock}

${icpBlock}

${anglesBlock}

${directionsBlock}

${liveBlock}`.trim()
}
