interface Props {
  wave0Flagged: number
  wave0Total: number
  wave1Flagged?: number
  wave1Total?: number
  wave0Label?: string
  wave1Label?: string
}

function pct(flagged: number, total: number) {
  return total > 0 ? Math.round((flagged / total) * 100) : 0
}

function barColor(p: number) {
  if (p === 0) return '#22C55E'
  if (p < 20) return '#F59E0B'
  return '#EF4444'
}

export function ShadowAIPanel({
  wave0Flagged,
  wave0Total,
  wave1Flagged,
  wave1Total,
  wave0Label = 'Wave 0',
  wave1Label = 'Wave 1',
}: Props) {
  const hasWave1 = wave1Flagged !== undefined && wave1Total !== undefined && wave1Total > 0
  const p0 = pct(wave0Flagged, wave0Total)
  const p1 = hasWave1 ? pct(wave1Flagged!, wave1Total!) : null

  const trend = hasWave1
    ? wave1Flagged! < wave0Flagged
      ? 'down'
      : wave1Flagged! > wave0Flagged
        ? 'up'
        : 'flat'
    : null

  const color0 = barColor(p0)
  const color1 = p1 !== null ? barColor(p1) : null

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
        Shadow AI
      </h3>

      {wave0Total === 0 ? (
        <p className="text-sm text-gray-500">No responses yet.</p>
      ) : wave0Flagged === 0 && (!hasWave1 || wave1Flagged === 0) ? (
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-green-600">0</span>
          <p className="text-sm text-gray-600">
            No signs of unmanaged AI use detected in {wave0Total} respondent{wave0Total !== 1 ? 's' : ''}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Wave 0 bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">{wave0Label}</span>
              <span className="text-xs text-gray-500">
                {wave0Flagged} of {wave0Total} ({p0}%)
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${p0}%`, backgroundColor: color0 }}
              />
            </div>
          </div>

          {/* Wave 1 bar */}
          {hasWave1 && p1 !== null && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">{wave1Label}</span>
                <span className="text-xs text-gray-500">
                  {wave1Flagged} of {wave1Total} ({p1}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${p1}%`, backgroundColor: color1! }}
                />
              </div>
            </div>
          )}

          {/* Trend summary */}
          {trend && (
            <p className="text-sm font-medium" style={{
              color: trend === 'down' ? '#16A34A' : trend === 'up' ? '#DC2626' : '#6B7280'
            }}>
              {trend === 'down' && `▼ Down from ${wave0Flagged} to ${wave1Flagged} — improvement`}
              {trend === 'up' && `▲ Up from ${wave0Flagged} to ${wave1Flagged} — needs attention`}
              {trend === 'flat' && `→ Unchanged at ${wave0Flagged} respondents`}
            </p>
          )}

          <p className="text-xs text-gray-400">
            Shadow AI = respondents whose usage score significantly exceeds their governance + strategy readiness.
          </p>
        </div>
      )}
    </div>
  )
}
