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
  company_name?: string
  participant_count?: number
}

type Tab = 'hotlap' | 'arena'

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

function fmt(ms: number) {
  const m = Math.floor(ms / 60000)
  const s = ((ms % 60000) / 1000).toFixed(3)
  return `${m}:${s.padStart(6, '0')}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('nl-NL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// ── Hot Lap Tab ───────────────────────────────────────────────────────────────

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

  const deleteLap = async (id: string, name: string) => {
    if (!confirm(`Lap van "${name}" verwijderen?`)) return
    setDeleting(id)
    await fetch('/api/admin/games/hot-lap', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setDeleting(null)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: 0 }}>🏎️ Hot Lap Leaderboard</h2>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>{rows.length} laps opgeslagen</p>
        </div>
        <button onClick={load} style={{ fontSize: 13, padding: '7px 16px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', color: '#374151', fontWeight: 600 }}>
          ↻ Vernieuwen
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#94A3B8', fontSize: 14 }}>Laden…</p>
      ) : rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>🏁</p>
          <p style={{ fontSize: 15, color: '#64748B', margin: 0 }}>Nog geen laps gezet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                {['P', 'Naam', 'E-mail', 'Lap tijd', 'Datum', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9', background: i === 0 ? '#F5F3FF' : 'transparent' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 800, color: i === 0 ? '#7C3AED' : i === 1 ? '#6B7280' : i === 2 ? '#92400E' : '#94A3B8' }}>
                    P{i + 1}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0F172A' }}>{r.name}</td>
                  <td style={{ padding: '10px 12px', color: '#475569' }}>{r.email}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, fontFamily: 'monospace', color: i === 0 ? '#7C3AED' : '#0F172A' }}>
                    {r.lap_time}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#64748B', whiteSpace: 'nowrap' }}>{fmtDate(r.created_at)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <button
                      onClick={() => deleteLap(r.id, r.name)}
                      disabled={deleting === r.id}
                      style={{ fontSize: 12, color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: deleting === r.id ? 0.5 : 1 }}
                    >
                      Verwijder
                    </button>
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

// ── Arena Tab ─────────────────────────────────────────────────────────────────

function ArenaTab() {
  const [sessions, setSessions] = useState<ArenaSession[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/arena/sessions')
      .then(r => r.json())
      .then((d: ArenaSession[] | { sessions?: ArenaSession[] }) => {
        const arr = Array.isArray(d) ? d : (d as { sessions?: ArenaSession[] }).sessions ?? []
        setSessions(arr)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: 0 }}>🏟️ Arena Sessies</h2>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>{sessions.length} sessies</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={load} style={{ fontSize: 13, padding: '7px 16px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', color: '#374151', fontWeight: 600 }}>
            ↻ Vernieuwen
          </button>
          <Link href="/admin/arena/new" style={{ fontSize: 13, padding: '7px 16px', borderRadius: 8, background: '#354E5E', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
            + Nieuwe sessie
          </Link>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#94A3B8', fontSize: 14 }}>Laden…</p>
      ) : sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>🏟️</p>
          <p style={{ fontSize: 15, color: '#64748B', margin: 0 }}>Nog geen arena-sessies aangemaakt.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                {['Code', 'Host', 'Status', 'Vragen', 'Deeln.', 'Aangemaakt', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 800, color: '#0F172A', letterSpacing: '0.1em' }}>{s.join_code}</td>
                  <td style={{ padding: '10px 12px', color: '#0F172A', fontWeight: 600 }}>{s.host_name}</td>
                  <td style={{ padding: '10px 12px' }}>{statusPill(s.status)}</td>
                  <td style={{ padding: '10px 12px', color: '#475569' }}>{s.question_count}</td>
                  <td style={{ padding: '10px 12px', color: '#475569' }}>{s.participant_count ?? '—'}</td>
                  <td style={{ padding: '10px 12px', color: '#64748B', whiteSpace: 'nowrap' }}>{fmtDate(s.created_at)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <Link href={`/admin/arena/${s.id}`} style={{ fontSize: 12, color: '#354E5E', fontWeight: 600, textDecoration: 'none' }}>
                      Bekijk →
                    </Link>
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GamesAdminPage() {
  const [tab, setTab] = useState<Tab>('hotlap')

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
    background: tab === t ? '#354E5E' : 'transparent',
    color: tab === t ? '#fff' : '#64748B',
  })

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>🎮 Games Admin</h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>Hot Lap leaderboard · Arena sessies</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 32 }}>
        <button style={tabStyle('hotlap')} onClick={() => setTab('hotlap')}>🏎️ Hot Lap</button>
        <button style={tabStyle('arena')} onClick={() => setTab('arena')}>🏟️ Arena</button>
      </div>

      {tab === 'hotlap' ? <HotLapTab /> : <ArenaTab />}
    </div>
  )
}
