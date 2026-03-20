'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  companies: Array<{ id: string; name: string }>
}

export function NewCohortForm({ companies }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? '')
  const [accessCode, setAccessCode] = useState('')
  const [waveLabel, setWaveLabel] = useState('Baseline')
  const [waveDate, setWaveDate] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !companyId) return
    setSaving(true)
    setError(null)

    const res = await fetch('/api/admin/cohorts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        organisation: organisation.trim() || null,
        company_id: companyId,
        access_code: accessCode.trim() || null,
        wave_label: waveLabel.trim() || 'Baseline',
        wave_date: waveDate || null,
      }),
    })

    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Failed to create cohort')
      setSaving(false)
      return
    }

    router.push(`/admin/cohorts/${json.data.id}`)
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cohort name *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Leadership Team Q1 2026"
          required
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Organisation</label>
        <input
          type="text"
          value={organisation}
          onChange={e => setOrganisation(e.target.value)}
          placeholder="e.g. Acme Corp (display name for client view)"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
        <select
          value={companyId}
          onChange={e => setCompanyId(e.target.value)}
          required
          className={inputCls}
        >
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Access code</label>
        <input
          type="text"
          value={accessCode}
          onChange={e => setAccessCode(e.target.value)}
          placeholder="Optional — shown as a gate on the company quiz page"
          className={inputCls}
        />
        <p className="text-xs text-gray-400 mt-1">Respondents must enter this code to take the quiz. Leave blank for open access.</p>
      </div>

      <hr className="border-gray-100" />
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Wave 0 — Baseline</p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Wave label</label>
        <input
          type="text"
          value={waveLabel}
          onChange={e => setWaveLabel(e.target.value)}
          placeholder="Baseline"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Wave date</label>
        <input
          type="date"
          value={waveDate}
          onChange={e => setWaveDate(e.target.value)}
          className={inputCls}
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 bg-brand-accent text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Creating…' : 'Create cohort'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/cohorts')}
          className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
