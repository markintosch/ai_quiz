// Server component — animated SVG of how the field's AI skill levels have
// shifted across 12mo / 6mo / 3mo / now. Stacked horizontal bars, 5 levels.

import {
  type SkillCurve,
  SKILL_LEVELS,
  type SkillCurvePoint,
} from '@/products/ai_benchmark/aggregates'
import { getContent, getQuestions, type Lang } from '@/products/ai_benchmark/data'

const INK    = '#0F172A'
const BODY   = '#374151'
const MUTED  = '#94A3B8'
const BORDER = '#E2E8F0'

// Cool → warm gradient: never (cool grey) → expert (deep blue/amber)
const LEVEL_COLORS: Record<string, string> = {
  never:       '#CBD5E1',
  beginner:    '#93C5FD',
  comfortable: '#60A5FA',
  experienced: '#2563EB',
  expert:      '#1E3A8A',
}

export function SkillCurve({ curve, userTrajectory, lang = 'nl' }: {
  curve:           SkillCurve
  userTrajectory?: number[] | null
  lang?:           Lang
}) {
  const t = getContent(lang)
  const points: SkillCurvePoint[] = curve.points

  // Pull localised level + timeframe labels from Q10 (matrix question)
  const q10 = getQuestions('marketing', lang).find(q => q.id === 'q10')
  const levelLabels: Record<string, string> = {}
  for (const opt of q10?.options ?? []) levelLabels[opt.id] = opt.label
  const tfLabels: Record<string, string> = {}
  for (const row of q10?.rows ?? []) tfLabels[row.id] = row.label
  tfLabels.now = ''  // 'now' renders as empty + the NU badge separately

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
        {SKILL_LEVELS.map(lvl => (
          <span key={lvl} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: BODY }}>
            <span style={{ width: 10, height: 10, background: LEVEL_COLORS[lvl], borderRadius: 2, display: 'inline-block' }} />
            {levelLabels[lvl] ?? lvl}
          </span>
        ))}
      </div>

      {/* Stacked bars per timeframe */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {points.map((pt, rowIdx) => {
          const isNow = pt.timeframe === 'now'
          // userTrajectory dot: present if user picked level for this timeframe
          // (m12, m6, m3). For 'now' we reuse m3 (the most recent self-assessment).
          let userIdx: number | null = null
          if (userTrajectory) {
            const map = { m12: 0, m6: 1, m3: 2, now: 2 } as const
            userIdx = userTrajectory[map[pt.timeframe]] ?? null
            if (userIdx === undefined || userIdx < 0) userIdx = null
          }

          return (
            <div key={pt.timeframe}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4, gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: isNow ? INK : BODY }}>
                  {tfLabels[pt.timeframe] || ''}
                  {isNow && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 800, color: '#1D4ED8', letterSpacing: '0.08em' }}>{t.scNowBadge}</span>}
                </span>
                <span style={{ fontSize: 11, color: MUTED }}>
                  {t.scAvgLabel} <strong style={{ color: INK }}>{pt.avgIndex.toFixed(1)}</strong>
                </span>
              </div>

              {/* Stacked segments */}
              <div style={{
                position: 'relative', height: 26,
                background: '#F1F5F9', borderRadius: 6,
                display: 'flex', overflow: 'hidden',
                border: `1px solid ${BORDER}`,
              }}>
                {SKILL_LEVELS.map((lvl, i) => {
                  const pct = pt.pct[lvl] ?? 0
                  if (pct === 0) return null
                  return (
                    <div
                      key={lvl}
                      title={`${levelLabels[lvl] ?? lvl} · ${pct}%`}
                      style={{
                        width:      `${pct}%`,
                        background: LEVEL_COLORS[lvl],
                        animation:  `aibench-grow 700ms ease-out ${rowIdx * 120}ms both`,
                        transformOrigin: 'left',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800,
                        color: i >= 3 ? '#fff' : '#0F172A',
                      }}
                    >
                      {pct >= 8 && `${pct}%`}
                    </div>
                  )
                })}

                {/* User dot */}
                {userIdx !== null && (() => {
                  // Position the dot horizontally at the cumulative center of the user's level segment.
                  let cum = 0
                  for (let i = 0; i < userIdx; i++) cum += pt.pct[SKILL_LEVELS[i]] ?? 0
                  const segPct = pt.pct[SKILL_LEVELS[userIdx]] ?? 0
                  const left = cum + segPct / 2
                  return (
                    <div style={{
                      position: 'absolute',
                      left: `${left}%`, top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 16, height: 16, borderRadius: '50%',
                      background: '#fff',
                      border: `3px solid #D97706`,
                      boxShadow: '0 0 0 2px #fff, 0 2px 6px rgba(0,0,0,0.3)',
                      animation: `aibench-pulse 1.6s ease-in-out infinite`,
                      zIndex: 2,
                    }} />
                  )
                })()}
              </div>
            </div>
          )
        })}
      </div>

      {userTrajectory && (
        <p style={{ marginTop: 10, fontSize: 11, color: MUTED, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#fff', border: '2px solid #D97706' }} />
          {t.scYourPosition}
        </p>
      )}

      <style>{`
        @keyframes aibench-grow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes aibench-pulse {
          0%, 100% { box-shadow: 0 0 0 2px #fff, 0 2px 6px rgba(0,0,0,0.3), 0 0 0 0 rgba(217,119,6,0.55); }
          50%      { box-shadow: 0 0 0 2px #fff, 0 2px 6px rgba(0,0,0,0.3), 0 0 0 8px rgba(217,119,6,0); }
        }
      `}</style>
    </div>
  )
}
