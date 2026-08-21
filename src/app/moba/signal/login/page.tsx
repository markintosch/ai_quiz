'use client'

// FILE: src/app/moba/signal/login/page.tsx
// Shared-password login for the Moba Signal dashboard.

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignalLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/moba-signal/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/moba/signal')
        router.refresh()
        return
      }
      const json = await res.json().catch(() => ({}))
      setError(json.error ?? `HTTP ${res.status}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
    setBusy(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-bold text-brand">Moba Signal</h1>
        <p className="text-xs text-gray-500 mt-1 mb-5">
          Internal competitive intelligence. Access for marketing and innovation.
        </p>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Team password"
          autoFocus
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 mb-3"
        />
        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="w-full text-sm font-semibold px-4 py-2.5 rounded-lg bg-brand text-white disabled:opacity-40"
        >
          {busy ? '…' : 'Open the dashboard'}
        </button>
      </form>
    </main>
  )
}
