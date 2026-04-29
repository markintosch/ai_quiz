'use client'

// Slim Proserve-themed arena join client.
// Calls the existing /api/arena/sessions/[code]/join endpoint.
// On a session that's already 'active', redirects straight to /play.
// On a 'lobby' session, polls every 3s and auto-redirects when the host starts.

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const NAVY      = '#1F0F70'
const NAVY_DARK = '#0F0840'
const BLUE      = '#1F8EFF'
const BLUE_SOFT = '#E5F2FF'
const INK       = '#1A1A2E'
const BODY      = '#4B5468'
const MUTED     = '#8C92A6'
const BORDER    = '#E5E7EE'
const FONT      = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

interface Props {
  joinCode:        string
  hostName:        string
  title:           string | null
  questionCount:   number
  timePerQ:        number
  initialStatus:   string  // 'lobby' | 'active' | 'completed' | 'cancelled'
}

type Phase = 'form' | 'lobby' | 'redirecting'

export default function ProserveArenaJoinClient({
  joinCode, hostName, title, questionCount, timePerQ, initialStatus,
}: Props) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('form')
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [status, setStatus]   = useState(initialStatus)

  // Poll session status every 3s when in lobby — redirect when host starts
  useEffect(() => {
    if (phase !== 'lobby' || !participantId) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/arena/sessions/${joinCode}`, { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json() as { session?: { status: string } }
        const newStatus = json.session?.status
        if (newStatus && newStatus !== status) setStatus(newStatus)
        if (newStatus === 'active') {
          setPhase('redirecting')
          router.push(`/arena/${joinCode}/play?pid=${participantId}`)
        }
      } catch { /* ignore */ }
    }, 3000)
    return () => clearInterval(interval)
  }, [phase, participantId, joinCode, status, router])

  const handleJoin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/arena/sessions/${joinCode}/join`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ display_name: name.trim(), email: email.trim() || undefined }),
      })
      const json = await res.json() as { participantId?: string; error?: string }
      if (!res.ok || !json.participantId) {
        setError(json.error || 'Could not join. Please try again.')
        setLoading(false)
        return
      }
      setParticipantId(json.participantId)
      if (status === 'active') {
        setPhase('redirecting')
        router.push(`/arena/${joinCode}/play?pid=${json.participantId}`)
      } else {
        setPhase('lobby')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }, [loading, name, email, joinCode, status, router])

  // ── UI ──────────────────────────────────────────────────────────────────
  if (phase === 'redirecting') {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: BODY, fontFamily: FONT }}>
        <p style={{ fontSize: 14, color: BLUE, fontWeight: 600 }}>De arena opent…</p>
      </div>
    )
  }

  if (phase === 'lobby') {
    return (
      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, padding: '36px 32px', maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: BLUE_SOFT, borderRadius: 100, marginBottom: 18 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: BLUE, animation: 'proserve-arena-pulse 1.4s infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            In de wachtkamer
          </span>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: NAVY, marginBottom: 10, letterSpacing: '-0.015em' }}>
          Je staat klaar.
        </h2>
        <p style={{ fontSize: 15, color: BODY, lineHeight: 1.6, marginBottom: 22 }}>
          Zodra de host het spel start, springt deze pagina automatisch over naar de eerste vraag. Geen verversen nodig.
        </p>
        <p style={{ fontSize: 12, color: MUTED }}>
          Code: <strong style={{ color: NAVY, letterSpacing: '0.16em' }}>{joinCode}</strong>
          {' · '}{questionCount} vragen · {timePerQ}s per vraag
        </p>
        <style>{`
          @keyframes proserve-arena-pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50%      { transform: scale(1.6); opacity: 0.4; }
          }
        `}</style>
      </div>
    )
  }

  // form
  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, padding: '32px 32px', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
            Cloud Arena
          </p>
          <p style={{ fontSize: 18, fontWeight: 800, color: NAVY, letterSpacing: '-0.01em' }}>
            {title || 'Doe mee aan de sessie'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
            Code
          </p>
          <p style={{ fontSize: 20, fontWeight: 900, color: BLUE, letterSpacing: '0.18em' }}>{joinCode}</p>
        </div>
      </div>

      <p style={{ fontSize: 13, color: BODY, lineHeight: 1.55, marginBottom: 22 }}>
        Gehost door <strong style={{ color: NAVY }}>{hostName}</strong>{' · '}
        {questionCount} vragen{' · '}{timePerQ}s per vraag.
      </p>

      <form onSubmit={handleJoin}>
        <label style={{ display: 'block', marginBottom: 14 }}>
          <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 6 }}>
            Je naam
          </span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Voornaam"
            required
            maxLength={40}
            style={{
              width: '100%', padding: '12px 16px', fontSize: 15,
              border: `1.5px solid ${BORDER}`, borderRadius: 10,
              fontFamily: FONT, color: INK, background: '#fff',
              boxSizing: 'border-box',
            }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: 18 }}>
          <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 6 }}>
            E-mail <span style={{ color: MUTED, fontWeight: 500 }}>(optioneel — voor follow-up)</span>
          </span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="jij@bedrijf.nl"
            maxLength={120}
            style={{
              width: '100%', padding: '12px 16px', fontSize: 15,
              border: `1.5px solid ${BORDER}`, borderRadius: 10,
              fontFamily: FONT, color: INK, background: '#fff',
              boxSizing: 'border-box',
            }}
          />
        </label>

        {error && (
          <p style={{ fontSize: 13, color: '#B91C1C', marginBottom: 12 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !name.trim()}
          style={{
            width: '100%', padding: '14px 24px', fontSize: 16, fontWeight: 800,
            background: loading || !name.trim() ? '#CBD5E1' : BLUE,
            color: '#fff', border: 'none', borderRadius: 100,
            cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
            fontFamily: FONT,
            boxShadow: loading || !name.trim() ? 'none' : '0 8px 24px rgba(31,142,255,0.3)',
            transition: 'background 0.15s',
          }}
        >
          {loading ? 'Bezig…' : status === 'active' ? 'Direct meedoen →' : 'Naar de wachtkamer →'}
        </button>
      </form>

      <p style={{ marginTop: 16, fontSize: 11, color: MUTED, textAlign: 'center' }}>
        Geen account nodig. Je naam blijft alleen zichtbaar tijdens deze sessie.
      </p>
      {/* unused */}
      <span style={{ display: 'none' }}>{NAVY_DARK}</span>
    </div>
  )
}
