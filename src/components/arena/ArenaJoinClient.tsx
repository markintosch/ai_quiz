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

// ── Sidebar: How to play + leaderboard/participants ──────────────────────────
function Sidebar({
  sessionStatus,
  leaderboard,
  participants,
  displayName,
  questionCount,
  timePerQ,
}: {
  sessionStatus: string
  leaderboard: LeaderboardEntry[]
  participants: Participant[]
  displayName: string
  questionCount: number
  timePerQ: number
}) {
  const isActive = sessionStatus === 'active'

  return (
    <div className="w-full lg:w-72 flex-shrink-0 space-y-4">

      {/* How to play */}
      <div className="border border-white/10 bg-black/20 p-4">
        <p
          className="text-yellow-400/50 mb-4 tracking-widest"
          style={{ fontFamily: 'var(--font-press-start)', fontSize: '8px' }}
        >
          HOW TO PLAY
        </p>
        <div className="space-y-3">
          {[
            { n: '01', text: 'Enter your callsign and hit PLAY' },
            { n: '02', text: `Answer all ${questionCount} questions` },
            { n: '03', text: `${timePerQ}s per question — speed bonus for fast answers` },
            { n: '04', text: '5 attempts allowed — best score is what counts' },
          ].map(({ n, text }) => (
            <div key={n} className="flex gap-3 items-start">
              <span className="text-yellow-400/40 text-xl tabular-nums w-7 flex-shrink-0">{n}</span>
              <span className="text-white/60 text-xl leading-snug">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live leaderboard (when active) */}
      {isActive && leaderboard.length > 0 && (
        <div className="border border-yellow-400/30 bg-black/20" style={{ boxShadow: '0 0 20px rgba(255,215,0,0.08)' }}>
          <div className="px-4 py-2 border-b border-yellow-400/20 bg-yellow-400/5 text-center">
            <p
              className="text-yellow-400 tracking-[0.3em]"
              style={{ fontFamily: 'var(--font-press-start)', fontSize: '8px', textShadow: '0 0 8px #FFD700' }}
            >
              LIVE LEADERBOARD
            </p>
          </div>
          <div className="divide-y divide-white/5">
            {leaderboard.slice(0, 10).map((entry) => (
              <div key={entry.rank} className="grid grid-cols-[1.5rem_1fr_auto] gap-2 px-3 py-2 hover:bg-white/5">
                <span className={`text-xl tabular-nums ${
                  entry.rank === 1 ? 'text-yellow-400' :
                  entry.rank === 2 ? 'text-gray-300' :
                  entry.rank === 3 ? 'text-orange-400' : 'text-white/30'
                }`}>
                  {entry.rank.toString().padStart(2, '0')}
                </span>
                <span className="text-xl text-white truncate tracking-wide">
                  {entry.display_name.toUpperCase().slice(0, 12)}
                </span>
                <span className="text-xl tabular-nums text-green-400">
                  {entry.best_score.toString().padStart(5, '0')}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 px-3 py-2 text-center">
            <p className="text-white/30 text-base tracking-widest">UPDATES EVERY 10S</p>
          </div>
        </div>
      )}

      {/* Participants in lobby (when waiting) */}
      {!isActive && participants.length > 0 && (
        <div className="border border-white/10 bg-black/20 p-4">
          <p
            className="text-white/40 mb-3 tracking-widest"
            style={{ fontFamily: 'var(--font-press-start)', fontSize: '8px' }}
          >
            {participants.length} PLAYER{participants.length !== 1 ? 'S' : ''} WAITING
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {participants.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 animate-pulse" />
                <span className={`text-xl tracking-wide truncate ${p.display_name === displayName ? 'text-cyan-300' : 'text-white/70'}`}>
                  {p.display_name.toUpperCase()}
                  {p.display_name === displayName && <span className="text-cyan-400/50 ml-1">&lt;YOU&gt;</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sponsor slot */}
      <div className="border border-white/10 p-3 text-center">
        <p
          className="text-white/20 mb-3 tracking-widest"
          style={{ fontFamily: 'var(--font-press-start)', fontSize: '7px' }}
        >
          POWERED BY
        </p>
        <div className="border border-white/10 bg-white/5 h-16 flex items-center justify-center px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/truefullstaq.svg" alt="TrueFullstaq" className="max-h-10 w-auto opacity-70" />
        </div>
      </div>

    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ArenaJoinClient({
  joinCode, hostName, title, status: initialStatus,
  questionCount, timePerQ, scheduledAt, initialParticipants, initialLeaderboard,
}: Props) {
  const router = useRouter()

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
    setPhase('form')
    setSessionStatus('active')
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

  // Poll during countdown (someone else or admin may start early)
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

  // ── Session ended ─────────────────────────────────────────────────────────
  if (sessionStatus === 'completed' || sessionStatus === 'cancelled') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p
          className="text-orange-400/60 mb-3"
          style={{ fontFamily: 'var(--font-press-start)', fontSize: '11px' }}
        >
          GAME OVER
        </p>
        <p className="text-white text-3xl tracking-widest mb-2">SESSION ENDED</p>
        <p className="text-white/50 text-xl tracking-wide">This game session has already finished.</p>
      </div>
    )
  }

  // ── Countdown phase ───────────────────────────────────────────────────────
  if (phase === 'countdown') {
    const { days, hours, minutes, seconds } = timeLeft
    const allZero = days === 0 && hours === 0 && minutes === 0 && seconds === 0
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Main: countdown */}
        <div className="flex-1 space-y-6">
          <div className="border border-white/10 bg-black/30 p-6 text-center">
            <p
              className="text-orange-400/70 mb-5 tracking-widest"
              style={{ fontFamily: 'var(--font-press-start)', fontSize: '9px' }}
            >
              GAME STARTS IN
            </p>
            {allZero ? (
              <p
                className="text-yellow-400 text-3xl tracking-widest animate-pulse"
                style={{ textShadow: '0 0 20px #FFD700' }}
              >
                STARTING NOW…
              </p>
            ) : (
              <div className="flex justify-center gap-6">
                {days > 0 && (
                  <div className="text-center">
                    <p
                      className="text-white tabular-nums"
                      style={{ fontFamily: 'var(--font-press-start)', fontSize: 'clamp(28px, 8vw, 56px)', textShadow: '0 0 15px rgba(255,255,255,0.3)' }}
                    >
                      {String(days).padStart(2, '0')}
                    </p>
                    <p className="text-white/40 text-xl tracking-widest mt-1">DAYS</p>
                  </div>
                )}
                <div className="text-center">
                  <p
                    className="text-white tabular-nums"
                    style={{ fontFamily: 'var(--font-press-start)', fontSize: 'clamp(28px, 8vw, 56px)', textShadow: '0 0 15px rgba(255,255,255,0.3)' }}
                  >
                    {String(hours).padStart(2, '0')}
                  </p>
                  <p className="text-white/40 text-xl tracking-widest mt-1">HRS</p>
                </div>
                <div className="text-center">
                  <p
                    className="text-white tabular-nums"
                    style={{ fontFamily: 'var(--font-press-start)', fontSize: 'clamp(28px, 8vw, 56px)', textShadow: '0 0 15px rgba(255,255,255,0.3)' }}
                  >
                    {String(minutes).padStart(2, '0')}
                  </p>
                  <p className="text-white/40 text-xl tracking-widest mt-1">MIN</p>
                </div>
                <div className="text-center">
                  <p
                    className="text-brand-accent tabular-nums"
                    style={{ fontFamily: 'var(--font-press-start)', fontSize: 'clamp(28px, 8vw, 56px)', textShadow: '0 0 15px #E8611A' }}
                  >
                    {String(seconds).padStart(2, '0')}
                  </p>
                  <p className="text-white/40 text-xl tracking-widest mt-1">SEC</p>
                </div>
              </div>
            )}
          </div>

          {/* Subscribe */}
          <div className="border border-white/10 bg-black/20 p-5">
            <p
              className="text-white/50 mb-4 tracking-widest"
              style={{ fontFamily: 'var(--font-press-start)', fontSize: '8px' }}
            >
              GET NOTIFIED WHEN IT STARTS
            </p>
            {subDone ? (
              <div className="border border-green-400/30 bg-green-400/5 px-4 py-3 text-center">
                <p className="text-green-400 text-xl tracking-widest">✓ YOU&apos;RE ON THE LIST</p>
                <p className="text-white/40 text-lg mt-1">We&apos;ll email you the moment the game goes live.</p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={subEmail}
                    onChange={(e) => setSubEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="flex-1 bg-black/50 border border-white/20 px-3 py-3 text-white text-xl placeholder-white/20 focus:outline-none focus:border-yellow-400/50 tracking-wide"
                  />
                  <button
                    type="submit"
                    disabled={subLoading}
                    className="border-2 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black disabled:opacity-50 font-bold px-5 py-3 text-xl tracking-widest transition-colors whitespace-nowrap"
                    style={{ fontFamily: 'var(--font-press-start)', fontSize: '9px' }}
                  >
                    {subLoading ? '…' : 'NOTIFY'}
                  </button>
                </form>
                {subError && <p className="text-red-400 text-lg mt-2">{subError}</p>}
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar
          sessionStatus={sessionStatus}
          leaderboard={leaderboard}
          participants={participants}
          displayName={displayName}
          questionCount={questionCount}
          timePerQ={timePerQ}
        />
      </div>
    )
  }

  // ── Lobby phase ───────────────────────────────────────────────────────────
  if (phase === 'lobby') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Main: lobby waiting state */}
        <div className="flex-1 space-y-5">
          <div className="border border-green-400/30 bg-green-400/5 p-6 text-center" style={{ boxShadow: '0 0 20px rgba(0,255,0,0.05)' }}>
            <p
              className="text-green-400/70 mb-3 tracking-widest"
              style={{ fontFamily: 'var(--font-press-start)', fontSize: '9px' }}
            >
              YOU&apos;RE IN THE LOBBY
            </p>
            <p className="text-white text-3xl tracking-wide mb-1">WELCOME, {displayName.toUpperCase()}</p>
            <p className="text-white/50 text-xl tracking-wide">
              {scheduledAt ? 'Starting automatically at scheduled time…' : `Waiting for ${hostName} to start the game…`}
            </p>
          </div>

          <div className="border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-3 mb-4">
              <p
                className="text-white/40 tracking-widest"
                style={{ fontFamily: 'var(--font-press-start)', fontSize: '8px' }}
              >
                PLAYERS IN LOBBY
              </p>
              <span className="text-green-400 text-xl">{participants.length} ONLINE</span>
            </div>
            <div className="space-y-2">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 animate-pulse" />
                  <span className={`text-xl tracking-wide ${p.display_name === displayName ? 'text-cyan-300' : 'text-white/70'}`}>
                    {p.display_name.toUpperCase()}
                    {p.display_name === displayName && <span className="text-cyan-400/50 text-lg ml-2">&lt;YOU&gt;</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pulsing waiting indicator */}
          <div className="flex justify-center gap-3 py-4">
            {[0, 1, 2, 3, 4].map(i => (
              <span
                key={i}
                className="w-3 h-3 rounded-full bg-yellow-400/40 animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar
          sessionStatus={sessionStatus}
          leaderboard={leaderboard}
          participants={participants}
          displayName={displayName}
          questionCount={questionCount}
          timePerQ={timePerQ}
        />
      </div>
    )
  }

  // ── Join form ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">

      {/* Main: join form */}
      <div className="flex-1 space-y-5">

        {/* Live game banner */}
        {sessionStatus === 'active' && (
          <div
            className="border-2 border-orange-400/60 bg-orange-400/10 px-5 py-4 text-center"
            style={{ boxShadow: '0 0 25px rgba(232,97,26,0.15)' }}
          >
            <p
              className="text-orange-400 tracking-widest mb-1"
              style={{ fontFamily: 'var(--font-press-start)', fontSize: '10px', textShadow: '0 0 10px #FF6600' }}
            >
              🎮 GAME IS LIVE
            </p>
            <p className="text-white/70 text-xl tracking-widest">JOIN NOW AND PLAY · 5 ATTEMPTS · BEST SCORE COUNTS</p>
          </div>
        )}

        {/* Form card */}
        <div className="border border-white/10 bg-black/30 p-6 space-y-5 backdrop-blur-sm">
          <p
            className="text-orange-400/70 tracking-widest"
            style={{ fontFamily: 'var(--font-press-start)', fontSize: '9px' }}
          >
            ENTER YOUR CALLSIGN
          </p>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-white/50 text-xl tracking-widest mb-2">YOUR NAME</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                maxLength={30}
                placeholder="e.g. SARAH"
                autoFocus
                className="w-full bg-black/60 border border-white/20 px-4 py-3 text-white text-2xl tracking-widest placeholder-white/20 focus:outline-none focus:border-yellow-400/50 uppercase"
              />
            </div>

            <div>
              <label className="block text-white/50 text-xl tracking-widest mb-2">
                EMAIL <span className="text-white/30 text-lg">(OPTIONAL — RESULTS TO YOUR INBOX)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-black/60 border border-white/20 px-4 py-3 text-white text-2xl tracking-wide placeholder-white/20 focus:outline-none focus:border-yellow-400/50"
              />
            </div>

            {error && (
              <div className="border border-red-400/40 bg-red-400/10 px-4 py-2">
                <p className="text-red-400 text-xl tracking-wide">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !displayName.trim()}
              className="w-full border-2 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed py-4 text-2xl tracking-[0.3em] transition-colors font-bold"
              style={{ fontFamily: 'var(--font-press-start)', fontSize: '11px', textShadow: loading ? 'none' : '0 0 10px #FF6600' }}
            >
              {loading ? 'JOINING…' : 'INSERT COIN — PLAY →'}
            </button>
          </form>
        </div>

        {/* Game code display */}
        <div className="border border-white/5 bg-black/10 px-5 py-3 text-center">
          <p className="text-white/30 text-xl tracking-widest">
            JOIN CODE: <span className="text-yellow-400/60 tabular-nums">{joinCode}</span>
            <span className="text-white/20 mx-3">·</span>
            {questionCount} QUESTIONS
            <span className="text-white/20 mx-3">·</span>
            {timePerQ}S EACH
          </p>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        sessionStatus={sessionStatus}
        leaderboard={leaderboard}
        participants={participants}
        displayName={displayName}
        questionCount={questionCount}
        timePerQ={timePerQ}
      />
    </div>
  )
}
