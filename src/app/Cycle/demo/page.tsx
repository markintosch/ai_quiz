// FILE: src/app/Cycle/demo/page.tsx
// Demo page — renders the readiness output screens with mock data so the
// design can be reviewed without needing real auth + entries. NOT linked
// from anywhere; reachable only via /Cycle/demo. No auth gate.
//
// Toggle scenarios via ?state= query param:
//   ?state=cold       → first 3 days (no score, "learning baseline")
//   ?state=good       → day 12, ovulation, good readiness
//   ?state=low        → day 25, luteal-late, low readiness
//   default           → good

import OutputClient from '../output/OutputClient'

const SCENARIOS = {
  cold: {
    readiness: 0,
    band: 'good' as const,
    guidance: '',
    phaseLabel: 'Folliculair',
    components: { sleep: 0, cycle: 0, activity: 0, stress: 0 },
    weather: { temp_c: 14, condition: 'cloudy' },
    feedback: null,
    showScore: false,
    totalEntries: 1,
  },
  good: {
    readiness: 84,
    band: 'high' as const,
    guidance: 'Goede dag voor pittig werk of een stevige training.',
    phaseLabel: 'Ovulatie',
    components: { sleep: 80, cycle: 85, activity: 85, stress: 80 },
    weather: { temp_c: 18, condition: 'sunny' },
    feedback: null,
    showScore: true,
    totalEntries: 21,
  },
  low: {
    readiness: 38,
    band: 'low' as const,
    guidance: 'Lage capaciteit — kies herstel boven prestatie.',
    phaseLabel: 'Luteaal — laat',
    components: { sleep: 30, cycle: 45, activity: 50, stress: 30 },
    weather: { temp_c: 9, condition: 'rainy' },
    feedback: null,
    showScore: true,
    totalEntries: 35,
  },
} as const

export default function DemoPage({ searchParams }: { searchParams: { state?: string } }) {
  const state = (searchParams.state as keyof typeof SCENARIOS) ?? 'good'
  const data = SCENARIOS[state] ?? SCENARIOS.good

  return (
    <>
      <div style={{
        position: 'fixed', top: 8, left: 8, zIndex: 50,
        background: 'rgba(255,255,255,0.85)', borderRadius: 999,
        padding: '6px 10px', fontSize: 12, color: '#3D2F2A',
        backdropFilter: 'blur(4px)',
      }}>
        demo:{' '}
        <a href="/Cycle/demo?state=cold" style={{ color: '#D4847E' }}>cold</a>{' · '}
        <a href="/Cycle/demo?state=good" style={{ color: '#D4847E' }}>good</a>{' · '}
        <a href="/Cycle/demo?state=low"  style={{ color: '#D4847E' }}>low</a>
      </div>
      <OutputClient
        readiness={data.readiness}
        band={data.band}
        guidance={data.guidance}
        phaseLabel={data.phaseLabel}
        components={data.components}
        weather={data.weather}
        feedback={data.feedback}
        showScore={data.showScore}
        totalEntries={data.totalEntries}
      />
    </>
  )
}
