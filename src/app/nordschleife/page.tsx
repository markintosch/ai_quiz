'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { FREE_ATTEMPTS, FREE_STORAGE_KEY, PAID_BUNDLE_ATTEMPTS, PAID_BUNDLE_PRICE_EUR } from '@/products/nordschleife/data'

// ── Brand tokens (Green Hell / Eifel forest) ───────────────────────────────────
const BG      = '#0B1A0E'
const DARK    = '#0F2113'
const CARD    = '#142318'
const BORDER  = '#1E3320'
const GREEN   = '#45A85F'
const DEEP    = '#2D7A3E'
const RED     = '#C8102E'
const WHITE   = '#FFFFFF'
const MUTED   = '#7A8E7E'
const BODY    = '#C5D5C8'
const GOLD    = '#F5C518'
const PURPLE  = '#B026FF'

interface LeaderEntry { id: string; name: string; lap_time: string; total_ms: number; created_at: string }

const LEADERBOARD_REFRESH_SEC = 5

function Leaderboard({ onCountdown }: { onCountdown?: (sec: number) => void }) {
  const [rows, setRows] = useState<LeaderEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    let countdownSec = LEADERBOARD_REFRESH_SEC

    async function refresh() {
      try {
        const r = await fetch('/api/nordschleife/leaderboard', { cache: 'no-store' })
        const d = await r.json()
        if (cancelled) return
        setRows(d.rows ?? [])
        setLoading(false)
        setFlash(true)
        setTimeout(() => { if (!cancelled) setFlash(false) }, 600)
      } catch {
        if (!cancelled) setLoading(false)
      }
    }

    // First load + tick every second
    refresh()
    countdownSec = LEADERBOARD_REFRESH_SEC
    onCountdown?.(countdownSec)

    const tick = setInterval(() => {
      countdownSec -= 1
      if (countdownSec <= 0) {
        countdownSec = LEADERBOARD_REFRESH_SEC
        refresh()
      }
      onCountdown?.(countdownSec)
    }, 1000)

    return () => { cancelled = true; clearInterval(tick) }
  }, [onCountdown])

  if (loading) return <p style={{ fontSize: 13, color: MUTED }}>Warming up the timing screens…</p>
  if (!rows.length) return <p style={{ fontSize: 13, color: MUTED }}>No laps set yet. Be first into the Eifel.</p>

  return (
    <div style={{
      transition: 'background 0.25s, box-shadow 0.25s',
      background: flash ? `${GREEN}10` : 'transparent',
      boxShadow: flash ? `0 0 0 1px ${GREEN}44 inset` : 'none',
      borderRadius: 6,
      marginInline: -8,
      paddingInline: 8,
    }}>
      {rows.slice(0, 10).map((r, i) => {
        const colour = i === 0 ? PURPLE : i < 3 ? GOLD : MUTED
        return (
          <div key={r.id} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '10px 0', borderBottom: `1px solid ${BORDER}`,
          }}>
            <span style={{ width: 24, fontSize: 13, fontWeight: 800, color: colour, textAlign: 'right', flexShrink: 0 }}>
              {i === 0 ? '🟣' : i === 1 ? '🥈' : i === 2 ? '🥉' : `P${i + 1}`}
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

const PRESENCE_STORAGE_KEY = 'nordschleife_presence_id'
const PRESENCE_PING_MS     = 30_000
const PRESENCE_FETCH_MS    = 10_000
const PRESENCE_VISIBLE_MIN = 10

function PresenceBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Get or create a stable per-tab UUID
    let id = ''
    try {
      id = localStorage.getItem(PRESENCE_STORAGE_KEY) ?? ''
      if (!id && typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        id = crypto.randomUUID()
        localStorage.setItem(PRESENCE_STORAGE_KEY, id)
      }
    } catch { /* localStorage may be unavailable */ }
    if (!id) return

    let cancelled = false

    async function ping() {
      try {
        const r = await fetch('/api/nordschleife/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
          cache: 'no-store',
        })
        const d = await r.json()
        if (!cancelled) setCount(d.count ?? 0)
      } catch { /* offline → leave count as-is */ }
    }
    async function fetchOnly() {
      try {
        const r = await fetch('/api/nordschleife/presence', { cache: 'no-store' })
        const d = await r.json()
        if (!cancelled) setCount(d.count ?? 0)
      } catch { /* ignore */ }
    }

    ping()
    const pingInt  = setInterval(ping,      PRESENCE_PING_MS)
    const fetchInt = setInterval(fetchOnly, PRESENCE_FETCH_MS)

    // Send one last ping with a synthetic stale flag isn't needed — the row
    // simply expires after 90 s without pings.

    return () => { cancelled = true; clearInterval(pingInt); clearInterval(fetchInt) }
  }, [])

  if (count < PRESENCE_VISIBLE_MIN) return null

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      background: `${GREEN}14`, border: `1px solid ${GREEN}44`,
      borderRadius: 100, padding: '6px 14px',
      fontSize: 12, fontWeight: 800, color: WHITE, letterSpacing: '0.02em',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: GREEN, animation: 'nsPulse 1.2s ease-in-out infinite',
      }} />
      <span style={{ color: GREEN, fontWeight: 900, fontFamily: 'monospace', fontSize: 13 }}>{count}</span>
      racers on track right now
    </div>
  )
}

function LiveBadge({ secLeft }: { secLeft: number }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11, color: GREEN, fontWeight: 700, letterSpacing: '0.04em',
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: GREEN, animation: 'nsPulse 1.2s ease-in-out infinite',
      }} />
      LIVE · update in {secLeft}s
    </span>
  )
}

function AttemptStatus() {
  const [freeUsed, setFreeUsed] = useState<number | null>(null)
  const [paidLeft, setPaidLeft] = useState<number | null>(null)

  useEffect(() => {
    try {
      const stored = parseInt(localStorage.getItem(FREE_STORAGE_KEY) ?? '0', 10)
      setFreeUsed(Number.isFinite(stored) ? stored : 0)
    } catch { setFreeUsed(0) }
    fetch('/api/nordschleife/credits').then(r => r.json()).then(d => setPaidLeft(d.credits ?? 0)).catch(() => setPaidLeft(0))
  }, [])

  if (freeUsed === null || paidLeft === null) return null

  const freeLeft = Math.max(0, FREE_ATTEMPTS - freeUsed)
  const total    = freeLeft + paidLeft
  const locked   = total <= 0

  return (
    <div style={{
      display: 'inline-flex', gap: 10, padding: '8px 14px', borderRadius: 8,
      background: locked ? `${RED}18` : `${GREEN}14`,
      border: `1px solid ${locked ? RED + '44' : GREEN + '44'}`,
      fontSize: 12, color: locked ? RED : GREEN, fontWeight: 700, alignItems: 'center',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: locked ? RED : GREEN }} />
      {locked
        ? 'No laps left — buy a 5-pack to keep going'
        : `${freeLeft} free lap${freeLeft === 1 ? '' : 's'} left${paidLeft > 0 ? ` · +${paidLeft} paid` : ''}`}
    </div>
  )
}

export default function NordschleifeLanding() {
  const [leaderboardCountdown, setLeaderboardCountdown] = useState(LEADERBOARD_REFRESH_SEC)

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Inter, system-ui, sans-serif', color: WHITE }}>
      <style>{`
        @keyframes nsPulse {
          0%, 100% { transform: scale(1);   opacity: 1;   }
          50%      { transform: scale(1.6); opacity: 0.55; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '0 24px', background: DARK }}>
        <div style={{ maxWidth: 980, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 7,
              background: `linear-gradient(135deg, ${DEEP}, ${GREEN})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: WHITE }}>N</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 900, color: WHITE, letterSpacing: '-0.01em' }}>
              Nordschleife
            </span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: '0.12em' }}>
            🌲 GREEN HELL · TIME TRIAL
          </span>
        </div>
      </nav>

      {/* Live race banner */}
      <div style={{
        background: `linear-gradient(90deg, ${DEEP}, ${RED})`,
        padding: '8px 16px', textAlign: 'center',
        fontSize: 12, fontWeight: 800, color: WHITE, letterSpacing: '0.06em',
      }}>
        🏁 Live now: 24 HOURS OF NÜRBURGRING — kill the boring laps with trivia
      </div>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '48px 24px 80px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40 }}>

        {/* Left: hero + rules */}
        <div>
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: GREEN, letterSpacing: '0.16em', marginBottom: 14, textTransform: 'uppercase' }}>
              20.832 km · 73 corners · 1 lap
            </p>
            <h1 style={{
              fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 900,
              letterSpacing: '-0.04em', lineHeight: 0.95, marginBottom: 22,
            }}>
              The <span style={{ color: GREEN }}>Green</span><br />
              <span style={{ color: RED }}>Hell</span> Time Trial.
            </h1>
            <p style={{ fontSize: 18, color: BODY, lineHeight: 1.7, maxWidth: 520, marginBottom: 26 }}>
              30 trivia questions about the most legendary track in motorsport. 15 seconds each. Wrong answer or timeout = +5 second penalty.
              Your total time is your lap time. Set the track record.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 22 }}>
              <Suspense fallback={null}><PresenceBadge /></Suspense>
              <Suspense fallback={null}><AttemptStatus /></Suspense>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <Link
                href="/nordschleife/play"
                style={{
                  display: 'inline-block',
                  background: `linear-gradient(135deg, ${GREEN}, ${DEEP})`,
                  color: WHITE,
                  fontSize: 18, fontWeight: 900,
                  padding: '18px 42px', borderRadius: 10, textDecoration: 'none',
                  letterSpacing: '-0.01em',
                  boxShadow: `0 8px 24px ${GREEN}33`,
                }}
              >
                Start the lap →
              </Link>
              <span style={{ fontSize: 12, color: MUTED }}>
                First {FREE_ATTEMPTS} laps free · {PAID_BUNDLE_ATTEMPTS} more for €{PAID_BUNDLE_PRICE_EUR}
              </span>
            </div>
          </div>

          {/* Rules grid */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '28px 24px', marginBottom: 28 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: WHITE, marginBottom: 18, letterSpacing: '-0.01em' }}>How it works</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {[
                { icon: '⏱', title: 'Time is your score', body: 'Your lap time = total seconds spent answering. Faster = better.' },
                { icon: '⚠️', title: '+5 second penalty', body: 'Wrong answer or timeout adds 5 seconds to that sector.' },
                { icon: '🌲', title: '3 sectors · 30 questions', body: 'Hatzenbach (easy) → Karussell (medium) → Döttinger Höhe (hard).' },
                { icon: '🎲', title: '100-question pool', body: 'Every lap pulls 30 from a 100-question Nordschleife trivia bank.' },
                { icon: '🟣', title: 'Purple = track record', body: 'Fastest ever. Gold = your personal best this session.' },
                { icon: '💸', title: `${FREE_ATTEMPTS} free, then €${PAID_BUNDLE_PRICE_EUR}`, body: `${FREE_ATTEMPTS} attempts free per device, then ${PAID_BUNDLE_ATTEMPTS} more for €${PAID_BUNDLE_PRICE_EUR}.` },
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
            <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
              Your lap, sector by sector
            </p>
            <div style={{ display: 'flex', gap: 1 }}>
              {[
                { label: 'SECTOR 1', name: 'Hatzenbach',     qs: 'Q1–Q10',  diff: 'Easy',   color: GREEN,  time: '2:48.0' },
                { label: 'SECTOR 2', name: 'Karussell',      qs: 'Q11–Q20', diff: 'Medium', color: GOLD,   time: '3:42.0' },
                { label: 'SECTOR 3', name: 'Döttinger Höhe', qs: 'Q21–Q30', diff: 'Hard',   color: RED,    time: '4:35.0' },
              ].map((s, i) => (
                <div key={s.label} style={{
                  flex: 1, background: BG,
                  borderRadius: i === 0 ? '8px 0 0 8px' : i === 2 ? '0 8px 8px 0' : 0,
                  padding: '12px', borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: WHITE, fontWeight: 700, marginBottom: 2 }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: MUTED, marginBottom: 8 }}>{s.qs} · {s.diff}</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: s.color, fontFamily: 'monospace' }}>{s.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: leaderboard */}
        <div style={{ position: 'sticky', top: 24, alignSelf: 'start' }}>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ height: 3, background: `linear-gradient(90deg, ${PURPLE}, ${GREEN})` }} />
            <div style={{ padding: '20px 20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: WHITE }}>🏁 Track Records</h3>
                <LiveBadge secLeft={leaderboardCountdown} />
              </div>
              <Suspense fallback={<p style={{ fontSize: 13, color: MUTED }}>Loading…</p>}>
                <Leaderboard onCountdown={setLeaderboardCountdown} />
              </Suspense>
              <div style={{ marginTop: 20 }}>
                <Link
                  href="/nordschleife/play"
                  style={{
                    display: 'block', textAlign: 'center',
                    background: `linear-gradient(135deg, ${GREEN}, ${DEEP})`,
                    color: WHITE,
                    fontSize: 14, fontWeight: 800,
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

      <footer style={{ borderTop: `1px solid ${BORDER}`, background: DARK, padding: '20px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: MUTED }}>
          Nordschleife Time Trial · Built by <span style={{ color: WHITE }}>Kirk & Blackbeard</span> · Trivia is for fun, not for ride-sharing your real laps.
        </p>
      </footer>
    </div>
  )
}
