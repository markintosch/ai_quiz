'use client'

// Up/down vote control for the Tool Wall. Optimistic, sessionStorage-keyed.
// Posts to /api/ai_benchmark/tool_vote; toggling the same direction unvotes.

import { useEffect, useState } from 'react'
import { getSessionId, trackBenchEvent } from './Tracker'

const ACCENT = '#1D4ED8'
const WARM   = '#D97706'
const INK    = '#0F172A'
const MUTED  = '#94A3B8'
const BORDER = '#E2E8F0'

type VoteState = -1 | 0 | 1

export function VoteButtons({
  toolId,
  initialScore,
  initialVoterCount,
}: {
  toolId:            string
  initialScore:      number
  initialVoterCount: number
}) {
  const [score, setScore]           = useState(initialScore)
  const [voterCount, setVoterCount] = useState(initialVoterCount)
  const [myVote, setMyVote]         = useState<VoteState>(0)
  const [hydrated, setHydrated]     = useState(false)
  const [loading, setLoading]       = useState(false)

  // Hydrate user's existing vote on first paint
  useEffect(() => {
    let cancelled = false
    const sid = getSessionId()
    fetch(`/api/ai_benchmark/tool_votes?session_id=${encodeURIComponent(sid)}`)
      .then(r => r.ok ? r.json() : {})
      .then((map: Record<string, number>) => {
        if (cancelled) return
        const v = map[toolId]
        if (v === 1 || v === -1) setMyVote(v as VoteState)
        setHydrated(true)
      })
      .catch(() => setHydrated(true))
    return () => { cancelled = true }
  }, [toolId])

  async function vote(dir: 1 | -1) {
    if (loading) return
    const newDir: VoteState = myVote === dir ? 0 : dir
    const delta = newDir - myVote
    const voterDelta =
      myVote === 0 && newDir !== 0 ?  1 :
      myVote !== 0 && newDir === 0 ? -1 : 0

    setMyVote(newDir)
    setScore(s => s + delta)
    setVoterCount(c => c + voterDelta)
    setLoading(true)

    try {
      const sid = getSessionId()
      await fetch('/api/ai_benchmark/tool_vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool_id: toolId, direction: newDir, session_id: sid }),
        keepalive: true,
      })
      trackBenchEvent('vote_cast' as 'page_view', { meta: { toolId, direction: newDir } })
    } catch {
      // Roll back on network failure
      setMyVote(myVote)
      setScore(s => s - delta)
      setVoterCount(c => c - voterDelta)
    } finally {
      setLoading(false)
    }
  }

  const upActive   = myVote === 1
  const downActive = myVote === -1

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: hydrated ? 1 : 0.7, transition: 'opacity 0.2s' }}>
      <button
        type="button"
        onClick={() => vote(1)}
        disabled={loading}
        aria-label="Upvote"
        style={{
          width: 28, height: 28, borderRadius: 8,
          border: `1.5px solid ${upActive ? ACCENT : BORDER}`,
          background: upActive ? ACCENT : '#fff',
          color: upActive ? '#fff' : INK,
          fontSize: 14, fontWeight: 800, cursor: loading ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >▲</button>

      <span style={{
        minWidth: 32, textAlign: 'center', fontSize: 14, fontWeight: 800,
        color: score > 0 ? ACCENT : score < 0 ? '#B91C1C' : INK,
      }}>
        {score > 0 ? `+${score}` : score}
      </span>

      <button
        type="button"
        onClick={() => vote(-1)}
        disabled={loading}
        aria-label="Downvote"
        style={{
          width: 28, height: 28, borderRadius: 8,
          border: `1.5px solid ${downActive ? '#B91C1C' : BORDER}`,
          background: downActive ? '#B91C1C' : '#fff',
          color: downActive ? '#fff' : INK,
          fontSize: 14, fontWeight: 800, cursor: loading ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >▼</button>

      <span style={{ fontSize: 11, color: MUTED, marginLeft: 4 }}>
        {voterCount} {voterCount === 1 ? 'stem' : 'stemmen'}
      </span>

      {/* Suppress unused */}
      <span style={{ display: 'none' }}>{WARM}</span>
    </div>
  )
}
