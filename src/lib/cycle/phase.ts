// FILE: src/lib/cycle/phase.ts
// Cycle phase detection. The spine of the readiness score.
//
// Strategy:
//   1. Build a list of period start dates from raw `menstruation_flag=true`
//      days, treating a gap of <10 days as the same period (spotting filter).
//   2. Compute observed cycle length as the mean gap between consecutive
//      starts over the last 3 cycles. Fall back to `typical_length` if <2
//      cycles observed.
//   3. If cycle lengths vary by >7 days, OR any cycle is >45 days, OR more
//      than 45 days have passed since the last period start → mark phase as
//      'unknown' (perimenopause / skipped-month path).
//   4. Otherwise, anchor ovulation to "next expected period − 14 days" so the
//      luteal phase stays the biologically constant ~14 days. Phases shift
//      with cycle length.

import type {
  PhaseDetectionInput,
  PhaseDetectionResult,
  CyclePhase,
} from './types'

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const SPOTTING_GAP_DAYS = 10
const IRREGULAR_SPREAD_DAYS = 7
const MAX_REASONABLE_CYCLE_DAYS = 45

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function daysBetween(earlier: string, later: string): number {
  return Math.round((parseDate(later).getTime() - parseDate(earlier).getTime()) / ONE_DAY_MS)
}

/**
 * Convert a list of dates where `menstruation_flag=true` into period start
 * dates. Consecutive or near-consecutive (<10 day gap) days collapse to a
 * single start. Returns descending (most recent first).
 */
export function inferPeriodStarts(menstruationDates: string[]): string[] {
  if (menstruationDates.length === 0) return []
  const ascending = Array.from(new Set(menstruationDates)).sort()
  const starts: string[] = [ascending[0]]
  for (let i = 1; i < ascending.length; i++) {
    if (daysBetween(ascending[i - 1], ascending[i]) >= SPOTTING_GAP_DAYS) {
      starts.push(ascending[i])
    }
  }
  return starts.reverse()
}

export function detectPhase(input: PhaseDetectionInput): PhaseDetectionResult {
  const { today, cycle_profile, recent_period_starts } = input

  const sortedDesc = [...recent_period_starts].sort().reverse()
  const anchor = sortedDesc[0] ?? cycle_profile.last_period_start

  const cycleLengths: number[] = []
  for (let i = 0; i < Math.min(sortedDesc.length - 1, 3); i++) {
    cycleLengths.push(daysBetween(sortedDesc[i + 1], sortedDesc[i]))
  }

  const isIrregularByVariance = (() => {
    if (cycleLengths.length < 2) return false
    const max = Math.max(...cycleLengths)
    const min = Math.min(...cycleLengths)
    if (max - min > IRREGULAR_SPREAD_DAYS) return true
    if (cycleLengths.some(l => l > MAX_REASONABLE_CYCLE_DAYS)) return true
    return false
  })()

  const daysSinceLastPeriod = daysBetween(anchor, today)

  if (daysSinceLastPeriod > MAX_REASONABLE_CYCLE_DAYS) {
    return {
      phase: 'unknown',
      day_of_cycle: null,
      observed_length: cycle_profile.typical_length,
      is_irregular: true,
    }
  }

  if (isIrregularByVariance) {
    const meanLen = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
    return {
      phase: 'unknown',
      day_of_cycle: null,
      observed_length: Math.round(meanLen),
      is_irregular: true,
    }
  }

  const observedLength = cycleLengths.length >= 2
    ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
    : cycle_profile.typical_length

  // 1-indexed day within the current cycle. If we've passed the predicted
  // length, keep counting forward (rather than wrapping) — the user is late,
  // not in a fresh cycle, until daysSinceLastPeriod > 45 (caught above).
  const dayOfCycle = daysSinceLastPeriod + 1

  // Anchor ovulation 14 days before the next expected period start.
  // For a 28-day cycle: ovulationCenter = 28 - 13 = day 15, range 14-16. ✓
  // For a 35-day cycle: ovulationCenter = day 22, range 21-23.
  const ovulationCenter = observedLength - 13
  const ovulationStart = Math.max(6, ovulationCenter - 1)
  const ovulationEnd   = Math.max(6, ovulationCenter + 1)
  const lutealLateStart = observedLength - 4

  let phase: CyclePhase
  if (dayOfCycle <= 5)              phase = 'menstrual'
  else if (dayOfCycle < ovulationStart) phase = 'follicular'
  else if (dayOfCycle <= ovulationEnd)  phase = 'ovulation'
  else if (dayOfCycle < lutealLateStart) phase = 'luteal-early'
  else                                  phase = 'luteal-late'

  return {
    phase,
    day_of_cycle: dayOfCycle,
    observed_length: observedLength,
    is_irregular: false,
  }
}
