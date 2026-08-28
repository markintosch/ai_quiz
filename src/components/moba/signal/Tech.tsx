'use client'

// ─── Technology radar (demo) ──────────────────────────────────────────────────
// Adopt / Trial / Assess / Watch, the slow tier: capabilities moving through the
// market, not daily news. Shown as clearly-labelled demo content until the P2
// pipeline scores technologies from patents, launches and hiring. Each entry
// carries a movement marker so a reader sees direction, not just position.

type Ring = 'adopt' | 'trial' | 'assess' | 'watch'
const RINGS: Array<{ key: Ring; label: string; desc: string; dot: string }> = [
  { key: 'adopt',  label: 'Adopt',  desc: 'Proven, in market now',        dot: 'bg-emerald-500' },
  { key: 'trial',  label: 'Trial',  desc: 'Competitors piloting at scale', dot: 'bg-brand' },
  { key: 'assess', label: 'Assess', desc: 'Real, unproven, worth a view',  dot: 'bg-amber-500' },
  { key: 'watch',  label: 'Watch',  desc: 'Early, keep an eye on it',      dot: 'bg-gray-400' },
]

type Move = 'new' | 'in' | 'stable'
const MOVE: Record<Move, { mark: string; title: string; cls: string }> = {
  new:    { mark: '✦', title: 'New on the radar',  cls: 'text-brand-accent' },
  in:     { mark: '▲', title: 'Moving inward',     cls: 'text-emerald-600' },
  stable: { mark: '•', title: 'Holding position',  cls: 'text-gray-400' },
}

const DEMO_TECH: Array<{ ring: Ring; name: string; note: string; move: Move }> = [
  { ring: 'adopt',  name: 'In-line crack & dirt vision', note: 'Camera detection at speed, table stakes across the field.', move: 'stable' },
  { ring: 'trial',  name: 'AI candling / defect classification', note: 'NABEL and Kyowa CEX/DEX/BEX pushing blood-and-crack detection.', move: 'in' },
  { ring: 'trial',  name: 'End-of-line robotic palletising', note: 'NABEL robotics partnership; labour reduction as the pitch.', move: 'in' },
  { ring: 'assess', name: 'Connected machine-data platforms', note: 'iMoba vs Prinzen "machine data platform" and Meggsius farm data.', move: 'new' },
  { ring: 'assess', name: 'Optical grading patents', note: 'Zenyer filing family on camera-based crack and dirt detection.', move: 'stable' },
  { ring: 'watch',  name: 'Predictive precision poultry farming', note: 'Meggsius: flock data upstream of grading. Direction, not product yet.', move: 'new' },
  { ring: 'watch',  name: 'Full-line data from farm to pack', note: 'Whoever joins housing, collection and grading data owns the keten story.', move: 'new' },
]

export function TechRadar() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[11px] text-gray-500 leading-snug flex-1">
          The slow tier: capability shifts, not daily news. Designed to be scored from patents, launches and hiring in a later phase.
        </p>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">Demo data</span>
      </div>
      <div className="space-y-3">
        {RINGS.map(ring => {
          const items = DEMO_TECH.filter(t => t.ring === ring.key)
          if (items.length === 0) return null
          return (
            <div key={ring.key}>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${ring.dot}`} />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">{ring.label}</span>
                </span>
                <span className="text-[10px] text-gray-400">{ring.desc}</span>
              </div>
              <ul className="space-y-1 pl-3">
                {items.map((t, i) => {
                  const m = MOVE[t.move]
                  return (
                    <li key={i} className="text-sm text-gray-800">
                      <span className={`mr-1.5 font-bold ${m.cls}`} title={m.title}>{m.mark}</span>
                      <span className="font-medium">{t.name}</span>
                      <span className="block text-[11px] text-gray-500 pl-5">{t.note}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
