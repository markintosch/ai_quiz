// FILE: src/lib/cycle/apple-health.ts
// Parse Apple Health export.xml in the browser and map to per-day
// summaries that match cycle_daily_entries. Raw XML never leaves the
// device — only the aggregated daily payload is POSTed to the server.

import type { ActivityType, ActivityIntensity } from './types'

export interface ImportedDay {
  date: string                                // YYYY-MM-DD
  sleep?: number                              // 1-10
  menstruation_flag?: boolean
  activity_types?: ActivityType[]
  activity_intensity?: ActivityIntensity | null
}

export interface ImportSummary {
  totalDays: number
  daysWithSleep: number
  daysWithPeriod: number
  daysWithActivity: number
  oldestDate: string | null
  newestDate: string | null
}

// ── Apple HealthKit workout type → our ActivityType ──────────────────────────
function mapActivity(hkType: string): ActivityType {
  const t = hkType.replace('HKWorkoutActivityType', '')
  if (/Walking|Hiking/i.test(t)) return 'Walk'
  if (/Running|Jogging/i.test(t)) return 'Run'
  if (/Cycling/i.test(t)) return 'Cycle'
  if (/Strength|Functional|Pilates|CoreTraining|MixedMetabolic/i.test(t)) return 'Strength'
  if (/Yoga|Flexibility|MindAndBody/i.test(t)) return 'Yoga'
  return 'Other'
}

// Duration in minutes + activity type → intensity heuristic
function inferIntensity(types: ActivityType[], minutes: number): ActivityIntensity {
  if (types.includes('Run') || types.includes('Strength')) {
    return minutes >= 25 ? 'High' : 'Medium'
  }
  if (types.includes('Cycle')) {
    return minutes >= 40 ? 'High' : minutes >= 20 ? 'Medium' : 'Low'
  }
  if (minutes >= 45) return 'High'
  if (minutes >= 20) return 'Medium'
  return 'Low'
}

// Sleep duration (hours, awake-time excluded) → 1-10 score
function hoursToSleepScore(hours: number): number {
  if (hours < 3) return 1
  if (hours < 4) return 2
  if (hours < 5) return 3
  if (hours < 5.5) return 4
  if (hours < 6) return 5
  if (hours < 6.5) return 6
  if (hours < 7) return 7
  if (hours < 7.5) return 8
  if (hours < 8.5) return 9
  return 10
}

// Local-date helper: an Apple Health timestamp like "2026-04-15 06:15:00 +0200"
// → "2026-04-15" using its own offset (the date that day means to the user).
function localDateOf(timestamp: string): string {
  // Cheap parse: take the YYYY-MM-DD prefix. Sleep that crosses midnight gets
  // its END date (when she woke up). Workouts get their START date.
  return timestamp.slice(0, 10)
}

// Sleep that ends after 03:00 belongs to the END date (the day she wakes up).
// Sleep that ends before 03:00 of the next day still belongs to the previous
// night's date. Edge case: a nap in afternoon stays on its own date.
function sleepDateOf(endTimestamp: string): string {
  // For overnight sleep, the most natural attribution is "the morning she
  // wakes up". Just use the end timestamp's date. Naps stay on their own day.
  return localDateOf(endTimestamp)
}

/**
 * Parse an Apple Health export XML string and return aggregated per-day
 * summaries. Designed to run in the browser. Streaming-friendly enough for
 * files up to ~200MB on mobile Safari; larger files should be filtered by
 * date range during export.
 */
export async function parseHealthExport(
  xmlText: string,
  options: { since?: string } = {},
): Promise<{ days: ImportedDay[]; summary: ImportSummary }> {
  const { XMLParser } = await import('fast-xml-parser')
  const parser = new XMLParser({
    ignoreAttributes:    false,
    attributeNamePrefix: '@_',
    allowBooleanAttributes: true,
  })
  const parsed = parser.parse(xmlText)
  const root = parsed?.HealthData ?? {}

  // Each top-level array is an array of records of that kind, or undefined.
  const records: any[] = Array.isArray(root.Record) ? root.Record : root.Record ? [root.Record] : []
  const workouts: any[] = Array.isArray(root.Workout) ? root.Workout : root.Workout ? [root.Workout] : []

  // ── Aggregate sleep minutes per date ─────────────────────────────────────
  const sleepByDate: Record<string, number> = {}
  // ── Period dates ─────────────────────────────────────────────────────────
  const periodDates: Set<string> = new Set()

  for (const r of records) {
    const type = r['@_type']
    if (!type) continue

    if (type === 'HKCategoryTypeIdentifierSleepAnalysis') {
      const start = r['@_startDate']
      const end = r['@_endDate']
      const value = r['@_value'] ?? ''
      if (!start || !end) continue
      // Skip "InBed" and "Awake" — we want actual sleep
      const asleep = /Asleep/i.test(value)
      if (!asleep) continue
      const startMs = Date.parse(start)
      const endMs = Date.parse(end)
      if (!isFinite(startMs) || !isFinite(endMs) || endMs <= startMs) continue
      const minutes = (endMs - startMs) / 60000
      const dateKey = sleepDateOf(end)
      if (options.since && dateKey < options.since) continue
      sleepByDate[dateKey] = (sleepByDate[dateKey] ?? 0) + minutes
    }

    if (type === 'HKCategoryTypeIdentifierMenstrualFlow') {
      const start = r['@_startDate']
      const value = r['@_value'] ?? ''
      if (!start) continue
      // value "HKCategoryValueMenstrualFlowNone" → not actually bleeding
      if (/None/i.test(value)) continue
      const dateKey = localDateOf(start)
      if (options.since && dateKey < options.since) continue
      periodDates.add(dateKey)
    }
  }

  // ── Aggregate workouts per date ──────────────────────────────────────────
  // Multiple workouts on a day → combine activity_types, take highest intensity
  type WorkoutAgg = { types: Set<ActivityType>; totalMinutes: number; maxIntensity: ActivityIntensity }
  const workoutsByDate: Record<string, WorkoutAgg> = {}

  for (const w of workouts) {
    const hkType = w['@_workoutActivityType']
    const start = w['@_startDate']
    const duration = Number(w['@_duration'] ?? 0)
    const durationUnit = w['@_durationUnit'] ?? 'min'
    if (!hkType || !start) continue
    const minutes = durationUnit === 'min' ? duration : durationUnit === 'sec' ? duration / 60 : duration * 60
    if (minutes < 5) continue   // ignore very short "workouts"
    const dateKey = localDateOf(start)
    if (options.since && dateKey < options.since) continue
    const activity = mapActivity(hkType)
    const existing = workoutsByDate[dateKey]
    const totalMinutes = (existing?.totalMinutes ?? 0) + minutes
    const types = new Set<ActivityType>(existing?.types ?? [])
    types.add(activity)
    const intensity = inferIntensity(Array.from(types), totalMinutes)
    workoutsByDate[dateKey] = { types, totalMinutes, maxIntensity: intensity }
  }

  // ── Combine into per-day records ─────────────────────────────────────────
  const dateSet = new Set<string>()
  for (const d of Object.keys(sleepByDate))   dateSet.add(d)
  for (const d of Array.from(periodDates))    dateSet.add(d)
  for (const d of Object.keys(workoutsByDate)) dateSet.add(d)
  const days: ImportedDay[] = Array.from(dateSet).sort().map(date => {
    const sleepMin = sleepByDate[date]
    const workout = workoutsByDate[date]
    return {
      date,
      sleep:              sleepMin ? hoursToSleepScore(sleepMin / 60) : undefined,
      menstruation_flag:  periodDates.has(date) || undefined,
      activity_types:     workout ? Array.from(workout.types) : undefined,
      activity_intensity: workout ? workout.maxIntensity : undefined,
    }
  })

  const summary: ImportSummary = {
    totalDays:        days.length,
    daysWithSleep:    Object.keys(sleepByDate).length,
    daysWithPeriod:   periodDates.size,
    daysWithActivity: Object.keys(workoutsByDate).length,
    oldestDate:       days.length > 0 ? days[0].date : null,
    newestDate:       days.length > 0 ? days[days.length - 1].date : null,
  }

  return { days, summary }
}

/**
 * Browser-side helper: takes a File (either .zip or .xml) and produces
 * aggregated per-day summaries. The .zip is unpacked client-side via JSZip
 * so the raw export never leaves the device.
 */
export async function importAppleHealthFile(file: File, options: { since?: string } = {}): Promise<{ days: ImportedDay[]; summary: ImportSummary }> {
  let xmlText: string

  if (file.name.toLowerCase().endsWith('.zip')) {
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(file)
    // Apple's export typically nests under 'apple_health_export/export.xml'.
    const entry =
      zip.file('apple_health_export/export.xml') ??
      zip.file('export.xml') ??
      Object.values(zip.files).find(f => f.name.toLowerCase().endsWith('export.xml'))
    if (!entry) throw new Error('Geen export.xml gevonden in dit .zip-bestand.')
    xmlText = await entry.async('text')
  } else if (file.name.toLowerCase().endsWith('.xml')) {
    xmlText = await file.text()
  } else {
    throw new Error('Selecteer een .zip of .xml bestand (Apple Health export).')
  }

  return parseHealthExport(xmlText, options)
}
