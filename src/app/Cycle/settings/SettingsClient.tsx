'use client'

// FILE: src/app/Cycle/settings/SettingsClient.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SettingsClient({
  email, lastPeriodStart, typicalLength, reminderTime,
}: {
  email: string
  lastPeriodStart: string
  typicalLength: number
  reminderTime: string
}) {
  const router = useRouter()
  const [period, setPeriod]     = useState(lastPeriodStart)
  const [length, setLength]     = useState(typicalLength)
  const [reminder, setReminder] = useState(reminderTime)
  const [saving, setSaving]     = useState(false)
  const [savedAt, setSavedAt]   = useState<number | null>(null)

  async function save() {
    setSaving(true)
    try {
      await fetch('/api/cycle/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          last_period_start: period,
          typical_length: length,
          reminder_time: reminder,
        }),
      })
      setSavedAt(Date.now())
    } finally {
      setSaving(false)
    }
  }

  function exportData(format: 'json' | 'csv') {
    window.location.href = `/api/cycle/export?format=${format}`
  }

  async function deleteEverything() {
    const confirmed = window.confirm(
      'Weet je het zeker? Al je gegevens worden permanent verwijderd. Dit kan niet ongedaan worden gemaakt.',
    )
    if (!confirmed) return
    const res = await fetch('/api/cycle/delete', { method: 'DELETE' })
    if (res.ok) router.push('/Cycle/login')
  }

  async function logout() {
    await fetch('/api/cycle/logout', { method: 'POST' })
    router.push('/Cycle/login')
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="cycle-display text-3xl">Instellingen</h1>
        <Link href="/Cycle/output" className="text-sm underline" style={{ color: 'var(--cycle-muted)' }}>
          Terug
        </Link>
      </header>

      <div className="cycle-card p-5 mb-4">
        <p className="text-sm mb-3" style={{ color: 'var(--cycle-muted)' }}>Ingelogd als</p>
        <p className="text-base">{email}</p>
      </div>

      <div className="cycle-card p-5 mb-4">
        <h2 className="cycle-display text-2xl mb-4">Cyclus</h2>
        <label className="block text-sm mb-2 font-medium">Laatste menstruatie</label>
        <input type="date" className="cycle-input mb-4" value={period} onChange={e => setPeriod(e.target.value)} />
        <label className="block text-sm mb-2 font-medium">
          Gemiddelde cycluslengte: <span className="cycle-display text-lg ml-1">{length}</span> dagen
        </label>
        <input type="range" min={21} max={45} step={1} value={length} onChange={e => setLength(Number(e.target.value))} className="cycle-slider" />
      </div>

      <div className="cycle-card p-5 mb-4">
        <h2 className="cycle-display text-2xl mb-4">Herinnering</h2>
        <label className="block text-sm mb-2 font-medium">Tijd voor de dagelijkse e-mail</label>
        <input type="time" className="cycle-input" value={reminder} onChange={e => setReminder(e.target.value)} />
      </div>

      <button className="cycle-button mb-6" onClick={save} disabled={saving}>
        {saving ? 'Opslaan…' : 'Opslaan'}
      </button>
      {savedAt && (
        <p className="text-sm mb-6" style={{ color: 'var(--cycle-muted)' }}>Opgeslagen.</p>
      )}

      <div className="cycle-card p-5 mb-4">
        <h2 className="cycle-display text-2xl mb-4">Mijn gegevens</h2>
        <div className="flex gap-3 mb-4">
          <button className="cycle-button cycle-button-ghost flex-1" onClick={() => exportData('json')}>
            Exporteer JSON
          </button>
          <button className="cycle-button cycle-button-ghost flex-1" onClick={() => exportData('csv')}>
            Exporteer CSV
          </button>
        </div>
        <button
          type="button"
          onClick={deleteEverything}
          className="cycle-button"
          style={{ background: 'transparent', color: 'var(--cycle-accent)', border: '1px solid var(--cycle-accent)' }}
        >
          Verwijder alles
        </button>
      </div>

      <button onClick={logout} className="cycle-button cycle-button-ghost mt-2">
        Uitloggen
      </button>

      <p className="text-xs text-center mt-8" style={{ color: 'var(--cycle-muted)' }}>
        Persoonlijke tool — geen medisch advies.
      </p>
    </main>
  )
}
