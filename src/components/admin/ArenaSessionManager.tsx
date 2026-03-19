'use client'

// FILE: src/components/admin/ArenaSessionManager.tsx
// Live session management: polls participant list, start button, status display
import { useState, useEffect, useCallback } from 'react'

interface Participant {
  id: string
  display_name: string
  score: number
  rank: number | null
  joined_at: string
}

interface Session {
  id: string
  join_code: string
  host_name: string
  status: string
  question_count: number
  time_per_q: number
  started_at: string | null
  ended_at: string | null
}

export default function ArenaSessionManager({
  session: initialSession,
  initialParticipants,
}: {
  session: Session
  initialParticipants: Participant[]
}) {
  const [session, setSession] = useState(initialSession)
  const [participants, setParticipants] = useState(initialParticipants)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/arena/sessions/${session.join_code}`, { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json() as { session: Session; participants: Participant[] }
      setSession(json.session)
      setParticipants(json.participants)
    } catch { /* ignore */ }
  }, [session.join_code])

  useEffect(() => {
    if (session.status === 'lobby') {
      const interval = setInterval(poll, 3000)
      return () => clearInterval(interval)
    }
  }, [session.status, poll])

  async function handleStart() {
    setError('')
    setStarting(true)
    try {
      const res = await fetch(`/api/arena/sessions/${session.join_code}/start`, { method: 'POST' })
      if (res.ok) {
        await poll()
      } else {
        const json = await res.json() as { error?: string }
        setError(json.error ?? 'Failed to start')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setStarting(false)
    }
  }

  const statusColor = {
    lobby:     'text-yellow-600 bg-yellow-50',
    active:    'text-green-600 bg-green-50',
    completed: 'text-gray-600 bg-gray-100',
    cancelled: 'text-red-600 bg-red-50',
  }[session.status] ?? 'text-gray-500'

  return (
    <div className="space-y-5">
      {/* Session info card */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Join code</p>
            <p className="text-4xl font-black font-mono tracking-widest text-brand">{session.join_code}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColor}`}>
            {session.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
          <div><p className="text-xs text-gray-400 mb-0.5">Host</p>{session.host_name}</div>
          <div><p className="text-xs text-gray-400 mb-0.5">Questions</p>{session.question_count}</div>
          <div><p className="text-xs text-gray-400 mb-0.5">Time/Q</p>{session.time_per_q}s</div>
        </div>

        {session.status === 'lobby' && (
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-sm text-gray-500">
              {participants.length === 0
                ? 'Waiting for players to join…'
                : `${participants.length} player${participants.length !== 1 ? 's' : ''} in lobby`}
            </p>
            {error && <p className="text-brand-accent text-sm">{error}</p>}
            <button
              onClick={handleStart}
              disabled={starting || participants.length === 0}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              {starting ? 'Starting…' : 'Start Game'}
            </button>
          </div>
        )}

        {session.status === 'active' && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm text-green-600 font-medium">Game in progress</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Started {session.started_at ? new Date(session.started_at).toLocaleTimeString() : ''}
            </p>
          </div>
        )}

        {session.status === 'completed' && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600 font-medium">Game completed</p>
          </div>
        )}
      </div>

      {/* Participants / leaderboard */}
      {participants.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">
              {session.status === 'completed' ? 'Final Leaderboard' : 'Players'}
            </p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="text-left px-4 py-2">#</th>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-right px-4 py-2">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {participants.map((p, i) => (
                <tr key={p.id} className={i === 0 && session.status === 'completed' ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-2.5 text-gray-400 font-mono">
                    {session.status === 'completed' && p.rank
                      ? p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : p.rank
                      : i + 1}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-gray-800">{p.display_name}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-brand">{p.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
