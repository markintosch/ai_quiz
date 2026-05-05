// FILE: src/lib/cycle/score.ts
// Readiness score per PRD §6. Weights are tunable; treat them as v1.0 guesses.

import type { ScoreInput, ScoreResult, CyclePhase, ReadinessBand } from './types'

const WEIGHTS = { sleep: 0.40, cycle: 0.25, activity: 0.20, stress: 0.15 } as const

const PHASE_SCORE: Record<CyclePhase, number> = {
  ovulation:     85,
  follicular:    75,
  'luteal-early':60,
  menstrual:     55,
  'luteal-late': 45,
  unknown:       70,
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n))
}

function bandFor(score: number): ReadinessBand {
  if (score >= 80) return 'high'
  if (score >= 60) return 'good'
  if (score >= 40) return 'moderate'
  return 'low'
}

export function computeReadiness(input: ScoreInput): ScoreResult {
  const sleep = clamp(input.sleep * 10)
  const stress = clamp((11 - input.stress) * 10)
  const cycle = PHASE_SCORE[input.cycle_phase]

  let activity: number
  if (input.yesterday_was_rest) activity = 85
  else if (input.yesterday_intensity === 'High') activity = 50
  else if (input.yesterday_intensity === 'Medium') activity = 70
  else if (input.yesterday_intensity === 'Low') activity = 85
  else activity = 70  // no entry yesterday → neutral

  const readiness = Math.round(
    WEIGHTS.sleep * sleep +
    WEIGHTS.cycle * cycle +
    WEIGHTS.activity * activity +
    WEIGHTS.stress * stress,
  )

  return {
    readiness: clamp(readiness),
    band: bandFor(readiness),
    components: { sleep, cycle, activity, stress },
  }
}

const GUIDANCE_NL: Record<ReadinessBand, string> = {
  high:     'Goede dag voor pittig werk of een stevige training.',
  good:     'Solide dag — vertrouw op je normale ritme.',
  moderate: 'Houd je agenda iets lichter vandaag.',
  low:      'Lage capaciteit — kies herstel boven prestatie.',
}

export function guidanceFor(band: ReadinessBand): string {
  return GUIDANCE_NL[band]
}
