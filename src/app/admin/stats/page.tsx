'use client'

import { useEffect, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts'

// ── Types ─────────────────────────────────────────────────────────────────────

interface DimensionAvg { dimension: string; label: string; avg: number }
interface WeekPoint { week: string; avg: number | null; count: number }
interface BreakdownItem { name: string; count: number }
interface RecentResponse {
  id: string; respondentName: string; respondentCompany: string
  overallScore: number; maturity_level: string; created_at: string
}

interface StatsData {
  totalRespondents: number
  totalResponses: number
  thisWeek: number
  avgScore: number
  scoreDistribution: Record<string, number>
  dimensionAverages: DimensionAvg[]
  weeklyTrend: WeekPoint[]
  liteCount: number
  fullCount: number
  industryBreakdown: BreakdownItem[]
  companySizeBreakdown: BreakdownItem[]
  recentResponses: RecentResponse[]
}

// ── Colour palette ────────────────────────────────────────────────────────────

const BRAND   = '#354E5E'
const ACCENT  = '#E8611A'
const GOLD    = '#F5A820'
const TEAL    = '#2A9D8F'
const SLATE   = '#94A3B8'

const MATURITY_COLOURS: Record<string, string> = {
  Unaware:      '#EF4444',
  Exploring:    '#F97316',
  Experimenting:'#EAB308',
  Scaling:      '#14B8A6',
  Leading:      '#22C55E',
}

const BAR_COLOURS = [ACCENT, GOLD, TEAL, '#8B5CF6', '#06B6D4', '#84CC16', '#F43F5E', '#64748B']

// ── Small helpers ─────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">{children}</h2>
}

function ChartCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-xl p-6 shadow-sm ${className}`}>
      <p className="text-sm font-semibold text-gray-700 mb-4">{title}</p>
      {children}
    </div>
  )
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function ScoreTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-brand text-white text-xs rounded-lg px-3 py-2 shadow-lg">
      <p className="font-semibold">{label}</p>
      <p>Avg score: <strong>{payload[0]?.value ?? '–'}</strong></p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d: StatsData) => {
        // Guard against unexpected API shape (e.g. { error: '...' } from a 4xx/5xx)
        if (!d || typeof d.totalRespondents !== 'number') {
          throw new Error('Unexpected API response shape')
        }
        setData(d)
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load stats')
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="text-sm text-gray-500">Loading stats…</div>
  if (error || !data) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-sm text-red-700">
      <p className="font-semibold mb-1">Failed to load statistics</p>
      <p className="text-red-500">{error ?? 'No data returned from API'}</p>
      <p className="mt-3 text-xs text-red-400">If this is a 401 error, please <a href="/admin/login" className="underline">log in again</a> — the admin session may have expired.</p>
    </div>
  )

  const completionRate = data.totalRespondents > 0
    ? Math.round((data.totalResponses / data.totalRespondents) * 100)
    : 0

  // Maturity distribution for bar chart
  const maturityData = Object.entries(data.scoreDistribution)
    .filter(([, v]) => v > 0)
    .map(([name, count]) => ({ name, count }))

  // Dimension heatmap — worst first, show as horizontal bars
  const dimMax = Math.max(...data.dimensionAverages.map(d => d.avg), 1)

  // Weekly trend — filter null points for display but keep axis labels
  const trendHasData = data.weeklyTrend.some(w => w.avg !== null)

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
        <p className="text-sm text-gray-600 mt-1">Live data across all quiz respondents and responses.</p>
      </div>

      {/* Top KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total respondents" value={data.totalRespondents} />
        <StatCard label="Total responses" value={data.totalResponses} sub={`${completionRate}% completion rate`} />
        <StatCard label="This week" value={data.thisWeek} sub="New respondents" />
        <StatCard label="Avg score" value={`${data.avgScore}/100`} sub="All full responses" />
      </div>

      {/* Quiz type split */}
      <div>
        <SectionTitle>Quiz type split</SectionTitle>
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm text-center">
            <p className="text-3xl font-bold" style={{ color: ACCENT }}>{data.liteCount}</p>
            <p className="text-xs text-gray-600 mt-1 font-medium">Lite (12 questions)</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm text-center">
            <p className="text-3xl font-bold" style={{ color: TEAL }}>{data.fullCount}</p>
            <p className="text-xs text-gray-600 mt-1 font-medium">Full (25 questions)</p>
          </div>
        </div>
      </div>

      {/* Weekly trend + maturity distribution */}
      <div>
        <SectionTitle>Score trends &amp; maturity</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <ChartCard title="Average score per week (last 12 weeks)">
            {trendHasData ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.weeklyTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: SLATE }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: SLATE }} />
                  <Tooltip content={<ScoreTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    stroke={ACCENT}
                    strokeWidth={2.5}
                    dot={{ fill: ACCENT, r: 3 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-12">Not enough data yet</p>
            )}
          </ChartCard>

          <ChartCard title="Maturity level distribution">
            {maturityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={maturityData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: SLATE }} />
                  <YAxis tick={{ fontSize: 11, fill: SLATE }} allowDecimals={false} />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => [v as number, 'Respondents']}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.12)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {maturityData.map((entry) => (
                      <Cell key={entry.name} fill={MATURITY_COLOURS[entry.name] ?? BRAND} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-12">No responses yet</p>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Dimension heatmap */}
      <div>
        <SectionTitle>Dimension scores — where respondents struggle most</SectionTitle>
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-3">
          {data.dimensionAverages.map((d, i) => {
            const pct = Math.round((d.avg / 100) * 100)
            const color = d.avg < 40 ? ACCENT : d.avg < 60 ? GOLD : TEAL
            return (
              <div key={d.dimension} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium text-gray-700 shrink-0">{d.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
                <span className="w-10 text-sm font-semibold text-gray-600 text-right">{d.avg}</span>
                {i === 0 && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Weakest</span>
                )}
              </div>
            )
          })}
          <p className="text-xs text-gray-500 pt-1">Scores out of 100. Sorted worst → best. Red &lt; 40, amber 40–60, green &gt; 60.</p>
        </div>
        {/* invisible use to avoid TS unused var warning */}
        <span className="hidden">{dimMax}</span>
      </div>

      {/* Industry + company size */}
      <div>
        <SectionTitle>Audience breakdown</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <ChartCard title="Top industries">
            {data.industryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={data.industryBreakdown}
                  layout="vertical"
                  margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: SLATE }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: SLATE }} />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => [v as number, 'Respondents']}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.12)' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {data.industryBreakdown.map((_, i) => (
                      <Cell key={i} fill={BAR_COLOURS[i % BAR_COLOURS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-12">No industry data yet</p>
            )}
          </ChartCard>

          <ChartCard title="Company size distribution">
            {data.companySizeBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.companySizeBreakdown} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: SLATE }} />
                  <YAxis tick={{ fontSize: 11, fill: SLATE }} allowDecimals={false} />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => [v as number, 'Respondents']}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.12)' }}
                  />
                  <Bar dataKey="count" fill={BRAND} radius={[4, 4, 0, 0]}>
                    {data.companySizeBreakdown.map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? BRAND : '#4A6880'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-12">No company size data yet</p>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Recent responses */}
      <div>
        <SectionTitle>Recent responses</SectionTitle>
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-5 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-5 py-3">Company</th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-5 py-3">Level</th>
                <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider px-5 py-3">Score</th>
                <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentResponses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-8 text-sm">No responses yet</td>
                </tr>
              ) : data.recentResponses.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-800 font-medium">{r.respondentName || '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{r.respondentCompany || '—'}</td>
                  <td className="px-5 py-3">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${MATURITY_COLOURS[r.maturity_level] ?? SLATE}20`,
                        color: MATURITY_COLOURS[r.maturity_level] ?? SLATE,
                      }}
                    >
                      {r.maturity_level}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-gray-800">{r.overallScore}</td>
                  <td className="px-5 py-3 text-right text-gray-500 text-xs">
                    {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

// Suppress recharts prop-types noise
Legend.displayName = 'Legend'
