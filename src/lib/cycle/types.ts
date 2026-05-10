// FILE: src/lib/cycle/types.ts
// Shared types for Cycle Companion. See docs/PRD-cycle-companion.md.

export type CyclePhase =
  | 'menstrual'
  | 'follicular'
  | 'ovulation'
  | 'luteal-early'
  | 'luteal-late'
  | 'unknown'

export type ActivityType =
  | 'None'
  | 'Walk'
  | 'Run'
  | 'Cycle'
  | 'Strength'
  | 'Yoga'
  | 'Other'

export type ActivityIntensity = 'Low' | 'Medium' | 'High'

export type ReadinessBand = 'high' | 'good' | 'moderate' | 'low'

export interface CycleProfile {
  user_id: string
  last_period_start: string  // ISO calendar date 'YYYY-MM-DD'
  typical_length: number     // days, default 28
  lat: number
  lon: number
  timezone: string           // e.g. 'Europe/Amsterdam'
  reminder_time: string      // 'HH:MM'
  created_at: string
  updated_at: string
}

export interface DailyEntry {
  id: string
  user_id: string
  entry_date: string         // ISO calendar date
  mood_score: number         // 0-10
  mood_variable: boolean
  sleep: number              // 1-10
  stress: number             // 1-10
  activity_types: ActivityType[]
  activity_intensity: ActivityIntensity | null
  alcohol_glasses: number    // 0-10 (3+ stored as 3)
  symptoms: string[]         // SymptomKey[] — kept as string[] here to avoid circular dep
  nap_taken: boolean
  busy_day: boolean
  menstruation_flag: boolean
  readiness_score: number | null
  cycle_phase: CyclePhase
  score_feedback: -1 | 0 | 1 | null
  created_at: string
  updated_at: string
}

export interface PhaseDetectionInput {
  today: string                     // ISO calendar date
  cycle_profile: Pick<CycleProfile, 'last_period_start' | 'typical_length'>
  recent_period_starts: string[]    // ISO dates, any order — most recent will be picked
}

export interface PhaseDetectionResult {
  phase: CyclePhase
  day_of_cycle: number | null       // null when phase is 'unknown'
  observed_length: number           // mean of last cycles, or fallback to typical_length
  is_irregular: boolean             // true → phase forced to 'unknown'
}

export interface ScoreInput {
  sleep: number                          // 1-10
  stress: number                         // 1-10
  cycle_phase: CyclePhase
  yesterday_intensity: ActivityIntensity | null  // null = no entry yesterday OR rest
  yesterday_was_rest: boolean            // true if entry exists with activity_types = ['None']
}

export interface ScoreResult {
  readiness: number                      // 0-100
  band: ReadinessBand
  components: {
    sleep: number
    cycle: number
    activity: number
    stress: number
  }
}
