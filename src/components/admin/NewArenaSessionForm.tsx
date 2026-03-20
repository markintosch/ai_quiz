'use client'

// FILE: src/components/admin/NewArenaSessionForm.tsx
import { useState } from 'react'
import Link from 'next/link'

interface CompanyOption { id: string; name: string }

export default function NewArenaSessionForm({ companies }: { companies: CompanyOption[] }) {
  const [hostName, setHostName]       = useState('')
  const [title, setTitle]             = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [questionCount, setQCount]    = useState(10)
  const [timePerQ, setTimePerQ]       = useState(30)
  const [companyId, setCompanyId]     = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [result, setResult]           = useState<{ joinCode: string; sessionId: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/arena/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host_name:      hostName.trim(),
          title:          title.trim() || null,
          scheduled_at:   scheduledAt || null,
          question_count: questionCount,
          time_per_q:     timePerQ,
          company_id:     companyId || null,
        }),
      })

      if (res.ok) {
        const json = await res.json() as { joinCode: string; sessionId: string }
        setResult(json)
      } else {
        const json = await res.json() as { error?: string }
        setError(json.error ?? 'Failed to create session.')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    const joinUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/arena/${result.joinCode}`
      : `/arena/${result.joinCode}`

    return (
      <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm text-center space-y-6">
        <div>
          <p className="text-sm text-gray-500 mb-2">Session created! Share this join code:</p>
          <div className="inline-block bg-brand rounded-xl px-10 py-6">
            <p className="text-5xl font-black tracking-widest text-white font-mono">{result.joinCode}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Shareable URL</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-brand break-all">{joinUrl}</code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(joinUrl)}
              className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded hover:bg-white transition-colors whitespace-nowrap"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Post this on LinkedIn or share in Slack — players click it directly.
            {scheduledAt && ' They\'ll see a countdown and can register for email notification.'}
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href={`/admin/arena/${result.joinCode}`}
            className="bg-brand-accent hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            Manage session →
          </Link>
          <Link
            href="/admin/arena"
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
          >
            Back to list
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-6 space-y-5 shadow-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event title <span className="text-gray-400 font-normal">(optional — shown to players)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. TrueFullstaq Cloud Knowledge Challenge"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Host name <span className="text-brand-accent">*</span>
        </label>
        <input
          type="text"
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
          required
          placeholder="e.g. Mark de Kock"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Scheduled start <span className="text-gray-400 font-normal">(optional — leave blank for manual start)</span>
        </label>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
        {scheduledAt && (
          <p className="text-xs text-teal-600 mt-1">
            Game will auto-start at this time. Share the URL now — players can register for email notification.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Questions</label>
          <input
            type="number"
            min={1}
            max={30}
            value={questionCount}
            onChange={(e) => setQCount(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seconds / question</label>
          <select
            value={timePerQ}
            onChange={(e) => setTimePerQ(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white"
          >
            {[15, 20, 30, 45, 60].map(t => (
              <option key={t} value={t}>{t}s</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white"
        >
          <option value="">— None —</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-brand-accent text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-brand-accent hover:bg-red-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {loading ? 'Creating…' : 'Create Session'}
        </button>
        <Link
          href="/admin/arena"
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
