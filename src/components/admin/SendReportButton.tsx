'use client'

import { useState } from 'react'

interface SendReportButtonProps {
  companyId: string
  companyName: string
}

export default function SendReportButton({ companyId, companyName }: SendReportButtonProps) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSend() {
    if (!confirm(`Send AI Maturity Report for "${companyName}" to your admin email?`)) return
    setLoading(true)
    setError('')
    setSent(false)

    try {
      const res = await fetch(`/api/admin/companies/${companyId}/report`, { method: 'POST' })
      const json = await res.json() as { ok?: boolean; error?: string; sentTo?: string }
      if (res.ok && json.ok) {
        setSent(true)
      } else {
        setError(json.error ?? 'Failed to send report.')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSend}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-opacity-90 disabled:opacity-60 transition-colors shadow-sm"
      >
        {loading ? 'Sending…' : '✉ Send Report'}
      </button>
      {sent && <span className="text-green-600 text-xs font-medium">Report sent!</span>}
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  )
}
