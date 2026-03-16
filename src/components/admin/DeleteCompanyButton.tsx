'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  companyId: string
  name: string
  respondentCount: number
}

export function DeleteCompanyButton({ companyId, name, respondentCount }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    const warning = respondentCount > 0
      ? `Delete "${name}"?\n\nThis will permanently delete ${respondentCount} respondent${respondentCount === 1 ? '' : 's'} and all their responses. This cannot be undone.`
      : `Delete "${name}"? This cannot be undone.`

    if (!confirm(warning)) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/companies/${companyId}`, { method: 'DELETE' })
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
