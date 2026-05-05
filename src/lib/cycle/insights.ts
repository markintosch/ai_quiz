// FILE: src/lib/cycle/insights.ts
// Hand-coded insight rules. Each rule looks at recent entries and returns
// either a phrased insight or null. Rules require ≥14 entries to fire (gated
// upstream).

export interface InsightInput {
  date: string
  mood: number
  sleep: number
  stress: number
  readiness: number | null
  activity_intensity: string | null
  activity_types: string[]
  cycle_phase: string
  rainy: boolean
}

export interface Insight {
  rule_key: string
  text: string
}

function pearson(xs: number[], ys: number[]): number {
  const n = xs.length
  if (n < 5) return 0
  const meanX = xs.reduce((a, b) => a + b, 0) / n
  const meanY = ys.reduce((a, b) => a + b, 0) / n
  let num = 0, denX = 0, denY = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX
    const dy = ys[i] - meanY
    num  += dx * dy
    denX += dx * dx
    denY += dy * dy
  }
  if (denX === 0 || denY === 0) return 0
  return num / Math.sqrt(denX * denY)
}

function avg(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0
}

export function runInsightRules(entries: InsightInput[]): Insight[] {
  if (entries.length < 14) return []
  const recent = entries.slice(-30)

  const out: Insight[] = []

  // Sleep ↔ mood: positive correlation = better sleep → better mood
  const sleepMood = pearson(recent.map(e => e.sleep), recent.map(e => e.mood))
  if (sleepMood > 0.3) {
    out.push({
      rule_key: 'sleep_drives_mood',
      text:     'Op dagen dat je beter slaapt, voel je je vaak beter in je vel.',
    })
  }

  // Stress ↔ mood (negative correlation expected)
  const stressMood = pearson(recent.map(e => e.stress), recent.map(e => e.mood))
  if (stressMood < -0.3) {
    out.push({
      rule_key: 'stress_lowers_mood',
      text:     'Hogere stress hangt voor jou samen met een lager humeur.',
    })
  }

  // Activity intensity ↔ next-day readiness
  const after: { intensity: string; nextReadiness: number }[] = []
  for (let i = 0; i < recent.length - 1; i++) {
    const tomorrow = recent[i + 1]
    if (tomorrow.readiness == null) continue
    const intensity = recent[i].activity_intensity
    if (!intensity) continue
    after.push({ intensity, nextReadiness: tomorrow.readiness })
  }
  if (after.length >= 8) {
    const lowAvg  = avg(after.filter(a => a.intensity === 'Low').map(a => a.nextReadiness))
    const highAvg = avg(after.filter(a => a.intensity === 'High').map(a => a.nextReadiness))
    if (lowAvg && highAvg && (lowAvg - highAvg) > 10) {
      out.push({
        rule_key: 'lighter_days_better',
        text:     'Je voelt je vaak beter de dag na een rustigere training.',
      })
    }
  }

  // Cycle phase ↔ mood: luteal-late dip
  const lutealLate = recent.filter(e => e.cycle_phase === 'luteal-late').map(e => e.mood)
  const others     = recent.filter(e => e.cycle_phase !== 'luteal-late').map(e => e.mood)
  if (lutealLate.length >= 3 && others.length >= 5 && (avg(others) - avg(lutealLate) > 1)) {
    out.push({
      rule_key: 'pms_mood_dip',
      text:     'Je stemming zakt vaak in de dagen vóór je menstruatie.',
    })
  }

  // Weather ↔ mood
  const rainy    = recent.filter(e => e.rainy).map(e => e.mood)
  const dry      = recent.filter(e => !e.rainy).map(e => e.mood)
  if (rainy.length >= 5 && dry.length >= 5 && (avg(dry) - avg(rainy) > 0.5)) {
    out.push({
      rule_key: 'rain_lowers_mood',
      text:     'Regenachtige dagen lijken je stemming licht te beïnvloeden.',
    })
  }

  return out
}
