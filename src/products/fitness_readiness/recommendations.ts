// FILE: src/products/fitness_readiness/recommendations.ts
// ─── Fitness Readiness Scan — aanbevelingen + HYROX-routing ──────────────────
//
// Routing-logica:
//   hyrox_ready flag (zie config.ts) = mental_drive >= 60 EN cardio_base >= 50
//   → HYROX-specifieke CTA op primaire aanbeveling
//
// Overige aanbevelingen: zwakste dimensies eerst.

import type { DimensionScore } from '@/lib/scoring/engine'
import type { Recommendation } from '@/lib/scoring/recommendations'

const HYROX_CTA  = 'Plan een gratis HYROX-kennismaking bij Healthclub45 →'
const INTAKE_CTA = 'Plan jouw gratis intake bij Healthclub45 →'
const PT_CTA     = 'Boek een sessie met een personal trainer bij Healthclub45 →'

const RECOMMENDATION_MAP: Record<string, (hyrox: boolean) => Omit<Recommendation, 'priority'>> = {
  cardio_base: (hyrox) => ({
    dimension: 'cardio_base' as Recommendation['dimension'],
    heading: hyrox ? 'Werk aan je cardio-basis voor HYROX' : 'Bouw je conditie stap voor stap op',
    body: hyrox
      ? 'HYROX vraagt een sterke aerobe basis. Ski-erg, RowErg en de looprondes vereisen dat je langer op tempo kunt blijven. Een gericht conditieprogramma maakt het verschil tussen finishen en écht presteren.'
      : 'Een betere conditie maakt elke andere training makkelijker. Met een persoonlijk plan bij Healthclub45 bouw je stap voor stap op — op jouw tempo, met zichtbare progressie.',
    cta: hyrox ? HYROX_CTA : INTAKE_CTA,
  }),
  strength_power: (hyrox) => ({
    dimension: 'strength_power' as Recommendation['dimension'],
    heading: hyrox ? 'Kracht is cruciaal voor de HYROX-stations' : 'Meer kracht, meer energie in alles wat je doet',
    body: hyrox
      ? 'Sled Push, Sled Pull en Farmers Carry vereisen functionele kracht. Als kracht jouw zwakste punt is, laat je tijd liggen op de grond. Een PT bij Healthclub45 bouwt specifiek aan jouw HYROX-kracht.'
      : 'Krachtraining is de basis van een fit lichaam — betere stofwisseling, minder blessures en meer zelfvertrouwen. Bij Healthclub45 helpen we je de juiste oefeningen correct uitvoeren.',
    cta: hyrox ? PT_CTA : INTAKE_CTA,
  }),
  mental_drive: (_hyrox) => ({
    dimension: 'mental_drive' as Recommendation['dimension'],
    heading: 'Geef je motivatie een concreet doel',
    body: 'Zonder een helder doel is het moeilijk consistent te blijven. Of dat nu een HYROX-race, een gewichtsdoel of gewoon meer energie is — een persoonlijk trainingsgesprek helpt je dat doel scherp te stellen en er naartoe te werken.',
    cta: INTAKE_CTA,
  }),
  mobility_recovery: (_hyrox) => ({
    dimension: 'mobility_recovery' as Recommendation['dimension'],
    heading: 'Mobiliteit en herstel — de vergeten sleutel tot progressie',
    body: 'Blessures en stijfheid zijn de meest onderschatte remmers van fitnessgroei. Bewust werken aan mobiliteit en herstel zorgt ervoor dat je consistent kunt blijven trainen. Onze trainers bij Healthclub45 helpen je daar een plan voor maken.',
    cta: PT_CTA,
  }),
  nutrition_habits: (_hyrox) => ({
    dimension: 'nutrition_habits' as Recommendation['dimension'],
    heading: 'Voeding is je brandstof — maak er bewust gebruik van',
    body: 'Training zonder de juiste voeding is rijden met een lege tank. Kleine aanpassingen in eetpatroon en timing rondom je training kunnen een groot verschil maken in energie, herstel en resultaat.',
    cta: INTAKE_CTA,
  }),
  training_consistency: (_hyrox) => ({
    dimension: 'training_consistency' as Recommendation['dimension'],
    heading: 'Consistentie is het enige dat écht werkt',
    body: 'Één goede trainingsweek verandert niets. Tien weken achter elkaar wel. Of je nu beginner bent of terugkomt na een pauze — bij Healthclub45 zorgen we voor structuur en begeleiding die je op koers houdt.',
    cta: INTAKE_CTA,
  }),
}

export function generateFitnessRecommendations(
  dimensionScores: DimensionScore[],
  flags: Record<string, unknown>
): Recommendation[] {
  const hyroxReady = Boolean(flags['hyrox_ready'])
  const sorted = [...dimensionScores].sort((a, b) => a.normalized - b.normalized)

  const recommendations: Recommendation[] = []

  for (let i = 0; i < sorted.length; i++) {
    const builder = RECOMMENDATION_MAP[sorted[i].dimension]
    if (!builder) continue
    const rec = builder(hyroxReady)
    recommendations.push({
      ...rec,
      priority: i === 0 ? 'primary' : 'supporting',
    })
    if (recommendations.length >= 4) break
  }

  return recommendations
}
