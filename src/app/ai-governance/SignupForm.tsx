'use client'

import { useState } from 'react'

export default function SignupForm({ roleOptions, successMessage }: { roleOptions: string[]; successMessage: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending'); setError(null)
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    try {
      const res = await fetch('/api/ai-governance/signup', {
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
    return <div className="aig-form aig-form-done">{successMessage}</div>
  }

  return (
    <form className="aig-form" onSubmit={onSubmit}>
      <div className="aig-frow">
        <label>Voornaam *<input name="first_name" required /></label>
        <label>Achternaam *<input name="last_name" required /></label>
      </div>
      <div className="aig-frow">
        <label>E-mail *<input name="email" type="email" required /></label>
        <label>Organisatie<input name="organisation" /></label>
      </div>
      <div className="aig-frow">
        <label>Jouw rol
          <select name="role" defaultValue="">
            <option value="" disabled>Kies…</option>
            {roleOptions.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <label>Aantal medewerkers
          <select name="company_size" defaultValue="">
            <option value="" disabled>Kies…</option>
            <option>1–50</option>
            <option>50–250</option>
            <option>250–1000</option>
            <option>1000+</option>
          </select>
        </label>
      </div>
      <label className="aig-full">Wat is je grootste vraag rond AI-governance?
        <textarea name="question" rows={3} placeholder="Bijv. hoe begrens ik ChatGPT-gebruik zonder de business te frustreren?" />
      </label>
      <label className="aig-check"><input type="checkbox" name="consent" required /> Ik ga akkoord met het privacybeleid en dat HCSS/Brand PWRD Media contact opneemt over deze middag.</label>
      <div className="aig-formfoot">
        <button type="submit" className="aig-btn aig-btn-primary" disabled={status === 'sending'}>
          {status === 'sending' ? 'Versturen…' : 'Schrijf me voorlopig in'}
        </button>
        {status === 'error' && <span className="aig-form-err">Er ging iets mis: {error}</span>}
      </div>
    </form>
  )
}
