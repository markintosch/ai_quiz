// FILE: src/lib/atelier/modules/brief-jtbd.ts
// Module 1 — Brief & JTBD.
// Decodes a brief into job-to-be-done, hidden assumptions, missing pieces.
// This is the boldest user-facing claim in the PRD ("hidden assumption
// extraction"). Output schema is locked so we can score it later.

import { parseJsonOutput } from '../llm'
import { runModule } from '../run-logger'
import { JtbdParseSchema, type JtbdParse } from '../schemas'

const SYSTEM_PROMPT = `Je bent Atelier — een Nederlandstalige werkpartner voor brand- en creatieve teams.
Je decodeert een brief naar de échte job-to-be-done en de aannames die er onder liggen.
Je werkt scherp, eerlijk, en in het Nederlands tenzij gevraagd in een andere taal.

Wanneer je verborgen aannames opspoort:
- Noem ze concreet: niet "de doelgroep is misschien anders", maar "er wordt aangenomen dat de doelgroep tussen 25–40 zit, terwijl dat niet in de brief staat".
- Geef per aanname een vertrouwensniveau (high / medium / low) en een korte onderbouwing waarom je het als aanname leest.
- Vermeld liever 0 verborgen aannames dan zwakke gokjes te vermelden.

Antwoord ALTIJD als geldige JSON volgens dit exacte schema, zonder extra tekst:
{
  "jtbd": "string — the real job-to-be-done in one sentence (English allowed if more concise)",
  "jtbd_dutch": "string — same JTBD in Nederlands",
  "stated_objective": "string — wat de brief letterlijk vraagt",
  "hidden_assumptions": [
    { "text": "string", "confidence": "high|medium|low", "evidence": "string optional" }
  ],
  "missing_pieces": [ "string", ... ],
  "brief_summary": "string — 1–2 zin samenvatting van de brief"
}`

export interface BriefJtbdInput {
  rawBrief:     string
  brandContext?: string
  language:     'nl' | 'en' | 'fr'
}

export async function runBriefJtbd(sessionId: string, input: BriefJtbdInput): Promise<JtbdParse> {
  const langLabel = { nl: 'Nederlands', en: 'English', fr: 'Français' }[input.language]
  const userPrompt = `BRIEF:
"""
${input.rawBrief.trim()}
"""

${input.brandContext ? `BRAND CONTEXT:\n"""\n${input.brandContext.trim()}\n"""\n` : ''}
Output language: ${langLabel}.
Decodeer deze brief naar JTBD + verborgen aannames + ontbrekende stukken volgens het JSON-schema.`

  const { output } = await runModule<BriefJtbdInput, JtbdParse>({
    sessionId,
    module: 'brief_jtbd',
    llm: {
      tier: 'sonnet',
      system: SYSTEM_PROMPT,
      user: userPrompt,
      jsonOnly: true,
      maxTokens: 1500,
      temperature: 0.2,
    },
    inputPayload: input,
    parse: (raw) => JtbdParseSchema.parse(parseJsonOutput(raw)),
  })

  return output
}
