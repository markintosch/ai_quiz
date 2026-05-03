// FILE: src/lib/atelier/modules/angles.ts
// Module — drie aanvullende analytische lenzen die parallel naast tension/synthesis
// draaien. Elk geeft een andere invalshoek op dezelfde brief, zodat de
// werksessie niet aan één perspectief vastzit:
//
//   1. brand_archetype — waar zit het merk archetypisch, waar zou het kunnen zitten
//   2. competitor      — wat doen vergelijkbare merken, waar is whitespace
//   3. cultural_moment — welk cultureel moment raakt deze brief
//
// Allemaal `inferred` qua bron tenzij live_signal-data is meegegeven.

import { parseJsonOutput } from '../llm'
import { runModule } from '../run-logger'
import {
  AngleSchema,
  type Angle,
  type JtbdParse,
} from '../schemas'

type Lens = 'brand_archetype' | 'competitor' | 'cultural_moment'

const SYSTEMS: Record<Lens, string> = {
  brand_archetype: `Je bent Atelier — je leest de brief door een brand-archetype lens.

Plaats het merk binnen het archetype-veld (Hero, Outlaw, Caregiver, Lover, Magician, Sage, Explorer, Creator, Innocent, Jester, Ruler, Everyman) of een hybride. Beschrijf:
- Waar het merk waarschijnlijk nu zit
- Waar het in deze brief naartoe zou kunnen bewegen
- Wat dat betekent voor stem, beeld en gedrag

Schrijf in Nederlands. Geef body_md als markdown (3-4 alinea's), evidence als citaten / observaties die je gebruikt.

Antwoord ALTIJD als geldige JSON:
{
  "lens": "brand_archetype",
  "headline": "string — één zin",
  "body_md": "string markdown",
  "evidence": [{"claim": "string", "source_label": "string", "source_url": null}]
}`,

  competitor: `Je bent Atelier — je leest de brief door een concurrentie / whitespace lens.

Identificeer 3-5 vergelijkbare merken in dezelfde of aanliggende categorie. Beschrijf:
- Wat zij claimen / hoe ze opereren in dit gebied
- Welke whitespace overblijft die de brief kan claimen
- Welke positie risk-vol is omdat een concurrent 'm al bezet
- Welke positie nog verdedigbaar is

Schrijf in Nederlands. Body_md als markdown. Evidence: per claim kort de concurrent + wat ze doen.

Antwoord ALTIJD als geldige JSON:
{
  "lens": "competitor",
  "headline": "string — één zin",
  "body_md": "string markdown",
  "evidence": [{"claim": "string", "source_label": "naam concurrent", "source_url": null}]
}`,

  cultural_moment: `Je bent Atelier — je leest de brief door een cultureel-moment lens.

Welke breder culturele beweging, gesprek, of generatieve tendens raakt deze brief? Geen abstracte trend-praat — concreet:
- Welk cultureel moment loopt nu?
- Hoe relateert de brief eraan?
- Wat is het risico van het moment missen of fout aanpakken?
- Welke kans biedt het moment voor het merk?

Specifiek voor Nederland / NL-speaking als brief in NL is. Schrijf in Nederlands.

Antwoord ALTIJD als geldige JSON:
{
  "lens": "cultural_moment",
  "headline": "string — één zin",
  "body_md": "string markdown",
  "evidence": [{"claim": "string", "source_label": "string (bv. 'NRC opinie 2025-Q1' of 'Algemeen waarneembaar')", "source_url": null}]
}`,
}

async function runOneAngle(sessionId: string, lens: Lens, jtbd: JtbdParse, brandContext?: string): Promise<Angle> {
  const moduleId = lens // matches CHECK constraint
  const userPrompt = `JOB-TO-BE-DONE:
${jtbd.jtbd_dutch}

BRIEF SAMENVATTING:
${jtbd.brief_summary}
${brandContext ? `\nBRAND CONTEXT:\n${brandContext}\n` : ''}
Lever de ${lens.replace('_', ' ')}-analyse.`

  const { output } = await runModule<{ lens: Lens; jtbd: JtbdParse; brandContext?: string }, Angle>({
    sessionId,
    module: moduleId,
    llm: {
      tier: 'sonnet',
      system: SYSTEMS[lens],
      user: userPrompt,
      jsonOnly: true,
      maxTokens: 1500,
      temperature: 0.5,
    },
    inputPayload: { lens, jtbd, brandContext },
    parse: (raw) => AngleSchema.parse(parseJsonOutput(raw)),
  })

  return output
}

export async function runAllAngles(sessionId: string, jtbd: JtbdParse, brandContext?: string): Promise<Angle[]> {
  const lenses: Lens[] = ['brand_archetype', 'competitor', 'cultural_moment']
  // Each angle is an independent Claude call — run them in parallel.
  const results = await Promise.allSettled(
    lenses.map(l => runOneAngle(sessionId, l, jtbd, brandContext))
  )
  // Collect successes; failures are already logged in atelier_module_runs by runModule.
  return results
    .filter((r): r is PromiseFulfilledResult<Angle> => r.status === 'fulfilled')
    .map(r => r.value)
}
