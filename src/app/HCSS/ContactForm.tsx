'use client'

import { useState } from 'react'

export default function ContactForm({ successMessage }: { successMessage: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending'); setError(null)
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    try {
      const res = await fetch('/api/hcss/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      setStatus('sent')
      form.reset()
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Onbekende fout')
    }
  }

  if (status === 'sent') {
    return <div className="hcss-form hcss-form-done">{successMessage}</div>
  }

  return (
    <form className="hcss-form" onSubmit={onSubmit}>
      <div className="hcss-frow">
        <label>Naam *<input name="name" required /></label>
        <label>E-mail *<input name="email" type="email" required /></label>
      </div>
      <div className="hcss-frow">
        <label>Telefoon<input name="phone" /></label>
        <label>Organisatie<input name="organisation" /></label>
      </div>
      <div className="hcss-frow">
        <label>Aantal medewerkers
          <select name="company_size" defaultValue="">
            <option value="" disabled>Kies…</option>
            <option>1–10</option>
            <option>10–50</option>
            <option>50–250</option>
            <option>250+</option>
          </select>
        </label>
        <label>Hoe heb je HCSS gevonden?
          <select name="source" defaultValue="">
            <option value="" disabled>Kies…</option>
            <option>LinkedIn</option>
            <option>Aanbeveling</option>
            <option>Google</option>
            <option>Anders</option>
          </select>
        </label>
      </div>
      <label className="hcss-full">Waar kan HCSS bij helpen?
        <textarea name="message" rows={4} />
      </label>
      <div className="hcss-formfoot">
        <button type="submit" className="hcss-btn hcss-btn-primary" disabled={status === 'sending'}>
          {status === 'sending' ? 'Versturen…' : 'Verstuur bericht'}
        </button>
        {status === 'error' && <span className="hcss-form-err">Er ging iets mis: {error}</span>}
      </div>
    </form>
  )
}
