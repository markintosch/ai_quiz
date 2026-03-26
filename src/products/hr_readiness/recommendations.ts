// FILE: src/products/hr_readiness/recommendations.ts
// ─── HR Gereedheidscan — aanbevelingen per dimensie ───────────────────────────
//
// Geeft geordende aanbevelingen op basis van dimensiescores.
// Primary: de laagst scorende dimensie.
// Supporting: de volgende 2–3 zwakste dimensies.

import type { DimensionScore } from '@/lib/scoring/engine'
import type { Recommendation } from '@/lib/scoring/recommendations'

const RECOMMENDATION_MAP: Record<string, Omit<Recommendation, 'priority'>> = {
  hr_strategie: {
    dimension: 'hr_strategie' as Recommendation['dimension'],
    heading: 'Verbind HR aan de organisatiestrategie',
    body: 'Een HR-strategie die niet aansluit op de bedrijfsdoelstellingen verliest snel relevantie. Start met het formuleren van 3 strategische HR-prioriteiten die direct bijdragen aan de businessdoelen voor de komende 12 maanden.',
    cta: 'Plan een strategiegesprek met REEF',
  },
  verandervermogen: {
    dimension: 'verandervermogen' as Recommendation['dimension'],
    heading: 'Versterk het verandervermogen van de organisatie',
    body: 'Organisaties die verandering niet goed absorberen verliezen concurrentiepositie. Investeer in een structurele veranderaanpak met heldere rollen, communicatie en leerloops.',
    cta: 'Vraag een veranderdiagnose aan',
  },
  leiderschap: {
    dimension: 'leiderschap' as Recommendation['dimension'],
    heading: 'Ontwikkel leiderschapscapaciteit op people management',
    body: 'Leidinggevenden zijn de grootste hefboom voor HR-impact. Een gericht ontwikkelprogramma voor people management levert direct rendement op medewerkersbetrokkenheid en performance.',
    cta: 'Ontdek het REEF leiderschapsprogramma',
  },
  talent: {
    dimension: 'talent' as Recommendation['dimension'],
    heading: 'Maak talentmanagement strategisch',
    body: 'Inzicht in beschikbaar talent en toekomstige behoeften is de basis voor elke HR-strategie. Investeer in competentieprofielen, talentenkaarten en een actieve ontwikkelcyclus.',
    cta: 'Bespreek een talentaanpak met REEF',
  },
  hr_data: {
    dimension: 'hr_data' as Recommendation['dimension'],
    heading: 'Benut HR-data voor betere beslissingen',
    body: "Organisaties die HR-data actief inzetten nemen betere en snellere beslissingen. Start met een betrouwbaar HR-dashboard met de 5 meest kritische KPI's voor uw organisatie.",
    cta: 'Vraag een HR-data quickscan aan',
  },
  hr_operationeel: {
    dimension: 'hr_operationeel' as Recommendation['dimension'],
    heading: 'Optimaliseer HR-processen voor schaal en kwaliteit',
    body: 'Inefficiënte HR-processen kosten tijd en vertrouwen. Breng de top 3 knelpunten in uw HR-dienstverlening in kaart en pak ze systematisch aan.',
    cta: 'Plan een HR-proces review',
  },
}

export function generateHRRecommendations(
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
