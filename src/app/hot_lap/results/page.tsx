'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatLapTime, type SectorResult } from '@/products/hot_lap/data'

// ── Brand tokens ───────────────────────────────────────────────────────────────
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
const GREEN  = '#00C853'

interface LapPayload {
  sectors: SectorResult[]
  totalMs: number
  lapTime: string
}

function sectorMs(sectors: SectorResult[], from: number, to: number) {
  return sectors.slice(from, to).reduce((s, r) => s + r.timeMsTotal, 0)
}

function sectorColour(ms: number): string {
  if (ms < 15000) return PURPLE
  if (ms < 40000) return GREEN
  if (ms < 60000) return AMBER
  return RED
}

// ── Inner component (needs useSearchParams) ────────────────────────────────────
function ResultsInner() {
  const searchParams  = useSearchParams()
  const router        = useRouter()

  const [lap, setLap]           = useState<LapPayload | null>(null)
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [step, setStep]         = useState<'form' | 'submitting' | 'done'>('form')
  const [rank, setRank]         = useState<number | null>(null)
  const [trackRecord, setTrackRecord] = useState<number | null>(null)
  const [error, setError]       = useState('')

  useEffect(() => {
    const d = searchParams.get('d')
    if (!d) { router.replace('/hot_lap'); return }
    try {
      const payload = JSON.parse(atob(d)) as LapPayload
      setLap(payload)
    } catch {
      router.replace('/hot_lap')
    }
  }, [searchParams, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!lap) return
    const n = name.trim()
    const em = email.trim()
    if (!n) { setError('Please enter your name.'); return }
    if (!em || !em.includes('@')) { setError('Please enter a valid email.'); return }

    setStep('submitting')
    setError('')

    try {
      const res = await fetch('/api/hot_lap/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n, email: em, totalMs: lap.totalMs, lapTime: lap.lapTime, sectors: lap.sectors }),
      })
      const json = await res.json()
      if (json.rank) setRank(json.rank)
      if (json.trackRecord) setTrackRecord(json.trackRecord)
      setStep('done')
    } catch {
      setError('Something went wrong. Your lap was still recorded.')
      setStep('done')
    }
  }

  if (!lap) {
    return (
      <div style={{ minHeight: '100vh', background: BLACK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: MUTED }}>Loading…</p>
      </div>
    )
  }

  const s1 = sectorMs(lap.sectors, 0, 3)
  const s2 = sectorMs(lap.sectors, 3, 7)
  const s3 = sectorMs(lap.sectors, 7, 10)
  const correctCount = lap.sectors.filter(s => s.correct).length
  const penalties    = lap.sectors.filter(s => !s.correct || s.timedOut).length

  // Is this a "purple lap" overall?
  const isPurple = trackRecord !== null && lap.totalMs <= trackRecord

  return (
    <div style={{
      minHeight: '100vh', background: BLACK,
      fontFamily: 'Inter, system-ui, sans-serif', color: WHITE,
    }}>

      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '0 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/vrooooom" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: WHITE, fontStyle: 'italic' }}>V</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: WHITE, fontStyle: 'italic' }}>Vrooooom</span>
          </Link>
          <span style={{ fontSize: 12, fontWeight: 700, color: RED, letterSpacing: '0.08em' }}>🏁 LAP COMPLETE</span>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Big lap time */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: MUTED, letterSpacing: '0.15em', marginBottom: 12 }}>
            YOUR LAP TIME
          </div>
          <div style={{
            fontSize: 'clamp(56px, 10vw, 96px)',
            fontWeight: 900, fontFamily: 'monospace',
            letterSpacing: '-0.03em', lineHeight: 1,
            color: isPurple ? PURPLE : AMBER,
          }}>
            {lap.lapTime}
          </div>
          {isPurple && (
            <div style={{ fontSize: 14, color: PURPLE, fontWeight: 800, marginTop: 10 }}>
              🟣 New track record!
            </div>
          )}
        </div>

        {/* Sector breakdown */}
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`,
          borderRadius: 16, overflow: 'hidden', marginBottom: 28,
        }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${PURPLE}, ${RED})` }} />
          <div style={{ padding: '20px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
              Sector breakdown
            </p>
            <div style={{ display: 'flex', gap: 1 }}>
              {[
                { label: 'SECTOR 1', qs: 'Q1–Q3', ms: s1, diff: 'Easy' },
                { label: 'SECTOR 2', qs: 'Q4–Q7', ms: s2, diff: 'Medium' },
                { label: 'SECTOR 3', qs: 'Q8–Q10', ms: s3, diff: 'Hard' },
              ].map((s, i) => (
                <div key={s.label} style={{
                  flex: 1, background: BLACK,
                  borderRadius: i === 0 ? '8px 0 0 8px' : i === 2 ? '0 8px 8px 0' : 0,
                  padding: '14px 12px',
                  borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: MUTED, marginBottom: 8 }}>{s.qs} · {s.diff}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: sectorColour(s.ms), fontFamily: 'monospace' }}>
                    {formatLapTime(s.ms)}
                  </div>
                </div>
              ))}
              <div style={{ width: 1, background: BORDER }} />
              <div style={{ background: BLACK, borderRadius: '0 8px 8px 0', padding: '14px 12px', minWidth: 90 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: '0.08em', marginBottom: 4 }}>LAP</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: isPurple ? PURPLE : AMBER, fontFamily: 'monospace' }}>
                  {lap.lapTime}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Correct', value: `${correctCount}/10`, color: GREEN },
            { label: 'Penalties', value: `${penalties}x +5s`, color: penalties > 0 ? RED : MUTED },
            { label: 'Accuracy', value: `${Math.round((correctCount / 10) * 100)}%`, color: correctCount >= 8 ? GREEN : correctCount >= 5 ? AMBER : RED },
          ].map(stat => (
            <div key={stat.label} style={{
              background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: 12, padding: '16px 12px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: stat.color, marginBottom: 4, fontFamily: 'monospace' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: MUTED }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Q-by-Q breakdown */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px', marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
            Question by question
          </p>
          {lap.sectors.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 0', borderBottom: i < 9 ? `1px solid ${BORDER}` : 'none',
            }}>
              <span style={{ width: 20, fontSize: 12, fontWeight: 700, color: MUTED, textAlign: 'right', flexShrink: 0 }}>
                Q{i + 1}
              </span>
              <span style={{
                width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                background: s.correct ? GREEN + '22' : RED + '22',
                border: `1px solid ${s.correct ? GREEN + '44' : RED + '44'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: s.correct ? GREEN : RED, fontWeight: 900,
              }}>
                {s.timedOut ? '⏱' : s.correct ? '✓' : '✗'}
              </span>
              <span style={{ flex: 1, fontSize: 12, color: BODY }}>
                {s.correct ? 'Correct' : s.timedOut ? 'Timed out' : 'Wrong answer'}
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: s.correct ? GREEN : RED, fontFamily: 'monospace' }}>
                {formatLapTime(s.timeMsTotal)}
              </span>
              {!s.correct && (
                <span style={{ fontSize: 10, color: RED }}>+5s</span>
              )}
            </div>
          ))}
        </div>

        {/* Rank submission */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${PURPLE}, ${RED})` }} />
          <div style={{ padding: '24px 24px' }}>
            {step === 'done' ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏁</div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: WHITE, marginBottom: 8 }}>
                  Lap time saved!
                </h3>
                {rank && (
                  <p style={{ fontSize: 16, color: BODY, marginBottom: 4 }}>
                    You're <span style={{ color: rank <= 3 ? PURPLE : AMBER, fontWeight: 900 }}>P{rank}</span> on the leaderboard.
                  </p>
                )}
                {rank === 1 && <p style={{ color: PURPLE, fontWeight: 800 }}>🟣 New track record!</p>}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
                  <Link href="/hot_lap/play" style={{
                    background: RED, color: WHITE,
                    fontSize: 15, fontWeight: 900, fontStyle: 'italic',
                    padding: '14px 32px', borderRadius: 10, textDecoration: 'none',
                  }}>
                    Another lap →
                  </Link>
                  <Link href="/hot_lap" style={{
                    background: CARD, color: WHITE, border: `1px solid ${BORDER}`,
                    fontSize: 14, fontWeight: 700,
                    padding: '14px 24px', borderRadius: 10, textDecoration: 'none',
                  }}>
                    Leaderboard
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: WHITE, marginBottom: 6 }}>
                  🏁 Save your lap to the leaderboard
                </h3>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>
                  Enter your name to claim your spot on the track.
                </p>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input
                      value={name}
                      onChange={e => { setName(e.target.value); setError('') }}
                      placeholder="Your name or alias"
                      maxLength={30}
                      style={{
                        background: BLACK, border: `1px solid ${BORDER}`,
                        borderRadius: 8, padding: '12px 16px',
                        fontSize: 15, fontWeight: 700, color: WHITE, outline: 'none',
                        fontFamily: 'Inter, system-ui, sans-serif',
                      }}
                    />
                    <input
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
                      placeholder="Email (not shown publicly)"
                      type="email"
                      style={{
                        background: BLACK, border: `1px solid ${BORDER}`,
                        borderRadius: 8, padding: '12px 16px',
                        fontSize: 14, color: WHITE, outline: 'none',
                        fontFamily: 'Inter, system-ui, sans-serif',
                      }}
                    />
                    {error && <p style={{ fontSize: 13, color: RED, margin: 0 }}>{error}</p>}
                    <button
                      type="submit"
                      disabled={step === 'submitting'}
                      style={{
                        background: RED, color: WHITE,
                        fontSize: 15, fontWeight: 900, fontStyle: 'italic',
                        padding: '14px', borderRadius: 10, border: 'none',
                        cursor: step === 'submitting' ? 'default' : 'pointer',
                        opacity: step === 'submitting' ? 0.7 : 1,
                      }}
                    >
                      {step === 'submitting' ? 'Saving…' : 'Post lap time →'}
                    </button>
                  </div>
                </form>
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Link href="/hot_lap/play" style={{
                    fontSize: 13, color: MUTED, textDecoration: 'underline', textDecorationColor: BORDER,
                  }}>
                    Skip — try again without saving
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HotLapResultsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888899' }}>Loading results…</p>
      </div>
    }>
      <ResultsInner />
    </Suspense>
  )
}
