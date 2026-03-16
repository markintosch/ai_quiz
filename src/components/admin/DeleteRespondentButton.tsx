'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  respondentId: string
  name: string
}

export function DeleteRespondentButton({ respondentId, name }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!confirm(`Delete "${name}" and all their data? This cannot be undone.`)) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/respondents/${respondentId}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Delete failed')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      setLoading(false)
    }
  }

  return (
    <span>
      <button
        onClick={handleDelete}
        disabled={loading}
        title={`Delete ${name}`}
        className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40 text-base leading-none"
      >
        {loading ? '…' : '✕'}
      </button>
      {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
    </span>
  )
}
