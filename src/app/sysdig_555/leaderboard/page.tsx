'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ── Brand tokens ───────────────────────────────────────────────────────────────
const DARK   = '#0B0F1A'
const CARD   = '#161D2E'
const BORDER = '#1E2D40'
const TEAL   = '#00C58E'
const WHITE  = '#FFFFFF'
const MUTED  = '#8B9EB0'
const BODY   = '#C8D6E5'
const AMBER  = '#F59E0B'
const RED    = '#EF4444'

interface LeaderboardRow {
  id:            string
  name:          string
  time_str:      string
  total_ms:      number
  correct_count: number
  created_at:    string
}

const MEDAL = ['🥇', '🥈', '🥉']

function rankColour(rank: number): string {
  if (rank === 1) return TEAL
  if (rank === 2) return '#C0C0C0'
  if (rank === 3) return AMBER
  return MUTED
}

export default function Sysdig555LeaderboardPage() {
  const [rows,    setRows]    = useState<LeaderboardRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sysdig_555/leaderboard')
      .then(r => r.json())
      .then(data => { setRows(data.rows ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: DARK,
      fontFamily: 'Inter, system-ui, sans-serif', color: WHITE,
    }}>

      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '0 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/sysdig_555" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: DARK }}>S</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: MUTED }}>555 Time Trial</span>
          </Link>
          <Link href="/sysdig_555/play" style={{
            background: TEAL, color: DARK,
            fontSize: 13, fontWeight: 900,
            padding: '8px 20px', borderRadius: 8, textDecoration: 'none',
          }}>
            Play →
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: MUTED, letterSpacing: '0.15em', marginBottom: 12 }}>
            SYSDIG 555 TIME TRIAL
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            Leaderboard
          </h1>
          <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
            Fastest response times. Can you detect faster?
          </p>
        </div>

        {/* Table */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 32 }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${TEAL}, #3B82F6)` }} />

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: MUTED }}>
              Loading leaderboard…
            </div>
          ) : rows.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🕐</div>
              <p style={{ color: MUTED, margin: 0 }}>No times posted yet. Be the first!</p>
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '48px 1fr 120px 60px',
                padding: '12px 20px',
                borderBottom: `1px solid ${BORDER}`,
                fontSize: 10, fontWeight: 700, color: MUTED,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                <span>#</span>
                <span>Name</span>
                <span style={{ textAlign: 'right' }}>Time</span>
                <span style={{ textAlign: 'right' }}>Score</span>
              </div>

              {rows.map((row, i) => {
                const rank = i + 1
                return (
                  <div key={row.id} style={{
                    display: 'grid', gridTemplateColumns: '48px 1fr 120px 60px',
                    padding: '16px 20px',
                    borderBottom: i < rows.length - 1 ? `1px solid ${BORDER}` : 'none',
                    background: rank === 1 ? `${TEAL}08` : 'transparent',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: rank <= 3 ? 20 : 14, fontWeight: 900, color: rankColour(rank) }}>
                      {rank <= 3 ? MEDAL[rank - 1] : `${rank}`}
                    </span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: rank === 1 ? TEAL : WHITE }}>
                        {row.name}
                      </div>
                      <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                        {new Date(row.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{
                      textAlign: 'right',
                      fontSize: 18, fontWeight: 900, fontFamily: 'monospace',
                      color: rankColour(rank),
                    }}>
                      {row.time_str}
                    </div>
                    <div style={{
                      textAlign: 'right',
                      fontSize: 13, fontWeight: 700,
                      color: row.correct_count >= 9 ? TEAL : row.correct_count >= 7 ? AMBER : RED,
                    }}>
                      {row.correct_count}/10
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link href="/sysdig_555/play" style={{
            display: 'inline-block',
            background: TEAL, color: DARK,
            fontSize: 16, fontWeight: 900,
            padding: '16px 40px', borderRadius: 12, textDecoration: 'none',
          }}>
            Beat the leaderboard →
          </Link>
          <div style={{ marginTop: 16 }}>
            <Link href="/sysdig_555" style={{ fontSize: 13, color: MUTED, textDecoration: 'underline' }}>
              ← Back to 555 games
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
