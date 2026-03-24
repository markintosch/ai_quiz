'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MARKETS, DIMENSIONS, DUMMY_SCORES, SALES_DATA, FORECAST_DATA, QUARTERS, QUARTER_KEYS,
  ROLES, GTM_RULES, PLAYBOOK_ARCHETYPES, DEFAULT_GTM,
  scoreColour, overallScore, yoyGrowth, getPlaybook, totalVariancePct, qVariancePct,
  type DimScores, type GTMState, type QuarterKey,
} from '@/products/oncology/data'
import RadarChart from '@/components/oncology/RadarChart'

type Tab = 'overview' | 'assessment' | 'sales' | 'priorities' | 'gtm'
type SalesMap = Record<string, Record<QuarterKey, number>>

// ── Heatmap (shared) ───────────────────────────────────────────────────────
function Heatmap({ selectedMarket, onSelect }: { selectedMarket: string; onSelect: (id: string) => void }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full border-collapse text-sm" style={{ minWidth: 680 }}>
        <thead>
          <tr style={{ background: '#1F2970' }}>
            <th className="text-left text-white/80 font-medium py-3 px-4 text-xs tracking-wider">MARKET</th>
            {DIMENSIONS.map(d => (
              <th key={d.id} className="text-center text-white/80 font-medium py-3 px-2 text-xs tracking-wider whitespace-nowrap">
                {d.short.toUpperCase()}
              </th>
            ))}
            <th className="text-center text-white/80 font-medium py-3 px-3 text-xs tracking-wider">OVERALL</th>
          </tr>
        </thead>
        <tbody>
          {MARKETS.map((m, mi) => {
            const scores = DUMMY_SCORES[m.id] ?? {}
            const avg = overallScore(scores)
            const avgCol = scoreColour(avg)
            const isSelected = m.id === selectedMarket
            return (
              <tr
                key={m.id}
                onClick={() => onSelect(m.id)}
                className="border-b border-gray-100 cursor-pointer transition-colors"
                style={{ background: isSelected ? 'rgba(31,41,112,0.06)' : mi % 2 === 0 ? '#fff' : '#F9FAFB' }}
              >
                <td className="py-2.5 px-4 font-medium text-gray-800 whitespace-nowrap">
                  {isSelected && <span className="mr-1 text-blue-600">▶</span>}
                  <span className="mr-2">{m.flag}</span>{m.name}
                </td>
                {DIMENSIONS.map(d => {
                  const s = scores[d.id] ?? 0
                  const col = scoreColour(s)
                  return (
                    <td key={d.id} className="py-2.5 px-2 text-center">
                      <span className="inline-block w-12 rounded text-xs font-bold py-0.5" style={{ background: col.bg, color: col.text }}>
                        {s.toFixed(1)}
                      </span>
                    </td>
                  )
                })}
                <td className="py-2.5 px-3 text-center">
                  <span className="inline-block w-14 rounded text-xs font-bold py-0.5" style={{ background: avgCol.bg, color: avgCol.text }}>
                    {avg.toFixed(1)}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Dashboard page ─────────────────────────────────────────────────────────
export default function OncologyDashboard() {
  const [tab, setTab] = useState<Tab>('overview')
  const [selectedMarket, setSelectedMarket] = useState('uk')
  const [salesData, setSalesData] = useState<SalesMap>(
    () => JSON.parse(JSON.stringify(SALES_DATA)) // fallback until API loads
  )
  const [salesLoading, setSalesLoading] = useState(true)
  const [gtmState, setGtmState] = useState<Record<string, GTMState>>(
    () => Object.fromEntries(MARKETS.map(m => [m.id, { ...DEFAULT_GTM }]))
  )
  const [userScores, setUserScores] = useState<Record<string, DimScores>>({})

  // Load sales data from Supabase
  useEffect(() => {
    fetch('/api/oncology/sales')
      .then(r => r.json())
      .then((data: SalesMap) => {
        if (data && typeof data === 'object' && !('error' in data)) {
          setSalesData(data)
        }
      })
      .catch(() => { /* keep fallback */ })
      .finally(() => setSalesLoading(false))
  }, [])

  // Load user assessment scores from localStorage
  useEffect(() => {
    const loaded: Record<string, DimScores> = {}
    MARKETS.forEach(m => {
      ROLES.forEach(r => {
        const raw = localStorage.getItem(`oncology:${m.id}:${r.id}`)
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as { dimScores: DimScores }
            if (!loaded[m.id]) loaded[m.id] = parsed.dimScores
          } catch { /* ignore */ }
        }
      })
    })
    setUserScores(loaded)
  }, [])

  const market = MARKETS.find(m => m.id === selectedMarket)!
  const baseScores = DUMMY_SCORES[selectedMarket] ?? {}
  const effectiveScores = userScores[selectedMarket] ?? baseScores
  const avg = overallScore(effectiveScores)
  const avgCol = scoreColour(avg)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview',   label: 'European Overview' },
    { id: 'assessment', label: 'Market Assessment' },
    { id: 'sales',      label: 'Sales Performance' },
    { id: 'priorities', label: 'Action Priorities' },
    { id: 'gtm',        label: 'GTM Strategy' },
  ]

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/oncology" className="flex items-center gap-2">
            <div className="w-5 h-5 rounded" style={{ background: '#1F2970' }} />
            <span className="text-xs font-bold tracking-wide text-gray-600">KIRK &amp; BLACKBEARD</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Dashboard</span>
            <Link
              href="/oncology/assess"
              className="text-xs font-semibold text-white px-4 py-1.5 rounded-full"
              style={{ background: '#C8006E' }}
            >
              + New Assessment
            </Link>
          </div>
        </div>
      </nav>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-6 flex gap-0 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors"
              style={{
                borderColor: tab === t.id ? '#C8006E' : 'transparent',
                color: tab === t.id ? '#C8006E' : '#6B7280',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── TAB 1: European Overview ──────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="space-y-8">
            {/* KPI strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'European Average',
                  value: (Object.values(DUMMY_SCORES).reduce((acc, s) => acc + overallScore(s), 0) / Object.keys(DUMMY_SCORES).length).toFixed(2),
                  sub: 'across 10 markets',
                },
                {
                  label: 'Highest Market',
                  value: '🇬🇧 UK — 3.23',
                  sub: 'Acceleration Mode',
                },
                {
                  label: 'Lowest Market',
                  value: '🇮🇹 Italy — 1.87',
                  sub: 'Foundation Building',
                },
                {
                  label: 'Ready Markets',
                  value: String(Object.values(DUMMY_SCORES).filter(s => overallScore(s) >= 3.0).length),
                  sub: 'score ≥ 3.0',
                },
              ].map(k => (
                <div key={k.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{k.label}</p>
                  <p className="text-2xl font-black" style={{ color: '#1F2970' }}>{k.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
                </div>
              ))}
            </div>

            {/* Heatmap */}
            <div>
              <h2 className="text-lg font-black mb-4" style={{ color: '#1F2970' }}>
                Market Readiness Heatmap
                <span className="text-sm font-normal text-gray-400 ml-2">— click a row to explore</span>
              </h2>
              <Heatmap selectedMarket={selectedMarket} onSelect={id => { setSelectedMarket(id); setTab('assessment') }} />
              <div className="flex gap-4 mt-3 text-xs text-gray-400">
                {[{ label: '≥ 3.0 Ready', bg: '#10B981' }, { label: '2.3–2.9 Developing', bg: '#F59E0B' }, { label: '1.5–2.2 Early', bg: '#EF4444' }, { label: '< 1.5 Critical', bg: '#991B1B' }].map(c => (
                  <span key={c.label} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c.bg }} />
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: Market Assessment ──────────────────────────────────── */}
        {tab === 'assessment' && (
          <div className="space-y-6">
            {/* Market selector */}
            <div className="flex items-center gap-4 flex-wrap">
              <select
                value={selectedMarket}
                onChange={e => setSelectedMarket(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold bg-white text-gray-800 focus:outline-none"
              >
                {MARKETS.map(m => (
                  <option key={m.id} value={m.id}>{m.flag} {m.name}</option>
                ))}
              </select>
              <span className="text-sm text-gray-400">
                {userScores[selectedMarket] ? '✅ You have assessed this market' : '⚪ Using baseline scores'}
              </span>
              <Link
                href={`/oncology/assess?market=${selectedMarket}`}
                className="text-sm font-semibold text-white px-5 py-2.5 rounded-full transition-opacity hover:opacity-90"
                style={{ background: '#C8006E' }}
              >
                Assess this market
              </Link>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Radar */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center">
                <p className="text-sm font-semibold text-gray-500 mb-1">{market.flag} {market.name}</p>
                <p className="text-xs text-gray-400 mb-4">{market.archetype}</p>
                <RadarChart scores={effectiveScores} size={260} secondaryScores={userScores[selectedMarket] ? baseScores : undefined} />
                <span
                  className="mt-4 text-sm font-black px-4 py-1.5 rounded-full"
                  style={{ background: avgCol.bg, color: avgCol.text }}
                >
                  {avg.toFixed(2)} — {avgCol.label}
                </span>
              </div>

              {/* Dimension bars */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-black text-gray-800 mb-5">Dimension Scores</h3>
                <div className="space-y-4">
                  {DIMENSIONS.map(d => {
                    const s = effectiveScores[d.id] ?? 0
                    const col = scoreColour(s)
                    const bar = ((s - 1) / 3) * 100
                    return (
                      <div key={d.id}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <div>
                            <span className="font-semibold text-gray-700">{d.name}</span>
                            <span className="text-gray-400 ml-2 text-xs">{d.roles.join(', ')}</span>
                          </div>
                          <span className="font-black" style={{ color: col.bg }}>{s.toFixed(1)} — {col.label}</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-2.5 rounded-full transition-all" style={{ width: `${bar}%`, background: col.bg }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: Sales Performance ──────────────────────────────────── */}
        {tab === 'sales' && (
          <SalesTab salesData={salesData} setSalesData={setSalesData} loading={salesLoading} />
        )}

        {/* ── TAB 4: Action Priorities ──────────────────────────────────── */}
        {tab === 'priorities' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black" style={{ color: '#1F2970' }}>Top Gap Dimensions by Market</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MARKETS.map(m => {
                const scores = DUMMY_SCORES[m.id] ?? {}
                const sortedDims = DIMENSIONS
                  .map(d => ({ d, s: scores[d.id] ?? 0 }))
                  .sort((a, b) => a.s - b.s)
                  .slice(0, 3)
                const avg = overallScore(scores)
                const col = scoreColour(avg)
                return (
                  <div key={m.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-gray-800">{m.flag} {m.name}</span>
                      <span className="text-xs font-black px-2 py-0.5 rounded" style={{ background: col.bg, color: col.text }}>
                        {avg.toFixed(1)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {sortedDims.map(({ d, s }, i) => {
                        const dc = scoreColour(s)
                        return (
                          <div key={d.id} className="flex items-center gap-2">
                            <span className="text-xs font-black text-gray-400 w-4">{i + 1}</span>
                            <div className="flex-1 flex items-center justify-between text-xs">
                              <span className="text-gray-700">{d.short}</span>
                              <span className="font-bold" style={{ color: dc.bg }}>{s.toFixed(1)}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <Link
                      href={`/oncology/assess`}
                      className="mt-3 block text-center text-xs font-semibold py-1.5 rounded-lg transition-colors hover:bg-pink-50"
                      style={{ color: '#C8006E', border: '1px solid rgba(200,0,110,0.2)' }}
                    >
                      Assess this market →
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── TAB 5: GTM Strategy ──────────────────────────────────────── */}
        {tab === 'gtm' && (
          <GTMTab
            selectedMarket={selectedMarket}
            setSelectedMarket={setSelectedMarket}
            gtmState={gtmState}
            setGtmState={setGtmState}
          />
        )}

      </div>
    </div>
  )
}

// ── Sales Tab ──────────────────────────────────────────────────────────────
function SalesTab({
  salesData,
  setSalesData,
  loading,
}: {
  salesData: SalesMap
  setSalesData: React.Dispatch<React.SetStateAction<SalesMap>>
  loading: boolean
}) {
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null) // "marketId:quarter" key while saving

  async function saveCell(marketId: string, quarter: string, revenue: number) {
    const key = `${marketId}:${quarter}`
    setSaving(key)
    try {
      await fetch('/api/oncology/sales', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ market_id: marketId, quarter, revenue }),
      })
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-black" style={{ color: '#1F2970' }}>
          Quarterly Revenue — EUR thousands
          {loading && <span className="ml-2 text-xs font-normal text-gray-400">Loading…</span>}
        </h2>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'rgba(16,185,129,0.15)' }} /> Above plan</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'rgba(239,68,68,0.12)' }} /> Below plan</span>
          <span>Click market name to see chart · Click cell to edit</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full border-collapse text-sm" style={{ minWidth: 800 }}>
          <thead>
            <tr style={{ background: '#1F2970' }}>
              <th className="text-left text-white/80 font-medium py-3 px-4 text-xs tracking-wider">MARKET</th>
              {QUARTERS.map(q => (
                <th key={q} className="text-right text-white/80 font-medium py-3 px-3 text-xs tracking-wider">{q}</th>
              ))}
              <th className="text-right text-white/80 font-medium py-3 px-3 text-xs tracking-wider">YoY</th>
              <th className="text-right text-white/80 font-medium py-3 px-4 text-xs tracking-wider">vs Plan</th>
            </tr>
          </thead>
          <tbody>
            {MARKETS.map((m, mi) => {
              const growth = yoyGrowth(m.id)
              const variance = totalVariancePct(m.id)
              const isExpanded = expandedMarket === m.id
              const rowBg = mi % 2 === 0 ? '#fff' : '#F9FAFB'

              // Quarter-over-quarter trend per quarter
              const qTrend = (qk: QuarterKey): 'up' | 'down' | 'flat' => {
                const idx = QUARTER_KEYS.indexOf(qk)
                if (idx === 0) return 'flat'
                const prev = salesData[m.id]?.[QUARTER_KEYS[idx - 1]] ?? 0
                const curr = salesData[m.id]?.[qk] ?? 0
                return curr > prev ? 'up' : curr < prev ? 'down' : 'flat'
              }

              return (
                <React.Fragment key={m.id}>
                  <tr
                    className="border-b border-gray-100"
                    style={{ background: isExpanded ? 'rgba(31,41,112,0.04)' : rowBg }}
                  >
                    <td className="py-2.5 px-4 font-medium whitespace-nowrap">
                      <button
                        onClick={() => setExpandedMarket(isExpanded ? null : m.id)}
                        className="flex items-center gap-1 font-semibold text-left transition-colors hover:opacity-70"
                        style={{ color: '#1F2970' }}
                      >
                        <span className="text-gray-400 text-xs mr-0.5">{isExpanded ? '▼' : '▶'}</span>
                        {m.flag} {m.name}
                      </button>
                    </td>
                    {QUARTER_KEYS.map(qk => {
                      const val = salesData[m.id]?.[qk] ?? 0
                      const vPct = qVariancePct(m.id, qk)
                      const trend = qTrend(qk)
                      const cellBg = vPct > 0 ? 'rgba(16,185,129,0.12)' : vPct < 0 ? 'rgba(239,68,68,0.10)' : 'transparent'
                      const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''
                      const trendColor = trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#9CA3AF'
                      const cellKey = `${m.id}:${qk}`
                      const isSaving = saving === cellKey
                      return (
                        <td key={qk} className="py-1 px-1 text-right" style={{ background: cellBg }}>
                          <div className="flex items-center justify-end gap-0.5">
                            {trendIcon && (
                              <span className="text-xs font-bold" style={{ color: trendColor }}>{trendIcon}</span>
                            )}
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              className="inline-block min-w-[44px] px-1.5 py-1 rounded text-xs font-mono text-gray-700 hover:bg-white/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 cursor-text"
                              style={{ opacity: isSaving ? 0.5 : 1 }}
                              onBlur={e => {
                                const newVal = parseInt(e.currentTarget.textContent ?? '', 10)
                                if (!isNaN(newVal) && newVal >= 0) {
                                  setSalesData(prev => ({
                                    ...prev,
                                    [m.id]: { ...prev[m.id], [qk]: newVal },
                                  }))
                                  saveCell(m.id, qk, newVal)
                                } else {
                                  e.currentTarget.textContent = String(val)
                                }
                              }}
                            >
                              {val}
                            </span>
                          </div>
                          {vPct !== 0 && (
                            <div className="text-center" style={{ fontSize: 9, color: vPct > 0 ? '#059669' : '#DC2626', lineHeight: 1.2 }}>
                              {vPct > 0 ? '+' : ''}{vPct}%
                            </div>
                          )}
                        </td>
                      )
                    })}
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{
                          background: growth >= 10 ? '#D1FAE5' : growth >= 0 ? '#FEF3C7' : '#FEE2E2',
                          color: growth >= 10 ? '#065F46' : growth >= 0 ? '#92400E' : '#991B1B',
                        }}
                      >
                        {growth >= 0 ? '+' : ''}{growth}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{
                          background: variance > 0 ? '#D1FAE5' : variance < 0 ? '#FEE2E2' : '#F3F4F6',
                          color: variance > 0 ? '#065F46' : variance < 0 ? '#991B1B' : '#6B7280',
                        }}
                      >
                        {variance > 0 ? '+' : ''}{variance}%
                      </span>
                    </td>
                  </tr>

                  {/* Expanded chart row */}
                  {isExpanded && (
                    <tr className="border-b border-gray-200">
                      <td colSpan={QUARTER_KEYS.length + 3} className="px-6 py-5" style={{ background: 'rgba(31,41,112,0.03)' }}>
                        <p className="text-xs font-semibold mb-3" style={{ color: '#1F2970' }}>
                          {m.flag} {m.name} — Actuals vs Forecast
                        </p>
                        <RevenueChart marketId={m.id} salesData={salesData} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Inline revenue chart ────────────────────────────────────────────────────
function RevenueChart({
  marketId,
  salesData,
}: {
  marketId: string
  salesData: SalesMap
}) {
  const W = 680; const H = 160; const padL = 44; const padR = 12; const padT = 12; const padB = 32

  const actuals  = QUARTER_KEYS.map(qk => salesData[marketId]?.[qk] ?? 0)
  const forecast = QUARTER_KEYS.map(qk => FORECAST_DATA[marketId]?.[qk] ?? 0)
  const allVals  = [...actuals, ...forecast]
  const maxVal   = Math.max(...allVals) * 1.1
  const minVal   = Math.min(...allVals) * 0.88

  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const xPos = (i: number) => padL + (i / (QUARTER_KEYS.length - 1)) * chartW
  const yPos = (v: number) => padT + chartH - ((v - minVal) / (maxVal - minVal)) * chartH

  // Bar width
  const barW = (chartW / QUARTER_KEYS.length) * 0.55
  const barXCenter = (i: number) => padL + (i + 0.5) * (chartW / QUARTER_KEYS.length)

  // Forecast polyline
  const fcLine = forecast.map((v, i) => `${barXCenter(i)},${yPos(v)}`).join(' ')

  // Grid lines (3 levels)
  const gridVals = [minVal, (minVal + maxVal) / 2, maxVal].map(v => Math.round(v))

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible', maxWidth: W }}>
      {/* Grid lines */}
      {gridVals.map(v => (
        <g key={v}>
          <line
            x1={padL} y1={yPos(v)} x2={W - padR} y2={yPos(v)}
            stroke="rgba(31,41,112,0.08)" strokeWidth="1" strokeDasharray="3,3"
          />
          <text x={padL - 4} y={yPos(v)} textAnchor="end" dominantBaseline="middle" fontSize={8} fill="#9CA3AF">
            {v}
          </text>
        </g>
      ))}

      {/* Actual bars */}
      {actuals.map((v, i) => {
        const fc = forecast[i]
        const above = v >= fc
        return (
          <rect
            key={i}
            x={barXCenter(i) - barW / 2}
            y={yPos(v)}
            width={barW}
            height={Math.max(1, yPos(minVal) - yPos(v))}
            fill={above ? 'rgba(16,185,129,0.6)' : 'rgba(239,68,68,0.5)'}
            rx={2}
          />
        )
      })}

      {/* Forecast line */}
      <polyline
        points={fcLine}
        fill="none"
        stroke="#1F2970"
        strokeWidth="1.5"
        strokeDasharray="5,3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Forecast dots */}
      {forecast.map((v, i) => (
        <circle key={i} cx={barXCenter(i)} cy={yPos(v)} r={3} fill="#1F2970" stroke="white" strokeWidth="1.5" />
      ))}

      {/* X labels */}
      {QUARTERS.map((q, i) => (
        <text key={i} x={barXCenter(i)} y={H - padB + 14} textAnchor="middle" fontSize={8} fill="#6B7280">
          {q}
        </text>
      ))}

      {/* Legend */}
      <g transform={`translate(${padL}, ${H - padB + 26})`}>
        <rect x={0} y={-4} width={10} height={8} fill="rgba(16,185,129,0.6)" rx={1} />
        <text x={13} y={0} dominantBaseline="middle" fontSize={8} fill="#6B7280">Actual (above plan)</text>
        <rect x={110} y={-4} width={10} height={8} fill="rgba(239,68,68,0.5)" rx={1} />
        <text x={123} y={0} dominantBaseline="middle" fontSize={8} fill="#6B7280">Actual (below plan)</text>
        <line x1={230} y1={0} x2={244} y2={0} stroke="#1F2970" strokeWidth="1.5" strokeDasharray="4,2" />
        <text x={247} y={0} dominantBaseline="middle" fontSize={8} fill="#6B7280">Forecast</text>
      </g>
    </svg>
  )
}

// ── GTM Tab (extracted for clarity) ───────────────────────────────────────
function GTMTab({
  selectedMarket, setSelectedMarket, gtmState, setGtmState,
}: {
  selectedMarket: string
  setSelectedMarket: (id: string) => void
  gtmState: Record<string, GTMState>
  setGtmState: React.Dispatch<React.SetStateAction<Record<string, GTMState>>>
}) {
  const market = MARKETS.find(m => m.id === selectedMarket)!
  const scores = DUMMY_SCORES[selectedMarket] ?? {}
  const gtm = gtmState[selectedMarket] ?? { ...DEFAULT_GTM }
  const [showPlaybook, setShowPlaybook] = useState(false)

  const update = (patch: Partial<GTMState>) =>
    setGtmState(prev => ({ ...prev, [selectedMarket]: { ...prev[selectedMarket], ...patch } }))

  // Run validation
  const flags = GTM_RULES.filter(r => r.condition(gtm, scores))

  // Playbook
  const playbook = getPlaybook(scores)

  const severityColour: Record<string, string> = {
    'HIGH RISK': '#991B1B',
    'MISALIGNED': '#B45309',
    'CAPABILITY GAP': '#1F2970',
    'BLIND SPOT': '#6D28D9',
    'LOW PRIORITY': '#374151',
    'OVERREACH': '#BE185D',
  }

  const PRIORITY_OPTIONS = ['Market education', 'Reimbursement lobbying', 'KOL development', 'Competitive displacement', 'Team building', 'Evidence generation']
  const SEGMENT_OPTIONS = ['Academic medical centres', 'Community hospitals', 'Private labs', 'Reference labs']

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left: GTM inputs */}
      <div className="space-y-5">
        {/* Market selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedMarket}
            onChange={e => setSelectedMarket(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold bg-white text-gray-800 focus:outline-none"
          >
            {MARKETS.map(m => (
              <option key={m.id} value={m.id}>{m.flag} {m.name}</option>
            ))}
          </select>
          <span className="text-sm text-gray-400">{market.archetype}</span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
          <h3 className="font-black text-gray-800">GTM Plan Inputs</h3>

          {/* Launch phase */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Launch Phase</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'pre_launch', label: 'Pre-launch' },
                { value: 'soft_launch', label: 'Soft launch' },
                { value: 'full_launch', label: 'Full launch' },
                { value: 'mature', label: 'Mature' },
              ].map(o => (
                <button
                  key={o.value}
                  onClick={() => update({ launchPhase: o.value as GTMState['launchPhase'] })}
                  className="py-2 rounded-xl text-sm font-semibold border-2 transition-all"
                  style={{
                    borderColor: gtm.launchPhase === o.value ? '#1F2970' : '#E5E7EB',
                    background: gtm.launchPhase === o.value ? '#1F2970' : '#fff',
                    color: gtm.launchPhase === o.value ? '#fff' : '#6B7280',
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Channel */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Primary Channel</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'direct', label: 'Direct sales' },
                { value: 'distributor', label: 'Distributor' },
                { value: 'hybrid', label: 'Hybrid' },
                { value: 'digital', label: 'Digital-led' },
              ].map(o => (
                <button
                  key={o.value}
                  onClick={() => update({ channel: o.value as GTMState['channel'] })}
                  className="py-2 rounded-xl text-sm font-semibold border-2 transition-all"
                  style={{
                    borderColor: gtm.channel === o.value ? '#1F2970' : '#E5E7EB',
                    background: gtm.channel === o.value ? '#1F2970' : '#fff',
                    color: gtm.channel === o.value ? '#fff' : '#6B7280',
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget + key accounts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Annual Budget (€k)</label>
              <input
                type="number"
                value={gtm.budget || ''}
                onChange={e => update({ budget: parseInt(e.target.value) || 0 })}
                placeholder="e.g. 450"
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Key Accounts</label>
              <input
                type="number"
                value={gtm.keyAccounts || ''}
                onChange={e => update({ keyAccounts: parseInt(e.target.value) || 0 })}
                placeholder="e.g. 15"
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Strategic priorities */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Strategic Priorities</label>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map(p => {
                const active = gtm.priorities.includes(p)
                return (
                  <button
                    key={p}
                    onClick={() => update({
                      priorities: active
                        ? gtm.priorities.filter(x => x !== p)
                        : [...gtm.priorities, p],
                    })}
                    className="text-xs px-3 py-1.5 rounded-full border-2 font-semibold transition-all"
                    style={{
                      borderColor: active ? '#C8006E' : '#E5E7EB',
                      background: active ? 'rgba(200,0,110,0.08)' : '#fff',
                      color: active ? '#C8006E' : '#9CA3AF',
                    }}
                  >
                    {p}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Validation + playbook */}
      <div className="space-y-5">

        {/* Validation flags */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-black text-gray-800 mb-4">
            Validation
            {flags.length === 0
              ? <span className="ml-2 text-green-600 text-sm font-semibold">✓ No issues found</span>
              : <span className="ml-2 text-red-600 text-sm font-semibold">{flags.length} flag{flags.length !== 1 ? 's' : ''}</span>
            }
          </h3>
          {flags.length === 0 ? (
            <p className="text-sm text-gray-400">Fill in your GTM plan to the left to see validation results.</p>
          ) : (
            <div className="space-y-3">
              {flags.map(f => (
                <div
                  key={f.id}
                  className="p-4 rounded-xl border-l-4"
                  style={{
                    borderLeftColor: severityColour[f.severity] ?? '#374151',
                    background: (severityColour[f.severity] ?? '#374151') + '0C',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-black px-2 py-0.5 rounded text-white"
                      style={{ background: severityColour[f.severity] ?? '#374151' }}
                    >
                      {f.severity}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">{f.flag}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.action}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Playbook */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-800">Recommended Playbook</h3>
            <button
              onClick={() => setShowPlaybook(s => !s)}
              className="text-xs font-semibold"
              style={{ color: '#C8006E' }}
            >
              {showPlaybook ? 'Hide' : 'Show'}
            </button>
          </div>
          <div
            className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3"
            style={{ background: 'rgba(200,0,110,0.1)', color: '#C8006E' }}
          >
            {playbook.headline}
          </div>
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{playbook.focus}</p>
          {showPlaybook && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top actions</p>
              {playbook.topActions.map((a, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="font-black mt-0.5 flex-shrink-0" style={{ color: '#C8006E' }}>{i + 1}.</span>
                  <span className="text-gray-700 leading-snug">{a}</span>
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-3 italic">Example market: {playbook.example}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
