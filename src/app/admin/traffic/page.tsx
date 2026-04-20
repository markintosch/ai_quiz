'use client'

import { useEffect, useMemo, useState } from 'react'

interface TrafficRow { key: string; sessions: number; users: number; engaged: number }
interface EventRow   { event: string; count: number }

interface TrafficPayload {
  configured: boolean
  range: { startDate: string; endDate: string }
  totals: { sessions: number; users: number; engagedSessions: number }
  byPath:    TrafficRow[]
  bySource:  TrafficRow[]
  byCountry: TrafficRow[]
  ctaEvents: EventRow[]
  error?: string
}

const RANGE_OPTIONS = [
  { label: 'Last 7 days',  start: '7daysAgo',   end: 'yesterday' },
  { label: 'Last 28 days', start: '28daysAgo',  end: 'yesterday' },
  { label: 'Last 90 days', start: '90daysAgo',  end: 'yesterday' },
]

const MARK_PATHS = ['/mentor', '/insights', '/werk', '/thecrew']

function Pill({ children, tone }: { children: React.ReactNode; tone?: 'accent' | 'muted' }) {
  const colour = tone === 'accent' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'
  return <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${colour}`}>{children}</span>
}

function isMarkPath(path: string): boolean {
  return MARK_PATHS.some(p => path === p || path.startsWith(p + '/') || path.startsWith(p + '?'))
}

export default function TrafficPage() {
  const [range, setRange] = useState(RANGE_OPTIONS[1])
  const [data, setData]   = useState<TrafficPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr]     = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErr(null)
    fetch(`/api/admin/traffic?start=${range.start}&end=${range.end}`, { cache: 'no-store' })
      .then(r => r.json())
      .then((payload: TrafficPayload) => {
        if (cancelled) return
        setData(payload)
        if (payload.error) setErr(payload.error)
      })
      .catch(e => !cancelled && setErr(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [range])

  const markSessions = useMemo(() => {
    if (!data) return 0
    return data.byPath.filter(r => isMarkPath(r.key)).reduce((a, r) => a + r.sessions, 0)
  }, [data])

  const engagementRate = data && data.totals.sessions > 0
    ? Math.round((data.totals.engagedSessions / data.totals.sessions) * 100)
    : 0

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Traffic</h1>
          <p className="text-sm text-gray-500">GA4 data for <span className="font-mono">markdekock.com</span> & assessment properties</p>
        </div>
        <div className="flex gap-2">
          {RANGE_OPTIONS.map(opt => (
            <button
              key={opt.label}
              onClick={() => setRange(opt)}
              className={`text-xs font-semibold px-3 py-2 rounded-lg border ${opt.start === range.start ? 'bg-brand text-white border-brand' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </header>

      {loading && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 text-sm text-gray-500">Loading…</div>
      )}

      {!loading && data && !data.configured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-3">
          <p className="text-sm font-semibold text-amber-900">GA4 Data API not yet configured</p>
          <p className="text-sm text-amber-900">
            Set these env vars in Vercel to activate the dashboard:
          </p>
          <ul className="list-disc pl-5 text-sm text-amber-900 space-y-1 font-mono">
            <li>GA4_PROPERTY_ID</li>
            <li>GA4_SERVICE_ACCOUNT_EMAIL</li>
            <li>GA4_SERVICE_ACCOUNT_PRIVATE_KEY</li>
          </ul>
          <p className="text-xs text-amber-800">
            Create a service account in Google Cloud, generate a JSON key, then grant the email
            &quot;Viewer&quot; access on the GA4 property (Admin → Property Access Management).
          </p>
        </div>
      )}

      {!loading && err && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
          {err}
        </div>
      )}

      {!loading && data && data.configured && !err && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="Sessions"          value={data.totals.sessions.toLocaleString()} />
            <KpiCard label="Users"             value={data.totals.users.toLocaleString()} />
            <KpiCard label="Engaged sessions"  value={data.totals.engagedSessions.toLocaleString()} sub={`${engagementRate}% rate`} />
            <KpiCard label="markdekock.com sessions" value={markSessions.toLocaleString()} sub="across /mentor, /insights, /werk, /thecrew" />
          </div>

          {/* Top pages */}
          <Card title="Top pages">
            <Table
              headers={['Path', 'Sessions', 'Users', 'Engaged']}
              rows={data.byPath.slice(0, 15).map(r => [
                <span key="p" className="flex items-center gap-2">
                  <code className="text-xs">{r.key || '(unknown)'}</code>
                  {isMarkPath(r.key) && <Pill tone="accent">markdekock</Pill>}
                </span>,
                r.sessions.toLocaleString(),
                r.users.toLocaleString(),
                r.engaged.toLocaleString(),
              ])}
            />
          </Card>

          {/* Sources */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card title="Traffic by channel">
              <Table
                headers={['Channel', 'Sessions', 'Engaged']}
                rows={data.bySource.map(r => [r.key || '(direct)', r.sessions.toLocaleString(), r.engaged.toLocaleString()])}
              />
            </Card>
            <Card title="Top countries">
              <Table
                headers={['Country', 'Sessions', 'Users']}
                rows={data.byCountry.map(r => [r.key, r.sessions.toLocaleString(), r.users.toLocaleString()])}
              />
            </Card>
          </div>

          {/* CTA events */}
          <Card title="Tracked events (mentor CTAs, Calendly, page_view)">
            <Table
              headers={['Event', 'Count']}
              rows={data.ctaEvents.map(e => [<code key="e" className="text-xs">{e.event}</code>, e.count.toLocaleString()])}
            />
            <p className="mt-4 text-xs text-gray-500">
              Events instrumented in this codebase:{' '}
              <code>mentor_hero_calendly_clicked</code>,{' '}
              <code>mentor_hero_ai_scan_clicked</code>,{' '}
              <code>mentor_spots_calendly_clicked</code>,{' '}
              <code>mentor_spots_ai_scan_clicked</code>,{' '}
              <code>mentor_proof_projects_clicked</code>,{' '}
              <code>mentor_insights_post_clicked</code>,{' '}
              <code>mentor_insights_index_clicked</code>,{' '}
              <code>mentor_share_linkedin_clicked</code>,{' '}
              <code>mentor_share_email_clicked</code>,{' '}
              <code>mentor_footer_aanpak_clicked</code>,{' '}
              <code>mentor_footer_projects_clicked</code>,{' '}
              <code>mentor_footer_insights_clicked</code>,{' '}
              <code>mentor_footer_crew_clicked</code>.
            </p>
          </Card>
        </>
      )}

      <Card title="External tools">
        <ul className="text-sm space-y-2">
          <li>
            <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Google Search Console →
            </a>{' '}
            <span className="text-gray-500">impressions, CTR, top queries, sitemap status</span>
          </li>
          <li>
            <a href="https://www.linkedin.com/post-inspector/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              LinkedIn Post Inspector →
            </a>{' '}
            <span className="text-gray-500">validate OG images / refresh cache</span>
          </li>
          <li>
            <a href="https://cards-dev.twitter.com/validator" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              X Card Validator →
            </a>
          </li>
          <li>
            <a href="https://validator.w3.org/feed/check.cgi?url=https%3A%2F%2Fmarkdekock.com%2Ffeed.xml" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Validate RSS feed →
            </a>
          </li>
          <li>
            <a href="https://search.google.com/test/rich-results?url=https%3A%2F%2Fmarkdekock.com%2Fmentor" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Rich Results Test (Mentor) →
            </a>
          </li>
        </ul>
      </Card>
    </div>
  )
}

// ── UI primitives ────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
      <p className="text-sm font-semibold text-gray-700 mb-4">{title}</p>
      {children}
    </div>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500 italic">No data.</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {headers.map(h => (
              <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2 pr-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-50 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-4 text-gray-800">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
