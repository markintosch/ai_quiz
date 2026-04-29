'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────

interface LapRow {
  id: string
  name: string
  email: string
  lap_time: string
  total_ms: number
  created_at: string
}

interface ArenaSession {
  id: string
  join_code: string
  host_name: string
  status: string
  question_count: number
  time_per_q: number
  started_at: string | null
  created_at: string
  company_id?: string | null
  company_name?: string | null
  company_slug?: string | null
  participant_count?: number
}

// Companies that have a dedicated player UI built for them.
// When the session is tagged to one of these, we surface the
// company-specific player URL instead of the default /arena/[code].
const COMPANY_PLAYER_URLS: Record<string, (code: string) => string> = {
  proserve: code => `/proserve/arena/${code}`,
}

function playerUrlForSession(s: ArenaSession): string {
  const slug = s.company_slug
  if (slug && COMPANY_PLAYER_URLS[slug]) return COMPANY_PLAYER_URLS[slug](s.join_code)
  return `/arena/${s.join_code}`
}

interface Sysdig555Row {
  id: string
  name: string
  email: string
  time_str: string
  total_ms: number
  correct_count: number
  created_at: string
}

interface SysdigScanRow {
  id: string
  name: string
  email: string
  overall_score: number
  tier: string
  opt_newsletter: boolean
  opt_expert: boolean
  opt_download: boolean
  created_at: string
}

type Tab = 'hotlap' | 'arena' | 'sysdig555' | 'sysdidscan'

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusPill(status: string) {
  const map: Record<string, { bg: string; text: string }> = {
    lobby:     { bg: '#FEF9C3', text: '#854D0E' },
    active:    { bg: '#DCFCE7', text: '#166534' },
    completed: { bg: '#F1F5F9', text: '#475569' },
    cancelled: { bg: '#FEE2E2', text: '#991B1B' },
  }
  const s = map[status] ?? { bg: '#F1F5F9', text: '#94A3B8' }
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 100, background: s.bg, color: s.text, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {status}
    </span>
  )
}

function tierPill(tier: string) {
  const map: Record<string, { bg: string; text: string }> = {
    'Operationally Mature':   { bg: '#DCFCE7', text: '#166534' },
    'Operationally Capable':  { bg: '#DBEAFE', text: '#1E40AF' },
    'Building Foundations':   { bg: '#FEF9C3', text: '#854D0E' },
    'Flying Blind':           { bg: '#FEE2E2', text: '#991B1B' },
  }
  const s = map[tier] ?? { bg: '#F1F5F9', text: '#94A3B8' }
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 100, background: s.bg, color: s.text }}>
      {tier}
    </span>
  )
}

function optDot(active: boolean) {
  return (
    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: active ? '#22C55E' : '#E2E8F0' }} />
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('nl-NL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function DeleteBtn({ onDelete, label }: { onDelete: () => void; label: string }) {
  return (
    <button onClick={onDelete} style={{ fontSize: 12, color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
      {label}
    </button>
  )
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
      <p style={{ fontSize: 32, margin: '0 0 8px' }}>{icon}</p>
      <p style={{ fontSize: 15, color: '#64748B', margin: 0 }}>{text}</p>
    </div>
  )
}

// ── Tab: Hot Lap ──────────────────────────────────────────────────────────────

function HotLapTab() {
  const [rows, setRows] = useState<LapRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/games/hot-lap')
      .then(r => r.json())
      .then((d: LapRow[]) => { setRows(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const del = async (id: string, name: string) => {
    if (!confirm(`Lap van "${name}" verwijderen?`)) return
    setDeleting(id)
    await fetch('/api/admin/games/hot-lap', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setDeleting(null)
    load()
  }

  return (
    <div>
      <TabHeader title="🏎️ Hot Lap Leaderboard" subtitle={`${rows.length} laps`} onRefresh={load} />
      {loading ? <p style={{ color: '#94A3B8', fontSize: 14 }}>Laden…</p> : rows.length === 0 ? (
        <EmptyState icon="🏁" text="Nog geen laps gezet." />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                {['P', 'Naam', 'E-mail', 'Lap tijd', 'Datum', ''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9', background: i === 0 ? '#F5F3FF' : 'transparent' }}>
                  <td style={{ ...tdStyle, fontWeight: 800, color: i === 0 ? '#7C3AED' : i === 1 ? '#6B7280' : i === 2 ? '#92400E' : '#94A3B8' }}>P{i + 1}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#0F172A' }}>{r.name}</td>
                  <td style={{ ...tdStyle, color: '#475569' }}>{r.email}</td>
                  <td style={{ ...tdStyle, fontWeight: 700, fontFamily: 'monospace', color: i === 0 ? '#7C3AED' : '#0F172A' }}>{r.lap_time}</td>
                  <td style={{ ...tdStyle, color: '#64748B', whiteSpace: 'nowrap' }}>{fmtDate(r.created_at)}</td>
                  <td style={tdStyle}>
                    <DeleteBtn label={deleting === r.id ? '…' : 'Verwijder'} onDelete={() => del(r.id, r.name)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Tab: Arena ────────────────────────────────────────────────────────────────

function ArenaTab() {
  const [sessions, setSessions] = useState<ArenaSession[]>([])
  const [loading, setLoading] = useState(true)
  const [companyFilter, setCompanyFilter] = useState<string>('all')

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/arena/sessions')
      .then(r => r.json())
      .then((d: ArenaSession[] | { sessions?: ArenaSession[] }) => {
        setSessions(Array.isArray(d) ? d : (d as { sessions?: ArenaSession[] }).sessions ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // Build company filter options from current sessions
  const companyOptions = (() => {
    const map = new Map<string, string>()
    map.set('__none__', '— Geen koppeling')
    for (const s of sessions) {
      if (s.company_id && s.company_name) map.set(s.company_id, s.company_name)
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  })()

  const filtered = sessions.filter(s => {
    if (companyFilter === 'all') return true
    if (companyFilter === '__none__') return !s.company_id
    return s.company_id === companyFilter
  })

  function copyToClipboard(text: string) {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return
    navigator.clipboard.writeText(text).catch(() => { /* ignore */ })
  }

  return (
    <div>
      <TabHeader title="🏟️ Arena Sessies" subtitle={`${filtered.length} van ${sessions.length} sessies`} onRefresh={load}>
        <Link href="/admin/arena/new" style={{ fontSize: 13, padding: '7px 16px', borderRadius: 8, background: '#354E5E', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
          + Nieuwe sessie
        </Link>
      </TabHeader>

      {/* Company filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14, fontSize: 12 }}>
        <span style={{ color: '#64748B', fontWeight: 600 }}>Filter op bedrijf:</span>
        <button
          onClick={() => setCompanyFilter('all')}
          style={filterPill(companyFilter === 'all')}
        >
          Alle ({sessions.length})
        </button>
        {companyOptions.map(([id, name]) => {
          const count = sessions.filter(s => id === '__none__' ? !s.company_id : s.company_id === id).length
          return (
            <button
              key={id}
              onClick={() => setCompanyFilter(id)}
              style={filterPill(companyFilter === id)}
            >
              {name} ({count})
            </button>
          )
        })}
      </div>

      {loading ? <p style={{ color: '#94A3B8', fontSize: 14 }}>Laden…</p> : filtered.length === 0 ? (
        <EmptyState icon="🏟️" text={companyFilter === 'all' ? 'Nog geen arena-sessies aangemaakt.' : 'Geen sessies voor deze filter.'} />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                {['Code', 'Bedrijf', 'Host', 'Status', 'Vragen', 'Deeln.', 'Aangemaakt', 'Speel-URL', ''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const playerUrl = playerUrlForSession(s)
                const isThemed   = !!s.company_slug && !!COMPANY_PLAYER_URLS[s.company_slug]
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 800, letterSpacing: '0.1em', color: '#0F172A' }}>{s.join_code}</td>
                    <td style={tdStyle}>
                      {s.company_name
                        ? <span style={{ fontWeight: 700, color: '#0F172A' }}>{s.company_name}</span>
                        : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>—</span>}
                    </td>
                    <td style={{ ...tdStyle, color: '#475569' }}>{s.host_name}</td>
                    <td style={tdStyle}>{statusPill(s.status)}</td>
                    <td style={{ ...tdStyle, color: '#475569' }}>{s.question_count}</td>
                    <td style={{ ...tdStyle, color: '#475569' }}>{s.participant_count ?? '—'}</td>
                    <td style={{ ...tdStyle, color: '#64748B', whiteSpace: 'nowrap' }}>{fmtDate(s.created_at)}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <a
                          href={playerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 12, color: isThemed ? '#1F8EFF' : '#354E5E', fontWeight: 600, textDecoration: 'none' }}
                          title={`Open ${playerUrl}`}
                        >
                          ↗ {isThemed ? 'Themed' : 'Default'}
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(window.location.origin + playerUrl)}
                          style={{
                            fontSize: 11, color: '#94A3B8', background: 'none', border: '1px solid #E2E8F0',
                            borderRadius: 4, padding: '2px 6px', cursor: 'pointer',
                          }}
                          title="Kopieer absolute URL"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <Link href={`/admin/arena/${s.join_code}`} style={{ fontSize: 12, color: '#354E5E', fontWeight: 600, textDecoration: 'none' }}>Bekijk →</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function filterPill(active: boolean) {
  return {
    fontSize: 11, fontWeight: 700,
    padding: '4px 12px', borderRadius: 100,
    background: active ? '#354E5E' : '#fff',
    color:      active ? '#fff'    : '#475569',
    border:     `1px solid ${active ? '#354E5E' : '#E2E8F0'}`,
    cursor: 'pointer',
  } as const
}

// ── Tab: Sysdig 555 Time Trial ────────────────────────────────────────────────

function Sysdig555Tab() {
  const [rows, setRows] = useState<Sysdig555Row[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/games/sysdig-555')
      .then(r => r.json())
      .then((d: Sysdig555Row[]) => { setRows(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const del = async (id: string, name: string) => {
    if (!confirm(`Score van "${name}" verwijderen?`)) return
    setDeleting(id)
    await fetch('/api/admin/games/sysdig-555', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setDeleting(null)
    load()
  }

  return (
    <div>
      <TabHeader title="⏱️ Sysdig 555 Time Trial" subtitle={`${rows.length} runs`} onRefresh={load} />
      {loading ? <p style={{ color: '#94A3B8', fontSize: 14 }}>Laden…</p> : rows.length === 0 ? (
        <EmptyState icon="⏱️" text="Nog geen 555 Time Trial runs." />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                {['#', 'Naam', 'E-mail', 'Tijd', 'Score', 'Datum', ''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9', background: i === 0 ? '#F0FDF4' : 'transparent' }}>
                  <td style={{ ...tdStyle, fontWeight: 800, color: i === 0 ? '#166534' : '#94A3B8' }}>#{i + 1}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#0F172A' }}>{r.name}</td>
                  <td style={{ ...tdStyle, color: '#475569' }}>{r.email}</td>
                  <td style={{ ...tdStyle, fontWeight: 700, fontFamily: 'monospace', color: i === 0 ? '#16A34A' : '#0F172A' }}>{r.time_str}</td>
                  <td style={{ ...tdStyle, color: r.correct_count >= 9 ? '#16A34A' : r.correct_count >= 7 ? '#B45309' : '#DC2626', fontWeight: 700 }}>{r.correct_count}/10</td>
                  <td style={{ ...tdStyle, color: '#64748B', whiteSpace: 'nowrap' }}>{fmtDate(r.created_at)}</td>
                  <td style={tdStyle}>
                    <DeleteBtn label={deleting === r.id ? '…' : 'Verwijder'} onDelete={() => del(r.id, r.name)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Tab: Sysdig Scan ──────────────────────────────────────────────────────────

function SysdigScanTab() {
  const [rows, setRows] = useState<SysdigScanRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/games/sysdig-scan')
      .then(r => r.json())
      .then((d: SysdigScanRow[]) => { setRows(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const del = async (id: string, name: string) => {
    if (!confirm(`Assessment van "${name}" verwijderen?`)) return
    setDeleting(id)
    await fetch('/api/admin/games/sysdig-scan', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setDeleting(null)
    load()
  }

  return (
    <div>
      <TabHeader title="🔍 Sysdig 555 Scan" subtitle={`${rows.length} assessments`} onRefresh={load} />
      {loading ? <p style={{ color: '#94A3B8', fontSize: 14 }}>Laden…</p> : rows.length === 0 ? (
        <EmptyState icon="🔍" text="Nog geen Sysdig Scan assessments." />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                {['Naam', 'E-mail', 'Score', 'Tier', 'NL', 'Expert', 'DL', 'Datum', ''].map(h => (
                  <th key={h} style={thStyle} title={h === 'NL' ? 'Newsletter' : h === 'DL' ? 'Download' : undefined}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#0F172A' }}>{r.name}</td>
                  <td style={{ ...tdStyle, color: '#475569' }}>{r.email}</td>
                  <td style={{ ...tdStyle, fontWeight: 700, fontFamily: 'monospace', color: r.overall_score >= 70 ? '#16A34A' : r.overall_score >= 40 ? '#B45309' : '#DC2626' }}>
                    {r.overall_score}/100
                  </td>
                  <td style={tdStyle}>{tierPill(r.tier)}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{optDot(r.opt_newsletter)}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{optDot(r.opt_expert)}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{optDot(r.opt_download)}</td>
                  <td style={{ ...tdStyle, color: '#64748B', whiteSpace: 'nowrap' }}>{fmtDate(r.created_at)}</td>
                  <td style={tdStyle}>
                    <DeleteBtn label={deleting === r.id ? '…' : 'Verwijder'} onDelete={() => del(r.id, r.name)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '8px 12px',
  fontSize: 11, fontWeight: 700, color: '#64748B',
  textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = { padding: '10px 12px' }

function TabHeader({ title, subtitle, onRefresh, children }: {
  title: string
  subtitle: string
  onRefresh: () => void
  children?: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: 0 }}>{title}</h2>
        <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>{subtitle}</p>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button onClick={onRefresh} style={{ fontSize: 13, padding: '7px 16px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', color: '#374151', fontWeight: 600 }}>
          ↻ Vernieuwen
        </button>
        {children}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: 'hotlap',     label: '🏎️ Hot Lap' },
  { id: 'arena',      label: '🏟️ Arena' },
  { id: 'sysdig555',  label: '⏱️ 555 Time Trial' },
  { id: 'sysdidscan', label: '🔍 555 Scan' },
]

export default function GamesAdminPage() {
  const [tab, setTab] = useState<Tab>('hotlap')

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 700,
    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
    background: tab === t ? '#354E5E' : 'transparent',
    color: tab === t ? '#fff' : '#64748B',
    whiteSpace: 'nowrap',
  })

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>🎮 Games Admin</h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>Hot Lap · Arena · Sysdig 555 Time Trial · Sysdig 555 Scan</p>
      </div>

      <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 32, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} style={tabStyle(t.id)} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === 'hotlap'     && <HotLapTab />}
      {tab === 'arena'      && <ArenaTab />}
      {tab === 'sysdig555'  && <Sysdig555Tab />}
      {tab === 'sysdidscan' && <SysdigScanTab />}
    </div>
  )
}
