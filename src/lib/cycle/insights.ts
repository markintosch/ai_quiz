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
  alcohol_glasses: number
  symptoms: string[]
  nap_taken: boolean
  busy_day: boolean
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

  // Alcohol → next-day sleep
  // Pair each day with the previous day's drink count, then compare sleep
  // on "morning after" days vs "no drink the night before" days.
  const sleepAfterDrink: number[] = []
  const sleepAfterDry:   number[] = []
  for (let i = 1; i < recent.length; i++) {
    const yesterday = recent[i - 1]
    const today = recent[i]
    if (yesterday.alcohol_glasses > 0) sleepAfterDrink.push(today.sleep)
    else                               sleepAfterDry.push(today.sleep)
  }
  if (sleepAfterDrink.length >= 4 && sleepAfterDry.length >= 4) {
    const drop = avg(sleepAfterDry) - avg(sleepAfterDrink)
    if (drop > 0.7) {
      out.push({
        rule_key: 'alcohol_dips_sleep',
        text:     `Op dagen na een glas alcohol slaap je gemiddeld ${drop.toFixed(1)} punt minder goed.`,
      })
    }
  }

  // Symptom × cycle-phase frequency
  // For each symptom that appears at least 3x in the window, find the phase
  // where it concentrates most. Surface the strongest concentration.
  const SYMPTOM_LABEL: Record<string, string> = {
    brain_fog:         'brain fog',
    dizzy:             'duizeligheid',
    headache:          'hoofdpijn',
    overstimulated:    'overprikkeling',
    sad:               'somberheid',
    tired:             'vermoeidheid',
    exhausted:         'uitputting',
    interrupted_sleep: 'onderbroken slaap',
    restless_legs:     'rusteloze benen',
    joint_pain:        'gewrichtspijn',
    back_pain:         'rugpijn',
    bloating:          'opgeblazen gevoel',
    cramps:            'menstruatiekramp',
    cold:              'koud gevoel',
  }
  const PHASE_LABEL: Record<string, string> = {
    menstrual:      'menstruatie',
    follicular:     'folliculaire fase',
    ovulation:      'ovulatie',
    'luteal-early': 'vroege luteale fase',
    'luteal-late':  'late luteale fase',
  }

  type SymphCount = { symptom: string; phase: string; ratio: number; total: number }
  const sympPhase: SymphCount[] = []
  for (const sym of Object.keys(SYMPTOM_LABEL)) {
    const daysWith = recent.filter(e => Array.isArray(e.symptoms) && e.symptoms.includes(sym))
    if (daysWith.length < 3) continue
    const phaseCounts: Record<string, number> = {}
    for (const d of daysWith) phaseCounts[d.cycle_phase] = (phaseCounts[d.cycle_phase] ?? 0) + 1
    const totalDaysWith = daysWith.length
    for (const phase of Object.keys(PHASE_LABEL)) {
      const inPhase = phaseCounts[phase] ?? 0
      if (inPhase < 2) continue
      const phaseDaysAll = recent.filter(e => e.cycle_phase === phase).length || 1
      const ratio = inPhase / phaseDaysAll  // fraction of phase days with this symptom
      sympPhase.push({ symptom: sym, phase, ratio, total: inPhase })
    }
  }
  sympPhase.sort((a, b) => b.ratio - a.ratio)
  if (sympPhase[0] && sympPhase[0].ratio > 0.5) {
    const top = sympPhase[0]
    out.push({
      rule_key: `symptom_phase_${top.symptom}_${top.phase}`,
      text:     `${SYMPTOM_LABEL[top.symptom][0].toUpperCase()}${SYMPTOM_LABEL[top.symptom].slice(1)} komt vooral voor in je ${PHASE_LABEL[top.phase]}.`,
    })
  }

  // Symptom × sleep: bloating, interrupted_sleep, restless_legs often dip sleep
  for (const sym of ['bloating', 'interrupted_sleep', 'restless_legs', 'cramps']) {
    const withSleep    = recent.filter(e => Array.isArray(e.symptoms) && e.symptoms.includes(sym)).map(e => e.sleep)
    const withoutSleep = recent.filter(e => !(Array.isArray(e.symptoms) && e.symptoms.includes(sym))).map(e => e.sleep)
    if (withSleep.length < 3 || withoutSleep.length < 5) continue
    const drop = avg(withoutSleep) - avg(withSleep)
    if (drop > 0.7) {
      out.push({
        rule_key: `symptom_sleep_${sym}`,
        text:     `Op dagen met ${SYMPTOM_LABEL[sym]} slaap je gemiddeld ${drop.toFixed(1)} punt minder goed.`,
      })
      break  // one symptom-sleep insight is enough at a time
    }
  }

  // Busy day → next-day sleep
  const busyToSleep:    number[] = []
  const calmToSleep:    number[] = []
  for (let i = 1; i < recent.length; i++) {
    if (recent[i - 1].busy_day) busyToSleep.push(recent[i].sleep)
    else                        calmToSleep.push(recent[i].sleep)
  }
  if (busyToSleep.length >= 4 && calmToSleep.length >= 4) {
    const drop = avg(calmToSleep) - avg(busyToSleep)
    if (drop > 0.7) {
      out.push({
        rule_key: 'busy_dips_sleep',
        text:     `Na een drukke dag slaap je gemiddeld ${drop.toFixed(1)} punt minder goed.`,
      })
    }
  }

  return out
}
