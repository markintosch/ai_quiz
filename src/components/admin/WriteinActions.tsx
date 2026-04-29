'use client'

// Action buttons for the write-in moderation queue.
// Reject / Reviewed / Promote / Merge — each PATCHes the row's status.

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Option { id: string; label: string }

export function WriteinActions({
  id, currentStatus, options,
}: {
  id:            string
  currentStatus: string
  options:       Option[]   // canonical options of the parent question
}) {
  const router = useRouter()
  const [busy, setBusy]       = useState(false)
  const [merging, setMerging] = useState(false)
  const [target, setTarget]   = useState('')
  const [error, setError]     = useState('')

  async function send(status: string, merge_target?: string) {
    if (busy) return
    setBusy(true); setError('')
    try {
      const res = await fetch(`/api/admin/ai_benchmark/writeins/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status, merge_target }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? 'Update failed')
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
      setBusy(false)
    }
  }

  if (merging) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
        <select
          value={target}
          onChange={e => setTarget(e.target.value)}
          disabled={busy}
          style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
        >
          <option value="">— Pick option —</option>
          {options.map(o => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={() => target && send('merged', target)}
          disabled={busy || !target}
          style={btnPrimary}
        >
          Merge
        </button>
        <button
          onClick={() => { setMerging(false); setTarget('') }}
          disabled={busy}
          style={btnGhost}
        >
          Cancel
        </button>
        {error && <span style={{ color: '#B91C1C', fontSize: 11 }}>{error}</span>}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
      {currentStatus === 'pending' && (
        <button onClick={() => send('reviewed')} disabled={busy} style={btnGhost} title="Just acknowledge — keeps row visible elsewhere">
          ✓ Seen
        </button>
      )}
      <button onClick={() => send('promoted')} disabled={busy} style={btnPrimary} title="Mark as ready to add to canonical Q2 list (still requires data.ts edit)">
        ↑ Promote
      </button>
      <button onClick={() => setMerging(true)} disabled={busy} style={btnGhost} title="Merge into an existing canonical option">
        ⇆ Merge
      </button>
      <button onClick={() => send('rejected')} disabled={busy} style={btnDanger} title="Dismiss as noise / spam">
        ✕ Reject
      </button>
      {error && <span style={{ color: '#B91C1C', fontSize: 11 }}>{error}</span>}
    </div>
  )
}

const btnBase = {
  padding: '5px 10px',
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
  border: '1px solid',
  fontFamily: 'inherit',
}
const btnPrimary = { ...btnBase, background: '#1D4ED8', color: '#fff', borderColor: '#1D4ED8' }
const btnGhost   = { ...btnBase, background: '#fff',    color: '#374151', borderColor: '#d1d5db' }
const btnDanger  = { ...btnBase, background: '#fff',    color: '#B91C1C', borderColor: '#fca5a5' }
