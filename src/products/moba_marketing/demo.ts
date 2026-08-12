// FILE: src/products/moba_marketing/demo.ts
// ─── Demo dataset for the evaluation walk-through (n = 12) ─────────────────────
// Deterministic (seeded) so the demo dashboard is stable across renders.
// Shaped on purpose: some dimensions show high agreement, others high divergence
// — that spread is the whole point the group report is meant to surface.

import type { MobaSubmissionLike } from '@/lib/moba/aggregate'

// ── Seeded RNG (mulberry32) ───────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20270114)

// target mean (0–100) + spread per dimension. High spread = divergent topic.
const SHAPE: Record<string, { mean: number; spread: number }> = {
  moba_positioning:      { mean: 52, spread: 26 }, // verdeeld
  moba_integrated_comms: { mean: 44, spread: 18 },
  moba_business_partner: { mean: 46, spread: 30 }, // sterk verdeeld (kern-spanning)
  moba_channel_strategy: { mean: 34, spread: 20 }, // event-afhankelijk, laag
  moba_data_roi:         { mean: 30, spread: 12 }, // eensgezind laag
  moba_ai_future:        { mean: 28, spread: 22 },
}

function clamp5(v: number): number {
  const r = Math.max(0, Math.min(100, v))
  return Math.round(r / 5) * 5 // scores land on 5-point steps, like real normalised data
}

// Segment per respondent (1 = techniek … 5 = markt). Mixed team.
const SEGMENTS = [1, 2, 2, 1, 3, 4, 5, 4, 3, 2, 5, 4]

// Collective priority leanings (points tend to flow here).
const PRIORITY_WEIGHTS: Record<string, number> = {
  moba_positioning:      0.24,
  moba_business_partner: 0.24,
  moba_channel_strategy: 0.20,
  moba_integrated_comms: 0.14,
  moba_ai_future:        0.10,
  moba_data_roi:         0.08,
}

const OPEN: Record<string, string[]> = {
  q20: [
    'Dat we de hele keten als één verhaal gaan brengen in plaats van losse machines.',
    'Een positie als partner die meedenkt over rendement, niet als leverancier.',
    'Structureel content en thought leadership, zodat we niet alleen op beurzen zichtbaar zijn.',
    'AI serieus inzetten voordat de concurrent dat doet.',
    'Meer sturen op data zodat we weten wat een euro marketing oplevert.',
  ],
  q21: [
    'We leunen veel te zwaar op events. Buiten het beursseizoen valt het stil.',
    'Intern vertellen we allemaal een net iets ander verhaal over waar MOBA voor staat.',
    'We praten vooral over techniek en specificaties, te weinig over de klant.',
    'Marketing en sales trekken niet altijd één lijn.',
  ],
  q22: [
    'Van productgericht naar klant- en ketengericht denken.',
    'Eén helder, gedeeld verhaal dat iedereen kan navertellen.',
    'Minder afhankelijk worden van beurzen.',
    'Een doorlopende contentkalender met echte cases en rendement.',
    'Beginnen met meten, zodat keuzes onderbouwd zijn.',
  ],
}

function gaussish(): number {
  // sum of 3 uniforms ≈ bell curve, centered ~0
  return (rand() + rand() + rand()) / 3 - 0.5
}

const DIM_KEYS = Object.keys(SHAPE)

function buildSubmission(i: number): MobaSubmissionLike {
  const segment = SEGMENTS[i]
  const dimension_scores: Record<string, number> = {}
  for (const key of DIM_KEYS) {
    const { mean, spread } = SHAPE[key]
    let v = mean + gaussish() * 2 * spread
    // Correlate the "business partner" and "positioning" views with segment:
    // techniek-gedreven collega's zien de partnerrol lager, markt-gedreven hoger.
    if (key === 'moba_business_partner') v += (segment - 3) * 9
    if (key === 'moba_positioning') v += (segment - 3) * 4
    dimension_scores[key] = clamp5(v)
  }

  // Priorities: distribute 10 points with collective leanings + a little noise.
  const weights = DIM_KEYS.map(k => PRIORITY_WEIGHTS[k] * (0.6 + rand()))
  const wSum = weights.reduce((a, b) => a + b, 0)
  const raw = DIM_KEYS.map((_, idx) => (weights[idx] / wSum) * 10)
  const priorities: Record<string, number> = {}
  let allocated = 0
  DIM_KEYS.forEach((k, idx) => {
    const p = Math.floor(raw[idx])
    priorities[k] = p
    allocated += p
  })
  // hand out the remaining points to the highest fractional remainders
  let remaining = 10 - allocated
  const order = DIM_KEYS
    .map((k, idx) => ({ k, frac: raw[idx] - Math.floor(raw[idx]) }))
    .sort((a, b) => b.frac - a.frac)
  for (const { k } of order) {
    if (remaining <= 0) break
    priorities[k] += 1
    remaining--
  }

  // A subset of respondents leaves open answers.
  const open_answers: Record<string, string> = {}
  if (i < OPEN.q20.length) open_answers.q20 = OPEN.q20[i]
  if (i < OPEN.q21.length) open_answers.q21 = OPEN.q21[i]
  if (i < OPEN.q22.length) open_answers.q22 = OPEN.q22[i]

  return { dimension_scores, priorities, open_answers, segment }
}

export const DEMO_SUBMISSIONS: MobaSubmissionLike[] = Array.from({ length: 12 }, (_, i) =>
  buildSubmission(i)
)
