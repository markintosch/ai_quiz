// FILE: src/lib/cycle/apple-health.test.ts
// Fixture tests for the Apple Health XML parser. Covers the three core record
// types we extract and the per-day aggregation logic.

import { describe, it, expect } from 'vitest'
import { parseHealthExport } from './apple-health'

const fixture = `<?xml version="1.0" encoding="UTF-8"?>
<HealthData locale="en_US">
  <ExportDate value="2026-05-10 22:00:00 +0200"/>
  <Record type="HKCategoryTypeIdentifierSleepAnalysis"
          sourceName="Apple Watch"
          startDate="2026-04-15 22:30:00 +0200"
          endDate="2026-04-16 06:15:00 +0200"
          value="HKCategoryValueSleepAnalysisAsleepCore"/>
  <Record type="HKCategoryTypeIdentifierSleepAnalysis"
          sourceName="Apple Watch"
          startDate="2026-04-15 22:00:00 +0200"
          endDate="2026-04-15 22:30:00 +0200"
          value="HKCategoryValueSleepAnalysisInBed"/>
  <Record type="HKCategoryTypeIdentifierMenstrualFlow"
          startDate="2026-04-20 08:00:00 +0200"
          endDate="2026-04-20 08:00:00 +0200"
          value="HKCategoryValueMenstrualFlowLight"/>
  <Record type="HKCategoryTypeIdentifierMenstrualFlow"
          startDate="2026-04-22 08:00:00 +0200"
          endDate="2026-04-22 08:00:00 +0200"
          value="HKCategoryValueMenstrualFlowNone"/>
  <Workout workoutActivityType="HKWorkoutActivityTypeRunning"
           duration="32.5"
           durationUnit="min"
           startDate="2026-04-16 18:00:00 +0200"
           endDate="2026-04-16 18:32:30 +0200"/>
  <Workout workoutActivityType="HKWorkoutActivityTypeYoga"
           duration="45"
           durationUnit="min"
           startDate="2026-04-17 07:30:00 +0200"
           endDate="2026-04-17 08:15:00 +0200"/>
  <Record type="HKQuantityTypeIdentifierHeartRate"
          startDate="2026-04-17 12:00:00 +0200"
          endDate="2026-04-17 12:00:00 +0200"
          value="72"/>
</HealthData>`

describe('parseHealthExport', () => {
  it('extracts sleep records and aggregates by wake-up date', async () => {
    const { days, summary } = await parseHealthExport(fixture)
    const apr16 = days.find(d => d.date === '2026-04-16')
    expect(apr16).toBeDefined()
    expect(apr16!.sleep).toBeGreaterThanOrEqual(7)   // ~7.75h sleep → score 8
    expect(summary.daysWithSleep).toBe(1)
  })

  it('ignores InBed sleep records (not actually asleep)', async () => {
    const onlyInBed = `<?xml version="1.0" encoding="UTF-8"?>
      <HealthData>
        <Record type="HKCategoryTypeIdentifierSleepAnalysis"
                startDate="2026-04-15 22:00:00 +0200"
                endDate="2026-04-16 06:00:00 +0200"
                value="HKCategoryValueSleepAnalysisInBed"/>
      </HealthData>`
    const { days } = await parseHealthExport(onlyInBed)
    expect(days).toHaveLength(0)
  })

  it('extracts menstruation days and skips None flow', async () => {
    const { days, summary } = await parseHealthExport(fixture)
    expect(summary.daysWithPeriod).toBe(1)
    const apr20 = days.find(d => d.date === '2026-04-20')
    expect(apr20?.menstruation_flag).toBe(true)
    const apr22 = days.find(d => d.date === '2026-04-22')
    expect(apr22).toBeUndefined()   // None flow → excluded
  })

  it('extracts workouts and maps activity types', async () => {
    const { days, summary } = await parseHealthExport(fixture)
    expect(summary.daysWithActivity).toBe(2)
    const apr16 = days.find(d => d.date === '2026-04-16')
    expect(apr16?.activity_types).toContain('Run')
    expect(apr16?.activity_intensity).toBe('High')
    const apr17 = days.find(d => d.date === '2026-04-17')
    expect(apr17?.activity_types).toContain('Yoga')
  })

  it('ignores unrelated record types (heart rate)', async () => {
    const { days } = await parseHealthExport(fixture)
    // Heart rate on Apr 17 alone shouldn't create a day; only the workout matters
    const apr17 = days.find(d => d.date === '2026-04-17')
    expect(apr17?.sleep).toBeUndefined()
    expect(apr17?.menstruation_flag).toBeUndefined()
  })

  it('respects the since filter', async () => {
    const { days } = await parseHealthExport(fixture, { since: '2026-04-20' })
    expect(days.every(d => d.date >= '2026-04-20')).toBe(true)
  })
})
