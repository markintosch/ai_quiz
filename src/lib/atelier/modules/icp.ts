// FILE: src/lib/atelier/modules/icp.ts
// Module — Ideal Customer Profile (ICP).
// Apart van Module 3 (audience picture, current observed): ICP is wie de
// brief eigenlijk wíl raken. Industry, rol, bedrijfsgrootte, triggers, jobs,
// pains, buying committee. Komt typisch in zicht na M1 (JTBD).

import { parseJsonOutput } from '../llm'
import { runModule } from '../run-logger'
import { IcpProfileSchema, type IcpProfile, type JtbdParse } from '../schemas'

const SYSTEM_PROMPT = `Je bent Atelier — werkpartner voor brand- en creatieve teams. Je bouwt het Ideal Customer Profile (ICP) voor de brief.

ICP is anders dan een audience picture:
- Audience picture beschrijft de huidige observeerbare doelgroep.
- ICP beschrijft wie de brief idealiter wíl raken — het scherpste segment waar het verhaal het hardst landt.

Geef per ICP-veld:
- business_type: b2b | b2c | b2b2c | b2g (overheid / publieke dienst). Kies wat het BEST past — geen "anders".
- industry: branche, kort.
- role: primaire DMU-rol of beslisser.
- company_size: bedrijfsgrootte / segment indicatief.
- triggers: 2–4 redenen waarom ze NU openstaan voor dit verhaal / deze propositie.
- jobs: 2–4 jobs-to-be-done die deze ICP zelf zou benoemen.
- pains: 2–4 pijnen die ze in eigen woorden zouden uitspreken.
- buying_committee: 2–5 leden van de bredere DMU met hun invloed (decision_maker | champion | evaluator | gatekeeper | end_user).
- rationale: 1–2 zin waarom deze ICP logisch volgt uit de brief.

Regels:
- Wees concreet en herkenbaar — geen marketingtaal.
- Als de brief geen ICP-info geeft, expliciet je redenering tonen via 'rationale'.
- Schrijf in Nederlands tenzij in een andere taal aangevraagd.

Antwoord ALTIJD als geldige JSON volgens dit schema:
{
  "business_type": "b2b|b2c|b2b2c|b2g",
  "industry": "string",
  "role": "string",
  "company_size": "string",
  "triggers": ["string", ...],
  "jobs": ["string", ...],
  "pains": ["string", ...],
  "buying_committee": [
    { "role": "string", "influence": "decision_maker|champion|evaluator|gatekeeper|end_user", "motivation": "string optional" }
  ],
  "rationale": "string"
}`

export async function runIcpProfile(
  sessionId: string,
  jtbd: JtbdParse,
  brandContext?: string,
): Promise<IcpProfile> {
  const userPrompt = `JOB-TO-BE-DONE:
${jtbd.jtbd_dutch}

BRIEF SAMENVATTING:
${jtbd.brief_summary}

VERBORGEN AANNAMES:
${jtbd.hidden_assumptions.length > 0
  ? jtbd.hidden_assumptions.map(a => `- ${a.text} (${a.confidence})`).join('\n')
  : '(geen)'}
${brandContext ? `\nBRAND CONTEXT:\n${brandContext}\n` : ''}
Bouw het Ideal Customer Profile voor deze brief.`

  const { output } = await runModule<{ jtbd: JtbdParse; brandContext?: string }, IcpProfile>({
    sessionId,
    module: 'icp',
    llm: {
      tier: 'sonnet',
      system: SYSTEM_PROMPT,
      user: userPrompt,
      jsonOnly: true,
      maxTokens: 1800,
      temperature: 0.3,
    },
    inputPayload: { jtbd, brandContext },
    parse: (raw) => IcpProfileSchema.parse(parseJsonOutput(raw)),
  })

  return output
}
