// Server component — horizontal grid of "sub-insight" cards. Each card has
// emoji + headline number/stat + body line, with an optional trend arrow that
// pulses to draw the eye.

import { type Insight } from '@/products/ai_benchmark/aggregates'

const INK    = '#0F172A'
const ACCENT = '#1D4ED8'
const WARM   = '#D97706'
const BODY   = '#374151'
const MUTED  = '#94A3B8'
const BORDER = '#E2E8F0'

export function InsightStrip({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
      }}>
        {insights.map((ins, i) => (
          <div key={i} style={{
            background: '#fff',
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            padding: '16px 18px',
            position: 'relative',
            animation: `aibench-fade-in 500ms ease-out ${i * 80}ms both`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{ins.emoji}</span>
              {ins.delta && (
                <span style={{
                  fontSize: 11, fontWeight: 800, letterSpacing: '0.04em',
                  padding: '3px 8px', borderRadius: 4,
                  background: ins.trend === 'up'   ? '#DCFCE7'
                            : ins.trend === 'down' ? '#FEE2E2' : '#F1F5F9',
                  color:      ins.trend === 'up'   ? '#15803D'
                            : ins.trend === 'down' ? '#B91C1C' : BODY,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  animation: ins.trend === 'up' || ins.trend === 'down'
                    ? 'aibench-blink 2.4s ease-in-out infinite' : undefined,
                }}>
                  {ins.trend === 'up' ? '↑' : ins.trend === 'down' ? '↓' : '·'} {ins.delta}
                </span>
              )}
            </div>
            <p style={{ fontSize: 14, fontWeight: 800, color: INK, lineHeight: 1.35, marginBottom: 6 }}>
              {ins.title}
            </p>
            <p style={{ fontSize: 12, color: BODY, lineHeight: 1.55 }}>
              {ins.body}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes aibench-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes aibench-blink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.55; }
        }
      `}</style>
    </div>
  )
}
