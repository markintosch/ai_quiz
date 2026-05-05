// FILE: src/lib/cycle/score.test.ts

import { describe, it, expect } from 'vitest'
import { computeReadiness, guidanceFor } from './score'

describe('computeReadiness', () => {
  it('high-energy ovulation day with great sleep and rest yesterday → high band', () => {
    const r = computeReadiness({
      sleep: 9,
      stress: 2,
      cycle_phase: 'ovulation',
      yesterday_intensity: null,
      yesterday_was_rest: true,
    })
    // 0.4*90 + 0.25*85 + 0.2*85 + 0.15*90 = 36 + 21.25 + 17 + 13.5 = 87.75 → 88
    expect(r.readiness).toBe(88)
    expect(r.band).toBe('high')
  })

  it('luteal-late, poor sleep, high stress, hard workout yesterday → low band', () => {
    const r = computeReadiness({
      sleep: 3,
      stress: 9,
      cycle_phase: 'luteal-late',
      yesterday_intensity: 'High',
      yesterday_was_rest: false,
    })
    // 0.4*30 + 0.25*45 + 0.2*50 + 0.15*20 = 12 + 11.25 + 10 + 3 = 36.25 → 36
    expect(r.readiness).toBe(36)
    expect(r.band).toBe('low')
  })

  it('average inputs hover around the middle', () => {
    const r = computeReadiness({
      sleep: 6,
      stress: 5,
      cycle_phase: 'follicular',
      yesterday_intensity: 'Medium',
      yesterday_was_rest: false,
    })
    // 0.4*60 + 0.25*75 + 0.2*70 + 0.15*60 = 24 + 18.75 + 14 + 9 = 65.75 → 66
    expect(r.readiness).toBe(66)
    expect(r.band).toBe('good')
  })

  it('no entry yesterday → activity component is neutral (70)', () => {
    const r = computeReadiness({
      sleep: 7,
      stress: 4,
      cycle_phase: 'follicular',
      yesterday_intensity: null,
      yesterday_was_rest: false,
    })
    expect(r.components.activity).toBe(70)
  })

  it('unknown phase falls back to neutral cycle score', () => {
    const r = computeReadiness({
      sleep: 7,
      stress: 5,
      cycle_phase: 'unknown',
      yesterday_intensity: 'Low',
      yesterday_was_rest: false,
    })
    expect(r.components.cycle).toBe(70)
  })

  it('clamps to 0–100 range', () => {
    const r = computeReadiness({
      sleep: 10,
      stress: 1,
      cycle_phase: 'ovulation',
      yesterday_intensity: 'Low',
      yesterday_was_rest: false,
    })
    expect(r.readiness).toBeLessThanOrEqual(100)
    expect(r.readiness).toBeGreaterThanOrEqual(0)
  })
})

describe('guidanceFor', () => {
  it('returns Dutch copy for each band', () => {
    expect(guidanceFor('high')).toMatch(/pittig|training/i)
    expect(guidanceFor('good')).toMatch(/solide|ritme/i)
    expect(guidanceFor('moderate')).toMatch(/lichter/i)
    expect(guidanceFor('low')).toMatch(/herstel/i)
  })
})
