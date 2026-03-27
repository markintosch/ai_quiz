// FILE: src/products/utrechtzorg/recommendations.ts
// ─── Zorgmarkt Readiness Assessment — aanbevelingen per dimensie ──────────────

import type { DimensionScore } from '@/lib/scoring/engine'
import type { Recommendation } from '@/lib/scoring/recommendations'

const RECOMMENDATION_MAP: Record<string, Omit<Recommendation, 'priority'>> = {
  personeel_veerkracht: {
    dimension: 'personeel_veerkracht' as Recommendation['dimension'],
    heading: 'Versterk personele weerbaarheid',
    body: 'Bezettingsdruk en verloop zijn de meest acute risicofactoren voor uw organisatie. Investeer in een structurele aanpak: retentiebeleid, arbeidsmarktcommunicatie en een eerlijk beeld van werkdruk per team.',
    cta: 'Bespreek een aanpak met UtrechtZorg',
  },
  informele_zorg: {
    dimension: 'informele_zorg' as Recommendation['dimension'],
    heading: 'Versterk verbindingen met informele zorg',
    body: 'Mantelzorgers, welzijnsorganisaties en wijkinitiatieven zijn onmisbare partners in de zorgketen. Een structurele samenwerkingsaanpak vergroot de veerkracht van uw zorgnetwerk.',
    cta: 'Ontdek netwerkaanpakken via UtrechtZorg',
  },
  digitale_ai_adoptie: {
    dimension: 'digitale_ai_adoptie' as Recommendation['dimension'],
    heading: 'Versnel digitale adoptie',
    body: 'Zorgtechnologie en administratieve automatisering verlichten de werkdruk en verbeteren de kwaliteit. Begin met een heldere digitale agenda en investeer in digitale vaardigheidsontwikkeling van medewerkers.',
    cta: 'Vraag een digitale quickscan aan',
  },
  ketenregie: {
    dimension: 'ketenregie' as Recommendation['dimension'],
    heading: 'Versterk ketenregie en samenwerking',
    body: 'Effectieve samenwerking met gemeenten, huisartsen en woonpartners vermindert fragmentatie in de zorg. Investeer in gestructureerde overlegvormen en heldere afspraken over regie en verantwoordelijkheden.',
    cta: 'Bespreek ketenregie met UtrechtZorg',
  },
  financiele_veerkracht: {
    dimension: 'financiele_veerkracht' as Recommendation['dimension'],
    heading: 'Versterk financiële weerbaarheid',
    body: 'Een robuuste financiële basis is voorwaardelijk voor het opvangen van arbeidsmarktdruk en het kunnen investeren in transitie. Voer scenario-analyses uit en stuur actief op efficiëntie zonder kwaliteitsverlies.',
    cta: 'Bespreek financiële strategie',
  },
  governance_veranderen: {
    dimension: 'governance_veranderen' as Recommendation['dimension'],
    heading: 'Versterk bestuurskracht en verandervermogen',
    body: 'Slagvaardige besluitvorming en het vermogen om te veranderen zijn bepalend voor uw toekomstbestendigheid. Investeer in heldere governance, een veranderaanpak en strategische omgevingsscanning.',
    cta: 'Bespreek governance en sturing',
  },
}

export function generateZorgRecommendations(
  dimensionScores: DimensionScore[],
  _flags: Record<string, unknown>
): Recommendation[] {
  const sorted = [...dimensionScores].sort((a, b) => a.normalized - b.normalized)

  const recommendations: Recommendation[] = []

  for (let i = 0; i < sorted.length; i++) {
    const rec = RECOMMENDATION_MAP[sorted[i].dimension]
    if (!rec) continue
    recommendations.push({
      ...rec,
      priority: i === 0 ? 'primary' : 'supporting',
    })
    if (recommendations.length >= 4) break
  }

  return recommendations
}
