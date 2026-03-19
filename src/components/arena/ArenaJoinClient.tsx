'use client'

// FILE: src/components/arena/ArenaJoinClient.tsx
// Handles join form + lobby waiting room (polls for game start)
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Participant { id: string; display_name: string }

interface Props {
  joinCode: string
  hostName: string
  status: string
  questionCount: number
  timePerQ: number
  initialParticipants: Participant[]
}

export default function ArenaJoinClient({
  joinCode, hostName, status: initialStatus,
  questionCount, timePerQ, initialParticipants,
}: Props) {
  const router = useRouter()
  const [phase, setPhase] = useState<'form' | 'lobby'>(initialStatus === 'active' ? 'form' : 'form')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [participantId, setParticipantId] = useState('')
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants)
  const [sessionStatus, setSessionStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  useEffect(() => {
    if (phase !== 'lobby') return
    const interval = setInterval(poll, 2000)
    return () => clearInterval(interval)
  }, [phase, poll])

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
        setPhase('lobby')
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

  if (sessionStatus === 'completed' || sessionStatus === 'cancelled') {
    return (
      <div className="w-full max-w-sm text-center text-white">
        <p className="text-xl font-bold mb-2">Session ended</p>
        <p className="text-white/70 text-sm">This game session has already finished.</p>
      </div>
    )
  }

  if (phase === 'lobby') {
    return (
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Cloud Arena</p>
          <p className="text-white font-bold text-xl">You&apos;re in the lobby</p>
          <p className="text-white/60 text-sm mt-1">Hosted by {hostName}</p>
        </div>

        <div className="bg-white/10 rounded-2xl p-5">
          <p className="text-white/70 text-xs mb-3 uppercase tracking-wide">Waiting to start</p>
          <div className="space-y-2">
            {participants.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <span className={`text-sm ${p.id === participantId || p.display_name === displayName ? 'text-white font-bold' : 'text-white/80'}`}>
                  {p.display_name}
                  {p.display_name === displayName && ' (you)'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 rounded-xl px-4 py-3 text-white/70 text-xs">
          {questionCount} questions · {timePerQ}s each — waiting for host to start…
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

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Cloud Arena</p>
        <p className="text-4xl font-black tracking-widest text-white font-mono">{joinCode}</p>
        <p className="text-white/70 text-sm mt-2">Hosted by {hostName}</p>
        <p className="text-white/50 text-xs mt-1">{questionCount} questions · {timePerQ}s each</p>
      </div>

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
    </div>
  )
}
