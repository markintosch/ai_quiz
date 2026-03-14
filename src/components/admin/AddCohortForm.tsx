// FILE: src/components/admin/AddCohortForm.tsx
'use client'

import { useState } from 'react'

export default function AddCohortForm({ companyId }: { companyId: string }) {
  const [cohortName, setCohortName] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/cohorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          name: cohortName.trim(),
          date: date || null,
        }),
      })

      if (res.ok) {
        setSuccess(`Cohort "${cohortName}" created.`)
        setCohortName('')
        setDate('')
      } else {
        const json = await res.json() as { error?: string }
        setError(json.error ?? 'Failed to create cohort.')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cohort Name <span className="text-brand-accent">*</span>
        </label>
        <input
          type="text"
          value={cohortName}
          onChange={(e) => setCohortName(e.target.value)}
          required
          placeholder="Q1 2026"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-brand hover:bg-brand-light disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
      >
        {loading ? 'Adding…' : 'Add Cohort'}
      </button>

      {error && <p className="w-full text-brand-accent text-sm">{error}</p>}
      {success && <p className="w-full text-green-600 text-sm">{success}</p>}
    </form>
  )
}
