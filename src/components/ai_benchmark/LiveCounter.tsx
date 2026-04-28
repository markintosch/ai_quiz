// Server component — small "LIVE · N respondents · +X this week" badge with
// a pulsing dot. Visual liveness for the dashboard.

const INK = '#0F172A'
const WARM = '#D97706'

export function LiveCounter({ total, lastWeek }: { total: number; lastWeek?: number }) {
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
      <span>·</span>
      <span><strong>{total.toLocaleString('nl-NL')}</strong> respondenten</span>
      {lastWeek !== undefined && lastWeek > 0 && (
        <>
          <span>·</span>
          <span style={{ color: '#15803D' }}>+{lastWeek} deze week</span>
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
