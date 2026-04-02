'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { formatLapTime } from '@/products/hot_lap/data'

const BLACK  = '#0D0D0D'
const DARK   = '#111118'
const CARD   = '#1A1A26'
const BORDER = '#2A2A3A'
const RED    = '#E10600'
const WHITE  = '#FFFFFF'
const MUTED  = '#888899'
const BODY   = '#C0C0D0'
const AMBER  = '#FFD700'
const PURPLE = '#9B00FF'

interface LeaderEntry { id: string; name: string; lap_time: string; total_ms: number; created_at: string }

function Leaderboard() {
  const [rows, setRows] = useState<LeaderEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/hot_lap/leaderboard')
      .then(r => r.json())
      .then(d => { setRows(d.rows ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ fontSize: 13, color: MUTED }}>Loading leaderboard…</p>
  if (!rows.length) return <p style={{ fontSize: 13, color: MUTED }}>No laps set yet. Be first.</p>

  return (
    <div>
      {rows.slice(0, 10).map((r, i) => {
        const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32']
        const isTop3 = i < 3
        const colour = i === 0 ? PURPLE : isTop3 ? AMBER : MUTED
        return (
          <div key={r.id} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '10px 0', borderBottom: `1px solid ${BORDER}`,
          }}>
            <span style={{ width: 24, fontSize: 14, fontWeight: 800, color: i === 0 ? PURPLE : MUTED, textAlign: 'right', flexShrink: 0 }}>
              {i === 0 ? '🟣' : i === 1 ? '🟡' : i === 2 ? '🟠' : `${i + 1}`}
            </span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: WHITE }}>{r.name}</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: colour, fontFamily: 'monospace', letterSpacing: '-0.01em' }}>
              {r.lap_time}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function HotLapLandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: BLACK, fontFamily: 'Inter, system-ui, sans-serif', color: WHITE }}>

      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '0 24px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/vrooooom" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: WHITE, fontStyle: 'italic' }}>V</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: WHITE, fontStyle: 'italic' }}>Vrooooom</span>
          </Link>
          <span style={{ fontSize: 13, fontWeight: 700, color: RED, letterSpacing: '0.06em' }}>🏁 HOT LAP</span>
        </div>
      </nav>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '48px 24px 80px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40 }}>

        {/* Left: hero + rules */}
        <div>
          <div style={{ marginBottom: 40 }}>
            <h1 style={{
              fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, fontStyle: 'italic',
              letterSpacing: '-0.04em', lineHeight: 0.95, marginBottom: 20,
            }}>
              <span style={{ color: RED }}>Hot</span> Lap
            </h1>
            <p style={{ fontSize: 18, color: BODY, lineHeight: 1.7, maxWidth: 500, marginBottom: 32 }}>
              10 F1 questions. You're against the clock. Every second you spend thinking is added to your lap time.
              Answer fast. Answer right. Set the track record.
            </p>

            <Link
              href="/hot_lap/play"
              style={{
                display: 'inline-block',
                background: RED, color: WHITE,
                fontSize: 18, fontWeight: 900, fontStyle: 'italic',
                padding: '18px 48px', borderRadius: 10, textDecoration: 'none',
                letterSpacing: '-0.02em',
              }}
            >
              Start lap →
            </Link>
            <p style={{ fontSize: 12, color: MUTED, marginTop: 12 }}>
              Free · 3–5 minutes · No app needed
            </p>
          </div>

          {/* Rules */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '28px 24px', marginBottom: 32 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: WHITE, marginBottom: 16, letterSpacing: '-0.01em' }}>How it works</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { icon: '⏱', title: 'Time is score', body: 'Your lap time = total seconds spent. Faster = better.' },
                { icon: '⚠️', title: '+5s penalty', body: 'Wrong answer or timeout adds 5 seconds to that sector.' },
                { icon: '🎯', title: '3 sectors', body: 'S1 easy · S2 medium · S3 hard. Difficulty increases each sector.' },
                { icon: '🟣', title: 'Purple = record', body: 'Fastest lap ever. Yellow = your personal best this session.' },
              ].map(r => (
                <div key={r.title}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{r.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: WHITE, marginBottom: 4 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{r.body}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sector preview */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 24px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>What your lap looks like</p>
            <div style={{ display: 'flex', gap: 1 }}>
              {[
                { label: 'SECTOR 1', qs: 'Q1–Q3', diff: 'Easy', color: '#9B00FF', time: '0:22.1', note: 'Track record' },
                { label: 'SECTOR 2', qs: 'Q4–Q7', diff: 'Medium', color: AMBER, time: '0:38.6', note: 'Personal best' },
                { label: 'SECTOR 3', qs: 'Q8–Q10', diff: 'Hard', color: '#555', time: '0:47.3', note: '' },
              ].map((s, i) => (
                <div key={s.label} style={{
                  flex: 1, background: '#0D0D0D',
                  borderRadius: i === 0 ? '8px 0 0 8px' : i === 2 ? '0 8px 8px 0' : 0,
                  padding: '12px 12px', borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: MUTED, marginBottom: 8 }}>{s.qs} · {s.diff}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: s.color, fontFamily: 'monospace' }}>{s.time}</div>
                  {s.note && <div style={{ fontSize: 10, color: s.color, marginTop: 2 }}>{s.note}</div>}
                </div>
              ))}
              <div style={{ width: 2, background: BORDER }} />
              <div style={{ background: '#0D0D0D', borderRadius: '0 8px 8px 0', padding: '12px 12px', minWidth: 80 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: '0.08em', marginBottom: 4 }}>LAP</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: AMBER, fontFamily: 'monospace' }}>1:48.0</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: leaderboard */}
        <div style={{ position: 'sticky', top: 24, alignSelf: 'start' }}>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ height: 3, background: `linear-gradient(90deg, ${PURPLE}, ${RED})` }} />
            <div style={{ padding: '20px 20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: WHITE }}>🏁 Track Records</h3>
                <span style={{ fontSize: 11, color: MUTED }}>All time</span>
              </div>
              <Suspense fallback={<p style={{ fontSize: 13, color: MUTED }}>Loading…</p>}>
                <Leaderboard />
              </Suspense>
              <div style={{ marginTop: 20 }}>
                <Link
                  href="/hot_lap/play"
                  style={{
                    display: 'block', textAlign: 'center',
                    background: RED, color: WHITE,
                    fontSize: 14, fontWeight: 800, fontStyle: 'italic',
                    padding: '12px', borderRadius: 8, textDecoration: 'none',
                  }}
                >
                  Challenge the record →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
