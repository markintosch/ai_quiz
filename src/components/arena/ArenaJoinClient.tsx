'use client'

// FILE: src/components/arena/ArenaJoinClient.tsx
// Handles: pre-game countdown + subscribe → join form → lobby → redirect to play
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Participant { id: string; display_name: string }

interface LeaderboardEntry {
  display_name: string
  best_score: number
  attempts: number
  rank: number
}

interface Props {
  joinCode: string
  hostName: string
  title: string | null
  status: string
  questionCount: number
  timePerQ: number
  scheduledAt: string | null
  initialParticipants: Participant[]
  initialLeaderboard: LeaderboardEntry[]
}

function formatCountdown(ms: number) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  const s  = Math.floor(ms / 1000)
  const days    = Math.floor(s / 86400)
  const hours   = Math.floor((s % 86400) / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  return { days, hours, minutes, seconds }
}

export default function ArenaJoinClient({
  joinCode, hostName, title, status: initialStatus,
  questionCount, timePerQ, scheduledAt, initialParticipants, initialLeaderboard,
}: Props) {
  const router = useRouter()
  const eventName = title ?? 'Cloud Arena'

  // Determine initial phase
  const isFuture = scheduledAt && new Date(scheduledAt) > new Date()
  const [phase, setPhase] = useState<'countdown' | 'form' | 'lobby'>(
    isFuture ? 'countdown' : 'form'
  )
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail]             = useState('')
  const [participantId, setParticipantId] = useState('')
  const [participants, setParticipants]   = useState<Participant[]>(initialParticipants)
  const [sessionStatus, setSessionStatus] = useState(initialStatus)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialLeaderboard)

  // Countdown state
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof formatCountdown>>(
    formatCountdown(scheduledAt ? new Date(scheduledAt).getTime() - Date.now() : 0)
  )
  const [subEmail, setSubEmail]       = useState('')
  const [subLoading, setSubLoading]   = useState(false)
  const [subDone, setSubDone]         = useState(false)
  const [subError, setSubError]       = useState('')
  const autoStartedRef = useRef(false)

  // Countdown tick
  useEffect(() => {
    if (phase !== 'countdown' || !scheduledAt) return
    const tick = setInterval(() => {
      const ms = new Date(scheduledAt).getTime() - Date.now()
      if (ms <= 0) {
        setTimeLeft(formatCountdown(0))
        clearInterval(tick)
        // Auto-start the game (only once)
        if (!autoStartedRef.current) {
          autoStartedRef.current = true
          void triggerAutoStart()
        }
      } else {
        setTimeLeft(formatCountdown(ms))
      }
    }, 1000)
    return () => clearInterval(tick)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, scheduledAt])

  async function triggerAutoStart() {
    try {
      await fetch(`/api/arena/sessions/${joinCode}/start`, { method: 'POST' })
    } catch { /* best-effort */ }
    // After start attempt, move to form/lobby so player can join
    setPhase('form')
    setSessionStatus('active')
    // If already joined, redirect to play
    if (participantId) {
      router.push(`/arena/${joinCode}/play?pid=${participantId}`)
    }
  }

  // Poll for game start once in lobby
  const poll = useCallback(async () => {
    const res = await fetch(`/api/arena/sessions/${joinCode}`, { cache: 'no-store' })
    if (!res.ok) return
    const json = await res.json() as { session: { status: string }; participants: Participant[] }
    setParticipants(json.participants)
    setSessionStatus(json.session.status)
    if (json.session.status === 'active') {
      router.push(`/arena/${joinCode}/play?pid=${participantId}`)
    }
  }, [joinCode, participantId, router])

  // Also poll during countdown (someone else or admin may start early)
  useEffect(() => {
    if (phase === 'countdown') {
      const interval = setInterval(async () => {
        const res = await fetch(`/api/arena/sessions/${joinCode}`, { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json() as { session: { status: string } }
        if (json.session.status === 'active') {
          setPhase('form')
          setSessionStatus('active')
          if (participantId) router.push(`/arena/${joinCode}/play?pid=${participantId}`)
        }
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [phase, joinCode, participantId, router])

  useEffect(() => {
    if (phase !== 'lobby') return
    const interval = setInterval(poll, 2000)
    return () => clearInterval(interval)
  }, [phase, poll])

  // Leaderboard polling when session is active
  useEffect(() => {
    if (sessionStatus !== 'active') return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/arena/sessions/${joinCode}/leaderboard`, { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json() as { leaderboard: LeaderboardEntry[] }
          setLeaderboard(json.leaderboard)
        }
      } catch { /* ignore */ }
    }, 10000)
    return () => clearInterval(interval)
  }, [joinCode, sessionStatus])

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    setSubError('')
    setSubLoading(true)
    try {
      const res = await fetch(`/api/arena/sessions/${joinCode}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail.trim() }),
      })
      if (res.ok) {
        setSubDone(true)
      } else {
        const json = await res.json() as { error?: string }
        setSubError(json.error ?? 'Could not subscribe.')
      }
    } catch {
      setSubError('Something went wrong.')
    } finally {
      setSubLoading(false)
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/arena/sessions/${joinCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName.trim(), email: email.trim() || undefined }),
      })
      if (res.ok) {
        const json = await res.json() as { participantId: string }
        setParticipantId(json.participantId)
        if (sessionStatus === 'active') {
          router.push(`/arena/${joinCode}/play?pid=${json.participantId}`)
        } else {
          setPhase('lobby')
        }
      } else {
        const json = await res.json() as { error?: string }
        setError(json.error ?? 'Could not join. Try again.')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  // ── Ended ────────────────────────────────────────────────────────────────────
  if (sessionStatus === 'completed' || sessionStatus === 'cancelled') {
    return (
      <div className="w-full max-w-sm text-center text-white">
        <p className="text-xl font-bold mb-2">Session ended</p>
        <p className="text-white/70 text-sm">This game session has already finished.</p>
      </div>
    )
  }

  // ── Countdown ────────────────────────────────────────────────────────────────
  if (phase === 'countdown') {
    const { days, hours, minutes, seconds } = timeLeft
    const allZero = days === 0 && hours === 0 && minutes === 0 && seconds === 0
    return (
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Cloud Arena</p>
          <p className="text-white font-black text-2xl leading-tight">{eventName}</p>
          <p className="text-white/60 text-sm mt-1">Hosted by {hostName}</p>
        </div>

        <div className="bg-white/10 rounded-2xl p-6">
          {allZero ? (
            <p className="text-white font-bold text-lg animate-pulse">Starting now…</p>
          ) : (
            <>
              <p className="text-white/60 text-xs uppercase tracking-wide mb-4">Game starts in</p>
              <div className="flex justify-center gap-3">
                {days > 0 && (
                  <div className="text-center">
                    <p className="text-4xl font-black text-white tabular-nums">{String(days).padStart(2, '0')}</p>
                    <p className="text-white/50 text-xs mt-1">days</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-4xl font-black text-white tabular-nums">{String(hours).padStart(2, '0')}</p>
                  <p className="text-white/50 text-xs mt-1">hrs</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-black text-white tabular-nums">{String(minutes).padStart(2, '0')}</p>
                  <p className="text-white/50 text-xs mt-1">min</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-black text-brand-accent tabular-nums">{String(seconds).padStart(2, '0')}</p>
                  <p className="text-white/50 text-xs mt-1">sec</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-white/10 rounded-2xl p-5 space-y-3">
          {subDone ? (
            <p className="text-green-300 text-sm font-medium">
              ✓ You&apos;ll get an email the moment the game goes live.
            </p>
          ) : (
            <>
              <p className="text-white/80 text-sm font-medium">Get notified when it starts</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                />
                <button
                  type="submit"
                  disabled={subLoading}
                  className="bg-brand-accent hover:bg-orange-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
                >
                  {subLoading ? '…' : 'Notify me'}
                </button>
              </form>
              {subError && <p className="text-red-300 text-xs">{subError}</p>}
            </>
          )}
        </div>

        <p className="text-white/40 text-xs">
          {questionCount} questions · {timePerQ}s each
        </p>
      </div>
    )
  }

  // ── Lobby ────────────────────────────────────────────────────────────────────
  if (phase === 'lobby') {
    return (
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Cloud Arena</p>
          <p className="text-white font-bold text-xl">You&apos;re in the lobby</p>
          <p className="text-white/60 text-sm mt-1">Hosted by {hostName}</p>
        </div>

        <div className="bg-white/10 rounded-2xl p-5">
          <p className="text-white/70 text-xs mb-3 uppercase tracking-wide">
            {scheduledAt ? 'WAITING TO START' : 'Waiting to start'}
          </p>
          <div className="space-y-2">
            {participants.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <span className={`text-sm ${p.display_name === displayName ? 'text-white font-bold' : 'text-white/80'}`}>
                  {p.display_name}
                  {p.display_name === displayName && ' (you)'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 rounded-xl px-4 py-3 text-white/70 text-xs">
          {questionCount} questions · {timePerQ}s each —{' '}
          {scheduledAt ? 'starting automatically at scheduled time…' : 'waiting for host to start…'}
        </div>

        <div className="flex justify-center">
          <span className="inline-flex gap-1">
            {[0,1,2].map(i => (
              <span key={i} className="w-2 h-2 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </span>
        </div>
      </div>
    )
  }

  // ── Join form ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Cloud Arena</p>
        {title ? (
          <p className="text-white font-black text-xl leading-tight">{title}</p>
        ) : (
          <p className="text-4xl font-black tracking-widest text-white font-mono">{joinCode}</p>
        )}
        <p className="text-white/70 text-sm mt-2">Hosted by {hostName}</p>
        <p className="text-white/50 text-xs mt-1">{questionCount} questions · {timePerQ}s each</p>
      </div>

      {sessionStatus === 'active' && (
        <div className="bg-brand-accent/20 border border-brand-accent/40 rounded-xl px-4 py-3 text-center">
          <p className="text-white font-bold text-sm">🎮 Game is live — join now!</p>
          <p className="text-white/60 text-xs mt-0.5">5 attempts · best score counts</p>
        </div>
      )}

      <form onSubmit={handleJoin} className="bg-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-1">Your name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            maxLength={30}
            placeholder="e.g. Sarah"
            autoFocus
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-1">
            Email <span className="text-white/40 font-normal">(optional)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
          />
        </div>

        {error && <p className="text-red-300 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || !displayName.trim()}
          className="w-full bg-brand-accent hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Joining…' : 'Join Game →'}
        </button>
      </form>

      {sessionStatus === 'active' && leaderboard.length > 0 && (
        <div className="bg-black border border-yellow-400/30 overflow-hidden"
          style={{ boxShadow: '0 0 30px rgba(255,215,0,0.1)' }}>
          <div className="px-4 py-2 border-b border-yellow-400/20 bg-yellow-400/5 text-center">
            <p className="text-yellow-400 tracking-[0.4em] text-sm font-mono">
              TOP {leaderboard.length} · HALL OF FAME
            </p>
          </div>
          <div className="divide-y divide-white/5 font-mono">
            {leaderboard.map((entry) => (
              <div key={entry.rank} className="grid grid-cols-[1.5rem_1fr_auto] gap-3 px-4 py-2 hover:bg-white/5">
                <span className={`text-lg tabular-nums ${
                  entry.rank === 1 ? 'text-yellow-400' :
                  entry.rank === 2 ? 'text-gray-300' :
                  entry.rank === 3 ? 'text-orange-400' : 'text-white/30'
                }`}>
                  {entry.rank.toString().padStart(2, '0')}
                </span>
                <span className="text-lg text-white truncate tracking-wide">
                  {entry.display_name.toUpperCase().slice(0, 14)}
                </span>
                <span className="text-lg tabular-nums font-bold text-green-400">
                  {entry.best_score.toString().padStart(6, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
