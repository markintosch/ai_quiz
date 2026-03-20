'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  cohortId: string
}

export function AddWaveForm({ cohortId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/cohorts/${cohortId}/waves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim(), wave_date: date || null }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to create wave')
        return
      }
      setOpen(false)
      setLabel('')
      setDate('')
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20 transition-colors"
      >
        + Add wave
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap">
      <input
        type="text"
        placeholder="Wave label (e.g. Post-workshop)"
        value={label}
        onChange={e => setLabel(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30 w-52"
        autoFocus
      />
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
      <button
        type="submit"
        disabled={loading || !label.trim()}
        className="px-3 py-2 rounded-lg text-sm font-medium bg-brand text-white hover:bg-brand-dark disabled:opacity-50 transition-colors"
      >
        {loading ? 'Creating…' : 'Create'}
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setError(null) }}
        className="px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
      >
        Cancel
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  )
}
