// FILE: src/app/sannah/admin/login/LoginClient.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginClient() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [state, setState]       = useState<'idle' | 'submitting' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'submitting') return
    setState('submitting')
    setErrorMsg('')
    try {
      const r = await fetch('/api/sannah/auth', {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({ password }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) {
        setErrorMsg(j.error ?? `Inloggen mislukt (${r.status})`)
        setState('error')
        return
      }
      router.push('/sannah/admin')
      router.refresh()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Onbekende fout.')
      setState('error')
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <form
        onSubmit={onSubmit}
        style={{
          width: '100%',
          maxWidth: 380,
          padding: 32,
          background: 'var(--sannah-bg)',
          border: '1px solid var(--sannah-border)',
          borderRadius: 12,
        }}
      >
        <h1 style={{
          fontSize: 22,
          fontWeight: 600,
          color: 'var(--sannah-text)',
          marginBottom: 6,
        }}>
          Sannah — beheer
        </h1>
        <p style={{
          fontSize: 13,
          color: 'var(--sannah-text-muted)',
          marginBottom: 20,
          lineHeight: 1.5,
        }}>
          Vul je wachtwoord in om werken en pagina&apos;s te beheren.
        </p>

        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--sannah-text-muted)',
            marginBottom: 6,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            Wachtwoord
          </span>
          <input
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 15,
              border: '1px solid var(--sannah-border)',
              borderRadius: 6,
              background: 'var(--sannah-bg)',
              color: 'var(--sannah-text)',
              outline: 'none',
            }}
          />
        </label>

        <button
          type="submit"
          disabled={state === 'submitting' || !password}
          style={{
            width: '100%',
            padding: '11px 16px',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--sannah-bg)',
            background: 'var(--sannah-text)',
            border: 0,
            borderRadius: 6,
            cursor: state === 'submitting' || !password ? 'not-allowed' : 'pointer',
            opacity: state === 'submitting' || !password ? 0.6 : 1,
          }}
        >
          {state === 'submitting' ? 'Bezig…' : 'Log in'}
        </button>

        {state === 'error' && (
          <p style={{
            marginTop: 14,
            fontSize: 13,
            color: '#c64a4a',
          }}>
            {errorMsg}
          </p>
        )}

        <p style={{
          marginTop: 20,
          fontSize: 11,
          color: 'var(--sannah-text-faded)',
          lineHeight: 1.5,
        }}>
          Geen wachtwoord? Vraag Mark of stuur een mail naar{' '}
          <a href="mailto:mark@brandpwrdmedia.com" style={{ color: 'var(--sannah-text-muted)' }}>
            mark@brandpwrdmedia.com
          </a>.
        </p>
      </form>
    </main>
  )
}
