// Compact heatmap — rows × columns × intensity (0-100). Color intensity scales
// with value; cells show the % number on top.

const INK    = '#0F172A'
const BODY   = '#374151'
const MUTED  = '#94A3B8'
const BORDER = '#E2E8F0'
const ACCENT = '#1D4ED8'

export type HeatmapRow = {
  id:    string
  label: string
}

export type HeatmapCol = HeatmapRow

export function Heatmap({
  rows, cols, values,
}: {
  rows: HeatmapRow[]
  cols: HeatmapCol[]
  values: Record<string, Record<string, number>>   // row.id → col.id → 0–100
}) {
  // Color: white → ACCENT depending on value
  const cellColor = (pct: number) => {
    if (pct === 0) return '#F8FAFC'
    const opacity = 0.10 + (pct / 100) * 0.85
    return `rgba(29, 78, 216, ${opacity})`
  }
  const cellTextColor = (pct: number) => pct >= 55 ? '#fff' : INK

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{
        borderCollapse: 'separate', borderSpacing: 0,
        fontSize: 12, color: INK, minWidth: '100%',
      }}>
        <thead>
          <tr>
            <th style={{ position: 'sticky', left: 0, background: '#fff', textAlign: 'left', padding: '6px 10px 10px 0', fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Rol →
            </th>
            {cols.map(col => (
              <th key={col.id} style={{
                padding: '6px 4px 10px',
                fontSize: 10, fontWeight: 700, color: BODY,
                writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                whiteSpace: 'nowrap', height: 90,
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td style={{
                position: 'sticky', left: 0, background: '#fff',
                padding: '6px 12px 6px 0', fontWeight: 700, color: INK,
                whiteSpace: 'nowrap',
              }}>
                {row.label}
              </td>
              {cols.map(col => {
                const v = values[row.id]?.[col.id] ?? 0
                return (
                  <td
                    key={col.id}
                    title={`${row.label} · ${col.label} · ${v}%`}
                    style={{
                      padding: 0,
                      width: 56, height: 38, minWidth: 56,
                      textAlign: 'center',
                      background: cellColor(v),
                      color: cellTextColor(v),
                      fontWeight: 800, fontSize: 11,
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    {v > 0 ? `${v}%` : '·'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 10, fontSize: 11, color: MUTED, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 12, height: 12, background: cellColor(10), border: `1px solid ${BORDER}`, display: 'inline-block' }} />
        laag
        <span style={{ width: 12, height: 12, background: cellColor(50), display: 'inline-block' }} />
        midden
        <span style={{ width: 12, height: 12, background: cellColor(90), display: 'inline-block' }} />
        hoog
        <span style={{ marginLeft: 'auto' }}>{ACCENT && ''}% gebruikers per rol</span>
      </p>
    </div>
  )
}
