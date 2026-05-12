/**
 * Perimenopause Compass — Claude integration.
 *
 * Geeft Claude de scores + open antwoorden, krijgt terug:
 *  - observation:        1 paragraaf (3-5 zinnen)
 *  - hypotheses:         3 mogelijke verklaringen voor wat we zien
 *  - microExperiment:    1 concreet experiment voor de eerste 30 dagen
 *  - recommendedTracking: { symptoms: string[], fields: string[] }
 *
 * GEEN medisch advies. Disclaimer is verplicht in elke output.
 */

import Anthropic from '@anthropic-ai/sdk'
import { jsonrepair } from 'jsonrepair'
import type { CompassScore } from './scoring'
import type { Stage } from './questions'

const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929'    // Sonnet 4.6 alias
const MAX_TOKENS   = 2500
const TIMEOUT_MS   = 90_000

export interface CompassAiOutput {
  observation:         string
  hypotheses:          string[]            // exact 3
  microExperiment:     string
  recommendedTracking: { symptoms: string[]; fields: string[] }
}

interface AiInput {
  stage:           Stage
  ageBand?:        string
  hrtStatus?:      string
  score:           CompassScore
  symptomsList:    string[]                // gekozen symptoom-codes (mens-leesbare labels)
  topConcern?:     string
  goal90d?:        string
  /** Eventuele extra notities (bijv. stress-bronnen) */
  stressSources?:  string[]
}

const STAGE_LABEL: Record<Stage, string> = {
  regular_cycle:           'regelmatige cyclus',
  irregular_cycle:         'onregelmatige cyclus / vermoedelijk perimenopauze',
  perimenopause_diagnosed: 'perimenopauze (vastgesteld)',
  postmenopause:           'postmenopauze',
  unknown:                 'cyclus-stadium onbekend',
}

const HRT_LABEL: Record<string, string> = {
  none:           'geen HRT',
  considering:    'overweegt HRT',
  using:          'gebruikt HRT',
  stopped:        'HRT gestopt',
  prefer_not_say: 'niet opgegeven',
}

const SYSTEM = `Je bent een ervaren coach gespecialiseerd in vrouwengezondheid en de perimenopauze. Je analyseert assessment-resultaten en formuleert observaties en aanknopingspunten voor zelfregie.

Toon: warm, direct, peer-to-peer. Geen jargon, geen consultancy-taal, geen overdreven empathie. Schrijf in tweede persoon ("je").

ABSOLUTE REGELS:
- Geef GEEN medische diagnose. Gebruik woorden als "hypothese", "patroon", "kan wijzen op".
- Stel GEEN medicatie of HRT voor. Verwijs voor medische vragen naar huisarts/menopauze-arts.
- Schrijf in NEDERLANDS. Geen Engelse termen tenzij standaard (HRT, perimenopauze).
- Geen overdreven positieve toon ("super gedaan!"). Geen disclaimers in elke zin.

OUTPUT FORMAT: één JSON-object, geen extra tekst, geen markdown-fences. Schema:

{
  "observation": "1 paragraaf van 3-5 zinnen. Beschrijft het patroon dat je in de scores ziet, met expliciete koppeling tussen 2-3 dimensies. Geen advies hier.",
  "hypotheses": [
    "Hypothese 1 — feitelijk geformuleerd, 1 zin",
    "Hypothese 2 — feitelijk geformuleerd, 1 zin",
    "Hypothese 3 — feitelijk geformuleerd, 1 zin"
  ],
  "microExperiment": "Eén concreet experiment voor de eerste 30 dagen. Maximaal 2 zinnen. Specifiek (welke handeling, welke frequentie). Iets wat niet meer dan 5 min/dag kost.",
  "recommendedTracking": {
    "symptoms": ["max 8 symptoom-codes uit de meegegeven lijst die voor deze persoon meest relevant zijn"],
    "fields":   ["3-6 daily-check-in velden die we expliciet aanzetten — kies uit: sleep, mood, stress, energy, hrt_taken, alcohol, busy_day, activity, nap"]
  }
}`

export async function generateCompassInsight(input: AiInput): Promise<CompassAiOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    // Niet fataal — return een veilige fallback zodat de assessment toch werkt.
    return fallback(input)
  }

  const dimsLine = input.score.dimensions
    .map((d) => `- ${d.label}: ${d.score}/100`)
    .join('\n')

  const user = `Hier zijn de assessment-resultaten:

**Stadium:** ${STAGE_LABEL[input.stage]}
${input.ageBand ? `**Leeftijd:** ${input.ageBand}\n` : ''}${input.hrtStatus ? `**HRT-status:** ${HRT_LABEL[input.hrtStatus] ?? input.hrtStatus}\n` : ''}
**Overall score:** ${input.score.overall}/100 (${input.score.band})

**Per dimensie:**
${dimsLine}

**Symptomen die ze regelmatig ervaart:**
${input.symptomsList.length > 0 ? input.symptomsList.map((s) => `- ${s}`).join('\n') : '(geen)'}

${input.stressSources && input.stressSources.length > 0
  ? `**Stressbronnen:** ${input.stressSources.join(', ')}\n`
  : ''}
${input.topConcern ? `**Wat ze opgelost wil zien:** "${input.topConcern}"\n` : ''}
${input.goal90d    ? `**Haar 90-dagen doel:** "${input.goal90d}"\n` : ''}

Genereer de JSON volgens het schema.`

  const client = new Anthropic({ apiKey })
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), TIMEOUT_MS)

  try {
    const resp = await client.messages.create(
      {
        model:       CLAUDE_MODEL,
        max_tokens:  MAX_TOKENS,
        temperature: 0.3,
        system:      SYSTEM,
        messages:    [{ role: 'user', content: user }],
      },
      { signal: ac.signal },
    )
    const block = resp.content.find((b) => b.type === 'text')
    const raw   = block && 'text' in block ? block.text : ''
    const json  = extractJson(raw)
    let parsed: Partial<CompassAiOutput>
    try {
      parsed = JSON.parse(json)
    } catch {
      // Probeer met jsonrepair
      try { parsed = JSON.parse(jsonrepair(json)) }
      catch { return fallback(input) }
    }
    return {
      observation:         typeof parsed.observation === 'string' ? parsed.observation : fallback(input).observation,
      hypotheses:          Array.isArray(parsed.hypotheses) && parsed.hypotheses.length >= 1
                            ? parsed.hypotheses.slice(0, 3).map(String)
                            : fallback(input).hypotheses,
      microExperiment:     typeof parsed.microExperiment === 'string' ? parsed.microExperiment : fallback(input).microExperiment,
      recommendedTracking: parsed.recommendedTracking && typeof parsed.recommendedTracking === 'object'
                            ? {
                                symptoms: Array.isArray(parsed.recommendedTracking.symptoms)
                                          ? parsed.recommendedTracking.symptoms.slice(0, 8).map(String)
                                          : fallback(input).recommendedTracking.symptoms,
                                fields:   Array.isArray(parsed.recommendedTracking.fields)
                                          ? parsed.recommendedTracking.fields.slice(0, 6).map(String)
                                          : fallback(input).recommendedTracking.fields,
                              }
                            : fallback(input).recommendedTracking,
    }
  } catch {
    return fallback(input)
  } finally {
    clearTimeout(t)
  }
}

function extractJson(raw: string): string {
  const trimmed = raw.trim()
  const fenced  = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  if (fenced) return fenced[1].trim()
  const first = trimmed.indexOf('{')
  const last  = trimmed.lastIndexOf('}')
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1)
  return trimmed
}

/** Veilige fallback als Claude niet beschikbaar is of een onparseerbare response geeft. */
function fallback(input: AiInput): CompassAiOutput {
  const lowest = [...input.score.dimensions].sort((a, b) => a.score - b.score)[0]
  return {
    observation: `Je overall score is ${input.score.overall}/100 (${input.score.band}). De grootste hefboom op dit moment lijkt ${lowest.label.toLowerCase()} te zijn (${lowest.score}/100).`,
    hypotheses: [
      'Verschillende dimensies versterken elkaar — verbetering in één dimensie kan andere meetrekken.',
      'Slaap is vaak de hoeksteen: zonder herstel zakken energie en stemming mee.',
      'Tracking maakt patronen zichtbaar die met geheugen alleen niet opvallen.',
    ],
    microExperiment: 'Log 14 dagen lang elke ochtend in 60 seconden je slaap-kwaliteit, ochtendenergie en eventuele symptomen. Bekijk daarna je timeline.',
    recommendedTracking: {
      symptoms: input.symptomsList.slice(0, 6),
      fields:   ['sleep', 'mood', 'energy', 'stress'],
    },
  }
}
