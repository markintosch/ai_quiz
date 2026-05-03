'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  sourceId: string
  active:   boolean
  isSystem: boolean
}

export default function SourceRowActions({ sourceId, active, isSystem }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function patch(body: object) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/atelier/sources/${sourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update mislukt.')
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm('Weet je zeker dat je deze bron wil verwijderen?')) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/atelier/sources/${sourceId}`, { method: 'DELETE' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete mislukt.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => patch({ active: !active })}
        disabled={busy}
        className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded transition-colors disabled:opacity-50 ${
          active ? 'bg-green-50 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {active ? '✓ Active' : '○ Inactive'}
      </button>
      {!isSystem && (
        <button
          onClick={remove}
          disabled={busy}
          className="text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
        >
          Delete
        </button>
      )}
      {error && <p className="text-[11px] text-red-700">{error}</p>}
    </div>
  )
}
