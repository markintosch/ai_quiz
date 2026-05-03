// FILE: src/lib/atelier/modules/output.ts
// Module 5 — Output packaging.
// Produces a session-ready one-pager (markdown). Keeps every claim attached
// to its provenance through the provenance_map field — that's the
// honest-provenance principle in action at the output layer.

import { parseJsonOutput } from '../llm'
import { runModule } from '../run-logger'
import {
  OnePagerSchema,
  type OnePager,
  type SessionBundle,
} from '../schemas'

const SYSTEM_PROMPT = `Je bent Atelier — een werkpartner die het denkwerk samenvat in één bruikbaar pagina.

Je maakt een one-pager voor een werksessie. Niet een mooi rapport — wel een document waar mensen morgen mee aan tafel gaan.

Regels:
- Markdown body, ready to paste in een doc.
- Structuur:
  1. # JOB-TO-BE-DONE — één regel
  2. ## Verborgen aannames (alleen als er zijn, kort)
  3. ## Doelgroep in beeld (een paragraaf met de belangrijkste signalen, gesplitst street vs ground)
  4. ## Referenties (3–5 stuks met taste_note, source_label achter elk)
  5. ## Directional routes (de 2–3 directions, elke één heading, dan tension + route + rationale)
  6. ## Wat is open (uit missing_pieces)
- Bij elke claim die uit een specifieke bron komt: voeg "[bron: <source_label>]" inline toe (NIET als footnote).
- Schrijf in het Nederlands tenzij in een andere taal aangevraagd.
- Geen marketingproza. Werktoon: scherp, eerlijk, kort.

Geef daarnaast een 'provenance_map' object — een lookup van claim-tekst → source_label. Geen volledige inventarisatie nodig; alleen voor claims die in de body staan.

Antwoord ALTIJD als geldige JSON volgens dit schema:
{
  "format": "one_pager",
  "language": "nl|en|fr",
  "body_md": "string — de hele one-pager als markdown",
  "provenance_map": { "claim-tekst": "source_label", ... }
}`

export async function runOutputPackaging(
  sessionId: string,
  bundle: SessionBundle,
): Promise<OnePager> {
  const userPrompt = `BRIEF SAMENVATTING:
${bundle.jtbd.brief_summary}

JOB-TO-BE-DONE:
${bundle.jtbd.jtbd_dutch}

VERBORGEN AANNAMES:
${bundle.jtbd.hidden_assumptions.length > 0
  ? bundle.jtbd.hidden_assumptions.map(a => `- ${a.text} (${a.confidence})${a.evidence ? ` — ${a.evidence}` : ''}`).join('\n')
  : '(geen)'}

ONTBREKENDE STUKKEN:
${bundle.jtbd.missing_pieces.length > 0
  ? bundle.jtbd.missing_pieces.map(p => `- ${p}`).join('\n')
  : '(geen)'}

DOELGROEP — SAMENVATTING:
${bundle.audience.audience_summary}

DOELGROEP — STREET SIGNAL:
${bundle.audience.signals.filter(s => s.track === 'street').map(s => `- ${s.claim} [${s.confidence}, bron: ${s.source_label}]`).join('\n') || '(geen)'}

DOELGROEP — GROUND TRUTH:
${bundle.audience.signals.filter(s => s.track === 'ground').map(s => `- ${s.claim} [${s.confidence}, bron: ${s.source_label}]`).join('\n') || '(geen)'}

REFERENTIES:
${bundle.references.map(r => `- "${r.title}" — ${r.taste_note}\n  bron: ${r.source_label}`).join('\n')}

DIRECTIONAL ROUTES:
${bundle.directions.map(d => `${d.position}. TENSION: ${d.tension}\n   ROUTE: ${d.route}\n   RATIONALE: ${d.rationale}`).join('\n\n')}

Output language: ${bundle.brief.language}.
Maak hier de session-one-pager van.`

  const { output } = await runModule<SessionBundle, OnePager>({
    sessionId,
    module: 'output',
    llm: {
      tier: 'haiku',
      system: SYSTEM_PROMPT,
      user: userPrompt,
      jsonOnly: true,
      maxTokens: 3000,
      temperature: 0.4,
    },
    inputPayload: bundle,
    parse: (raw) => OnePagerSchema.parse(parseJsonOutput(raw)),
  })

  return output
}
