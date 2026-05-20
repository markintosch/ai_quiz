/**
 * Peri-Compass — scoring engine (taal-onafhankelijke berekening,
 * meertalige labels en band-copy via dimensionLabel / BAND_COPY).
 */

import {
  RAW_QUESTIONS,
  type LocalizedQuestion,
  type Dimension,
  type Stage,
} from './questions'
import type { Lang } from './i18n'

export type ResponseValue =
  | { kind: 'single'; value: string }
  | { kind: 'multi';  value: string[] }
  | { kind: 'likert'; value: number }
  | { kind: 'number'; value: number }
  | { kind: 'text';   value: string }

export type ResponseMap = Record<string, ResponseValue | undefined>

export type Band = 'thriving' | 'navigating' | 'struggling' | 'depleted'

export interface DimensionScore {
  dimension: Dimension
  label:     string
  score:     number          // 0-100
  weight:    number
}

export interface CompassScore {
  overall:    number
  band:       Band
  dimensions: DimensionScore[]
  byDimension: Record<Dimension, number>
}

const DIM_LABELS: Record<Lang, Record<Dimension, string>> = {
  nl: {
    meta: 'Context', symptom_burden: 'Symptoombelasting', sleep_recovery: 'Slaap & herstel',
    energy_capacity: 'Energie & capaciteit', stress_context: 'Stress & context',
    lifestyle: 'Leefstijl', self_awareness: 'Zelfkennis & motivatie',
  },
  en: {
    meta: 'Context', symptom_burden: 'Symptom burden', sleep_recovery: 'Sleep & recovery',
    energy_capacity: 'Energy & capacity', stress_context: 'Stress & context',
    lifestyle: 'Lifestyle', self_awareness: 'Self-knowledge & motivation',
  },
  fr: {
    meta: 'Contexte', symptom_burden: 'Charge symptomatique', sleep_recovery: 'Sommeil & récupération',
    energy_capacity: 'Énergie & capacité', stress_context: 'Stress & contexte',
    lifestyle: 'Mode de vie', self_awareness: 'Connaissance de soi & motivation',
  },
  de: {
    meta: 'Kontext', symptom_burden: 'Symptombelastung', sleep_recovery: 'Schlaf & Erholung',
    energy_capacity: 'Energie & Kapazität', stress_context: 'Stress & Kontext',
    lifestyle: 'Lebensstil', self_awareness: 'Selbstkenntnis & Motivation',
  },
}

export function dimensionLabel(d: Dimension, lang: Lang): string {
  return DIM_LABELS[lang]?.[d] ?? DIM_LABELS.nl[d]
}

const WEIGHTS: Record<Exclude<Dimension, 'meta'>, number> = {
  symptom_burden:   25,
  sleep_recovery:   20,
  energy_capacity:  15,
  stress_context:   15,
  lifestyle:        15,
  self_awareness:   10,
}

function likertScore(value: number, scale: number, best: number): number {
  if (best === scale) return Math.round(((value - 1) / (scale - 1)) * 100)
  return Math.round(((scale - value) / (scale - 1)) * 100)
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
}

function questionScore(q: LocalizedQuestion, r: ResponseValue | undefined): number | null {
  if (q.contextOnly || q.dimension === 'meta') return null
  if (!r) return null
  switch (q.kind) {
    case 'single': {
      if (r.kind !== 'single') return null
      const opt = q.options?.find((o) => o.value === r.value)
      return typeof opt?.score === 'number' ? opt.score : null
    }
    case 'multi': {
      if (r.kind !== 'multi') return null
      if (q.code.startsWith('symptoms.')) {
        const total = q.options?.length ?? 0
        if (total === 0) return null
        return Math.round(100 - (r.value.length / total) * 100)
      }
      const scored = r.value
        .map((v) => q.options?.find((o) => o.value === v)?.score)
        .filter((s): s is number => typeof s === 'number')
      if (scored.length === 0) return null
      switch (q.multiAggregation ?? 'avg') {
        case 'sum': return Math.min(100, scored.reduce((a, b) => a + b, 0))
        case 'max': return Math.max(...scored)
        case 'avg':
        default:    return avg(scored)
      }
    }
    case 'likert': {
      if (r.kind !== 'likert') return null
      const scale = q.scale ?? 5
      const best  = q.best  ?? scale
      return likertScore(r.value, scale, best)
    }
    case 'number':
    case 'text':
    default:
      return null
  }
}

/** Voor scoring gebruiken we de NL-localized variant — opties hebben dezelfde scores ongeacht taal. */
function scoringQuestions(): LocalizedQuestion[] {
  return RAW_QUESTIONS.map((q) => ({
    code:             q.code,
    dimension:        q.dimension,
    kind:             q.kind,
    prompt:           q.prompts.nl,
    help:             q.helps?.nl,
    scale:            q.scale,
    best:             q.best,
    multiAggregation: q.multiAggregation,
    showIfStage:      q.showIfStage,
    contextOnly:      q.contextOnly,
    required:         q.required,
    options:          q.options?.map((o) => ({ value: o.value, label: o.labels.nl, score: o.score })),
  }))
}

export function scoreResponses(responses: ResponseMap, _stage: Stage, lang: Lang = 'nl'): CompassScore {
  const byDim: Partial<Record<Dimension, number[]>> = {}
  for (const q of scoringQuestions()) {
    const r = responses[q.code]
    const s = questionScore(q, r)
    if (s === null) continue
    if (!byDim[q.dimension]) byDim[q.dimension] = []
    byDim[q.dimension]!.push(s)
  }

  const dims: DimensionScore[] = (Object.keys(WEIGHTS) as Array<keyof typeof WEIGHTS>).map((d) => ({
    dimension: d,
    label:     dimensionLabel(d, lang),
    score:     avg(byDim[d] ?? []),
    weight:    WEIGHTS[d],
  }))

  const totalWeight = dims.reduce((a, b) => a + b.weight, 0)
  const overall = Math.round(
    dims.reduce((acc, d) => acc + d.score * d.weight, 0) / totalWeight,
  )

  const symptomScore = dims.find((d) => d.dimension === 'symptom_burden')?.score ?? overall
  const band: Band =
    overall >= 75 && symptomScore >= 65 ? 'thriving'
    : overall >= 55                      ? 'navigating'
    : overall >= 35                      ? 'struggling'
    :                                      'depleted'

  const byDimension: Record<Dimension, number> = {
    meta: 0,
    symptom_burden:  dims.find((d) => d.dimension === 'symptom_burden')?.score  ?? 0,
    sleep_recovery:  dims.find((d) => d.dimension === 'sleep_recovery')?.score  ?? 0,
    energy_capacity: dims.find((d) => d.dimension === 'energy_capacity')?.score ?? 0,
    stress_context:  dims.find((d) => d.dimension === 'stress_context')?.score  ?? 0,
    lifestyle:       dims.find((d) => d.dimension === 'lifestyle')?.score       ?? 0,
    self_awareness:  dims.find((d) => d.dimension === 'self_awareness')?.score  ?? 0,
  }

  return { overall, band, dimensions: dims, byDimension }
}

// ── Band copy per locale ────────────────────────────────────────────────────
// Band-codes blijven hetzelfde (thriving/navigating/struggling/depleted) voor
// backwards-compat in de DB, maar de DISPLAY-LABELS zijn herzien naar
// menselijker tone (review Mark): Grounded / Navigating / Searching / Overloaded.
export const BAND_COPY: Record<Lang, Record<Band, { title: string; sub: string }>> = {
  nl: {
    thriving:   { title: 'Grounded',   sub: 'Je voelt waar je staat. De patronen zijn er, en je hebt nu een goede uitgangspositie om ze te bewaken. Kleine signalen worden duidelijker als je ze rustig blijft volgen.' },
    navigating: { title: 'Navigating', sub: 'Je lichaam geeft duidelijke signalen, maar de patronen zijn nog niet voorspelbaar. Je zit in een fase waarin kleine dagelijkse observaties veel kunnen helpen.' },
    struggling: { title: 'Searching',  sub: 'Veel speelt tegelijk. Het is normaal om nu het overzicht kwijt te zijn. Met een paar weken zachte tracking komt er rust in wat er echt speelt.' },
    depleted:   { title: 'Overloaded', sub: 'Je systeem staat onder hoge druk. Tracken kan helpen om patronen te zien, maar overweeg ook professionele ondersteuning (huisarts, menopauze-arts, coach) — je hoeft dit niet alleen te doen.' },
  },
  en: {
    thriving:   { title: 'Grounded',   sub: 'You feel where you stand. The patterns are there, and you have a good starting position to maintain. Small signals get clearer when you keep watching them gently.' },
    navigating: { title: 'Navigating', sub: 'Your body sends clear signals, but the patterns aren\'t predictable yet. You\'re in a phase where small daily observations can help a lot.' },
    struggling: { title: 'Searching',  sub: 'A lot is happening at once. It\'s normal to lose the overview right now. A few weeks of gentle tracking brings clarity to what\'s really going on.' },
    depleted:   { title: 'Overloaded', sub: 'Your system is under high pressure. Tracking can help reveal patterns, but also consider professional support (GP, menopause specialist, coach) — you don\'t have to do this alone.' },
  },
  fr: {
    thriving:   { title: 'Grounded',   sub: 'Vous sentez où vous en êtes. Les schémas sont là, et vous avez une bonne base à préserver. Les petits signaux se clarifient si vous continuez à les observer doucement.' },
    navigating: { title: 'Navigating', sub: 'Votre corps envoie des signaux clairs, mais les schémas ne sont pas encore prévisibles. Vous êtes dans une phase où de petites observations quotidiennes peuvent beaucoup aider.' },
    struggling: { title: 'Searching',  sub: 'Beaucoup de choses se passent en même temps. Il est normal de perdre la vue d\'ensemble en ce moment. Quelques semaines de suivi doux clarifient ce qui se joue vraiment.' },
    depleted:   { title: 'Overloaded', sub: 'Votre système est sous forte pression. Le suivi peut révéler des schémas, mais envisagez aussi un soutien professionnel (médecin, spécialiste de la ménopause, coach) — vous n\'êtes pas seule.' },
  },
  de: {
    thriving:   { title: 'Grounded',   sub: 'Du spürst, wo du stehst. Die Muster sind da, und du hast eine gute Ausgangslage zum Bewahren. Kleine Signale werden klarer, wenn du sie sanft weiter beobachtest.' },
    navigating: { title: 'Navigating', sub: 'Dein Körper sendet klare Signale, aber die Muster sind noch nicht vorhersehbar. Du bist in einer Phase, in der kleine tägliche Beobachtungen viel helfen können.' },
    struggling: { title: 'Searching',  sub: 'Vieles passiert gleichzeitig. Es ist normal, gerade den Überblick zu verlieren. Ein paar Wochen sanftes Tracking bringen Ruhe in das, was wirklich spielt.' },
    depleted:   { title: 'Overloaded', sub: 'Dein System steht unter hohem Druck. Tracking kann Muster sichtbar machen, aber erwäge auch professionelle Unterstützung (Hausarzt, Menopause-Spezialist, Coach) — du musst das nicht alleine tun.' },
  },
}
