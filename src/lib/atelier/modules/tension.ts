// FILE: src/lib/atelier/modules/tension.ts
// Module 4 — Tension & synthesis.
// Combines JTBD + references + audience signals into 2–3 directional routes.
// Each direction names a tension, then a route, then explicitly cites which
// reference titles + audience claims back it. This is the "evidence chain"
// the PRD's honest-provenance principle requires.

import { parseJsonOutput } from '../llm'
import { runModule } from '../run-logger'
import {
  TensionSetSchema,
  type AudiencePicture,
  type Direction,
  type JtbdParse,
  type Reference,
} from '../schemas'

const SYSTEM_PROMPT = `Je bent Atelier — je werkpartner als het tijd is om van bewijs naar richting te gaan.

Je krijgt: (a) JTBD met aannames, (b) een handvol referenties met taste_notes, (c) doelgroepsignalen in twee sporen (street + ground).

Je taak: 2–3 directionele routes die in een werksessie besproken kunnen worden. Elk met:
- Een 'tension' — de wrijving die de route waardevol maakt (geen platte observatie maar een echte spanning).
- Een 'route' — het richtingsvoorstel in één zin.
- Een 'rationale' — waarom deze route logisch volgt uit tension + bewijs.
- 'evidence_refs' — exact welke reference-titels deze route ondersteunen (titel kopiëren).
- 'audience_refs' — exact welke audience-claims deze route ondersteunen (claim-tekst kopiëren).

Regels:
- Geen route zonder evidence_refs OF audience_refs. Als je niets hebt, vermeld de route niet.
- Routes mogen elkaar tegenspreken — twee scherpe alternatieven > drie compromissen.
- Schrijf in het Nederlands tenzij in een andere taal aangevraagd.
- Verzin geen referenties of audience-claims; gebruik exact de teksten die je krijgt.

Antwoord ALTIJD als geldige JSON volgens dit schema:
{
  "directions": [
    {
      "position": 1,
      "tension": "string",
      "route": "string",
      "rationale": "string",
      "evidence_refs": [ "exacte referentie-titel", ... ],
      "audience_refs": [ "exacte claim-tekst", ... ]
    }
  ]
}
Maximaal 3 directions, minimaal 1 als er bewijs is.`

export interface TensionInput {
  jtbd:       JtbdParse
  references: Reference[]
  audience:   AudiencePicture
}

export async function runTensionSynthesis(sessionId: string, input: TensionInput): Promise<Direction[]> {
  const refsBlock = input.references.length > 0
    ? input.references.map(r => `- "${r.title}" (relevance ${r.relevance_score.toFixed(2)})\n  ${r.taste_note}`).join('\n')
    : '(geen referenties)'

  const streetSignals = input.audience.signals.filter(s => s.track === 'street')
  const groundSignals = input.audience.signals.filter(s => s.track === 'ground')

  const audienceBlock = `
STREET SIGNAL:
${streetSignals.length > 0 ? streetSignals.map(s => `- ${s.claim} (${s.confidence})`).join('\n') : '(geen)'}

GROUND TRUTH:
${groundSignals.length > 0 ? groundSignals.map(s => `- ${s.claim} (${s.confidence})`).join('\n') : '(geen)'}
`.trim()

  const userPrompt = `JOB-TO-BE-DONE:
${input.jtbd.jtbd_dutch}

VERBORGEN AANNAMES:
${input.jtbd.hidden_assumptions.length > 0
  ? input.jtbd.hidden_assumptions.map(a => `- ${a.text} (${a.confidence})`).join('\n')
  : '(geen)'}

REFERENTIES:
${refsBlock}

AUDIENCE PICTURE:
${input.audience.audience_summary}

${audienceBlock}

Genereer 2–3 directional routes die in een werksessie besproken kunnen worden.`

  const { output } = await runModule<TensionInput, { directions: Direction[] }>({
    sessionId,
    module: 'tension',
    llm: {
      tier: 'sonnet',
      system: SYSTEM_PROMPT,
      user: userPrompt,
      jsonOnly: true,
      maxTokens: 3000,
      temperature: 0.5,  // higher temp for tension-finding — needs creative leaps
    },
    inputPayload: input,
    parse: (raw) => TensionSetSchema.parse(parseJsonOutput(raw)),
  })

  return output.directions
}
