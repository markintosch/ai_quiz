// FILE: src/products/pr_maturity/recommendations.ts
// ─── PR Volwassenheidsscan — aanbevelingen ────────────────────────────────────
//
// Aanbevelingen op basis van de zwakst scorende dimensies.
// CTA's verwijzen naar Mareille Prevo's dienstverlening.

import type { DimensionScore } from '@/lib/scoring/engine'
import type { Recommendation } from '@/lib/scoring/recommendations'

const INTRO_CTA   = 'Plan een vrijblijvend kennismakingsgesprek met Mareille →'
const STRATEGY_CTA = 'Vraag een PR-strategiesessie aan →'
const WORKSHOP_CTA = 'Boek een boodschapworkshop →'
const CRISIS_CTA  = 'Vraag een crisisreadiness-scan aan →'
const CONTENT_CTA = 'Start met een contentaudit →'
const ALIGN_CTA   = 'Ontdek hoe interne afstemming uw PR versterkt →'
const MEDIA_CTA   = 'Ontdek hoe Mareille uw mediakansen vergroot →'

const RECOMMENDATION_MAP: Record<string, Omit<Recommendation, 'priority'>> = {
  pr_strategy: {
    dimension: 'pr_strategy' as Recommendation['dimension'],
    heading: 'PR werkt pas als het verbonden is aan uw strategie',
    body: 'Zonder een heldere PR-strategie die aansluit op uw bedrijfsdoelstellingen blijven inspanningen fragmentarisch en onmeetbaar. Een strategisch PR-plan geeft richting, prioriteiten en meetbare doelstellingen — en maakt van communicatie een echte businessdriver.',
    cta: STRATEGY_CTA,
  },
  media_relations: {
    dimension: 'media_relations' as Recommendation['dimension'],
    heading: 'Mediarelaties bouw je — niet koop je',
    body: 'Duurzame mediaaandacht ontstaat niet door incidentele persberichten te sturen, maar door waardevolle relaties met journalisten te cultiveren. Met de juiste aanpak wordt uw organisatie een herkenbare en betrouwbare bron.',
    cta: MEDIA_CTA,
  },
  messaging_positioning: {
    dimension: 'messaging_positioning' as Recommendation['dimension'],
    heading: 'Uw boodschap is uw sterkste PR-instrument',
    body: 'Een onduidelijke of inconsistente boodschap verstoort elk PR-signaal. Door uw kernboodschap te verscherpen, intern te verankeren en extern consistent te communiceren, versterkt u elk communicatiemoment — van interview tot medewerkersgesprek.',
    cta: WORKSHOP_CTA,
  },
  crisis_communication: {
    dimension: 'crisis_communication' as Recommendation['dimension'],
    heading: 'Een crisis kiest haar moment niet — uw voorbereiding wel',
    body: 'Organisaties die crisiscommunicatie pas inrichten tijdens een crisis, verliezen direct de controle over het narratief. Een actueel crisisplan, een getrainde woordvoerder en heldere protocollen zijn geen luxe maar basisvereiste voor elke serieuze organisatie.',
    cta: CRISIS_CTA,
  },
  content_visibility: {
    dimension: 'content_visibility' as Recommendation['dimension'],
    heading: 'Zichtbaarheid is geen geluk, maar een strategische keuze',
    body: 'Consistente content en aanwezigheid op de juiste kanalen bepalen of uw organisatie gevonden en herkend wordt. PR en content versterken elkaar wanneer ze strategisch worden ingezet — en meetbare resultaten worden dan de norm, niet de uitzondering.',
    cta: CONTENT_CTA,
  },
  internal_alignment: {
    dimension: 'internal_alignment' as Recommendation['dimension'],
    heading: 'Geloofwaardige PR begint van binnenuit',
    body: 'Als medewerkers en directie niet op één lijn zitten over boodschap en strategie, sijpelt die inconsistentie direct naar buiten. Interne afstemming tussen directie, marketing, sales en communicatie is de fundering van effectieve en geloofwaardige externe communicatie.',
    cta: ALIGN_CTA,
  },
}

export function generatePRRecommendations(
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
    if (recommendations.length >= 3) break
  }

  // Always end with a general intro CTA if we have fewer than 3 recs
  if (recommendations.length < 2) {
    recommendations.push({
      dimension: 'pr_strategy' as Recommendation['dimension'],
      heading: 'Klaar voor de volgende stap in uw PR-volwassenheid?',
      body: 'Mareille Prevo helpt organisaties hun communicatie te professionaliseren en strategisch te benutten. Neem contact op voor een vrijblijvend gesprek over uw situatie.',
      cta: INTRO_CTA,
      priority: 'supporting',
    })
  }

  return recommendations
}
