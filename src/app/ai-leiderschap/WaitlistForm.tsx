'use client'

import { useState } from 'react'

export default function WaitlistForm({ successMessage }: { successMessage: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending'); setError(null)
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    try {
      const res = await fetch('/api/ai-leiderschap/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      setStatus('sent'); form.reset()
    } catch (err) {
      setStatus('error'); setError(err instanceof Error ? err.message : 'Onbekende fout')
    }
  }

  if (status === 'sent') {
    return <div className="ail-form ail-form-done">{successMessage}</div>
  }

  return (
    <form className="ail-form" onSubmit={onSubmit}>
      <div className="ail-frow">
        <label>Naam *<input name="name" required /></label>
        <label>E-mail *<input name="email" type="email" required /></label>
      </div>
      <div className="ail-frow">
        <label>Organisatie<input name="organisation" /></label>
        <label>Rol<input name="role" placeholder="bijv. CEO, CMO, CDO" /></label>
      </div>
      <label className="ail-full">Voorkeur dagdeel (optioneel)
        <select name="preference" defaultValue="">
          <option value="">Geen voorkeur</option>
          <option value="ochtend">Ochtend (09:00–13:00)</option>
          <option value="middag">Middag (13:30–17:30)</option>
          <option value="geen-voorkeur">Maakt niet uit</option>
        </select>
      </label>
      <label className="ail-check"><input type="checkbox" name="consent" required /> Ik wil op de hoogte gehouden worden van volgende edities.</label>
      <div className="ail-formfoot">
        <button type="submit" className="ail-btn ail-btn-primary" disabled={status === 'sending'}>
          {status === 'sending' ? 'Versturen…' : 'Zet me op de lijst'}
        </button>
        {status === 'error' && <span className="ail-form-err">Er ging iets mis: {error}</span>}
      </div>
    </form>
  )
}
