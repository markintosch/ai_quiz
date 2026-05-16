'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  formatLapTime,
  QUESTIONS_PER_LAP,
  QUESTIONS_PER_SECTOR,
  FREE_ATTEMPTS,
  FREE_STORAGE_KEY,
  PAID_BUNDLE_ATTEMPTS,
  PAID_BUNDLE_PRICE_EUR,
  type SectorResult,
} from '@/products/nordschleife/data'

// ── Brand tokens ───────────────────────────────────────────────────────────────
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

interface LapPayload {
  sectors: SectorResult[]
  totalMs: number
  lapTime: string
  paid?:   boolean
}

function sectorMs(sectors: SectorResult[], from: number, to: number) {
  return sectors.slice(from, to).reduce((s, r) => s + r.timeMsTotal, 0)
}

function sectorColour(ms: number): string {
  if (ms < 60000) return PURPLE
  if (ms < 120000) return GREEN
  if (ms < 200000) return GOLD
  return RED
}

function ResultsInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [lap, setLap]   = useState<LapPayload | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'form' | 'submitting' | 'done'>('form')
  const [rank, setRank] = useState<number | null>(null)
  const [trackRecord, setTrackRecord] = useState<number | null>(null)
  const [error, setError] = useState('')

  const [freeLeft, setFreeLeft] = useState(0)
  const [paidLeft, setPaidLeft] = useState(0)

  useEffect(() => {
    const d = searchParams.get('d')
    if (!d) { router.replace('/nordschleife'); return }
    try {
      const payload = JSON.parse(atob(d)) as LapPayload
      setLap(payload)
    } catch {
      router.replace('/nordschleife')
    }

    try {
      const used = parseInt(localStorage.getItem(FREE_STORAGE_KEY) ?? '0', 10) || 0
      setFreeLeft(Math.max(0, FREE_ATTEMPTS - used))
    } catch { setFreeLeft(0) }
    fetch('/api/nordschleife/credits').then(r => r.json()).then(d => setPaidLeft(d.credits ?? 0)).catch(() => setPaidLeft(0))
  }, [searchParams, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!lap) return
    const n = name.trim()
    const em = email.trim()
    if (!n) { setError('Please enter your name or alias.'); return }
    if (!em || !em.includes('@')) { setError('Please enter a valid email.'); return }

    setStep('submitting')
    setError('')

    try {
      const res = await fetch('/api/nordschleife/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: n, email: em,
          totalMs: lap.totalMs, lapTime: lap.lapTime, sectors: lap.sectors,
          paidAttempt: !!lap.paid,
        }),
      })
      const json = await res.json()
      if (json.rank) setRank(json.rank)
      if (json.trackRecord) setTrackRecord(json.trackRecord)
      setStep('done')
    } catch {
      setError('Something went wrong saving your lap — it may have still been recorded.')
      setStep('done')
    }
  }

  if (!lap) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: MUTED }}>Loading lap data…</p>
      </div>
    )
  }

  const s1 = sectorMs(lap.sectors, 0, QUESTIONS_PER_SECTOR)
  const s2 = sectorMs(lap.sectors, QUESTIONS_PER_SECTOR, QUESTIONS_PER_SECTOR * 2)
  const s3 = sectorMs(lap.sectors, QUESTIONS_PER_SECTOR * 2, QUESTIONS_PER_LAP)
  const correctCount = lap.sectors.filter(s => s.correct).length
  const penalties    = lap.sectors.filter(s => !s.correct || s.timedOut).length

  const isPurple = trackRecord !== null && lap.totalMs <= trackRecord
  const noLapsLeft = freeLeft <= 0 && paidLeft <= 0

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Inter, system-ui, sans-serif', color: WHITE }}>

      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '0 24px', background: DARK }}>
        <div style={{ maxWidth: 720, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/nordschleife" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${DEEP}, ${GREEN})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: WHITE }}>N</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: WHITE }}>Nordschleife</span>
          </Link>
          <span style={{ fontSize: 12, fontWeight: 700, color: GREEN, letterSpacing: '0.08em' }}>🏁 LAP COMPLETE</span>
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
            color: isPurple ? PURPLE : GOLD,
          }}>
            {lap.lapTime}
          </div>
          {isPurple && (
            <div style={{ fontSize: 14, color: PURPLE, fontWeight: 800, marginTop: 10 }}>
              🟣 New Nordschleife track record!
            </div>
          )}
        </div>

        {/* Sector breakdown */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 28 }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${PURPLE}, ${GREEN})` }} />
          <div style={{ padding: '20px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
              Sector breakdown
            </p>
            <div style={{ display: 'flex', gap: 1 }}>
              {[
                { label: 'SECTOR 1', name: 'Hatzenbach',     ms: s1, diff: 'Easy' },
                { label: 'SECTOR 2', name: 'Karussell',      ms: s2, diff: 'Medium' },
                { label: 'SECTOR 3', name: 'Döttinger Höhe', ms: s3, diff: 'Hard' },
              ].map((s, i) => (
                <div key={s.label} style={{
                  flex: 1, background: BG,
                  borderRadius: i === 0 ? '8px 0 0 8px' : i === 2 ? '0 8px 8px 0' : 0,
                  padding: '14px 12px', borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: WHITE, fontWeight: 700, marginBottom: 2 }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: MUTED, marginBottom: 8 }}>{s.diff}</div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: sectorColour(s.ms), fontFamily: 'monospace' }}>
                    {formatLapTime(s.ms)}
                  </div>
                </div>
              ))}
              <div style={{ width: 1, background: BORDER }} />
              <div style={{ background: BG, borderRadius: '0 8px 8px 0', padding: '14px 12px', minWidth: 100 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: '0.08em', marginBottom: 4 }}>LAP</div>
                <div style={{ fontSize: 17, fontWeight: 900, color: isPurple ? PURPLE : GOLD, fontFamily: 'monospace' }}>
                  {lap.lapTime}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Correct', value: `${correctCount}/${QUESTIONS_PER_LAP}`, color: GREEN },
            { label: 'Penalties', value: `${penalties}× +8s`, color: penalties > 0 ? RED : MUTED },
            { label: 'Accuracy', value: `${Math.round((correctCount / QUESTIONS_PER_LAP) * 100)}%`, color: correctCount >= QUESTIONS_PER_LAP * 0.8 ? GREEN : correctCount >= QUESTIONS_PER_LAP * 0.5 ? GOLD : RED },
          ].map(stat => (
            <div key={stat.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: stat.color, marginBottom: 4, fontFamily: 'monospace' }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: MUTED }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Save form */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 22 }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${PURPLE}, ${GREEN})` }} />
          <div style={{ padding: '24px' }}>
            {step === 'done' ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏁</div>
                <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Lap time saved</h3>
                {rank && (
                  <p style={{ fontSize: 16, color: BODY, marginBottom: 4 }}>
                    You&apos;re <span style={{ color: rank <= 3 ? PURPLE : GOLD, fontWeight: 900 }}>P{rank}</span> on the leaderboard.
                  </p>
                )}
                {rank === 1 && <p style={{ color: PURPLE, fontWeight: 800 }}>🟣 New track record!</p>}
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>🏁 Save your lap to the leaderboard</h3>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 18 }}>Name shown publicly. Email never is.</p>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input
                      value={name}
                      onChange={e => { setName(e.target.value); setError('') }}
                      placeholder="Your name or alias"
                      maxLength={30}
                      style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '12px 16px', fontSize: 15, fontWeight: 700, color: WHITE, outline: 'none' }}
                    />
                    <input
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
                      placeholder="Email (not shown publicly)"
                      type="email"
                      style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '12px 16px', fontSize: 14, color: WHITE, outline: 'none' }}
                    />
                    {error && <p style={{ fontSize: 13, color: RED, margin: 0 }}>{error}</p>}
                    <button
                      type="submit"
                      disabled={step === 'submitting'}
                      style={{
                        background: `linear-gradient(135deg, ${GREEN}, ${DEEP})`, color: WHITE,
                        fontSize: 15, fontWeight: 900, padding: '14px', borderRadius: 10,
                        border: 'none', cursor: step === 'submitting' ? 'default' : 'pointer',
                        opacity: step === 'submitting' ? 0.7 : 1,
                      }}
                    >
                      {step === 'submitting' ? 'Saving lap…' : 'Post lap time →'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Next lap CTA */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {noLapsLeft ? (
            <Link href="/nordschleife/buy" style={{
              background: `linear-gradient(135deg, ${GREEN}, ${DEEP})`, color: WHITE,
              fontSize: 15, fontWeight: 900,
              padding: '14px 28px', borderRadius: 10, textDecoration: 'none',
            }}>
              Buy {PAID_BUNDLE_ATTEMPTS} more laps · €{PAID_BUNDLE_PRICE_EUR} →
            </Link>
          ) : (
            <Link href="/nordschleife/play" style={{
              background: `linear-gradient(135deg, ${GREEN}, ${DEEP})`, color: WHITE,
              fontSize: 15, fontWeight: 900,
              padding: '14px 28px', borderRadius: 10, textDecoration: 'none',
            }}>
              Another lap →
            </Link>
          )}
          <Link href="/nordschleife" style={{
            background: CARD, color: WHITE, border: `1px solid ${BORDER}`,
            fontSize: 14, fontWeight: 700,
            padding: '14px 24px', borderRadius: 10, textDecoration: 'none',
          }}>
            Leaderboard
          </Link>
        </div>

        <p style={{ fontSize: 11, color: MUTED, textAlign: 'center', marginTop: 18 }}>
          {freeLeft + paidLeft} lap{freeLeft + paidLeft === 1 ? '' : 's'} left on this device · {paidLeft > 0 ? `${paidLeft} paid` : `${freeLeft} free`}
        </p>
      </div>
    </div>
  )
}

export default function NordschleifeResultsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: MUTED }}>Loading results…</p>
      </div>
    }>
      <ResultsInner />
    </Suspense>
  )
}
