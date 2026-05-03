// FILE: src/lib/atelier/modules/audience.ts
// Module 3 — Audience evidence.
// Builds a compact audience picture using the two-track signal model:
//   - Street Signal  → live, observed, behavioural
//   - Ground Truth   → research, surveys, segmentation, hard data
// The two MUST stay separated — discriminator is a per-row 'track' field.
//
// Until real listening feeds (Street) and real research datasets (Ground)
// are connected, both tracks are seeded by the model itself with provenance
// flagged as 'inferred'. Once feeds connect, only the source layer changes.

import { parseJsonOutput } from '../llm'
import { runModule } from '../run-logger'
import { AudiencePictureSchema, type AudiencePicture, type JtbdParse } from '../schemas'

const SYSTEM_PROMPT = `Je bent Atelier — een werkpartner die de doelgroep scherp en eerlijk in beeld brengt.

Je werkt met twee aparte sporen die je NOOIT vermengt:

1. STREET SIGNAL — wat er live gebeurt: gedrag, taal, gebruiken, observeerbare patronen.
2. GROUND TRUTH — wat onderzoek, surveys, segmentaties of harde data zeggen.

Per claim:
- Geef een vertrouwensniveau: strong (gedragen door bron), medium (plausibel), weak (vermoeden), inferred (puur model-redeneren zonder externe bron).
- Zonder externe bron is je default "inferred" — maak claims niet sterker dan ze zijn.
- Geef per claim een source_label dat eerlijk weergeeft waar je het op baseert. Als het "inferred" is, schrijf "AI-redeneren — geen externe bron".
- Vermeld minstens 2 STREET signals en 2 GROUND signals als je kunt; vermeld minder als je niets sterks hebt.

Identificeer ook 'weak_claims': beweringen uit de brief over de doelgroep die zonder bewijs in de lucht hangen.

Antwoord ALTIJD als geldige JSON volgens dit schema:
{
  "audience_summary": "1–2 zin samenvatting van de doelgroep",
  "signals": [
    {
      "track": "street|ground",
      "claim": "string",
      "evidence": "string optional",
      "source_label": "string",
      "source_url": null | "string",
      "confidence": "strong|medium|weak|inferred",
      "contradicts": []
    }
  ],
  "weak_claims": [ "string", ... ]
}`

export async function runAudienceEvidence(
  sessionId: string,
  jtbd: JtbdParse,
  brandContext?: string,
): Promise<AudiencePicture> {
  const userPrompt = `JOB-TO-BE-DONE:
${jtbd.jtbd_dutch}

BRIEF SAMENVATTING:
${jtbd.brief_summary}

ZWAKKE OF ONUITGESPROKEN AANNAMES UIT DE BRIEF:
${jtbd.hidden_assumptions.length > 0
  ? jtbd.hidden_assumptions.map(a => `- ${a.text} (${a.confidence})`).join('\n')
  : '(geen genoteerd)'}
${brandContext ? `\nBRAND CONTEXT:\n${brandContext}\n` : ''}
Bouw een audience picture met twee sporen: Street Signal en Ground Truth.
Forceer geen claims als je geen bron hebt — markeer dan 'inferred' en wees eerlijk.`

  const { output } = await runModule<{ jtbd: JtbdParse; brandContext?: string }, AudiencePicture>({
    sessionId,
    module: 'audience',
    llm: {
      tier: 'sonnet',
      system: SYSTEM_PROMPT,
      user: userPrompt,
      jsonOnly: true,
      maxTokens: 3000,
      temperature: 0.3,
    },
    inputPayload: { jtbd, brandContext },
    parse: (raw) => AudiencePictureSchema.parse(parseJsonOutput(raw)),
  })

  return output
}
