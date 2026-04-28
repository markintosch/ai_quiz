// Server component — small "LIVE" badge with a pulsing dot.
// In vague mode (used while we're still on mock data), the count + 'this week'
// delta are replaced with a fuzzy text like "Growing group of professionals"
// so we never claim numbers we don't have.

import { getContent, type Lang } from '@/products/ai_benchmark/data'

const INK = '#0F172A'
const WARM = '#D97706'

export function LiveCounter({ total, lastWeek, lang = 'nl', vague = false }: {
  total:      number
  lastWeek?:  number
  lang?:      Lang
  vague?:     boolean
}) {
  const t = getContent(lang)
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: '6px 14px', borderRadius: 100,
      background: '#fff', border: `1.5px solid ${WARM}55`,
      fontSize: 12, color: INK, fontWeight: 700,
    }}>
      <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
        <span style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: WARM, animation: 'aibench-live-pulse 1.6s ease-in-out infinite',
          opacity: 0.65,
        }} />
        <span style={{
          position: 'absolute', inset: 1, borderRadius: '50%', background: WARM,
        }} />
      </span>
      <span style={{ letterSpacing: '0.08em', fontSize: 10, color: WARM }}>LIVE</span>
      {!vague && (
        <>
          <span>·</span>
          <span><strong>{total.toLocaleString()}</strong> {t.liveRespondentsWord}</span>
          {lastWeek !== undefined && lastWeek > 0 && (
            <>
              <span>·</span>
              <span style={{ color: '#15803D' }}>+{lastWeek} {t.liveThisWeekWord}</span>
            </>
          )}
        </>
      )}

      <style>{`
        @keyframes aibench-live-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%      { transform: scale(2.3); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
