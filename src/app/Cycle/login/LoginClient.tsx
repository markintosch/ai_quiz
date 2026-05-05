'use client'

// FILE: src/app/Cycle/login/LoginClient.tsx
// Magic-link entry. Posts the email to /api/cycle/login which checks the
// allowlist and triggers Supabase Auth's email OTP flow.

import { useState } from 'react'

export default function LoginClient() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    try {
      const res = await fetch('/api/cycle/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      // Always show "sent" on 200 to avoid email enumeration. The actual
      // allowlist check on the server returns 200 either way.
      if (res.ok) setStatus('sent')
      else {
        setStatus('error')
        setErrorMsg('Er ging iets mis. Probeer het zo opnieuw.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Geen verbinding. Probeer het zo opnieuw.')
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm cycle-card p-7">
        <h1 className="cycle-display text-3xl mb-1">Cycle Companion</h1>
        <p className="text-sm mb-7" style={{ color: 'var(--cycle-muted)' }}>
          Voer je e-mailadres in. Je ontvangt een link om in te loggen.
        </p>

        {status === 'sent' ? (
          <div>
            <p className="mb-4">📨 Check je inbox.</p>
            <p className="text-sm" style={{ color: 'var(--cycle-muted)' }}>
              Geen mail? Wacht een minuut en probeer opnieuw.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              inputMode="email"
              className="cycle-input mb-4"
              placeholder="jouw@email.nl"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={status === 'sending'}
            />
            <button
              type="submit"
              className="cycle-button w-full"
              disabled={status === 'sending' || !email}
            >
              {status === 'sending' ? 'Bezig…' : 'Stuur link'}
            </button>
            {errorMsg && (
              <p className="text-sm mt-3" style={{ color: 'var(--cycle-accent)' }}>
                {errorMsg}
              </p>
            )}
          </form>
        )}
      </div>
      <p className="text-xs mt-6" style={{ color: 'var(--cycle-muted)' }}>
        Persoonlijke tool — geen medisch advies.
      </p>
    </main>
  )
}
