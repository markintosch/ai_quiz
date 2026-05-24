'use client'

// FILE: src/app/Cycle/login/LoginClient.tsx
// Password gate. POSTs to /api/cycle/login which validates and returns a
// Supabase action_link; the browser follows it to establish a session.
//
// Supabase may return tokens via PKCE query (?code=...) or implicit flow
// hash (#access_token=...). The query path is handled in /Cycle/auth/callback;
// the hash path is handled here on mount because hash fragments aren't sent
// to the server.

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginClient() {
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'error' | 'completing'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  // ?next=/Cycle/... preserved across login flow so compass→bridge redirects survive
  const [nextPath, setNextPath] = useState<string>('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Pick up ?next= from the current URL
    const search = new URLSearchParams(window.location.search)
    const n = search.get('next') ?? ''
    if (n.startsWith('/Cycle')) setNextPath(n)

    // Detect implicit-flow hash and complete sign-in
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
        // Honor next= when set, otherwise back to Cycle root
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
        body: JSON.stringify({ password, next: nextPath }),
      })
      const json = await res.json().catch(() => ({})) as {
        ok?: boolean; action_link?: string; error?: string; detail?: string
      }
      if (!res.ok || !json.ok || !json.action_link) {
        setStatus('error')
        if (json.error === 'rate')        setErrorMsg('Te veel pogingen — wacht even.')
        else if (json.error === 'config') setErrorMsg('Server-config ontbreekt (CYCLE_PASSWORD of CYCLE_DEFAULT_EMAIL).')
        else if (json.error === 'auth')   setErrorMsg(`Login mislukt: ${json.detail ?? 'onbekende fout'}.`)
        else if (json.error === 'create_user') setErrorMsg(`User aanmaken mislukt: ${json.detail ?? 'onbekende fout'}.`)
        else if (res.status === 401)      setErrorMsg('Wachtwoord klopt niet.')
        else                              setErrorMsg('Onbekende fout. Probeer opnieuw.')
        return
      }
      window.location.href = json.action_link
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
