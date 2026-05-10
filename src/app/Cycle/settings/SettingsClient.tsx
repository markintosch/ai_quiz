'use client'

// FILE: src/app/Cycle/settings/SettingsClient.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { importAppleHealthFile, type ImportSummary } from '@/lib/cycle/apple-health'

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

  // ── Apple Health import state ─────────────────────────────────────────
  const [importStatus, setImportStatus] = useState<'idle' | 'parsing' | 'uploading' | 'done' | 'error'>('idle')
  const [importMsg, setImportMsg]       = useState<string>('')
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null)
  const [importResult, setImportResult] = useState<{ inserted: number; updated: number; skipped: number } | null>(null)

  async function handleHealthImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportStatus('parsing')
    setImportMsg(`Bestand ${file.name} wordt geparsed in je browser…`)
    setImportSummary(null)
    setImportResult(null)
    try {
      const { days, summary } = await importAppleHealthFile(file)
      setImportSummary(summary)
      if (days.length === 0) {
        setImportStatus('error')
        setImportMsg('Geen bruikbare data gevonden in dit bestand.')
        return
      }
      setImportStatus('uploading')
      setImportMsg(`${days.length} dagen gevonden — versturen naar server…`)

      // Send in batches of 500 to keep request size manageable
      let totalInserted = 0, totalUpdated = 0, totalSkipped = 0
      for (let i = 0; i < days.length; i += 500) {
        const batch = days.slice(i, i + 500)
        const res = await fetch('/api/cycle/import/healthkit', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ days: batch }),
        })
        const json = await res.json()
        if (!res.ok || !json.ok) {
          throw new Error(json.error ?? `Server error (${res.status})`)
        }
        totalInserted += json.inserted ?? 0
        totalUpdated  += json.updated ?? 0
        totalSkipped  += json.skipped ?? 0
      }
      setImportResult({ inserted: totalInserted, updated: totalUpdated, skipped: totalSkipped })
      setImportStatus('done')
      setImportMsg('Klaar.')
    } catch (err) {
      setImportStatus('error')
      setImportMsg(err instanceof Error ? err.message : 'Onverwachte fout.')
    } finally {
      // Reset the input so the same file can be re-selected
      e.target.value = ''
    }
  }

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
        <h2 className="cycle-display text-2xl mb-1">Importeer Apple Health</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--cycle-muted)' }}>
          Backfill je slaap, workouts en menstruatie uit je iPhone-historie. Eenmalige actie.
        </p>

        <ol className="text-sm mb-4" style={{ color: 'var(--cycle-fg)', paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Open <strong>Health</strong>-app op je iPhone → tap je foto rechtsboven</li>
          <li>Scroll naar onderen → <strong>"Alle gezondheidsgegevens exporteren"</strong></li>
          <li>Bewaar het .zip-bestand (Bestanden, iCloud, of mail naar jezelf)</li>
          <li>Selecteer het hieronder</li>
        </ol>

        <label className="cycle-button cycle-button-ghost w-full text-center cursor-pointer" style={{ display: 'block' }}>
          {importStatus === 'idle' && 'Kies .zip of .xml bestand'}
          {importStatus === 'parsing' && 'Lezen…'}
          {importStatus === 'uploading' && 'Versturen…'}
          {importStatus === 'done' && 'Klaar — kies een ander bestand'}
          {importStatus === 'error' && 'Probeer opnieuw'}
          <input
            type="file"
            accept=".zip,.xml"
            onChange={handleHealthImport}
            disabled={importStatus === 'parsing' || importStatus === 'uploading'}
            style={{ display: 'none' }}
          />
        </label>

        {importMsg && (
          <p className="text-sm mt-3" style={{
            color: importStatus === 'error' ? 'var(--cycle-accent)' : 'var(--cycle-muted)',
          }}>
            {importMsg}
          </p>
        )}

        {importSummary && (
          <div className="text-sm mt-3" style={{ color: 'var(--cycle-fg)' }}>
            Gevonden: <strong>{importSummary.daysWithSleep}</strong> dagen slaap · <strong>{importSummary.daysWithPeriod}</strong> menstruatie-dagen · <strong>{importSummary.daysWithActivity}</strong> dagen workout
            {importSummary.oldestDate && (
              <> · <span style={{ color: 'var(--cycle-muted)' }}>vanaf {importSummary.oldestDate}</span></>
            )}
          </div>
        )}

        {importResult && (
          <div className="text-sm mt-2" style={{ color: 'var(--cycle-fg)' }}>
            <strong>{importResult.inserted}</strong> nieuwe dagen toegevoegd, <strong>{importResult.updated}</strong> aangevuld, <strong>{importResult.skipped}</strong> overgeslagen (al ingevuld).
          </div>
        )}

        <p className="text-xs mt-4" style={{ color: 'var(--cycle-muted)', lineHeight: 1.5 }}>
          Je raw Apple Health-bestand wordt <strong>in je browser</strong> geparsed. Alleen dagelijkse samenvattingen (slaap-score, workout-type, menstruatie ja/nee) gaan naar de server. Niets anders.
        </p>
      </div>

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
