'use client'

// FILE: src/app/Cycle/login/LoginClient.tsx
// Password gate. POSTs to /api/cycle/login which validates and returns a
// Supabase action_link; the browser follows it to establish a session.

import { useState } from 'react'

export default function LoginClient() {
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    try {
      const res = await fetch('/api/cycle/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const json = await res.json().catch(() => ({})) as { ok?: boolean; action_link?: string; error?: string }
      if (!res.ok || !json.ok || !json.action_link) {
        setStatus('error')
        setErrorMsg(json.error === 'rate' ? 'Te veel pogingen — wacht even.' : 'Wachtwoord klopt niet.')
        return
      }
      window.location.href = json.action_link
    } catch {
      setStatus('error')
      setErrorMsg('Geen verbinding. Probeer opnieuw.')
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm cycle-card p-7">
        <h1 className="cycle-display text-3xl mb-1">Cycle Companion</h1>
        <p className="text-sm mb-7" style={{ color: 'var(--cycle-muted)' }}>
          Voer het wachtwoord in om in te loggen.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            className="cycle-input mb-4"
            placeholder="Wachtwoord"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={status === 'sending'}
          />
          <button
            type="submit"
            className="cycle-button w-full"
            disabled={status === 'sending' || !password}
          >
            {status === 'sending' ? 'Bezig…' : 'Inloggen'}
          </button>
          {errorMsg && (
            <p className="text-sm mt-3" style={{ color: 'var(--cycle-accent)' }}>
              {errorMsg}
            </p>
          )}
        </form>
      </div>
      <p className="text-xs mt-6" style={{ color: 'var(--cycle-muted)' }}>
        Persoonlijke tool — geen medisch advies.
      </p>
    </main>
  )
}
