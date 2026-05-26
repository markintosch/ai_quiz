'use client'

// FILE: src/app/Cycle/login/LoginClient.tsx
// Passwordless login. Email input → submit → magic link via Supabase Auth.
//
// Supabase may return tokens via PKCE query (?code=...) on the callback URL
// OR via implicit flow hash (#access_token=...) when it falls back to the
// project's Site URL. We handle both: the query route is the auth callback
// route file; the hash route is detected here on mount.

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginClient() {
  const [email, setEmail]       = useState('')
  const [status, setStatus]     = useState<'idle' | 'sending' | 'sent' | 'error' | 'completing'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [nextPath, setNextPath] = useState<string>('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const search = new URLSearchParams(window.location.search)
    const n = search.get('next') ?? ''
    if (n.startsWith('/Cycle')) setNextPath(n)

    // Pre-fill email if provided in URL (e.g. from compass results CTA)
    const emailHint = search.get('email')
    if (emailHint && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailHint)) {
      setEmail(emailHint.toLowerCase())
    }

    // Implicit-flow hash handling
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash || !hash.includes('access_token=')) return
    const params = new URLSearchParams(hash)
    const accessToken  = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    if (!accessToken || !refreshToken) return

    setStatus('completing')
    window.history.replaceState({}, '', '/Cycle/login')
    const supabase = createClient()
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          setStatus('error')
          setErrorMsg(`Sessie zetten mislukt: ${error.message}`)
          return
        }
        window.location.href = n.startsWith('/Cycle') ? n : '/Cycle'
      })
      .catch(err => {
        setStatus('error')
        setErrorMsg(`Sessie zetten mislukt: ${String(err)}`)
      })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    try {
      const res = await fetch('/api/cycle/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, next: nextPath }),
      })
      const json = await res.json().catch(() => ({})) as {
        ok?: boolean; sent?: boolean; error?: string
      }
      if (!res.ok || !json.ok) {
        setStatus('error')
        if (json.error === 'invalid_email') setErrorMsg('Vul een geldig e-mailadres in.')
        else if (json.error === 'rate')    setErrorMsg('Te veel pogingen — wacht even.')
        else                                setErrorMsg('Onbekende fout. Probeer opnieuw.')
        return
      }
      setStatus('sent')
    } catch {
      setStatus('error')
      setErrorMsg('Geen verbinding. Probeer opnieuw.')
    }
  }

  if (status === 'completing') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm cycle-card p-7 text-center">
          <p className="cycle-display text-3xl mb-2">Sessie zetten…</p>
          <p className="text-sm" style={{ color: 'var(--cycle-muted)' }}>Een seconde.</p>
        </div>
      </main>
    )
  }

  if (status === 'sent') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm cycle-card p-7 text-center">
          <p className="cycle-display text-3xl mb-3">Check je inbox</p>
          <p className="text-sm mb-2" style={{ color: 'var(--cycle-fg)' }}>
            We hebben een inlog-link gestuurd naar <strong>{email}</strong>.
          </p>
          <p className="text-xs" style={{ color: 'var(--cycle-muted)' }}>
            Klik 'm aan om binnen te komen. Geen mail in je inbox? Check Promoties of Spam.
          </p>
        </div>
        <p className="text-xs mt-6" style={{ color: 'var(--cycle-muted)' }}>
          Persoonlijke tool — geen medisch advies.
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm cycle-card p-7">
        <h1 className="cycle-display text-3xl mb-1">Welkom terug</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--cycle-muted)' }}>
          Vul je e-mailadres in. We sturen je een inlog-link.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            required
            autoFocus
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="jij@voorbeeld.nl"
            className="cycle-input mb-4"
            disabled={status === 'sending'}
          />
          <button
            type="submit"
            className="cycle-button w-full"
            disabled={status === 'sending' || !email}
          >
            {status === 'sending' ? 'Versturen…' : 'Stuur me een inlog-link'}
          </button>
          {errorMsg && (
            <p className="text-sm mt-3" style={{ color: 'var(--cycle-accent)' }}>
              {errorMsg}
            </p>
          )}
        </form>

        <p className="text-xs mt-6" style={{ color: 'var(--cycle-muted)', lineHeight: 1.5 }}>
          Nog geen account? Doe eerst de <a href="/peri-compass" style={{ color: 'var(--cycle-accent)', textDecoration: 'underline' }}>Peri-Compass</a> — daar krijg je een persoonlijk startpunt en een 30-dagen experiment.
        </p>
      </div>
      <p className="text-xs mt-6" style={{ color: 'var(--cycle-muted)' }}>
        Persoonlijke tool — geen medisch advies.
      </p>
    </main>
  )
}
