'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface PrivacyCounts {
  unconsented: { count: number; cutoffDays: number }
  retention: { count: number; cutoffDays: number }
}

interface CardState {
  loading: boolean
  result: string | null
  error: string | null
}

export default function PrivacyPage() {
  const [data, setData] = useState<PrivacyCounts | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [unconsentedState, setUnconsentedState] = useState<CardState>({ loading: false, result: null, error: null })
  const [retentionState, setRetentionState] = useState<CardState>({ loading: false, result: null, error: null })

  useEffect(() => {
    fetch('/api/admin/privacy')
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error)
        setData(json)
      })
      .catch((err) => setFetchError(err.message ?? 'Failed to load data'))
  }, [])

  async function handleDelete(mode: 'unconsented' | 'retention', count: number) {
    if (count === 0) return
    if (!confirm(`Delete ${count} record${count !== 1 ? 's' : ''}? This cannot be undone.`)) return

    const setState = mode === 'unconsented' ? setUnconsentedState : setRetentionState
    setState({ loading: true, result: null, error: null })

    try {
      const res = await fetch(`/api/admin/privacy?mode=${mode}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error ?? 'Delete failed')
      setState({ loading: false, result: `Deleted ${json.deleted} record${json.deleted !== 1 ? 's' : ''}.`, error: null })
      // Refresh counts
      const updated = await fetch('/api/admin/privacy').then((r) => r.json())
      if (!updated.error) setData(updated)
    } catch (err) {
      setState({ loading: false, result: null, error: err instanceof Error ? err.message : 'Delete failed' })
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Privacy &amp; Data Retention</h1>
      <p className="text-sm text-gray-600 mb-8">
        Manage GDPR compliance. Delete records based on consent status and retention policy.
      </p>

      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
          {fetchError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        {/* Unconsented records card */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Unconsented Records</h2>
          <p className="text-sm text-gray-600 mb-4">
            Respondents who did not give GDPR consent and whose record is older than{' '}
            <strong>{data?.unconsented.cutoffDays ?? 30} days</strong>.
          </p>
          {data ? (
            <>
              <p className="text-3xl font-bold text-gray-900 mb-4">
                {data.unconsented.count}{' '}
                <span className="text-sm font-normal text-gray-600">record{data.unconsented.count !== 1 ? 's' : ''}</span>
              </p>
              <button
                onClick={() => handleDelete('unconsented', data.unconsented.count)}
                disabled={unconsentedState.loading || data.unconsented.count === 0}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {unconsentedState.loading ? 'Deleting…' : `Delete ${data.unconsented.count} record${data.unconsented.count !== 1 ? 's' : ''}`}
              </button>
              {unconsentedState.result && (
                <p className="text-sm text-green-600 mt-2">{unconsentedState.result}</p>
              )}
              {unconsentedState.error && (
                <p className="text-sm text-red-600 mt-2">{unconsentedState.error}</p>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm">{fetchError ? 'Unavailable' : 'Loading…'}</p>
          )}
        </div>

        {/* Retention policy card */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Retention Policy</h2>
          <p className="text-sm text-gray-600 mb-4">
            Respondents who gave GDPR consent but whose record is older than{' '}
            <strong>{data?.retention.cutoffDays ?? 730} days</strong> (2 years).
          </p>
          {data ? (
            <>
              <p className="text-3xl font-bold text-gray-900 mb-4">
                {data.retention.count}{' '}
                <span className="text-sm font-normal text-gray-600">record{data.retention.count !== 1 ? 's' : ''}</span>
              </p>
              <button
                onClick={() => handleDelete('retention', data.retention.count)}
                disabled={retentionState.loading || data.retention.count === 0}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {retentionState.loading ? 'Deleting…' : `Delete ${data.retention.count} record${data.retention.count !== 1 ? 's' : ''}`}
              </button>
              {retentionState.result && (
                <p className="text-sm text-green-600 mt-2">{retentionState.result}</p>
              )}
              {retentionState.error && (
                <p className="text-sm text-red-600 mt-2">{retentionState.error}</p>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm">{fetchError ? 'Unavailable' : 'Loading…'}</p>
          )}
        </div>
      </div>

      {/* Individual deletion note */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-2">Delete Individual Respondents</h2>
        <p className="text-sm text-gray-600">
          To delete a specific respondent, use the{' '}
          <Link href="/admin/respondents" className="text-brand-accent hover:underline font-medium">
            Respondents page
          </Link>{' '}
          to find and delete individual records using the delete button on each row.
        </p>
      </div>
    </div>
  )
}
