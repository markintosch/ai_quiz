// Generic ranked-bar list. Used for top blockers, top use cases, time-saved
// distribution, archetype distribution, etc.

const INK    = '#0F172A'
const BODY   = '#374151'
const MUTED  = '#94A3B8'
const ACCENT = '#1D4ED8'
const WARM   = '#D97706'

export type Bar = {
  id:      string
  label:   string
  pct:     number
  emoji?:  string
  highlight?: boolean
}

export function RankedBars({
  items, max = 6, color = ACCENT, highlightColor = WARM, compact = false,
}: {
  items:           Bar[]
  max?:            number
  color?:          string
  highlightColor?: string
  compact?:        boolean
}) {
  const trimmed = items.slice(0, max)
  if (trimmed.length === 0) {
    return <p style={{ fontSize: 12, color: MUTED }}>Nog geen data.</p>
  }
  const fontSize = compact ? 12 : 13
  const barH     = compact ? 6 : 8

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 6 : 10 }}>
      {trimmed.map(b => {
        const c = b.highlight ? highlightColor : color
        return (
          <div key={b.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3, gap: 8 }}>
              <span style={{ fontSize, color: INK, fontWeight: b.highlight ? 700 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {b.emoji && <span style={{ marginRight: 6 }}>{b.emoji}</span>}
                {b.label}
              </span>
              <span style={{ fontSize, color: c, fontWeight: 800, flexShrink: 0 }}>
                {b.pct}%
              </span>
            </div>
            <div style={{ height: barH, background: '#F1F5F9', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{
                height: barH, width: `${Math.max(2, b.pct)}%`, background: c,
                borderRadius: 100, transition: 'width 0.6s ease-out',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Stacked horizontal bar — total 100%, segments colored by series.
export function StackedBar({
  segments, height = 28,
}: {
  segments: { id: string; label: string; pct: number; color: string; emoji?: string }[]
  height?:  number
}) {
  return (
    <div>
      <div style={{
        height, display: 'flex', borderRadius: 6, overflow: 'hidden',
        border: `1px solid #E2E8F0`,
      }}>
        {segments.filter(s => s.pct > 0).map(s => (
          <div
            key={s.id}
            title={`${s.label} · ${s.pct}%`}
            style={{
              width: `${s.pct}%`, background: s.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: '#fff',
            }}
          >
            {s.pct >= 7 && `${s.pct}%`}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
        {segments.map(s => (
          <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: BODY }}>
            <span style={{ width: 10, height: 10, background: s.color, borderRadius: 2, display: 'inline-block' }} />
            {s.emoji && <span>{s.emoji}</span>}
            {s.label} <strong style={{ color: INK }}>{s.pct}%</strong>
          </span>
        ))}
      </div>
    </div>
  )
}
