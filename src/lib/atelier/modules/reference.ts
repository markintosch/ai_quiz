// FILE: src/lib/atelier/modules/reference.ts
// Module 2 — Reference & retrieval.
// Until real archive ingestion lands, this combines:
//   1. Crude keyword overlap against the seed corpus, to surface candidates
//   2. A Claude pass that picks 3–5, scores relevance, writes a taste_note
// The Claude pass also marks each pick's `source_kind` so provenance is honest.

import { parseJsonOutput } from '../llm'
import { runModule } from '../run-logger'
import { ReferenceSetSchema, type Reference, type JtbdParse } from '../schemas'
import { SEED_REFERENCES, type SeedReference } from '../seed-corpus'

const SYSTEM_PROMPT = `Je bent Atelier — een werkpartner die referenties kiest met smaak.
Je krijgt: (a) een job-to-be-done, (b) een lijst kandidaat-referenties uit het Atelier-archief.
Je taak: kies 3–5 die écht relevant zijn voor de JTBD, scoor relevantie tussen 0 en 1, en schrijf per pick een korte 'taste_note' die uitlegt waarom dit het oog waard is — niet wat het is, maar wat eraan klopt.

Regels:
- Provenance is heilig: gebruik alleen het source_label dat de kandidaat zelf meebrengt. Verzin niets.
- Als geen kandidaat sterk genoeg is, kies er minder dan 3. Beter twee scherpe dan vier slappe.
- Je mag een referentie afvallen die in het archief lijkt te passen maar in context niet werkt.
- source_kind moet 'archive' zijn voor archief-referenties; gebruik 'inferred' alleen als je een referentie BUITEN het archief zou aanraden — dan vermeld je dat eerlijk.

Antwoord ALTIJD als geldige JSON volgens dit schema:
{
  "references": [
    {
      "title": "string",
      "description": "string",
      "source_kind": "archive|live_source|inferred",
      "source_label": "string (overgenomen uit kandidaat tenzij inferred)",
      "source_url": null | "string",
      "relevance_score": 0.0–1.0,
      "taste_note": "string"
    }
  ]
}`

/** Crude keyword retrieval over the seed corpus. */
function shortlistByOverlap(jtbd: JtbdParse, max = 8): SeedReference[] {
  const text = [jtbd.jtbd, jtbd.jtbd_dutch, jtbd.brief_summary, ...jtbd.missing_pieces].join(' ').toLowerCase()
  const scored = SEED_REFERENCES.map(r => {
    const score = r.tags.reduce((acc, tag) => acc + (text.includes(tag.toLowerCase()) ? 1 : 0), 0)
      + (text.includes(r.title.toLowerCase()) ? 2 : 0)
    return { ref: r, score }
  })
  scored.sort((a, b) => b.score - a.score)
  // Always include some candidates even on zero-overlap, so the model has
  // raw material — taste filtering happens at the LLM step.
  const top = scored.filter(s => s.score > 0).slice(0, max)
  if (top.length < max) {
    const fillers = scored.filter(s => s.score === 0).slice(0, max - top.length)
    return [...top, ...fillers].map(s => s.ref)
  }
  return top.map(s => s.ref)
}

export async function runReferenceRetrieval(sessionId: string, jtbd: JtbdParse): Promise<Reference[]> {
  const candidates = shortlistByOverlap(jtbd)

  const userPrompt = `JOB-TO-BE-DONE:
${jtbd.jtbd_dutch}

BRIEF SAMENVATTING:
${jtbd.brief_summary}

KANDIDAAT-REFERENTIES (uit Atelier-archief):
${candidates.map((c, i) => `${i + 1}. ${c.title}\n   description: ${c.description}\n   source_label: ${c.source_label}\n   source_url: ${c.source_url ?? 'null'}\n   tags: ${c.tags.join(', ')}`).join('\n\n')}

Kies 3–5 referenties die écht relevant zijn. Scoor relevantie en schrijf taste_note per pick.`

  const { output } = await runModule<{ jtbd: JtbdParse; candidates: SeedReference[] }, { references: Reference[] }>({
    sessionId,
    module: 'reference',
    llm: {
      tier: 'haiku',
      system: SYSTEM_PROMPT,
      user: userPrompt,
      jsonOnly: true,
      maxTokens: 1500,
      temperature: 0.4,
    },
    inputPayload: { jtbd, candidates },
    parse: (raw) => ReferenceSetSchema.parse(parseJsonOutput(raw)),
  })

  return output.references
}
