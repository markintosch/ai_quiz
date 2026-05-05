// FILE: src/lib/cycle/phase.test.ts
// Fixture tests covering §7.4 of the PRD plus edge cases.

import { describe, it, expect } from 'vitest'
import { detectPhase, inferPeriodStarts } from './phase'

describe('inferPeriodStarts', () => {
  it('returns empty for no data', () => {
    expect(inferPeriodStarts([])).toEqual([])
  })

  it('treats consecutive days as one period start', () => {
    expect(
      inferPeriodStarts(['2026-04-01', '2026-04-02', '2026-04-03', '2026-04-04']),
    ).toEqual(['2026-04-01'])
  })

  it('detects a new period after a 10-day gap', () => {
    const starts = inferPeriodStarts([
      '2026-03-01', '2026-03-02', '2026-03-03',
      '2026-03-30', '2026-03-31',
    ])
    expect(starts).toEqual(['2026-03-30', '2026-03-01'])
  })

  it('ignores mid-cycle spotting (gap < 10 days)', () => {
    // Period Apr 1-3, spotting Apr 8 (gap 5 from Apr 3 → ignored),
    // next real period Apr 30 (gap 22 from Apr 8 → counted)
    const starts = inferPeriodStarts([
      '2026-04-01', '2026-04-02', '2026-04-03',
      '2026-04-08',
      '2026-04-30',
    ])
    expect(starts).toEqual(['2026-04-30', '2026-04-01'])
  })

  it('deduplicates identical inputs', () => {
    expect(inferPeriodStarts(['2026-04-01', '2026-04-01'])).toEqual(['2026-04-01'])
  })
})

describe('detectPhase — regular 28-day cycle', () => {
  const profile = { last_period_start: '2026-04-01', typical_length: 28 }
  const starts = ['2026-04-01']

  it('day 1 → menstrual', () => {
    const r = detectPhase({ today: '2026-04-01', cycle_profile: profile, recent_period_starts: starts })
    expect(r.phase).toBe('menstrual')
    expect(r.day_of_cycle).toBe(1)
    expect(r.observed_length).toBe(28)
  })

  it('day 5 → menstrual (last day of menstrual phase)', () => {
    const r = detectPhase({ today: '2026-04-05', cycle_profile: profile, recent_period_starts: starts })
    expect(r.phase).toBe('menstrual')
    expect(r.day_of_cycle).toBe(5)
  })

  it('day 7 → follicular', () => {
    const r = detectPhase({ today: '2026-04-07', cycle_profile: profile, recent_period_starts: starts })
    expect(r.phase).toBe('follicular')
    expect(r.day_of_cycle).toBe(7)
  })

  it('day 14 → ovulation', () => {
    const r = detectPhase({ today: '2026-04-14', cycle_profile: profile, recent_period_starts: starts })
    expect(r.phase).toBe('ovulation')
    expect(r.day_of_cycle).toBe(14)
  })

  it('day 16 → ovulation (last day of ovulation window)', () => {
    const r = detectPhase({ today: '2026-04-16', cycle_profile: profile, recent_period_starts: starts })
    expect(r.phase).toBe('ovulation')
  })

  it('day 21 → luteal-early', () => {
    const r = detectPhase({ today: '2026-04-21', cycle_profile: profile, recent_period_starts: starts })
    expect(r.phase).toBe('luteal-early')
    expect(r.day_of_cycle).toBe(21)
  })

  it('day 27 → luteal-late', () => {
    const r = detectPhase({ today: '2026-04-27', cycle_profile: profile, recent_period_starts: starts })
    expect(r.phase).toBe('luteal-late')
    expect(r.day_of_cycle).toBe(27)
  })
})

describe('detectPhase — regular 35-day cycle (longer)', () => {
  // Three cycles 35 days apart: Jan 21, Feb 25, Apr 1
  const starts = ['2026-04-01', '2026-02-25', '2026-01-21']
  const profile = { last_period_start: '2026-01-21', typical_length: 35 }

  it('observes length=35 from history', () => {
    const r = detectPhase({ today: '2026-04-15', cycle_profile: profile, recent_period_starts: starts })
    expect(r.observed_length).toBe(35)
    expect(r.is_irregular).toBe(false)
  })

  it('day 22 → ovulation (shifted to match longer cycle)', () => {
    const r = detectPhase({ today: '2026-04-22', cycle_profile: profile, recent_period_starts: starts })
    expect(r.phase).toBe('ovulation')
    expect(r.day_of_cycle).toBe(22)
  })

  it('day 14 → follicular (not ovulation, because cycle is longer)', () => {
    const r = detectPhase({ today: '2026-04-14', cycle_profile: profile, recent_period_starts: starts })
    expect(r.phase).toBe('follicular')
  })

  it('day 33 → luteal-late (last 5 days of cycle)', () => {
    const r = detectPhase({ today: '2026-05-03', cycle_profile: profile, recent_period_starts: starts })
    expect(r.day_of_cycle).toBe(33)
    expect(r.phase).toBe('luteal-late')
  })
})

describe('detectPhase — first-ever entry (no cycle history)', () => {
  const profile = { last_period_start: '2026-04-01', typical_length: 28 }

  it('uses typical_length when only one period start known', () => {
    const r = detectPhase({
      today: '2026-04-15',
      cycle_profile: profile,
      recent_period_starts: ['2026-04-01'],
    })
    expect(r.observed_length).toBe(28)
    expect(r.phase).toBe('ovulation')
    expect(r.is_irregular).toBe(false)
  })

  it('falls back to profile when recent_period_starts is empty', () => {
    const r = detectPhase({
      today: '2026-04-15',
      cycle_profile: profile,
      recent_period_starts: [],
    })
    expect(r.observed_length).toBe(28)
    expect(r.phase).toBe('ovulation')
  })
})

describe('detectPhase — irregular cycles → unknown', () => {
  it('cycles of 24 and 38 days (spread > 7) → unknown', () => {
    // Period starts: Jan 1, Jan 25 (24 days), Mar 4 (38 days)
    const r = detectPhase({
      today: '2026-03-15',
      cycle_profile: { last_period_start: '2026-01-01', typical_length: 28 },
      recent_period_starts: ['2026-03-04', '2026-01-25', '2026-01-01'],
    })
    expect(r.is_irregular).toBe(true)
    expect(r.phase).toBe('unknown')
    expect(r.day_of_cycle).toBeNull()
  })

  it('skipped month (>45 days since last period) → unknown', () => {
    const r = detectPhase({
      today: '2026-05-25',  // 54 days after Apr 1
      cycle_profile: { last_period_start: '2026-04-01', typical_length: 28 },
      recent_period_starts: ['2026-04-01'],
    })
    expect(r.is_irregular).toBe(true)
    expect(r.phase).toBe('unknown')
    expect(r.day_of_cycle).toBeNull()
  })
})
