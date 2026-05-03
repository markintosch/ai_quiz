'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  icpId:     string
  current:   'pending' | 'validated' | 'dismissed' | 'superseded'
  /** Other ICPs for the same brand — used in "supersede" picker. */
  brandSiblings: Array<{ id: string; created_at: string; industry: string | null; role: string | null }>
}

export default function IcpRowActions({ icpId, current, brandSiblings }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNote, setShowNote] = useState(false)
  const [note, setNote] = useState('')
  const [showSupersede, setShowSupersede] = useState(false)

  async function patch(body: object) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/atelier/icp/${icpId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      router.refresh()
      setShowNote(false)
      setShowSupersede(false)
      setNote('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update mislukt.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        <ActionButton
          active={current === 'validated'}
          color="green"
          onClick={() => patch({ validation_status: 'validated' })}
          disabled={busy}
        >
          ✓ Validated
        </ActionButton>
        <ActionButton
          active={current === 'pending'}
          color="gray"
          onClick={() => patch({ validation_status: 'pending' })}
          disabled={busy}
        >
          Pending
        </ActionButton>
        <ActionButton
          active={current === 'dismissed'}
          color="red"
          onClick={() => patch({ validation_status: 'dismissed' })}
          disabled={busy}
        >
          ✗ Dismissed
        </ActionButton>
        <ActionButton
          color="amber"
          onClick={() => setShowNote(v => !v)}
          disabled={busy}
        >
          ✎ Note
        </ActionButton>
        {brandSiblings.length > 0 && (
          <ActionButton
            color="blue"
            onClick={() => setShowSupersede(v => !v)}
            disabled={busy}
          >
            → Supersede
          </ActionButton>
        )}
      </div>

      {showNote && (
        <div className="space-y-1">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Validation note — wat klopt / klopt niet, wat is bevestigd in de werksessie..."
            rows={2}
            className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
            disabled={busy}
          />
          <button
            onClick={() => patch({ validation_note: note })}
            disabled={busy || note.trim().length === 0}
            className="text-xs bg-brand-dark text-white px-2 py-1 rounded hover:bg-brand-accent disabled:opacity-50"
          >
            Save note
          </button>
        </div>
      )}

      {showSupersede && (
        <div className="space-y-1">
          <select
            onChange={e => {
              if (e.target.value) patch({ superseded_by_id: e.target.value })
            }}
            disabled={busy}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1"
            defaultValue=""
          >
            <option value="">Kies de nieuwere ICP voor deze brand…</option>
            {brandSiblings.map(s => (
              <option key={s.id} value={s.id}>
                {new Date(s.created_at).toLocaleDateString('nl-NL')} · {s.industry ?? '?'} · {s.role ?? '?'}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  )
}

function ActionButton({ children, active, color, onClick, disabled }: {
  children: React.ReactNode
  active?: boolean
  color: 'green' | 'red' | 'gray' | 'amber' | 'blue'
  onClick: () => void
  disabled?: boolean
}) {
  const palette: Record<string, { active: string; idle: string }> = {
    green: { active: 'bg-green-600 text-white',   idle: 'bg-green-50 text-green-800 hover:bg-green-100' },
    red:   { active: 'bg-red-600 text-white',     idle: 'bg-red-50 text-red-800 hover:bg-red-100' },
    gray:  { active: 'bg-gray-700 text-white',    idle: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
    amber: { active: 'bg-amber-500 text-white',   idle: 'bg-amber-50 text-amber-800 hover:bg-amber-100' },
    blue:  { active: 'bg-blue-600 text-white',    idle: 'bg-blue-50 text-blue-800 hover:bg-blue-100' },
  }
  const cls = active ? palette[color].active : palette[color].idle
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded transition-colors disabled:opacity-50 ${cls}`}
    >
      {children}
    </button>
  )
}
